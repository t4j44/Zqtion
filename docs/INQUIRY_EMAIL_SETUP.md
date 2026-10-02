# Zqtion inquiry email workflow

Local implementation only. Do not push, merge, create a pull request, deploy, apply migrations or change provider/DNS settings without the owner's explicit authorization. The owner requires the word `PUSH` before a GitHub push.

## What happens

Website → POST /api/inquiries → validation, rate limit and Turnstile → Supabase website_inquiries → two independent Resend messages:

- Internal project brief → info@zqtion.com (Zoho inbox); Reply goes to the visitor.
- Customer confirmation → the validated visitor email; Reply goes to info@zqtion.com.

Both messages have inline, table-based HTML and a plain-text alternative. The reusable templates include a text wordmark, preheader, summary and reply CTA. Visitor values are HTML-escaped. No image download, JavaScript, tracking pixel or external font is needed.

## Acceptance and recovery policy

| Outcome | API / website | Operator action |
| --- | --- | --- |
| Validation, persistent limiter or Turnstile fails | Reject; no storage or email | Correct input/configuration; email link remains available |
| Supabase insert fails or times out | 503; no emails attempted | Inspect storage before advising resubmission: a network timeout can occur after a database commit |
| Supabase saved; both emails accepted by Resend | 200; brief received, confirmation on its way | Check provider delivery events if a recipient reports missing mail |
| Supabase saved; internal email fails | 200; confirmation copy follows customer-email result | Review the stored lead and failed internal notification |
| Supabase saved; confirmation or both emails fail | 200; saved brief, confirmation not confirmed, no resubmission needed | Follow up manually from Zoho and investigate provider status |
| Honeypot filled | Decoy 200; no provider calls | No lead accepted; intentional anti-spam exception |
| Browser/network times out | Receipt is uncertain; ask visitor to contact company before retrying | Inspect database and logs to avoid duplicate leads |

Acceptance means a successful database insert, not inbox delivery. Resend's successful response must contain a message ID before the UI says a confirmation is on its way. `accepted` does not mean delivered, read, or even in the inbox. No webhook, delivery guarantee or automatic retry queue is included.

The existing `status` column tracks the sales workflow (`new`, `reviewing`, `qualified`, `closed`), not mail delivery. It remains unchanged. No migration is needed for this policy. The existing UUID and timestamp are supplied on insert and included in the internal email.

Server logs record only the inquiry UUID, channel status, provider message ID and HTTP status where available:

- `inquiry_saved`: database confirmed storage.
- `inquiry_email_status`: both provider submissions accepted.
- `inquiry_email_attention`: at least one channel is `unconfigured`, `rejected` or `unknown`.
- `inquiry_storage_failed` / `inquiry_processing_failed`: storage/configuration/request processing needs investigation.

Before release, assign someone to review new Supabase inquiries and configure monitoring for the failure events above. Correlate logs with `website_inquiries.id` and the Resend message IDs. Logs have hosting-plan retention limits; they are not a durable outbox. A saved row without a final mail log means the process may have stopped before or during sends. Review these rows as well as explicit failure events. Review Resend bounces/complaints and suppressions; do not repeatedly resend a bounced confirmation.

For an ambiguous send, check Resend first. A developer repeating the *identical* provider request can reuse `inquiry/{UUID}/internal` or `inquiry/{UUID}/confirmation` within Resend's 24-hour idempotency window. This prevents duplicate provider sends for that key; it does not deduplicate new website submissions. Outside that window, reconcile first. There is no public resend endpoint; routine recovery can be a manual Zoho reply to the saved lead. Do not ask visitors to resubmit a saved inquiry just to trigger mail.

Each upstream operation has an 8-second timeout. Rate limit, Turnstile and database run sequentially; the two email requests run concurrently. The route declares a 60-second maximum, subject to hosting-plan support; the browser waits up to 45 seconds. All work is awaited before responding.

## Environment configuration

Set in Vercel for the intended environment when release is authorized. Enter secret values directly in the provider dashboard, never in chat or Git.

