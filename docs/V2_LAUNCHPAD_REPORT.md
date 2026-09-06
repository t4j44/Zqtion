# Zqtion V2 and Launchpad — local implementation report

Date: 2026-09-04. Status: implemented for local review, **not production or performance signoff**.

Preview: http://localhost:3233/ and http://localhost:3233/careers. The server binds to loopback only.

No commit, push, deployment, hosted migration, live application, email or production configuration change was performed. Existing uncommitted work was preserved. The new application intake is disabled.

## Final responsive and performance hero pass — 2026-09-05

This section supersedes the earlier hero-performance figures and test count below. The approved visual direction was retained; the work changed delivery, mode selection, lifecycle ownership and phone layout rather than replacing the hero concept.

### Implementation outcome

- Added four explicit live modes: `desktop-webgl`, `reduced-webgl`, `css-motion` and `static`. Viewport, coarse pointer, reduced motion, data saver/effective connection and WebGL capability determine the mode.
- Phones at 767px and below use the CSS artwork only. The final mobile audits and browser checks loaded no Three.js library chunk, no WebGL-scene chunk, no canvas and no WebGL host.
- The WebGL scene implementation is now a separate React lazy chunk. Three.js remains another dynamic chunk and is requested only after a WebGL mode is selected. The CSS fallback remains visible until the first valid frame, then crossfades over 220ms.
- Desktop-to-phone transitions remove the canvas and dispose the renderer, context, geometries, materials, observers, timers and listeners. Phone-to-desktop transitions lazy-load the WebGL scene and switch only after readiness.
- Initial WebGL construction contains the Z, one instanced thirteen-panel armor mesh and essential lights. Planetary, orbital, satellite, particle and secondary-light decoration is deferred to an idle callback.
- Active interaction renders at up to 60fps, idle at 30fps, and hidden/offscreen scenes stop scheduling frames. DPR is capped at 1.35 for the full scene and 1.1 for the reduced scene.
- Phone interaction uses pointer events, refs and one `requestAnimationFrame` update path. It preserves `pan-y pinch-zoom`, cancels on vertical intent, limits movement to a few pixels/degrees and clears the illumination pulse after 400ms.
- The phone sequence is navigation → Z → two-line headline → description → CTAs. The Z uses short, normal and tall viewport size rules. The previous horizontal mobile work carousel is a natural one-column grid.
- Framer Motion was removed after its remaining navbar/reveal/floating-button uses were replaced with CSS. Lenis is imported only on capable desktop and is destroyed when the live mode changes to compact, reduced-motion or constrained-data behavior.
- Below-fold homepage sections use `content-visibility: auto`. The built-in Next.js bundle analyzer is available through `npm run analyze`; its latest static output is `.next/diagnostics/analyze/`.

### Final verification

| Check | Final evidence |
| --- | --- |
| Lint / TypeScript / tests | Pass / pass / 24 of 24 pass |
| Production build | Pass; 42 generated pages |
| Bundle analyzer | Pass; Next.js production analysis completed in 35.0s |
| Phone widths | 320, 360, 375, 390, 400, 412 and 430px: `css-motion`, zero canvases, zero horizontal overflow |
| Larger widths | 768px: `reduced-webgl`; 1024, 1280, 1440 and 1920px: `desktop-webgl`; zero horizontal overflow |
| Short phone viewport | 390×700: CSS scene 260px high, no canvas and no overflow |
| Normal phone viewport | 390×844: CSS scene 297px high, no canvas and no overflow |
| Live mode transition | 390→1440 created one ready WebGL canvas; 1440→390 removed it and returned to `css-motion` |
| Mobile network ownership | Neither the 725,209-byte decoded Three.js chunk nor the 8,573-byte WebGL-scene chunk was requested |
| Accessibility / best practices / SEO | 100 / 100 / 100 on the final Home and Careers mobile Lighthouse runs |

The deterministic production bundle comparison below uses the recorded prior-pass reports as the baseline. It is not a pristine original-repository baseline.

