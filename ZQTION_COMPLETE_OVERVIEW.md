# ZQTION — Complete Website Overview

> **Last Updated:** May 11, 2026
> **Purpose:** A single document for anyone (tech or non-tech) to fully understand the Zqtion website — what it is, how it works, and how it's built.

---

## 1. What is Zqtion?

**Zqtion** (pronounced "Z-Q-tion") is a **creative agency / digital studio** based in Bangladesh. Their tagline is **"Execution, Automated."**

### What They Do (3 Core Services)

| Service | What It Means (Simple) | Tools Mentioned |
|---------|----------------------|-----------------|
| **AI Video Studio** | They create videos using AI — commercials, motion graphics, brand storytelling, and social media content | Generative AI video workflows |
| **Visual Ops** | They enhance product photos and create social media posters — think "before/after" transformations | Photo remastering, batch processing |
| **Web Architecture** | They build fast websites — menus for restaurants, online stores, booking systems | Next.js, 0.5s load times |

### Contact Information Found in Code
- **Email:** zqtioncontact@gmail.com
- **WhatsApp:** +880 1340-347975 (Bangladesh number)
- **LinkedIn:** linkedin.com/company/zqtion/
- **Website URL:** https://zqtion.com

---

## 2. The Website at a Glance

This is a **single-page marketing/portfolio website** with one additional `/services` page. It's designed to look premium — dark theme, cinematic scroll animations, glassmorphism effects.

### What a Visitor Sees (Top to Bottom)

```
┌─────────────────────────────────────┐
│  NAVBAR (fixed at top)              │  Logo + "START EXECUTION" button
├─────────────────────────────────────┤
│  HERO SECTION (scroll animation)    │  111-frame cinematic animation
│  - "ZQTION" brand name appears      │  controlled by scrolling
│  - "EXECUTION, AUTOMATED" tagline   │
│  - "Ideas are cheap. We build..."   │
├─────────────────────────────────────┤
│  SERVICES SECTION                   │  3 cards: AI Video, Visual Ops,
│  (bento grid layout)                │  Web Architecture
├─────────────────────────────────────┤
│  PHONE DEMO SECTION                 │  Animated phone showing a
│  "Your PDF menu is losing           │  restaurant menu scrolling
│   customers"                        │
├─────────────────────────────────────┤
│  PORTFOLIO SECTION                  │  YouTube videos — 1 featured +
│  "Selected Works"                   │  9 vertical shorts/reels
├─────────────────────────────────────┤
│  FOOTER                             │  Logo, links, social, copyright
├─────────────────────────────────────┤
│  WHATSAPP BUTTON (floating)         │  Green circle, bottom-right
└─────────────────────────────────────┘
```

### The `/services` Page
A separate full page titled "OPERATIONAL MENU" showing the 3 services as large spotlight cards. Each card has a "BOOK VIA WHATSAPP" button that opens WhatsApp with a pre-filled message.

---

## 3. Technology Stack (For Non-Tech People)

Think of building a website like building a house:

| Layer | Technology | What It Does (Simple) |
|-------|-----------|----------------------|
| **Foundation** | Next.js 14 | The main framework — like the building's structure |
| **Language** | TypeScript | The "grammar rules" that prevent coding mistakes |
| **Paint & Decor** | Tailwind CSS | Makes everything look pretty — colors, spacing, fonts |
| **Movement** | Framer Motion | Makes things animate — fade in, slide, bounce |
| **Smooth Scrolling** | Lenis | Makes scrolling feel silky smooth like a luxury car |
| **The Movie Effect** | HTML5 Canvas | Plays the 111-frame animation as you scroll |
| **Icons** | Lucide React | Small icons like arrows, play buttons, mail icons |
| **Font** | Inter (Google Fonts) | The text style used across the site |
| **Backend (Optional)** | Supabase | Database service (set up but not actively used) |
| **Hosting** | Vercel | Where the website lives on the internet |

---

## 4. Technology Stack (For Tech People)

### Core Dependencies (`package.json`)

