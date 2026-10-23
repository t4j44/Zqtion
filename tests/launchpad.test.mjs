import assert from "node:assert/strict";
import test from "node:test";
import { moduleUrl } from "./helpers/typescript.mjs";

const careers = await import(await moduleUrl("data/careers.ts"));
const urlInputUrl = await moduleUrl("lib/url-input.ts");
const validationUrl = await moduleUrl("lib/launchpad-validation.ts", { "./url-input": urlInputUrl });
const validation = await import(validationUrl);
const requestUrl = await moduleUrl("lib/request-validation.ts");
const intakeUrl = await moduleUrl("lib/launchpad-intake.ts", { "./request-validation": requestUrl, "./launchpad-validation": validationUrl });
const { handleLaunchpadApplication } = await import(intakeUrl);
const { storyLayouts, storyPoint } = await import(await moduleUrl("lib/story-layout.ts"));
const originUrl = await moduleUrl("lib/launchpad-origin.ts");
const { resolveAllowedOriginsAndHosts } = await import(originUrl);
const tracks = careers.careerTracks.map(({ slug }) => slug);
const valid = () => ({
  fullName: "QA Applicant", email: "qa@example.test", phone: "+880 1000000000", location: "Dhaka, Bangladesh",
  studyLevel: validation.studyOptions[0], primaryTrack: tracks[0], secondaryTrack: "", institution: "",
  linkedin: "", portfolio: "", github: "", otherLinks: "",
  whyZqtion: "I want to practice creative work with structured feedback.",
  learningGoals: "I want to understand how to test and improve a visual concept.",
  priorExperiment: "I made a small storyboard for a personal learning project.",
  strongestSkill: "Curiosity", improveSkill: "Research", weeklyAvailability: validation.availabilityOptions[0],
  laptopAccess: validation.laptopOptions[0], toolsUsed: "None yet", startAvailability: "After exams",
  roleAnswer: "I would compare different lighting and check consistency across scenes.",
  submissionId: "ad4d9313-3816-459c-a7b7-dc9e3cabc550", ageConfirmed: true, acknowledgement: true, privacyConsent: true,
});
const request = (body, headers = {}) => new Request("https://zqtion.com/api/applications", { method: "POST", headers: { origin: "https://zqtion.com", "content-type": "application/json", ...headers }, body: typeof body === "string" ? body : JSON.stringify(body) });
function dependencies(overrides = {}) {
  const calls = [];
  return { calls, deps: { enabled: true, origins: ["https://zqtion.com"], tracks,
    rateLimit: async () => { calls.push("limit"); return true; },
    verify: async () => { calls.push("verify"); return true; },
    save: async (application) => { calls.push("save"); return application.submissionId; },
    notify: async () => { calls.push("notify"); }, ...overrides,
  } };
}

