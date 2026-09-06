# Deployment

No deployment is authorized merely by completing local implementation. Review the local build and browser evidence before committing, pushing, creating a preview, or changing DNS.

## 1. Local gates

```bash
npm install
npm run typecheck
npm run lint
npm test
npm run build
npm start
```

Complete `QA_CHECKLIST.md` against the production server.

## 2. Supabase

Apply in order:

1. `supabase/migrations/001_website_inquiries.sql`
2. `supabase/migrations/002_analytics_attribution_rate_limits.sql`
3. `supabase/migrations/003_launchpad_applications.sql`, only when Launchpad intake preparation is approved

Confirm Row Level Security is enabled, no anonymous policies exist, the service role can execute `consume_website_inquiry_rate_limit`, and an over-limit request is rejected.

## 3. Environment

Use `.env.example` as the name-only source. Never commit values. Production requires:

- `NEXT_PUBLIC_SITE_URL=https://zqtion.com`
- Supabase URL and server secret
- `RATE_LIMIT_SECRET`
- Resend sender/recipient configuration if email delivery is enabled
- public and secret Turnstile keys
- `NEXT_PUBLIC_ANALYTICS_ENABLED=true` only when measurement is approved and migration 002 is applied

Use separate Turnstile widgets for preview and production. Restrict production to the approved hostnames.

### Launchpad activation gate

Leave `LAUNCHPAD_APPLICATIONS_ENABLED=false` for local visual review. Before changing it, approve cohort supervision, mentor capacity, dates, locations/jurisdictions, unpaid-program terms and privacy/retention procedures. Verify migration 003 with anonymous access denied, then perform one explicitly authorized controlled application. Confirm a receipt, private row, unchanged-retry behavior, limiter, action/hostname checks and reference-only notification when `APPLICATION_TO_EMAIL` is configured.

The production-mode application API intentionally permits only the approved production origins; localhost is not a production-intake bypass. Use development mode and separate approved test credentials for controlled integration testing. Do not weaken origin or bot checks to make a production-mode localhost test submit.

## 4. Preview acceptance

- Every generated route returns the expected status.
- A controlled form submission creates an attributed inquiry and sends the expected notification.
- Anonymous events contain no form content.
- Missing or invalid Turnstile, failed providers, and rate limits show honest fallback messages.
- Mobile uses native scroll and the CSS hero; desktop progressively loads Three.js.
- Menu focus trap, Escape close, focus restoration, video keyboard controls, and skip link work.
- No console/hydration errors, broken links, horizontal overflow, or early YouTube iframe.
- `robots.txt`, `sitemap.xml`, `llms.txt`, and `ai.txt` are current.

## 5. Domain

Use `https://zqtion.com` as canonical. The application permanently redirects `www.zqtion.com` to the apex host. Preserve mail DNS records when connecting hosting, verify TLS and both hosts, then submit the sitemap to search tools.

## Rollback

Use the hosting provider's last verified deployment for an application rollback. Do not change DNS for an application-only failure.
