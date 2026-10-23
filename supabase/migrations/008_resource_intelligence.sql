-- Migration 008: Zqtion Resource Intelligence Knowledge Layer
-- Additive migration. RLS enabled on all tables. No existing tables modified.
begin;

-- 1. Private Research Schema (Protected from public access)
create schema if not exists resource_private;
revoke all on schema resource_private from public;
revoke all on schema resource_private from anon, authenticated;
grant usage on schema resource_private to service_role;

create table if not exists resource_private.crawl_pages (
  id uuid primary key default gen_random_uuid(),
  source_url text unique not null,
  canonical_url text not null,
  source_domain text not null,
  source_author text not null default '',
  page_title text not null default '',
  meta_description text not null default '',
  crawled_at timestamptz not null default now(),
  content_hash text not null,
  extraction_json jsonb not null default '{}'::jsonb,
  source_markdown_private text not null default '',
  crawl_status text not null default 'crawled' check (crawl_status in ('crawled', 'failed', 'changed', 'verified', 'archived'))
);

create index if not exists crawl_pages_url_idx on resource_private.crawl_pages (source_url);
create index if not exists crawl_pages_hash_idx on resource_private.crawl_pages (content_hash);

-- 2. Public Resource Items (Polymorphic knowledge layer)
create table if not exists public.resource_items (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null check (slug ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$' and char_length(slug) <= 120),
  title text not null check (char_length(btrim(title)) between 2 and 180),
  summary text not null check (char_length(btrim(summary)) between 10 and 1000),
  resource_type text not null check (resource_type in (
    'guide', 'prompt', 'skill', 'tool', 'model', 'repository',
    'mcp_server', 'workflow', 'template', 'automation', 'use_case', 'case_study'
  )),
  category text not null check (category in (
    'create', 'build', 'automate', 'research', 'productivity', 'agents'
  )),
  difficulty text not null default 'intermediate' check (difficulty in ('beginner', 'intermediate', 'advanced', 'all')),
  evidence_level text not null default 'unverified' check (evidence_level in (
    'verified', 'zqtion_tested', 'source_reported', 'community_reported', 'unverified'
  )),
  status text not null default 'draft' check (status in (
    'draft', 'review', 'published', 'stale', 'archived', 'blocked_originality'
  )),
  metadata jsonb not null default '{}'::jsonb,
  content_markdown text not null default '',
  tags text[] not null default '{}'::text[],
  tools text[] not null default '{}'::text[],
  source_origin text not null default 'zqtion',
  content_hash text not null default '',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  verified_at timestamptz,
  published_at timestamptz,
  search_vector tsvector generated always as (
    setweight(to_tsvector('simple', coalesce(title, '')), 'A') ||
    setweight(to_tsvector('simple', coalesce(summary, '')), 'B') ||
    setweight(to_tsvector('simple', coalesce(category, '')), 'C') ||
    setweight(to_tsvector('simple', coalesce(resource_type, '')), 'C')
  ) stored
);

create index if not exists resource_items_search_idx on public.resource_items using gin (search_vector);
create index if not exists resource_items_type_status_idx on public.resource_items (status, resource_type, published_at desc);
create index if not exists resource_items_category_idx on public.resource_items (status, category, published_at desc);
create index if not exists resource_items_tags_idx on public.resource_items using gin (tags);
create index if not exists resource_items_tools_idx on public.resource_items using gin (tools);

-- 3. Resource Relationships (Graph connections)
create table if not exists public.resource_relationships (
  id uuid primary key default gen_random_uuid(),
  source_id uuid not null references public.resource_items(id) on delete cascade,
  target_id uuid not null references public.resource_items(id) on delete cascade,
  relationship_type text not null check (relationship_type in (
    'uses_tool', 'requires_skill', 'implements_workflow', 'has_repository',
    'connects_mcp', 'solves_use_case', 'alternative_to', 'related_to'
  )),
  created_at timestamptz not null default now(),
  unique (source_id, target_id, relationship_type)
);

create index if not exists resource_rel_source_idx on public.resource_relationships (source_id);
create index if not exists resource_rel_target_idx on public.resource_relationships (target_id);

-- 4. Resource Sources (Attribution & evidence tracking)
create table if not exists public.resource_sources (
  id uuid primary key default gen_random_uuid(),
  resource_id uuid references public.resource_items(id) on delete cascade,
  source_url text not null,
  source_domain text not null,
  source_title text not null default '',
  source_type text not null check (source_type in (
    'official_doc', 'github_repo', 'product_site', 'research_guide', 'community', 'other'
  )),
  is_primary boolean not null default false,
  retrieved_at timestamptz not null default now(),
  last_verified_at timestamptz
);

create index if not exists resource_sources_res_idx on public.resource_sources (resource_id);
create index if not exists resource_sources_url_idx on public.resource_sources (source_url);

-- 5. Row Level Security Policies
alter table public.resource_items enable row level security;
alter table public.resource_relationships enable row level security;
alter table public.resource_sources enable row level security;

-- Public read policies: only published resources are visible to anon/authenticated
create policy resource_items_public_read on public.resource_items
  for select using (status = 'published');

create policy resource_rel_public_read on public.resource_relationships
  for select using (
    exists (select 1 from public.resource_items r where r.id = source_id and r.status = 'published') and
    exists (select 1 from public.resource_items r where r.id = target_id and r.status = 'published')
  );

create policy resource_sources_public_read on public.resource_sources
  for select using (
    resource_id is null or
    exists (select 1 from public.resource_items r where r.id = resource_id and r.status = 'published')
  );

-- Service role bypasses RLS for administrative management
grant select on public.resource_items to anon, authenticated;
grant select on public.resource_relationships to anon, authenticated;
grant select on public.resource_sources to anon, authenticated;

grant all on public.resource_items to service_role;
grant all on public.resource_relationships to service_role;
grant all on public.resource_sources to service_role;

-- 6. Public Search & Graph RPC Functions
create or replace function public.resource_search(
  p_query text default '',
  p_type text default '',
  p_category text default '',
  p_difficulty text default '',
  p_limit integer default 20,
  p_offset integer default 0
)
returns table (
  id uuid,
  slug text,
  title text,
  summary text,
  resource_type text,
  category text,
  difficulty text,
  evidence_level text,
  metadata jsonb,
  tags text[],
  tools text[],
  published_at timestamptz
)
language sql stable security invoker set search_path = '' as $$
  select
    r.id, r.slug, r.title, r.summary, r.resource_type, r.category,
    r.difficulty, r.evidence_level, r.metadata, r.tags, r.tools, r.published_at
  from public.resource_items r
  where r.status = 'published'
    and (p_type = '' or r.resource_type = p_type)
    and (p_category = '' or r.category = p_category)
    and (p_difficulty = '' or r.difficulty = p_difficulty)
    and (
      btrim(p_query) = '' or
      r.search_vector @@ websearch_to_tsquery('simple', left(p_query, 180)) or
      r.title ilike '%' || left(btrim(p_query), 80) || '%' or
      exists (select 1 from unnest(r.tags) t where t ilike '%' || left(p_query, 40) || '%') or
      exists (select 1 from unnest(r.tools) tl where tl ilike '%' || left(p_query, 40) || '%')
    )
  order by
    case when btrim(p_query) <> '' then
      ts_rank(r.search_vector, websearch_to_tsquery('simple', left(p_query, 180)))
    else 0 end desc,
    r.published_at desc nulls last,
    r.created_at desc
  limit least(greatest(p_limit, 1), 100)
  offset least(greatest(p_offset, 0), 10000);
$$;

create or replace function public.resource_related(p_slug text, p_limit integer default 6)
returns table (
  id uuid,
  slug text,
  title text,
  summary text,
  resource_type text,
  category text,
  relationship_type text
)
language sql stable security invoker set search_path = '' as $$
  with current_item as (
    select id, category from public.resource_items where slug = p_slug and status = 'published' limit 1
  )
  select
    target.id, target.slug, target.title, target.summary, target.resource_type, target.category,
    rel.relationship_type
  from current_item cur
  join public.resource_relationships rel on rel.source_id = cur.id
  join public.resource_items target on target.id = rel.target_id and target.status = 'published'
  union
  select
    source.id, source.slug, source.title, source.summary, source.resource_type, source.category,
    'incoming_' || rel.relationship_type
  from current_item cur
  join public.resource_relationships rel on rel.target_id = cur.id
  join public.resource_items source on source.id = rel.source_id and source.status = 'published'
  limit least(greatest(p_limit, 1), 30);
$$;

commit;
