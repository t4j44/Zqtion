import test from "node:test";
import assert from "node:assert/strict";
import { readFile, mkdtemp, mkdir, writeFile, rm } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import ts from "typescript";
import { renderToStaticMarkup } from "react-dom/server";
import { createElement } from "react";
import { moduleUrl } from "./helpers/typescript.mjs";
import { compareSimilarity, normalizeResearch, publicRecord, readCorpus, safeSourcePath, validateLibrary, validatePrompt } from "../scripts/prompts/pipeline.mjs";
import { originals } from "../scripts/prompts/originals.mjs";

const dataUrl = (source) => `data:text/javascript;base64,${Buffer.from(source).toString("base64")}`;
const records = JSON.parse(await readFile(new URL("../content/prompts/generated/library.json", import.meta.url), "utf8"));
const coreUrl = await moduleUrl("lib/prompts/core.ts");
const core = await import(coreUrl);
const guidesUrl = await moduleUrl("data/prompt-guides.ts");
const guides = await import(guidesUrl);
const siteUrl = await moduleUrl("data/site.ts");
const serviceUrl = await moduleUrl("lib/prompts/service.ts", { "server-only": dataUrl("export {};"), "@/content/prompts/generated/library.json": dataUrl(`export default ${JSON.stringify(records)}`), "@/data/prompt-guides": guidesUrl, "./core": coreUrl });
const service = await import(serviceUrl);
const seo = await import(await moduleUrl("lib/prompts/seo.ts", { "@/data/site": siteUrl }));

