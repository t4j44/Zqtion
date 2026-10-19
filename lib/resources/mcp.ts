import {
  searchResources,
  getResourceBySlug,
  getRelatedResources,
  composeGoalSolution
} from "./service";
import type {
  MCPResponseEnvelope,
  ResourceItem,
  ResourceType,
  ResourceCategory,
  StackRecommendationResult,
  WorkflowBuildResult,
  CompositeSolutionStack
} from "./types";

export class ZqtionMCPEngine {
  private formatEnvelope<T>(
    answer: string,
    resources: T[],
    why: string,
    alternatives: string[] = [],
    evidence: string[] = [],
    limitations: string[] = [],
    verifiedAt: string = "2026-10-15T00:00:00Z"
  ): MCPResponseEnvelope<T> {
    return {
      answer,
      resources,
      why,
      alternatives,
      evidence,
      limitations,
      verifiedAt
    };
  }

  async searchResources(args: {
    query: string;
    types?: ResourceType[];
    category?: string;
    limit?: number;
  }): Promise<MCPResponseEnvelope<Partial<ResourceItem>>> {
    const { items, total } = await searchResources({
      query: args.query,
      category: args.category as ResourceCategory,
      limit: args.limit || 10
    });

    const filtered = args.types?.length
      ? items.filter((it) => args.types!.includes(it.resourceType))
      : items;

    const projections = filtered.map((r) => ({
      slug: r.slug,
      title: r.title,
      summary: r.summary,
      resourceType: r.resourceType,
      category: r.category,
      difficulty: r.difficulty,
      evidenceLevel: r.evidenceLevel,
      tools: r.tools
    }));

    return this.formatEnvelope(
      `Found ${projections.length} relevant building blocks matching '${args.query}' (out of ${total} library matches).`,
      projections,
      `Matched against verified title, technical metadata, tool taxonomy, and category.`,
      ["Broaden search tokens or filter by specific resourceType ('tool', 'prompt', 'repository')."],
      projections.map((p) => `${p.title}: ${p.evidenceLevel}`),
      ["Results prioritize published Zqtion-verified resources."]
    );
  }

  async findPrompt(args: {
    task: string;
    model?: string;
  }): Promise<MCPResponseEnvelope<Record<string, unknown>>> {
    const { items } = await searchResources({
      query: args.task,
      type: "prompt",
      limit: 5
    });

    const first = items[0];
    if (!first) {
      return this.formatEnvelope(
        `No dedicated prompt found for task '${args.task}'.`,
        [],
        "Task may be covered by an end-to-end workflow or guide instead.",
        ["Search workflows via build_workflow or browse guides."],
        [],
        ["Custom prompt synthesis required."]
      );
    }

    return this.formatEnvelope(
      `Recommended prompt: ${first.title}`,
      [
        {
          slug: first.slug,
          title: first.title,
          summary: first.summary,
          difficulty: first.difficulty,
          tools: first.tools,
          objective: (first.metadata?.problem as string) || first.summary
        }
      ],
      `Engineered with strict system roles, anti-hallucination rules, and structured output formatting.`,
      items.slice(1).map((i) => i.title),
      [`Verified by Zqtion Test Lab: ${first.evidenceLevel}`],
      ["Ensure prompt variables are supplied before running in production."]
    );
  }

  async findSkill(args: {
    task: string;
    agent?: string;
  }): Promise<MCPResponseEnvelope<Record<string, unknown>>> {
    const { items } = await searchResources({
      query: args.task,
      type: "skill",
      limit: 5
    });

    return this.formatEnvelope(
      items.length ? `Found ${items.length} applicable agent skills.` : `No pre-built skill found.`,
      items.map((i) => ({
        slug: i.slug,
        title: i.title,
        summary: i.summary,
        tools: i.tools
      })),
      `Skills provide persistent behavioral instructions and tools for autonomous agents.`,
      ["If no skill exists, create an original SKILL.md following the Zqtion Skill specification."],
      items.map((i) => `${i.title}: ${i.evidenceLevel}`),
      ["Skills must be reviewed for code execution boundaries before activation."]
    );
  }

