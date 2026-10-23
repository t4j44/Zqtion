# Technical audit after changes

Measured 2026-10-22T12:19:09.837Z; base commit 128bfee73858003dfd89b1f4d07e0ae15bd32156; candidate build mVbL-NgMsO19eaONBe5ol.

Server-rendered resource headings, paragraphs, safe links, lists, tables, code and inert diagrams replace raw Markdown. One H1, unique canonical type/slug matching, title/description/OG metadata and explicit evidence notices are checked without JavaScript. Unsupported verification, savings, pricing and performance claims were removed. A content-hash-bound human review gate now controls resource indexability, sitemap inclusion and TechArticle markup. Generators emit review candidates rather than overwrite published data.

The 28 unreviewed resources remain accessible but noindex. Public library/prompt/portfolio/eligible Community pages stay discoverable. Sitemap URLs fall from 101 to 73 by removing the 28 unqualified entries; private shells stay noindex. Search render assets are allowed, API responses add noindex headers, Preview adds independent global noindex/robots safeguards, and training controls are separate. Organization identity and early-release Gruffet markup are corrected. Public Community CTAs from upstream are preserved; participation shows Google first and email second with exact-return handling.

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

## Test provenance

The broad regression suite ran on tyDU1OUnwNDlsXxOBWzrH. The only later product edits were catalogue prose and MCP tool descriptions. The 29 product files match the retained hashes; all predate final build mVbL-NgMsO19eaONBe5ol. The 27 other modules are byte-identical to the broad regression build; MCP handlers were separately checked unchanged. Final resource/API/HTML/journey checks ran on mVbL-NgMsO19eaONBe5ol. This is retained impact evidence, not a claim that every broad suite reran on the last build. [Source proof](retained-regression-source-proof.json), [final hashes](release-verification.json).

## Remaining limits

- **BLOCKED — canonical hosting:** observed https://zqtion.com redirects to www, which serves an older deployment and returned 404 for the tested resources URL. Owner must remove the opposing hosted redirect and serve the intended apex build before enabling the guarded www → apex rule. No hosting or DNS change made.
- **BLOCKED — hosted provider acceptance:** real Google OAuth, consent/allowlist, email delivery, identity linking and hosted two-user RLS need the owner-run [Google setup guide](../../docs/GOOGLE_OAUTH_SETUP.md). Local Auth/Storage transport is simulated; local SQL/RLS tests do not certify hosted settings.
- **BLOCKED — search account evidence:** an existing Google DNS verification record was detected without retaining its value. No authenticated ownership, indexing or sitemap-submission result is available. Inspect existing Google/Bing properties first; [setup](search-console-setup.md). No IndexNow notification sent.
- **PARTIAL — editorial readiness:** all 28 existing resources remain readable/noindex and excluded from the sitemap until individual human evidence approval. Official reference links do not prove full-workflow outcomes. Twelve [original briefs](content-quality-roadmap.md) are unpublished proposals.
- **PARTIAL — missing dynamic Community pages:** the Next.js streamed missing-discussion response carries HTTP 200 with the framework 404 marker and injected noindex; the most restrictive robots directive applies. Wrong-type and nonexistent resource/static routes return 404. Do not describe all missing dynamic routes as clean HTTP 404.
- **UNVERIFIED — external/device acceptance:** no real AI-answer citation test, Google Rich Results external validation, real bot firewall/IP probe, Safari/WebKit, physical phone, assistive-technology or field performance certification. Axe incomplete rules require human review. External HTTP success does not prove video playback, rights clearance or every source claim.
- **UNCHANGED — authority boundaries:** no main merge, production deployment, hosted migration, RLS weakening, OAuth secret/DNS change, external profile edit/post or Launchpad activation.

Complete tested routes, canonical tags, statuses, robot directives and parsed schemas: [after-audit.json](after-audit.json). Source changes: [files-changed.md](files-changed.md). Evidence quality: [resource audit](resource-evidence-audit.md).
