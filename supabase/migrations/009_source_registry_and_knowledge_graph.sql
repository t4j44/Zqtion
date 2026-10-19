-- ==============================================================================
-- Zqtion Resource Intelligence Migration 009: Multi-Source Registry & Knowledge Graph
-- ==============================================================================

-- 1. Create source_registry table
create table if not exists public.source_registry (
  id text primary key,
  name text not null,
  domain text not null,
  source_type text not null,
  authority_level text not null check (authority_level in ('A_PRIMARY', 'B_STRUCTURED', 'C_EXPERT', 'D_COMMUNITY')),
  discovery_weight integer not null default 3 check (discovery_weight between 1 and 5),
  ingestion_method text not null,
  crawl_allowed boolean not null default true,
  api_available boolean not null default false,
  github_available boolean not null default false,
  rss_available boolean not null default false,
  llms_txt_available boolean not null default false,
  sitemap_available boolean not null default false,
  content_license text,
  license_verified boolean not null default false,
  allowed_paths text[] not null default '{}',
  blocked_paths text[] not null default '{}',
  crawl_frequency text not null default 'weekly',
  last_crawled_at timestamptz,
  requires_primary_verification boolean not null default true,
  publication_policy text not null,
  notes text,
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- 2. Indexes for source_registry
create index if not exists idx_source_registry_domain on public.source_registry (domain);
create index if not exists idx_source_registry_authority on public.source_registry (authority_level);
create index if not exists idx_source_registry_type on public.source_registry (source_type);
create index if not exists idx_source_registry_active on public.source_registry (active);

-- 3. Composite Solution Stacks table (Knowledge Graph goal solutions)
create table if not exists public.composite_solution_stacks (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  goal text not null,
  summary text not null,
  estimated_monthly_budget text,
  recommended_stack jsonb not null default '[]'::jsonb,
  skills jsonb not null default '[]'::jsonb,
  open_source_repos jsonb not null default '[]'::jsonb,
  mcp_servers jsonb not null default '[]'::jsonb,
  prompts jsonb not null default '[]'::jsonb,
  workflow_steps jsonb not null default '[]'::jsonb,
  evidence_level text not null default 'verified',
  status text not null default 'published' check (status in ('draft', 'review', 'published', 'archived')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_composite_stacks_slug on public.composite_solution_stacks (slug);
create index if not exists idx_composite_stacks_status on public.composite_solution_stacks (status);

-- 4. Enable RLS
alter table public.source_registry enable row level security;
alter table public.composite_solution_stacks enable row level security;

-- 5. RLS Policies
-- Anon and authenticated can read public source registries (transparency)
create policy "Public can view active sources"
  on public.source_registry
  for select
  using (active = true);

-- Anon and authenticated can read published composite solution stacks
create policy "Public can view published solution stacks"
  on public.composite_solution_stacks
  for select
  using (status = 'published');

-- Service role bypasses RLS and maintains full administrative permissions
grant select on public.source_registry to anon, authenticated;
grant select on public.composite_solution_stacks to anon, authenticated;

grant all on public.source_registry to service_role;
grant all on public.composite_solution_stacks to service_role;

-- 6. RPC: Goal-driven Solution Search
create or replace function public.compose_goal_solution(
  target_goal text,
  max_budget numeric default 100
)
returns table (
  id uuid,
  slug text,
  goal text,
  summary text,
  recommended_stack jsonb,
  skills jsonb,
  open_source_repos jsonb,
  mcp_servers jsonb,
  prompts jsonb,
  workflow_steps jsonb,
  evidence_level text
)
language sql
stable
security invoker
as $$
  select
    s.id,
    s.slug,
    s.goal,
    s.summary,
    s.recommended_stack,
    s.skills,
    s.open_source_repos,
    s.mcp_servers,
    s.prompts,
    s.workflow_steps,
    s.evidence_level
  from public.composite_solution_stacks s
  where s.status = 'published'
    and (
      target_goal is null
      or target_goal = ''
      or to_tsvector('english', s.goal || ' ' || s.summary) @@ plainto_tsquery('english', target_goal)
      or s.goal ilike '%' || target_goal || '%'
    )
  limit 5;
$$;
