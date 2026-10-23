# Zqtion Prompt Library — implementation report

Implementation started 23 September 2026; final local verification continued 25 September 2026. Prompt editorial dates remain 23 September because the authored content has not changed. This report describes local implementation, not a deployed release.

## Outcome

The website now provides an original, searchable prompt library with 12 distinct prompts, three category hubs, four tool hubs, six method guides and a methodology page. There are 29 indexable library URLs. Copy, deterministic customization, local saves, URL filters, pagination and related prompts are implemented. The source corpus was only read; no corpus files, crawler code or hashes were rewritten. Existing inquiry/email work was preserved.

## Discovery

| Area | Observed state |
|---|---|
| Website | Next.js 16.3.0 App Router; React 19.2.8; strict TypeScript 5.9 |
| Styling | Tailwind 3.4; existing near-black/white/cyan tokens; Instrument Sans and Instrument Serif; dark-only |
| Components | Existing Navbar, Footer, JSON-LD helpers, locally hosted fonts, CSS reveals, Three.js hero, Lenis support and Lucide icons |
| Auth/data | No public account system; Supabase supports inquiry/application/event flows, not prompt accounts |
| Analytics | Existing optional first-party endpoint, Do Not Track and environment switch |
| Content/SEO | TypeScript content files, App Router metadata, sitemap.ts, robots.ts, Article/Organization/Breadcrumb helpers |
| Hosting | Existing Vercel configuration; no hosting configuration or redirects changed |
| Corpus | `E:\projects\zqtion-prompt-corpus`, read-only |
| Index | 103 records: 70 Superdesign UI/design, 31 AI Varsity image prompts, 2 AI Varsity resource lists |
| Usable bodies | 101 structured full_prompt bodies; two resource lists excluded and reported |
| Languages | UI language missing in 70 records; usable image records include 30 mixed-language and 1 English |
| Useful fields | Stable source IDs/URLs/hashes, full_prompt, structured design notes, source categories/tags, prompt completeness |
| Weak fields | UI tools/language absent; image camera/light/material fields often null even when text contains those ideas; categories and tags often repeat; inconsistent taxonomy |
| Completeness | All 101 usable records carry prompt_complete=true; this is source metadata, not independent model-output evidence |
| Duplicates | No identical content hashes among normalized records; repeated titles/styles still require editorial judgment |

Representative index, raw extraction and readable source content were inspected for both scraped sources. Additional source URL indexes were inspected: DesignPrompts 30, UIPrompt 36, OpenArt 1, NanoBanana 11, VibeYourWebsite 41, Emergent 1, Leonardo 22. These are discovery records, not additional scraped prompt bodies. No further crawling was performed. Source QA/provenance/rights reports were read; permission to crawl was not treated as permission to republish.

## Architecture and corpus integration

Read-only corpus → offline parser → general-principle records → separately authored Zqtion briefs → quality/similarity screening → public allowlist JSON → server-only prompt service → pages and bounded public read APIs.

`ZQTION_PROMPT_CORPUS_PATH` configures offline access. Local fallback is the supplied Windows path. The private `.prompt-research` folder contains normalized principles, provenance and detailed comparison results and is ignored by Git. Full source bodies stay in memory for comparison rather than entering the public snapshot. Production uses the portable generated JSON; it does not need the corpus directory or model credentials.

The generator is deliberately an editorial build pipeline: it processes independently authored records, not an automatic paraphraser or a live LLM content generator. Adding a new source record does not automatically publish a page.

## Public data and service

The TypeScript model covers stable IDs/slugs, locale, content type, category, tags, tools, difficulty, style, use cases, audience, prompt, typed variables, structured specifications, learning anatomy/tips/mistakes/method links, examples, preview metadata, author, dates and SEO. Explicit IDs preserve saved identities if the editorial order changes. Private provenance is excluded from the public schema.

Services: `searchPrompts`, `getPromptBySlug`, `getPromptsByCategory`, `getPromptsByTool`, `getRelatedPrompts`, `getPromptMethods`, populated hub discovery and route enumeration. Pure search/customization/ranking functions are separate from React. Future MCP can adapt these functions; no MCP transport or server was built.

Search matches normalized tokens across title, description, type, category, style, tags, tools, use cases, method IDs and full prompt body. Results are ranked by title matches and deterministic tie-breaks. It is tokenized substring search, not typo-tolerant fuzzy search. Filters cover category/content family, tool, style and difficulty. Results are bounded to nine cards per page. Related prompts rank category, tags, tools, use case and style rather than random order.

## Routes and content counts

| Route family | Count | Purpose |
|---|---:|---|
| `/prompts` | 1 | Searchable library, learning entry points and tool links |
| `/prompts/{ui,image,vibe-coding}` | 3 | Substantive category introductions, usage notes and collections |
| `/prompts/[category]/[slug]` | 12 | Four UI, four image and four coding briefs |
| `/prompts/tools` and `/prompts/tools/[tool]` | 5 | Hub plus Claude Code, Codex, Cursor and Gemini guides |
| `/prompts/methods` and `/prompts/methods/[method]` | 7 | Hub plus structured, constraint, iterative, image, UI and coding methods |
| `/prompts/methodology` | 1 | Research, writing, QA and preview disclosures |

