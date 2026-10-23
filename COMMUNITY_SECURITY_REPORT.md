# Community V1 security review

Scope: local source review, PostgreSQL migration/RLS tests, internal endpoint checks, dependency audit, production build and fixture-browser QA. **Hosted Supabase has not been modified or certified.**

## Trust boundaries reviewed

| Threat | Control |
|---|---|
| Forged author or profile ID | Server verifies bearer token; SQL derives `auth.uid()` independently and ignores caller author/role fields |
| Unverified participation | Server `getUser()` plus SQL lookup of `auth.users.email_confirmed_at`; completed profile/guidelines required after setup |
| Cross-user edits/deletion | Explicit owner checks under row locks; no direct client mutation grants |
| Forged accepted answer | Only question owner; answer must be published and belong to that exact question |
| Inflated votes/ratings | Unique `(user_id,entry_id)` keys, self-vote/rating rejection, aggregate reads only |
| Private saves/reports | RLS: saves owner-only; reports moderator-only |
| Hidden children or images leaking | Recursive ancestor visibility; private image metadata lookup under caller/anonymous RLS before any privileged Storage read |
| Broad existing Storage policies | New restrictive policy excludes the Community bucket for anon/authenticated users; private bucket requires server transport |
| Upload MIME spoofing/decompression abuse | Client limit plus streamed server byte limit, decode/format check, animation rejection, pixel limit and re-encoding; bucket limit too |
| Path traversal/overwrite | Generated UUID path under verified user ID; original filename ignored; `upsert:false` |
| Image metadata disclosure | Re-encoding strips source metadata; private same-origin proxy uses no-store and nosniff |
| Unsafe rendering | React text rendering and plain-text prompt/body output; no user HTML execution; existing JSON-LD helper escapes `<` |
| SQL injection | Parameterized RPC/data queries; fixed function names; empty search paths and schema-qualified privileged objects |
| CSRF | Community mutations require an explicit bearer token, not ambient authentication cookies; no cross-origin permissive app API CORS |
| Open redirects | Return path allowlist, same origin, backslash/control-character rejection |
| Spam/flooding | Fixed account write/upload/report limits, exact-duplicate checks under advisory lock, rule-based review and account restrictions |
| Role escalation | Moderator role table has no client access; operator-only bootstrap; all decisions verify role and record reasons |
| Secret leakage | Service key confined to server module/image routes; browser uses only public URL/anon key; client bundle checked for server key markers/test service token |

## Local tests

Latest results: **77/77 automated tests passed; 15/15 production-browser fixture scenarios passed; typecheck, lint and production build passed.** No uncaught browser JavaScript errors were recorded. The final upload authorization tightening is covered by the database regression: result images require a completed profile, while profile photos are available during onboarding.

Database tests execute migrations 004/005 with PostgreSQL `anon`, `authenticated` and service roles, simulated Auth identity, and a deliberately broad pre-existing Storage policy. Coverage includes unverified/anonymous denial, unique usernames, LinkedIn host restrictions, missing guidelines acceptance, private profile email boundary, direct-write denial, cross-user actions, unique votes/ratings, accepted answers, reply depth, duplicates, prompt provenance, moderation, reports/indexing, hidden descendants, media ownership/size, private bucket restriction, account restrictions, soft deletion and immutable rate limits.

Pure tests cover title non-rewriting, Unicode, title warnings, image size/MIME, safe redirects, LinkedIn validation, deterministic safety signals, contribution bounds and genuine QAPage eligibility. Existing tests continue to exercise inquiry storage-first behavior, notification failures, Turnstile handling, Launchpad and original Prompt Library functionality.

The browser suite also submits a >1 MB body and SVG disguised as PNG to the actual Next image endpoint; rejection occurs before storage. It exercises approved result visibility through the image proxy, profile onboarding, persistent identity, saves, voting, reports and moderation using fixture accounts. These are not live provider receipts.

## Dependency audit

The initial audit found five package advisories, including critical Next.js and high image-processing issues. Compatible updates were applied through the existing package ranges. The subsequent npm audit reported **zero known vulnerabilities**. This is registry evidence at the time of the run, not a claim that the dependency graph is vulnerability-free forever. No paid service was introduced.

## Limitations and operational controls

Deterministic rules detect selected unsafe URL patterns, threats, exploitation/scam phrases, excessive links, contact details and credential-like text. They do not semantically understand all content. Quoting an unsafe phrase for education can enter review. Images are queued because MIME validation cannot establish image safety. Human moderation remains necessary for harassment, impersonation, exploitation, rights and context.

Rate-limit increments roll back with failed database transactions. They constrain successful actions and upload slots, not every invalid network attempt. Use Supabase Auth rate controls and the hosting platform's request protection; no unlimited background process or extra rate-limit service is required.

Browser sessions are persisted by the Supabase SDK. XSS prevention therefore matters; no user HTML/Markdown execution is enabled. Existing site CSP retains its pre-existing inline allowances. Fixture-browser tests bypass CSP solely to reach the HTTP local simulator; HTTPS hosted Auth/Storage behavior under real CSP must still be verified.

A separate clean-build smoke suite ran **12 checks with CSP active** and no fixture backend: eight public routes, disabled mutation rejection, mobile/desktop hero fallbacks and video-facade activation. It recorded no uncaught JavaScript errors or CSP violations. Final client-bundle scanning found no fixture keys/backend URL or server-key markers. This checks unconfigured/public behavior; it does not replace the hosted authenticated acceptance gate.

Withdrawal is a public removal, not immediate erasure of every related record. Private moderation evidence and stored images remain subject to operator retention. The schema's foreign keys deliberately prevent careless Auth deletion from orphaning history. Public profiles explicitly state that LinkedIn is member-supplied.

## Hosted acceptance gate

After staging setup, verify with two real verified users, an unverified account and a moderator:

1. Signup/confirmation/recovery email delivery, expiry, resend and permitted callback URLs; incomplete profiles cannot contribute.
2. Complete identity once, refresh/relogin, then post/comment/vote without re-entering identity; verify no email in anonymous responses or HTML.
3. Direct Supabase requests cannot write tables, impersonate authors, read another user's saves/reports or access Community Storage.
4. Real upload MIME/byte limits, private image access, rejection, approval, hidden-parent withdrawal and operator review.
5. Cross-user edits, self votes, repeat votes, ratings, foreign accepted-answer IDs, reply-depth limits and remix provenance.
6. Search/duplicates, exact duplicate racing, limits across two requests, indexing/noindex transitions and sitemap removal after reports/hiding.
7. Production CSP, error states during provider failure, and a controlled contact/email regression check.

No claim of hosted readiness should be made before that gate passes. Setup and moderation-role assignment are documented in `SUPABASE_COMMUNITY_SCHEMA.md`.

## Final release hardening follow-up

Migration 007 replaces all broad public search/conversation return types with explicit fields and adds column-level read grants. Private review reasons and Storage paths are no longer readable through direct anonymous table requests; owners/moderators obtain reasons from a bounded authenticated RPC. Public cards use explicit projections. The image proxy checks caller RLS visibility before privileged path lookup. Regression tests add hypothetical private columns to prove public projections cannot expand. Migrations 001-006 are unchanged. See COMMUNITY_RELEASE_READINESS_REPORT.md for newly executed QA; earlier evidence above is historical.