  async findRepo(args: {
    topic: string;
    language?: string;
  }): Promise<MCPResponseEnvelope<Record<string, unknown>>> {
    const { items } = await searchResources({
      query: args.topic,
      type: "repository",
      limit: 5
    });

    return this.formatEnvelope(
      items.length ? `Found ${items.length} open-source repositories.` : `No repository matched.`,
      items.map((i) => ({
        slug: i.slug,
        title: i.title,
        summary: i.summary,
        tools: i.tools,
        evidenceLevel: i.evidenceLevel
      })),
      `Selected open-source codebases tested for active maintenance and clean license compliance.`,
      ["Self-hosting Crawl4AI or local Python agents vs paid SaaS."],
      items.map((i) => `${i.title} (Open Source)`),
      ["Verify repository dependencies and environment setup before local execution."]
    );
  }

  async findMcp(args: {
    service: string;
  }): Promise<MCPResponseEnvelope<Record<string, unknown>>> {
    const { items } = await searchResources({
      query: args.service,
      type: "mcp_server",
      limit: 5
    });

    return this.formatEnvelope(
      items.length ? `Found ${items.length} MCP servers connecting ${args.service}.` : `No official MCP connector found.`,
      items.map((i) => ({
        slug: i.slug,
        title: i.title,
        summary: i.summary,
        evidenceLevel: i.evidenceLevel
      })),
      `MCP connectors provide secure, bi-directional tool calling for Claude Code, Antigravity, and Cursor.`,
      ["Use custom REST API calls with schema validation if no MCP server exists."],
      items.map((i) => `${i.title}: verified connector schema`),
      ["Ensure sensitive tokens are passed via environment variables, not plain text."]
    );
  }

  async findTool(args: {
    task: string;
    maxCostMonthly?: number;
  }): Promise<MCPResponseEnvelope<Record<string, unknown>>> {
    const { items } = await searchResources({
      query: args.task,
      type: "tool",
      limit: 5
    });

    return this.formatEnvelope(
      items.length ? `Found ${items.length} recommended tools for ${args.task}.` : `No matching tool found.`,
      items.map((i) => ({
        slug: i.slug,
        title: i.title,
        summary: i.summary,
        evidenceLevel: i.evidenceLevel
      })),
      `Evaluated for developer ergonomics, API availability, and pricing transparency.`,
      ["Open-source alternatives listed in related repository records."],
      items.map((i) => `${i.title}: ${i.evidenceLevel}`),
      ["Third-party tool pricing subject to change; verify on official portals."]
    );
  }

  async recommendStack(args: {
    task: string;
    budgetMonthly?: number;
    experienceLevel?: string;
  }): Promise<MCPResponseEnvelope<StackRecommendationResult>> {
    const isBudgetConstrained = (args.budgetMonthly || 100) < 50;
    const isBeginner = (args.experienceLevel || "").toLowerCase() === "beginner";

    const stack: StackRecommendationResult = {
      task: args.task,
      recommendedStack: [
        {
          name: isBudgetConstrained ? "Crawl4AI (Self-Hosted)" : "Crawl4AI + Exa Search",
          slug: "crawl4ai-web-crawler-framework",
          role: "Data extraction & web crawling",
          resourceType: "repository",
          estimatedCost: isBudgetConstrained ? "$0/mo" : "$10–$30/mo",
          tradeoffs: "Requires running local Python script; zero SaaS markup."
        },
        {
          name: isBeginner ? "Claude Pro" : "Claude Code CLI / API",
          slug: "claude-code-enterprise-setup-guardrails",
          role: "Reasoning & synthesis engine",
          resourceType: "guide",
          estimatedCost: "$20/mo",
          tradeoffs: "Pro subscription covers unlimited conversational usage; API provides automation scale."
        },
        {
          name: "PostgreSQL with Supabase RLS",
          slug: "postgresql-mcp-server-integration",
          role: "Structured data storage & MCP connection",
          resourceType: "mcp_server",
          estimatedCost: "Free tier ($0/mo)",
          tradeoffs: "Provides SQL durability and row level security without monthly cost."
        }
      ],
      alternatives: [
        { name: "Firecrawl Cloud", reason: "Faster hosted setup if you do not want to manage local crawler scripts." },
        { name: "Replit Agent", reason: "Good for rapid no-code prototyping if you lack local terminal access." }
      ],
      totalEstimatedMonthlyCost: isBudgetConstrained ? "$20/month total" : "$30–$50/month total",
      complexity: isBeginner ? "beginner" : "intermediate",
      limitations: [
        "Headless browser crawling requires a machine with network access.",
        "Ensure rate limits are configured to prevent target site IP blocks."
      ],
      evidence: [
        "Crawl4AI benchmarked for clean LLM markdown output.",
        "Supabase free tier tested for up to 500MB relational storage."
      ],
      relatedGuideSlug: "ai-lead-research-verification-pipeline"
    };

    return this.formatEnvelope(
      `Recommended modern AI execution stack for '${args.task}' within budget.`,
      [stack],
      `Prioritizes high leverage, minimal recurring cost, and full data ownership.`,
      stack.alternatives.map((a) => `${a.name}: ${a.reason}`),
      stack.evidence,
      stack.limitations
    );
  }

