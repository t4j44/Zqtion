# ZQTION — SEO/AEO/GEO RELEASE CANDIDATE

**Functional source gates: PASS. Performance review: PARTIAL. Production acceptance: PARTIAL, with blocked hosting/provider/search-account gates.**

Build mVbL-NgMsO19eaONBe5ol; base 128bfee73858003dfd89b1f4d07e0ae15bd32156; branch feature/zqtion-community. The final reply identifies the pushed commit containing these files.

## Changes and evidence

1. Technical SEO: semantic server articles, exact route canonicals/404s, consistent metadata, private/API/Preview noindex and shared sitemap/publication gates. [Before](technical-audit-before.md), [after](technical-audit-after.md).
2. Resource quality: audited all 28 records; removed unsupported verification/pricing/outcomes; attached references; retain noindex pending actual evidence and human approval. [Item audit](resource-evidence-audit.md), [policy](../../docs/RESOURCE_PUBLICATION_POLICY.md).
3. Community: anonymous public reading preserved, participation-only Google/email prompts and exact-return behavior; existing eligible sitemap/RLS contracts unchanged. [Requested 12-part report](community-first-qa.md).
4. Structured data: truthful Organization/Gruffet identity, conditional resources TechArticle, deduplicated real accepted-answer relationships and visible-content Community checks. [Schema report](structured-data-report.md).
5. Crawlers: public search/retrieval allowed, render assets available, API/private content excluded appropriately, training disabled pending owner opt-in. Optional llms.txt/ai.txt carry no ranking promise. [Crawler report](crawler-access-report.md).
6. Research methods: inspected Agentic SEO Skill, claude-seo, Unlighthouse, Lighthouse CI and Lychee README/license files; used their evidence/crawl/repeated-lab/deduplicated-link concepts through existing tools. No framework/runtime dependency or substantial copied code. [Sources](primary-source-research.md).
7. Roadmap: 12 original unpublished evidence-led briefs, manual validation before editorial publication. [Roadmap](content-quality-roadmap.md).
8. Search baseline: eight reproducible accessible web-search observations; no Zqtion URL in returned sets. Underlying engine/region are not guaranteed. No real AI-answer citation test was run. This is not Google/Bing rank tracking or a citation count. [Benchmark](aeo-geo-query-benchmark.md).
9. Files: [complete release file list](files-changed.md).
10. Manual setup: check the existing Search Console owner before adding verification; resolve canonical hosting first, then inspect actual Google/Bing sitemap/indexing/AI reporting. [Owner checklist](search-console-setup.md).

## Validation

| Gate | Observed result | Evidence |
|---|---|---|
| Unit tests | 130 passed, zero failures | [log](checks/test.txt) |
| Python generator/publication tests | 9 passed | [log](checks/python.txt) |
| Lint / typecheck / prompt SEO | Exit 0; prompt audit 29 pages / 0 failures | [commands](checks/results.json) |
| Production build | 110 static pages; mVbL-NgMsO19eaONBe5ol | [final audit](after-audit.json) |
| Static/metadata audit | 110 routes; 73 unique sitemap URLs; zero failures/duplicate indexable titles | [audit](after-audit.json) |
| Final resource matrix | 28 × 2 themes × 4 widths = 224; 13 journeys; 4 axe scans / zero violations | [results](article-browser/results.json) |
| Auth / profile / Community | 14 / 16 / 15 scenarios; 130 profile reflow checks | [Auth](auth/auth-browser-results.json), [profiles](community/portfolio-browser-qa.json), [Community](community/browser-qa.json) |
| UI / portfolio | 22 / 14 passed | [UI](regression/interaction-results.json), [portfolio](portfolio-interactions.json) |
| Broad layout / accessibility | 360 layouts / zero errors; 56 axe scans / zero violations | [layout](regression/after-measurements.json), [axe](regression/after-accessibility.json) |
| Internal links | 273 pages; zero failures | [links](regression/link-results.json) |
| External links | 35 real deduplicated external links; zero broken/unverified at observation; one synthetic fixture LinkedIn excluded | [external coverage](external-coverage.json) |
| Discovery / schema / crawlers | Zero orphan candidates and duplicate indexable descriptions; 35 effective crawler/path pairs; visible Community schema | [discovery](discovery-and-schema.json) |
| Actual disabled build | cs9eo99iJBF1eZ9GgHIIu, Community false; 12 browser checks, no page/CSP errors; mutations 503 | [build](disabled/build-verification.json), [checks](disabled/disabled-smoke.json) |
| Performance | 12 baseline + 12 final serial runs | [comparison](performance-comparison.md) |