| Route / metric | Prior pass | Final split | Change |
| --- | ---: | ---: | ---: |
| Home JS requests | 11 | 8 | -3 |
| Home JS transfer | 218,998 B | 163,334 B | -55,664 B (-25.4%) |
| Home JS decoded | 665,547 B | 507,148 B | -158,399 B (-23.8%) |
| Home total transfer | 369,400 B | 315,977 B | -53,423 B (-14.5%) |
| Careers JS requests | 10 | 8 | -2 |
| Careers JS transfer | 217,162 B | 163,334 B | -53,828 B (-24.8%) |
| Careers JS decoded | 664,921 B | 507,148 B | -157,773 B (-23.7%) |
| Careers total transfer | 363,974 B | 312,469 B | -51,505 B (-14.2%) |

Final standard Lighthouse single runs on this local Windows host:

| Page / preset | Performance | Accessibility | Best practices | SEO | LCP | TBT | CLS |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| Homepage / mobile | 80 | 100 | 100 | 100 | 3.396s | 425ms | 0 |
| Careers / mobile | 84 | 100 | 100 | 100 | 3.190s | 348ms | 0 |
| Homepage / desktop | 64 | 100 | 100 | 100 | 0.934s | 2,149ms | 0 |

The requested mobile Performance ≥90, LCP ≤2.5s and TBT <200ms gates are **not certified**. Both final mobile reports warn that the tested device CPU is slower than Lighthouse expects; the bundle reductions are exact, but single-run score/TBT differences are not reliable attribution evidence. Desktop LCP is fast, while Three.js parsing and scene startup still create substantial blocking work. A stable preview host with three-run medians and real low/mid-range device traces remains required before performance signoff.

Final JSON evidence: `artifacts/v2-audit/home-mobile-split-final.json`, `artifacts/v2-audit/careers-mobile-split-final.json` and `artifacts/v2-audit/home-desktop-split-final.json`. One Home audit produced a complete JSON report but returned a cleanup-only EPERM error while deleting its temporary Chrome profile.

## Brief reconciliation

The three latest attachments were read in full. The detailed Launchpad documents supersede the general brief's 8-week / 10-role description: **12 weeks, 14 tracks, up to three places each, 8–12 hours/week, unpaid, learning-first, part-time and remote-first**. Forty-two is a capacity ceiling, not a confirmed cohort size. Initial intake is 18+ and subject to approved jurisdiction eligibility.

Mentors, session dates, eligible locations, retention duration and paid opportunities were not invented. Program benefits are planned commitments, subject to readiness. Recommendations and future paid work are conditional; completion never guarantees employment. The application remains a local-only preview until intake is approved and configured.

## Implemented

- Phone hero: navigation → 280–340px graphite Z → headline → description → CTAs. Retired eyebrow removed. Desktop split composition retained.
- Brighter graphite faces/edges, restrained pointer/tap illumination, keyboard-accessible artwork interaction and static fallbacks.
- Separate thirteen-piece Create fragments → Build interface → Automate workflow → Z scroll transformation. Native scrolling, no continuous story loop, and static reduced-motion representation.
- Hero CSS and WebGL pause offscreen/hidden; renderer resources are owned during partial initialization. Shared standard metallic materials replace the more expensive clearcoat/iridescence effects; the almost-transparent planetary shell uses an unlit material. The CSS Z remains available until WebGL is ready.
- Instrument fonts preload from the existing installed files using `next/font/local`, with adjusted fallbacks. Below-fold work thumbnails are no longer prioritized.
- Careers index, fourteen complete role pages, role-aware three-step application, four pods, five program phases, core training, weekly rhythm, selection, completion requirements and conditional paid-opportunity pathway.
- Every role explains work, learning, beginner requirements, helpful-but-optional skills, tools, a question and a meaningful completion artifact.
- Careers navigation/footer links, homepage teaser, metadata, sitemap/discovery files and privacy additions. Application is noindex; planned unpaid tracks do not claim active JobPosting schema.
- Shared explicit Turnstile lifecycle for inquiries and applications: render/remount, expiry, error, retry, reset and removal. Server checks the expected action and hostname, with provider timeouts.
- Application validation, 32 KiB body limit, origin/type checks, honeypot, persistent limiter, explicit acknowledgements, private storage migration, unchanged-retry receipts and optional reference-only notification.
- No new runtime libraries; no ShaderGradient, Liquid Logo, Liquid Glass JS or React Three Fiber package installation. Existing Three.js/CSS/browser capabilities implement the requested visual direction. The lockfile changed only to remove the now-unused Framer Motion dependency.

