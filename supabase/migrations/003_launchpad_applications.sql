-- Local definition only. Apply after program, jurisdiction and privacy review.
-- Requires migration 002 for the persistent rate-limit RPC.
create table if not exists public.launchpad_applications (
  id uuid primary key,
  created_at timestamptz not null default now(),
  email text not null check (char_length(email) between 5 and 160),
  primary_track text not null check (primary_track in (
    'ai-creative-prompt-engineering', 'video-editing-post-production', 'reels-short-form-content',
    'brand-graphic-design', 'communications-social-media', 'content-copywriting',
    'business-development-partnerships', 'sales-outreach', 'lead-research-prospecting',
    'ai-market-research', 'data-cleaning-operations', 'data-analysis-insights',
    'data-visualization-reporting', 'ai-automation-digital-execution'
  )),
  answers jsonb not null check (jsonb_typeof(answers) = 'object'),
  terms_version text not null,
  request_fingerprint text not null check (char_length(request_fingerprint) = 64),
  status text not null default 'received' check (status in ('received', 'shortlisted', 'challenge', 'conversation', 'selected', 'not_selected', 'withdrawn')),
  constraint launchpad_adult_confirmation check (answers @> '{"ageConfirmed":true}'::jsonb),
  constraint launchpad_terms_acknowledgement check (answers @> '{"acknowledgement":true,"privacyConsent":true}'::jsonb)
);
alter table public.launchpad_applications enable row level security;
revoke all on table public.launchpad_applications from public, anon, authenticated;
grant select, insert, update, delete on table public.launchpad_applications to service_role;
create index if not exists launchpad_applications_created_at_idx on public.launchpad_applications (created_at desc);
create index if not exists launchpad_applications_track_status_idx on public.launchpad_applications (primary_track, status);
-- No public read/write policies. No raw IP, DOB, ID documents or uploaded files.
-- Authorized operations must implement the approved retention/deletion procedure.
