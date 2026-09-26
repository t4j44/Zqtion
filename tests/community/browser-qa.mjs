// Run against the local QA backend and a production build configured for that fixture.
import { createRequire } from "node:module";
import { mkdir, writeFile } from "node:fs/promises";
import assert from "node:assert/strict";
const require = createRequire(import.meta.url);
const { chromium } = require(process.env.COMMUNITY_PLAYWRIGHT_PATH || "C:/Users/hp/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright");
const sharp = require("sharp");
const base = "http://localhost:3219";
const fixture = await (await fetch("http://127.0.0.1:4319/__fixtures")).json();
const browser = await chromium.launch({ headless: true });
// The fixture URL is HTTP/localhost, outside production CSP's Supabase HTTPS allowlist.
// This bypass is for isolated transport simulation, not a production-CSP signoff.
const context = await browser.newContext({ bypassCSP: true, viewport: { width: 1440, height: 1000 } });
const page = await context.newPage(); const failures = []; const passed = []; const consoleErrors = [];
let publishedTipPath = "";
page.on("pageerror", e => consoleErrors.push(e.message));
const check = async (name, fn) => { try { await fn(); passed.push(name); console.log(`PASS ${name}`); } catch (error) { failures.push({ name, error: error.message }); console.log(`FAIL ${name}: ${error.message}`); } };
const go = async path => { await page.goto(base + path, { waitUntil: "networkidle" }); };
const previewPublish = async (scope = page) => {
  await scope.getByRole("button", { name: "Review before publishing", exact: true }).click();
  const preview = scope.getByRole("region", { name: "Publication preview" });
  await preview.waitFor();
  const continueButton = preview.getByRole("button", { name: "Continue with my post", exact: true });
  if (await continueButton.count()) await continueButton.click();
  await preview.getByRole("button", { name: "Publish", exact: true }).click();
  await page.getByRole("heading", { name: /^(Published|Saved for moderation)$/ }).waitFor();
};
await mkdir("artifacts/community", { recursive: true });
await check("Public SSR question, canonical, accepted answer and genuine QAPage", async () => {
  const response = await page.goto(`${base}/ai-experiences/${fixture.question.id}`); assert.equal(response.status(), 200);
  assert.match(await page.locator("h1").innerText(), /preserve product packaging/);
  assert.equal(await page.locator("link[rel=canonical]").getAttribute("href"), `https://zqtion.com/ai-experiences/${fixture.question.id}`);
  const schemas = await page.locator('script[type="application/ld+json"]').allTextContents();
  const qa = schemas.flatMap(s => JSON.parse(s)).find(s => s["@type"] === "QAPage"); assert.equal(qa.mainEntity.acceptedAnswer["@type"], "Answer");
  assert.ok(!(await page.content()).includes("alice@community.test"));
});
await check("Authenticated API refuses missing bearer token", async () => {
  const r = await fetch(`${base}/api/community/actions`, { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ action: "vote", data: { id: fixture.question.id, active: true } }) }); assert.equal(r.status, 401);
});
await check("Sign in and one-time onboarding return to original session action", async () => {
  await go("/community/account?next=" + encodeURIComponent("/share?session=qa-bootcamp"));
  await page.getByLabel("Email (private)").fill("new@community.test"); await page.getByLabel("Password", { exact: true }).fill("fixture-password-123");
  await page.getByRole("button", { name: "Sign in", exact: true }).last().click();
  await page.getByLabel("Display name").waitFor(); await page.getByLabel("Display name").fill("QA New Member");
  await page.getByLabel("Unique username").fill("qa_new_member"); await page.getByLabel("LinkedIn profile URL").fill("https://www.linkedin.com/in/qa-new-member");
  await page.getByLabel("Bio (optional)").fill("A local QA fixture profile, used to verify community participation without hosted writes.");
  await page.getByRole("checkbox").check(); await page.getByRole("button", { name: "Save profile and continue" }).click();
  await page.waitForURL("**/share?session=qa-bootcamp"); await page.getByText("@qa_new_member", { exact: true }).first().waitFor();
  assert.equal(await page.getByLabel("LinkedIn profile URL").count(), 0);
});
await check("Title guidance, preview preservation, publishing and session tagging", async () => {
  await page.getByRole("button", { name: "Share an AI Tip", exact: true }).click();
  await page.getByLabel("Title", { exact: true }).fill("Gemini labels");
  await page.getByLabel("Context / description").fill("LOCAL QA: keep a copy of the original image and inspect every printed label after changing the background.");
  assert.match(await page.locator("#cq-title-help").innerText(), /more specific/);
  await previewPublish(); await page.getByRole("link", { name: "View discussion", exact: true }).click();
  await page.getByRole("heading", { level: 1, name: "Gemini labels" }).waitFor();
  publishedTipPath = new URL(page.url()).pathname;
  assert.match(await page.locator("main").innerText(), /Session: qa-bootcamp/);
  assert.match(await page.locator('meta[name="robots"]').getAttribute("content"), /noindex/);
});
await check("Comment and answer use persistent identity; vote and save persist", async () => {
  await go(`/ai-experiences/${fixture.question.id}`);
  await page.getByRole("button", {name:"Write a comment…",exact:true}).click();
  const comment = page.locator(".cq-inline-composer").filter({has:page.getByLabel("Write a comment…",{exact:true})});
  await comment.getByLabel("Write a comment…",{exact:true}).fill("LOCAL QA comment: does this workflow preserve the small label text?");
  await comment.getByRole("button", {name:"Post Comment",exact:true}).click();
  await comment.getByLabel("Write a comment…",{exact:true}).waitFor({state:"detached"});
  await go(`/ai-experiences/${fixture.question.id}`);
  assert.match(await page.locator("main").innerText(), /LOCAL QA comment/);
  await page.getByRole("button", {name:"Write an answer",exact:true}).click();
  const answer = page.locator(".cq-inline-composer").filter({has:page.getByLabel("Your answer",{exact:true})});
  await answer.getByLabel("Your answer").fill("LOCAL QA answer: preserve the product pixels and edit only a separately masked background."); await answer.getByRole("button",{name:"Post Answer",exact:true}).click(); await answer.getByLabel("Your answer").waitFor({state:"detached"});
  await go(`/ai-experiences/${fixture.question.id}`);
  const root = page.locator("article.cq-panel").first(); await root.getByRole("button", { name: /Upvote/ }).click();
  await root.getByRole("button", { name: "Save", exact: true }).click();
  await go("/community/saved"); await page.getByRole("heading", { name: "How can I preserve product packaging in Gemini?" }).waitFor();
});
await check("Prompt rating and credited remix create a new prompt", async () => {
  await go(`/prompts/community/${fixture.prompt.id}`); await page.getByLabel("Your rating").selectOption("4");
  await page.getByRole("link", { name: "Remix ↗", exact: true }).click();
  await page.getByLabel("Title", { exact: true }).fill("A careful green-background packaging brief for Gemini");
  await page.getByLabel("Context / description").fill("LOCAL QA remix. This variant changes the studio backdrop to green while preserving the same packaging constraints. Compare the logo and all printed text with the supplied original photograph.");
  await page.getByLabel("Prompt text", { exact: true }).fill("Preserve the packaging and printed label exactly. Replace only the background with a plain green studio backdrop.");
  await previewPublish(); await page.getByRole("link", { name: "View discussion", exact: true }).click();
  await page.getByRole("heading", { level: 1, name: "A careful green-background packaging brief for Gemini" }).waitFor();
  assert.match(await page.locator("main").innerText(), /Remixed from/); assert.ok(!page.url().endsWith(fixture.prompt.id));
});
await check("Valid result upload is saved pending moderation; oversized image rejected client-side", async () => {
  await go(`/prompts/community/${fixture.prompt.id}`);
  await page.getByText("Share a result from this prompt", { exact: true }).click();
  const section = page.locator("details").filter({ has: page.getByText("Share a result from this prompt", { exact: true }) });
  await section.getByLabel("What did you try, and what happened?").fill("LOCAL QA result using a small generated test image. This is a fixture, not a real AI output.");
  await section.getByLabel("Image description").fill("Local QA cyan test image");
  await section.locator('input[type="file"]').setInputFiles({ name: "oversized.png", mimeType: "image/png", buffer: Buffer.alloc(1000001) });
  await section.getByRole("alert").filter({ hasText: "1 MB" }).waitFor();
  const buffer = await sharp({ create: { width: 100, height: 100, channels: 3, background: "#66cde6" } }).png().toBuffer();
  await section.locator('input[type="file"]').setInputFiles({ name: "../../unsafe-name.png", mimeType: "image/png", buffer });
  await section.getByRole("button", { name: "Remove image" }).waitFor();
  await previewPublish(section); await page.getByRole("heading", { name: "Saved for moderation", exact: true }).waitFor();
});
await check("Search and duplicate suggestions return existing discussions", async () => {
  await go("/ai-experiences?q=packaging"); assert.match(await page.locator("main").innerText(), /preserve product packaging/);
  const r = await fetch(`${base}/api/community/similar?title=${encodeURIComponent("How can I preserve product packaging in Gemini?")}`); const data = await r.json(); assert.ok(data.entries.some(e => e.id === fixture.question.id));
});
await check("Upload API rejects actual oversize, MIME spoofing and SVG before storage", async () => {
  const send = async (body, type) => fetch(`${base}/api/community/upload?purpose=result`, { method: "POST", headers: { Authorization: "Bearer fixture-new", "Content-Type": type, "X-Image-Alt": "Local%20security%20test" }, body });
  assert.equal((await send(Buffer.alloc(1000001), "image/png")).status, 413);
  assert.equal((await send(Buffer.from('<svg xmlns="http://www.w3.org/2000/svg"></svg>'), "image/png")).status, 415);
  assert.equal((await send(Buffer.from("<svg/>"), "image/svg+xml")).status, 415);
});
await check("Public profile shows identity and activity without email", async () => {
  await go("/u/qa_new_member"); assert.equal(await page.locator("h1").innerText(), "QA New Member"); assert.ok(!(await page.content()).includes("new@community.test"));
  assert.match(await page.locator('script[type="application/ld+json"]').last().textContent(), /ProfilePage/);
});
await check("Private pages are noindex and sitemap emits only eligible public roots", async () => {
  await go("/community/saved"); assert.match(await page.locator('meta[name="robots"]').getAttribute("content"), /noindex/);
  const xml = await (await fetch(`${base}/community/sitemaps/0`)).text(); assert.ok(xml.includes(fixture.question.id)); assert.ok(xml.includes(fixture.prompt.id)); assert.ok(!xml.includes("community/account"));
});
await check("Existing Prompt Library search, copy, customization and navigation survive", async () => {
  await go("/prompts"); assert.match(await page.locator("main").innerText(), /Zqtion Original/); assert.ok(await page.getByRole("link", { name: "Community ↗", exact: true }).count());
  await page.getByLabel("Search prompts, tools, styles").fill("nonexistent-qa-result"); await page.getByRole("heading", { name: "No prompts found." }).waitFor();
  await page.getByRole("button", { name: "Reset filters" }).click(); await page.locator(".pl-card").first().waitFor();
  await page.locator(".pl-filter-row select").first().selectOption("ui"); await page.waitForURL("**category=ui**");
  await go("/prompts/ui/fieldwork-research-dashboard"); assert.ok(await page.locator("h1").count()); assert.match(await page.locator("main").innerText(), /Fieldwork|research/i);
  await page.locator(".pl-variable-grid input").first().fill("Community QA product"); await page.getByRole("button", { name: /Customize prompt/ }).click(); assert.match(await page.locator(".pl-prompt-text").innerText(), /Community QA product/);
  await page.locator(".pl-prompt-workbench").getByRole("button", { name: "Copy prompt", exact: true }).click(); await page.locator(".pl-prompt-workbench").getByRole("button", { name: "Copied", exact: true }).waitFor();
  await page.locator(".pl-detail-aside").getByRole("button", { name: "Save", exact: true }).click(); await page.reload({ waitUntil: "networkidle" }); assert.equal(await page.locator(".pl-detail-aside").getByRole("button", { name: "Saved", exact: true }).getAttribute("aria-pressed"), "true");
  await go("/contact"); assert.equal((await page.locator("h1").count()), 1);
  await page.route("**/api/inquiries", route => route.fulfill({ status: 503, contentType: "application/json", body: JSON.stringify({ error: "Local QA: delivery unavailable." }) }));
  await page.locator('input[name="name"]').fill("Local QA"); await page.locator('input[name="email"]').fill("qa@example.test"); await page.locator('select[name="service"]').selectOption({ label: "Web product or MVP" }); await page.locator('textarea[name="details"]').fill("Local QA contact form failure verification without sending any email or creating a hosted inquiry.");
  await page.getByRole("button", { name: "Send project brief" }).click(); await page.locator("#form-status").filter({ hasText: /unavailable|verification/ }).waitFor();
  await page.unroute("**/api/inquiries");
});
await check("Reporting and manual moderation approve images before publishing results", async () => {
  assert.ok(publishedTipPath); await go(publishedTipPath);
  const report = page.locator("article.cq-panel").first(); await report.locator('summary[aria-label="More actions"]').click(); await report.getByRole("button", {name:"Report",exact:true}).click();
  await report.getByLabel("What should a moderator review?").fill("Local QA report to verify the private moderation workflow."); await report.getByRole("button", { name: "Submit report" }).click();
  await page.getByText("Report submitted privately to the moderation team.", { exact: true }).waitFor();
  await go("/community/account"); await page.getByRole("button", { name: "Sign out", exact: true }).click();
  await page.getByLabel("Email (private)").fill("reviewer@community.test"); await page.getByLabel("Password", { exact: true }).fill("fixture-password-123"); await page.getByRole("button", { name: "Sign in", exact: true }).last().click();
  await page.getByRole("link", { name: "Moderation", exact: true }).click();
  const imageItem = page.locator("article.cq-panel").filter({ hasText: "Local QA cyan test image" });
  await imageItem.getByLabel("Moderation reason").fill("Local generated test image inspected and approved."); await imageItem.getByRole("button", { name: "Approve", exact: true }).click(); await imageItem.waitFor({ state: "detached" });
  const resultItem = page.locator("article.cq-panel").filter({ hasText: "LOCAL QA result using a small generated test image." });
  await resultItem.getByLabel("Moderation reason").fill("Local result reviewed after its image approval."); await resultItem.getByRole("button", { name: "Approve", exact: true }).click(); await resultItem.waitFor({ state: "detached" });
  const reportedItem = page.locator("article.cq-panel").filter({ has: page.getByRole("heading", { name: "Gemini labels", exact: true }) });
  await reportedItem.getByLabel("Moderation reason").fill("QA report resolved after reading the contribution."); await reportedItem.getByRole("button", { name: "Approve", exact: true }).click();
  await go(`/prompts/community/${fixture.prompt.id}`); await page.getByText("LOCAL QA result using a small generated test image. This is a fixture, not a real AI output.", { exact: true }).waitFor();
  const image = page.getByRole("img", { name: "Local QA cyan test image", exact: true }); await image.waitFor(); assert.ok(await image.evaluate(img => img.complete && img.naturalWidth > 0));
});
await check("Responsive layouts have no horizontal overflow at required widths", async () => {
  for (const width of [320,360,375,390,393,400,412,430,768,1024,1280,1440,1920]) {
    await page.setViewportSize({ width, height: 1000 });
    for (const path of ["/ai-experiences", "/prompts/community", "/share", "/community/account", `/ai-experiences/${fixture.question.id}`, "/prompts"]) {
      await go(path); const sizes = await page.evaluate(() => ({ scroll: document.documentElement.scrollWidth, client: document.documentElement.clientWidth })); assert.ok(sizes.scroll <= sizes.client + 1, `${path} at ${width}: ${JSON.stringify(sizes)}`);
    }
  }
});
await check("Mobile menu keyboard close and reduced-motion rendering", async () => {
  await page.setViewportSize({ width: 390, height: 844 }); await page.emulateMedia({ reducedMotion: "reduce" }); await go("/ai-experiences");
  await page.getByRole("button", { name: "Open menu" }).click(); await page.keyboard.press("Escape"); assert.equal(await page.getByRole("button", { name: "Open menu" }).getAttribute("aria-expanded"), "false");
  await page.screenshot({ path: "artifacts/community/mobile.png", fullPage: true });
  await page.setViewportSize({ width: 1440, height: 1000 }); await go("/ai-experiences"); await page.screenshot({ path: "artifacts/community/desktop.png", fullPage: true });
});
const report = { fixture: "Local PGlite SQL/RLS + simulated Supabase Auth/Storage transport. No live email or hosted Storage certification. CSP bypass used for HTTP fixture URL only.", passed, failures, consoleErrors };
await writeFile("artifacts/community/browser-qa.json", JSON.stringify(report, null, 2));
await browser.close(); console.log(JSON.stringify(report, null, 2)); if (failures.length || consoleErrors.length) process.exitCode = 1;
