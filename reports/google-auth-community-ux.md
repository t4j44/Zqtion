# ZQTION GOOGLE AUTH + COMMUNITY UX

**Local verification: PASS. Real Google OAuth and hosted acceptance: UNVERIFIED. Production readiness: NO.**

Base commit: `fa5f864879d09e7750f0e4ecf578016eca24d80d`. Branch: `feature/zqtion-community`. Build: `qutTBMJMZ6kP8SfFkFLv-`. The publication commit is identified by Git history and the completion response.

## Implementation

- Google sign-in calls the existing Supabase browser client with provider google, basic openid/email/profile scopes and a validated account callback. The client explicitly retains implicit flow, URL session detection, persistence and refresh. No server PKCE callback, extra Google SDK or secret is added.
- A compact Google-first screen keeps email login, signup and password reset. Errors/loading have live announcements; controls retain keyboard focus and phone-sized targets.
- Main desktop and mobile Community links open the public /ai-experiences feed. Published discussions, search/filter results and public profiles remain readable without login. API and database policies are unchanged.
- Default sign-in returns to the feed. Participation preserves the exact safe internal post path, query, composer hash and intent. Unsafe/external/account-loop destinations fall back to the feed. No post, vote, save or rating is replayed automatically.
- Google users can browse before creating a Community profile and need no extra password. Participation still requires LinkedIn, a saved identity and guidelines acceptance. Only a verified Google identity suggests a display name; email and privilege metadata are not copied into authorization. Profiles stay keyed by the authenticated user ID.
- Session changes invalidate stale profile/moderator requests. Inline drafts are keyed to the current identity, including across tabs. Recovery links stay on the password form.

## Files changed

- `app/community/account/page.tsx`
- `components/Navbar.tsx`
- `components/community/Account.tsx`
- `components/community/CommunityProvider.tsx`
- `components/community/Conversation.tsx`
- `components/community/EntryActions.tsx`
- `components/community/InlineComposer.tsx`
- `components/community/community.css`
- `lib/community/browser.ts`
- `lib/community/validation.ts`
- `tests/community-validation.test.mjs`
- `tests/community/browser-qa.mjs`
- `tests/community/portfolio-browser-qa.mjs`
- `tests/community/qa-backend.mjs`
- `docs/GOOGLE_OAUTH_SETUP.md`
- `lib/community/auth.ts`
- `scripts/community-auth-regression.mjs`
- `scripts/community-auth-release-check.mjs`
- `tests/community-auth.test.mjs`
- `tests/community/auth-browser-qa.mjs`

## Observed verification

| Check | Result |
|---|---|
| Unit / integration tests, including SQL/RLS tests | 121 passed |
| Typecheck, lint, build, diff check | PASS; 110 static pages |
| Auth browser scenarios | 14 passed; 16 theme/width samples |
| Existing UI suite | 22 passed |
| Existing Community suites | 15 + 16 passed; 130 responsive samples |
| Existing portfolio interactions | 14 passed |
| Broad layout | 360 checks; zero overflow/page errors |
| Accessibility automation | 56 scans; zero automated violations; incomplete contrast checks still require judgment |
| Link crawl | 254 pages; zero failures |
| Prompt Library SEO | 29 pages; zero failures |
| WebKit / Safari | BLOCKED: browser executable not installed; no physical Safari claim |

Browser Auth transport is simulated; no real Google account, email or hosted provider certification is inferred. Earlier failed attempts and fixes are retained in the audit folder. Rapid cancelled browser navigations can still produce Next.js destination-stream-closed messages; no clean-server-log guarantee is made.

## Screenshots

- [Phone light](google-auth-audit/account-light-390.png)
- [Desktop dark](google-auth-audit/account-dark-1440.png)
- [Phone dark](google-auth-audit/account-dark-390.png)
- [Desktop light](google-auth-audit/account-light-1440.png)
- [Complete screenshot index](google-auth-audit/screenshot-index.md)

## Hosted configuration and remaining gates

Follow [GOOGLE_OAUTH_SETUP.md](../docs/GOOGLE_OAUTH_SETUP.md). The owner must configure separate staging/production Web OAuth clients, Google branding/audience/basic scopes, exact origins, the matching Supabase Google callback, the app callback allowlist and the actual Vercel Preview hostname. Google secrets belong only in the provider configuration, never NEXT_PUBLIC variables.

Real consent, cancellation, existing email/Google identity linking, session expiry/revocation, email confirmation/reset delivery and two-user hosted RLS must be tested on configured staging. Physical devices, screen-reader acceptance, Safari and production/provider acceptance remain unverified. Earlier performance measurements belong to their original portfolio build and were not relabelled as measurements of this Auth change.

Making LinkedIn optional remains a separate schema decision. No constraint, RLS policy, hosted setting, DNS, production deployment, application availability or main branch was changed. Publication is limited to feature/zqtion-community.
