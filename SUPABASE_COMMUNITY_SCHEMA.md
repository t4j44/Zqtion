# Supabase Community schema and setup — V1 + public portfolio

Website: `E:\zqtion\website of zqtion`.

Hosted migrations applied: **NO**. No hosted credentials are configured in this checkout. Local migration/RLS verification uses PGlite, which runs PostgreSQL in-process with test Auth/Storage schemas. It is not a hosted Supabase signoff.

## Apply to a staging Supabase project first

1. Keep `NEXT_PUBLIC_COMMUNITY_ENABLED=false` while configuring the project. Preserve all existing inquiry/email variables and Zoho DNS records.
2. In Supabase SQL Editor, run `supabase/migrations/004_community_v1.sql`, then `005_community_similarity.sql`, then `006_community_profile_portfolio.sql`, then `007_community_public_search_hardening.sql`, once and in order. Check the staging migration ledger first and apply only missing migrations in sequence. Existing migrations 001–003 stay unchanged. These migrations add Community tables/functions and a new private bucket; they do not modify existing inquiry records.
3. Under Authentication → Providers → Email, enable email signup and **Confirm email**. Set the password minimum to at least 12 characters. Use the existing project's appropriate Auth rate limits; configure a production-capable SMTP sender before a public launch. Supabase Auth sends account email; the existing contact Resend flow stays separate.
4. Under Authentication → URL Configuration, set the website URL and allow the exact staging/production `/community/account` callback URLs, including the allowed callback query pattern for `next` and password recovery. For local testing, explicitly allow the chosen localhost origin. Do not enable unrestricted external redirects. The app additionally restricts `next` to local Community destinations.
5. Confirm Storage → `community` is **private**, allows `image/jpeg`, `image/png`, `image/webp`, and caps files at **1,000,000 bytes**. Migration 004 creates this configuration. The restrictive `community_storage_server_only` policy prevents direct browser access even if another bucket's broad permissive policy exists. Do not make this bucket public.
6. Configure `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, and server-only `SUPABASE_SECRET_KEY` (or legacy `SUPABASE_SERVICE_ROLE_KEY`) for the same project. Never put the server key in a `NEXT_PUBLIC_` variable. Community uses the anon key plus the user's token for all ordinary data actions; the server key is confined to validated private-image storage.
7. Create and verify the first moderator account, complete its profile, and find its UUID in Authentication → Users. An operator can grant the role in SQL Editor:

   ```sql
   insert into public.community_moderators(user_id)
   values ('REPLACE_WITH_VERIFIED_USER_UUID'::uuid)
   on conflict do nothing;
   ```

   This is an explicit administrator operation. There is no public role-grant endpoint.
8. Set `NEXT_PUBLIC_COMMUNITY_ENABLED=true` in the staging environment and rebuild, because public variables are compiled into the browser bundle. Run the hosted acceptance checklist in `COMMUNITY_SECURITY_REPORT.md` before enabling production.

The standard Supabase email-confirmation and password-recovery links return to `/community/account`. The Supabase browser SDK consumes the session and refreshes it. The app verifies tokens with `auth.getUser()` for application endpoints; write functions independently read `auth.users.email_confirmed_at`. An authenticated user without a profile is sent through one-time onboarding before participation.

## Tables

| Table | Purpose | Public/private boundary |
|---|---|---|
| `community_profiles` | One identity per Auth UUID; unique username, name, LinkedIn, avatar/photo, bio | Public profile fields only; no email column |
| `community_guideline_acceptances` | Version and timestamp of acceptance | User can read their own record |
| `community_entries` | Experiences, questions, prompts, answers, comments and results | Published content with published ancestors; author/moderator may read nonpublic content |
| `community_media` | Generated private object paths, size/MIME, alt text and review status | Owner/moderator; public only when approved and linked to visible content/profile |
| `community_votes` | One upvote per user and entry | Own rows only; public aggregate function |
| `community_ratings` | One 1–5 rating per user and prompt | Own rows only; public aggregate function |
| `community_saves` | Account-persistent saved entries | Owner only |
| `community_reports` | Private reason and resolution status | Moderators only |
| `community_moderators` | Operator-assigned role | No client table access |
| `community_restrictions` | Account participation restrictions | No client table access |
| `community_moderation_actions` | Attributed moderation audit history | Moderators only |
| `community_rate_limits` | Fixed windows keyed by authenticated UUID | No client table access |
| `community_profile_featured` | Up to six ordered references to the owner's work | Only currently eligible public work is readable; writes use the authenticated portfolio function |

All 13 Community tables have RLS enabled after migration 006. Direct `INSERT`, `UPDATE` and `DELETE` privileges are revoked from `anon` and `authenticated`. RLS protects reads; explicit database functions enforce all permitted mutations, including owner checks. There are no client-editable vote totals, rating totals, roles, moderation flags, author IDs or accepted-answer fields.

## Content normalization

`community_entries.kind` is one of `question`, `tip`, `experience`, `troubleshooting`, `showcase`, `tutorial`, `discussion`, `prompt`, `answer`, `comment`, `result`.

- Root entries have no `parent_id` or `root_id`.
- Answers require a published question parent.
- Results require a published prompt parent and at least one uploaded image.
- Comments can target a root, answer, result or comment. A comment starts at depth 0; nested replies stop at depth 2. Foreign keys and the write function determine the root and depth, not the client.
- `accepted_answer_id` is a single pointer on a question. Only the question author can set/clear it, and the answer must belong to that question and be published.
- `parent_prompt_id` is the source of a new prompt remix. It must reference a published prompt. Source text is never updated by remixing.
- `session_slug` stores the optional `/share?session=...` value, limited to 80 lowercase letters/numbers/hyphens.
- Entry states are `published`, `pending`, `hidden`, `deleted`. Image states are `pending`, `approved`, `rejected`.
- Deleting one's own contribution clears its text, withdraws it and hides descendant conversation through the visibility predicate. It does not hard-delete moderation evidence or image bytes.

## Database interfaces

- `community_write(action, data)` — profile, create/edit/delete, vote, save, rate, accept, report, moderation and upload allowance. Derives identity from `auth.uid()` and rejects unverified/restricted users. Profile setup and profile-image upload do not require an already completed profile; other participation does.
- `community_search(...)` — parameterized full-text search across titles/body/tools, plus tag matching; bounded pagination and five duplicate suggestions. Migration 005 adds indexed trigram matching when available. Matching category/tool/tags improves duplicate ordering; these do not exclude related discussions in another category.
- `community_counts(ids)` — bounded public aggregates without voter identity.
- `community_indexable(ids)` — independent, conservative public indexing eligibility.
- `community_profile_stats(id)` — public-only questions, posts, answers, prompts, tips, experiences, results/showcases, accepted answers and received votes. Migration 006 extends this existing aggregate.
- `community_is_moderator()` — current verified user's role status only.

Helper functions live in the non-exposed `community_private` schema, with an empty search path and explicit schema-qualified objects. Only harmless visibility/role/normalization predicates have grants required by RLS/search. Auth checks and rate functions are not callable by clients.

## Limits and economics

Titles: 180 characters maximum; under 20 is guidance, not rejection. Root body: 20–20,000 characters. Prompt: 10–20,000 characters. Comments/answers/results: 2–20,000 characters. Five tags maximum, each 1–30 characters. Four images maximum per contribution. Images are decoded with a pixel limit, metadata stripped, orientation applied, resized within 1600px (512px profiles) and encoded once to WEBP.

Both application and database mutation boundaries reject action payloads above 180,000 bytes. LinkedIn profile URLs are capped at 300 characters. Result-upload slots require the completed member profile; profile-photo slots are available during verified onboarding.

Fixed database limits: 100 successful actions per 10 minutes, 20 publication/edit attempts that commit per hour, 12 upload slots per day, 10 reports per day. Failed transactions roll back their counter changes; the limits constrain successful work, and Supabase Auth/hosting request controls still matter for abusive failing requests. Caller-supplied rate parameters are ignored. Database advisory locks serialize an account's writes and exact-publication duplicate checks.

Feeds use 20 records per page, conversations use ten direct children at a time, plus a separately loaded accepted answer; replies load on expansion, activity indicators batch reads, and sitemap partitions use 1,000 candidates. No realtime subscriptions, AI calls, embeddings, paid search service or continuous background worker is required.

## Operations and retention

Review `/community/moderation` regularly. Inspect each image before approving it; then approve the associated contribution. Reports do not automatically hide legitimate content, but open reports remove the root discussion from indexing eligibility. Restrictions stop new participation without silently erasing the author's existing work.

Run small, reviewed cleanup batches. Old rate-limit windows can be deleted after two days. Unattached uploads older than seven days are candidates only when **no profile references them**. First enumerate candidates:

```sql
select m.id, m.path
from public.community_media m
where m.entry_id is null
  and m.created_at < now() - interval '7 days'
  and not exists (select 1 from public.community_profiles p where p.photo_id=m.id);
