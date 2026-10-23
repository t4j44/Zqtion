import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";
import { createHmac, randomUUID } from "node:crypto";
import { readJsonObject, RequestBodyError, safePath, safeReferrer } from "@/lib/request-validation";
import { siteConfig } from "@/data/site";
import { isSingleMailbox, sendInquiryEmails } from "@/lib/email/resend";

export const runtime = "nodejs";
// Three sequential 8s checks (limiter, verification, storage), then two parallel 8s sends.
export const maxDuration = 60;
const unavailable = `Online brief delivery is temporarily unavailable. Please email ${siteConfig.email} or use WhatsApp.`;

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

async function saveToSupabase(inquiry: Inquiry, userAgent: string, inquiryId: string, submittedAt: string) {
  const url = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SECRET_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) return { configured: false, ok: false };

  const client = createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false }, global: { fetch: (input, init) => fetch(input, { ...init, signal: AbortSignal.timeout(8000) }) } });
  const { error } = await client.from("website_inquiries").insert({
    id: inquiryId,
    created_at: submittedAt,
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

export async function POST(request: Request) {
  const inquiryId = randomUUID();
  let saved = false;
  try {
    const body = await readJsonObject(request, 20_000);
    const inquiry = parseInquiry(body);
    if (inquiry.honeypot) return NextResponse.json({ ok: true });

    const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
    const validEmail = isSingleMailbox(inquiry.email);
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
      const error = status === 429 ? `Too many attempts. Please wait or email ${siteConfig.email}.` : unavailable;
      return NextResponse.json({ error }, { status });
    }

    const turnstile = await verifyTurnstile(inquiry.turnstileToken, ip);
    if (!turnstile.configured) {
      return NextResponse.json({ error: unavailable }, { status: 503 });
    }
    if (!turnstile.valid) {
      return NextResponse.json({ error: "Human verification failed. Please refresh and try again." }, { status: 400 });
    }

    const submittedAt = new Date().toISOString();
    const database = await saveToSupabase(inquiry, request.headers.get("user-agent") || "", inquiryId, submittedAt);
    if (!database.ok) {
      console.error("inquiry_storage_failed", { inquiryId, configured: database.configured });
      return NextResponse.json({ error: unavailable }, { status: 503 });
    }
    saved = true;
    console.info("inquiry_saved", { inquiryId });
    const delivery = await sendInquiryEmails(inquiry, submittedAt, inquiryId);
    if (delivery.internal.status === "accepted" && delivery.confirmation.status === "accepted") {
      console.info("inquiry_email_status", { inquiryId, ...delivery });
    } else {
      console.error("inquiry_email_attention", { inquiryId, ...delivery });
    }
    return NextResponse.json({ ok: true, confirmation: delivery.confirmation.status === "accepted" ? "accepted" : "unavailable" });
  } catch (error) {
    if (error instanceof RequestBodyError) {
      return NextResponse.json({ error: error.status === 413 ? "The brief is too large." : "Please send a valid project brief." }, { status: error.status });
    }
    console.error("inquiry_processing_failed", { inquiryId, saved });
    // Once stored, an unexpected secondary failure must not prompt a duplicate submission.
    if (saved) return NextResponse.json({ ok: true, confirmation: "unavailable" });
    return NextResponse.json({ error: unavailable }, { status: 503 });
  }
}
