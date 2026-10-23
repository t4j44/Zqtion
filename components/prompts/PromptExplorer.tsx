"use client";
import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { Search } from "lucide-react";
import type { PromptCardData } from "@/lib/prompts/types";
import PromptCard from "./PromptCard";
import { readSaved, subscribeSaved } from "@/lib/prompts/browser";
import { trackEvent } from "@/components/Analytics";

type State = { q: string; category: string; tool: string; style: string; difficulty: string; saved: boolean; page: number };
type Result = { items: PromptCardData[]; total: number; page: number; pageCount: number };
type Options = { categories: { slug: string; title: string }[]; tools: { slug: string; title: string }[]; styles: string[]; difficulties: string[] };
export const emptyFilters: State = { q: "", category: "", tool: "", style: "", difficulty: "", saved: false, page: 1 };
function paramsFor(state: State) { const params = new URLSearchParams(); Object.entries(state).forEach(([key, value]) => { if (value && !(key === "page" && value === 1)) params.set(key, String(value)); }); return params; }
export default function PromptExplorer({ initial, initialFilters, options, category = "", tool = "" }: { initial: Result; initialFilters: State; options: Options; category?: string; tool?: string }) {
  const [filters, setFilters] = useState(initialFilters);
  const [result, setResult] = useState(initial);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [revision, setRevision] = useState(0);
  const first = useRef(true);
  const filtersRef = useRef(filters);
  useEffect(() => { filtersRef.current = filters; }, [filters]);
  useEffect(() => {
    const pop = () => { const p = new URLSearchParams(location.search); setFilters({ q: p.get("q") || "", category: category || p.get("category") || "", tool: tool || p.get("tool") || "", style: p.get("style") || "", difficulty: p.get("difficulty") || "", saved: p.get("saved") === "true", page: Number(p.get("page")) || 1 }); };
    window.addEventListener("popstate", pop);
    const unsubscribe = subscribeSaved(() => { if (filtersRef.current.saved) setRevision((r) => r + 1); });
    return () => { window.removeEventListener("popstate", pop); unsubscribe(); };
  }, [category, tool]);
  useEffect(() => {
    if (first.current && !filters.saved) { first.current = false; return; }
    first.current = false;
    const controller = new AbortController();
    const timer = window.setTimeout(async () => {
      setBusy(true); setError("");
      const params = paramsFor(filters);
      const url = `${location.pathname}${params.size ? `?${params}` : ""}`;
      if (`${location.pathname}${location.search}` !== url) history.pushState(null, "", url);
      if (filters.saved) params.set("ids", readSaved().join(","));
      try {
        const response = await fetch(`/api/prompts?${params}`, { signal: controller.signal });
        if (!response.ok) throw new Error("Search unavailable");
        const data: Result = await response.json();
        if (!controller.signal.aborted) { setResult(data); trackEvent(filters.q ? "prompt_search" : "prompt_filter", { count: data.total, category: filters.category, tool: filters.tool }); }
      } catch { if (!controller.signal.aborted) setError("Search could not load. Your previous results are below. Try again."); }
      finally { if (!controller.signal.aborted) setBusy(false); }
    }, 200);
    return () => { clearTimeout(timer); controller.abort(); };
  }, [filters, revision]);
  const change = (key: keyof State, value: string | boolean | number) => setFilters((state) => ({ ...state, [key]: value, ...(key !== "page" ? { page: 1 } : {}) }));
  const pageHref = (page: number) => `?${paramsFor({ ...filters, page })}`;
  return <section className="pl-explorer" aria-label="Find prompts">
    <form role="search" onSubmit={(event) => { event.preventDefault(); setRevision((r) => r + 1); }}>
      <div className="pl-search"><Search size={22} aria-hidden="true" /><label className="sr-only" htmlFor="prompt-search">Search prompts, tools, styles</label><input id="prompt-search" name="q" type="search" maxLength={200} placeholder="Search prompts, tools, styles…" value={filters.q} onChange={(e) => change("q", e.target.value)} /><button type="submit">Search <span aria-hidden="true">↗</span></button></div>
      <div className="pl-filter-row">
        {!category && <label>Category<select value={filters.category} onChange={(e) => change("category", e.target.value)}><option value="">All categories</option>{options.categories.map((c) => <option key={c.slug} value={c.slug}>{c.title}</option>)}</select></label>}
        {!tool && <label>Tool<select value={filters.tool} onChange={(e) => change("tool", e.target.value)}><option value="">All tools</option>{options.tools.map((t) => <option key={t.slug} value={t.slug}>{t.title}</option>)}</select></label>}
        <label>Style<select value={filters.style} onChange={(e) => change("style", e.target.value)}><option value="">All styles</option>{options.styles.map((s) => <option key={s}>{s}</option>)}</select></label>
        <label>Difficulty<select value={filters.difficulty} onChange={(e) => change("difficulty", e.target.value)}><option value="">All levels</option>{options.difficulties.map((d) => <option key={d}>{d}</option>)}</select></label>
        <button className="pl-saved-filter" type="button" aria-pressed={filters.saved} onClick={() => change("saved", !filters.saved)}>Saved on this device</button>
      </div>
    </form>
    <div className="pl-results-heading"><h2>{filters.saved ? "Your saved prompts" : "Explore the collection"}</h2><span role="status" aria-live="polite">{busy ? "Searching…" : `${result.total} prompts`}</span><button className="pl-action" onClick={() => setFilters({ ...emptyFilters, category, tool })}>Reset filters</button></div>
    {error && <p role="alert">{error} <button className="pl-action" onClick={() => setRevision((r) => r + 1)}>Retry</button></p>}
    <div aria-busy={busy} className="pl-card-grid">{result.items.map((prompt) => <PromptCard key={prompt.id} prompt={prompt} />)}</div>
    {!result.items.length && <div className="pl-empty"><h3>No prompts found.</h3><p>{filters.saved ? "Save a prompt from any card to keep it on this device." : "Try another tool, category or search term."}</p></div>}
    {result.pageCount > 1 && <nav className="pl-pagination" aria-label="Prompt pages">{Array.from({ length: result.pageCount }, (_, i) => i + 1).map((page) => <Link key={page} href={pageHref(page)} aria-current={page === result.page ? "page" : undefined} onClick={(e) => { e.preventDefault(); change("page", page); }}>{page}</Link>)}</nav>}
    <p className="pl-muted pl-small pl-collection-note">Original Zqtion briefs. Illustrative previews. Save works on this device; it does not sync to an account.</p>
  </section>;
}
