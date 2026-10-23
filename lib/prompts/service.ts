import "server-only";
import dataset from "@/content/prompts/generated/library.json";
import { promptCategories, promptMethods, promptTools } from "@/data/prompt-guides";
import { relatedRecords, searchRecords, toCard } from "./core";
import type { Prompt, PromptFilters } from "./types";

// This file is produced and runtime-validated by prompts:sync; build uses the portable snapshot.
const prompts = dataset as unknown as Prompt[];
export const getAllPrompts = () => prompts;
export const getPromptBySlug = (slug: string) => prompts.find((p) => p.slug === slug);
export const getPromptsByCategory = (category: string) => searchRecords(prompts, { category });
export const getPromptsByTool = (tool: string) => searchRecords(prompts, { tool });
export const getRelatedPrompts = (prompt: Prompt) => relatedRecords(prompts, prompt);
export const getPromptMethods = () => promptMethods;
export const getCategories = () => promptCategories.filter((c) => getPromptsByCategory(c.slug).length > 0);
export const getTools = () => promptTools.filter((t) => getPromptsByTool(t.slug).length >= 3);
export function searchPrompts(filters: PromptFilters = {}) {
  const found = searchRecords(prompts, filters);
  const pageSize = 9;
  const pageCount = Math.max(1, Math.ceil(found.length / pageSize));
  const page = Math.max(1, Math.min(pageCount, Math.floor(Number(filters.page) || 1)));
  return { items: found.slice((page - 1) * pageSize, page * pageSize).map(toCard), total: found.length, page, pageCount };
}
export function getFilterOptions(scope: Pick<PromptFilters, "category" | "tool"> = {}) {
  const scoped = searchRecords(prompts, scope);
  return { categories: getCategories().filter((c) => scoped.some((p) => p.category === c.slug)).map(({ slug, title }) => ({ slug, title })), tools: getTools().filter((t) => scoped.some((p) => p.tools.includes(t.slug))).map(({ slug, title }) => ({ slug, title })), styles: [...new Set(scoped.map((p) => p.style))].sort(), difficulties: [...new Set(scoped.map((p) => p.difficulty))].sort() };
}
export function getLibraryRoutes() {
  return ["/prompts", "/prompts/tools", "/prompts/methods", "/prompts/methodology", ...getCategories().map((c) => `/prompts/${c.slug}`), ...prompts.map((p) => p.seo.canonicalPath), ...getTools().map((t) => `/prompts/tools/${t.slug}`), ...promptMethods.map((m) => `/prompts/methods/${m.slug}`)];
}