```
Production:
  next           ^14.2.0      (App Router, React Server Components)
  react          ^18.3.1
  react-dom      ^18.3.1
  framer-motion  ^11.0.0      (Animation library)
  lenis          ^1.3.17      (Smooth scroll)
  lucide-react   ^0.344.0     (Icons)
  @supabase/supabase-js ^2.39.0  (Backend SDK — scaffolded, not active)

Dev:
  typescript     ^5.4.0
  tailwindcss    ^3.4.1
  eslint         ^8.57.0 + next config
  postcss        ^8.4.35 + autoprefixer
```

### Architecture Pattern
- **Next.js App Router** (not Pages Router)
- **Client Components** throughout (`'use client'` on every component)
- **No Server Components** are actively used despite Next.js 14 support
- **No API routes** exist
- **Static data** — all content is hardcoded in components (no CMS, no database queries)
- **Supabase** is scaffolded (client.ts + server.ts) but **never imported or used** in any page or component

### Custom Tailwind Config
```typescript
colors: {
  'zqtion-black': '#000000',
  'zqtion-blue': '#0B63FF',   // Primary brand color (Electric Blue)
  electric: '#0B63FF',         // Alias
}
fontFamily: {
  sans: ['Geist Sans', 'var(--font-inter)', 'system-ui', 'sans-serif']
}
screens: { 'xs': '475px' }    // Extra breakpoint
```

---

## 5. Complete File Map

### Project Root
```
e:\zqtion\website of zqtion\
│
├── app/                          # Next.js App Router
│   ├── layout.tsx                # Root layout — Inter font, metadata, Navbar, WhatsApp
│   ├── page.tsx                  # Homepage — assembles all sections
│   ├── globals.css               # Global styles, custom scrollbar, glass utilities
│   ├── robots.ts                 # SEO — blocks AI bots, allows Google/Bing
│   ├── sitemap.ts                # SEO — generates sitemap.xml
│   └── services/
│       └── page.tsx              # /services page — 3 spotlight cards
│
├── components/                   # All UI components (17 files)
│   ├── ScrollyCanvas.tsx         # ★ Core: Canvas animation engine
│   ├── Overlay.tsx               # ★ Core: Brand text over the animation
│   ├── Services.tsx              # ★ Core: Bento grid service cards
│   ├── PhoneDemo.tsx             # ★ Core: Animated phone mockup
│   ├── Portfolio.tsx             # ★ Core: Video showcase + inline footer
│   ├── SmoothScroll.tsx          # ★ Core: Lenis smooth scroll wrapper
│   ├── Navbar.tsx                # ★ Core: Fixed top navigation
│   ├── WhatsAppButton.tsx        # ★ Core: Floating WhatsApp CTA
│   ├── Footer.tsx                # Standalone footer (used by older layout)
│   ├── ScrollOverlay.tsx         # Alternate parallax overlay (not imported)
│   ├── ScrollIndicator.tsx       # Progress bar (not imported in current page)
│   ├── ProjectsGrid.tsx          # Alternate projects section (not imported)
│   ├── Hero.tsx                  # Alternate hero (not imported)
│   ├── Navigation.tsx            # Alternate navbar (not imported)
│   ├── ServicesGrid.tsx          # Alternate services layout (not imported)
│   ├── BeforeAfterSlider.tsx     # Standalone slider (used by ServicesGrid only)
│   └── VideoEmbed.tsx            # Standalone embed (not imported directly)
│
├── lib/                          # Utilities
│   ├── canvas-utils.ts           # Frame URL generator + image preloader
│   ├── performance.ts            # Dev-only FPS/memory monitoring
│   └── supabase/
│       ├── client.ts             # Browser-side Supabase client
│       └── server.ts             # Server-side Supabase admin client
│
├── public/
│   ├── logo.png                  # Zqtion logo (1.7 MB)
│   └── sequence/                 # 111 WebP animation frames (~2.4 MB total)
│       ├── frame_000.webp ... frame_110.webp
│
├── squences/                     # 117 raw frames (older version, NOT used)
├── Squences updated/             # 111 raw frames (source for public/sequence)
│
├── Configuration Files
│   ├── next.config.js            # Security headers, caching, Supabase domains
│   ├── tailwind.config.ts        # Custom colors, fonts, breakpoints
│   ├── tsconfig.json             # TypeScript strict mode, path aliases
│   ├── postcss.config.js         # Tailwind + Autoprefixer
│   ├── .eslintrc.json            # Next.js core-web-vitals preset
│   ├── vercel.json               # Vercel deployment (region: iad1)
│   ├── .vercelignore             # Excludes .env, node_modules, .git
│   ├── .gitignore                # Standard Next.js gitignore
│   ├── .env.example              # Template for env variables
│   ├── .env.local                # Rate limit config, CORS origins
│   └── middleware.ts             # Security headers on every request
│
├── Documentation (8 markdown files)
│   ├── README.md, ARCHITECTURE.md, PROJECT_SUMMARY.md
│   ├── COMPONENTS_REFERENCE.md, QUICKSTART.md
│   ├── DEPLOYMENT.md, SECURITY.md, LAUNCH_CHECKLIST.md
│
└── Assets (not used in code)
    ├── Zqtion logo 1.png, Zqtion logo.svg, Zqtion.png
    └── ezgif-split.zip, ezgif-split-uptaded.zip
```