Other prompts: 0. Video, automation, agents, MCP and industries have no thin or empty public hubs. The content-type model leaves room for later expansion. English locale and optional lesson IDs support future localization/education without duplicating English pages under other locales.

Public APIs: `/api/prompts` returns bounded card summaries; `/api/prompts/[slug]` returns one default-customized public prompt for card copying. Both are noindex and neither exposes corpus files. Unknown routes and mismatched category/slug combinations return 404.

## Components and user experience

- PromptExplorer: labelled search, filters, result status, empty/error states, reset, URL history and pagination.
- PromptCard: original illustration, task context, tool labels, copy and save.
- PromptPreview: lightweight CSS/DOM composition examples with reserved dimensions. No source screenshots or unverified generated-output claims.
- PromptBlock: complete server-rendered text, bounded scrolling, wrapping, customization fields, reset and copied feedback.
- PromptActions: Clipboard API plus selection fallback, focus restoration, local save and non-invasive analytics events.
- Collection and LibraryShell: server data access, headings, breadcrumbs and structured metadata.

Saves persist in versioned browser localStorage and synchronize between tabs on the same origin. They do not sync between accounts/devices. Customizations stay in page memory. Clipboard and storage failures return inline feedback. Changing customized text resets the previous copied confirmation.

Navigation and footer link to the library. The homepage receives one small entry point. Existing service, contact and animation flows were not redesigned. The expanded mobile navigation scrolls on short screens. A browser-discovered sticky-sidebar issue was fixed: the notes panel stops sticking on windows 900px high or shorter, so Save remains reachable.

## SEO, AEO and GEO

Each of the 29 URLs has unique metadata, a clean canonical, OpenGraph/Twitter data, one H1 and meaningful server-rendered content. Prompt pages start with an answer-first summary, explain intended users and outputs, and include specifications and learning material. Method pages provide definitions, formulas, before/after examples, mistakes and useful FAQs.

Structured data uses CollectionPage or Article with author identity, and matching visible BreadcrumbList data where breadcrumbs appear. Prompt Article data includes the actual editorial dateModified. Sitemap entries cover all library routes and use content dates only where available. Search/filter combinations and APIs are excluded. Filtered collection pages canonicalize to their clean hub. Existing robots policy permits public pages; private files are protected by not being served, not by robots rules.

Internal links connect prompts, categories, tools, methods and related prompts. The existing experimental llms.txt map is extended. These are readability and discovery foundations, not a guarantee of indexing, rankings or AI recommendations.