test("program resolves to 12 weeks, 14 unique tracks, four pods, capacity ceiling 42", () => {
  assert.equal(careers.launchpad.weeks, 12);
  assert.equal(tracks.length, 14);
  assert.equal(new Set(tracks).size, 14);
  assert.equal(new Set(careers.careerTracks.map(({ pod }) => pod)).size, 4);
  assert.equal(tracks.length * careers.launchpad.seatsPerTrack, 42);
  for (const track of careers.careerTracks) {
    for (const key of ["responsibilities", "learning", "requirements", "optional", "tools"]) assert.ok(track[key].length > 0, `${track.slug}: ${key}`);
    assert.ok(track.artifact.length > 30 && track.question.length > 30);
  }
});
test("all four story layouts use the same 13 pieces and interpolation remains finite", () => {
  assert.equal(storyLayouts.length, 4);
  for (const layout of storyLayouts) assert.equal(layout.length, 13);
  for (const progress of [-5, 0, .5, 1, 1.5, 2, 2.5, 3, 100, NaN]) {
    for (let i = 0; i < 13; i++) assert.ok(storyPoint(progress, i).every(Number.isFinite));
  }
  assert.deepEqual(storyPoint(-1, 0), storyLayouts[0][0]);
  assert.deepEqual(storyPoint(4, 0), storyLayouts[3][0]);
});
test("beginner application accepts optional empty links and does not retain unknown fields", () => {
  const result = validation.validateApplication({ ...valid(), email: "QA@EXAMPLE.TEST", secret: "not stored", "cf-turnstile-response": "not stored" }, tracks);
  assert.equal(result.valid, true);
  assert.equal(result.application.email, "qa@example.test");
  assert.equal(result.application.secret, undefined);
  assert.equal(result.application["cf-turnstile-response"], undefined);
});
test("age, unpaid terms and privacy acknowledgements require explicit booleans", () => {
  for (const key of ["ageConfirmed", "acknowledgement", "privacyConsent"]) {
    for (const value of [undefined, false, "true", "on", 1]) {
      assert.ok(validation.validateApplication({ ...valid(), [key]: value }, tracks).errors[key]);
    }
  }
});
test("track choices and selection fields are allowlisted", () => {
  for (const [key, value] of [["primaryTrack", "invented"], ["secondaryTrack", tracks[0]], ["secondaryTrack", "invented"], ["studyLevel", "invented"], ["weeklyAvailability", "invented"], ["laptopAccess", "invented"]]) {
    assert.ok(validation.validateApplication({ ...valid(), [key]: value }, tracks).errors[key]);
  }
});
test("invalid links, credential-bearing URLs, short answers and oversized values are rejected", () => {
  for (const key of ["linkedin", "portfolio", "github"]) for (const value of ["javascript:alert(1)", "https://user:password@example.test", "not a link"]) {
    assert.ok(validation.validateApplication({ ...valid(), [key]: value }, tracks).errors[key]);
  }
  assert.ok(validation.validateApplication({ ...valid(), whyZqtion: "x" }, tracks).errors.whyZqtion);
  assert.ok(validation.validateApplication({ ...valid(), whyZqtion: "x".repeat(1501) }, tracks).errors.whyZqtion);
  assert.ok(validation.validateApplication({ ...valid(), fullName: ["not a string"] }, tracks).errors.fullName);
  assert.ok(validation.validateApplication({ ...valid(), otherLinks: "https://example.test ".repeat(4) }, tracks).errors.otherLinks);
});
test("closed intake returns 503 without calling any external service", async () => {
  const { calls, deps } = dependencies({ enabled: false });
  const result = await handleLaunchpadApplication(request(valid()), deps);
  assert.equal(result.status, 503); assert.deepEqual(calls, []);
});
test("cross-origin and missing-origin applications never reach external services", async () => {
  for (const origin of ["https://other.example", ""]) {
    const { calls, deps } = dependencies();
    assert.equal((await handleLaunchpadApplication(request(valid(), { origin }), deps)).status, 403);
    assert.deepEqual(calls, []);
  }
});
test("malformed, oversized, invalid and non-JSON submissions stop before the limiter", async () => {
  for (const [body, headers, expected] of [["null", {}, 400], ["{broken", {}, 400], ["x".repeat(32001), {}, 413], [{}, {}, 400], [valid(), { "content-type": "text/plain" }, 415]]) {
    const { calls, deps } = dependencies();
    assert.equal((await handleLaunchpadApplication(request(body, headers), deps)).status, expected);
    assert.deepEqual(calls, []);
  }
});
test("honeypot causes no external writes", async () => {
  const { calls, deps } = dependencies();
  assert.equal((await handleLaunchpadApplication(request({ ...valid(), fax_number: "spam" }), deps)).status, 200);
  assert.deepEqual(calls, []);
});
test("rate limit rejection and verification failure prevent storage", async () => {
  const limited = dependencies({ rateLimit: async () => false });
  assert.equal((await handleLaunchpadApplication(request(valid()), limited.deps)).status, 429);
  assert.deepEqual(limited.calls, []);
  const failed = dependencies({ verify: async () => false });
  assert.equal((await handleLaunchpadApplication(request(valid()), failed.deps)).status, 400);
  assert.deepEqual(failed.calls, ["limit"]);
});
test("provider failures fail closed without internal details", async () => {
  for (const key of ["rateLimit", "verify", "save"]) {
    const { deps, calls } = dependencies({ [key]: async () => { throw new Error("PRIVATE_INTERNAL_DETAIL"); } });
    const response = await handleLaunchpadApplication(request(valid()), deps);
    assert.equal(response.status, 503);
    assert.ok(!(await response.text()).includes("PRIVATE_INTERNAL_DETAIL"));
    assert.ok(!calls.includes("notify"));
  }
});
test("successful storage returns only a receipt and notification errors do not lose it", async () => {
  for (const notifyFails of [false, true]) {
    const { deps } = dependencies(notifyFails ? { notify: async () => { throw new Error("notification failure"); } } : {});
    const response = await handleLaunchpadApplication(request(valid()), deps);
    assert.equal(response.status, 200);
    assert.deepEqual(await response.json(), { ok: true, reference: valid().submissionId });
    assert.equal(response.headers.get("cache-control"), "no-store");
  }
});

