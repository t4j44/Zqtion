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

## 2. Supabase (separate staging and production projects)

Use the **Zqtion** Supabase organization only (not Second Brain). Identify the project ref before every migration. As of 23 October 2026, Staging `tgjxwjstzdinrcmkpzoj` has all **11** application migrations; Production `vvmobcpkmrghigaurswe` has not been migrated by this release.

On a fresh project, inspect and apply **exactly these tracked files in order**, once each:

1. `supabase/migrations/001_website_inquiries.sql`
2. `supabase/migrations/002_analytics_attribution_rate_limits.sql`
3. `supabase/migrations/003_launchpad_applications.sql` (schema only; intake stays disabled)
4. `supabase/migrations/004_community_v1.sql`
5. `supabase/migrations/005_community_similarity.sql`
6. `supabase/migrations/006_community_profile_portfolio.sql`
7. `supabase/migrations/007_community_public_search_hardening.sql`
8. `supabase/migrations/008_resource_intelligence.sql`
9. `supabase/migrations/009_source_registry_and_knowledge_graph.sql`
10. `supabase/migrations/010_release_hardening.sql`
11. `supabase/migrations/011_private_inquiry_grants.sql`

Never replay all migrations on an existing database without schema/history inspection. Maintain a reviewed backup and recovery plan **before** executing any production migration; SQL rollback is not a substitute for restoring changed data. Production migrations require explicit separate approval after hosted staging acceptance.

Verify all tables have the intended RLS state, sensitive table grants deny `anon`/`authenticated`, and the `community` bucket is **private** (1 MB maximum; JPEG/PNG/WebP). Some deliberately private tables have RLS with no public policies. Public Community read aggregates use bounded `SECURITY DEFINER` RPCs with explicit visibility predicates; review their exact function bodies rather than indiscriminately revoking access. Review Supabase Security and Performance Advisors, real two-user isolation, and the full permission/hosted test checklist. Confirm the server-only credential can write private inquiries and enforce rate limits; the client-facing publishable/anon key **must not** be a service-role credential.

For Google sign-in, follow `docs/GOOGLE_OAUTH_SETUP.md`, configure the actual provider and Auth URLs in the environment's Supabase dashboard, and test real browser sessions. Email verification/reset requires a verified SMTP sender and actual delivery. Do not claim hosted acceptance from local mocked provider tests.

## 3. Environment

Use `.env.example` as the name-only source. Never commit values. Production requires:

- `NEXT_PUBLIC_SITE_URL=https://zqtion.com`
- Supabase URL and server secret
- `RATE_LIMIT_SECRET`
- Resend sender/recipient configuration for both internal alerts and customer confirmations; see `docs/INQUIRY_EMAIL_SETUP.md` for the storage-first acceptance policy, monitoring, and Zoho-safe DNS setup
- public and secret Turnstile keys
- `NEXT_PUBLIC_ANALYTICS_ENABLED=true` only when measurement is approved and migration 002 is applied

Use separate Turnstile widgets for preview and production. Restrict production to the approved hostnames.

### Launchpad activation gate

Leave `LAUNCHPAD_APPLICATIONS_ENABLED=false` for local visual review. Before changing it, approve cohort supervision, mentor capacity, dates, locations/jurisdictions, unpaid-program terms and privacy/retention procedures. Verify migration 003 with anonymous access denied, then perform one explicitly authorized controlled application. Confirm a receipt, private row, unchanged-retry behavior, limiter, action/hostname checks and reference-only notification when `APPLICATION_TO_EMAIL` is configured.

The production-mode application API intentionally permits only the approved production origins; localhost is not a production-intake bypass. Use development mode and separate approved test credentials for controlled integration testing. Do not weaken origin or bot checks to make a production-mode localhost test submit.

## 4. Preview acceptance

- Every generated route returns the expected status.
- A controlled form submission creates an attributed inquiry and sends both the internal alert and visitor confirmation with correct Reply-To addresses.
- Anonymous events contain no form content.
- Missing or invalid Turnstile, failed storage, and rate limits show honest fallback messages. Email-only failures preserve a saved inquiry and report channel status in server logs; the UI never claims a confirmation was sent without provider acceptance.
- Mobile uses native scroll and the CSS hero; desktop progressively loads Three.js.
- Menu focus trap, Escape close, focus restoration, video keyboard controls, and skip link work.
- No console/hydration errors, broken links, horizontal overflow, or early YouTube iframe.
- `robots.txt`, `sitemap.xml`, `llms.txt`, and `ai.txt` are current.

## 5. Domain

Use `https://zqtion.com` as canonical. The application permanently redirects `www.zqtion.com` to the apex host. Preserve mail DNS records when connecting hosting, verify TLS and both hosts, then submit the sitemap to search tools.

## Rollback

Use the hosting provider's last verified deployment for an application rollback. Do not change DNS for an application-only failure.
