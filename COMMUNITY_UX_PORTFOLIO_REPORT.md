# Zqtion Community UX + Public AI Portfolio

Local implementation in `E:\zqtion\website of zqtion`. This extends the existing Community V1. It does not rebuild authentication, identity, moderation, storage, the original Prompt Library or contact/email delivery.

## Outcome and evidence boundary

Community now supports the flow: read → vote/comment/answer → open creator → explore a public AI portfolio → feature/share useful work. Existing contributions remain the source of truth. No fake activity or commercial claims were added.

Local code, SQL/RLS tests and production-browser checks are distinct from hosted Supabase acceptance. No hosted migration, deployment, commit, push, DNS change or production configuration change was performed. The test fixture contains clearly marked local-only people/content and is never imported by the application.

## Global UI

- The navbar already wrapped its icon and wordmark in one accessible `Zqtion home` link to `/`. That structure is retained, and its touch area is now at least 44px tall. Both icon and wordmark were clicked in browser tests on phone and desktop layouts.
- Mobile navigation keeps the existing compact brand, 44px menu button, keyboard focus trap, Escape handling and focus restoration. Desktop keeps the existing wide navigation.
- Mobile Explore links form two columns, including the existing Prompt Library links. Connect also uses two columns; legal links remain separate below a divider. Footer link touch areas are at least 44px; muted footer text contrast was increased. Desktop retains the column layout and spacing.
- The floating WhatsApp control respects `safe-area-inset-bottom` and hides when the footer enters view. Community, portfolio, prompt and form pages use existing inline contact pathways, keeping the floating control clear of editors and actions.

## Feed and discovery

Cards prioritize title and useful text, with a compact linked creator identity, type/date, tool/tags and consistent actions. The meaningful card surface opens the discussion; links, menus, buttons, inputs and text selection retain independent behavior. The heading link provides the keyboard route.

`ExpandableText` uses measured line clamping, See more/Show less, ARIA state and stable collapse scrolling. It is shared by feed previews, long comments, answers and prompt descriptions. Public text is still present in server-rendered HTML.

Upvotes and saves give immediate state feedback and roll back on failure. Upvotes have `aria-pressed`, meaningful labels and compact touch targets. Saved state displays `Saved ✓`. Activity reads are batched by rendered group; failures show a retry instead of silently pretending no activity exists. Multiple cards showing the same contribution synchronize their action state after a mutation.

`ShareButton` uses the Web Share API when available, clipboard otherwise, and a selectable canonical-link fallback if sharing/copying is unavailable. Current search/filter/pagination parameters are never shared.

Desktop filters use simple labeled controls. Phones use a native modal dialog with Escape, focus restoration and scrollable bounds. Search maintains URL state. Results label their type, and unfiltered Community searches also show separate, bounded Profiles and Answers groups. The existing duplicate/title search remains unchanged.

## Discussion, comments and answers

The detail page presents breadcrumb, type/title, linked author, tool/date, body, approved media, primary actions and conversation. Related discussions and relevant prompt pathways follow the conversation. The existing service CTA stays at the end of the page.

Comments and answers use an inline collapsed composer. No identity fields are requested again. Textareas grow within a bounded height; Cancel and Post stay in normal document flow, so there is no fixed composer covering the mobile keyboard area. Submission is locked against double clicks, reports posting state, and preserves the draft on a failed write. A successful write is read back before display because the existing RPC returns a receipt rather than a full entry. A visible confirmation links to the newly posted comment/answer.

Each contribution has a linked identity, timestamp, expandable text, upvote and Reply. Edit/Delete/Report live under More actions; LinkedIn is a secondary compact icon link. Reports continue through the existing private moderation workflow.

Accepted answers appear first with a restrained label and border. Only the question owner can change acceptance. Other contributions can be sorted Top or Newest. Public counts come from existing aggregates, extended only where needed.

