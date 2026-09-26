# Community V1 SEO / AEO / GEO

## Implementation

Public discussions, prompts, answers, results and creator profiles are server-rendered. Metadata uses the authored title, a bounded body description and one canonical content URL. Community text is rendered as text, with real stored publication/modification dates and links to the saved public author profile. No fake dates, endorsements, reviews, answer counts or outcomes are generated.

The original Prompt Library metadata, canonical paths, internal links and sitemap remain intact. `/prompts` adds the Community source link; `/ai-experiences` and `/prompts/community` provide clear introductory copy and server-rendered feeds. Both emit CollectionPage and BreadcrumbList data. Discussion pages use breadcrumbs and internal links to profiles, tags, remix sources and relevant original-library/service pages.

## Indexing gate

Publication and indexing are separate. `community_indexable()` requires a public root with public ancestors, a 20–180 character title that is not all capitals/mostly symbols, a body of at least 120 characters, no current rule reason, no open report on the discussion or its replies, no unapproved attachment and no other published root with the same normalized title. Other public submissions return `noindex,follow`.

This is a deterministic eligibility heuristic, not an assertion of editorial quality, factual truth, semantic uniqueness or search-engine approval. Related posts remain publishable. A creator profile needs a substantive bio and an eligible public root contribution before it becomes indexable. Private account/saved/moderation and publishing pages are always noindex.

## Structured data

- `QAPage` only for an actual question with at least one public answer belonging to it.
- `acceptedAnswer` only for the question owner's selected public answer; other qualifying answers become `suggestedAnswer`.
- If the accepted answer falls outside the current reply page, it is separately loaded and shown so the emitted schema matches visible content.
- Unanswered questions, experiences and prompts use `DiscussionForumPosting`, not fabricated FAQ answers.
- `ProfilePage` identifies the public member, member-supplied LinkedIn link and stored profile dates; never email.
- JSON-LD uses the existing escaping helper. No fake aggregate rating or Product review rich-result claim is emitted.

## Sitemaps and crawlers

The existing `/sitemap.xml` retains every original website/Prompt Library route and adds Community landing/guidelines pages. `robots.txt` advertises the original sitemap plus `/community/sitemap-index.xml`. The Community index splits published root candidates into 1,000-row pages. Each `/community/sitemaps/[page]` applies the same indexing eligibility function and emits only eligible root URLs with actual stored modification dates. Account, composer, API and saved-content URLs are absent.

Public creator profiles are discoverable through contribution links and use their own canonical/noindex decision. They are not separately enumerated in the V1 sitemap. Feed search/filter URLs canonicalize to the clean collection route. Unknown IDs and usernames return 404; a community prompt requested under the experience route redirects to its canonical prompt route.

## Local evidence and limits

Latest original-library HTTP audit: **29 pages, zero failures**. Community schema tests and browser canonical/QAPage/ProfilePage/sitemap checks pass as part of the 77-test suite and 15-scenario local browser run. No hosted migration or crawler submission occurred.

Automated tests cover default noindex metadata, accepted/suggested answer structure and exclusion of hidden or unrelated answers. Browser tests inspect server-rendered content, canonical URLs, private-email absence, QAPage, ProfilePage and eligible sitemap entries. The existing original-library HTTP audit covers all 29 original routes and now checks the new Community link over HTTP.

These controls support discoverability by search engines and answer systems. AEO/GEO here means clear crawlable content, source identity, context and machine-readable relationships. It does not imply Google indexing, rich-result eligibility, AI citation, search ranking, traffic or conversion gains. No external indexing submission or hosted crawler verification was performed.

## Final release follow-up: portfolio sitemap

Public portfolios are now enumerated under `/community/profile-sitemaps/[page]`, advertised by the Community sitemap index. Profile metadata and sitemap inclusion both call `community_indexable_profiles` through the shared server layer. Existing bio/root-quality thresholds remain one rule, with verified/profile/photo/restriction/test-account checks. Sitemap pages read 100 candidates, expose username URLs with stored profile modification dates, and return 503 on a provider error. Empty, restricted, unverified and recognizable fixture accounts are excluded. This supersedes the V1 statement that profiles are not enumerated. Current checks are in COMMUNITY_RELEASE_READINESS_REPORT.md; original evidence above is historical.
