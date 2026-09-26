# Community V1 integration plan

Scope: add persistent community participation to the existing website. Preserve the original Prompt Library and inquiry/email implementation. No AI provider, realtime service, hosted migration, deployment or Git publication is required for local implementation.

## Architecture

- Supabase Auth browser sessions; bearer tokens verified on the server and identity checked again inside database write functions.
- One public profile per Auth user, with no email column. Required verified email, name, unique username, LinkedIn profile, avatar choice/photo and versioned guidelines acceptance.
- A normalized `community_entries` table holds posts, prompts, answers, comments and results. Parent/root relationships enforce valid targets and two reply levels. Prompts retain `parent_prompt_id` for forks.
- RLS protects reads. Narrow database functions enforce writes, ownership, rate limits, visibility, moderation and accepted-answer relationships. Direct client table writes are not granted.
- Private Storage bucket: at most 1,000,000 bytes per image, four images per contribution. Server checks actual bytes and decodes/re-encodes images. Images require moderator review before public access.
- PostgreSQL full-text search, optional pg_trgm, normalized duplicate checks, deterministic title/tag/moderation interfaces. Similar topics are advisory; exact repeated content is rejected atomically.
- Server-rendered public feeds/details/profiles. Client islands handle authentication and actions. Public data never depends on a browser session. Saved content and moderation screens are private and noindex.
- `/ai-experiences`, `/prompts/community`, `/share`, `/community/account`, `/community/saved`, `/community/moderation`, `/community/guidelines`, `/u/[username]`.
- A publication preview retains the exact submitted wording. Content with images or moderation signals is queued; suitable text can publish immediately. A stricter independent indexing gate excludes flagged, duplicate, thin and unreviewed content.

## Verification

Pure validation tests; local PostgreSQL-compatible migration/RLS tests with stubbed Supabase Auth/Storage schemas; existing test suite; typecheck/lint/build; production-browser checks including mobile and existing Prompt Library. Hosted Auth email, live Supabase Storage and actual provider configuration require a separate staging acceptance run and will be reported honestly.