```dotenv
RESEND_API_KEY=<server-only sending key>
INQUIRY_FROM_EMAIL=Zqtion <info@zqtion.com>
INQUIRY_TO_EMAIL=info@zqtion.com
SUPABASE_URL=<existing project URL>
SUPABASE_SECRET_KEY=<existing server-only secret>
RATE_LIMIT_SECRET=<long random server-only value>
NEXT_PUBLIC_TURNSTILE_SITE_KEY=<public widget key>
TURNSTILE_SECRET_KEY=<server-only widget secret>
```

Existing alternatives remain supported: `NEXT_PUBLIC_SUPABASE_URL` for the database URL, and `SUPABASE_SERVICE_ROLE_KEY` instead of `SUPABASE_SECRET_KEY`. Do not use public prefixes for secret keys. The rate-limit HMAC falls back to the Supabase key if its dedicated secret is absent. Existing migrations 001 and 002 are required; this work creates/applies no migration.

The company sender and internal recipient above are defaults, but configure them explicitly. Reply-To is fixed to the canonical company address for confirmations, so a separate reply-to environment variable is unnecessary. Internal mail always replies to the validated visitor email. Extra request fields such as `to`, `from`, `bcc`, and `reply_to` are ignored. Only one validated visitor mailbox is accepted.

`APPLICATION_TO_EMAIL=info@zqtion.com` also replaces the old example identity for Launchpad. This does not enable or otherwise change Launchpad intake. Keep `LAUNCHPAD_APPLICATIONS_ENABLED=false` unless separately authorized. Keep existing analytics settings unchanged.

## Resend and DNS: owner checklist

1. In Resend, open Domains and add/verify **zqtion.com** for outbound sending so the visible sender can be `info@zqtion.com`.
2. Keep inbound receiving disabled in Resend. Zoho remains the human inbox. Use the dedicated Return-Path subdomain shown by Resend (default `send.zqtion.com` for a root sending domain). The Return-Path handles bounces; it is distinct from the visible From and Reply-To addresses.
3. Copy only the exact sending/verification DNS records generated by that domain's dashboard. Values and even record types depend on the account/provider configuration; they have not been inspected here and must not be guessed.
4. Resend may show DKIM plus TXT/MX records for the dedicated Return-Path, or a CNAME-based sending setup (including the Return-Path and its `r`-prefixed sibling). Add precisely the displayed names, types, values, priorities and TTLs. Do not add both setup variants from an example. A subdomain MX for bounces is different from a root MX for inbound mail.
5. **DO NOT DELETE ZOHO RECORDS.** Preserve Zoho's root MX, SPF and DKIM, existing DMARC, and Vercel website records. Do not add a second root SPF TXT record. Never overwrite an existing DNS record just to satisfy a conflicting example; resolve any conflict before proceeding. No Namecheap, DNS, Zoho or Vercel settings were changed by this implementation.
6. Return to Resend and verify until sending is ready. Keep open/click tracking disabled for these transactional messages. Create a sending-only API key restricted to the verified domain and enter it directly into Vercel as `RESEND_API_KEY`.
7. Only after release/configuration is authorized, run one controlled real submission and inspect message headers for SPF/DKIM/DMARC results. Review the actual current DMARC alignment/policy if authentication fails; do not blindly replace it.

Alternative: verifying `updates.zqtion.com` as the sending domain isolates sending reputation, but then set `INQUIRY_FROM_EMAIL=Zqtion <info@updates.zqtion.com>`. Verifying only that subdomain does not authorize the root `info@zqtion.com` sender. Internal receipt and customer Reply-To still use info@zqtion.com. The corresponding default Return-Path would be under that sending subdomain. Prefer the root-sender setup above to satisfy the requested visible identity.

