export type ResourceType =
  | "guide"
  | "prompt"
  | "skill"
  | "tool"
  | "model"
  | "repository"
  | "mcp_server"
  | "workflow"
  | "template"
  | "automation"
  | "use_case"
  | "case_study";

export type ResourceCategory =
  | "create"
  | "build"
  | "automate"
  | "research"
  | "productivity"
  | "agents";

export type ResourceDifficulty = "beginner" | "intermediate" | "advanced" | "all";

export type EvidenceLevel =
  | "verified"
  | "zqtion_tested"
  | "source_reported"
  | "community_reported"
  | "unverified";

export type PublicationStatus =
  | "draft"
  | "review"
  | "published"
  | "stale"
  | "archived"
  | "blocked_originality";

export interface ResourceRelationship {
  id?: string;
  sourceId: string;
  targetId: string;
  targetSlug?: string;
  targetTitle?: string;
  targetType?: ResourceType;
  relationshipType:
    | "uses_tool"
    | "requires_skill"
    | "implements_workflow"
    | "has_repository"
    | "connects_mcp"
    | "solves_use_case"
    | "alternative_to"
    | "related_to";
}

export interface ResourceSource {
  id?: string;
  resourceId?: string;
  sourceUrl: string;
  sourceDomain: string;
  sourceTitle: string;
  sourceType: "official_doc" | "github_repo" | "product_site" | "research_guide" | "community" | "other";
  isPrimary: boolean;
  retrievedAt: string;
  lastVerifiedAt?: string | null;
}

export interface ResourceItem {
  id: string;
  slug: string;
  title: string;
  summary: string;
  resourceType: ResourceType;
  category: ResourceCategory;
  difficulty: ResourceDifficulty;
  evidenceLevel: EvidenceLevel;
  status: PublicationStatus;
  metadata: Record<string, unknown>;
  contentMarkdown: string;
  tags: string[];
  tools: string[];
  sourceOrigin: string;
  contentHash: string;
  createdAt: string;
  updatedAt: string;
  verifiedAt?: string | null;
  publishedAt?: string | null;
  relationships?: ResourceRelationship[];
  sources?: ResourceSource[];
}

export interface ResourceSearchParams {
  query?: string;
  type?: ResourceType | "";
  category?: ResourceCategory | "";
  difficulty?: ResourceDifficulty | "";
  evidenceLevel?: EvidenceLevel | "";
  limit?: number;
  offset?: number;
}

export interface StackRecommendationResult {
  task: string;
  recommendedStack: Array<{
    name: string;
    slug: string;
    role: string;
    resourceType: ResourceType;
    estimatedCost: string;
    tradeoffs: string;
  }>;
  alternatives: Array<{
    name: string;
    reason: string;
  }>;
  totalEstimatedMonthlyCost: string;
  complexity: ResourceDifficulty;
  limitations: string[];
  evidence: string[];
  relatedGuideSlug?: string;
}

export interface WorkflowBuildResult {
  goal: string;
  summary: string;
  steps: Array<{
    stepNumber: number;
    title: string;
    description: string;
    tools: string[];
    promptsOrSkills?: string[];
  }>;
  requiredTools: string[];
  requiredSkills: string[];
  mcpConnections: string[];
  failureModes: string[];
  verifiedAt: string;
}

export interface MCPResponseEnvelope<T = unknown> {
  answer: string;
  resources: T[];
  why: string;
  alternatives: string[];
  evidence: string[];
  limitations: string[];
  verifiedAt: string;
}

export interface SourceRegistryEntry {
  id: string;
  name: string;
  domain: string;
  sourceType: string;
  authorityLevel: "A_PRIMARY" | "B_STRUCTURED" | "C_EXPERT" | "D_COMMUNITY";
  discoveryWeight: number;
  ingestionMethod: string;
  crawlAllowed: boolean;
  apiAvailable: boolean;
  githubAvailable: boolean;
  contentLicense?: string;
  licenseVerified: boolean;
  crawlFrequency: string;
  requiresPrimaryVerification: boolean;
  publicationPolicy: string;
  notes?: string;
  active: boolean;
}

export interface CompositeSolutionStack {
  slug: string;
  goal: string;
  summary: string;
  targetBudgetMonthly: string;
  recommendedStack: Array<{
    role: string;
    name: string;
    type: string;
    slug?: string;
    estimatedCost: string;
  }>;
  skills: Array<{
    name: string;
    slug: string;
    source: string;
  }>;
  openSourceRepos: Array<{
    name: string;
    repo: string;
    license: string;
  }>;
  mcpServers: Array<{
    name: string;
    slug: string;
    transport: string;
  }>;
  prompts: Array<{
    title: string;
    slug: string;
  }>;
  workflow: Array<{
    step: number;
    title: string;
    action: string;
  }>;
  evidenceLevel: string;
  verifiedAt: string;
}
