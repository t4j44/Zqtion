# Zqtion Website QA Checklist

This checklist is used for manual and automated verification of the Zqtion website features, design aesthetics, SEO status, and responsiveness before sending to cold leads.

## 🚀 Manual Browser QA Checklist

Perform these checks in a real browser (Desktop & Mobile viewports) before final deployment:

### 1. Homepage & Layout Checks
- [ ] **Homepage Loads Correctly**: Page loads fast with no errors in console and no generic square-Z flash before WebGL is ready.
- [ ] **Execution Story**: Thirteen pieces transform through Create fragments, Build interface, Automate workflow and Z, with no text/art overlap. The hero Z itself stays in the first section.
- [ ] **Adaptive hero**: Ordinary phones use the CSS/DOM Z with native scrolling; capable non-touch desktop devices may progressively enhance to Three.js. The scene never blocks touch scrolling.
- [ ] **Fallbacks**: Reduced-motion, data-saver, slow-network, very-low-power, and WebGL-failure paths show the modular static Z and planetary orbits.
- [ ] **Mobile Menu**: Hamburger opens/closes correctly; focus enters the menu, Tab stays trapped, Escape closes it, and focus returns to the trigger.
- [ ] **No Horizontal Overflow**: No horizontal scroll bars or content clipping on mobile viewports.
- [ ] **Responsive Viewports**: Verify at 320, 360, 375, 390, 412, 430, 768, 1024, 1280, 1440, and 1920 pixels wide.

### 2. Portfolio & Work Page (`/work`)
- [ ] **Case-study Routes**: Every work card opens its matching `/work/[slug]` page without a 404.
- [ ] **Truth Labels**: Competition entry, independent concept, founder venture, and creative-lab relationships are visible before capability claims.
- [ ] **Video Facades**: YouTube is not loaded until the visitor activates a video; keyboard activation and focus states work.
- [ ] **Media Ratios**: Horizontal videos render at 16:9 and vertical shorts at 9:16 without stretching or layout shift.

### 3. Contact & Conversions
- [ ] **WhatsApp Button**: Floating WhatsApp button opens the correct chat with prepopulated message.
- [ ] **Email Links**: Direct email links (`mailto:zqtioncontact@gmail.com`) open the default mail client.
- [ ] **Contact Delivery**: A controlled form submission creates a Supabase row and sends a Resend notification.
- [ ] **Failure State**: Missing configuration, invalid Turnstile tokens, and provider failure show an honest error and never claim delivery.
- [ ] **Attribution**: Landing path, referrer, and available UTM fields reach the inquiry record without entering anonymous analytics metadata.
- [ ] **Rate Limit**: The sixth inquiry attempt inside ten minutes is rejected across separate server instances; the database stores only a hashed key.
- [ ] **Analytics**: Named CTA, work, contact, WhatsApp, email, form, and Web Vital events are anonymous, and Do Not Track disables client sending.
- [ ] **Footer Links**: Verify all footer links work with no broken `#` or placeholder links:
  - [x] Work (`/work`)
  - [x] Services (`/services`)
  - [x] Pricing redirect (`/pricing` → `/services#engagements`)
  - [x] Contact (`/contact`)
  - [x] Privacy Policy (`/privacy`)
  - [x] Terms of Service (`/terms`)
  - [x] Direct Email Link
  - [x] Direct WhatsApp Link

### 4. SEO & Verification Assets
- [ ] **Privacy & Terms pages**: Verify `/privacy` and `/terms` load properly with correct contents.
- [ ] **Robots.txt**: Accessing `/robots.txt` output displays correct bot directives.
- [ ] **LLMs.txt**: Accessing `/llms.txt` displays descriptive structured prompt text.
- [ ] **AI.txt**: Accessing `/ai.txt` displays correct machine crawler definitions.
- [ ] **Sitemap**: Accessing `/sitemap.xml` returns a valid XML schema listing all pages.
- [ ] **Open Graph Image**: Widescreen `/og-image.png` (1200x630px) exists at the root and renders in social previews.
- [ ] **Favicons**: Custom favicon, apple-touch-icon, and manifest settings render correctly in browser tab.

### 5. Launchpad

- [ ] All 14 track routes return 200; unknown tracks return 404. Confirm one H1, canonical, complete role sections and visible unpaid terms.
- [ ] Compare 12 weeks, 8–12 hours/week, 14 tracks and capacity ceiling 42 across pages. Do not imply all places are available.
- [ ] Test role preselection, all three application steps, back/edit retention, optional links, age confirmation, role-question changes and required acknowledgements.
- [ ] Closed preview validates without transmission; direct API calls return 503 and no-store.
- [ ] Enabled intake passes controlled persistence/notification/duplicate-retry tests only after explicit approval. Never use real applicant data for QA.
- [ ] Verify Turnstile route return, expiry, reset, blocked script and action/hostname mismatch.
- [ ] Confirm application noindex/excluded from sitemap and no JobPosting claim for the planned unpaid cohort.
- [ ] Obtain program/legal/privacy approval and confirm mentor capacity before activation.

Current local evidence and unresolved gates are in `docs/V2_LAUNCHPAD_REPORT.md`; this reusable checklist is not itself a signoff.

---

## 🛠️ Automated QA Verification Pipeline

Run the following commands inside the workspace:

1. **Type Checking:**
   ```bash
   npx tsc --noEmit
   ```
   *Expected Output:* Exit code 0 (no type errors).

2. **Code Linting:**
   ```bash
   npm run lint
   ```
   *Expected Output:* `No ESLint warnings or errors`.

3. **Production Build:**
   ```bash
   npm run build
   ```
   *Expected Output:* Success compilation and page chunk optimization summary.
