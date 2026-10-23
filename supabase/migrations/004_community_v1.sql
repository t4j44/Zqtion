-- Additive Community V1 schema. Apply once after 001-003. No existing data is changed.
begin;
create schema if not exists community_private;
revoke all on schema community_private from public;
grant usage on schema community_private to anon, authenticated;

create table public.community_profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  username text unique not null check (username ~ '^[a-z][a-z0-9_]{2,29}$' and username not in ('admin','administrator','moderator','support','zqtion','system')),
  display_name text not null check (char_length(btrim(display_name)) between 2 and 80),
  linkedin_url text not null check (char_length(linkedin_url) <= 300 and linkedin_url ~ '^https://(www\.)?linkedin\.com/in/[A-Za-z0-9_%.-]+/?$'),
  avatar text not null default 'orbit' check (avatar in ('orbit','spark','grid','wave','photo')),
  photo_id uuid,
  bio text not null default '' check (char_length(bio) <= 500),
  created_at timestamptz not null default now(), updated_at timestamptz not null default now(),
  check (avatar <> 'photo' or photo_id is not null)
);
create table public.community_guideline_acceptances (
  user_id uuid not null references auth.users(id) on delete cascade,
  version text not null, accepted_at timestamptz not null default now(), primary key (user_id,version)
);
create table public.community_moderators (user_id uuid primary key references auth.users(id) on delete cascade);
create table public.community_restrictions (
  user_id uuid primary key references auth.users(id) on delete cascade,
  reason text not null, created_at timestamptz not null default now()
);
create table public.community_entries (
  id uuid primary key default gen_random_uuid(),
  author_id uuid not null references public.community_profiles(id),
  kind text not null check (kind in ('question','tip','experience','troubleshooting','showcase','tutorial','discussion','prompt','answer','comment','result')),
  title text not null default '' check (char_length(title) <= 180),
  body text not null check (char_length(btrim(body)) between 2 and 20000),
  prompt_text text not null default '' check (char_length(prompt_text) <= 20000),
  category text not null check (category in ('creative','build','automate','general')),
  tool text not null default '' check (char_length(tool) <= 80),
  tags text[] not null default '{}' check (cardinality(tags) <= 5),
  parent_id uuid references public.community_entries(id),
  root_id uuid references public.community_entries(id),
  parent_prompt_id uuid references public.community_entries(id),
  accepted_answer_id uuid references public.community_entries(id),
  reply_depth smallint not null default 0 check (reply_depth between 0 and 2),
  session_slug text check (session_slug ~ '^[a-z0-9][a-z0-9-]{0,79}$'),
  status text not null default 'published' check (status in ('published','pending','hidden','deleted')),
  moderation_reason text not null default '',
  created_at timestamptz not null default now(), updated_at timestamptz not null default now(),
  search_vector tsvector generated always as (
    setweight(to_tsvector('simple',title),'A') || setweight(to_tsvector('simple',body),'B') || setweight(to_tsvector('simple',tool),'A')
  ) stored,
  check ((kind in ('answer','comment','result')) = (parent_id is not null)),
  check ((parent_id is null) = (root_id is null)),
  check (parent_id is not null or char_length(btrim(title)) >= 1),
  check (status='deleted' or kind <> 'prompt' or char_length(btrim(prompt_text)) >= 10)
);
create index community_entries_search_idx on public.community_entries using gin(search_vector);
create index community_entries_tags_idx on public.community_entries using gin(tags);
create index community_entries_feed_idx on public.community_entries(status,kind,created_at desc) where parent_id is null;
create index community_entries_root_idx on public.community_entries(root_id,created_at);
create index community_entries_parent_idx on public.community_entries(parent_id);
create index community_entries_author_idx on public.community_entries(author_id,created_at desc);
create index community_entries_remix_idx on public.community_entries(parent_prompt_id);
create table public.community_media (
  id uuid primary key, owner_id uuid not null references auth.users(id) on delete cascade,
  entry_id uuid references public.community_entries(id),
  purpose text not null check (purpose in ('profile','result')),
  path text unique not null,
  mime_type text not null check (mime_type in ('image/jpeg','image/png','image/webp')),
  size_bytes integer not null check (size_bytes between 1 and 1000000),
  alt text not null check (char_length(btrim(alt)) between 2 and 200),
  status text not null default 'pending' check (status in ('pending','approved','rejected')),
  created_at timestamptz not null default now()
);
alter table public.community_profiles add constraint community_profiles_photo_fk foreign key (photo_id) references public.community_media(id);
create index community_media_entry_idx on public.community_media(entry_id);
create index community_media_owner_idx on public.community_media(owner_id);
create table public.community_votes (
  user_id uuid not null references auth.users(id) on delete cascade,
  entry_id uuid not null references public.community_entries(id) on delete cascade,
  created_at timestamptz not null default now(), primary key(user_id,entry_id)
);
create table public.community_ratings (
  user_id uuid not null references auth.users(id) on delete cascade,
  entry_id uuid not null references public.community_entries(id) on delete cascade,
  rating smallint not null check(rating between 1 and 5),
  created_at timestamptz not null default now(), primary key(user_id,entry_id)
);
create table public.community_saves (
  user_id uuid not null references auth.users(id) on delete cascade,
  entry_id uuid not null references public.community_entries(id) on delete cascade,
  created_at timestamptz not null default now(), primary key(user_id,entry_id)
);
create index community_votes_entry_idx on public.community_votes(entry_id);
create index community_ratings_entry_idx on public.community_ratings(entry_id);
create table public.community_reports (
  id uuid primary key default gen_random_uuid(), reporter_id uuid not null references auth.users(id),
  entry_id uuid not null references public.community_entries(id),
  reason text not null check(char_length(btrim(reason)) between 5 and 1000),
  state text not null default 'open' check(state in ('open','resolved')),
  created_at timestamptz not null default now(), unique(reporter_id,entry_id)
);
create index community_reports_entry_idx on public.community_reports(entry_id,state);
create table public.community_moderation_actions (
  id bigint generated always as identity primary key,
  moderator_id uuid not null references auth.users(id), entry_id uuid references public.community_entries(id),
  media_id uuid references public.community_media(id), target_user_id uuid references auth.users(id),
  action text not null, reason text not null, created_at timestamptz not null default now()
);
create table public.community_rate_limits (
  user_id uuid not null references auth.users(id) on delete cascade,
  action text not null, window_start timestamptz not null, attempts integer not null,
  primary key(user_id,action,window_start)
);

