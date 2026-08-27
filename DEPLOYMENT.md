# Zqtion production launch

This repository is ready for a Vercel preview, but the public agency launch is not complete until the external services and domain checks below pass.

## Launch constraints

- Zqtion is a commercial agency website. Vercel documents the Hobby plan as personal, non-commercial use only. Use a Vercel Pro team for the production domain: https://vercel.com/docs/plans/hobby
- A Vercel project is not linked on this machine and the Vercel CLI is not installed.
- Do not connect `zqtion.com` until a preview deployment, the inquiry path, and all final business information have been verified.
- Never commit `.env.local`, a Supabase service key, Resend API key, or Turnstile secret.

## 1. Supabase inquiry storage

1. Create a hosted Supabase project. Choose a region that matches the Vercel function region and the primary audience; do not guess after launch.
2. Open the SQL editor and apply `supabase/migrations/001_website_inquiries.sql`.
3. Confirm that Row Level Security is enabled and that no anonymous read policy exists.
4. Copy the project URL, public anon key, and a server-only secret key.
5. The server key bypasses RLS and must never be exposed in client code or a `NEXT_PUBLIC_*` variable. Legacy projects may use `SUPABASE_SERVICE_ROLE_KEY`; new projects should prefer the current server secret key.

Required Vercel variables:

```text
SUPABASE_URL
NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY
SUPABASE_SECRET_KEY
```

## 2. Resend inquiry delivery

1. Create a Resend account.
2. Add a sending subdomain such as `updates.zqtion.com`.
3. Add the exact SPF and DKIM records Resend provides at the DNS provider.
4. Wait until Resend shows the domain as verified.
5. Create a restricted API key and set a sender on the verified subdomain.

Required Vercel variables:

```text
RESEND_API_KEY
INQUIRY_FROM_EMAIL=Zqtion Website <briefs@updates.zqtion.com>
INQUIRY_TO_EMAIL=zqtioncontact@gmail.com
```

Resend domain documentation: https://resend.com/docs/dashboard/domains/introduction

## 3. Cloudflare Turnstile

1. Create separate Turnstile widgets for preview and production.
2. Restrict the production widget to `zqtion.com` and `www.zqtion.com`.
3. Add the public site key and server-only secret to Vercel.
4. The route already validates every configured token with Cloudflare Siteverify. Client-side verification alone is not accepted.

Required Vercel variables:

```text
NEXT_PUBLIC_TURNSTILE_SITE_KEY
TURNSTILE_SECRET_KEY
```

Server-side validation documentation: https://developers.cloudflare.com/turnstile/get-started/server-side-validation/

## 4. Create the Vercel project

Use the Vercel dashboard after the approved repository changes are committed and pushed:

1. Create or select a Vercel Pro team.
2. Import `https://github.com/t4j44/Zqtion`.
3. If the Git repository root contains more than this website, set the project Root Directory to `website of zqtion`. If this directory is already the repository root on GitHub, leave Root Directory blank.
4. Keep Framework Preset as Next.js. The repository `vercel.json` intentionally avoids overriding build output or function region.
5. Add all environment variables to Preview and Production. Vercel applies environment-variable changes only to new deployments, so redeploy after adding or changing them.
6. Deploy a Preview first.

Official Vercel project settings: https://vercel.com/docs/project-configuration/project-settings

## 5. Preview acceptance test

Do not promote the preview until all items pass:

- `npm run build` succeeds.
- Home, work, every case study, services, process, about, insights, every article, AI audit, contact, privacy, and terms return 200.
- `/pricing` redirects to `/services#engagements`.
- The 3D hero and operating-model handoff scrub without long tasks, visible frame tearing, or layout shifts.
- Capable phones and tablets receive the same continuous 3D journey, with the scene centered and clear of the section divider at 360px, 390px, and 640px widths.
- Reduced-motion, data-saver, slow-network, very-low-power, and WebGL-failure paths use the modular static Z fallback; no generic square logo flashes before the 3D scene is ready.
- Keyboard navigation can reach and operate the menu, video facades, form, and footer.
- A real controlled form submission creates one Supabase row and one Resend email.
- Spam verification rejects a missing or invalid Turnstile token in production.
- Failed delivery produces a visible error; it never claims a lead was sent.
- No console errors, broken thumbnails, horizontal overflow, or mixed content.
- `robots.txt`, `sitemap.xml`, `llms.txt`, and `ai.txt` return 200.

## 6. Connect the domain

1. In Vercel Project Settings → Domains, add both `zqtion.com` and `www.zqtion.com`.
2. Choose one canonical hostname. The website currently uses `https://zqtion.com`; redirect `www` to the apex domain.
3. Use the exact A/CNAME/TXT records Vercel displays for this project. Do not copy generic DNS values if the dashboard gives project-specific records.
4. Preserve existing email-related MX, SPF, DKIM, and DMARC records when changing DNS.
5. Wait for DNS verification and Vercel-managed TLS to complete.
6. Re-run the acceptance test on the production domain.

Official domain guide: https://vercel.com/docs/domains/set-up-custom-domain

## 7. Search and operational launch

1. Add the final domain property to Google Search Console and Bing Webmaster Tools.
2. Submit `https://zqtion.com/sitemap.xml`.
3. Verify Organization, Service, FAQ, Breadcrumb, and Article structured data with current search-engine testing tools.
4. Create a monthly publishing cadence only after the first three insights are indexed and useful queries are visible.
5. Add privacy-respecting analytics and error monitoring only after choosing the provider and updating the privacy page if data collection changes.
6. Keep portfolio relationship disclosures synchronized with LinkedIn, YouTube, and future client permissions.

## Rollback

If a production release breaks the form, navigation, or primary pages, use Vercel’s deployment history to promote the last verified deployment. Do not make DNS changes for an application-only rollback.
