# Zqtion Community V1 implementation

Local implementation in `E:\zqtion\website of zqtion`. No commit, push, deployment or production database change.

## Delivered

| Area | Implementation |
|---|---|
| Auth | Supabase email/password signup/login, email confirmation, resend, password reset, persistent session and sign-out |
| Onboarding | One stored profile per Auth user; name, unique username, required LinkedIn profile, Zqtion avatar or uploaded photo, optional bio and versioned guidelines acceptance |
| Persistent identity | Every contribution derives its author from Auth and loads the saved profile; contribution forms never ask for identity again |
| Experiences | Questions, tips, experiences, troubleshooting, showcases, tutorials and tool discussions |
| Conversation | Answers, comments on roots/answers/results/prompts, two nested reply levels, upvotes, accepted answer, editing and withdrawal of own content |
| Prompts | Community source added beside Zqtion Original; prompt text, copy, ratings, private saves, comments, result images and credited remixes |
| Sharing | Mobile-first `/share`, type choices, session slug retention, draft restoration during sign-in, exact-wording preview |
| Assistance | Deterministic `suggestCommunityTitle`, `suggestCommunityTags`, `semanticDuplicateSearch`, `moderateCommunityContent` interfaces; no AI API needed |
| Duplicates | FTS, optional trigram search, normalized title and body comparisons, category/tool/tag context, explicit continue action and database exact-duplicate protection |
| Moderation | Rule-based review signals, image quarantine, private reports, manual queue, approve/hide, account restrictions and audit history |
| Discovery | SSR content, metadata/canonicals, conditional indexing, QAPage/DiscussionForumPosting/ProfilePage/CollectionPage, breadcrumbs, sitemap partitions and existing robots integration |
| Conversion | Subtle Work with Zqtion links use the existing contact flow; existing services and original library remain accessible |
| Privacy/analytics | Public identity excludes email; saves and reports protected; guidelines/privacy updated; publication and existing service CTA analytics honor the existing switch and Do Not Track |

## Routes

- `/ai-experiences` — searchable/filterable/paginated discussions.
- `/ai-experiences/[id]` — server-rendered discussion and conversation.
- `/prompts/community` — Community source within the existing Prompt Library.
- `/prompts/community/[id]` — prompt, ratings, remixes, comments and results.
- `/share?type=prompt&session=example-session` — optional type/session; `remix=<uuid>` supplies a published source.
- `/community/account` — Auth, one-time setup, voluntary profile edits and return to original action.
- `/community/saved` and `?tab=mine` — private saves and own contributions, including pending ones.
- `/community/moderation` — private authorized moderator interface.
- `/community/guidelines` — versioned participation policy.
- `/u/[username]` — public creator identity and public contribution statistics.
- `/community/sitemap-index.xml`, `/community/sitemaps/[page]` — dynamic eligible content sitemaps.
- Internal application endpoints: `/api/community/{actions,me,workspace,similar,upload,media/[id]}`. These are application plumbing, not a new supported public developer API.

## Preservation and integration

Original prompts, source corpus, generation pipeline, customization, related content, tool/method hubs and local saves are retained. The library landing page gains a source switch. Its SEO checker now verifies the new Community entry link instead of treating any route outside the original corpus as broken. Main navigation gains Community; the desktop menu breakpoint moves to 1280px to accommodate the additional item. Footer links follow the same existing navigation list.

Inquiry handlers, email templates, form logic, Launchpad backend, existing migration files and private environment files are not changed by Community implementation. Existing dirty work was retained. Shared analytics adds event names; privacy and sitemap/robots gain Community coverage. Existing package versions were updated within their compatible ranges to resolve dependency advisories; the lockfile records the installed fixes. PGlite is a development-only test dependency.

## Publication behavior

The composer checks required fields, gives optional title guidance, searches related discussions, displays category/tool/tags and exact text, and requires Publish. No automatic paraphrasing or unsupported keyword insertion occurs. The deterministic title provider intentionally returns no rewritten title when there is no guaranteed meaning-preserving transformation.

Normal text may publish immediately. Safety signals or attachments queue a contribution for review. Images are never public before moderation. A related discussion is advisory; exact repeated title/body/prompt content is rejected in the database. A submitted item that enters moderation is described as saved for review, never as publicly published.

## Validation evidence

Recorded September 26, 2026:

- Full Node suite: **77 tests passed**, including 20 Community tests and 57 existing tests.
- Typecheck and ESLint: passed.
- Production build: passed with Next.js 16.3.6; final build also checked with Community disabled and no fixture variables.
- Production-browser fixture suite: **15 scenarios passed**, zero failures and zero uncaught JavaScript errors. Includes onboarding, original-action return, publishing/session tags, comments/answers, vote/save, prompt rating/remix, image upload/rejection, reports/moderation, profiles, schema/sitemap, original-library interactions and controlled contact-failure UI.
- Clean-build smoke suite: **12 checks passed with the real production CSP active**, zero page errors/CSP violations. Includes eight public routes, disabled mutation HTTP 503, mobile reduced-motion fallback, unavailable-WebGL fallback and video-facade activation (external video intercepted).
- Responsive checks: six routes at each of **320, 360, 375, 390, 412, 430, 768, 1024, 1280, 1440 and 1920px**; no horizontal overflow. Mobile navigation/Escape and reduced motion checked. Screenshots: `artifacts/community/mobile.png`, `desktop.png` (local fixture content clearly labeled).
- Original Prompt Library: 12 records valid; **29 HTTP HTML/SEO pages, zero failures**.
- Dependency audit after compatible fixes: **zero known vulnerabilities**. Installed Next.js 16.3.6 and sharp 0.35.4; PGlite 0.5.8 is test-only.
- Baseline SHA-256 comparison confirmed Community edits did not alter the existing inquiry/email handlers, templates, contact form, Launchpad code, original prompt components/data or migrations 001–003. Approved shared integration edits are listed above.
- Final browser assets contain no fixture credentials, local backend URL or server-key markers. Test processes were stopped; the remaining local preview uses the disabled/unconfigured production build.

Automated verification and browser results are summarized in the security and SEO reports and in local `artifacts/community/browser-qa.json`. Browser testing uses a production Next build against a localhost PGlite transport fixture. Real PostgreSQL permission/constraint functions execute there; actual Supabase Auth mail and hosted Storage are not exercised.

The fixture has an HTTP localhost URL, so that browser context bypasses CSP for the test transport. Production CSP remains unchanged and permits HTTPS Supabase connections. Do not interpret fixture browser success as hosted provider, production CSP, physical-device, accessibility-technology, Lighthouse or search-ranking certification.

## Remaining boundaries

- Hosted migrations and live Auth/Storage acceptance still require the setup in `SUPABASE_COMMUNITY_SCHEMA.md`; the feature switch defaults off until configured.
- Rules and human reports cannot identify every scam, impersonation, private detail or harmful image. All images require manual review. LinkedIn is a required member-supplied link, not proof of identity.
- No paid AI moderation/generation, semantic embeddings, realtime, followers, DMs, monetization, MCP, public developer API, localization or Learn platform was added.
- Moderation and account-erasure requests require an operator. Orphan-image/rate-window cleanup is documented, not a continuously running job.
- Original prompts retain their existing device-local saves; community saves persist to the signed-in account.
- Pagination is deliberately bounded; a reply's parent may be on another conversation page. Each reply keeps its parent reference and root discussion link.
