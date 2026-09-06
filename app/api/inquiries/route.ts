import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";
import { createHmac } from "node:crypto";
import { readJsonObject, RequestBodyError, safePath, safeReferrer } from "@/lib/request-validation";

export const runtime = "nodejs";

type Inquiry = {
  name: string;
  email: string;
  company: string;
  service: string;
  details: string;
  budget: string;
  projectUrl: string;
  honeypot: string;
  turnstileToken: string;
  landingPath: string;
  referrer: string;
  utmSource: string;
  utmMedium: string;
  utmCampaign: string;
  utmContent: string;
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
    projectUrl: clean(body.projectUrl, 500),
    honeypot: clean(body.fax_number, 200),
    turnstileToken: clean(body["cf-turnstile-response"], 2048),
    landingPath: safePath(body.landingPath),
    referrer: safeReferrer(body.referrer),
    utmSource: clean(body.utmSource, 120),
    utmMedium: clean(body.utmMedium, 120),
    utmCampaign: clean(body.utmCampaign, 160),
    utmContent: clean(body.utmContent, 160),
  };
}

function escapeHtml(value: string) {
  return value.replace(/[&<>'"]/g, (character) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", "'": "&#39;", '"': "&quot;" })[character] || character);
}

function memoryRateLimited(key: string) {
  const now = Date.now();
  const current = attempts.get(key);
  if (!current || current.resetAt < now) {
    attempts.set(key, { count: 1, resetAt: now + 10 * 60 * 1000 });
    return false;
  }
  current.count += 1;
  return current.count > 5;
}

async function checkRateLimit(ip: string) {
  const url = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SECRET_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) {
    if (process.env.NODE_ENV === "production") return { configured: false, allowed: false };
    return { configured: false, allowed: !memoryRateLimited(ip) };
  }

  const digest = createHmac("sha256", process.env.RATE_LIMIT_SECRET || key).update(ip).digest("hex");
  const client = createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false }, global: { fetch: (input, init) => fetch(input, { ...init, signal: AbortSignal.timeout(8000) }) } });
  const { data, error } = await client.rpc("consume_website_inquiry_rate_limit", {
    p_key_hash: digest,
    p_window_seconds: 600,
    p_max_attempts: 5,
  });
  if (error) return { configured: true, allowed: false, error: true };
  return { configured: true, allowed: data === true };
}

async function verifyTurnstile(token: string, ip: string) {
  const secret = process.env.TURNSTILE_SECRET_KEY;
  if (!secret) return { configured: process.env.NODE_ENV !== "production", valid: process.env.NODE_ENV !== "production" };
  if (!token) return { configured: true, valid: false };

  const form = new URLSearchParams({ secret, response: token });
  if (ip !== "unknown") form.set("remoteip", ip);
  const response = await fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify", { method: "POST", body: form, cache: "no-store", signal: AbortSignal.timeout(8000) });
  if (!response.ok) return { configured: true, valid: false };
  const result = (await response.json()) as { success?: boolean; action?: string; hostname?: string };
  const hosts = process.env.NODE_ENV === "production" ? ["zqtion.com", "www.zqtion.com"] : ["zqtion.com", "www.zqtion.com", "localhost", "127.0.0.1"];
  return { configured: true, valid: result.success === true && result.action === "inquiry" && hosts.includes(result.hostname || "") };
}