create function community_private.is_moderator() returns boolean language sql stable security definer set search_path = '' as $$
  select exists(select 1 from public.community_moderators where user_id = auth.uid())
    and exists(select 1 from auth.users where id=auth.uid() and email_confirmed_at is not null)
    and not exists(select 1 from public.community_restrictions where user_id=auth.uid());
$$;
create function community_private.visible(p_id uuid) returns boolean language sql stable security definer set search_path = '' as $$
  with recursive chain as (
    select id,parent_id,status from public.community_entries where id=p_id
    union all select e.id,e.parent_id,e.status from public.community_entries e join chain c on e.id=c.parent_id
  ) select count(*) > 0 and bool_and(status='published') from chain;
$$;
create function community_private.verified() returns uuid language plpgsql stable security definer set search_path = '' as $$
begin
  if auth.uid() is null or not exists(select 1 from auth.users where id=auth.uid() and email_confirmed_at is not null)
    then raise exception 'Verify your email before participating.' using errcode='42501'; end if;
  if exists(select 1 from public.community_restrictions where user_id=auth.uid())
    then raise exception 'This account cannot participate. Contact Zqtion to appeal.' using errcode='42501'; end if;
  return auth.uid();
end; $$;
create function community_private.member() returns uuid language plpgsql stable security definer set search_path = '' as $$
declare u uuid := community_private.verified();
begin
  if not exists(select 1 from public.community_profiles where id=u) or not exists(select 1 from public.community_guideline_acceptances where user_id=u and version='2026-09-v1')
    then raise exception 'Complete your community profile first.' using errcode='42501'; end if;
  return u;