The broad regression suite ran on tyDU1OUnwNDlsXxOBWzrH. The only later product edits were catalogue prose and MCP tool descriptions. The 29 product files match the retained hashes; all predate final build mVbL-NgMsO19eaONBe5ol. The 27 other modules are byte-identical to the broad regression build; MCP handlers were separately checked unchanged. Final resource/API/HTML/journey checks ran on mVbL-NgMsO19eaONBe5ol. This is retained impact evidence, not a claim that every broad suite reran on the last build. [Source proof](retained-regression-source-proof.json), [final hashes](release-verification.json).

The corrected article folds at 390 light and 1440 dark were visually reviewed for hierarchy, byline, evidence notice, navigation and readable measure. The actual article content/table/code capture was also inspected. Browser captures and automated axe checks are not physical-device or screen-reader certification. Historical failed attempts and the exact harness corrections are preserved in [iteration-1](iteration-1/remaining-harness-fixes.md).

## Performance

| Page / device | Performance before → after (run scores) | LCP before → after | CLS after | TBT after | A11y / SEO / best practices after |
|---|---|---|---|---|---|
| Home / mobile | 88 → 84 (88/83/92 → 47/88/84) | 3430 → 3496 ms | 0 | 308 ms | 96 / 100 / 100 |
| Resource / mobile | 91 → 85 (91/91/95 → 85/82/91) | 2819 → 2969 ms | 0 | 402 ms | 100 / 69 / 100 |
| Home / desktop | 99 → 77 (99/98/99 → 99/61/77) | 809 → 772 ms | 0 | 544 ms | 100 / 100 / 100 |
| Resource / desktop | 100 → 79 (100/100/100 → 78/79/100) | 602 → 1121 ms | 0 | 413 ms | 100 / 69 / 100 |

[Full lab method and limitations](performance-comparison.md). One or more median drops cross the review threshold. Performance is PARTIAL: repeat a controlled baseline/candidate comparison on an idle host or real phone before production acceptance; a source push does not establish that result.

## Remaining blockers and limits

- **BLOCKED — canonical hosting:** observed https://zqtion.com redirects to www, which serves an older deployment and returned 404 for the tested resources URL. Owner must remove the opposing hosted redirect and serve the intended apex build before enabling the guarded www → apex rule. No hosting or DNS change made.
- **BLOCKED — hosted provider acceptance:** real Google OAuth, consent/allowlist, email delivery, identity linking and hosted two-user RLS need the owner-run [Google setup guide](../../docs/GOOGLE_OAUTH_SETUP.md). Local Auth/Storage transport is simulated; local SQL/RLS tests do not certify hosted settings.
- **BLOCKED — search account evidence:** an existing Google DNS verification record was detected without retaining its value. No authenticated ownership, indexing or sitemap-submission result is available. Inspect existing Google/Bing properties first; [setup](search-console-setup.md). No IndexNow notification sent.
- **PARTIAL — editorial readiness:** all 28 existing resources remain readable/noindex and excluded from the sitemap until individual human evidence approval. Official reference links do not prove full-workflow outcomes. Twelve [original briefs](content-quality-roadmap.md) are unpublished proposals.
- **PARTIAL — missing dynamic Community pages:** the Next.js streamed missing-discussion response carries HTTP 200 with the framework 404 marker and injected noindex; the most restrictive robots directive applies. Wrong-type and nonexistent resource/static routes return 404. Do not describe all missing dynamic routes as clean HTTP 404.
- **UNVERIFIED — external/device acceptance:** no real AI-answer citation test, Google Rich Results external validation, real bot firewall/IP probe, Safari/WebKit, physical phone, assistive-technology or field performance certification. Axe incomplete rules require human review. External HTTP success does not prove video playback, rights clearance or every source claim.
- **UNCHANGED — authority boundaries:** no main merge, production deployment, hosted migration, RLS weakening, OAuth secret/DNS change, external profile edit/post or Launchpad activation.

## Reproduction

Use existing dependencies. Start the credential-isolated local fixture preview with node scripts/ui-preview.mjs. Run node scripts/seo/checks.mjs and python -m unittest discover -s tests -p test_resource*.py. Run scripts/seo/audit.mjs after, article-browser.mjs, and run-qa.mjs for broad browser checks. Run disabled-preview.mjs for a separate flag-off build (its ignored snapshot contains no .env/Git files); run performance.mjs before/after serially only against the corresponding builds. coverage-provenance.mjs is a one-time pre-rebuild historical assertion; release-report.mjs verifies retained product hashes and final evidence. No test command should target hosted providers.
