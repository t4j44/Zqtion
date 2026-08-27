# Vercel Production Architecture

Updated: 2026-08-08

## Critical hosting constraint

Zqtion is a commercial agency website. Vercel's Hobby plan is restricted to non-commercial personal use. The live production site therefore requires Vercel Pro or another commercial hosting option.

Official sources:

- https://vercel.com/docs/limits/fair-use-guidelines
- https://vercel.com/docs/plans/hobby
- https://vercel.com/pricing

The project can be developed locally and tested through temporary previews first. Do not connect the primary domain until the content, forms, analytics, security and performance checks pass.

## Recommended launch stack

| Responsibility | Launch choice | Initial cost expectation | Reason |
| --- | --- | --- | --- |
| Framework | Next.js on Vercel | Included in hosting | Existing application and zero-configuration Next.js deployment |
| Production hosting | Vercel Pro | Paid; verify current dashboard price before purchase | Commercial use, previews, functions, image optimization, logs and analytics |
| Domain | Existing Zqtion domain | Already owned | Connect apex and `www` after preview approval |
| Content | Typed local MDX/content files | $0 | Fast, version-controlled and no CMS dependency at launch |
| Inquiry storage | Supabase | Free during low-volume validation, Pro when operational reliability demands it | Structured lead records, secure server-side access and future CRM capability |
| Transactional email | Resend | Free up to the documented limits, then paid | Reliable submission confirmations and internal notifications |
| Spam protection | Cloudflare Turnstile | Free for most small/medium production applications | Less intrusive than traditional CAPTCHA; server validation supported |
| Analytics | Vercel Web Analytics + Search Console | Included within plan limits / free | Deployment-native behavior data plus search performance |
| Performance monitoring | Vercel Speed Insights | Included within plan limits | Real-user Core Web Vitals monitoring |

Current official service references:

- Supabase free tier: https://supabase.com/pricing
- Resend pricing: https://resend.com/pricing
- Turnstile plans: https://developers.cloudflare.com/turnstile/plans/

## Plain-English system

The visitor loads a mostly server-rendered page from Vercel. Text, work, services and articles are available immediately. Expensive animation code and media load only after the useful page is ready.

When a visitor submits a project brief:

1. The browser validates required fields.
2. Turnstile generates a short-lived anti-bot token.
3. A Vercel server function validates the token and the submitted data.
4. The function writes the inquiry to Supabase using a server-only credential.
5. Resend sends a confirmation to the visitor and a notification to Zqtion.
6. Analytics records a successful qualified inquiry without storing private form content.

No database key, Resend key or Turnstile secret is exposed in browser code.

## Content architecture

Launch with repository-managed content rather than paying for a CMS:

```text
content/
├── work/
│   └── project-slug.mdx
├── insights/
│   └── article-slug.mdx
├── people/
│   └── person-slug.mdx
└── legal/
```

Each file must pass a typed schema during the build. Required fields include title, summary, date, status, authors, image, canonical URL, SEO description and disclosure labels. This prevents content, metadata and structured data from drifting apart.

## Media architecture

- Store ordinary optimized images in `public/` or Vercel-supported image delivery.
- Do not use the application repository as a dumping ground for raw source video, ZIP files or duplicate animation exports.
- Encode hero video in modern formats with a poster and short duration.
- Use responsive variants: high-resolution desktop, reduced mobile, and static reduced-motion poster.
- Lazy-load project videos behind user intent.
- Do not eagerly preload the current 111-frame sequence.
- If a frame sequence remains necessary, use a small first segment, fetch later segments progressively, and cap memory usage.

## Domain connection sequence

1. Create or connect the Vercel project.
2. Deploy a preview and finish acceptance testing.
3. Add the domain to the project.
4. Inspect the exact DNS records Vercel requests.
5. Update DNS at the current registrar or delegate DNS to Vercel.
6. Verify apex and `www`, redirect one canonical hostname to the other, and confirm HTTPS.
7. Submit the final sitemap in Google Search Console and Bing Webmaster Tools.

Official domain setup: https://vercel.com/docs/domains/set-up-custom-domain

## Environment variables required later

Names only—never commit their values:

```text
NEXT_PUBLIC_SITE_URL
SUPABASE_URL
SUPABASE_SERVICE_ROLE_KEY
RESEND_API_KEY
CONTACT_FROM_EMAIL
CONTACT_TO_EMAIL
NEXT_PUBLIC_TURNSTILE_SITE_KEY
TURNSTILE_SECRET_KEY
```

Use different Turnstile keys and, where practical, separate data projects for preview and production environments.

## Launch gates

- Production build and type checking pass.
- No placeholder verification codes, contact details or fake claims remain.
- All forms work when JavaScript/network/email failures occur.
- Server-side rate limiting and Turnstile validation are active.
- Privacy policy accurately describes stored form and analytics data.
- Lighthouse and real-device tests pass the agreed budget.
- Search crawler access, canonical URLs, sitemap and structured data are verified.
- Domain is connected only after the preview is approved.