Tool descriptions link to primary documentation: [Claude Code](https://www.anthropic.com/engineering/claude-code-best-practices), [Cursor Agent](https://cursor.com/docs/agent/overview), [Gemini image prompting](https://blog.google/products-and-platforms/products/gemini/image-generation-prompting-tips/) and [Codex](https://developers.openai.com/codex/). Tool labels describe intended workflows, not model-by-model certification.

## Quality and originality evidence

All 12 prompts passed required-field, bounded-length, taxonomy, unique-ID/slug/body, placeholder, fence, Unicode, learning and metadata checks. All 12 were compared against all 101 source prompt bodies: 1,212 pairs. Zero were flagged. Highest five-token overlap: 0.41%; highest normalized token Jaccard similarity: 14.80%; longest exact token sequence: 5 words.

Screening flags more than 15% five-gram overlap, more than 65% normalized-token similarity, 18+ consecutive matching tokens or identical sequences of at least three headings. This does not establish semantic originality or legal clearance. See `PROMPT_ORIGINALITY_REPORT.md` and `PROMPT_LIBRARY_QA_REPORT.md`.

## Verification

| Check | Evidence |
|---|---|
| Unit/regression tests | 57 passed, including 14 prompt-specific tests and the pre-existing inquiry, application and hero tests |
| Lint | Full repository ESLint passed; final changed component rechecked |
| Typecheck | Standalone TypeScript passed; Next production build also ran TypeScript |
| Production build | Passed; 66 static generation tasks across the whole website; prompt details and methods prerendered, search collections server-rendered |
| HTML SEO audit | 29 actual HTTP pages, zero failures; unique metadata, H1, canonical, JSON-LD, content, links, orphan check, sitemap and 404 probes |
| Private-data bundle scan | No corpus-path/provenance/source-ID markers found in `.next/static` |
| Responsive library | 320, 360, 375, 390, 412, 430, 768, 1024, 1280, 1440 and 1920px: no horizontal overflow |
| Responsive inner pages | Category, three detail types, method and tool pages at 390, 768, 1024 and 1440px: no page or prompt-text horizontal overflow; one H1 each |
| Browser interaction | Search, combined category/style filtering, empty state/reset, copy and clipboard text, customization, save/reload, pagination, Back restoration, breadcrumbs, mobile menu/Escape/focus return. Final rebuilt preview verified that changing customized text resets Copied and subsequent clipboard text contains the new value. |
| Keyboard | Visible focus confirmed on customizer input; controls reachable; short-desktop Save fix verified |
| Console | No warnings/errors captured during the six inner-page responsive checks |

Browser layouts were inspected on desktop and mobile. The original full-page screenshot helper produced stitching artifacts, so later visual review used viewport captures and DOM measurements. Browser emulation is not physical-device certification. No Lighthouse score, field Core Web Vitals, external rich-results certification, screen-reader certification or hosted-provider result is claimed.

## Performance and privacy

No new dependencies, remote preview assets or continuously running library animation. Preview aspect ratios reserve layout space. Only card summaries for the current page enter collection props; prompt text is loaded for a single copy action or detail page. Search remains on the server. The full dataset is not placed in public/ or imported into client modules.

Existing analytics receives prompt_view, prompt_copy, prompt_search, prompt_filter, prompt_customize and related_prompt_click when enabled. Allowed added metadata is slug/category/tool/result count; raw query text and customization values are not sent. Do Not Track and the existing feature switch remain in force. Analytics provider receipt was not verified.

## Strongest ten pages (editorial assessment, not measured popularity)

1. `/prompts/vibe-coding/safe-csv-import-wizard` — explicit validation/write boundary and retry checks.
2. `/prompts/vibe-coding/evidence-led-bug-fix` — reproducible evidence before edits.
3. `/prompts/ui/fieldwork-research-dashboard` — separates observations from interpretation.
4. `/prompts/ui/transparent-pricing-comparison` — honest billing and limits.
5. `/prompts/image/ceramic-material-study` — controlled material and identity brief.
6. `/prompts/vibe-coding/local-first-project-planner` — clear persistence limits and testable scope.
7. `/prompts/ui/accessible-course-navigation` — explicit learning states and keyboard behaviour.
8. `/prompts/image/modular-speaker-exploration` — functional design review and controlled variation.
9. `/prompts/vibe-coding/accessible-filterable-catalog` — shareable discovery without fake commerce.
10. `/prompts/image/book-cover-paper-landscape` — composition, typography space and production handoff.

## Next ten content opportunities

Prioritize only after collecting user task feedback; none are silently implemented by this task.

1. Reference-image identity preservation, with owned input/output examples.
2. UI form error recovery with tested keyboard flows.
3. Empty/loading/offline state design for an existing product.
4. Image-editing briefs that preserve packaging geometry.
5. Accessible mobile navigation implementation with recorded QA.
6. Video shot planning with continuity and camera constraints.
7. Text-to-video briefs evaluated on a named tool/version.
8. Human-approved automation handoffs with failure recovery.
9. Research-agent source verification and uncertainty reporting.
10. MCP tool-integration briefs once an actual supported workflow exists.

## Remaining limitations and technical debt

- No hosted release, deployment, migration, commit or push was performed.
- No external model evaluation of all 12 prompts; expected examples and previews are clearly illustrative.
- Search uses token matching, without typo tolerance. Precompute a search index if volume or measured latency warrants it.
- Similarity checks are lexical; semantic review and documented rights remain separate responsibilities.
- The normalizer extracts conservative general principles from available text and does not infer a complete structured design system from every record.
- Saves are origin/device-local. Clearing storage removes them; no cloud backup or authentication was added.
- Guides and taxonomy are maintained in TypeScript; there is no editor/CMS workflow yet.
- Large-scale content needs per-prompt tool/model/version evaluation, an editorial review process and a performance budget before expansion.
- Broad production form/provider, physical-device, assistive-technology and field-performance certification are outside this local feature verification.
- Industry hubs, video, automation, agents, MCP, Bangla translations and a full learning platform remain intentionally absent until useful content and scope exist.

## Files

31 new files: four reports; five `app/prompts` files; two `app/api/prompts` handlers; seven `components/prompts` files; two generated content files; `data/prompt-guides.ts`; `docs/PROMPT_LIBRARY.md`; five `lib/prompts` files; three `scripts/prompts` files; and `tests/prompts.test.mjs`.

13 existing files touched for this feature: `.env.example`, `.gitignore`, `README.md`, `package.json`, `app/page.tsx`, `app/sitemap.ts`, `app/api/analytics/route.ts`, `components/Analytics.tsx`, `components/Navbar.tsx`, `components/Footer.tsx`, `data/site.ts`, `lib/request-validation.ts`, `public/llms.txt`. Several already contained unrelated user edits, which were preserved. Other dirty files in Git belong to the pre-existing inquiry/email work.

## Commands and handoff

```text
npm run prompts:inspect
npm run prompts:normalize
npm run prompts:sync
npm run prompts:validate
npm run prompts:seo
npm run dev
npm run typecheck
npm run lint
npm test
npm run build
npm run start -- --port 3100
```

Checks in this environment also used direct local binaries: `node node_modules/typescript/bin/tsc --noEmit`, `node node_modules/eslint/bin/eslint.js .`, `node --test tests/*.test.mjs`, `node node_modules/next/dist/bin/next build`, and `node scripts/prompts/seo-audit.mjs`. The SEO command expects a running local production preview, by default port 3100. Full maintenance details are in `docs/PROMPT_LIBRARY.md`.
