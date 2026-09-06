import { createHash, createHmac } from "node:crypto";
import { createClient } from "@supabase/supabase-js";
import { careerTracks } from "@/data/careers";
import { handleLaunchpadApplication } from "@/lib/launchpad-intake";
import type { LaunchpadApplication } from "@/lib/launchpad-validation";

export const runtime = "nodejs";

function database() {
  const url = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SECRET_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key || !process.env.RATE_LIMIT_SECRET) throw new Error("Application storage unavailable");
  return createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false }, global: {
    fetch: (input, init) => fetch(input, { ...init, signal: AbortSignal.timeout(8000) }),
  } });
}

async function rateLimit(ip: string) {
  const secret = process.env.RATE_LIMIT_SECRET;
  if (!secret) throw new Error("Application protection unavailable");
  const digest = createHmac("sha256", secret).update(`launchpad:${ip}`).digest("hex");
  const { data, error } = await database().rpc("consume_website_inquiry_rate_limit", { p_key_hash: digest, p_window_seconds: 600, p_max_attempts: 5 });
  if (error) throw new Error("Application protection unavailable");
  return data === true;
}

async function verify(token: string, ip: string) {
  const secret = process.env.TURNSTILE_SECRET_KEY;
  if (!secret) throw new Error("Verification unavailable");
  if (!token) return false;
  const form = new URLSearchParams({ secret, response: token });
  if (ip !== "unknown") form.set("remoteip", ip);
  const response = await fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify", { method: "POST", body: form, cache: "no-store", signal: AbortSignal.timeout(8000) });
  if (!response.ok) return false;
  const result = await response.json() as { success?: boolean; action?: string; hostname?: string };
  const hosts = process.env.NODE_ENV === "production" ? ["zqtion.com", "www.zqtion.com"] : ["zqtion.com", "www.zqtion.com", "localhost", "127.0.0.1"];
  return result.success === true && result.action === "launchpad" && hosts.includes(result.hostname || "");
}

async function save(application: LaunchpadApplication) {
  const { submissionId, ...answers } = application;
  const fingerprint = createHash("sha256").update(JSON.stringify(answers)).digest("hex");
  const client = database();
  const { error } = await client.from("launchpad_applications").insert({
    id: submissionId, email: answers.email, primary_track: answers.primaryTrack,
    answers, terms_version: "launchpad-12w-v1", request_fingerprint: fingerprint,
  });
  if (error?.code === "23505") {
    const existing = await client.from("launchpad_applications").select("request_fingerprint").eq("id", submissionId).single();
    if (!existing.error && existing.data?.request_fingerprint === fingerprint) return submissionId;
  }
  if (error) throw new Error("Application storage failed");
  return submissionId;
}

async function notify(reference: string, track: string) {
  const apiKey = process.env.RESEND_API_KEY;
  const to = process.env.APPLICATION_TO_EMAIL;
  const from = process.env.INQUIRY_FROM_EMAIL;
  if (!apiKey || !to || !from) return;
  // Keep the applicant's private answers out of email and logs.
  const response = await fetch("https://api.resend.com/emails", { method: "POST", cache: "no-store", signal: AbortSignal.timeout(5000), headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" }, body: JSON.stringify({ from, to: [to], subject: "New Zqtion Launchpad application", text: `An application is stored for authorized review.\nReference: ${reference}\nTrack: ${track}\nReview in the private Supabase application table. Do not forward applicant information.` }) });
  if (!response.ok) throw new Error("Notification unavailable");
}

export async function POST(request: Request) {
  const origins = ["https://zqtion.com", "https://www.zqtion.com"];
  if (process.env.NODE_ENV !== "production") {
    const url = new URL(request.url);
    if (["localhost", "127.0.0.1"].includes(url.hostname)) origins.push(url.origin);
  }
  return handleLaunchpadApplication(request, { enabled: process.env.LAUNCHPAD_APPLICATIONS_ENABLED === "true", origins, tracks: careerTracks.map(({ slug }) => slug), rateLimit, verify, save, notify });
}
