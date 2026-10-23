-- Additive portfolio state. Community V1 remains authoritative.
begin;
create table public.community_profile_featured (
  profile_id uuid not null references public.community_profiles(id),
  entry_id uuid not null references public.community_entries(id),
  position smallint not null check(position between 1 and 6),
  created_at timestamptz not null default now(),
  primary key(profile_id,entry_id),
  unique(profile_id,position) deferrable initially deferred
);
create function community_private.feature_eligible(p_id uuid,p_owner uuid) returns boolean
language sql stable security definer set search_path='' as $$
  select exists(select 1 from public.community_entries e where e.id=p_id and e.author_id=p_owner
    and e.kind<>'comment' and community_private.visible(e.id) and e.moderation_reason=''
    and not exists(select 1 from public.community_media m where m.entry_id=e.id and m.status<>'approved'));
$$;
alter table public.community_profile_featured enable row level security;
revoke all on public.community_profile_featured from public,anon,authenticated;
grant select on public.community_profile_featured to anon,authenticated;
grant all on public.community_profile_featured to service_role;
revoke all on function community_private.feature_eligible(uuid,uuid) from public;
grant execute on function community_private.feature_eligible(uuid,uuid) to anon,authenticated;
create policy featured_public on public.community_profile_featured for select using(community_private.feature_eligible(entry_id,profile_id));

create function public.community_portfolio_write(p_action text,p_data jsonb default '{}') returns jsonb
language plpgsql security definer set search_path='' as $$
declare u uuid; eid uuid; ids uuid[]; n integer;
begin
  u:=community_private.member();
  if jsonb_typeof(p_data) is distinct from 'object' or octet_length(p_data::text)>4096 then raise exception 'Invalid featured work request.'; end if;
  perform pg_advisory_xact_lock(hashtextextended(u::text,0));
  if not community_private.consume('all',100,600) then return jsonb_build_object('error','Too many actions. Try again in ten minutes.','code',429); end if;
  -- Stale selections disappear immediately under RLS; reclaim their slots on the next write.
  delete from public.community_profile_featured where profile_id=u and not community_private.feature_eligible(entry_id,u);
  if p_action='feature' then
    eid:=(p_data->>'id')::uuid;
    if not community_private.feature_eligible(eid,u) then raise exception 'Feature only your own approved public work.' using errcode='42501'; end if;
    if not exists(select 1 from public.community_profile_featured where profile_id=u and entry_id=eid) then
      select min(s) into n from generate_series(1,6) s where not exists(select 1 from public.community_profile_featured f where f.profile_id=u and f.position=s);
      if n is null then raise exception 'You can feature up to six contributions. Unfeature one first.'; end if;
      insert into public.community_profile_featured(profile_id,entry_id,position) values(u,eid,n);
    end if;
  elsif p_action='unfeature' then
    delete from public.community_profile_featured where profile_id=u and entry_id=(p_data->>'id')::uuid;
  elsif p_action='reorder_featured' then
    if jsonb_typeof(p_data->'ids') is distinct from 'array' then raise exception 'Provide the complete featured order.'; end if;
    select coalesce(array_agg(v::uuid),'{}') into ids from jsonb_array_elements_text(p_data->'ids') v;
    select count(*) into n from public.community_profile_featured where profile_id=u;
    if cardinality(ids)<>n or cardinality(ids)>6 or (select count(distinct v) from unnest(ids) v)<>n
      or exists(select 1 from unnest(ids) v where not exists(select 1 from public.community_profile_featured where profile_id=u and entry_id=v)) then raise exception 'The featured selection changed. Refresh and try again.'; end if;
    update public.community_profile_featured f set position=a.pos from unnest(ids) with ordinality a(id,pos) where f.profile_id=u and f.entry_id=a.id;
  else raise exception 'Unknown portfolio action.'; end if;
  return jsonb_build_object('ok',true);
end; $$;
revoke all on function public.community_portfolio_write(text,jsonb) from public,anon;
grant execute on function public.community_portfolio_write(text,jsonb) to authenticated;

-- Extend the existing aggregate rather than create a competing source of profile counts.
create or replace function public.community_profile_stats(p_id uuid) returns jsonb language sql stable security definer set search_path='' as $$
  select jsonb_build_object(
    'questions',count(*) filter(where e.kind='question'),'answers',count(*) filter(where e.kind='answer'),
    'prompts',count(*) filter(where e.kind='prompt'),'tips',count(*) filter(where e.kind='tip'),
    'posts',count(*) filter(where e.parent_id is null and e.kind<>'prompt'),
    'experiences',count(*) filter(where e.kind in ('tip','experience','troubleshooting','tutorial','discussion')),
    'results',count(*) filter(where e.kind in ('result','showcase')),
    'accepted_answers',count(*) filter(where exists(select 1 from public.community_entries q where q.accepted_answer_id=e.id and community_private.visible(q.id))),
    'upvotes',coalesce(sum((select count(*) from public.community_votes v where v.entry_id=e.id)),0))
  from public.community_entries e where e.author_id=p_id and community_private.visible(e.id);
$$;

create function public.community_reply_counts(p_ids uuid[]) returns table(id uuid,comments bigint,results bigint)
language sql stable security definer set search_path='' as $$
  select e.id,(select count(*) from public.community_entries c where c.parent_id=e.id and c.kind='comment' and community_private.visible(c.id)),
    (select count(*) from public.community_entries c where c.parent_id=e.id and c.kind='result' and community_private.visible(c.id))
  from public.community_entries e where e.id=any(p_ids[1:100]) and community_private.visible(e.id);
$$;
create index community_entries_parent_created_idx on public.community_entries(parent_id,created_at desc,id) where status='published';
create function public.community_children(p_parent uuid,p_sort text default 'top',p_offset integer default 0,p_exclude uuid default null)
returns setof public.community_entries language sql stable security definer set search_path='' as $$
  select e.* from public.community_entries e where e.parent_id=p_parent and community_private.visible(e.id) and (p_exclude is null or e.id<>p_exclude)
  order by case when p_sort='top' then (select count(*) from public.community_votes v where v.entry_id=e.id) else 0 end desc,e.created_at desc,e.id
  limit 11 offset least(greatest(p_offset,0),10000);
$$;
revoke all on function public.community_reply_counts(uuid[]),public.community_children(uuid,text,integer,uuid) from public;
grant execute on function public.community_reply_counts(uuid[]),public.community_children(uuid,text,integer,uuid) to anon,authenticated;

-- Small, labelled supplementary search groups. RLS and public visibility still apply.
create function public.community_search_people(p_query text) returns setof public.community_profiles
language sql stable security invoker set search_path='' as $$
  select p.* from public.community_profiles p where char_length(btrim(p_query))>=2
    and (p.username ilike '%'||left(btrim(p_query),80)||'%' or p.display_name ilike '%'||left(btrim(p_query),80)||'%')
  order by p.username limit 5;
$$;
create function public.community_search_answers(p_query text) returns setof public.community_entries
language sql stable security invoker set search_path='' as $$
  select e.* from public.community_entries e where char_length(btrim(p_query))>=2 and e.kind='answer'
    and community_private.visible(e.id) and e.search_vector @@ websearch_to_tsquery('simple',left(p_query,180))
  order by ts_rank(e.search_vector,websearch_to_tsquery('simple',left(p_query,180))) desc,e.created_at desc,e.id limit 5;
$$;
revoke all on function public.community_search_people(text),public.community_search_answers(text) from public;
grant execute on function public.community_search_people(text),public.community_search_answers(text) to anon,authenticated;
commit;