## Verification

| Check | Evidence |
| --- | --- |
| Lint, TypeScript, automated tests | Pass; 24 tests, including 13 program/story/application tests and four hero-mode tests |
| Production build | Pass; 42 generated pages reported by Next.js |
| Sitemap routes | All 35 return HTTP 200 and one H1 |
| Unknown role | HTTP 404 |
| Closed application API | HTTP 503, `Cache-Control: no-store`; no external call in the tested disabled handler |
| Responsive homepage / Careers / final form step | No horizontal overflow at 320, 360, 375, 390, 412, 430, 768, 1024, 1280, 1440 and 1920 |
| Fourteen role pages | Each checked at 320px: zero overflow, one H1, seven explanatory H2 sections and visible unpaid terms |
| Mobile hero | Z above copy at all tested phone widths; no phone hero canvas |
| Application browser flow | Track preselection, required-field block, all three steps, back navigation, acknowledgement block and successful local-only preview verified with fictional QA answers |
| Menu keyboard | Ten consecutive Tab steps stayed inside the menu; Escape closed it and restored focus to the trigger at 320px |
| Visual regression found/fixed | Mobile story caption/art could overlap chapter text; bounded artwork height, height-aware piece scaling and a separate opaque visual layer corrected the inspected 320×640 state |
| Browser console | No application errors/warnings in the Careers/role/application sweep |
| Backend tests | Invalid JSON/size/type/origin, allowlists, links, consent, age, honeypot, rate rejection, verification failure, provider failure and stored receipt behavior tested through dependency injection |

Browser evidence is Chromium-based local testing, not physical iPhone/Android or Safari/Firefox certification. Automated accessibility checks do not replace assistive-technology testing. Backend test doubles do not establish hosted delivery, RLS enforcement or cross-instance limiter behavior.

## Measured performance

Lighthouse 13.4.1, installed Chrome 152, local `next start` production build, temporary clean browser profiles. Mobile uses the default simulated 412×823 viewport, 150ms RTT, 1,638.4 Kbit/s throughput and 4× CPU slowdown. Desktop uses the standard desktop preset. These are individual lab runs, not medians or field data.

| Page / preset | Performance | Accessibility | Best practices | SEO | LCP | TBT | CLS |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| Homepage / mobile | 82 | 100 | 100 | 100 | 3.5s | 320ms | 0 |
| Careers / mobile | 89 | 100 | 100 | 100 | 3.3s | 190ms | 0 |
| Homepage / desktop, pre-material simplification | 72 | 100 | 100 | 100 | 0.8s | 740ms | 0 |
| Homepage / desktop, async compilation trial (not retained) | 69 | 100 | 100 | 100 | 1.0s | 840ms | 0 |
| Homepage / desktop, final standard materials | 71 | 100 | 100 | 100 | 0.8s | 640ms | 0 |

The async-compilation trial did not demonstrate a reliable gain and was not retained. The existing mobile results do not certify the 90+ / LCP ≤2.5s target. Desktop startup showed a long Three.js task, motivating the final material simplification. The final desktop run still fails the 95+ target: startup blocking remains 640ms. Mobile loading/hydration and desktop WebGL startup remain performance follow-ups, not passed gates. Do not report this site as fully optimized.

After the final material/font/vignette changes, the homepage's full width matrix was rerun with zero overflow; the graphite WebGL Z rendered successfully and the rectangular vignette was absent. The final lint, types, 24 tests and 42-page build passed. The loopback-only production preview is left running on port 3233.

