import PromptExplorer from "./PromptExplorer";
import { getFilterOptions, searchPrompts } from "@/lib/prompts/service";

export type SearchParams = Record<string, string | string[] | undefined>;
export default function Collection({ query, category = "", tool = "" }: { query: SearchParams; category?: string; tool?: string }) {
  const value = (key: string) => typeof query[key] === "string" ? query[key] as string : "";
  const filters = { q: value("q").slice(0, 200), category: category || value("category"), tool: tool || value("tool"), style: value("style"), difficulty: value("difficulty"), page: Math.max(1, Number(value("page")) || 1), saved: value("saved") === "true" };
  const initial = searchPrompts({ ...filters, saved: filters.saved ? [] : undefined });
  return <PromptExplorer initial={initial} initialFilters={filters} options={getFilterOptions({ category, tool })} category={category} tool={tool} />;
}
