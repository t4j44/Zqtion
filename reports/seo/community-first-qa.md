# ZQTION COMMUNITY-FIRST EXPERIENCE — QA RESULT

**Local Community functional checks: PASS. Performance comparison: PARTIAL. Hosted acceptance: BLOCKED / UNVERIFIED as specified below.**

1. **Homepage CTA:** Explore community → /ai-experiences. Upstream Hero3D implementation preserved; final browser clicks pass at 320, 390, 768, 1440.
2. **Mobile secondary CTA:** Explore community posts → /ai-experiences; final real navigation passes at 320, 390, 768. Desktop primary Community link was covered by the retained Auth/UI suites.
3. **Public feed:** anonymous feed, search, filters and prompt browsing work without account redirect or full-screen sign-in. Empty and unavailable fixture modes show honest helpful states. A separate actual disabled production build passes 12 checks.
4. **Anonymous reading:** published post details, question answers, comments/replies and public profiles are readable. Synthetic fixtures are isolated local QA, never production engagement. Private email/hidden content remain excluded by existing server/database contracts.
5. **Participation:** comment/reply/create/save/vote/rating/upload/profile management use existing authenticated boundaries. The inline prompt now says Sign in to participate, with Google primary and Continue with email secondary. Existing verification/onboarding rules remain.
6. **Google/email return:** basic-scope local OAuth simulation, email callback, safe query/post/anchor preservation, onboarding, cancel/error and no automatic comment/vote/save replay pass. Final inline Google test returns to the exact comment area. These are local real-browser flows using simulated transport, not proof that hosted Google works.
7. **Supabase/RLS:** existing SQL/RLS and server functions were inspected and locally tested; no hosted setting, policy or migration changed. Anonymous action requests are refused; disabled mutations return 503. Hosted owner/two-user checks remain required.
8. **Screenshots:** [Community phone/light](regression/screenshots/after/ai-experiences-light-390.png), [Auth account phone/dark](auth/account-dark-390.png), [article phone/light](article-browser/article-fold-light-390.png), [article desktop/dark](article-browser/article-fold-dark-1440.png). Directory indexes may be needed for the route/theme-named captures. Both themes and required widths are covered by responsive matrices; screenshots were visually reviewed where described in production-readiness.md.
9. **Tests:** functional gates below pass; the measured performance comparison remains PARTIAL. Resolved harness/time-budget failures and all valid performance samples are retained; unresolved performance candidates are listed in the linked comparison.
10. **Files changed:** [complete list](files-changed.md), including CommunityProvider/Account, local test harness and SEO/resource modules. Upstream Hero3D/Navbar destinations remain byte-unchanged.
11. **Commit:** base 128bfee73858003dfd89b1f4d07e0ae15bd32156; work branch feature/zqtion-community. The final delivery includes the exact commit SHA of the commit containing this report; no self-referential hash is fabricated here.
12. **Hosted requirements:** canonical hosting, actual Google/Supabase/email acceptance and owner search setup remain blocked; no production deployment performed.

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

- **BLOCKED — canonical hosting:** observed https://zqtion.com redirects to www, which serves an older deployment and returned 404 for the tested resources URL. Owner must remove the opposing hosted redirect and serve the intended apex build before enabling the guarded www → apex rule. No hosting or DNS change made.
- **BLOCKED — hosted provider acceptance:** real Google OAuth, consent/allowlist, email delivery, identity linking and hosted two-user RLS need the owner-run [Google setup guide](../../docs/GOOGLE_OAUTH_SETUP.md). Local Auth/Storage transport is simulated; local SQL/RLS tests do not certify hosted settings.
- **BLOCKED — search account evidence:** an existing Google DNS verification record was detected without retaining its value. No authenticated ownership, indexing or sitemap-submission result is available. Inspect existing Google/Bing properties first; [setup](search-console-setup.md). No IndexNow notification sent.
- **PARTIAL — editorial readiness:** all 28 existing resources remain readable/noindex and excluded from the sitemap until individual human evidence approval. Official reference links do not prove full-workflow outcomes. Twelve [original briefs](content-quality-roadmap.md) are unpublished proposals.
- **PARTIAL — missing dynamic Community pages:** the Next.js streamed missing-discussion response carries HTTP 200 with the framework 404 marker and injected noindex; the most restrictive robots directive applies. Wrong-type and nonexistent resource/static routes return 404. Do not describe all missing dynamic routes as clean HTTP 404.
- **UNVERIFIED — external/device acceptance:** no real AI-answer citation test, Google Rich Results external validation, real bot firewall/IP probe, Safari/WebKit, physical phone, assistive-technology or field performance certification. Axe incomplete rules require human review. External HTTP success does not prove video playback, rights clearance or every source claim.
- **UNCHANGED — authority boundaries:** no main merge, production deployment, hosted migration, RLS weakening, OAuth secret/DNS change, external profile edit/post or Launchpad activation.
