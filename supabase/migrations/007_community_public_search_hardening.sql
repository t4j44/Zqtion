-- Explicit public projections; apply after 006. No content/table history is rewritten.
-- Return types require DROP + CREATE, within one transaction and without CASCADE.
begin;
drop function public.community_search_people(text);
drop function public.community_search_answers(text);
drop function public.community_search(text,text,text,text,text[],integer,boolean);
drop function public.community_children(uuid,text,integer,uuid);
create function public.community_search_people(p_query text)
returns table(id uuid,username text,display_name text,linkedin_url text,avatar text,photo_id uuid,bio text)
language sql stable security invoker set search_path='' as $$
  select p.id,p.username,p.display_name,p.linkedin_url,p.avatar,p.photo_id,p.bio
  from public.community_profiles p where char_length(btrim(p_query))>=2
    and (p.username ilike '%'||left(btrim(p_query),80)||'%' or p.display_name ilike '%'||left(btrim(p_query),80)||'%')
  order by p.username limit 5;
$$;
create function public.community_search_answers(p_query text) returns table(id uuid,author_id uuid,kind text,title text,body text,prompt_text text,category text,tool text,tags text[],parent_id uuid,root_id uuid,parent_prompt_id uuid,accepted_answer_id uuid,reply_depth smallint,session_slug text,status text,created_at timestamptz,updated_at timestamptz)
language sql stable security invoker set search_path='' as $$
  select e.id,e.author_id,e.kind,e.title,e.body,e.prompt_text,e.category,e.tool,e.tags,e.parent_id,e.root_id,e.parent_prompt_id,e.accepted_answer_id,e.reply_depth,e.session_slug,e.status,e.created_at,e.updated_at from public.community_entries e where char_length(btrim(p_query))>=2 and e.kind='answer'
    and community_private.visible(e.id) and e.search_vector @@ websearch_to_tsquery('simple',left(p_query,180))
  order by ts_rank(e.search_vector,websearch_to_tsquery('simple',left(p_query,180))) desc,e.created_at desc,e.id limit 5;
$$;
create function public.community_children(p_parent uuid,p_sort text default 'top',p_offset integer default 0,p_exclude uuid default null)
returns table(id uuid,author_id uuid,kind text,title text,body text,prompt_text text,category text,tool text,tags text[],parent_id uuid,root_id uuid,parent_prompt_id uuid,accepted_answer_id uuid,reply_depth smallint,session_slug text,status text,created_at timestamptz,updated_at timestamptz) language sql stable security definer set search_path='' as $$
  select e.id,e.author_id,e.kind,e.title,e.body,e.prompt_text,e.category,e.tool,e.tags,e.parent_id,e.root_id,e.parent_prompt_id,e.accepted_answer_id,e.reply_depth,e.session_slug,e.status,e.created_at,e.updated_at from public.community_entries e where e.parent_id=p_parent and community_private.visible(e.id) and (p_exclude is null or e.id<>p_exclude)
  order by case when p_sort='top' then (select count(*) from public.community_votes v where v.entry_id=e.id) else 0 end desc,e.created_at desc,e.id
  limit 11 offset least(greatest(p_offset,0),10000);
$$;
create function public.community_search(p_query text default '',p_kind text default '',p_category text default '',p_tool text default '',p_tags text[] default '{}',p_offset integer default 0,p_similar boolean default false)
returns table(id uuid,author_id uuid,kind text,title text,body text,prompt_text text,category text,tool text,tags text[],parent_id uuid,root_id uuid,parent_prompt_id uuid,accepted_answer_id uuid,reply_depth smallint,session_slug text,status text,created_at timestamptz,updated_at timestamptz) language sql stable security invoker set search_path = '' as $$
  select e.id,e.author_id,e.kind,e.title,e.body,e.prompt_text,e.category,e.tool,e.tags,e.parent_id,e.root_id,e.parent_prompt_id,e.accepted_answer_id,e.reply_depth,e.session_slug,e.status,e.created_at,e.updated_at from public.community_entries e
  where e.parent_id is null and e.status='published'
    and (p_kind='' or (p_kind='experiences' and e.kind<>'prompt') or e.kind=p_kind)
    and (p_similar or p_category='' or e.category=p_category) and (p_similar or p_tool='' or lower(e.tool)=lower(left(p_tool,80)))
    and (p_similar or cardinality(p_tags)=0 or e.tags && p_tags)
    and (btrim(p_query)='' or e.search_vector @@ websearch_to_tsquery('simple',left(p_query,180))
      or community_private.normalized(e.title)=community_private.normalized(left(p_query,180))
      or exists(select 1 from unnest(e.tags) t where t ilike '%'||left(p_query,80)||'%'))
  order by (community_private.normalized(e.title)=community_private.normalized(left(p_query,180))) desc,
    ts_rank(e.search_vector,websearch_to_tsquery('simple',left(p_query,180))) desc,e.created_at desc,e.id
  limit case when p_similar then 5 else 21 end offset least(greatest(p_offset,0),10000);
