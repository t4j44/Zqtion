# PR #2 inquiry functional acceptance

2026-10-23 · `fix/contact-form-and-hero-refinement` · **PARTIAL / provider acceptance BLOCKED**

The form and mobile panel are implemented. Genuine end-to-end delivery has not passed. PR #2 must remain draft. Production fallback remains enabled; no production activation or deployment is authorized by this report.

## Evidence ledger

| Gate | Status | Actual evidence |
| --- | --- | --- |
| Typecheck, lint, tests, production build | PASS | [Checks](contact-hero/functional-acceptance/checks.json), 142 tests, isolated build `kiFZUX_EBGxjBSKXmVWGl` |
| Previously inspected form and enlarged black panel preserved | PASS | [Source hashes](contact-hero/functional-acceptance/build-source-proof.json) match the reviewed UI; [visual report](contact-form-hero-refinement.md) contains before/after captures and measured performance |
| Exact Preview token hostname enforcement | Unit PASS; live BLOCKED | Requires Preview environment, exact feature branch, explicit exact hostname configuration, matching request hostname, successful Cloudflare verification and `inquiry` action. Production still permits only its two existing hostnames. No wildcard or token bypass. |
| Branch-scoped Preview configuration | PARTIAL | Nine Config variables saved only for this feature branch; [screenshot](contact-hero/functional-acceptance/preview-config-saved.png). Existing staging service-role key was subsequently verified against its project/role and saved as a branch-only Vercel Secret; [masked save proof](contact-hero/functional-acceptance/staging-secret-config-saved.png). Turnstile and Resend credentials remain pending. Production values unchanged during this phase. |
| Staging database privacy and limiter | PASS for controlled hosted rate-limit path | Existing staging tables use RLS; anonymous/authenticated SELECT denied; limiter execution restricted to service role. Genuine RPC component check and subsequent real browser/HTTP test both passed. On build `5900478`, five requests returned 503 at the missing-verification gate; sixth returned HTTP 429. Staging recorded exactly six attempts and zero inquiries. [Actual HTTP/database evidence](contact-hero/functional-acceptance/live-rate-limit.json), [request log screenshot](contact-hero/functional-acceptance/preview-request-logs.png). |
| Live invalid-input/anti-spam HTTP checks | PARTIAL | An actual authenticated browser attempt with unsupported `ftp:` project URL returned HTTP 400, preserved entries and showed safe guidance. [Visible hosted request lines](contact-hero/functional-acceptance/hosted-request-lines.json). The eight unauthenticated script probes returned Vercel Authentication HTTP 401 before application assertions could run; [sanitized responses/request IDs](contact-hero/functional-acceptance/live-http-negative.json). The script now recognizes JSON authentication responses as BLOCKED and stops after the first. Live honeypot/other malformed-body checks remain outstanding. |
| Real Turnstile token | BLOCKED | Saved Cloudflare inventory still contains only Zqtion Production, with two production hostnames. No dedicated staging widget has been verified. |
| Genuine inquiry saved in private staging database | BLOCKED | One genuine controlled browser attempt displayed the unavailable error. The actual subsequent read-only query still returned zero inquiry rows; [database evidence](contact-hero/functional-acceptance/staging-database.json). |
| Both Resend requests accepted | BLOCKED | No genuine send or provider message IDs obtained. |
| Notification and visitor confirmation actually received | BLOCKED | No mailbox receipt verified. Provider acceptance alone will not satisfy this gate. |
| Duplicate prevention, validation, failure handling | Local PASS; live PARTIAL | On actual Preview, required-field validation identified name/email/service/description; a controlled attempt disabled the fields/button while pending, then retained the brief and restored controls with safe error and direct alternatives. Inspected light/dark error screenshots: [light](contact-hero/functional-acceptance/preview-failure-light.png), [dark](contact-hero/functional-acceptance/preview-failure-dark.png). This does not prove successful delivery or a correlated API status. Complete live checks remain required. |
| Production activation | BLOCKED | Keep `NEXT_PUBLIC_INQUIRY_FALLBACK_ENABLED=true` in Production. Only after genuine acceptance may production be activated and rebuilt. |

## Configuration boundary

Approved Preview: `https://zqtion-git-fix-contact-form-and-hero-re-0f1026-t4j-44s-projects.vercel.app`.

Existing staging Supabase project: `tgjxwjstzdinrcmkpzoj`. Production project was not modified. Preview has branch-scoped URLs, exact hostname, sender/recipient `info@zqtion.com`, fallback disabled for the staging test only, and Community/analytics/Launchpad disabled. Its existing legacy service-role credential was securely saved as `SUPABASE_SERVICE_ROLE_KEY` for only this feature branch; temporary in-memory values were cleared and the key page closed. Preview build `5900478` successfully reached the staging limiter using that credential. Resend and genuine staging Turnstile credentials still need secure verification/configuration. No credentials belong in this report, chat, screenshots or Git.

Authenticated connector access was explicitly authorized by the owner after automatic review initially rejected the temporary-access request. The subsequent Vercel connector call returned provider HTTP 403 at `read_protection_bypass`; no temporary access link was obtained and no protection setting changed. Existing signed-in Chrome can view the form. The local CLI is unavailable. Do not treat the connector error or raw 401 as an application failure, and do not copy browser cookies into test scripts.

The latest visible page checks still showed the unsaved staging widget and Resend creation forms, with only the production widget in the saved Cloudflare inventory. New credential creation is therefore unverified. Resend's prepared key is sending-only and limited to `zqtion.com`; its final Add action remains an owner credential-creation handoff.

## Changes in this phase

The existing `/api/inquiries` route gains narrowly scoped Preview hostname acceptance and safe correlation logs for verified token and actual HTTP success, with no brief, email address, IP or token logged. Hosted environments fail securely when required credentials are absent. Storage, database schema, email routing, form payload, original media and hero rendering remain intact. Twelve new inquiry tests bring the total to 142. The isolated build copies no `.env` files and establishes compilation only.

The original visual phase report and its release-proof script describe the earlier five-file UI scope; its assertion that the API was untouched is historical. Use the functional phase checks/source proof for the current six-file product scope.

## Remaining acceptance sequence

1. Owner completes creation of a dedicated staging Turnstile widget for the exact Preview hostname. Credential creation is a browser handoff; do not reuse or widen the production widget.
2. Finish branch-scoped Resend and staging Turnstile credentials securely in Vercel. The existing staging Supabase service-role key has been saved and exercised by the hosted limiter. Do not put secret values in chat.
3. Rebuild Preview, verify real browser token and submit one clearly labelled controlled inquiry using `info@zqtion.com`.
4. Correlate actual HTTP response, private saved row and two real Resend provider IDs; verify both messages in the mailbox. Exercise live duplicate, rate, anti-spam and failure behavior without affecting production.
5. Keep draft and production fallback until every live gate passes. Then prepare production activation with a rebuild because public variables are compiled into the client.
