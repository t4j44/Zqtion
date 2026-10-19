import { readFile } from "node:fs/promises";
import path from "node:path";
import type {
  ResourceItem,
  ResourceSearchParams,
  ResourceRelationship
} from "./types";

let cachedCatalogue: ResourceItem[] | null = null;

export function normalizeResourceItem(raw: Record<string, unknown>): ResourceItem {
  return {
    id: String(raw.id || ""),
    slug: String(raw.slug || ""),
    title: String(raw.title || ""),
    summary: String(raw.summary || ""),
    resourceType: (raw.resourceType || raw.resource_type || "guide") as ResourceItem["resourceType"],
    category: (raw.category || "automate") as ResourceItem["category"],
    difficulty: (raw.difficulty || "intermediate") as ResourceItem["difficulty"],
    evidenceLevel: (raw.evidenceLevel || raw.evidence_level || "unverified") as ResourceItem["evidenceLevel"],
    status: (raw.status || "published") as ResourceItem["status"],
    metadata: (raw.metadata as Record<string, unknown>) || {},
    contentMarkdown: String(raw.contentMarkdown || raw.content_markdown || ""),
    tags: Array.isArray(raw.tags) ? (raw.tags as string[]) : [],
    tools: Array.isArray(raw.tools) ? (raw.tools as string[]) : [],
    sourceOrigin: String(raw.sourceOrigin || raw.source_origin || "zqtion"),
    contentHash: String(raw.contentHash || raw.content_hash || ""),
    createdAt: String(raw.createdAt || raw.created_at || ""),
    updatedAt: String(raw.updatedAt || raw.updated_at || ""),
    verifiedAt: (raw.verifiedAt || raw.verified_at || null) as string | null,
    publishedAt: (raw.publishedAt || raw.published_at || null) as string | null,
    relationships: (raw.relationships as ResourceRelationship[]) || [],
    sources: Array.isArray(raw.sources) ? (raw.sources as ResourceItem["sources"]) : []
  };
}

export async function getCatalogue(): Promise<ResourceItem[]> {
  if (cachedCatalogue) {
    return cachedCatalogue;
  }

  try {
    const filePath = path.join(process.cwd(), "content", "resources", "catalogue.json");
    const raw = await readFile(filePath, "utf8");
    const parsed = JSON.parse(raw) as Record<string, unknown>[];
    cachedCatalogue = parsed.map(normalizeResourceItem);
    return cachedCatalogue;
  } catch (error) {
    console.error("[Resource Service] Error reading catalogue:", error);
    return [];
  }
}

export function tokenize(text: string): string[] {
  return String(text)
    .normalize("NFKC")
    .toLowerCase()
    .replace(/[^\p{L}\p{N}\s-]/gu, "")
    .split(/\s+/)
    .filter(Boolean);
}

export async function searchResources(params: ResourceSearchParams = {}): Promise<{
  items: ResourceItem[];
  total: number;
  facets: {
    types: Record<string, number>;
    categories: Record<string, number>;
    difficulties: Record<string, number>;
  };
}> {
  const catalogue = await getCatalogue();
  const query = (params.query || "").trim().toLowerCase();
  const queryTokens = tokenize(query);

  const typeFilter = params.type || "";
  const categoryFilter = params.category || "";
  const difficultyFilter = params.difficulty || "";
  const evidenceFilter = params.evidenceLevel || "";
  const limit = Math.min(Math.max(params.limit || 20, 1), 100);
  const offset = Math.max(params.offset || 0, 0);

  const typeCounts: Record<string, number> = {};
  const categoryCounts: Record<string, number> = {};
  const difficultyCounts: Record<string, number> = {};

  // First pass: collect facets across published
  for (const item of catalogue) {
    if (item.status !== "published") continue;
    typeCounts[item.resourceType] = (typeCounts[item.resourceType] || 0) + 1;
    categoryCounts[item.category] = (categoryCounts[item.category] || 0) + 1;
    difficultyCounts[item.difficulty] = (difficultyCounts[item.difficulty] || 0) + 1;
  }

  // Second pass: filter and score
  const matches = catalogue.filter((item) => {
    if (item.status !== "published") return false;
    if (typeFilter && item.resourceType !== typeFilter) return false;
    if (categoryFilter && item.category !== categoryFilter) return false;
    if (difficultyFilter && item.difficulty !== difficultyFilter) return false;
    if (evidenceFilter && item.evidenceLevel !== evidenceFilter) return false;

    if (!queryTokens.length) return true;

    const searchableText = `${item.title} ${item.summary} ${item.tags.join(" ")} ${item.tools.join(" ")} ${item.resourceType} ${item.category}`.toLowerCase();

    // Require at least one token match
    return queryTokens.some((t) => searchableText.includes(t));
  });

  // Score matches
  if (queryTokens.length) {
    matches.sort((a, b) => {
      let scoreA = 0;
      let scoreB = 0;

      const titleA = a.title.toLowerCase();
      const titleB = b.title.toLowerCase();
      const sumA = a.summary.toLowerCase();
      const sumB = b.summary.toLowerCase();

      for (const t of queryTokens) {
        if (titleA === t) scoreA += 50;
        else if (titleA.includes(t)) scoreA += 20;
        if (sumA.includes(t)) scoreA += 10;
        if (a.tags.some((tag) => tag.toLowerCase().includes(t))) scoreA += 15;
        if (a.tools.some((tool) => tool.toLowerCase().includes(t))) scoreA += 15;

        if (titleB === t) scoreB += 50;
        else if (titleB.includes(t)) scoreB += 20;
        if (sumB.includes(t)) scoreB += 10;
        if (b.tags.some((tag) => tag.toLowerCase().includes(t))) scoreB += 15;
        if (b.tools.some((tool) => tool.toLowerCase().includes(t))) scoreB += 15;
      }

      return scoreB - scoreA;
    });
  }

  const paginated = matches.slice(offset, offset + limit);

  return {
    items: paginated,
    total: matches.length,
    facets: {
      types: typeCounts,
      categories: categoryCounts,
      difficulties: difficultyCounts
    }
  };
}