$$;

do $outer$
declare s text;
begin
  select n.nspname into s from pg_extension x join pg_namespace n on n.oid=x.extnamespace where x.extname='pg_trgm';
  if s is null then return; end if;
  execute format('grant usage on schema %I to anon,authenticated',s);
  execute format('create index if not exists community_title_trgm_idx on public.community_entries using gin(title %I.gin_trgm_ops)',s);
  execute format($fn$
    create or replace function public.community_search(p_query text default '',p_kind text default '',p_category text default '',p_tool text default '',p_tags text[] default '{}',p_offset integer default 0,p_similar boolean default false)
    returns table(id uuid,author_id uuid,kind text,title text,body text,prompt_text text,category text,tool text,tags text[],parent_id uuid,root_id uuid,parent_prompt_id uuid,accepted_answer_id uuid,reply_depth smallint,session_slug text,status text,created_at timestamptz,updated_at timestamptz) language sql stable security invoker set search_path = '' as $body$
      select e.id,e.author_id,e.kind,e.title,e.body,e.prompt_text,e.category,e.tool,e.tags,e.parent_id,e.root_id,e.parent_prompt_id,e.accepted_answer_id,e.reply_depth,e.session_slug,e.status,e.created_at,e.updated_at from public.community_entries e
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

revoke all on function public.community_search_people(text),public.community_search_answers(text),public.community_search(text,text,text,text,text[],integer,boolean),public.community_children(uuid,text,integer,uuid) from public;
grant execute on function public.community_search_people(text),public.community_search_answers(text),public.community_search(text,text,text,text,text[],integer,boolean),public.community_children(uuid,text,integer,uuid) to anon,authenticated;

-- Single profile indexing gate, shared by metadata and sitemap. Preserve the
-- existing 40-character bio and latest-100 public-root eligibility thresholds.
-- Auth/restriction data is used internally, never returned.
create function public.community_indexable_profiles(p_ids uuid[])
returns table(id uuid,username text,updated_at timestamptz)
language sql stable security definer set search_path='' as $$
  select p.id,p.username,p.updated_at from public.community_profiles p
  where p.id=any(p_ids[1:100]) and char_length(p.bio)>=40
    and p.username ~ '^[a-z][a-z0-9_]{2,29}$'
    and exists(select 1 from auth.users u where u.id=p.id and u.email_confirmed_at is not null
      and u.email !~* '(@example\.(com|net|org)$|\.(test|example|invalid|localhost)$)')
    and exists(select 1 from public.community_guideline_acceptances g where g.user_id=p.id and g.version='2026-09-v1')
    and not exists(select 1 from public.community_restrictions r where r.user_id=p.id)
    and (p.display_name||' '||p.bio) !~* '(local qa|qa fixture|fixture profile|^fixture )'
    and (p.avatar<>'photo' or exists(select 1 from public.community_media m where m.id=p.photo_id and m.owner_id=p.id and m.status='approved'))
    and exists(select 1 from public.community_indexable(array(
      select e.id from public.community_entries e where e.author_id=p.id and e.parent_id is null and e.status='published'
      order by e.created_at desc,e.id limit 100)));
$$;
revoke all on function public.community_indexable_profiles(uuid[]) from public;
grant execute on function public.community_indexable_profiles(uuid[]) to anon,authenticated;
-- Column grants prevent raw REST reads from bypassing the public projections.
revoke select on public.community_profiles,public.community_entries,public.community_media from anon,authenticated;
grant select(id,username,display_name,linkedin_url,avatar,photo_id,bio,created_at,updated_at) on public.community_profiles to anon,authenticated;
grant select(id,author_id,kind,title,body,prompt_text,category,tool,tags,parent_id,root_id,parent_prompt_id,accepted_answer_id,reply_depth,session_slug,status,created_at,updated_at,search_vector) on public.community_entries to anon,authenticated;
grant select(id,owner_id,entry_id,purpose,mime_type,size_bytes,alt,status,created_at) on public.community_media to anon,authenticated;

-- Review reasons are only needed by the author and verified moderators.
create function public.community_review_reasons(p_ids uuid[])
returns table(id uuid,moderation_reason text)
language sql stable security definer set search_path='' as $$
  select e.id,e.moderation_reason from public.community_entries e
  where e.id=any(p_ids[1:100]) and (e.author_id=auth.uid() or community_private.is_moderator());
$$;
revoke all on function public.community_review_reasons(uuid[]) from public,anon;
grant execute on function public.community_review_reasons(uuid[]) to authenticated;
commit;
