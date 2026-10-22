"use client";

import { useState } from "react";
import Link from "next/link";

interface StackItem {
  name: string;
  role: string;
  estimatedCost: string;
  tradeoffs: string;
}

interface AssistantResponse {
  answer?: string;
  verified_at?: string;
  resources?: Array<{
    recommendedStack?: StackItem[];
    totalEstimatedMonthlyCost?: string;
    relatedGuideSlug?: string;
  }>;
}

export function AskZqtionAssistant() {
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [response, setResponse] = useState<AssistantResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  const sampleQuestions = [
    "I want to automatically research 100 potential clients and verify their websites. What should I use?",
    "How can I build an automated AI content research pipeline for under $30/month?",
    "Which MCP server should I use to connect PostgreSQL with Claude Code safely?"
  ];

  const handleAsk = async (questionText: string) => {
    if (!questionText.trim()) return;
    setLoading(true);
    setError(null);
    setResponse(null);

    try {
      const res = await fetch("/api/resources/mcp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          tool: "recommend_stack",
          args: {
            task: questionText,
            budgetMonthly: 50,
            experienceLevel: "intermediate"
          }
        })
      });

      if (!res.ok) {
        throw new Error(`Assistant query failed (${res.status})`);
      }

      const json = await res.json();
      setResponse((json?.result?.structured || json?.result) as AssistantResponse);
    } catch (err: unknown) {
      console.error("Ask Zqtion error:", err);
      const message = err instanceof Error ? err.message : "Failed to retrieve recommendation";
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative overflow-hidden rounded-2xl border border-[var(--line)] bg-surface p-6 lg:p-8">
      <div className="max-w-2xl">
        <div className="mb-2 inline-flex items-center gap-2 rounded-full border border-sky-500/20 bg-sky-500/10 px-3 py-1 text-xs font-medium text-accent">
          <span className="h-1.5 w-1.5 rounded-full bg-sky-400 animate-pulse" />
          <span>Natural Language Assistant</span>
        </div>
        <h2 className="mb-2 text-2xl font-bold tracking-tight text-foreground lg:text-3xl">
          Ask Zqtion Resource Intelligence
        </h2>
        <p className="mb-6 text-sm text-muted leading-relaxed">
          Describe what you want to build or automate. Explore illustrative tools, repositories, prompts and connector plans. Compatibility, outcomes and budget fit require your review.
        </p>
      </div>

      {/* Input bar */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleAsk(query);
        }}
        className="mb-4 flex flex-col sm:flex-row gap-3"
      >
        <div className="relative flex-1">
          <input
            type="text"
            aria-label="Describe what you want to build or automate"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="e.g. I run a 3-person agency and want to automate lead research for less than $50/mo..."
            className="w-full min-h-[48px] rounded-xl border border-white/10 bg-black/50 px-4 py-2.5 text-sm text-foreground placeholder-zinc-500 focus:border-[#38BDF8] focus:outline-none focus:ring-1 focus:ring-[#38BDF8]"
          />
        </div>
        <button
          type="submit"
          disabled={loading || !query.trim()}
          className="inline-flex min-h-[48px] items-center justify-center rounded-xl bg-white px-6 py-2.5 text-sm font-semibold text-black transition-all hover:bg-zinc-200 disabled:opacity-50 disabled:pointer-events-none focus:outline-none focus:ring-2 focus:ring-[#38BDF8]"
        >
          {loading ? "Analyzing..." : "Ask Zqtion"}
        </button>
      </form>

      {/* Sample question chips */}
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-xs text-muted">Try asking:</span>
        {sampleQuestions.map((q, idx) => (
          <button
            key={idx}
            type="button"
            onClick={() => {
              setQuery(q);
              handleAsk(q);
            }}
            className="rounded-lg border border-white/5 bg-white/[0.02] px-2.5 py-1 text-xs text-muted hover:border-white/20 hover:text-foreground transition-colors text-left"
          >
            {q.length > 55 ? `${q.slice(0, 55)}...` : q}
          </button>
        ))}
      </div>

      {/* Error state */}
      {error && (
        <div role="alert" className="mt-6 rounded-xl border border-red-900/40 bg-red-950/20 p-4 text-xs text-error">
          {error}
        </div>
      )}

      {/* Structured Recommendation Result */}
      {response && (
        <div className="mt-8 rounded-xl border border-[#38BDF8]/30 bg-surface p-6 animate-in fade-in duration-300">
          <div className="mb-4 flex items-center justify-between border-b border-white/10 pb-3">
            <h3 className="text-base font-semibold text-foreground">
              {response.answer || "Recommended Execution Stack"}
            </h3>
            <span className="text-xs font-mono text-success">
              Evidence: implementation unverified
            </span>
          </div>

          {/* Stack items */}
          {response.resources?.[0]?.recommendedStack && (
            <div className="mb-6 space-y-3">
              <h4 className="text-xs font-medium uppercase tracking-wider text-muted">
                Recommended Components
              </h4>
              <div className="grid gap-3 sm:grid-cols-3">
                {response.resources[0].recommendedStack.map((item: StackItem, i: number) => (
                  <div key={i} className="rounded-lg border border-white/10 bg-white/[0.03] p-3.5">
                    <div className="mb-1 text-xs font-semibold text-accent">{item.name}</div>
                    <div className="mb-2 text-xs text-muted">{item.role}</div>
                    <div className="text-[11px] font-mono text-success">Cost: {item.estimatedCost}</div>
                    <p className="mt-1.5 text-[11px] text-muted leading-normal">{item.tradeoffs}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Cost and Guide Link */}
          <div className="flex flex-wrap items-center justify-between gap-4 rounded-lg bg-white/[0.02] p-3 border border-white/5">
            <div>
              <span className="text-xs text-muted">Estimated Total Cost: </span>
              <span className="text-xs font-bold text-foreground">
                {response.resources?.[0]?.totalEstimatedMonthlyCost || "Not estimated"}
              </span>
            </div>
            {response.resources?.[0]?.relatedGuideSlug && (
              <Link
                href={`/resources/guide/${response.resources[0].relatedGuideSlug}`}
                className="text-xs font-semibold text-accent hover:underline"
              >
                Read Complete Implementation Guide &rarr;
              </Link>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
