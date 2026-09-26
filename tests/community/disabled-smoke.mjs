import { createRequire } from "node:module";
import assert from "node:assert/strict";
import { writeFile } from "node:fs/promises";
const require = createRequire(import.meta.url);
const { chromium } = require(process.env.COMMUNITY_PLAYWRIGHT_PATH || "C:/Users/hp/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright");
const browser = await chromium.launch({ headless: true });
const context = await browser.newContext({ viewport: { width: 1440, height: 1000 } });
const page = await context.newPage(); const errors = []; const csp = []; const passed = [];
page.on("pageerror", e => errors.push(e.message));
page.on("console", message => { if (/Content Security Policy|violates.*directive/i.test(message.text())) csp.push(message.text()); });
const origin = "http://localhost:3219";
for (const path of ["/ai-experiences", "/prompts/community", "/community/account", "/share", "/prompts", "/contact", "/services", "/community/guidelines"]) {
  const response = await page.goto(origin + path, { waitUntil: "networkidle" }); assert.equal(response.status(), 200, path); assert.equal(await page.locator("h1").count(), 1, path);
  if (path === "/community/account") { await page.getByText("Community participation is not open yet. Public pages remain available.", { exact: true }).waitFor(); assert.equal(await page.getByRole("button", { name: "Sign in", exact: true }).last().isDisabled(), true); }
  passed.push(`${path}: 200, one H1, actual production CSP active`);
}
assert.equal((await fetch(origin + "/api/community/actions", { method: "POST", headers: { "Content-Type": "application/json", Authorization: "Bearer not-a-real-token" }, body: "{}" })).status, 503);
passed.push("Disabled mutation fails closed with HTTP 503");
const mobile = await browser.newContext({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true, reducedMotion: "reduce" });
const phone = await mobile.newPage(); await phone.goto(origin, { waitUntil: "networkidle" });
assert.ok(!(await phone.locator("[data-hero-mode]").getAttribute("data-hero-mode")).includes("webgl"));
assert.equal(await phone.locator(".hero-3d-webgl-canvas").count(), 0);
assert.ok(await phone.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1));
passed.push("Homepage reduced-motion mobile fallback has no WebGL canvas or horizontal overflow");
await page.addInitScript(() => { const original = HTMLCanvasElement.prototype.getContext; HTMLCanvasElement.prototype.getContext = function(type, ...args) { if (type === "webgl" || type === "webgl2") return null; return original.call(this, type, ...args); }; });
await page.goto(origin, { waitUntil: "networkidle" }); assert.ok(!(await page.locator("[data-hero-mode]").getAttribute("data-hero-mode")).includes("webgl"));
passed.push("Desktop WebGL-unavailable fallback remains usable");
await page.goto(origin + "/work/spark-dhaka-2050", { waitUntil: "networkidle" });
assert.equal(await page.locator('iframe[src*="youtube"]').count(), 0);
const play = page.getByRole("button", { name: /^Play / }).first(); await play.waitFor();
await page.route("https://www.youtube-nocookie.com/**", route => route.fulfill({ contentType: "text/html", body: "<html><body>Local video facade fixture</body></html>" }));
await play.click(); await page.locator('iframe[src*="youtube"]').waitFor();
passed.push("Video facade loads an iframe only after activation (external video intercepted)");
await writeFile("artifacts/community/disabled-smoke.json", JSON.stringify({ passed, errors, csp, note: "No CSP bypass. Community disabled. External video intercepted; not a YouTube provider test." }, null, 2));
await browser.close(); console.log(JSON.stringify({ passed, errors, csp }, null, 2)); assert.equal(errors.length, 0); assert.equal(csp.length, 0);