---

## 6. How The Scroll Animation Works

This is the most complex part of the site. Here's how it works:

1. **111 images** (WebP format) are stored in `public/sequence/`
2. When the page loads, **all 111 images are downloaded** into memory
3. A `<canvas>` element fills the entire screen
4. As the user scrolls down, the scroll position is converted to a frame number (0-110)
5. The matching image is painted onto the canvas — creating a "video" controlled by scrolling
6. Text overlays ("ZQTION", "EXECUTION, AUTOMATED", etc.) fade in/out at specific scroll positions

**Technical details:**
- Container height is `400vh` (4× the screen height) for enough scroll distance
- Uses `position: sticky` so the canvas stays visible while scrolling
- Framer Motion's `useSpring` adds physics-based smoothing
- Cinematic effects: zoom-in, vignette overlay, film grain, contrast/saturation boost
- A loading screen ("LOADING ASSETS...") shows until all frames are ready

---

## 7. Design System

### Colors
| Name | Value | Where Used |
|------|-------|-----------|
| Background | `#000000` / `#050505` / `#0a0a0a` | Page backgrounds |
| Primary Blue | `#0B63FF` | Buttons, accents, highlights |
| White | `#FFFFFF` | Headings, primary text |
| White/60 | `rgba(255,255,255,0.6)` | Body text |
| White/40 | `rgba(255,255,255,0.4)` | Muted text |
| Borders | `rgba(255,255,255,0.1)` | Card borders |

### Typography
- **Font:** Inter (loaded via `next/font/google`)
- **Hero text:** 15vw (massive, fills viewport width)
- **Section headings:** 3xl to 9xl (responsive)
- **Body:** lg (18px)

### Visual Effects
- **Glassmorphism:** `backdrop-blur-xl` + semi-transparent backgrounds
- **Gradient Orbs:** Large blurred circles behind cards for ambient glow
- **Film Grain:** SVG noise texture overlay at 5% opacity
- **Vignette:** Radial gradient darkening canvas edges
- **Custom Scrollbar:** 8px wide, dark track, semi-transparent thumb

---

## 8. Security Setup

### HTTP Headers (via `next.config.js` + `middleware.ts`)
- `Strict-Transport-Security` — forces HTTPS
- `X-Frame-Options: SAMEORIGIN` — prevents iframe embedding
- `X-Content-Type-Options: nosniff`
- `X-XSS-Protection` — browser XSS protection
- `Referrer-Policy` — limits referrer info
- `Permissions-Policy` — disables camera/mic/geolocation

### Bot Protection (`app/robots.ts`)
- **Blocked:** GPTBot, ChatGPT-User, CCBot, anthropic-ai, Claude-Web, AhrefsBot, SemrushBot, DotBot, MJ12bot
- **Allowed:** Googlebot, Bingbot (with 2-second crawl delay)

### Asset Caching
- `/sequence/*` frames: cached for 1 year (immutable)

---

## 9. SEO Configuration

| Feature | Status | Details |
|---------|--------|---------|
| Title Tag | ✅ | "Zqtion - Execution, Automated" |
| Meta Description | ✅ | "We turn static assets into viral systems..." |
| Open Graph | ✅ | Title, description, URL, site name |
| Twitter Card | ✅ | summary_large_image |
| Robots.txt | ✅ | Auto-generated, blocks AI bots |
| Sitemap.xml | ✅ | Auto-generated, single URL |
| OG Image | ❌ | Not configured |
| Google Verification | ❌ | Not set |