Conversations initially load ten direct children plus the accepted answer. View more comments appends another bounded page; crawlable numbered next/previous page links remain. Replies are fetched only on expansion, ten at a time, with View/Hide replies. Existing two-level comment depth is enforced by the original write function; visual indentation is capped. Reply composers identify the target username.

A public link to a deeply nested or later-page contribution loads that specific visible entry in context. Prompt result links now use the canonical prompt route. All target lookups verify the requested root and use anonymous visibility checks.

## Posting flow

The existing `/share` composer, duplicate checks, exact-wording preview, session tags, remix credit and moderation behavior are preserved. Core type/title/body/tool fields stay visible; optional tags and images are disclosed on demand. Result submissions retain their required image picker. No silent rewriting or paid AI was introduced.

## Public AI portfolio

`/u/[username]` now has:

- Avatar, name, username, bio, LinkedIn, actual joined date and Share Profile.
- Actual Prompts, Posts, Answers, Accepted Answers, Upvotes Received and Results Shared counts, extending the existing aggregate rather than maintaining duplicate counters.
- Featured Work with up to six references to the member's approved public contributions.
- All, Posts, Prompts, Answers, Tips & Experiences, and Showcases & Results tabs. Empty tabs are omitted unless directly selected; URLs preserve the selected tab and page.
- Twenty contributions per page with stable date/ID ordering. All represents portfolio work, excluding routine comments. Answers show the question context and acceptance; result/showcase cards show approved media.
- Owner-only Edit Profile, Manage Featured Work, Private Saved Items and Settings controls. Featuring is available in the contribution's More actions menu; management supports unfeature and accessible up/down reorder.

Every shared author identity combines avatar, name and username in one profile link. This applies to feed/search, detail pages, prompts, answers, comments, replies, results and portfolio cards. Remix credit links to the source creator as well. LinkedIn remains secondary and explicitly member-supplied.

## Database and security

New migration: `supabase/migrations/006_community_profile_portfolio.sql`. Migrations 001–005 remain byte-identical to the start of this phase.

The only new table is `community_profile_featured`, referencing existing profile/entry IDs. RLS reads require current ownership, public ancestor visibility, no moderation reason and approved attachments. Public reads immediately omit hidden, deleted, pending or otherwise ineligible selections. The next owner mutation reclaims stale slots.

Mutations use `community_portfolio_write`, with database-derived identity, verified email, completed membership, restrictions, the existing per-user advisory lock and rate allowance. Unique owner/entry and owner/position constraints plus positions 1–6 enforce the cap; reorder requires exactly the current distinct selection. Direct client table mutations are revoked. No new service-key use was added.

Additional bounded read functions provide direct-child pages, comment/result counts and small profile/answer search groups. The existing profile statistics function is extended. Their grants, visibility rules and search paths are explicit. `GET /api/community/conversation` is no-store/noindex and uses public reads.

Existing verified email/profile requirements, private saves/reports, moderator roles, safe text rendering, private Storage, image approval, 1,000,000-byte file limit, four-image maximum and publication/rate rules remain in force. A fresh baseline hash comparison verifies that inquiry/email handlers, original Prompt Library components/data, image endpoints and migrations 001–005 were not edited by this phase.

## SEO / AEO / GEO

Public feeds, profile work and the initial conversation remain server-rendered. Profile metadata now describes an AI portfolio and retains truthful ProfilePage data, actual dates, canonical URL, public bio and linked identity. Email is never included.

QAPage, accepted/suggested answers, DiscussionForumPosting, breadcrumbs, canonical content routes, sitemaps and the existing noindex gates remain. Featuring an entry cannot make a profile indexable. Profiles still require a substantive bio and eligible public root contribution; profile URLs are discovered through creator links rather than separately added to sitemaps.

This preserves crawlability and attribution. It is not a guarantee of indexing, rich results, rankings or AI citations.

## Accessibility, responsiveness and performance

