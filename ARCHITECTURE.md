# Architecture

## Request and rendering model

Next.js Server Components render the route content and metadata. Client Components are limited to interaction: the navbar, hero enhancement, reveals, video facade, contact form, analytics, and floating WhatsApp action.

Launchpad index and track content are server rendered from `data/careers.ts`. The application is a client interaction island with a shared validator; its intake flag stays server-side. Track pages use static parameters, while index/apply read current server configuration. Unknown tracks return 404. The application page is noindex and excluded from the sitemap.

```text
Browser
  -> Next.js App Router
      -> server-rendered route content + metadata + JSON-LD
      -> small client interaction islands
          -> CSS/DOM hero available immediately
          -> optional dynamic Three.js desktop enhancement
          -> YouTube iframe only after Play
```

## Main areas

- `app/`: pages, metadata routes, and server API routes
- `components/`: shared presentation and interaction components
- `components/seo/`: JSON-LD builders
- `data/`: typed services, people, work, and insight content
- `supabase/migrations/`: inquiry, analytics, and rate-limit schema
- `public/`: optimized brand and discovery assets

## Hero tiers

- Full WebGL: non-touch desktop with adequate network, motion, and hardware signals.
- Balanced WebGL: laptop/tablet-sized viewports use lower antialiasing, fewer particles, capped pixel ratio, and a 45 fps render target.
- CSS motion: ordinary phones keep the persistent DOM/CSS Z and scroll story without a WebGL context.
- Static: reduced motion, Save Data, very slow connections, and constrained hardware avoid the persistent animation path.

Three.js is dynamically imported after first paint. Resize and intersection observers control rendering, document visibility pauses it, and cleanup disposes geometry, materials, timers, the renderer, and the WebGL context.

The hero artwork stays local to its first section. On phones it is 280–340px high, above the copy; desktop retains two columns. `ExecutionStory` separately transforms the same thirteen DOM pieces through four layouts in `lib/story-layout.ts`, using native scroll plus one requestAnimationFrame update per scroll tick. Reduced-motion/data-saving tiers show a static arrangement. There is no scroll hijacking or continuous story render loop.

Instrument fonts use `next/font/local` with the existing installed font files, preload and adjusted fallback metrics. No build-time Google Fonts request is needed.

## Launchpad application flow

`LaunchpadApplicationForm` → `/api/applications` → closed-intake gate → same-origin/JSON/body bounds → honeypot and strict field validation → persistent rate limit → Turnstile action/hostname verification → private application insert → optional reference-only notification.

The disabled preview never reaches the API. The enabled path must persist an application before reporting receipt; notification failure does not erase receipt. A stable UUID and answer fingerprint make unchanged retries idempotent without overwriting an existing application. This is not applicant authentication or an admin dashboard. Authorized review is through the private database, not a public browser endpoint.

The shared explicit `TurnstileWidget` supports separate inquiry/launchpad actions, route remount, expiry, retry, reset and teardown. No applicant fields enter anonymous analytics, email notifications, logs or browser storage.

## Inquiry flow

```text
ContactForm
  -> POST /api/inquiries
      -> size and field validation
      -> honeypot
      -> Supabase persistent rate-limit RPC using a hashed IP key
      -> Turnstile server verification
      -> Supabase inquiry insert and Resend notification in parallel
      -> success if either configured delivery path succeeds
```

Lead attribution stores landing path, referrer, and UTM fields. It never stores personal form values in analytics.

## Analytics flow

`components/Analytics.tsx` records a documented event allow-list, route context, anonymous session identifier, attribution, and Web Vitals. `/api/analytics` validates same-origin production requests and writes best-effort events to Supabase. Missing analytics configuration never blocks the user.

## SEO

Route metadata uses the apex `https://zqtion.com` canonical host. Root metadata covers Open Graph and Twitter defaults; insight and work routes override them. JSON-LD includes organization, website, service, FAQ, breadcrumb, article, and video entities. Video upload dates remain omitted until sourced accurately.
