# Zqtion launch status

Updated: 2026-08-08

## Outcome

The website application is production-buildable and ready for a controlled Vercel preview. It is not yet publicly launched because no Vercel project, production environment variables, working inquiry delivery, or domain DNS state has been verified from this workspace.

## Completed

- Repositioned Zqtion as a founder-led AI execution company across Create, Build, and Automate.
- Rebuilt the homepage, navigation, footer, services, process, about, work index, six case studies, insights index, three articles, AI audit, contact, privacy, and terms.
- Removed unsupported fixed prices, delivery guarantees, testimonials, awards, and client-result claims.
- Labeled portfolio relationships as competition entry, independent concept, founder venture, or creative lab.
- Added static YouTube video facades so pages do not load an iframe before a visitor chooses to play.
- Kept the 111-frame hero at 2.34 MB total, added progressive loading, capped canvas density, and added mobile, reduced-motion, and data-saver fallbacks.
- Added Organization, WebSite, ProfessionalService, Service, FAQ, Breadcrumb, and Article structured data without fabricated dates or results.
- Added crawlable `robots.txt`, `sitemap.xml`, `llms.txt`, and `ai.txt` outputs.
- Added a server-validated inquiry route with field validation, honeypot, best-effort rate limiting, optional Turnstile verification, Supabase storage, Resend delivery, and explicit failure states.
- Added a locked-down Supabase inquiry migration with Row Level Security and no public policies.
- Added production security headers and a Content Security Policy.
- Migrated to Next.js 16.3, React 19.2, current production libraries, ESLint 9 flat configuration, and Sharp 0.35.
- Removed the unused earlier component and data generation that still contained low pricing and unsupported delivery promises.

## Verification evidence

- `npm run lint`: passes.
- `npm run build`: passes with Next.js 16.3 and TypeScript.
- `npm audit`: 0 known vulnerabilities.
- Production smoke test: all primary pages, case study sample, insight sample, machine-readable files, and legal pages returned HTTP 200.
- `/pricing`: HTTP 308 with `Location: /services#engagements`.
- Invalid inquiry payload: HTTP 400 without attempting delivery.
- Browser smoke test: homepage and contact page have no console errors or horizontal overflow; the AI strategy query preselects the correct form service.

## External blockers

1. A Vercel Pro team or another commercial host is required for the public agency website. Vercel Hobby is documented as personal, non-commercial use only.
2. The Git working tree contains existing user work as well as this rebuild. The final deployment commit must be reviewed before pushing; no commit or push was made automatically.
3. Supabase must be created and `supabase/migrations/001_website_inquiries.sql` must be applied.
4. A Resend sending subdomain must be verified and a restricted API key created.
5. Cloudflare Turnstile production keys must be created and restricted to the final hostnames.
6. Vercel Preview and Production environment variables must be configured.
7. A real controlled inquiry must be verified in both Supabase and the destination inbox.
8. The domain must be added only after preview acceptance. Existing email DNS records must be preserved.

## Business information to confirm before domain cutover

- `zqtion.com` is the intended canonical domain and `www.zqtion.com` should redirect to it.
- `zqtioncontact@gmail.com` and `+880 1340-347975` are the public contact points.
- Tajuddin Ahamed is publicly listed as Founder · AI Strategy & Consulting.
- Mohammad Abu Ubayda is publicly listed as AI Creative Lead.
- Mehide Hasan Emon is publicly listed as Technical Lead.
- Syed Nabil Yaseen is publicly listed as Post-Production Lead.
- Every public work disclosure is acceptable to the people and rights holders involved.
- No additional commissioned client work, documented results, awards, or public team members should be added until evidence and permission are available.

## Next controlled action

Follow `DEPLOYMENT.md` to create the hosted services and a Vercel preview. Do not connect the production domain until the preview acceptance test and real inquiry-delivery test pass.
