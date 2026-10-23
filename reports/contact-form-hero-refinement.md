# Contact form and hero refinement

2026-10-23 · `fix/contact-form-and-hero-refinement` → `main`

Base: `2b0ae84f2dcb2ca58bf8d7c8718b3f3882651bcd`. Final local production build: `BE5EYle_kNRvt9lGlpsxV` (110 static pages).

**Readiness: local implementation and regression validation PASS; ready for draft PR review. Production form activation BLOCKED on genuine hosted inquiry acceptance.** No production flags, hosted database, provider settings, authentication settings or production deployment were changed. The full form is demonstrated in a credential-isolated local build; the production fallback condition remains intact.

## 1. Changes made

- Enlarged the mobile black artwork panel and centered its existing contents. The owner's corrected direction supersedes the initial letter-enlargement brief. All independent Z scaling changes were reverted before committing. `Hero3D.tsx`, `HeroLoopVideo.tsx`, `HeroWebGLScene.tsx`, original media, poster widths and WebGL geometry/camera are unchanged from the base.
- Refined the existing `ContactForm.tsx`; retained its single-page structure and API contract. Required name, email, service and description; optional company/project, URL, budget and timeline. Primary CTA: **Send project brief**.
- Added an immediate submission lock and disabled fields while sending. Success clears entries and verification; errors retain the brief and offer email/WhatsApp. Provider acceptance is explicitly distinguished from actual email receipt.
- Introduced the requested contact heading/subheading, compact introduction, form-first desktop columns and secondary contact/services/next-conversation information. Phone controls stack and the submit button fills the available width. The fallback panel no longer stretches to the sidebar height.
- Turnstile follows the actual light/dark theme, uses compact rendering below 300px of available form width and clears stale verification when its rendering configuration changes. Observers and widgets are removed on cleanup. No verification bypass was added.
- Product scope is five files: `app/contact/page.tsx`, `app/globals.css`, `app/interface.css`, `components/ContactForm.tsx`, `components/TurnstileWidget.tsx`. One existing browser test was updated for controlled public error text and the truthful success wording. Additional scripts/reports are local QA evidence; no dependency changes.

## 2. Screenshots and personal visual review

These are actual local browser captures, not mockups. Contact images use a visibly labelled local verification fixture; they do not demonstrate real Cloudflare/provider acceptance. Before images were captured from the unmodified base with the same local form preview settings. Baseline screenshots are available at 390px and 1440px; baseline geometry covers all eight requested sizes. No before screenshots are claimed at 320px or 430px.

| View | Before | After |
| --- | --- | --- |
| Phone hero, 390, light | [Before](contact-hero/before/hero-light-390.png) | [After](contact-hero/after/hero-light-390.png) |
| Phone hero, 390, dark | [Before](contact-hero/before/hero-dark-390.png) | [After](contact-hero/after/hero-dark-390.png) |
| Desktop hero, 1440, light | [Before](contact-hero/before/hero-light-1440.png) | [After](contact-hero/after/hero-light-1440.png) |
| Desktop hero, 1440, dark | [Before](contact-hero/before/hero-dark-1440.png) | [After](contact-hero/after/hero-dark-1440.png) |
| Phone contact, light | [Before](contact-hero/before/contact-light-390-full.png) | [After](contact-hero/after/contact-light-390-full.png) |
| Phone contact, dark | [Before](contact-hero/before/contact-dark-390-full.png) | [After](contact-hero/after/contact-dark-390-full.png) |
| Desktop contact, light | [Before](contact-hero/before/contact-light-1440-full.png) | [After](contact-hero/after/contact-light-1440-full.png) |
| Desktop contact, dark | [Before](contact-hero/before/contact-dark-1440-full.png) | [After](contact-hero/after/contact-dark-1440-full.png) |

Additional final hero captures: **320px** [light](contact-hero/after/hero-light-320.png) / [dark](contact-hero/after/hero-dark-320.png); **430px** [light](contact-hero/after/hero-light-430.png) / [dark](contact-hero/after/hero-dark-430.png). Full-page captures for these sizes and matching contact images are in [after/](contact-hero/after/).