test("empty resume link is accepted and optional", () => {
  for (const emptyVal of ["", "   ", undefined]) {
    const result = validation.validateApplication({ ...valid(), resumeUrl: emptyVal }, tracks);
    assert.equal(result.valid, true);
    assert.equal(result.application.resumeUrl, "");
    assert.equal(result.errors.resumeUrl, undefined);
  }
});

test("valid Google Drive and Google Docs file links are accepted", () => {
  const validLinks = [
    "https://drive.google.com/file/d/1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms/view?usp=sharing",
    "https://drive.google.com/file/d/1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms/view",
    "https://drive.google.com/open?id=1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms",
    "https://drive.google.com/uc?id=1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms",
    "https://drive.google.com/drive/folders/1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms",
    "https://drive.google.com/drive/u/0/file/d/1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms/view",
    "https://docs.google.com/document/d/1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms/edit?usp=sharing",
    "https://docs.google.com/document/d/1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms/preview",
    "https://docs.google.com/presentation/d/1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms/edit",
    "https://docs.google.com/spreadsheets/d/1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms/edit",
    "https://docs.google.com/document/u/1/d/1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms/edit"
  ];
  for (const link of validLinks) {
    const result = validation.validateApplication({ ...valid(), resumeUrl: link }, tracks);
    assert.equal(result.valid, true, `Expected valid for: ${link}`);
    assert.equal(result.application.resumeUrl, link);
    assert.equal(result.errors.resumeUrl, undefined);
  }
});

test("invalid, non-Google, credential-bearing and deceptive resume links are rejected", () => {
  const invalidLinks = [
    "http://drive.google.com/file/d/1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms/view",
    "https://drive.google.com.evil.com/file/d/1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms/view",
    "https://evil.com/?url=https://drive.google.com/file/d/123",
    "https://user:password@drive.google.com/file/d/1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms/view",
    "https://drive.google.com:8443/file/d/1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms/view",
    "javascript:alert(1)",
    "data:text/html,<script>alert(1)</script>",
    "not-a-valid-url",
    "https://google.com/search?q=resume",
    "https://drive.google.com/",
    "https://drive.google.com/file/d/",
    "https://docs.google.com/document/d/",
    "https://docs.google.com/about"
  ];
  for (const link of invalidLinks) {
    const result = validation.validateApplication({ ...valid(), resumeUrl: link }, tracks);
    assert.equal(result.valid, false, `Expected invalid for: ${link}`);
    assert.ok(result.errors.resumeUrl, `Expected error for: ${link}`);
  }
});

test("optional resume link is stored correctly inside application answers", async () => {
  const testResume = "https://drive.google.com/file/d/1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms/view";
  let savedApplication = null;
  const { deps } = dependencies({
    save: async (app) => {
      savedApplication = app;
      return app.submissionId;
    }
  });
  const res = await handleLaunchpadApplication(request({ ...valid(), resumeUrl: testResume }), deps);
  assert.equal(res.status, 200);
  assert.ok(savedApplication);
  assert.equal(savedApplication.resumeUrl, testResume);
});

test("private answers and resume link are never leaked to notification callback", async () => {
  const testResume = "https://drive.google.com/file/d/1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms/view";
  let notificationArgs = null;
  const { deps } = dependencies({
    notify: async (...args) => {
      notificationArgs = args;
    }
  });
  const res = await handleLaunchpadApplication(request({
    ...valid(),
    resumeUrl: testResume,
    secretField: "SUPER_SECRET",
    whyZqtion: "I want to practice creative work with structured feedback."
  }), deps);
  assert.equal(res.status, 200);
  assert.ok(notificationArgs);
  // notify receives (reference, track, applicantEmail)
  assert.equal(notificationArgs[0], valid().submissionId);
  assert.equal(notificationArgs[1], tracks[0]);
  assert.equal(notificationArgs[2], "qa@example.test");
  // Ensure private answers and CV links are NOT passed in notification
  const stringifiedArgs = JSON.stringify(notificationArgs);
  assert.ok(!stringifiedArgs.includes(testResume));
  assert.ok(!stringifiedArgs.includes("SUPER_SECRET"));
  assert.ok(!stringifiedArgs.includes("I want to practice creative work"));
});

