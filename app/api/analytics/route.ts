import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";
import { createHmac } from "node:crypto";
import { cleanEventMetadata, readJsonObject, RequestBodyError, safePath, safeReferrer } from "@/lib/request-validation";

export const runtime = "nodejs";

const allowedEvents = new Set([
  "page_view", "hero_primary_cta", "hero_secondary_cta", "work_view", "work_contact_click",
  "service_contact_click", "ai_audit_click", "whatsapp_click", "email_click", "form_start",
  "form_submit", "form_success", "form_error", "web_vital",
]);

function clean(value: unknown, limit: number) {
  return typeof value === "string" ? value.trim().slice(0, limit) : "";
}

export async function POST(request: Request) {
  if (process.env.NEXT_PUBLIC_ANALYTICS_ENABLED !== "true") return new NextResponse(null, { status: 204 });
  try {
    const origin = request.headers.get("origin");
    if (!origin && process.env.NODE_ENV === "production") return new NextResponse(null, { status: 403 });
    if (origin) {
      const expected = new URL(process.env.NEXT_PUBLIC_SITE_URL || "https://zqtion.com").origin;
      const local = origin.startsWith("http://localhost:") || origin.startsWith("http://127.0.0.1:");
      if (origin !== expected && !(process.env.NODE_ENV !== "production" && local)) {
        return new NextResponse(null, { status: 403 });
      }
    }

    const body = await readJsonObject(request, 10_000);
    const event = clean(body.event, 80);
    if (!allowedEvents.has(event)) return new NextResponse(null, { status: 400 });

    const attribution = body.attribution && typeof body.attribution === "object"
      ? body.attribution as Record<string, unknown>
      : {};
    const url = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
    const key = process.env.SUPABASE_SECRET_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (!url || !key) return new NextResponse(null, { status: 204 });

    const client = createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } });
    const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
    const digest = createHmac("sha256", process.env.RATE_LIMIT_SECRET || key).update(`analytics:${ip}`).digest("hex");
    const limit = await client.rpc("consume_website_inquiry_rate_limit", {
      p_key_hash: digest, p_window_seconds: 60, p_max_attempts: 120,
    });
    if (limit.error || limit.data !== true) return new NextResponse(null, { status: 204 });
    await client.from("website_events").insert({
      event_name: event,
      path: safePath(body.path),
      session_id: clean(body.sessionId, 80) || null,
      landing_path: safePath(attribution.landingPath),
      referrer: safeReferrer(attribution.referrer) || null,
      utm_source: clean(attribution.utmSource, 120) || null,
      utm_medium: clean(attribution.utmMedium, 120) || null,
      utm_campaign: clean(attribution.utmCampaign, 160) || null,
      utm_content: clean(attribution.utmContent, 160) || null,
      metadata: cleanEventMetadata(body.metadata),
    });
    return new NextResponse(null, { status: 204 });
  } catch (error) {
    if (error instanceof RequestBodyError) return new NextResponse(null, { status: error.status });
    // Analytics must never interrupt navigation or conversion.
    return new NextResponse(null, { status: 204 });
  }
}
