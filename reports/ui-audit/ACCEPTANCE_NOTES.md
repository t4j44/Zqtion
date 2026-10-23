# Zqtion UI acceptance notes

Publication follow-up: the user subsequently authorized committing and pushing the UI work and requested light defaults below 1024px and dark defaults from 1024px. See [theme-default-update.md](theme-default-update.md) for the follow-up checks. The original audit statements below about no commit/push describe that earlier audit, not the later repository publication.

Local artifacts are synthetic QA evidence. Public portfolio screenshots use the local `alice` fixture; they are not new client work, real user accounts, live results or deployed content.

Hosted Supabase, production RLS, real Auth emails, live Storage, Resend delivery, Turnstile delivery, DNS and Vercel are outside this local run. Existing database regression tests use an in-memory PostgreSQL-compatible fixture. Existing Community browser suites bypass CSP only to talk to that HTTP fixture; the new theme/navigation suite and screenshot matrix use the production CSP normally.

Rapid cancelled navigations in the long Community suite produced Next.js `The destination stream closed early` server logs. The browser suites recorded no page errors or console errors. This is retained as a local diagnostic, not described as a clean server-log guarantee. No production incident or provider behavior is inferred.

The footer regression test selector was updated from the retired `.footer-explore` to `.footer-columns`. The old forced contact-grid shape assertion was replaced by actual 44px target and in-viewport geometry assertions. Link grouping, two-column phone navigation and floating-chat avoidance remain tested; no functional Community assertion was removed.

Temporary Lighthouse/axe tools were installed under ignored `artifacts/ui-tools`; application dependencies and lockfile were unchanged. No account or permission changes, hosted writes, production migrations, commits, pushes, merges or deployment.
## Accessibility interpretation

Axe's zero automated violations is a useful gate, not WCAG certification. An earlier pass returned inconclusive ARIA checks on generic action containers and code scrollers; these were inspected and corrected to named groups/regions. Contrast checks over gradients and photographic artwork can remain inconclusive. Solid semantic-token combinations were separately computed: 26/26 pairs meet the relevant 4.5:1 text or 3:1 control-boundary threshold, with minima 5.34:1 and 3.10:1 respectively. Those calculations do not establish contrast at every image pixel.

The deferred homepage story is explicitly scrolled into view before the final axe and screenshot passes, so content-visibility does not conceal its card surfaces from inspection.

Final screenshot stabilization: full-page homepage captures temporarily set content-visibility:visible and remove contain-intrinsic-size only in the browser test. Production CSS still defers offscreen sections. The native viewport/layout behavior is separately exercised by the interaction and Community suites. The last homepage-only retest replaces the 28 homepage layout rows and four homepage axe rows in the full matrices; unaffected route evidence is retained. Menu captures use viewport screenshots, because a full-document image misleadingly includes the inert background below a fixed dialog.
