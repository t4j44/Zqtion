-- Optional local PostgreSQL extension. FTS remains functional when unavailable.
begin;
create schema if not exists extensions;
do $$ begin
  create extension if not exists pg_trgm with schema extensions;
exception when insufficient_privilege or undefined_file or feature_not_supported then
  raise notice 'pg_trgm unavailable; Community search will use full-text search.';
end $$;
do $outer$
declare s text;
begin
  select n.nspname into s from pg_extension x join pg_namespace n on n.oid=x.extnamespace where x.extname='pg_trgm';
  if s is null then return; end if;
  execute format('grant usage on schema %I to anon,authenticated',s);
  execute format('create index if not exists community_title_trgm_idx on public.community_entries using gin(title %I.gin_trgm_ops)',s);
  execute format($fn$
    create or replace function public.community_search(p_query text default '',p_kind text default '',p_category text default '',p_tool text default '',p_tags text[] default '{}',p_offset integer default 0,p_similar boolean default false)
    returns setof public.community_entries language sql stable security invoker set search_path = '' as $body$
      select e.* from public.community_entries e
      where e.parent_id is null and e.status='published'
        and (p_kind='' or (p_kind='experiences' and e.kind<>'prompt') or e.kind=p_kind)
        and (p_similar or p_category='' or e.category=p_category)
        and (p_similar or p_tool='' or lower(e.tool)=lower(left(p_tool,80)))
        and (p_similar or cardinality(p_tags)=0 or e.tags && p_tags)
        and (btrim(p_query)='' or e.search_vector @@ websearch_to_tsquery('simple',left(p_query,180))
          or e.title operator(%1$I.%%) left(p_query,180)
          or exists(select 1 from unnest(e.tags) t where t ilike '%%'||left(p_query,80)||'%%'))
      order by (community_private.normalized(e.title)=community_private.normalized(left(p_query,180))) desc,
        (ts_rank(e.search_vector,websearch_to_tsquery('simple',left(p_query,180))) + %1$I.similarity(e.title,left(p_query,180))
          + case when p_similar and e.category=p_category then 0.1 else 0 end
          + case when p_similar and lower(e.tool)=lower(p_tool) and p_tool<>'' then 0.1 else 0 end
          + case when p_similar and e.tags && p_tags then 0.1 else 0 end) desc,e.created_at desc,e.id
      limit case when p_similar then 5 else 21 end offset least(greatest(p_offset,0),10000);
    $body$;
  $fn$,s);
end $outer$;
commit;