Important actions have 44px targets, visible focus and meaningful labels. Expanders expose state, votes/saves expose pressed state, link tabs use `aria-current`, dialogs manage focus natively, More actions closes with Escape, and form/share outcomes have live status text. Reduced motion is respected. Measured primary palette contrast ranges from 7.37:1 for the muted footer pair to 18.32:1 for primary text; this is not a claim of full assistive-technology certification.

No new dependency or paid service was added. There is no realtime subscription, lifetime-activity fetch or new image provider. SSR data is paginated, images load lazily with bounded display areas, reply requests happen on demand and action-state queries batch by group. Community links disable speculative route prefetch so a visible card list does not trigger background reads of many discussions and profiles. Lightweight loading placeholders reserve space without a blocking spinner.

Responsive browser targets: 320, 360, 375, 390, 393, 400, 412, 430, 768, 1024, 1280, 1440 and 1920px. The focused suite uses 393 × 852 and 400 × 689. Ten routes per width cover feeds, question, experience, showcase, prompt, portfolio, `/share`, account and the original library. Mobile footer layout and fixed-control visibility have separate checks at all eight phone widths.

## Verification

Recorded September 26, 2026. Historical V1 reports retain their original evidence dates; this is the current phase's handoff.

| Check | Result |
|---|---|
| `npm test` | **82 passed**, including original business/Prompt Library/Community tests and five new portfolio/search database scenarios |
| `npm run lint` | **PASS** |
| `npm run typecheck` | **PASS** |
| `npm run build` | **PASS**, including a final rebuild without any fixture environment variables |
| Portfolio production-browser suite | **16 scenarios passed**, zero failures and zero uncaught browser errors |
| Original Community production-browser regression | **15 scenarios passed**, zero failures and zero uncaught browser errors |
| Final default/unconfigured production smoke | **12 checks passed**, actual CSP active, zero uncaught errors/CSP violations |
| Focused responsive coverage | **130 checks**: ten routes at each of thirteen widths; zero page-level horizontal overflow |
| Phone footer | Two-column Explore/Connect and 44px Explore links checked at all eight phone widths; floating control absent over footer |
| Original Prompt Library validation | **12 records valid** |
| Original Prompt Library HTTP SEO audit | **29 pages, zero failures** |
| Protected-file baseline | **24 protected files unchanged**, covering existing migrations, prompt components/services/data, inquiry/email and private image boundaries |
| Client bundle | No fixture backend/key or server-key markers in the final clean browser assets |
| Diff whitespace | `git diff --check` passed; normal existing CRLF conversion warnings only |

Evidence: `artifacts/community/portfolio-browser-qa.json`, `browser-qa.json`, `disabled-smoke.json`, `portfolio-preservation.json`, `portfolio-file-changes.json`. Viewport screenshots were captured and visually inspected for desktop/mobile portfolio, featured work/results, feed, conversation and footer. They are clearly local fixture illustrations.

The fixture and fixture-configured server were stopped. The remaining local preview at `http://localhost:3219` uses the clean default build, with Community participation disabled until configured. No test credentials were written to an environment file or hosting configuration.

## Remaining limitations

- Rapid navigation during the fixture run produced React server-stream cancellation messages (the installed React implementation raises them when its destination closes). No corresponding failed page check or uncaught browser error was observed; the zero-browser-error result is not a claim of empty server logs.
- Real Supabase Auth email, hosted Storage/RLS and provider behavior still require staging acceptance. Local browser tests use actual PostgreSQL rules behind a simulated Auth/Storage HTTP transport, with CSP bypass solely for that localhost transport. A separate unconfigured production smoke run checks actual CSP.
- Browser viewport emulation is not physical-phone or mobile-keyboard certification. Native sharing is exercised through its browser API contract; the device's operating-system share sheet is not certified. No Lighthouse, field Core Web Vitals or screen-reader certification is claimed.
- Top/Newest uses bounded offset pages. New posts or changing vote rankings between pages can change positions; duplicate IDs are suppressed when displaying appended rows. It is not a frozen conversation snapshot.
- Featured state is not updated by realtime pushes. A moderation change takes effect on the next read; already-rendered browser text remains until navigation/refresh, as with other public content.
- Existing rule-based moderation, member-supplied LinkedIn identity, manual appeals/retention and hosted activation boundaries still apply.

