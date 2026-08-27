# Zqtion Website QA Checklist

This checklist is used for manual and automated verification of the Zqtion website features, design aesthetics, SEO status, and responsiveness before sending to cold leads.

## 🚀 Manual Browser QA Checklist

Perform these checks in a real browser (Desktop & Mobile viewports) before final deployment:

### 1. Homepage & Layout Checks
- [ ] **Homepage Loads Correctly**: Page loads fast with no errors in console and no generic square-Z flash before WebGL is ready.
- [ ] **3D Journey**: The modular Z, planet shell, orbits, and light sweep remain smooth from the hero through the operating-model section.
- [ ] **Responsive 3D**: Capable mobile and tablet devices receive the same continuous journey; the scene is centered, not clipped by the section divider, and does not block touch scrolling.
- [ ] **Fallbacks**: Reduced-motion, data-saver, slow-network, very-low-power, and WebGL-failure paths show the modular static Z and planetary orbits.
- [ ] **Mobile Menu**: Mobile navbar hamburger opens/closes the menu overlay correctly.
- [ ] **No Horizontal Overflow**: No horizontal scroll bars or content clipping on mobile viewports.
- [ ] **Responsive Viewports**: Verify at 360x800, 390x844, 640x900, 1024x768, and 1440x900.

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
- [ ] **Footer Links**: Verify all footer links work with no broken `#` or placeholder links:
  - [x] Work (`/work`)
  - [x] Services (`/services`)
  - [x] Pricing (`/pricing`)
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
