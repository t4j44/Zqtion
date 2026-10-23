"use client";

import { useState, useMemo } from "react";
import type { ResourceItem } from "@/lib/resources/types";
import { ResourceCard } from "./ResourceCard";

interface ResourceSearchFilterProps {
  initialItems: ResourceItem[];
}

export function ResourceSearchFilter({ initialItems }: ResourceSearchFilterProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [selectedType, setSelectedType] = useState<string>("all");
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>("all");

  const categories: Array<{ id: string; label: string }> = [
    { id: "all", label: "All Categories" },
    { id: "create", label: "Create" },
    { id: "build", label: "Build" },
    { id: "automate", label: "Automate" },
    { id: "research", label: "Research" },
    { id: "productivity", label: "Productivity" },
    { id: "agents", label: "Agents" }
  ];

  const types: Array<{ id: string; label: string }> = [
    { id: "all", label: "All Types" },
    { id: "guide", label: "Guides" },
    { id: "tool", label: "Tools" },
    { id: "repository", label: "Repositories" },
    { id: "prompt", label: "Prompts" },
    { id: "skill", label: "Skills" },
    { id: "mcp_server", label: "MCP Servers" },
    { id: "workflow", label: "Workflows" },
    { id: "case_study", label: "Case Studies" }
  ];

  const filteredItems = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    const qTokens = q ? q.split(/\s+/).filter(Boolean) : [];

    return initialItems.filter((item) => {
      // Category filter
      if (selectedCategory !== "all" && item.category !== selectedCategory) {
        return false;
      }
      // Type filter
      if (selectedType !== "all" && item.resourceType !== selectedType) {
        return false;
      }
      // Difficulty filter
      if (selectedDifficulty !== "all" && item.difficulty !== selectedDifficulty) {
        return false;
      }
      // Query filter
      if (qTokens.length > 0) {
        const fullText = `${item.title} ${item.summary} ${item.tags.join(" ")} ${item.tools.join(" ")}`.toLowerCase();
        const matchesAll = qTokens.every((token) => fullText.includes(token));
        if (!matchesAll) return false;
      }
      return true;
    });
  }, [initialItems, searchQuery, selectedCategory, selectedType, selectedDifficulty]);

  return (
    <div>
      {/* Search and Filter Controls */}
      <div className="mb-8 space-y-4 rounded-xl border border-[var(--line)] bg-surface p-4 lg:p-6">
        {/* Search Input */}
        <div className="relative">
          <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5">
            <svg
              className="h-4 w-4 text-muted"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          <input
            type="search"
            aria-label="Search resources"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search AI building blocks, tools, workflows, prompts, repos (e.g. Crawl4AI, Claude, lead research)..."
            className="w-full min-h-[44px] rounded-lg border border-white/10 bg-black/40 pl-10 pr-10 text-sm text-foreground placeholder-zinc-500 focus:border-[#38BDF8] focus:outline-none focus:ring-1 focus:ring-[#38BDF8]"
          />
          {searchQuery && (
            <button
              type="button"
              aria-label="Clear resource search"
              onClick={() => setSearchQuery("")}
              className="absolute inset-y-0 right-0 flex items-center pr-3 text-xs text-muted hover:text-foreground"
            >
              Clear
            </button>
          )}
        </div>

        {/* Category Filter Pills */}
        <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-white/5">
          <span className="text-xs font-medium text-muted mr-1">Category:</span>
          {categories.map((cat) => (
            <button
              key={cat.id}
              type="button"
              aria-pressed={selectedCategory === cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`min-h-[44px] rounded-lg px-3 py-1 text-xs font-medium transition-colors ${
                selectedCategory === cat.id
                  ? "bg-white text-black font-semibold shadow"
                  : "bg-white/5 text-muted hover:bg-white/10 hover:text-secondary"
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Type & Difficulty Row */}
        <div className="flex flex-wrap items-center justify-between gap-4 pt-2">
          {/* Type chips */}
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="text-xs font-medium text-muted mr-1">Type:</span>
            {types.map((t) => (
              <button
                key={t.id}
                type="button"
                aria-pressed={selectedType === t.id}
                onClick={() => setSelectedType(t.id)}
                className={`min-h-[44px] rounded-md px-2.5 py-0.5 text-xs transition-colors ${
                  selectedType === t.id
                    ? "bg-[#38BDF8]/20 text-accent border border-[#38BDF8]/40"
                    : "bg-white/[0.03] text-muted hover:text-secondary border border-transparent"
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>

          {/* Difficulty selector */}
          <div className="flex items-center gap-2">
            <span className="text-xs font-medium text-muted">Difficulty:</span>
            <select
              aria-label="Resource difficulty"
              value={selectedDifficulty}
              onChange={(e) => setSelectedDifficulty(e.target.value)}
              className="min-h-[36px] rounded-lg border border-white/10 bg-black px-2.5 py-1 text-xs text-secondary focus:border-[#38BDF8] focus:outline-none"
            >
              <option value="all">All Difficulties</option>
              <option value="beginner">Beginner</option>
              <option value="intermediate">Intermediate</option>
              <option value="advanced">Advanced</option>
            </select>
          </div>
        </div>
      </div>

      {/* Results Header */}
      <div className="mb-4 flex items-center justify-between">
        <span className="text-xs text-muted" role="status" aria-live="polite">
          Showing <span className="font-semibold text-foreground">{filteredItems.length}</span> of {initialItems.length} verified building blocks
        </span>
        {(selectedCategory !== "all" || selectedType !== "all" || selectedDifficulty !== "all" || searchQuery) && (
          <button
            type="button"
            onClick={() => {
              setSearchQuery("");
              setSelectedCategory("all");
              setSelectedType("all");
              setSelectedDifficulty("all");
            }}
            className="text-xs text-accent hover:underline"
          >
            Reset all filters
          </button>
        )}
      </div>

      {/* Cards Grid */}
      {filteredItems.length > 0 ? (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {filteredItems.map((item) => (
            <ResourceCard key={item.id} resource={item} />
          ))}
        </div>
      ) : (
        <div className="rounded-xl border border-dashed border-white/10 p-12 text-center">
          <p className="text-sm font-medium text-secondary">No building blocks found</p>
          <p className="mt-1 text-xs text-muted">
            Try adjusting your search terms or resetting the active filters.
          </p>
        </div>
      )}
    </div>
  );
}
