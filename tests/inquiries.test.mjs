import assert from "node:assert/strict";
import { afterEach, beforeEach, test } from "node:test";
import { moduleUrl } from "./helpers/typescript.mjs";

const siteUrl = await moduleUrl("data/site.ts");
const templatesUrl = await moduleUrl("lib/email/templates.ts");
const templates = await import(templatesUrl);
const resendUrl = await moduleUrl("lib/email/resend.ts", {
  "server-only": "data:text/javascript,export{}", "@/data/site": siteUrl, "./templates": templatesUrl,
});
const { POST } = await import(await moduleUrl("app/api/inquiries/route.ts", {
  "@supabase/supabase-js": import.meta.resolve("@supabase/supabase-js"),
  "next/server": import.meta.resolve("next/server.js"),
  "@/lib/request-validation": await moduleUrl("lib/request-validation.ts"),
  "@/data/site": siteUrl, "@/lib/email/resend": resendUrl,
}));
const originalFetch = globalThis.fetch;
const originalInfo = console.info;
const originalError = console.error;
const envNames = ["NODE_ENV", "SUPABASE_URL", "SUPABASE_SECRET_KEY", "SUPABASE_SERVICE_ROLE_KEY", "NEXT_PUBLIC_SUPABASE_URL", "TURNSTILE_SECRET_KEY", "RESEND_API_KEY", "INQUIRY_FROM_EMAIL", "INQUIRY_TO_EMAIL", "RATE_LIMIT_SECRET"];
let envBefore, calls, logs, behavior;
const brief = () => ({
  name: "Sarah Ahmed", email: "Sarah@Example.test", company: "Example project", service: "AI automation or system",
  details: "We need a practical workflow to review requests and send useful follow-up messages.", budget: "$1,000–$3,000",
  projectUrl: "https://example.test/product", landingPath: "/services?private=secret", referrer: "https://example.test/path?private=secret",
  utmSource: "newsletter", utmMedium: "email", utmCampaign: "launch", utmContent: "cta", "cf-turnstile-response": "synthetic-token",
});
const request = (body = brief(), headers = {}) => new Request("https://www.zqtion.com/api/inquiries", {
  method: "POST", headers: { "content-type": "application/json", "x-forwarded-for": "192.0.2.1", "user-agent": "Synthetic test", ...headers },
  body: typeof body === "string" ? body : JSON.stringify(body),
});
const response = (data, status = 200) => new Response(JSON.stringify(data), { status, headers: { "content-type": "application/json" } });
beforeEach(() => {
  envBefore = Object.fromEntries(envNames.map((name) => [name, process.env[name]]));
  for (const name of envNames) delete process.env[name];
  Object.assign(process.env, { NODE_ENV: "production", SUPABASE_URL: "https://database.example.test", SUPABASE_SECRET_KEY: "synthetic-service-key", TURNSTILE_SECRET_KEY: "synthetic-turnstile-key", RESEND_API_KEY: "synthetic-resend-key", INQUIRY_FROM_EMAIL: "Zqtion <info@zqtion.com>", INQUIRY_TO_EMAIL: "info@zqtion.com" });
  calls = []; logs = []; behavior = {};
  console.info = console.error = (...args) => logs.push(args);
  // Every outgoing request is intercepted; unexpected URLs fail instead of reaching a provider.
  globalThis.fetch = async (input, init) => {
    const url = String(input);
    assert.ok(init.signal, "every provider request has a timeout");
    if (url.includes("/rpc/consume_website_inquiry_rate_limit")) {
      calls.push({ kind: "limit", body: JSON.parse(init.body) });
      if (behavior.limitThrows) throw new Error("private limiter error");
      return response(behavior.limit !== false);
    }
    if (url === "https://challenges.cloudflare.com/turnstile/v0/siteverify") {
      calls.push({ kind: "verify" });
      return response({ success: true, action: "inquiry", hostname: "www.zqtion.com", ...behavior.turnstile });
    }
    if (url === "https://database.example.test/rest/v1/website_inquiries") {
      calls.push({ kind: "save", body: JSON.parse(init.body) });
      if (behavior.saveThrows) throw new Error("private database error");
      return behavior.saveFails ? response({ message: "private database error" }, 500) : response(null, 201);
    }
    if (url === "https://api.resend.com/emails") {
      const body = JSON.parse(init.body);
      const kind = body.to[0] === "info@zqtion.com" ? "internal" : "confirmation";
      calls.push({ kind, body, headers: init.headers });
      if (behavior[kind] === "timeout") throw new DOMException("private provider timeout", "TimeoutError");
      if (behavior[kind] === "invalid") return response({ unexpected: true });
      if (typeof behavior[kind] === "number") return response({ message: "private provider error" }, behavior[kind]);
      return response({ id: `${kind}-provider-id` });
    }
    throw new Error(`Unexpected mocked URL: ${url}`);
  };
});
afterEach(() => {
  globalThis.fetch = originalFetch;
  console.info = originalInfo; console.error = originalError;
  for (const [name, value] of Object.entries(envBefore)) {
    if (value === undefined) delete process.env[name]; else process.env[name] = value;
  }
});