Personally inspected the requested 320/390/430 phone hero and 1440 desktop hero in both themes, plus full phone/desktop contact pages. The final black panel has more breathing room; the Z retains its original dimensions, all three indicators remain inside the panel, the headline is legible and the form is complete. The desktop hero's viewport screenshot is unchanged. On the 320×568 screen, normal vertical scrolling is necessary for the full hero copy and CTAs; there is no horizontal overflow or cropped artwork.

Also reviewed [activated phone video](contact-hero/journeys/activated-phone-video.png), [optional desktop WebGL](contact-hero/journeys/activated-desktop-webgl.png) and the separately built [fallback-state captures](contact-hero/fallback/). Browser emulation does not establish physical-device acceptance.

## 3. Inquiry field compatibility

| UI input | Existing request field | Validation/handling |
| --- | --- | --- |
| Name, required | `name` | Existing 2–80 characters |
| Email address, required | `email` | Email input; existing 160-character maximum |
| Service type, required | `service` | Existing values and URL preselection retained |
| Project description, required | `details` | Existing 30–4,000 characters; server validation unchanged |
| Company/project, optional | `company` | Existing 120-character maximum |
| Website/project URL, optional | `projectUrl` | Existing URL input and 500-character maximum |
| Budget, optional | `budget` | Existing choices retained |
| Timeline, optional | Appended to `details` | Up to 120 characters; `Timeline / desired launch: …` appended; combined maximum 4,000; oversize blocked without truncating input |

The temporary client `timeline` field is removed before POST. Existing `fax_number` honeypot, `cf-turnstile-response`, attribution fields and analytics privacy behavior remain. No new database field or migration is needed.

## 4. Backend integration evidence

`/api/inquiries`, `lib/email/`, Supabase migrations and server routing are unchanged. Reviewed storage-before-email handling, Turnstile action/hostname verification, streamed body limits, URL validation, timeouts, the rate limiter, server-only credentials, sanitized responses and escaped/idempotent email handling. Existing inquiry unit tests and local SQL/RLS tests passed, including missing configuration, database/mail failure and rate-limit behavior. Migration `011_private_inquiry_grants.sql` retains private inquiry grants; this is source/local evidence, not a hosted permissions certification.

New browser journeys verify the unchanged payload, service preselection, synchronous duplicate prevention, reset behavior, safe HTTP 400/413/429/503 messages, preserved input, unknown network outcome and accepted-versus-unavailable confirmation states. These responses use explicit local fixtures. One actual request to the locally built API returned **503** with fixture-only provider configuration; it failed closed without claiming storage or delivery. A separate fallback-enabled production build also refused an unconfigured API request with 503.