An earlier mobile run scored 44 and warned of an unusually slow CPU (benchmark index 593). Later runs had materially different benchmark indices; do not attribute the entire score difference to code changes. No controlled original-repository baseline exists. INP and production field metrics are unavailable.

Raw HTML/JSON reports are local and ignored by Git under `artifacts/v2-audit/`. Initial runner attempts encountered a bundled-Chromium launch failure and, once, temporary-profile cleanup failure. The final mobile and Careers runs produced complete reports without runtime errors.

## Implementation map

- Hero/story: `components/Hero3D.tsx`, `components/HeroWebGLScene.tsx`, `components/ExecutionStory.tsx`, `lib/hero-mode.ts`, `lib/story-layout.ts`, `components/Reveal.tsx`, `app/globals.css`, `app/layout.tsx`.
- Program content/pages: `data/careers.ts`, `components/LaunchpadArtwork.tsx`, `app/careers/page.tsx`, `app/careers/[track]/page.tsx`, `app/careers/apply/page.tsx`.
- Intake: `components/LaunchpadApplicationForm.tsx`, `components/TurnstileWidget.tsx`, `lib/launchpad-validation.ts`, `lib/launchpad-intake.ts`, `app/api/applications/route.ts`, `supabase/migrations/003_launchpad_applications.sql`.
- Integrations: `components/ContactForm.tsx`, `app/api/inquiries/route.ts`, `data/site.ts`, `app/page.tsx`, `components/WorkCard.tsx`, `app/work/[slug]/page.tsx`, `app/sitemap.ts`, `app/robots.ts`, `public/llms.txt`, `public/ai.txt`, `app/privacy/page.tsx`, `.env.example`.
- Tests: `tests/helpers/typescript.mjs`, `tests/hero-mode.test.mjs`, `tests/launchpad.test.mjs`, existing request-validation tests.
- Operating docs: README, ARCHITECTURE, SECURITY, DEPLOYMENT, DESIGN_SYSTEM, PERFORMANCE, QA_CHECKLIST and this report. `IMPLEMENTATION_STATUS.md` is marked as the historical first-pass snapshot.

## Remaining acceptance gates

1. Owner review of the local visual result and resolved 12-week / 14-track program terms. This is a deliberate implementation, not a claim of subjective perfection or a fabricated 9.5 score.
2. Reproducible performance runs on a stable machine/preview host and targeted mobile loading/hydration optimization. Record medians and real-device interaction data before certifying performance.
3. Physical-device and cross-browser testing, keyboard/screen-reader review, reduced-motion/data-saver/slow-network/offline and blocked-media matrix. Some guards have source/unit evidence but not every real environment was exercised here.
4. Program ownership: mentors, supervision capacity, cohort dates, accepted jurisdictions, learning plan delivery, certificate/recommendation criteria and approved privacy/retention/deletion procedures.
5. Explicitly authorized hosted setup and controlled integration tests for migration 003, RLS, persistent limits, Turnstile and application persistence/notification. The closed preview is not evidence that live intake works.
6. Existing inquiry and anonymous analytics production gates remain; neither was activated by this work. Use separate test credentials and never weaken production protection to submit from localhost.
7. Explicit approval before any commit, push, deployment or production configuration change.

No material files were deleted in this V2/Careers pass. The previous sequence-asset archive remains at `E:\zqtion\legacy-assets-archive-20260904`; its earlier removal is documented in the historical report.

## Primary implementation references

- [Three.js WebGLRenderer compilation](https://threejs.org/docs/pages/WebGLRenderer.html#compileAsync): investigated for the asynchronous-compilation trial; that trial was not retained after measurement.
- [Cloudflare explicit Turnstile rendering](https://developers.cloudflare.com/turnstile/get-started/client-side-rendering/): SPA lifecycle, rendering and callbacks.
- [Schema.org VideoObject](https://schema.org/VideoObject): the YouTube watch page is a URL, not a direct video-byte `contentUrl`.
- Next.js page, route, lazy-loading and font documentation bundled with the installed Next.js version was read before the related changes.