---

## 10. Active vs. Unused Components

### ✅ Actively Used (8 components)
| Component | Used In |
|-----------|---------|
| `ScrollyCanvas.tsx` | `app/page.tsx` |
| `Overlay.tsx` | `app/page.tsx` |
| `Services.tsx` | `app/page.tsx` |
| `PhoneDemo.tsx` | `app/page.tsx` |
| `Portfolio.tsx` | `app/page.tsx` |
| `SmoothScroll.tsx` | `app/page.tsx` |
| `Navbar.tsx` | `app/layout.tsx` |
| `WhatsAppButton.tsx` | `app/layout.tsx` |

### ❌ NOT Used (9 components — dead code)
| Component | What It Was | Replaced By |
|-----------|------------|-------------|
| `Footer.tsx` | Standalone footer | `Portfolio.tsx` inline footer |
| `ScrollOverlay.tsx` | Parallax text | `Overlay.tsx` |
| `ScrollIndicator.tsx` | Progress bar | Not replaced |
| `ProjectsGrid.tsx` | Projects grid | `Portfolio.tsx` |
| `Hero.tsx` | Static hero | Scroll animation |
| `Navigation.tsx` | Alternate navbar | `Navbar.tsx` |
| `ServicesGrid.tsx` | Service cards | `Services.tsx` |
| `BeforeAfterSlider.tsx` | Slider widget | Only used by unused ServicesGrid |
| `VideoEmbed.tsx` | Video component | Portfolio has inline version |

---

## 11. Known Issues & Technical Debt

### 🔴 Critical
1. **Frame count mismatch in docs** — Code uses 111 frames correctly, but old docs reference 117 frames
2. **`.env.local` in workspace** — Should not be committed (gitignore covers it, but file exists locally)

### 🟡 Moderate
3. **9 unused components** — Nearly half the component files are dead code
4. **Supabase installed but unused** — Adds bundle weight for no reason
5. **Footer links non-functional** — Privacy, Terms, Cookies all link to `#`
6. **Social links incomplete** — Portfolio footer has placeholder `#` links

### 🟢 Minor
7. **Logo is 1.7 MB** — Should be optimized
8. **ZIP files in project root** — Source assets shouldn't be in deployment
9. **Inconsistent background colors** — `#000000`, `#050505`, `#0a0a0a` mixed

---

## 12. How to Run This Project

```bash
# Install dependencies
cd "e:\zqtion\website of zqtion"
npm install

# Start development server
npm run dev
# Open: http://localhost:3000

# Build for production
npm run build

# Deploy to Vercel
vercel --prod
```

---

## 13. Glossary (For Non-Tech Readers)

| Term | Meaning |
|------|---------|
| **Next.js** | A popular tool for building websites, made by Vercel |
| **React** | A library for building user interfaces, made by Meta/Facebook |
| **TypeScript** | JavaScript with extra safety checks |
| **Tailwind CSS** | A way to style websites using short class names |
| **Framer Motion** | A library that makes things move and animate on screen |
| **Canvas** | An HTML element for drawing images — like a digital whiteboard |
| **Scrollytelling** | A storytelling technique where content changes as you scroll |
| **Glassmorphism** | A design style where elements look like frosted glass |
| **Vercel** | A cloud platform that hosts websites |
| **Supabase** | An open-source backend service (database, auth) |
| **WebP** | A modern image format smaller than JPEG/PNG |
| **SEO** | Search Engine Optimization — making your site findable on Google |

---

## 14. Summary

**Zqtion is a Bangladesh-based creative agency** offering AI video production, visual operations, and web development. Their website is a **Next.js 14 single-page application** with a cinematic scroll-driven animation as its centerpiece. The site uses a **dark, premium aesthetic** with glassmorphism effects and is **deployed on Vercel**.

The codebase is functional but contains significant dead code (9 unused components) and an unused Supabase integration. The active site consists of **8 components across 2 pages**, with all content hardcoded. Primary conversion channels are **WhatsApp** and **email**.

---

*Document generated from a complete file-by-file audit of every source file, config, and document in the project.*