```

Delete approved candidates through the Supabase Storage API before deleting their metadata rows. Do not remove files by writing to `storage.objects`. Account erasure and moderation appeals are handled by an operator via the published contact address; plan related content/report/audit retention before hard-deleting an Auth user, because foreign keys intentionally prevent accidental loss of conversation and moderation evidence.

## Local verification (no hosted writes)

`npm test` runs `community-database.test.mjs` against the actual migration SQL using local PostgreSQL roles and stubbed Auth/Storage schemas. `tests/community/qa-backend.mjs` provides a localhost-only transport fixture for production-browser QA. Its users, sign-ins, emails and storage transport are simulated; never deploy this script or use its test credentials in hosting configuration. The application has no fixture-specific authorization bypass.

To reproduce the local production-browser runs, stop any preview on ports 3219 and 4319, then run:

```text
node tests/community/run-browser-qa.mjs
```

The runner generates random process-only test tokens, starts the localhost SQL/Auth/Storage simulator, builds the application against it, runs both browser suites, and stops its own child processes. Never deploy the fixture. Set `COMMUNITY_PLAYWRIGHT_PATH` to an installed Playwright package when outside this machine's bundled Codex runtime. Evidence is written under ignored `artifacts/community/`.

After the runner finishes, run `npm run build` without test variables to replace the local fixture build. Then start the clean preview and run `node tests/community/disabled-smoke.mjs`. The runner does not write `.env` files.

The initial QA run bypasses browser CSP only for the HTTP localhost transport. Test the hosted HTTPS project separately with CSP active. `PROMPT_QA_ORIGIN=http://localhost:3219` configures the existing original-library SEO audit for this local preview port.


