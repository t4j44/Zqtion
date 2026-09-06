# Security

## Implemented controls

- Production security headers and CSP are defined in `next.config.js`.
- Inquiry bodies are size-limited, trimmed, length-limited, validated, and HTML-escaped before email rendering.
- A hidden honeypot rejects automated submissions without exposing that decision.
- Production Turnstile verification fails securely when the secret is missing or a token is invalid.
- Rate limiting uses a Supabase function and a keyed hash of the visitor IP; raw IP addresses are not stored in the rate-limit table.
- Supabase and Resend credentials are server-only. Never prefix secrets with `NEXT_PUBLIC_`.
- Inquiry and event tables have Row Level Security enabled and no anonymous policies.
- Analytics is opt-in by deployment configuration, uses event and metadata allow-lists, honors Do Not Track, strips URL queries and referrer paths, and never sends form fields.
- All JSON intake routes enforce actual streamed body size, even without a trustworthy Content-Length header.
- Public error messages do not include provider or database details.

## Production requirements

Apply migrations 001 and 002 before enabling inquiry delivery, and migration 003 before separately enabling Launchpad. Applying any hosted migration requires explicit authorization. Configure `SUPABASE_URL`, a server-only Supabase secret, both Turnstile keys, and the intended delivery path. `RATE_LIMIT_SECRET` should be a long random server-only value; inquiries retain a Supabase-secret fallback, but Launchpad requires the dedicated value.

## Launchpad safeguards

- Intake is closed by default; disabled requests return 503 before external services are called.
- Enabled requests require an allowed Origin, JSON content type, at most 32 KiB, allowlisted tracks/options, bounded text, valid links, and explicit age/unpaid-program/privacy acknowledgement.
- URLs are stored as applicant-supplied text, never fetched. No uploads, identity documents, date of birth, passwords or raw IPs are collected by the implementation.
- Application data is separate from sales inquiries; migration 003 enables RLS and revokes public/anonymous/authenticated access. Only authorized server operations may read or change it.
- Five attempts per ten minutes use a keyed, purpose-specific IP hash and the persistent limiter. Turnstile must return the expected `launchpad` action and approved hostname. Provider timeouts/errors fail closed.
- Success requires durable storage. Unchanged UUID retries confirm the same receipt, while changed answers cannot overwrite that record. Notifications contain only a reference and track.
- Preview checkbox checks are local tests, not submitted consent. Real consent is recorded only with an enabled, successful application.
- Before activation, approve eligible jurisdictions, learning/supervision capacity, retention duration, deletion/access requests, reviewer access and applicant-facing terms. These are not established by the source code.

Do not weaken the production fail-secure behavior to make a broken deployment appear healthy. If the persistent limit or bot verification is unavailable, direct users to email or WhatsApp while configuration is repaired.

## Known trade-offs

The CSP permits inline scripts/styles because of the current Next.js, JSON-LD, and Turnstile integration. Replacing this with per-request nonces is a future hardening task and must be tested against static rendering and caching.

The analytics endpoint intentionally returns success when analytics storage is unavailable so measurement never interrupts navigation or lead delivery.

## Verification

- Confirm `.env*` secrets are ignored and absent from client bundles.
- Submit invalid, oversized, honeypot, missing-token, expired-token, and over-limit requests.
- Confirm six attempts inside one ten-minute window are rejected across separate function instances.
- Confirm only a hash—not a raw IP—is present in `website_rate_limits`.
- Confirm anonymous database roles cannot read or insert inquiry/event data.
- Confirm production responses expose no provider error details.
