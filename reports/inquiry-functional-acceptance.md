# PR #2 inquiry functional acceptance

2026-10-23 · `fix/contact-form-and-hero-refinement` · **PARTIAL / provider acceptance BLOCKED**

The form and mobile panel are implemented. Genuine end-to-end delivery has not passed. PR #2 must remain draft. Production fallback remains enabled; no production activation or deployment is authorized by this report.

## Evidence ledger

| Gate | Status | Actual evidence |
| --- | --- | --- |
| Typecheck, lint, tests, production build | PASS | [Checks](contact-hero/functional-acceptance/checks.json), 142 tests, isolated build `kiFZUX_EBGxjBSKXmVWGl` |
| Previously inspected form and enlarged black panel preserved | PASS | [Source hashes](contact-hero/functional-acceptance/build-source-proof.json) match the reviewed UI; [visual report](contact-form-hero-refinement.md) contains before/after captures and measured performance |
| Exact Preview token hostname enforcement | Unit PASS; live BLOCKED | Requires Preview environment, exact feature branch, explicit exact hostname configuration, matching request hostname, successful Cloudflare verification and `inquiry` action. Production still permits only its two existing hostnames. No wildcard or token bypass. |
| Branch-scoped non-secret Preview configuration | SAVED; deployment verification pending | Nine Config variables saved only for this feature branch; [screenshot](contact-hero/functional-acceptance/preview-config-saved.png). Production values unchanged during this phase. |
| Staging database privacy and limiter | Component PASS | Existing staging tables use RLS; anonymous/authenticated SELECT denied; limiter execution restricted to service role. Genuine staging RPC returned five allowed attempts followed by rejection. [Evidence](contact-hero/functional-acceptance/staging-database.json). This is not HTTP 429 proof. |
| Live invalid-input/anti-spam HTTP checks | Pending | Run `node scripts/contact-hero/live-inquiry-preflight.mjs` after the current source reaches Preview. It records actual responses and explicitly does not claim successful delivery. |
| Real Turnstile token | BLOCKED | Saved Cloudflare inventory still contains only Zqtion Production, with two production hostnames. No dedicated staging widget has been verified. |
| Genuine inquiry saved in private staging database | BLOCKED | No controlled inquiry has been submitted or row accepted as evidence. |
| Both Resend requests accepted | BLOCKED | No genuine send or provider message IDs obtained. |
| Notification and visitor confirmation actually received | BLOCKED | No mailbox receipt verified. Provider acceptance alone will not satisfy this gate. |
| Duplicate prevention, validation, failure handling | Local PASS; live PARTIAL | Automated coverage is local/controlled. Browser submission lock and retained failure state were inspected in the original UI phase. Complete live checks remain required. |
| Production activation | BLOCKED | Keep `NEXT_PUBLIC_INQUIRY_FALLBACK_ENABLED=true` in Production. Only after genuine acceptance may production be activated and rebuilt. |

## Configuration boundary

Approved Preview: `https://zqtion-git-fix-contact-form-and-hero-re-0f1026-t4j-44s-projects.vercel.app`.

Existing staging Supabase project: `tgjxwjstzdinrcmkpzoj`. Production project was not modified. Preview has branch-scoped URLs, exact hostname, sender/recipient `info@zqtion.com`, fallback disabled for the staging test only, and Community/analytics/Launchpad disabled. Staging server credentials and a genuine staging Turnstile key pair still need secure verification/configuration. No credentials belong in this report, chat, screenshots or Git.

## Changes in this phase

The existing `/api/inquiries` route gains narrowly scoped Preview hostname acceptance and safe correlation logs for verified token and actual HTTP success, with no brief, email address, IP or token logged. Hosted environments fail securely when required credentials are absent. Storage, database schema, email routing, form payload, original media and hero rendering remain intact. Twelve new inquiry tests bring the total to 142. The isolated build copies no `.env` files and establishes compilation only.

The original visual phase report and its release-proof script describe the earlier five-file UI scope; its assertion that the API was untouched is historical. Use the functional phase checks/source proof for the current six-file product scope.

## Remaining acceptance sequence

1. Owner completes creation of a dedicated staging Turnstile widget for the exact Preview hostname. Credential creation is a browser handoff; do not reuse or widen the production widget.
2. Configure/verify only branch-scoped staging Supabase server and Resend credentials and the staging Turnstile keys securely in Vercel. Do not put secret values in chat.
3. Rebuild Preview, verify real browser token and submit one clearly labelled controlled inquiry using `info@zqtion.com`.
4. Correlate actual HTTP response, private saved row and two real Resend provider IDs; verify both messages in the mailbox. Exercise live duplicate, rate, anti-spam and failure behavior without affecting production.
5. Keep draft and production fallback until every live gate passes. Then prepare production activation with a rebuild because public variables are compiled into the client.