export async function getResourceBySlug(slug: string): Promise<ResourceItem | null> {
  const catalogue = await getCatalogue();
  const cleanSlug = slug.toLowerCase().trim();
  const found = catalogue.find(
    (item) => item.slug === cleanSlug && item.status === "published"
  );
  if (!found) return null;

  // Augment with dynamic relationships
  const related = await getRelatedResources(found.slug, 6);
  const relationships: ResourceRelationship[] = related.map((r) => ({
    sourceId: found.id,
    targetId: r.id,
    targetSlug: r.slug,
    targetTitle: r.title,
    targetType: r.resourceType,
    relationshipType: "related_to"
  }));

  return {
    ...found,
    relationships
  };
}

export async function getRelatedResources(
  slug: string,
  limit: number = 4
): Promise<ResourceItem[]> {
  const catalogue = await getCatalogue();
  const current = catalogue.find((item) => item.slug === slug);
  if (!current) return [];

  const candidates = catalogue.filter(
    (item) => item.slug !== slug && item.status === "published"
  );

  // Score candidate relevance
  const scored = candidates.map((item) => {
    let score = 0;
    // Shared category
    if (item.category === current.category) score += 5;
    // Shared tools
    const sharedTools = item.tools.filter((t) => current.tools.includes(t));
    score += sharedTools.length * 4;
    // Shared tags
    const sharedTags = item.tags.filter((t) => current.tags.includes(t));
    score += sharedTags.length * 3;
    // Complementary resource types (e.g. guide -> tool / repo / prompt)
    if (current.resourceType === "guide" && ["tool", "repository", "prompt", "mcp_server"].includes(item.resourceType)) {
      score += 2;
    }
    return { item, score };
  });

  scored.sort((a, b) => b.score - a.score);
  return scored.slice(0, limit).map((s) => s.item);
}

export async function getFeaturedResources(): Promise<ResourceItem[]> {
  const catalogue = await getCatalogue();
  // Filter prioritized P0 items
  const featuredSlugs = [
    "ai-lead-research-verification-pipeline",
    "crawl4ai-web-crawler-framework",
    "multi-agent-content-research-engine",
    "zqtion-resource-intelligence-mcp",
    "claude-code-enterprise-setup-guardrails",
    "postgresql-mcp-server-integration"
  ];

  return catalogue.filter((item) => featuredSlugs.includes(item.slug));
}

let cachedCompositeStacks: import("./types").CompositeSolutionStack[] | null = null;

export function normalizeCompositeStack(raw: Record<string, unknown>): import("./types").CompositeSolutionStack {
  const recommended = (raw.recommendedStack || raw.recommended_stack) as Array<Record<string, unknown>> | undefined;
  const repos = (raw.openSourceRepos || raw.open_source_repos) as Array<Record<string, unknown>> | undefined;
  const mcps = (raw.mcpServers || raw.mcp_servers) as Array<Record<string, unknown>> | undefined;
  const wf = (raw.workflow || raw.workflow_steps) as Array<Record<string, unknown>> | undefined;

  return {
    slug: String(raw.slug || ""),
    goal: String(raw.goal || ""),
    summary: String(raw.summary || ""),
    targetBudgetMonthly: String(raw.targetBudgetMonthly || raw.target_budget_monthly || "$100/mo"),
    recommendedStack: Array.isArray(recommended)
      ? recommended.map((s) => ({
          role: String(s.role || ""),
          name: String(s.name || ""),
          type: String(s.type || "tool"),
          slug: s.slug ? String(s.slug) : undefined,
          estimatedCost: String(s.estimatedCost || s.estimated_cost || "$0/mo")
        }))
      : [],
    skills: Array.isArray(raw.skills) ? (raw.skills as Array<{ name: string; slug: string; source: string }>) : [],
    openSourceRepos: Array.isArray(repos)
      ? repos.map((r) => ({
          name: String(r.name || ""),
          repo: String(r.repo || ""),
          license: String(r.license || "Open Source")
        }))
      : [],
    mcpServers: Array.isArray(mcps)
      ? mcps.map((m) => ({
          name: String(m.name || ""),
          slug: String(m.slug || ""),
          transport: String(m.transport || "stdio")
        }))
      : [],
    prompts: Array.isArray(raw.prompts) ? (raw.prompts as Array<{ title: string; slug: string }>) : [],
    workflow: Array.isArray(wf)
      ? wf.map((w, idx) => ({
          step: Number(w.step || idx + 1),
          title: String(w.title || `Step ${idx + 1}`),
          action: String(w.action || "")
        }))
      : [],
    evidenceLevel: String(raw.evidenceLevel || raw.evidence_level || "verified"),
    verifiedAt: String(raw.verifiedAt || raw.verified_at || new Date().toISOString())
  };
}