## Portfolio and conversation extension (migration 006)

Run only after 004 and 005. The prior migrations are unchanged. No hosted migration was run during this implementation.

`community_profile_featured` stores only `(profile_id, entry_id, position, created_at)`, not duplicate content. Positions are constrained to 1–6 and unique per owner; the deferred unique constraint allows atomic reorder. The owner/entry pair is unique. RLS checks current content and ancestor visibility, author ownership, an empty moderation reason and approved attachments on every public read. Hidden/deleted/pending selections vanish from public reads immediately; the next owner write removes stale selections to free slots.

`community_portfolio_write(action, data)` derives the member from `auth.uid()`, requires verification/profile/guidelines, rejects restricted accounts, takes the same per-user advisory lock as Community V1, and consumes the existing 100-actions/10-minutes allowance. It supports feature, unfeature and complete reorder. A reorder must contain exactly the owner's current distinct selection, at most six entries. Ordinary authenticated/anonymous users have no direct mutation grants. This function uses an empty search path and explicitly qualified database objects.

`community_children(parent, sort, offset, exclude)` returns at most 11 visible direct children (ten plus a pagination sentinel), sorted by votes or newest with stable ID tie-breaking. The accepted answer is excluded from this page and shown first from its own public read. `community_reply_counts(ids)` adds bounded comment/result aggregates without exposing voter identities. `community_search_people(query)` and `community_search_answers(query)` return at most five records each, with a two-character minimum; they reveal only public profiles/visible answers.

The new same-origin `GET /api/community/conversation` is a bounded public read with `no-store` and `noindex`. A target lookup validates that the requested visible entry belongs to the requested root. This supports public answer/result/reply permalinks beyond the first page. It never uses a service key.

The browser uses the existing authenticated `/api/community/actions` transport for portfolio writes. Public pages still use anonymous RLS reads. Private storage, image review, 1 MB and four-image limits, moderation roles, reports and saves retain V1 behavior. Profile indexing still uses `profileIsIndexable`; featuring content does not grant indexing eligibility.

Additional local browser verification: `node tests/community/portfolio-browser-qa.mjs`. The fixture now loads migrations 004–006. Read `COMMUNITY_UX_PORTFOLIO_REPORT.md` for current evidence and limitations.

## Final release hardening (migration 007)

This section supersedes the broad row-returning RPC descriptions above; historical test counts remain historical.

- All four public search/conversation RPCs return explicit projections. People search returns only identity and public bio. Entry searches/conversation omit moderation reasons and generated search vectors.
- Anonymous and authenticated direct table SELECT grants now name columns. Future columns are not automatically readable. Private Storage paths are service-only. The media proxy first checks the requesting user's RLS-visible media ID, then resolves the stored path through the server-only client.
- `community_review_reasons(uuid[])` returns at most 100 requested rows only to their author or a verified moderator. Anonymous callers cannot execute it. The authenticated workspace requests reasons separately; public cards never carry them.
- `community_indexable_profiles(uuid[])` is the shared metadata/sitemap rule. It preserves the existing minimum 40-character bio and an eligible root among the latest 100 public roots. It additionally requires verified Auth, completed guidelines/profile, approved chosen photo, no participation restriction, and no recognized test/fixture identity. It returns only ID, username and the actual profile update date, capped at 100 requested profiles.
- `/community/profile-sitemaps/[page]` uses 100 candidates per page. The Community sitemap index links these alongside the existing 1,000-root partitions. Empty/noneligible profiles never become sitemap URLs; errors produce HTTP 503, not an unfiltered fallback.
- Test account detection covers reserved test email domains and explicit public QA/fixture markers. Operators must mark or restrict any additional test accounts; software cannot infer an unmarked synthetic account reliably.

Before running any hosted SQL, positively identify a nonproduction staging project and inspect its migration ledger. The local checkout has no configured staging project or keys. Hosted Auth, email, Storage, cross-user RLS and moderation remain unverified. See `COMMUNITY_RELEASE_READINESS_REPORT.md` for current release evidence and exact staging steps.