test("stores the full attributed inquiry before two correctly addressed emails", async () => {
  const result = await POST(request({ ...brief(), to: "attacker@example.test", from: "attacker@example.test", reply_to: "attacker@example.test" }));
  assert.equal(result.status, 200);
  assert.deepEqual(await result.json(), { ok: true, confirmation: "accepted" });
  assert.deepEqual(calls.map((call) => call.kind), ["limit", "verify", "save", "internal", "confirmation"]);
  const row = calls[2].body;
  assert.equal(row.email, "sarah@example.test");
  assert.equal(row.name, "Sarah Ahmed");
  assert.equal(row.company, brief().company); assert.equal(row.service, brief().service);
  assert.equal(row.details, brief().details); assert.equal(row.budget, brief().budget);
  assert.equal(row.source, "zqtion.com"); assert.equal(row.user_agent, "Synthetic test");
  assert.equal(row.project_url, brief().projectUrl);
  assert.equal(row.landing_path, "/services"); assert.equal(row.referrer, "https://example.test");
  for (const [column, field] of [["utm_source", "utmSource"], ["utm_medium", "utmMedium"], ["utm_campaign", "utmCampaign"], ["utm_content", "utmContent"]]) assert.equal(row[column], brief()[field]);
  assert.match(row.id, /^[0-9a-f-]{36}$/); assert.ok(Date.parse(row.created_at));
  assert.equal(row.to, undefined); assert.equal(row["cf-turnstile-response"], undefined);
  const internal = calls[3], customer = calls[4];
  assert.deepEqual(internal.body.to, ["info@zqtion.com"]); assert.equal(internal.body.reply_to, "sarah@example.test");
  assert.deepEqual(customer.body.to, ["sarah@example.test"]); assert.equal(customer.body.reply_to, "info@zqtion.com");
  assert.equal(internal.body.from, "Zqtion <info@zqtion.com>"); assert.equal(customer.body.from, internal.body.from);
  assert.equal(internal.headers["Idempotency-Key"], `inquiry/${row.id}/internal`);
  assert.equal(customer.headers["Idempotency-Key"], `inquiry/${row.id}/confirmation`);
  assert.match(internal.body.subject, /^New project brief — AI automation or system — Sarah Ahmed$/);
  assert.equal(customer.body.subject, "We received your project brief — Zqtion");
  assert.ok(internal.body.text.includes(row.id)); assert.ok(customer.body.text.includes("Thanks, Sarah."));
  assert.equal(calls[0].body.p_key_hash.length, 64);
  assert.ok(!JSON.stringify(logs).includes("sarah@example.test"));
  assert.ok(!JSON.stringify(logs).includes("synthetic-service-key"));
});

test("optional fields stay optional in storage and both templates", async () => {
  const body = brief();
  for (const field of ["company", "budget", "projectUrl", "landingPath", "referrer", "utmSource", "utmMedium", "utmCampaign", "utmContent"]) delete body[field];
  assert.equal((await POST(request(body))).status, 200);
  assert.equal(calls[2].body.company, null); assert.equal(calls[2].body.project_url, null);
  for (const mail of calls.filter((call) => call.body?.html)) {
    assert.match(mail.body.text, /Not provided/); assert.match(mail.body.html, /Prefer to discuss/);
    assert.ok(!mail.body.html.includes("undefined"));
  }
});

test("HTML escapes all visitor fields and reply URL cannot inject parameters", () => {
  const hostile = Object.fromEntries(Object.keys(brief()).map((key) => [key, `<img src=x onerror='alert(1)'>&\"`]));
  hostile.name = "<script>alert(1)</script> Person\nBcc: hidden";
  hostile.email = "sarah+tag&test@example.test";
  for (const mail of [templates.internalLeadNotification(hostile, "2026-09-19", "reference", "info@zqtion.com"), templates.customerConfirmation(hostile, "info@zqtion.com")]) {
    assert.ok(!mail.html.includes("<script>")); assert.ok(!mail.html.includes("<img"));
    assert.match(mail.html, /&lt;/); assert.match(mail.html, /&amp;/);
    assert.match(mail.html, /role="presentation"/); assert.match(mail.html, /max-width:600px/);
    assert.ok(!/[\r\n]/.test(mail.subject));
  }
  const internal = templates.internalLeadNotification(hostile, "time", "id", "info@zqtion.com");
  assert.ok(internal.html.includes("mailto:sarah%2Btag%26test%40example.test"));
  assert.ok(internal.text.includes(hostile.details), "plain text preserves submitted context");
  assert.match(templates.customerConfirmation({ ...hostile, name: "" }, "info@zqtion.com").text, /^Thanks\. Your brief/);
});