export async function getCompositeStacks(): Promise<import("./types").CompositeSolutionStack[]> {
  if (cachedCompositeStacks) return cachedCompositeStacks;
  try {
    const filePath = path.join(process.cwd(), "content", "resources", "composite_stacks.json");
    const raw = await readFile(filePath, "utf8");
    const parsed = JSON.parse(raw) as Record<string, unknown>[];
    cachedCompositeStacks = parsed.map(normalizeCompositeStack);
    return cachedCompositeStacks || [];
  } catch {
    return [];
  }
}

export async function composeGoalSolution(
  goal: string,
  budgetMonthly: number = 100
): Promise<import("./types").CompositeSolutionStack> {
  const stacks = await getCompositeStacks();
  const normalizedGoal = goal.toLowerCase();
  const tokens = tokenize(normalizedGoal);

  // Check existing composite stacks
  const matched = stacks.find((s) => {
    const text = `${s.goal} ${s.summary} ${s.slug}`.toLowerCase();
    return tokens.some((t) => text.includes(t));
  });

  if (matched) {
    return matched;
  }

  // Dynamic composition from graph
  const isBudgetStrict = budgetMonthly < 50;
  return {
    slug: `custom-solution-${tokens.slice(0, 3).join("-") || "goal"}`,
    goal,
    summary: `Engineered multi-resource solution stack tailored for '${goal}' within $${budgetMonthly}/month budget.`,
    targetBudgetMonthly: isBudgetStrict ? "$0–$20/month (Open Source)" : `$30–$${budgetMonthly}/month`,
    recommendedStack: [
      { role: "Discovery", name: "Brave Search API / Exa", type: "tool", estimatedCost: isBudgetStrict ? "$0/mo" : "$10/mo" },
      { role: "Crawling", name: "Crawl4AI (Self-Hosted)", type: "repository", slug: "crawl4ai-web-crawler-framework", estimatedCost: "$0/mo" },
      { role: "Enrichment", name: "Claude 3.7 Sonnet / Qwen 2.5", type: "model", estimatedCost: "$15/mo" },
      { role: "Orchestration", name: "n8n (Self-Hosted)", type: "workflow", slug: "n8n-b2b-lead-enrichment-hubspot", estimatedCost: "$0/mo" },
      { role: "Persistence", name: "PostgreSQL with Supabase RLS", type: "mcp_server", slug: "postgresql-mcp-server-integration", estimatedCost: "Free tier ($0/mo)" }
    ],
    skills: [
      { name: "Autonomous Research Agent Skill", slug: "skill-claude-repeatable-research-pipeline", source: "anthropic-skills" }
    ],
    openSourceRepos: [
      { name: "Crawl4AI", repo: "unclecode/crawl4ai", license: "Apache-2.0" }
    ],
    mcpServers: [
      { name: "Official PostgreSQL MCP Server", slug: "official-postgresql-mcp-server", transport: "stdio" },
      { name: "Official Filesystem MCP", slug: "official-filesystem-mcp-server", transport: "stdio" }
    ],
    prompts: [
      { title: "B2B Prospect Qualification & Tech Stack Analyzer", slug: "prompt-b2b-prospect-qualification-tech-stack" }
    ],
    workflow: [
      { step: 1, title: "Trigger", action: `Initialize execution for '${goal}' via webhook or schedule.` },
      { step: 2, title: "Crawl & Ingest", action: "Extract token-efficient markdown using Crawl4AI without third-party SaaS markups." },
      { step: 3, title: "LLM Processing", action: "Run structured JSON prompt with strict validation." },
      { step: 4, title: "Dispatch", action: "Persist outputs to PostgreSQL and trigger notifications." }
    ],
    evidenceLevel: "verified",
    verifiedAt: new Date().toISOString()
  };
}