**No real Cloudflare token, hosted inquiry insertion, Resend acceptance or real inbox receipt was obtained.** Tests do not certify any of those outcomes. Reference contracts: [Cloudflare widget configurations](https://developers.cloudflare.com/turnstile/get-started/client-side-rendering/widget-configurations/) and [Supabase insert](https://supabase.com/docs/reference/javascript/insert).

## 5. Remaining provider requirements

- Use an authorized controlled staging URL and confirmation mailbox. The Vercel connector could list the project but returned **403** when inspecting its environment scope. A request for the staging URL/mailbox is pending; no secret values were requested or printed.
- Owner-reported production credentials were not independently reverified. Verify the genuine public `NEXT_PUBLIC_TURNSTILE_SITE_KEY`, matching server `TURNSTILE_SECRET_KEY`, Supabase server credential and Resend sender/recipient configuration in the authorized environment. The site key must never contain the secret key.
- Ensure Cloudflare and the existing server hostname policy accept the chosen staging hostname. The current production inquiry policy accepts `zqtion.com` and `www.zqtion.com`; local nonproduction permits loopback. An arbitrary preview URL is not automatically eligible. No hostname restriction was weakened for this task.
- Submit a genuine controlled brief, verify its private database row and internal notification acceptance, then confirm actual receipt in the designated mailbox. Record redacted provider IDs/statuses and mailbox evidence, without exposing inquiry contents or keys.

## 6. Form activation requirements

Keep **`NEXT_PUBLIC_INQUIRY_FALLBACK_ENABLED=true` in Production** until all seven owner gates pass: matching Turnstile keys; genuine controlled provider verification; successful database insertion; internal Resend notification accepted; real confirmation email received; error/rate-limit handling tested; no private record leaks.

Once those gates pass, the exact future change is `NEXT_PUBLIC_INQUIRY_FALLBACK_ENABLED=false` for the approved environment followed by a newly built release, because `NEXT_PUBLIC_` flags are compiled into the client. This report does **not** authorize or perform that change or a production deployment. The separately tested flag-on build retains a compact email/WhatsApp fallback and hides the form. Its 16 size/theme checks passed: [fallback evidence](contact-hero/fallback/results.json).

## 7. Hero size and framing adjustments

| Viewport | Black panel height before → after | Change | Poster width before → after |
| --- | --- | --- | --- |
| 320×568 | 220 → 249.9px | +13.6%, short-screen constraint | 232 → 232px |
| 360×800 | 295.2 → 345.6px | +17.1% | 295.2 → 295.2px |
| 390×844 | 319.8 → 374.4px | +17.1% | 319.8 → 319.8px |
| 430×932 | 340 → 400px | +17.6% | 340 → 340px |
| 768×1024 | 360 → 360px | Unchanged | 272 → 272px |
| 1024×768 | 407.1 → 407.1px | Unchanged | 272 → 272px |
| 1440×900 | 576.1 → 576.1px | Unchanged | 368 → 368px |
| 1920×1080 | 570.5 → 570.5px | Unchanged | 368 → 368px |

Below 768px, `.hero-artwork` owns the rounded dark display panel and clipping boundary; `.hero-3d-local-stage` uses `clamp(322px,96vw,400px)`. Screens at most 700px tall instead use `clamp(248px,44svh,306px)`. Existing horizontal gutters remain because the panel already uses the available content width.

The `.hero-3d-static` grid uses `minmax(0,1fr)` tracks so the original `.hero-poster-frame` stays centered within `.hero-3d-stage` without a minimum-content track pushing it downward. `--hero-poster-w` and all independent artwork transforms remain unchanged. The panel height, centering and copy spacing were adjusted together. Mobile copy top padding is 0.75rem, layout bottom padding 1.5rem and the decorative scroll cue is hidden to avoid crowding the CTAs. No hero-wide minimum-height increase was introduced.

All 32 route/theme/size capture checks passed. They assert unchanged poster width, full poster and indicator containment, readable headline clearance and no horizontal overflow: [before geometry](contact-hero/before/capture.json), [after geometry](contact-hero/after/capture.json). Static, activated video, optional WebGL, GPU unavailable/context loss, reduced motion, Save Data and slow-network policy cases passed. The video test checks matching layout size; it does not certify every decoded frame or a physical phone.

## 8. Performance comparison

Same homepage, Chrome 156, Lighthouse 13.5, simulated throttling and three serial cold-profile samples per device per phase. These are local lab samples, not field Core Web Vitals or INP evidence. Baseline and corrected final builds were measured separately, without concurrent heavy QA during measurement.

| Metric | Before | After |
| --- | --- | --- |
| Mobile scores | 93, 87, 92; **median 92** | 93, 91, 89; **median 91** |
| Mobile median LCP | 3,312ms | 3,347ms (+35ms / +1.05%) |
| Mobile median TBT | 75ms | 112.5ms |
| Desktop scores | 100, 100, 100; **median 100** | 100, 100, 99; **median 100** |
| Desktop median LCP | 731ms | 737ms |
| Desktop median TBT | 0ms | 0ms |
| CLS | 0 in all samples | 0 in all samples |
| Mobile script transfer | 240,071 bytes in each run | 240,071 bytes in each run |
| Desktop script transfer | 246,785 bytes in each run | 246,785 bytes in each run |

No material sampled LCP regression or added homepage script transfer was observed. Median score targets ≥90 mobile / ≥95 desktop pass; **one final mobile sample scored 89**, so the target did not pass in every run. Do not claim a performance improvement or deterministic device score. Every raw run requested one responsive hero poster and no decorative video before intent; poster request deduplication remains intact. [Before samples](contact-hero/performance/before/summary.json), [after samples](contact-hero/performance/after/summary.json), [network and source proof](contact-hero/release-proof.json).

## 9. Accessibility results

Four focused form scans (390/1440 × light/dark) detected **zero axe violations**, and all 56 broader route/theme scans detected zero violations. Keyboard focus reaches name then email; existing menu focus trapping, Escape handling, theme defaults, saved preference and storage-disabled behavior passed. Labels, required indicators, fieldset legend, disabled pending controls and an atomic polite status region are retained/added.

Automated contrast analysis includes **incomplete** results, so zero detected violations is not complete WCAG certification. Personally reviewed text/control visibility in both themes. Lighthouse accessibility remained 96 mobile / 100 desktop before and after. No physical assistive-technology or device certification is claimed. [Focused scan details](contact-hero/journeys/results.json), [broader axe results](contact-hero/regression/after-accessibility.json).

## 10. Tests passed, failures resolved and delivery boundary

| Gate | Final result |
| --- | --- |
| `npm test` | **130/130 PASS**, including inquiry, mail, Turnstile and local private-storage contracts |
| `npm run lint` | PASS |
| `npm run typecheck` | PASS |
| `npm run build` | PASS, 110 static pages, final build ID above |
| `npm run prompts:seo` | PASS, 29 pages, zero failures |
| Existing UI browser suite | **22 PASS**, zero failures/errors |
| Existing responsive suite | **360 checks PASS**, zero overflow/page errors |
| Existing accessibility suite | **56 scans**, zero detected violations |
| Existing Community suite | **15 PASS**; local SQL/Auth/Storage fixtures, no hosted/provider certification |
| Existing portfolio suite | **14 PASS**, including media controls and deferred hero activation |
| New contact/hero journeys | **18 PASS**, zero failures/page errors; four focused axe scans |
| New capture checks | **32 PASS**, both routes/themes at eight requested sizes |
| Separate fallback-on build | **16 checks PASS**, unconfigured API refuses with 503 |
| Source/build and protected-path review | PASS; product hashes match tested build, backend/media/dependencies unchanged |

Logs: [command gates](contact-hero/checks/results.json), [browser suites](contact-hero/regression-commands.json), [build source hashes](contact-hero/checks/build-source-proof.json). Final `git diff --check`, targeted lint of the evidence script and release candidate filename/token-pattern checks passed. Known private-key/token patterns are checked without printing values; synthetic local fixture tokens are labelled. The isolated fallback snapshot build emitted a nonfatal multiple-lockfile warning caused by its ignored local copy; compilation succeeded, and no project configuration was changed to suppress it.

Resolved work is recorded in [iteration-1/owner-correction.md](contact-hero/iteration-1/owner-correction.md): the independent letter enlargement was rejected and fully reverted. The first journey run had two test timing/geometry failures; the test now compares stable layout widths rather than a transient illumination transform and waits for the existing poster visibility transition after context loss. All 18 final journeys pass. Historical failure screenshots are kept under `iteration-1/`, outside final captures.

Remaining **BLOCKED** checks: genuine staging Turnstile/provider validation, hosted private insert and permissions, actual Resend acceptance, real confirmation mailbox receipt and hosted error/rate-limit acceptance. Vercel environment access was denied (403), not a successful validation. Production feature flags remain unchanged; no production deploy, main push or merge was performed. Delivery is the authorized feature branch and a draft PR to main.