async function saveToSupabase(inquiry: Inquiry, userAgent: string) {
  const url = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SECRET_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) return { configured: false, ok: false };

  const client = createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false }, global: { fetch: (input, init) => fetch(input, { ...init, signal: AbortSignal.timeout(8000) }) } });
  const { error } = await client.from("website_inquiries").insert({
    name: inquiry.name,
    email: inquiry.email,
    company: inquiry.company || null,
    service: inquiry.service,
    details: inquiry.details,
    budget: inquiry.budget || null,
    source: "zqtion.com",
    user_agent: userAgent.slice(0, 500) || null,
    project_url: inquiry.projectUrl || null,
    landing_path: inquiry.landingPath || null,
    referrer: inquiry.referrer || null,
    utm_source: inquiry.utmSource || null,
    utm_medium: inquiry.utmMedium || null,
    utm_campaign: inquiry.utmCampaign || null,
    utm_content: inquiry.utmContent || null,
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
      text: `Name: ${inquiry.name}\nEmail: ${inquiry.email}\nCompany: ${inquiry.company || "Not provided"}\nService: ${inquiry.service}\nBudget: ${inquiry.budget || "Not provided"}\nProject link: ${inquiry.projectUrl || "Not provided"}\nLanding page: ${inquiry.landingPath || "Unknown"}\nReferrer: ${inquiry.referrer || "Unknown"}\nCampaign: ${[inquiry.utmSource, inquiry.utmMedium, inquiry.utmCampaign, inquiry.utmContent].filter(Boolean).join(" / ") || "None"}\n\n${inquiry.details}`,
      html: `<h2>New Zqtion project brief</h2><p><strong>Name:</strong> ${escapeHtml(inquiry.name)}</p><p><strong>Email:</strong> ${escapeHtml(inquiry.email)}</p><p><strong>Company:</strong> ${escapeHtml(inquiry.company || "Not provided")}</p><p><strong>Service:</strong> ${escapeHtml(inquiry.service)}</p><p><strong>Budget:</strong> ${escapeHtml(inquiry.budget || "Not provided")}</p><p><strong>Project link:</strong> ${escapeHtml(inquiry.projectUrl || "Not provided")}</p><p><strong>Landing page:</strong> ${escapeHtml(inquiry.landingPath || "Unknown")}</p><p><strong>Referrer:</strong> ${escapeHtml(inquiry.referrer || "Unknown")}</p><p><strong>Campaign:</strong> ${escapeHtml([inquiry.utmSource, inquiry.utmMedium, inquiry.utmCampaign, inquiry.utmContent].filter(Boolean).join(" / ") || "None")}</p><hr><p>${escapeHtml(inquiry.details).replace(/\n/g, "<br>")}</p>`,
    }),
    cache: "no-store",
    signal: AbortSignal.timeout(8000),
  });
  return { configured: true, ok: response.ok };
}

export async function POST(request: Request) {
  try {
    const body = await readJsonObject(request, 20_000);
    const inquiry = parseInquiry(body);
    if (inquiry.honeypot) return NextResponse.json({ ok: true });

    const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
    const validEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(inquiry.email);
    if (inquiry.name.length < 2 || !validEmail || !inquiry.service || inquiry.details.length < 30) {
      return NextResponse.json({ error: "Please complete the required fields with a valid email and enough project context." }, { status: 400 });
    }

    if (inquiry.projectUrl) {
      try {
        const url = new URL(inquiry.projectUrl);
        if (!['http:', 'https:'].includes(url.protocol)) throw new Error("Unsupported URL");
      } catch {
        return NextResponse.json({ error: "Please enter a valid website or product link." }, { status: 400 });
      }
    }

    const limit = await checkRateLimit(ip);
    if (!limit.allowed) {
      const status = limit.configured && !limit.error ? 429 : 503;
      const error = status === 429 ? "Too many attempts. Please wait or use email." : "Online brief delivery is temporarily unavailable. Please use email or WhatsApp.";
      return NextResponse.json({ error }, { status });
    }

    const turnstile = await verifyTurnstile(inquiry.turnstileToken, ip);
    if (!turnstile.configured) {
      return NextResponse.json({ error: "Online brief delivery is temporarily unavailable. Please use email or WhatsApp." }, { status: 503 });
    }
    if (!turnstile.valid) {
      return NextResponse.json({ error: "Human verification failed. Please refresh and try again." }, { status: 400 });
    }

    const [databaseResult, emailResult] = await Promise.allSettled([
      saveToSupabase(inquiry, request.headers.get("user-agent") || ""),
      sendWithResend(inquiry),
    ]);
    const database = databaseResult.status === "fulfilled" ? databaseResult.value : { configured: true, ok: false };
    const email = emailResult.status === "fulfilled" ? emailResult.value : { configured: true, ok: false };
    const configured = database.configured || email.configured;
    const delivered = database.ok || email.ok;

    if (!configured) return NextResponse.json({ error: "Online brief delivery is not configured yet. Please email zqtioncontact@gmail.com or use WhatsApp." }, { status: 503 });
    if (!delivered) return NextResponse.json({ error: "The brief could not be delivered. Please use email or WhatsApp." }, { status: 502 });
    return NextResponse.json({ ok: true });
  } catch (error) {
    if (error instanceof RequestBodyError) {
      return NextResponse.json({ error: error.status === 413 ? "The brief is too large." : "Please send a valid project brief." }, { status: error.status });
    }
    return NextResponse.json({ error: "The brief could not be processed. Please use email or WhatsApp." }, { status: 500 });
  }
}