Official references checked September 19, 2026: [verified domains](https://resend.com/docs/dashboard/domains/introduction), [Return-Path configuration](https://resend.com/docs/dashboard/domains/custom-return-path), [send email API](https://resend.com/docs/api-reference/emails/send-email), [idempotency keys](https://resend.com/docs/dashboard/emails/idempotency-keys).

## Manual E2E acceptance checklist

Use synthetic test data and inboxes you control. Run this after explicit release/provider authorization; automated tests mock all provider requests and send no real email.

- [ ] Open `/contact`; see and activate info@zqtion.com on the contact card and footer. Check privacy contact and Organization / ProfessionalService structured data too.
- [ ] Submit a realistic name, email, company, selected service, project context, budget and optional URL. Include a test campaign URL to check attribution.
- [ ] Turnstile passes with action `inquiry` and an approved hostname; invalid/missing tokens fail.
- [ ] Loading and accessible status appear; success says “Brief received” and uses the submitted address only when confirmation is accepted. No fixed response deadline.
- [ ] Supabase contains all submitted and attribution fields, ID and timestamp; no raw IP, Turnstile token or arbitrary routing fields.
- [ ] Zoho info@zqtion.com receives the internal alert. Check summary, full multiline context, attribution, UTC timestamp, reference and reply CTA.
- [ ] Click Reply and the CTA: both address the visitor, not the company sender.
- [ ] Visitor receives the confirmation with first name, request summary, next steps and professional closing.
- [ ] Reply to the confirmation reaches info@zqtion.com in Zoho.
- [ ] Inspect HTML in Gmail desktop, Gmail mobile, Zoho Mail and Outlook when practical. Check 320px width, long names/emails/company values, disabled images and links.
- [ ] Inspect the MIME source: both text/plain and text/html alternatives exist.
- [ ] Inspect SPF, DKIM and DMARC in the actual received message headers after domain verification.
- [ ] In a separately configured test environment, simulate internal/confirmation errors. Confirm saved lead, correct UI copy and channel logs; a failed email must not encourage a duplicate submission.
- [ ] Check failed database/limiter/Turnstile requests cannot trigger emails. Verify sixth attempt in ten minutes is rejected across instances.
- [ ] Confirm monitoring ownership and manual recovery before calling the workflow operational.

## Local verification — September 19, 2026

- Typecheck: PASS (`tsc --noEmit`). An intermediate submitted-email typing error was fixed before the final checks.
- Lint: PASS (`eslint .`).
- Tests: PASS, 43/43, including 18 new inquiry/template/provider cases. All external requests in these tests are mocked.
- Production build: PASS, 42 pages generated. No dependencies were installed or changed.
- The system npm launcher initially referenced a missing npm-cli.js. The installed CLI at `C:\Program Files\nodejs\node_modules\npm\bin\npm-cli.js` successfully ran the package scripts via Node.
- Focused browser QA against the production build: native required-field validation; accepted-confirmation UI with submitted email; saved-lead/confirmation-unavailable UI; failed-submission UI and clickable fallback links. Success and failure responses were simulated by a loopback-only preview proxy, not real provider delivery.
- Contact page: no horizontal overflow at 320, 360, 375, 390, 412, 430, 768, 1024, 1280, 1440 and 1920px. No console warnings/errors in the accepted-confirmation flow. The failure fixture intentionally returns HTTP 503.
- Both email previews: inspected in Chromium, including 320px layout and reply CTA targets. This does not establish Gmail, Zoho or Outlook compatibility.
- Local HTTP smoke: `/`, `/contact`, `/privacy`, `/ai.txt`, `/llms.txt`, `/robots.txt`, `/sitemap.xml` returned 200. Tested public content contained no old Gmail identity. An actual local API request with deliberately unavailable loopback-only database configuration returned the safe 503 fallback.
- Client build search found no private Resend, Supabase service-key or Turnstile-secret variable names in `.next/static`. Server credentials remain behind the API route and server-only email module.
- `git diff --check`: PASS. The remaining Gmail reference in `docs/LAUNCH_STATUS.md` is historical and unchanged.

Local review artifacts (ignored by Git) are in `artifacts/email-review/`: `internal.html`, `internal.txt`, `confirmation.html`, `confirmation.txt`, `preview.mjs`, and `completed.diff`. The preview uses synthetic data only. Real inbox delivery, DNS verification, hosted storage/RLS checks, screen-reader behavior and actual email-client compatibility remain manual release gates. This was focused contact/email QA, not a repeat of the entire site's animation/video/device checklist.
