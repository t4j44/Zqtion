"use client";

import Link from "next/link";
import type { ResourceItem } from "@/lib/resources/types";

interface ResourceCardProps {
  resource: ResourceItem;
}

export function ResourceCard({ resource }: ResourceCardProps) {
  const {
    slug,
    title,
    summary,
    resourceType,
    category,
    difficulty,
    evidenceLevel,
    tools
  } = resource;

  const typeLabels: Record<string, string> = {
    guide: "Guide",
    prompt: "Prompt",
    skill: "Agent Skill",
    tool: "AI Tool",
    repository: "Repository",
    mcp_server: "MCP Server",
    workflow: "Workflow",
    case_study: "Case Study",
    use_case: "Use Case"
  };

  const evidenceBadges: Record<string, { label: string; className: string }> = {
    verified: {
      label: "Verified Source",
      className: "bg-emerald-950/60 text-emerald-400 border-emerald-800/60"
    },
    zqtion_tested: {
      label: "Zqtion Tested",
      className: "bg-sky-950/60 text-sky-400 border-sky-800/60"
    },
    source_reported: {
      label: "Source Reported",
      className: "bg-amber-950/60 text-amber-400 border-amber-800/60"
    },
    community_reported: {
      label: "Community",
      className: "bg-purple-950/60 text-purple-400 border-purple-800/60"
    },
    unverified: {
      label: "Unverified Draft",
      className: "bg-zinc-900 text-zinc-400 border-zinc-800"
    }
  };

  const badge = evidenceBadges[evidenceLevel] || evidenceBadges.unverified;
  const detailUrl = `/resources/${resourceType}/${slug}`;

  return (
    <div className="group relative flex flex-col justify-between rounded-xl border border-[#22242C] bg-[#121316] p-6 transition-all duration-200 hover:-translate-y-0.5 hover:border-[#38BDF8]/40 hover:shadow-lg hover:shadow-[#38BDF8]/5">
      <div>
        {/* Top Badges */}
        <div className="mb-3 flex flex-wrap items-center gap-2">
          <span className="rounded-md bg-white/5 px-2.5 py-1 text-xs font-medium uppercase tracking-wider text-zinc-300 border border-white/10">
            {typeLabels[resourceType] || resourceType}
          </span>
          <span className="rounded-md bg-white/5 px-2.5 py-1 text-xs font-medium uppercase tracking-wider text-zinc-400">
            {category}
          </span>
          <span className={`ml-auto rounded-full border px-2.5 py-0.5 text-[11px] font-medium ${badge.className}`}>
            {badge.label}
          </span>
        </div>

        {/* Title */}
        <h3 className="mb-2 text-lg font-semibold tracking-tight text-white group-hover:text-[#38BDF8] transition-colors">
          <Link href={detailUrl} className="focus:outline-none focus:underline">
            {title}
          </Link>
        </h3>

        {/* Summary */}
        <p className="mb-4 text-sm leading-relaxed text-zinc-400 line-clamp-3">
          {summary}
        </p>
      </div>

      <div>
        {/* Tools and Tags */}
        {tools && tools.length > 0 && (
          <div className="mb-4 flex flex-wrap gap-1.5 pt-2 border-t border-white/5">
            {tools.slice(0, 3).map((tool) => (
              <span
                key={tool}
                className="rounded bg-black/40 px-2 py-0.5 text-[11px] font-mono text-zinc-400 border border-white/5"
              >
                {tool}
              </span>
            ))}
            {tools.length > 3 && (
              <span className="px-1 text-[11px] text-zinc-500">
                +{tools.length - 3} more
              </span>
            )}
          </div>
        )}

        {/* Bottom Actions */}
        <div className="flex items-center justify-between pt-2">
          <span className="text-xs text-zinc-500 capitalize">
            {difficulty} difficulty
          </span>
          <Link
            href={detailUrl}
            className="inline-flex items-center gap-1 text-xs font-semibold text-[#38BDF8] hover:text-[#60A5FA] transition-colors"
          >
            <span>View Architecture</span>
            <svg
              className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </Link>
        </div>
      </div>
    </div>
  );
}
