import type { Prompt, PromptCardData, PromptFilters, PromptVariable } from "./types";

export function customizePrompt(template: string, variables: PromptVariable[], values: Record<string, string>) {
  const defaults = new Map(variables.map((v) => [v.key, v.defaultValue]));
  return template.replace(/\{\{([A-Z][A-Z0-9_]*)\}\}/g, (match, key: string) => values[key]?.trim().slice(0, 500) || defaults.get(key) || match);
}
const tokenize = (value: string) => value.normalize("NFKC").toLowerCase().match(/[\p{L}\p{N}]+/gu) || [];
export function searchRecords(records: Prompt[], filters: PromptFilters = {}) {
  const tokens = tokenize((filters.q || "").slice(0, 200));
  return records.map((p) => {
    const title = tokenize(p.title).join(" ");
    const content = tokenize([p.title, p.description, p.category, p.contentType, p.style, ...p.tags, ...p.tools, ...p.useCases, ...p.learning.methodIds, p.prompt].join(" ")).join(" ");
    const matches = tokens.every((t) => content.includes(t));
    return { p, score: tokens.reduce((sum, t) => sum + (title.includes(t) ? 5 : 1), 0), matches };
  }).filter(({ p, matches }) => matches && (!filters.category || p.category === filters.category) && (!filters.tool || p.tools.includes(filters.tool)) && (!filters.style || p.style === filters.style) && (!filters.difficulty || p.difficulty === filters.difficulty) && (!filters.saved || filters.saved.includes(p.id)))
    .sort((a, b) => b.score - a.score || b.p.updatedAt.localeCompare(a.p.updatedAt) || a.p.id.localeCompare(b.p.id)).map(({ p }) => p);
}
export function relatedRecords(records: Prompt[], prompt: Prompt, limit = 3) {
  return records.filter((p) => p.id !== prompt.id).map((p) => ({ p, score: (p.category === prompt.category ? 6 : 0) + p.tags.filter((t) => prompt.tags.includes(t)).length * 3 + p.tools.filter((t) => prompt.tools.includes(t)).length + p.useCases.filter((t) => prompt.useCases.includes(t)).length * 2 + (p.style === prompt.style ? 2 : 0) })).filter((r) => r.score > 0).sort((a, b) => b.score - a.score || a.p.id.localeCompare(b.p.id)).slice(0, limit).map((r) => r.p);
}
export function toCard(p: Prompt): PromptCardData {
  return { id: p.id, slug: p.slug, title: p.title, description: p.description, category: p.category, tags: p.tags, tools: p.tools, difficulty: p.difficulty, style: p.style, preview: p.preview };
}