end; $$;
create function community_private.consume(p_action text,p_max integer,p_seconds integer) returns boolean language plpgsql security definer set search_path = '' as $$
declare n integer; w timestamptz := to_timestamp(floor(extract(epoch from now())/p_seconds)*p_seconds);
begin
  insert into public.community_rate_limits values(auth.uid(),p_action,w,1)
  on conflict(user_id,action,window_start) do update set attempts=public.community_rate_limits.attempts+1 returning attempts into n;
  return n<=p_max;
end; $$;
create function community_private.normalized(t text) returns text language sql immutable set search_path = '' as $$
  select lower(regexp_replace(btrim(t),'\s+',' ','g'));
$$;
create index community_entries_normalized_title_idx on public.community_entries(community_private.normalized(title)) where parent_id is null;
create function community_private.flag(t text) returns text language sql immutable set search_path = '' as $$
  select case
    when t ~* '(javascript:|data:text/html|https?://\S+\.(exe|scr|bat|cmd|ps1|msi)([\s?#]|$)|https?://[^ /]+@)' then 'Potentially unsafe link'
    when t ~* '(guaranteed.{0,20}(profit|return)|send.{0,20}(password|seed phrase)|buy.{0,12}(followers|accounts)|kill yourself|i will kill you|child.{0,12}(porn|sexual)|doxx?ing|home address is|social security number is|gore video|download.{0,20}(ransomware|stealer))' then 'Safety review required'
    when t ~* '[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}' then 'Possible private contact information'
    when t ~* '(-----BEGIN.{0,20}PRIVATE KEY-----|\msk-[A-Za-z0-9_-]{20,}|(phone|credit card|ssn)\s*(number)?\s*[:=]\s*[+\d][\d -]{7,})' then 'Possible private credentials or personal information'
    when (length(t)-length(replace(lower(t),'https://','')))/8 > 8 then 'Excessive promotion links'
    else '' end;
$$;

-- RLS reads plus no direct client writes. Every write below has explicit identity checks.
do $$ declare t text; begin
  foreach t in array array['community_profiles','community_guideline_acceptances','community_entries','community_media','community_votes','community_ratings','community_saves','community_reports','community_moderators','community_restrictions','community_moderation_actions','community_rate_limits'] loop
    execute format('alter table public.%I enable row level security',t);
    execute format('revoke all on public.%I from public, anon, authenticated',t);
    execute format('grant all on public.%I to service_role',t);
  end loop;
end $$;
grant select on public.community_profiles, public.community_entries, public.community_media to anon,authenticated;
grant select on public.community_votes,public.community_ratings,public.community_saves,public.community_reports,public.community_guideline_acceptances,public.community_moderation_actions to authenticated;
create policy profile_read on public.community_profiles for select using(true);
create policy entry_read on public.community_entries for select using(community_private.visible(id) or author_id=auth.uid() or community_private.is_moderator());
create policy media_read on public.community_media for select using(owner_id=auth.uid() or community_private.is_moderator() or (status='approved' and (
  (entry_id is not null and community_private.visible(entry_id)) or
  (purpose='profile' and exists(select 1 from public.community_profiles p where p.photo_id=community_media.id and p.avatar='photo'))
)));
create policy votes_own on public.community_votes for select to authenticated using(user_id=auth.uid());
create policy ratings_own on public.community_ratings for select to authenticated using(user_id=auth.uid());
create policy saves_own on public.community_saves for select to authenticated using(user_id=auth.uid());
create policy guidelines_own on public.community_guideline_acceptances for select to authenticated using(user_id=auth.uid());
create policy reports_moderators on public.community_reports for select to authenticated using(community_private.is_moderator());
create policy actions_moderators on public.community_moderation_actions for select to authenticated using(community_private.is_moderator());

