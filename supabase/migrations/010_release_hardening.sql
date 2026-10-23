-- Release hardening following migrations 001-009.
-- Apply to Zqtion Staging and test before any production rollout.
-- Intentionally private RLS-without-policy tables remain default-deny.
-- Public SECURITY DEFINER community read RPCs remain intentional; each uses
-- published/visibility checks. Do not revoke them without updating public feeds.

alter function public.compose_goal_solution(text,numeric) set search_path = '';

-- Avoid reevaluating auth identity once per row. Preserve exact access rules.
alter policy entry_read on public.community_entries
  using (
    community_private.visible(id)
    or author_id = (select auth.uid())
    or (select community_private.is_moderator())
  );

alter policy media_read on public.community_media
  using (
    owner_id = (select auth.uid())
    or (select community_private.is_moderator())
    or (
      status = 'approved'
      and (
        (entry_id is not null and community_private.visible(entry_id))
        or (
          purpose = 'profile'
          and exists (
            select 1 from public.community_profiles p
            where p.photo_id = community_media.id and p.avatar = 'photo'
          )
        )
      )
    )
  );

alter policy votes_own on public.community_votes
  using (user_id = (select auth.uid()));
alter policy ratings_own on public.community_ratings
  using (user_id = (select auth.uid()));
alter policy saves_own on public.community_saves
  using (user_id = (select auth.uid()));
alter policy guidelines_own on public.community_guideline_acceptances
  using (user_id = (select auth.uid()));

-- Cover FKs identified by Supabase's performance advisor.
create index if not exists community_entries_accepted_answer_id_idx
  on public.community_entries (accepted_answer_id);
create index if not exists community_moderation_actions_entry_id_idx
  on public.community_moderation_actions (entry_id);
create index if not exists community_moderation_actions_media_id_idx
  on public.community_moderation_actions (media_id);
create index if not exists community_moderation_actions_moderator_id_idx
  on public.community_moderation_actions (moderator_id);
create index if not exists community_moderation_actions_target_user_id_idx
  on public.community_moderation_actions (target_user_id);
create index if not exists community_profile_featured_entry_id_idx
  on public.community_profile_featured (entry_id);
create index if not exists community_profiles_photo_id_idx
  on public.community_profiles (photo_id);
create index if not exists community_saves_entry_id_idx
  on public.community_saves (entry_id);