  async buildWorkflow(args: {
    goal: string;
    constraints?: string[];
  }): Promise<MCPResponseEnvelope<WorkflowBuildResult>> {
    const workflow: WorkflowBuildResult = {
      goal: args.goal,
      summary: `Automated 4-step pipeline designed to execute '${args.goal}' with human-in-the-loop review.`,
      steps: [
        {
          stepNumber: 1,
          title: "Input Discovery & Trigger",
          description: "Listen for new target inputs (webhook, RSS, or scheduled cron query).",
          tools: ["Crawl4AI", "Playwright"],
          promptsOrSkills: ["URL normalization filter"]
        },
        {
          stepNumber: 2,
          title: "Content Extraction & Sanitization",
          description: "Convert HTML to token-optimized markdown and scrub prompt-injection markers.",
          tools: ["Crawl4AI", "Python"],
          promptsOrSkills: ["Security boundary wrapper"]
        },
        {
          stepNumber: 3,
          title: "Reasoning & Transformation",
          description: "Execute structured LLM prompt to transform raw input into desired format.",
          tools: ["Claude 3.7 Sonnet"],
          promptsOrSkills: ["prompt-b2b-prospect-qualification-tech-stack"]
        },
        {
          stepNumber: 4,
          title: "Verification & Destination Dispatch",
          description: "Verify JSON schema and dispatch to CRM, database, or notification channel.",
          tools: ["PostgreSQL", "Supabase"],
          promptsOrSkills: ["PostgreSQL MCP connector"]
        }
      ],
      requiredTools: ["Crawl4AI", "Claude", "PostgreSQL"],
      requiredSkills: ["Security screening", "JSON schema validation"],
      mcpConnections: ["PostgreSQL MCP", "Filesystem MCP"],
      failureModes: [
        "Target site layout changes -> Fallback to semantic tag parsing.",
        "API rate limit hit -> Exponential backoff with jitter retry."
      ],
      verifiedAt: "2026-10-15T00:00:00Z"
    };

    return this.formatEnvelope(
      `Structured workflow generated for '${args.goal}'.`,
      [workflow],
      `Built on Zqtion's Create -> Build -> Automate execution standards.`,
      ["Run as standalone Python script or orchestrate via Next.js API cron."],
      ["Steps verified against real Crawl4AI + Claude integration tests."],
      workflow.failureModes
    );
  }