## Manual actions required before a hosted release

1. Apply migration 006 to a staging project after 004/005. If Community V1 is not configured yet, follow `SUPABASE_COMMUNITY_SCHEMA.md` for the existing Auth, private bucket, keys and moderator setup.
2. Rebuild against that staging project's configuration and run the hosted two-member/moderator acceptance gate, including featured ownership/reorder/removal, hidden-parent behavior, profile privacy, real email and image delivery.

Deployment, hosted migrations and production activation require separate authorization. Nothing was committed or pushed.


## Files changed in this phase

This list comes from a fresh SHA-256 baseline of the already-dirty checkout, so it separates this phase from earlier work.

### Created

- `app/ai-experiences/loading.tsx`
- `app/api/community/conversation/route.ts`
- `app/prompts/community/loading.tsx`
- `app/u/[username]/loading.tsx`
- `components/community/CardSurface.tsx`
- `components/community/Conversation.tsx`
- `components/community/EntryCard.tsx`
- `components/community/ExpandableText.tsx`
- `components/community/FeedFilters.tsx`
- `components/community/InlineComposer.tsx`
- `components/community/Loading.tsx`
- `components/community/PortfolioControls.tsx`
- `components/community/ShareButton.tsx`
- `supabase/migrations/006_community_profile_portfolio.sql`
- `tests/community/portfolio-browser-qa.mjs`
- `COMMUNITY_UX_PORTFOLIO_REPORT.md`

### Modified

- `app/globals.css`
- `app/ai-experiences/page.tsx`
- `app/ai-experiences/[id]/page.tsx`
- `app/api/community/actions/route.ts`
- `app/prompts/community/[id]/page.tsx`
- `app/u/[username]/page.tsx`
- `components/Footer.tsx`
- `components/Navbar.tsx`
- `components/WhatsAppButton.tsx`
- `components/community/Account.tsx`
- `components/community/community.css`
- `components/community/CommunityProvider.tsx`
- `components/community/CommunityShell.tsx`
- `components/community/Composer.tsx`
- `components/community/Discussion.tsx`
- `components/community/EntryActions.tsx`
- `components/community/Feed.tsx`
- `components/community/Identity.tsx`
- `components/community/Workspace.tsx`
- `lib/community/browser.ts`
- `lib/community/server.ts`
- `lib/community/types.ts`
- `tests/community-database.test.mjs`
- `tests/community/browser-qa.mjs`
- `tests/community/qa-backend.mjs`
- `SUPABASE_COMMUNITY_SCHEMA.md` — adds staging instructions for 006.
- `PROMPT_LIBRARY_SEO_REPORT.md` — refreshed by the existing HTTP audit command.

`Account.tsx`, `Workspace.tsx` and `CommunityShell.tsx` only change link prefetch behavior; their original account/moderation behavior remains intact. No package, environment, inquiry/email or original-library component/data changes were made in this phase. Local QA screenshots and JSON evidence live under ignored `artifacts/community/`.

## Final release preparation follow-up

The subsequent hardening phase adds migration 007 and profile sitemap discovery, preserves the existing UX, and prepares an explicitly authorized feature-branch commit/push. Public identity/content queries now use explicit fields. Private review reasons remain visible to their authors/moderators through a separate bounded read. Earlier no-commit/no-push statements describe this report's original phase. Current release and hosted-verification status belongs to COMMUNITY_RELEASE_READINESS_REPORT.md.