test("all public records have valid schema, unique identity and complete taxonomy links", () => {
  assert.deepEqual(validateLibrary(records), []);
  assert.equal(records.length, 12);
  for (const p of records) {
    assert.ok(guides.promptCategories.some((c) => c.slug === p.category));
    for (const t of p.tools) assert.ok(guides.promptTools.some((x) => x.slug === t));
    for (const m of p.learning.methodIds) assert.ok(guides.promptMethods.some((x) => x.slug === m));
  }
});
test("private research is stripped by an allowlist, including unknown top-level fields", () => {
  const safe = publicRecord({ ...originals[0], secret: "do not publish", raw_markdown: "private" });
  assert.equal(safe.sourceResearch, undefined); assert.equal(safe.secret, undefined); assert.equal(safe.raw_markdown, undefined);
  assert.ok(!JSON.stringify(records).includes("sourceIds"));
});
test("normalizer reads actual structured extraction and handles missing fields", () => {
  const record = normalizeResearch({ id: "source-a", source: "test", categories: ["UI", "ui"], tags: null }, { structured_extraction: { full_prompt: "Use lighting and a clear composition, a grid and typography.", prompt_complete: true, tools: "Gemini" } });
  assert.deepEqual(record.categories, ["ui"]); assert.deepEqual(record.tools, ["gemini"]); assert.equal(record.language, "unknown"); assert.ok(record.principles.length >= 3);
  assert.throws(() => normalizeResearch({}, {})); assert.throws(() => normalizeResearch({ id: "x" }, { structured_extraction: {} }));
});
test("corpus parser skips corrupt records and blocks source path traversal", async () => {
  const dir = await mkdtemp(path.join(os.tmpdir(), "zqtion-prompts-test-"));
  try {
    await mkdir(path.join(dir, "data/indexes"), { recursive: true });
    await writeFile(path.join(dir, "good.json"), JSON.stringify({ structured_extraction: { full_prompt: "A source with composition and lighting", prompt_complete: true } }));
    await writeFile(path.join(dir, "bad.json"), "not json");
    await writeFile(path.join(dir, "data/indexes/all_entries.json"), JSON.stringify([{ id: "good", json_path: "good.json" }, { id: "bad", json_path: "bad.json" }, { id: "outside", json_path: "../outside.json" }, null]));
    const result = await readCorpus(dir); assert.equal(result.records.length, 1); assert.equal(result.errors.length, 3);
    assert.throws(() => safeSourcePath(dir, "../outside.json"));
  } finally { await rm(dir, { recursive: true, force: true }); }
});
test("quality rejects duplicate IDs/slugs/content, malformed placeholders and broken fences", () => {
  assert.ok(validateLibrary([records[0], records[0]]).some((e) => e.reason === "Duplicate slug"));
  const broken = { ...records[0], prompt: records[0].prompt + "\n```\n{{UNKNOWN}}\uFFFD" };
  const errors = validatePrompt(broken); assert.ok(errors.includes("Unclosed code fence")); assert.ok(errors.includes("Unmapped placeholder")); assert.ok(errors.includes("Broken Unicode"));
  assert.ok(validatePrompt({}).length > 5);
});
test("similarity catches exact copying, long contiguous reuse and heading duplication", () => {
  assert.equal(compareSimilarity(records[0].prompt, records[0].prompt).flagged, true);
  const phrase = "one two three four five six seven eight nine ten eleven twelve thirteen fourteen fifteen sixteen seventeen eighteen nineteen";
  assert.ok(compareSimilarity(`Different opening ${phrase} final`, `Source start ${phrase} unrelated ending`).longestSequence >= 19);
  assert.equal(compareSimilarity("GOAL\nFirst\nCONTEXT\nSecond\nOUTPUT\nThird", "GOAL\nFourth\nCONTEXT\nFifth\nOUTPUT\nSixth").structuralDuplication, true);
  assert.equal(compareSimilarity("Make a quiet blue ceramic cup", "Debug an authorization failure using a regression test").flagged, false);
});
test("search combines tokens across fields and searches the full prompt", () => {
  assert.ok(core.searchRecords(records, { q: "research dashboard" }).some((p) => p.slug === "fieldwork-research-dashboard"));
  assert.deepEqual(core.searchRecords(records, { q: "byte-order" }).map((p) => p.slug), ["safe-csv-import-wizard"]);
  assert.equal(core.searchRecords(records, { q: "unfindable-xyz-9182" }).length, 0);
  assert.equal(core.searchRecords(records, { q: "IMAGE PROMPT FORMULA" }).length, 4);
});
test("combined filters and saved IDs do not reveal unmatched records", () => {
  assert.equal(core.searchRecords(records, { category: "image", tool: "gemini", style: "Studio" }).length, 2);
  assert.equal(core.searchRecords(records, { category: "ui", tool: "gemini" }).length, 0);
  assert.equal(core.searchRecords(records, { saved: [] }).length, 0);
  assert.equal(core.searchRecords(records, { saved: [records[0].id] }).length, 1);
});
test("related prompts are deterministic, relevant and exclude the current prompt", () => {
  const result = core.relatedRecords(records, records[0]); assert.equal(result.length, 3); assert.ok(result.every((p) => p.category === "ui" && p.id !== records[0].id)); assert.deepEqual(result, core.relatedRecords(records, records[0]));
});
test("customization handles repeated placeholders and replacement metacharacters literally", () => {
  const vars = [{ key: "NAME", defaultValue: "Default" }];
  assert.equal(core.customizePrompt("{{NAME}} / {{NAME}}", vars, { NAME: "$& <b>test</b>" }), "$& <b>test</b> / $& <b>test</b>");
  assert.equal(core.customizePrompt("{{NAME}}", vars, { NAME: "  " }), "Default");
  assert.equal(core.customizePrompt("{{NAME}}", vars, { NAME: "x".repeat(1000) }).length, 500);
});
test("service bounds pages and only returns card summaries", () => {
  assert.equal(service.searchPrompts().items.length, 9);
  assert.equal(service.searchPrompts({ page: 2 }).items.length, 3);
  assert.equal(service.searchPrompts({ page: 999 }).page, 2);
  assert.equal(service.searchPrompts({ page: -9 }).page, 1);
  assert.equal(service.searchPrompts().items[0].prompt, undefined);
  assert.equal(service.getPromptBySlug("unknown"), undefined);
});
test("metadata and sitemap routes are unique and avoid filtered URLs", () => {
  const routes = service.getLibraryRoutes(); assert.equal(routes.length, 29); assert.equal(new Set(routes).size, routes.length);
  for (const p of records) { const meta = seo.promptMetadata(p.seo.title, p.seo.description, p.seo.canonicalPath); assert.equal(meta.alternates.canonical, p.seo.canonicalPath); assert.ok(routes.includes(p.seo.canonicalPath)); }
  assert.ok(routes.every((r) => !r.includes("?")));
  const schema = seo.librarySchema("Example", "Description", "/prompts", "Article", "2026-09-23"); assert.equal(schema["@type"], "Article"); assert.equal(schema.dateModified, "2026-09-23");
});
test("PromptBlock server-renders the full default prompt, labels and safe text", async () => {
  const source = await readFile(new URL("../components/prompts/PromptBlock.tsx", import.meta.url), "utf8");
  let compiled = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.ESNext, target: ts.ScriptTarget.ES2022, jsx: ts.JsxEmit.ReactJSX } }).outputText;
  const imports = { react: import.meta.resolve("react"), "react/jsx-runtime": import.meta.resolve("react/jsx-runtime"), "./PromptActions": dataUrl("export function CopyPrompt() { return null; }"), "@/lib/prompts/core": coreUrl, "@/components/Analytics": dataUrl("export function trackEvent() {}") };
  for (const [name, url] of Object.entries(imports)) compiled = compiled.replaceAll(`from "${name}"`, `from "${url}"`);
  const { default: PromptBlock } = await import(dataUrl(compiled));
  const html = renderToStaticMarkup(createElement(PromptBlock, { slug: "test", template: "Hello {{NAME}} <script>bad()</script>", variables: [{ key: "NAME", label: "Your name", defaultValue: "Builder", hint: "Use a name" }] }));
  assert.ok(html.includes("Hello Builder &lt;script&gt;")); assert.ok(html.includes('for="variable-NAME"')); assert.ok(html.includes('aria-label="Prompt text"')); assert.ok(!html.includes("<script>bad"));
});
test("copy utility reports success and supports selection fallback with focus restoration", async () => {
  const { copyText } = await import(await moduleUrl("lib/prompts/browser.ts"));
  const previousNavigator = Object.getOwnPropertyDescriptor(globalThis, "navigator"); const previousDocument = Object.getOwnPropertyDescriptor(globalThis, "document");
  let selected = false, removed = false, focused = false, copied = "";
  class FakeElement { focus() { focused = true; } }
  const previousHTMLElement = globalThis.HTMLElement;
  try {
    globalThis.HTMLElement = FakeElement;
    Object.defineProperty(globalThis, "navigator", { configurable: true, value: { clipboard: { writeText: async (text) => { copied = text; } } } });
    assert.equal(await copyText("hello"), true); assert.equal(copied, "hello");
    globalThis.navigator.clipboard.writeText = async () => { throw new Error("denied"); };
    Object.defineProperty(globalThis, "document", { configurable: true, value: { activeElement: new FakeElement(), body: { appendChild() {} }, createElement: () => ({ style: {}, setAttribute() {}, select() { selected = true; }, remove() { removed = true; } }), execCommand: () => true } });
    assert.equal(await copyText("fallback"), true); assert.ok(selected && removed && focused);
    globalThis.document.execCommand = () => false; assert.equal(await copyText("blocked"), false);
  } finally {
    if (previousNavigator) Object.defineProperty(globalThis, "navigator", previousNavigator); else delete globalThis.navigator;
    if (previousDocument) Object.defineProperty(globalThis, "document", previousDocument); else delete globalThis.document;
    if (previousHTMLElement) globalThis.HTMLElement = previousHTMLElement; else delete globalThis.HTMLElement;
  }
});
