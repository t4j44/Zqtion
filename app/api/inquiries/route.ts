import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";

export const runtime = "nodejs";

type Inquiry = {
  name: string;
  email: string;
  company: string;
  service: string;
  details: string;
  budget: string;
  website: string;
  turnstileToken: string;
};

const attempts = new Map<string, { count: number; resetAt: number }>();

function clean(value: unknown, limit: number) {
  return typeof value === "string" ? value.trim().slice(0, limit) : "";
}

function parseInquiry(body: Record<string, unknown>): Inquiry {
  return {
    name: clean(body.name, 80),
    email: clean(body.email, 160).toLowerCase(),
    company: clean(body.company, 120),
    service: clean(body.service, 120),
    details: clean(body.details, 4000),
    budget: clean(body.budget, 80),
    website: clean(body.website, 200),
    turnstileToken: clean(body["cf-turnstile-response"], 2048),
  };
}

function escapeHtml(value: string) {
  return value.replace(/[&<>'"]/g, (character) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", "'": "&#39;", '"': "&quot;" })[character] || character);
}

function rateLimited(key: string) {
  const now = Date.now();
  const current = attempts.get(key);
  if (!current || current.resetAt < now) {
    attempts.set(key, { count: 1, resetAt: now + 10 * 60 * 1000 });
    return false;
  }
  current.count += 1;
  return current.count > 5;
}

async function verifyTurnstile(token: string, ip: string) {
  const secret = process.env.TURNSTILE_SECRET_KEY;
  if (!secret) return true;
  if (!token) return false;

  const form = new URLSearchParams({ secret, response: token });
  if (ip !== "unknown") form.set("remoteip", ip);
  const response = await fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify", { method: "POST", body: form, cache: "no-store" });
  if (!response.ok) return false;
  const result = (await response.json()) as { success?: boolean };
  return result.success === true;
}

async function saveToSupabase(inquiry: Inquiry, userAgent: string) {
  const url = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SECRET_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) return { configured: false, ok: false };

  const client = createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } });
  const { error } = await client.from("website_inquiries").insert({
    name: inquiry.name,
    email: inquiry.email,
    company: inquiry.company || null,
    service: inquiry.service,
    details: inquiry.details,
    budget: inquiry.budget || null,
    source: "zqtion.com",
    user_agent: userAgent.slice(0, 500) || null,
  });
  return { configured: true, ok: !error };
}

async function sendWithResend(inquiry: Inquiry) {
  const apiKey = process.env.RESEND_API_KEY;
  const to = process.env.INQUIRY_TO_EMAIL;
  const from = process.env.INQUIRY_FROM_EMAIL;
  if (!apiKey || !to || !from) return { configured: false, ok: false };

  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      from,
      to: [to],
      reply_to: inquiry.email,
      subject: `New Zqtion brief: ${inquiry.service} — ${inquiry.name}`,
      text: `Name: ${inquiry.name}\nEmail: ${inquiry.email}\nCompany: ${inquiry.company || "Not provided"}\nService: ${inquiry.service}\nBudget: ${inquiry.budget || "Not provided"}\n\n${inquiry.details}`,
      html: `<h2>New Zqtion project brief</h2><p><strong>Name:</strong> ${escapeHtml(inquiry.name)}</p><p><strong>Email:</strong> ${escapeHtml(inquiry.email)}</p><p><strong>Company:</strong> ${escapeHtml(inquiry.company || "Not provided")}</p><p><strong>Service:</strong> ${escapeHtml(inquiry.service)}</p><p><strong>Budget:</strong> ${escapeHtml(inquiry.budget || "Not provided")}</p><hr><p>${escapeHtml(inquiry.details).replace(/\n/g, "<br>")}</p>`,
    }),
    cache: "no-store",
  });
  return { configured: true, ok: response.ok };
}

export async function POST(request: Request) {
  try {
    const length = Number(request.headers.get("content-length") || 0);
    if (length > 20_000) return NextResponse.json({ error: "The brief is too large." }, { status: 413 });

    const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
    if (rateLimited(ip)) return NextResponse.json({ error: "Too many attempts. Please wait or use email." }, { status: 429 });

    const body = (await request.json()) as Record<string, unknown>;
    const inquiry = parseInquiry(body);
    if (inquiry.website) return NextResponse.json({ ok: true });

    const validEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(inquiry.email);
    if (inquiry.name.length < 2 || !validEmail || !inquiry.service || inquiry.details.length < 30) {
      return NextResponse.json({ error: "Please complete the required fields with a valid email and enough project context." }, { status: 400 });
    }

    if (!(await verifyTurnstile(inquiry.turnstileToken, ip))) {
      return NextResponse.json({ error: "Human verification failed. Please refresh and try again." }, { status: 400 });
    }

    const [database, email] = await Promise.all([
      saveToSupabase(inquiry, request.headers.get("user-agent") || ""),
      sendWithResend(inquiry),
    ]);
    const configured = database.configured || email.configured;
    const delivered = database.ok || email.ok;

    if (!configured) return NextResponse.json({ error: "Online brief delivery is not configured yet. Please email zqtioncontact@gmail.com or use WhatsApp." }, { status: 503 });
    if (!delivered) return NextResponse.json({ error: "The brief could not be delivered. Please use email or WhatsApp." }, { status: 502 });
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "The brief could not be processed. Please use email or WhatsApp." }, { status: 500 });
  }
}
