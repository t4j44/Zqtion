import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { moduleUrl } from "../../tests/helpers/typescript.mjs";
import { projectRoot } from "./pipeline.mjs";

const { promptCategories, promptTools, promptMethods } = await import(await moduleUrl("data/prompt-guides.ts"));
const records = JSON.parse(await readFile(path.join(projectRoot, "content/prompts/generated/library.json"), "utf8"));
const { siteConfig } = await import(await moduleUrl("data/site.ts"));
const origin = process.env.PROMPT_QA_ORIGIN || "http://localhost:3100";
if (!["localhost", "127.0.0.1"].includes(new URL(origin).hostname)) throw new Error("SEO audit is restricted to the local preview");
const routes = ["/prompts", "/prompts/tools", "/prompts/methods", "/prompts/methodology", ...promptCategories.filter((c) => records.some((p) => p.category === c.slug)).map((c) => `/prompts/${c.slug}`), ...records.map((p) => p.seo.canonicalPath), ...promptTools.filter((t) => records.filter((p) => p.tools.includes(t.slug)).length >= 3).map((t) => `/prompts/tools/${t.slug}`), ...promptMethods.map((m) => `/prompts/methods/${m.slug}`)];
const failures = [], pages = [], titles = new Set(), descriptions = new Set(), linked = new Set();
// Community extends the library without joining the original-content corpus.
const communityLinkWorks = (await fetch(origin + "/prompts/community")).status === 200;
const attrs = (tag) => Object.fromEntries([...tag.matchAll(/([\w:-]+)="([^"]*)"/g)].map((m) => [m[1], m[2]]));
for (const route of routes) {
  const response = await fetch(origin + route);
  const html = await response.text();
  const body = html.replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, "");
  const title = body.match(/<title>(.*?)<\/title>/s)?.[1];
  const meta = [...html.matchAll(/<meta\b[^>]*>/g)].map((m) => attrs(m[0]));
  const description = meta.find((m) => m.name === "description")?.content;
  const canonical = [...html.matchAll(/<link\b[^>]*>/g)].map((m) => attrs(m[0])).find((m) => m.rel === "canonical")?.href;
  const errors = [];
  if (response.status !== 200) errors.push(`HTTP ${response.status}`);
  if (!title || titles.has(title)) errors.push("Missing or duplicate title");
  if (!description || descriptions.has(description)) errors.push("Missing or duplicate description");
  titles.add(title); descriptions.add(description);
  if (canonical !== siteConfig.url + route) errors.push("Incorrect canonical");
  if ((body.match(/<h1\b/g) || []).length !== 1) errors.push("Expected exactly one server-rendered H1");
  if (meta.some((m) => m.name === "robots" && m.content?.includes("noindex"))) errors.push("Important page noindexed");
  const schemas = [...html.matchAll(/<script type="application\/ld\+json">(.*?)<\/script>/gs)];
  if (!schemas.length) errors.push("Missing JSON-LD");
  for (const match of schemas) { try { const schema = JSON.parse(match[1]); if (!schema["@context"] || !schema["@type"]) errors.push("Incomplete JSON-LD"); } catch { errors.push("Invalid JSON-LD"); } }
  const prompt = records.find((p) => p.seo.canonicalPath === route);
  if (prompt && (!body.includes('aria-label="Prompt text"') || !body.includes("Why this works"))) errors.push("Missing server-rendered prompt or learning content");
  if (/sourceResearch|sourceIds|data\\\\raw|E:\\\\projects/.test(html)) errors.push("Private source data leaked");
  const links = [...body.matchAll(/<a\b[^>]*href="([^"]*)"/g)].map((m) => m[1].split(/[?#]/)[0]);
  links.filter((l) => l.startsWith("/prompts")).forEach((l) => { linked.add(l); if (!routes.includes(l) && !(l === "/prompts/community" && communityLinkWorks)) errors.push(`Broken library link ${l}`); });
  const text = body.replace(/<[^>]+>/g, " ");
  if (text.split(/\s+/).length < 150) errors.push("Thin page: fewer than 150 rendered words");
  pages.push({ route, status: response.status, title, errors }); failures.push(...errors.map((e) => `${route}: ${e}`));
}
routes.filter((r) => !linked.has(r) && r !== "/prompts").forEach((r) => failures.push(`Orphan: ${r}`));
const sitemap = await (await fetch(origin + "/sitemap.xml")).text();
routes.filter((r) => !sitemap.includes(`<loc>${siteConfig.url}${r}</loc>`)).forEach((r) => failures.push(`Missing from sitemap: ${r}`));
if (sitemap.includes("/prompts?")) failures.push("Filter URLs in sitemap");
for (const route of ["/prompts/unknown", "/prompts/ui/not-a-prompt", "/prompts/image/fieldwork-research-dashboard", "/api/prompts/not-found", "/research", "/data/raw"]) {
  if ((await fetch(origin + route)).status !== 404) failures.push(`Expected 404: ${route}`);
}
const filtered = await (await fetch(origin + "/prompts?q=ceramic")).text();
if (!filtered.includes(`href="${siteConfig.url}/prompts"`)) failures.push("Search canonical is not the clean library URL");
const api = await (await fetch(origin + "/api/prompts?q=ceramic")).json();
if (api.total !== 1 || api.items.some((p) => p.prompt || p.sourceResearch)) failures.push("Search API payload invalid");
const report = `# Prompt library SEO audit\n\nOrigin: ${origin}\nPages inspected via actual HTTP HTML: ${pages.length}\nFailures: ${failures.length}\n\nChecks: status, unique title/description, canonical, one H1, server-rendered prompt content, JSON-LD syntax and required identity, internal library links, orphan pages, sitemap coverage, minimum rendered content, private-data markers, filter canonical, missing-route 404s and bounded search payload.\n\n| Route | HTTP | Findings |\n|---|---|---|\n${pages.map((p) => `| ${p.route} | ${p.status} | ${p.errors.join("; ") || "Pass"} |`).join("\n")}\n\n${failures.map((f) => `- ${f}`).join("\n") || "All automated HTML checks passed."}\n\nThis is a local structural audit. It is not a search ranking, rich-result eligibility, hosted crawlability or AI recommendation guarantee. JSON-LD was parsed locally, not submitted to an external rich-results service.\n`;
await writeFile(path.join(projectRoot, "PROMPT_LIBRARY_SEO_REPORT.md"), report);
console.log(`SEO HTML AUDIT: ${pages.length} pages, ${failures.length} failures`);
if (failures.length) { console.error(failures.join("\n")); process.exitCode = 1; }