test("staging and preview origins: allowed staging origin is accepted, unauthorized is rejected", async () => {
  const allowedPreview = "https://zqtion-preview.vercel.app";
  const { deps } = dependencies({ origins: ["https://zqtion.com", allowedPreview] });

  // 1. Allowed preview origin succeeds
  const reqAllowed = new Request("https://zqtion.com/api/applications", {
    method: "POST",
    headers: { origin: allowedPreview, "content-type": "application/json" },
    body: JSON.stringify(valid())
  });
  const resAllowed = await handleLaunchpadApplication(reqAllowed, deps);
  assert.equal(resAllowed.status, 200);

  // 2. Arbitrary unauthorized origin is rejected with 403
  const reqDenied = new Request("https://zqtion.com/api/applications", {
    method: "POST",
    headers: { origin: "https://arbitrary-unauthorized.vercel.app", "content-type": "application/json" },
    body: JSON.stringify(valid())
  });
  const resDenied = await handleLaunchpadApplication(reqDenied, deps);
  assert.equal(resDenied.status, 403);
});

test("resolveAllowedOriginsAndHosts correctly configures preview hosts and rejects wildcards", () => {
  const origEnv = { ...process.env };
  try {
    delete process.env.LAUNCHPAD_PREVIEW_HOSTNAME;
    delete process.env.LAUNCHPAD_ALLOWED_STAGING_ORIGINS;

    // Default production origins
    const defaultRes = resolveAllowedOriginsAndHosts();
    assert.deepEqual(defaultRes.origins, ["https://zqtion.com", "https://www.zqtion.com"]);
    assert.deepEqual(defaultRes.hosts, ["zqtion.com", "www.zqtion.com"]);

    // With explicit preview hostname
    process.env.LAUNCHPAD_PREVIEW_HOSTNAME = "zqtion-preview-abc123.vercel.app";
    const previewRes = resolveAllowedOriginsAndHosts();
    assert.ok(previewRes.origins.includes("https://zqtion-preview-abc123.vercel.app"));
    assert.ok(previewRes.hosts.includes("zqtion-preview-abc123.vercel.app"));

    // Wildcards are strictly rejected
    process.env.LAUNCHPAD_PREVIEW_HOSTNAME = "*.vercel.app";
    const wildcardRes = resolveAllowedOriginsAndHosts();
    assert.ok(!wildcardRes.origins.some(o => o.includes("*")));
    assert.ok(!wildcardRes.hosts.some(h => h.includes("*")));

    // With explicit staging origins
    process.env.LAUNCHPAD_ALLOWED_STAGING_ORIGINS = "https://staging.zqtion.com, https://test.zqtion.com";
    const stagingRes = resolveAllowedOriginsAndHosts();
    assert.ok(stagingRes.origins.includes("https://staging.zqtion.com"));
    assert.ok(stagingRes.origins.includes("https://test.zqtion.com"));
    assert.ok(stagingRes.hosts.includes("staging.zqtion.com"));
    assert.ok(stagingRes.hosts.includes("test.zqtion.com"));
  } finally {
    process.env = origEnv;
  }
});

test("duplicate application submission returns existing reference idempotently", async () => {
  let saveCount = 0;
  const { deps } = dependencies({
    save: async (app) => {
      saveCount++;
      return app.submissionId;
    }
  });

  const payload = valid();
  const res1 = await handleLaunchpadApplication(request(payload), deps);
  assert.equal(res1.status, 200);
  assert.deepEqual(await res1.json(), { ok: true, reference: payload.submissionId });

  const res2 = await handleLaunchpadApplication(request(payload), deps);
  assert.equal(res2.status, 200);
  assert.deepEqual(await res2.json(), { ok: true, reference: payload.submissionId });
  assert.equal(saveCount, 2);
});

test("Launchpad accepts LinkedIn, portfolio, GitHub, CV and other links without protocol or www", () => {
  const data = {
    ...valid(),
    linkedin: "linkedin.com/in/a-builder",
    portfolio: "zqtion.com/work",
    github: "github.com/t4j44",
    resumeUrl: "drive.google.com/file/d/1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms/view",
    otherLinks: "example.org/project\nwww.example.net/article",
  };
  const result = validation.validateApplication(data, tracks);
  assert.equal(result.valid, true, JSON.stringify(result.errors));
  assert.equal(result.application.linkedin, "https://linkedin.com/in/a-builder");
  assert.equal(result.application.portfolio, "https://zqtion.com/work");
  assert.equal(result.application.github, "https://github.com/t4j44");
  assert.match(result.application.resumeUrl, /^https:\/\/drive\.google\.com/);
  assert.equal(result.application.otherLinks, "https://example.org/project\nhttps://www.example.net/article");
});