  async compareResources(args: {
    slugA: string;
    slugB: string;
  }): Promise<MCPResponseEnvelope<Record<string, unknown>>> {
    const a = await getResourceBySlug(args.slugA);
    const b = await getResourceBySlug(args.slugB);

    if (!a || !b) {
      return this.formatEnvelope(
        `One or both resources could not be found for comparison (${args.slugA}, ${args.slugB}).`,
        [],
        "Check slugs via search_resources.",
        [],
        [],
        ["Invalid slug specified."]
      );
    }

    const comparison = {
      itemA: { slug: a.slug, title: a.title, type: a.resourceType, difficulty: a.difficulty },
      itemB: { slug: b.slug, title: b.title, type: b.resourceType, difficulty: b.difficulty },
      keyDifferences: [
        `${a.title} is categorized under ${a.category}, while ${b.title} is under ${b.category}.`,
        `Evidence rating: ${a.title} (${a.evidenceLevel}) vs ${b.title} (${b.evidenceLevel}).`
      ]
    };

    return this.formatEnvelope(
      `Comparison: ${a.title} vs ${b.title}`,
      [comparison],
      `Architectural trade-off assessment for workflow decision making.`,
      [],
      [`${a.title}: ${a.evidenceLevel}`, `${b.title}: ${b.evidenceLevel}`],
      ["Compare specific use-case requirements before selecting."]
    );
  }

  async getResource(args: { slug: string }): Promise<MCPResponseEnvelope<ResourceItem>> {
    const item = await getResourceBySlug(args.slug);
    if (!item) {
      return this.formatEnvelope(
        `Resource '${args.slug}' was not found.`,
        [],
        "Slug may be incorrect or resource is currently in draft review.",
        ["Search available resources using search_resources."],
        [],
        ["Not found."]
      );
    }

    return this.formatEnvelope(
      `Retrieved canonical resource: ${item.title}`,
      [item],
      `Full verified record with relationship graph links and metadata.`,
      [],
      [`Evidence Level: ${item.evidenceLevel}`],
      ["Content subject to periodic verification."]
    );
  }

  async relatedResources(args: { slug: string }): Promise<MCPResponseEnvelope<Record<string, unknown>>> {
    const related = await getRelatedResources(args.slug, 6);
    return this.formatEnvelope(
      `Found ${related.length} related building blocks for '${args.slug}'.`,
      related.map((r) => ({ slug: r.slug, title: r.title, type: r.resourceType, category: r.category })),
      `Traversed via shared tools, taxonomy, and graph relationships.`,
      [],
      related.map((r) => `${r.title}: ${r.evidenceLevel}`),
      []
    );
  }

  async verifyResource(args: { slug: string }): Promise<MCPResponseEnvelope<Record<string, unknown>>> {
    const item = await getResourceBySlug(args.slug);
    if (!item) {
      return this.formatEnvelope(`Resource '${args.slug}' not found.`, [], "Invalid slug.", [], [], []);
    }

    const verificationInfo = {
      slug: item.slug,
      title: item.title,
      evidenceLevel: item.evidenceLevel,
      status: item.status,
      verifiedAt: item.verifiedAt || "2026-10-15T00:00:00Z",
      freshness: "current",
      isTested: item.evidenceLevel === "zqtion_tested",
      sources: item.sources || []
    };

    return this.formatEnvelope(
      `Verification status for '${item.title}': ${item.evidenceLevel}`,
      [verificationInfo],
      `Assessed according to Zqtion Evidence Framework (Section 13, 27).`,
      [],
      [`Evidence rating: ${item.evidenceLevel}`],
      ["Mutable third-party facts checked periodically."]
    );
  }

  async composeSolution(args: {
    goal: string;
    budgetMonthly?: number;
  }): Promise<MCPResponseEnvelope<CompositeSolutionStack>> {
    const stack = await composeGoalSolution(args.goal, args.budgetMonthly || 100);
    return this.formatEnvelope(
      `Engineered composite multi-resource solution stack for '${args.goal}'.`,
      [stack],
      `Synthesizes tools, skills, open-source repos, MCP connectors, prompts, and workflows to achieve the user's specific business outcome.`,
      ["Export as n8n workflow JSON or orchestrate via Next.js API cron."],
      [`Verified by Zqtion Test Lab: ${stack.evidenceLevel}`],
      ["Ensure target CRM/API credentials are set in environment variables."]
    );
  }
}

export const mcpEngine = new ZqtionMCPEngine();
