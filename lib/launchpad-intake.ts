import { readJsonObject, RequestBodyError } from "./request-validation";
import { validateApplication, type LaunchpadApplication } from "./launchpad-validation";

export type IntakeDependencies = {
  enabled: boolean;
  origins: string[];
  tracks: string[];
  rateLimit: (ip: string) => Promise<boolean>;
  verify: (token: string, ip: string) => Promise<boolean>;
  save: (application: LaunchpadApplication) => Promise<string>;
  notify: (reference: string, track: string) => Promise<void>;
};
const json = (body: unknown, status = 200) => Response.json(body, { status, headers: { "Cache-Control": "no-store" } });

export async function handleLaunchpadApplication(request: Request, deps: IntakeDependencies): Promise<Response> {
  // Closed intake never parses or forwards personal data to external services.
  if (!deps.enabled) return json({ error: "Applications are not open yet. No application has been sent." }, 503);
  const origin = request.headers.get("origin");
  if (!origin || !deps.origins.includes(origin)) return json({ error: "Please apply from the Zqtion website." }, 403);
  if (request.headers.get("content-type")?.split(";")[0].trim() !== "application/json") return json({ error: "Please submit the application form as JSON." }, 415);
  try {
    const body = await readJsonObject(request, 32_000);
    if (typeof body.fax_number === "string" && body.fax_number.trim()) return json({ ok: true });
    const parsed = validateApplication(body, deps.tracks);
    if (!parsed.valid) return json({ error: "Please review the highlighted application fields.", fields: parsed.errors }, 400);
    const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
    if (!await deps.rateLimit(ip)) return json({ error: "Too many attempts. Please wait ten minutes before trying again." }, 429);
    const token = typeof body["cf-turnstile-response"] === "string" ? body["cf-turnstile-response"].slice(0, 2048) : "";
    if (!await deps.verify(token, ip)) return json({ error: "Human verification failed or expired. Please verify again." }, 400);
    const reference = await deps.save(parsed.application);
    // A stored application is accepted even if an internal notification is unavailable.
    await deps.notify(reference, parsed.application.primaryTrack).catch(() => undefined);
    return json({ ok: true, reference });
  } catch (error) {
    if (error instanceof RequestBodyError) return json({ error: error.status === 413 ? "The application is too large." : "Please send a valid application." }, error.status);
    return json({ error: "Application delivery is temporarily unavailable. Keep your answers and try again. Submission has not been confirmed." }, 503);
  }
}