-- Aggregate counts expose no voter identity and cannot be set by a caller.
create function public.community_counts(p_ids uuid[]) returns table(id uuid,votes bigint,rating numeric,rating_count bigint,answers bigint) language sql stable security definer set search_path = '' as $$
  select e.id,(select count(*) from public.community_votes v where v.entry_id=e.id),
    (select round(avg(r.rating),1) from public.community_ratings r where r.entry_id=e.id),
    (select count(*) from public.community_ratings r where r.entry_id=e.id),
    (select count(*) from public.community_entries a where a.parent_id=e.id and a.kind='answer' and a.status='published')
  from public.community_entries e where e.id=any(p_ids[1:100]) and community_private.visible(e.id);
$$;
create function public.community_is_moderator() returns boolean language sql stable security invoker set search_path = '' as $$ select community_private.is_moderator(); $$;
revoke all on function public.community_is_moderator() from public,anon;
grant execute on function public.community_is_moderator() to authenticated;
create function public.community_profile_stats(p_id uuid) returns jsonb language sql stable security definer set search_path = '' as $$
  select jsonb_build_object(
    'questions',count(*) filter(where e.kind='question'), 'answers',count(*) filter(where e.kind='answer'),
    'prompts',count(*) filter(where e.kind='prompt'),'tips',count(*) filter(where e.kind='tip'),
    'accepted_answers',count(*) filter(where exists(select 1 from public.community_entries q where q.accepted_answer_id=e.id and community_private.visible(q.id))),
    'upvotes',coalesce(sum((select count(*) from public.community_votes v where v.entry_id=e.id)),0))
  from public.community_entries e where e.author_id=p_id and community_private.visible(e.id);
$$;
revoke all on function public.community_profile_stats(uuid) from public;
grant execute on function public.community_profile_stats(uuid) to anon,authenticated;
create function public.community_indexable(p_ids uuid[]) returns table(id uuid) language sql stable security definer set search_path = '' as $$
  select e.id from public.community_entries e
  where e.id=any(p_ids[1:1000]) and e.parent_id is null and community_private.visible(e.id)
    and char_length(btrim(e.title)) between 20 and 180 and char_length(btrim(e.body))>=120
    and e.title <> upper(e.title) and e.title ~ '[[:alnum:]]' and e.moderation_reason=''
    and (char_length(regexp_replace(e.title,'[^[:alnum:][:space:]]','','g'))::numeric / greatest(char_length(e.title),1)) >= 0.5
    and not exists(select 1 from public.community_reports r join public.community_entries target on target.id=r.entry_id where (target.id=e.id or target.root_id=e.id) and r.state='open')
    and not exists(select 1 from public.community_media m where m.entry_id=e.id and m.status<>'approved')
    and not exists(select 1 from public.community_entries d where d.id<>e.id and d.parent_id is null and d.status='published' and community_private.normalized(d.title)=community_private.normalized(e.title));
$$;

create function public.community_search(p_query text default '',p_kind text default '',p_category text default '',p_tool text default '',p_tags text[] default '{}',p_offset integer default 0,p_similar boolean default false)
returns setof public.community_entries language sql stable security invoker set search_path = '' as $$
  select e.* from public.community_entries e
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

create function public.community_write(p_action text,p_data jsonb default '{}') returns jsonb
language plpgsql security definer set search_path = '' as $$
declare
  u uuid; eid uuid; e public.community_entries; par public.community_entries; profile public.community_profiles;
  k text; t text; b text; pr text; flag text; new_status text; dep integer := 0; r uuid; ids uuid[] := '{}'; item uuid; n integer;