for (const failure of ["saveFails", "saveThrows"]) test(`${failure}: no email or success without confirmed storage`, async () => {
  behavior[failure] = true;
  const result = await POST(request());
  assert.equal(result.status, 503);
  assert.ok(!calls.some((call) => call.kind === "internal" || call.kind === "confirmation"));
  const body = await result.json(); assert.match(body.error, /info@zqtion.com/); assert.ok(!JSON.stringify(body).includes("private"));
});

for (const [internal, confirmation, expected] of [[200, 429, "unavailable"], [422, 200, "accepted"], [503, 503, "unavailable"], ["timeout", "timeout", "unavailable"], [200, "invalid", "unavailable"]]) {
  test(`email partial failure (${internal}/${confirmation}) preserves acceptance and logs both outcomes`, async () => {
    if (internal !== 200) behavior.internal = internal;
    if (confirmation !== 200) behavior.confirmation = confirmation;
    const result = await POST(request());
    assert.deepEqual(await result.json(), { ok: true, confirmation: expected });
    assert.equal(calls.filter((call) => call.kind === "save").length, 1);
    assert.ok(calls.some((call) => call.kind === "internal")); assert.ok(calls.some((call) => call.kind === "confirmation"));
    const log = logs.find(([event]) => event === "inquiry_email_attention"); assert.ok(log);
    assert.ok(log[1].internal.status); assert.ok(log[1].confirmation.status);
    assert.ok(!JSON.stringify(logs).includes("private"));
  });
}

test("missing Resend config keeps saved lead and reports email unavailable", async () => {
  delete process.env.RESEND_API_KEY;
  const result = await POST(request()); assert.deepEqual(await result.json(), { ok: true, confirmation: "unavailable" });
  assert.deepEqual(calls.map((call) => call.kind), ["limit", "verify", "save"]);
  assert.equal(logs.find(([event]) => event === "inquiry_email_attention")[1].internal.status, "unconfigured");
});

test("honeypot acknowledges without storage or email", async () => {
  assert.equal((await POST(request({ ...brief(), fax_number: "spam" }))).status, 200); assert.deepEqual(calls, []);
});
test("invalid input, mail lists, header injection and unsafe URLs are rejected before providers", async () => {
  for (const change of [{ name: "A" }, { email: "bad" }, { email: "a@example.test,b@example.test" }, { email: "a@example.test\r\nBcc:b@example.test" }, { email: "a@example.test?bcc=b" }, { service: "" }, { details: "short" }, { projectUrl: "javascript:alert(1)" }]) {
    assert.equal((await POST(request({ ...brief(), ...change }))).status, 400);
  }
  assert.deepEqual(calls, []);
});
test("invalid JSON and streamed oversize bodies are rejected before providers", async () => {
  for (const body of ["null", "[]", "{broken"]) assert.equal((await POST(request(body))).status, 400);
  assert.equal((await POST(request({ ...brief(), details: "a".repeat(21000) }))).status, 413);
  assert.deepEqual(calls, []);
});
test("rate limiting prevents both saving and email", async () => {
  behavior.limit = false; assert.equal((await POST(request())).status, 429); assert.deepEqual(calls.map((call) => call.kind), ["limit"]);
});
test("production limiter outages fail closed", async () => {
  behavior.limitThrows = true; assert.equal((await POST(request())).status, 503);
  delete process.env.SUPABASE_SECRET_KEY; calls = [];
  assert.equal((await POST(request())).status, 503); assert.deepEqual(calls, []);
});
test("Turnstile token, success, hostname and action are required", async () => {
  for (const result of [{ success: false }, { action: "launchpad" }, { hostname: "attacker.example" }]) {
    behavior.turnstile = result; assert.equal((await POST(request())).status, 400);
  }
  assert.equal((await POST(request({ ...brief(), "cf-turnstile-response": "" }))).status, 400);
  delete process.env.TURNSTILE_SECRET_KEY; assert.equal((await POST(request())).status, 503);
  assert.ok(!calls.some((call) => call.kind === "save"));
});
test("server defaults route to company; invalid server recipient never becomes a recipient list", async () => {
  delete process.env.INQUIRY_FROM_EMAIL; delete process.env.INQUIRY_TO_EMAIL;
  assert.equal((await POST(request())).status, 200);
  assert.equal(calls.find((call) => call.kind === "internal").body.from, "Zqtion <info@zqtion.com>");
  process.env.INQUIRY_TO_EMAIL = "a@example.test,b@example.test"; calls = [];
  assert.deepEqual(await (await POST(request())).json(), { ok: true, confirmation: "accepted" });
  assert.ok(!calls.some((call) => call.kind === "internal"));
});
