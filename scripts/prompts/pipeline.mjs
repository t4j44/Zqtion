import { readFile, writeFile, mkdir } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { createHash } from "node:crypto";
import { originals } from "./originals.mjs";

export const projectRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");
const privateRoot = path.join(projectRoot, ".prompt-research");
const generatedRoot = path.join(projectRoot, "content/prompts/generated");
export const words = (text) => String(text).normalize("NFKC").toLowerCase().match(/[\p{L}\p{N}]+/gu) || [];
const strings = (value) => typeof value === "string" ? value.trim() : "";
const list = (value) => Array.isArray(value) ? [...new Set(value.filter((s) => typeof s === "string" && s.trim()).map((s) => s.trim().toLowerCase()))] : typeof value === "string" ? [value.toLowerCase()] : [];
export function safeSourcePath(root, relative) {
  if (typeof relative !== "string" || !relative) throw new Error("Missing source path");
  const resolved = path.resolve(root, relative.replace(/[\\/]/g, path.sep));
  if (!resolved.startsWith(path.resolve(root) + path.sep)) throw new Error("Source path escapes corpus");
  return resolved;
}
export function normalizeResearch(entry, raw) {
  if (!entry || typeof entry !== "object" || !strings(entry.id)) throw new Error("Missing research ID");
  const fields = raw?.structured_extraction;
  if (!fields || typeof fields !== "object" || !strings(fields.full_prompt)) throw new Error("Missing extracted prompt");
  const text = fields.full_prompt;
  const principles = [];
  for (const [pattern, principle] of [
    [/layout|hierarchy|grid/i, "Organize content into a deliberate hierarchy."],
    [/typograph|font/i, "Assign distinct typographic roles to headings and controls."],
    [/spacing|padding/i, "Use a consistent spacing rhythm."],
    [/light|shadow/i, "Define light direction and a coherent shadow model."],
    [/camera|lens|composition/i, "Specify viewpoint and composition separately from the subject."],
    [/material|texture/i, "Describe surface properties rather than only a style adjective."],
    [/reference/i, "Separate reference identity from stylistic changes."],
    [/responsive|mobile/i, "Specify how the composition adapts to a smaller canvas."],
    [/motion|animation/i, "Make motion subordinate to information and interaction."],
  ]) if (pattern.test(text)) principles.push(principle);
  return { id: entry.id, source: strings(entry.source), sourceUrl: strings(entry.source_url), sourceHash: strings(entry.content_hash), contentType: strings(entry.content_type), categories: list(entry.categories), tags: list(entry.tags), tools: list(fields.tools ?? fields.recommended_tool ?? entry.tools), language: strings(fields.language || entry.language) || "unknown", complete: fields.prompt_complete === true, principles, structuredFields: Object.keys(fields).filter((key) => fields[key] !== null && fields[key] !== ""), text };
}
export async function readCorpus(root) {
  const entries = JSON.parse(await readFile(path.join(root, "data/indexes/all_entries.json"), "utf8"));
  if (!Array.isArray(entries)) throw new Error("Corpus index must be an array");
  const records = [], errors = [];
  for (const entry of entries) {
    try {
      const raw = JSON.parse(await readFile(safeSourcePath(root, entry?.json_path), "utf8"));
      records.push(normalizeResearch(entry, raw));
    } catch (error) { errors.push({ id: entry?.id || "unknown", reason: error.message }); }
  }
  return { entries, records, errors };
}
const ngrams = (tokens, n) => new Set(tokens.slice(0, Math.max(0, tokens.length - n + 1)).map((_, i) => tokens.slice(i, i + n).join(" ")));
const intersection = (a, b) => [...a].filter((value) => b.has(value)).length;
export function compareSimilarity(candidate, source) {
  const a = words(candidate), b = words(source);
  const a5 = ngrams(a, 5), b5 = ngrams(b, 5);
  const overlap = intersection(a5, b5) / Math.max(1, a5.size);
  const unigramA = new Set(a), unigramB = new Set(b);
  const common = intersection(unigramA, unigramB);
  const normalizedSimilarity = common / Math.max(1, unigramA.size + unigramB.size - common);
  // Sparse longest common contiguous token sequence, including repeats.
  const positions = new Map();
  b.forEach((token, i) => positions.set(token, [...(positions.get(token) || []), i]));
  let previous = new Map(), longestSequence = 0;
  for (const token of a) {
    const current = new Map();
    for (const j of positions.get(token) || []) { const length = (previous.get(j - 1) || 0) + 1; current.set(j, length); longestSequence = Math.max(longestSequence, length); }
    previous = current;
  }
  const headings = (text) => String(text).split(/\r?\n/).map((s) => s.trim()).filter((s) => /^#{1,4}\s/.test(s) || /^[A-Z][A-Z ]{3,40}$/.test(s)).map((s) => words(s).join(" "));
  const ah = headings(candidate), bh = headings(source);
  const structuralDuplication = ah.length >= 3 && ah.join("|") === bh.join("|");
  return { overlap, normalizedSimilarity, longestSequence, structuralDuplication, flagged: overlap > 0.15 || normalizedSimilarity > 0.65 || longestSequence >= 18 || structuralDuplication };
}
export function validatePrompt(p) {
  const errors = [];
  if (!p || typeof p !== "object") return ["Record must be an object"];
  for (const field of ["id", "slug", "title", "description", "answerFirstSummary", "prompt", "category", "author", "createdAt", "updatedAt"]) if (!strings(p[field])) errors.push(`Missing ${field}`);
  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(p.slug || "")) errors.push("Invalid slug");
  if (!["ui", "image", "vibe-coding"].includes(p.category)) errors.push("Unknown category");
  if (p.contentType !== ({ ui: "ui-design", image: "image", "vibe-coding": "vibe-coding" })[p.category]) errors.push("Invalid content type");
  if (!["beginner", "intermediate", "advanced"].includes(p.difficulty)) errors.push("Invalid difficulty");
  if (p.locale !== "en") errors.push("Unsupported locale");
  for (const key of ["createdAt", "updatedAt"]) if (!/^\d{4}-\d{2}-\d{2}$/.test(p[key] || "") || Number.isNaN(Date.parse(p[key]))) errors.push(`Invalid ${key}`);
  for (const field of ["tags", "tools", "audiences", "useCases"]) if (!Array.isArray(p[field]) || !p[field].length || p[field].some((s) => !strings(s))) errors.push(`Invalid ${field}`);
  const count = words(p.prompt).length;
  if (count < 120 || count > 3500) errors.push("Prompt length outside 120–3500 words");
  if ((String(p.prompt).match(/```/g) || []).length % 2) errors.push("Unclosed code fence");
  if (/\uFFFD|\u0000/.test(JSON.stringify(p))) errors.push("Broken Unicode");
  if (/\n[A-Z ]{4,}\n\s*\n[A-Z ]{4,}\n/.test(p.prompt || "")) errors.push("Empty section");
  if (!Array.isArray(p.variables)) errors.push("Variables must be an array");
  const variables = Array.isArray(p.variables) ? p.variables : [];
  const keys = variables.map((v) => v?.key);
  if (new Set(keys).size !== keys.length) errors.push("Duplicate variables");
  for (const v of variables) if (!v || !/^[A-Z][A-Z0-9_]*$/.test(v.key || "") || !strings(v.label) || !strings(v.defaultValue) || /[{}]/.test(v.defaultValue)) errors.push("Invalid variable");
  const placeholders = [...String(p.prompt).matchAll(/\{\{([A-Z][A-Z0-9_]*)\}\}/g)].map((m) => m[1]);
  if (/[{}]/.test(String(p.prompt).replace(/\{\{[A-Z][A-Z0-9_]*\}\}/g, ""))) errors.push("Malformed placeholder");
  if (placeholders.some((key) => !keys.includes(key)) || keys.some((key) => !placeholders.includes(key))) errors.push("Unmapped placeholder");
  if (!p.seo?.title || !p.seo?.description || p.seo?.canonicalPath !== `/prompts/${p.category}/${p.slug}`) errors.push("Invalid SEO metadata");
  if (!p.learning?.whyItWorks || !p.learning?.anatomy?.length || !p.learning?.methodIds?.length || !p.learning?.mistakes?.length || !p.learning?.tips?.length) errors.push("Missing learning context");
  if (!p.specification || Object.values(p.specification).some((s) => !strings(s)) || !Object.keys(p.specification).length) errors.push("Invalid specification");
  if (!p.example?.input || !p.example?.expected || !p.preview?.variant || !p.preview?.label || !p.style) errors.push("Missing example, preview or style");
  return errors;
}
export function publicRecord(p) {
  const fields = ["id", "slug", "locale", "title", "description", "answerFirstSummary", "category", "contentType", "tags", "tools", "difficulty", "style", "useCases", "audiences", "prompt", "variables", "specification", "learning", "example", "preview", "createdAt", "updatedAt", "author", "seo"];
  return Object.fromEntries(fields.map((field) => [field, structuredClone(p[field])]));
}
export function validateLibrary(records) {
  const slugs = new Set(), bodies = new Set(), ids = new Set();
  return records.flatMap((p) => {
    const errors = validatePrompt(p);
    const body = words(p?.prompt).join(" ");
    if (slugs.has(p?.slug)) errors.push("Duplicate slug");
    if (ids.has(p?.id)) errors.push("Duplicate ID");
    if (bodies.has(body)) errors.push("Duplicate prompt");
    slugs.add(p?.slug); ids.add(p?.id); bodies.add(body);
    return errors.map((reason) => ({ id: p?.id || "unknown", reason }));
  });
}
async function writeJson(destination, data) { await mkdir(path.dirname(destination), { recursive: true }); await writeFile(destination, JSON.stringify(data, null, 2) + "\n"); }
export async function run(command = "sync") {
  if (command === "validate") {
    const records = JSON.parse(await readFile(path.join(generatedRoot, "library.json"), "utf8"));
    const errors = validateLibrary(records);
    if (/sourceResearch|sourceIds|source_url|E:\\\\projects/i.test(JSON.stringify(records))) errors.push({ id: "public", reason: "Private provenance leaked" });
    await writeFile(path.join(projectRoot, "PROMPT_LIBRARY_QA_REPORT.md"), `# Prompt library content QA\n\nRecords checked: ${records.length}\nErrors: ${errors.length}\n\nChecks: required fields, bounded length, taxonomy, unique IDs/slugs/content, variables, fences, Unicode, learning context, previews and metadata.\n\n${errors.map((e) => `- ${e.id}: ${e.reason}`).join("\n") || "All content checks passed."}\n\nRuntime and browser evidence is recorded separately in the implementation report.\n`);
    if (errors.length) throw new Error(JSON.stringify(errors));
    console.log(`PROMPT VALIDATION PASSED: ${records.length} records`); return;
  }
  const corpusRoot = process.env.ZQTION_PROMPT_CORPUS_PATH || "E:\\projects\\zqtion-prompt-corpus";
  const { entries, records, errors } = await readCorpus(corpusRoot);
  const counts = (field) => Object.fromEntries([...new Set(records.map((r) => r[field]))].map((key) => [key, records.filter((r) => r[field] === key).length]));
  const summary = { scanned: entries.length, normalized: records.length, sources: counts("source"), types: counts("contentType"), languages: counts("language"), missingTools: records.filter((r) => !r.tools.length).length, incomplete: records.filter((r) => !r.complete).length, duplicateHashes: records.length - new Set(records.map((r) => r.sourceHash)).size, categories: [...new Set(records.flatMap((r) => r.categories))], errors };
  console.log("ZQTION PROMPT LIBRARY — DISCOVERY\n" + JSON.stringify(summary, null, 2));
  if (command === "inspect") return;
  await mkdir(privateRoot, { recursive: true });
  await writeJson(path.join(privateRoot, "knowledge.json"), records.map((record) => Object.fromEntries(Object.entries(record).filter(([key]) => key !== "text"))));
  await writeJson(path.join(privateRoot, "inspection.json"), summary);
  if (command === "normalize") return;
  const failures = validateLibrary(originals);
  const results = [], accepted = [];
  for (const original of originals) {
    const missing = original.sourceResearch.sourceIds.filter((id) => !records.some((r) => r.id === id));
    const comparisons = records.map((r) => ({ sourceId: r.id, ...compareSimilarity(original.prompt, r.text) }));
    const flags = comparisons.filter((r) => r.flagged);
    const quality = failures.filter((e) => e.id === original.id);
    results.push({ id: original.id, flagged: Boolean(flags.length || quality.length || missing.length), highestOverlap: Math.max(0, ...comparisons.map((r) => r.overlap)), highestNormalizedSimilarity: Math.max(0, ...comparisons.map((r) => r.normalizedSimilarity)), longestSequence: Math.max(0, ...comparisons.map((r) => r.longestSequence)), flags, quality, missing });
    if (!flags.length && !quality.length && !missing.length) accepted.push(publicRecord(original));
  }
  await writeJson(path.join(privateRoot, "originality.json"), results);
  await writeJson(path.join(privateRoot, "provenance.json"), originals.map((p) => ({ id: p.id, ...p.sourceResearch })));
  await writeFile(path.join(projectRoot, "PROMPT_ORIGINALITY_REPORT.md"), `# Prompt originality screening\n\nCompared ${originals.length} authored prompts against ${records.length} source bodies (${originals.length * records.length} pairs).\nPassed: ${accepted.length}. Flagged: ${results.filter((r) => r.flagged).length}.\nHighest five-token phrase overlap: ${(Math.max(...results.map((r) => r.highestOverlap)) * 100).toFixed(2)}%.\nHighest normalized token Jaccard similarity: ${(Math.max(...results.map((r) => r.highestNormalizedSimilarity)) * 100).toFixed(2)}%.\nLongest exact token sequence: ${Math.max(...results.map((r) => r.longestSequence))}.\n\n| ID | Flagged | Phrase overlap | Longest sequence |\n|---|---|---|---|\n${results.map((r) => `| ${r.id} | ${r.flagged} | ${(r.highestOverlap * 100).toFixed(2)}% | ${r.longestSequence} |`).join("\n")}\n\nFlags: over 15% candidate five-gram overlap, over 65% normalized token Jaccard, 18+ consecutive matching tokens, or identical heading sequence of at least three headings. These are conservative lexical checks, not semantic originality or legal clearance. Source bodies and comparison provenance remain in ignored .prompt-research. The pipeline publishes independently authored editorial records; it does not paraphrase source text or call an AI service.\n`);
  if (!accepted.length) throw new Error("No valid originals; previous public dataset preserved");
  await writeJson(path.join(generatedRoot, "library.json"), accepted);
  await writeJson(path.join(generatedRoot, "manifest.json"), { version: 1, count: accepted.length, digest: createHash("sha256").update(JSON.stringify(accepted)).digest("hex"), routes: accepted.map((p) => p.seo.canonicalPath), categories: [...new Set(accepted.map((p) => p.category))], tools: [...new Set(accepted.flatMap((p) => p.tools))] });
  await run("validate");
  console.log(`PROMPT SYNC COMPLETE\nScanned: ${entries.length}\nNormalized: ${records.length}\nAuthored: ${originals.length}\nRejected: ${originals.length - accepted.length}\nPublic: ${accepted.length}\nCorpus errors: ${errors.length}`);
}
if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) run(process.argv[2]).catch((error) => { console.error(error.message); process.exitCode = 1; });