begin
  u := community_private.verified();
  if jsonb_typeof(p_data) is distinct from 'object' or octet_length(p_data::text)>180000 then raise exception 'Community action payload is invalid or too large.'; end if;
  -- Serialize a user's mutations, and bounded global publication duplicate checks.
  perform pg_advisory_xact_lock(hashtextextended(u::text,0));
  if not community_private.consume('all',100,600) then return jsonb_build_object('error','Too many actions. Try again in ten minutes.','code',429); end if;
  if p_action='profile' then
    if p_data->>'guidelines' is distinct from '2026-09-v1' then raise exception 'Accept the community guidelines.'; end if;
    if p_data->>'avatar'='photo' and not exists(select 1 from public.community_media where id=(p_data->>'photo_id')::uuid and owner_id=u and purpose='profile' and status<>'rejected') then raise exception 'Choose your own uploaded profile photo.'; end if;
    if community_private.flag(coalesce(p_data->>'display_name','')||' '||coalesce(p_data->>'bio',''))<>'' then raise exception 'Remove unsafe or private information from your profile.'; end if;
    insert into public.community_profiles(id,username,display_name,linkedin_url,avatar,photo_id,bio)
    values(u,p_data->>'username',p_data->>'display_name',p_data->>'linkedin_url',p_data->>'avatar',case when p_data->>'avatar'='photo' then (p_data->>'photo_id')::uuid else null end,coalesce(p_data->>'bio',''))
    on conflict(id) do update set username=excluded.username,display_name=excluded.display_name,linkedin_url=excluded.linkedin_url,avatar=excluded.avatar,photo_id=excluded.photo_id,bio=excluded.bio,updated_at=now() returning * into profile;
    insert into public.community_guideline_acceptances(user_id,version) values(u,'2026-09-v1') on conflict do nothing;
    return to_jsonb(profile);
  elsif p_action='upload_slot' then
    if p_data->>'purpose'='result' then perform community_private.member();
    elsif p_data->>'purpose' is distinct from 'profile' then raise exception 'Choose a valid image purpose.'; end if;
    if not community_private.consume('upload',12,86400) then return jsonb_build_object('error','Daily upload limit reached.','code',429); end if;
    return jsonb_build_object('ok',true);
  end if;
  u := community_private.member();
  if p_action in ('create','edit') then
    if not community_private.consume('publish',20,3600) then return jsonb_build_object('error','Publishing limit reached. Try again in an hour.','code',429); end if;
    if p_action='edit' then
      select * into e from public.community_entries where id=(p_data->>'id')::uuid for update;
      if e.id is null or e.author_id<>u or e.status in ('hidden','deleted') then raise exception 'You cannot edit this contribution.' using errcode='42501'; end if;
      k:=e.kind; eid:=e.id;
    else k:=p_data->>'kind'; eid:=gen_random_uuid(); end if;
    t:=coalesce(p_data->>'title',''); b:=coalesce(p_data->>'body',''); pr:=coalesce(p_data->>'prompt_text','');
    if char_length(btrim(b))<2 or char_length(b)>20000 or char_length(t)>180 or char_length(pr)>20000 then raise exception 'Review the content length.'; end if;
    if k not in ('answer','comment','result') and (btrim(t)='' or char_length(btrim(b))<20 or t !~ '[[:alnum:]]') then raise exception 'Add a readable title and at least 20 characters of context.'; end if;
    if k='prompt' and char_length(btrim(pr))<10 then raise exception 'Add the prompt text.'; end if;
    if exists(select 1 from jsonb_array_elements_text(coalesce(p_data->'tags','[]')) x where char_length(x) not between 1 and 30) then raise exception 'Tags must be 1-30 characters.'; end if;
    if p_action='create' and k in ('answer','comment','result') then
      select * into par from public.community_entries where id=(p_data->>'parent_id')::uuid for update;
      if par.id is null or not community_private.visible(par.id) then raise exception 'That discussion is unavailable.'; end if;
      if k='answer' and par.kind<>'question' then raise exception 'Answers belong to questions.'; end if;
      if k='result' and par.kind<>'prompt' then raise exception 'Results belong to prompts.'; end if;
      if k='comment' and par.kind='comment' then dep:=par.reply_depth+1; end if;
      if dep>2 then raise exception 'Reply nesting is limited to two levels.'; end if;
      r:=coalesce(par.root_id,par.id);
    end if;
    if p_action='create' and nullif(p_data->>'parent_prompt_id','') is not null then
      if k<>'prompt' or not exists(select 1 from public.community_entries where id=(p_data->>'parent_prompt_id')::uuid and kind='prompt' and community_private.visible(id)) then raise exception 'Choose a published source prompt.'; end if;
    end if;
    select coalesce(array_agg(value::uuid),'{}') into ids from jsonb_array_elements_text(coalesce(p_data->'media_ids','[]'));
    if cardinality(ids)>4 or cardinality(ids)<>(select count(distinct v) from unnest(ids) v) then raise exception 'Use up to four different result images.'; end if;
    if p_action='edit' and cardinality(ids)>0 then raise exception 'Images cannot be replaced during text editing.'; end if;
    foreach item in array ids loop
      if not exists(select 1 from public.community_media where id=item and owner_id=u and purpose='result' and entry_id is null and status<>'rejected') then raise exception 'Choose your own unattached result images.'; end if;
    end loop;
    if k='result' and p_action='create' and cardinality(ids)=0 then raise exception 'Add at least one result image.'; end if;
    perform pg_advisory_xact_lock(4042026);
    if exists(select 1 from public.community_entries d where d.id<>eid and d.status<>'deleted' and d.kind=k
      and community_private.normalized(d.title)=community_private.normalized(t)
      and community_private.normalized(d.body)=community_private.normalized(b)
      and community_private.normalized(d.prompt_text)=community_private.normalized(pr)
      and (k not in ('comment','answer','result') or (d.author_id=u and d.parent_id=coalesce(par.id,e.parent_id)))) then raise exception 'This exact contribution already exists. Continue in the existing discussion.' using errcode='23505'; end if;
    flag:=community_private.flag(t||E'\n'||b||E'\n'||pr);
    new_status:=case when flag<>'' or cardinality(ids)>0 or exists(select 1 from public.community_media where entry_id=eid) or e.status='pending' then 'pending' else 'published' end;
    if p_action='edit' then
      update public.community_entries set title=t,body=b,prompt_text=pr,status=new_status,moderation_reason=flag,updated_at=now() where id=eid;
    else
      insert into public.community_entries(id,author_id,kind,title,body,prompt_text,category,tool,tags,parent_id,root_id,parent_prompt_id,reply_depth,session_slug,status,moderation_reason)
      values(eid,u,k,t,b,pr,coalesce(par.category,p_data->>'category'),coalesce(p_data->>'tool',''),array(select jsonb_array_elements_text(coalesce(p_data->'tags','[]'))),par.id,r,nullif(p_data->>'parent_prompt_id','')::uuid,dep,nullif(p_data->>'session_slug',''),new_status,flag);
      update public.community_media set entry_id=eid where id=any(ids);
    end if;
    return jsonb_build_object('id',eid,'root_id',coalesce(r,e.root_id),'kind',k,'status',new_status);
  end if;
  if p_action in ('moderate','moderate_media','restrict') then
    if not community_private.is_moderator() then raise exception 'Moderator access required.' using errcode='42501'; end if;
    if char_length(btrim(coalesce(p_data->>'reason','')))<5 then raise exception 'Record a moderation reason.'; end if;
    if p_action='restrict' then
      if p_data->>'restricted'='true' then insert into public.community_restrictions(user_id,reason) values((p_data->>'user_id')::uuid,p_data->>'reason') on conflict(user_id) do update set reason=excluded.reason;
      else delete from public.community_restrictions where user_id=(p_data->>'user_id')::uuid; end if;
      insert into public.community_moderation_actions(moderator_id,target_user_id,action,reason) values(u,(p_data->>'user_id')::uuid,'restrict:'||(p_data->>'restricted'),p_data->>'reason');
    elsif p_action='moderate_media' then
      if p_data->>'status' not in ('approved','rejected') then raise exception 'Invalid image decision.'; end if;
      update public.community_media set status=p_data->>'status' where id=(p_data->>'id')::uuid;
      insert into public.community_moderation_actions(moderator_id,media_id,action,reason) values(u,(p_data->>'id')::uuid,p_data->>'status',p_data->>'reason');
    else
      if p_data->>'status' not in ('published','hidden') then raise exception 'Invalid moderation decision.'; end if;
      if p_data->>'status'='published' and exists(select 1 from public.community_media where entry_id=(p_data->>'id')::uuid and status<>'approved') then raise exception 'Review every attached image before approving.'; end if;
      update public.community_entries set status=p_data->>'status',moderation_reason='',updated_at=now() where id=(p_data->>'id')::uuid and status<>'deleted';
      update public.community_reports set state='resolved' where entry_id=(p_data->>'id')::uuid;
      insert into public.community_moderation_actions(moderator_id,entry_id,action,reason) values(u,(p_data->>'id')::uuid,p_data->>'status',p_data->>'reason');
    end if;
    return jsonb_build_object('ok',true);
  end if;
  eid:=(p_data->>'id')::uuid;
  select * into e from public.community_entries where id=eid for update;
  if e.id is null then raise exception 'Contribution unavailable.'; end if;
  if p_action='delete' then
    if e.author_id<>u then raise exception 'You can only delete your own contribution.' using errcode='42501'; end if;
    update public.community_entries set status='deleted',body='Deleted by author.',title='Deleted contribution',prompt_text='',updated_at=now() where id=eid;
    update public.community_entries set accepted_answer_id=null where accepted_answer_id=eid;
    return jsonb_build_object('ok',true);
  end if;
  if not community_private.visible(eid) then raise exception 'Contribution unavailable.'; end if;
  if p_action='vote' then
    if e.author_id=u then raise exception 'You cannot upvote your own contribution.'; end if;
    if p_data->>'active'='true' then insert into public.community_votes(user_id,entry_id) values(u,eid) on conflict do nothing;
    else delete from public.community_votes where user_id=u and entry_id=eid; end if;
  elsif p_action='save' then
    if p_data->>'active'='true' then insert into public.community_saves(user_id,entry_id) values(u,eid) on conflict do nothing;
    else delete from public.community_saves where user_id=u and entry_id=eid; end if;
  elsif p_action='rate' then
    if e.kind<>'prompt' or e.author_id=u then raise exception 'Rate another creator''s prompt.'; end if;
    insert into public.community_ratings(user_id,entry_id,rating) values(u,eid,(p_data->>'rating')::smallint) on conflict(user_id,entry_id) do update set rating=excluded.rating;
  elsif p_action='accept' then
    if e.kind<>'question' or e.author_id<>u then raise exception 'Only the question author can accept an answer.' using errcode='42501'; end if;
    item:=nullif(p_data->>'answer_id','')::uuid;
    if item is not null and not exists(select 1 from public.community_entries where id=item and parent_id=eid and kind='answer' and status='published') then raise exception 'Choose a published answer to this question.'; end if;
    update public.community_entries set accepted_answer_id=item,updated_at=now() where id=eid;
  elsif p_action='report' then
    if not community_private.consume('report',10,86400) then return jsonb_build_object('error','Daily reporting limit reached.','code',429); end if;
    insert into public.community_reports(reporter_id,entry_id,reason) values(u,eid,p_data->>'reason') on conflict(reporter_id,entry_id) do update set reason=excluded.reason,state='open';
  else raise exception 'Unknown community action.'; end if;
  return jsonb_build_object('ok',true);
end; $$;

-- Private bucket: no browser Storage policies. Upload/download go through the verified server.
insert into storage.buckets(id,name,public,file_size_limit,allowed_mime_types)
values('community','community',false,1000000,array['image/jpeg','image/png','image/webp']);
-- Restrictive policy also blocks any pre-existing broad permissive Storage policies.
create policy community_storage_server_only on storage.objects as restrictive for all to anon,authenticated
  using(bucket_id <> 'community') with check(bucket_id <> 'community');

revoke all on all functions in schema community_private from public,anon,authenticated;
grant execute on function community_private.visible(uuid),community_private.is_moderator(),community_private.normalized(text) to anon,authenticated;
revoke all on function public.community_write(text,jsonb) from public,anon;
grant execute on function public.community_write(text,jsonb) to authenticated;
revoke all on function public.community_counts(uuid[]),public.community_indexable(uuid[]),public.community_search(text,text,text,text,text[],integer,boolean) from public;
grant execute on function public.community_counts(uuid[]),public.community_indexable(uuid[]),public.community_search(text,text,text,text,text[],integer,boolean) to anon,authenticated;
grant usage,select on sequence public.community_moderation_actions_id_seq to service_role;
commit;
