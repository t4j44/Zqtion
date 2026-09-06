# Performance policy

## Budgets

- Mobile Lighthouse targets: Performance 90+, Accessibility 95+, Best Practices 95+, SEO 95+
- Desktop target: 95+ where the test environment is stable
- LCP at or below 2.5 seconds, ideal at or below 2.0 seconds
- INP below 200 ms
- CLS below 0.05
- Zero horizontal overflow at supported widths

Lab numbers are not field data. Record the device, viewport, build mode, cache state, and date whenever publishing measurements.

## Rules

- Native scrolling on coarse-pointer and compact devices; Lenis is desktop-only with 0.6 smoothing.
- CSS/DOM hero is the first-paint experience; Three.js is an optional dynamic enhancement.
- Desktop uses shared standard metallic materials; costly clearcoat/iridescence is omitted. Existing local fonts preload through `next/font/local`.
- Mobile does not create a hero WebGL context.
- WebGL and hero CSS animation pause offscreen and in hidden tabs; partial WebGL setup failures dispose their renderer.
- YouTube iframes load only after explicit Play.
- `next/image` optimizes allowed YouTube thumbnails; below-fold selected-work images are lazy-loaded, not priority.
- Add no visual dependency when CSS, React, Framer Motion, browser APIs, or the current Three.js package can do the job.
- Test ordinary mobile behavior before accepting a visual upgrade.

## Verification

Run `npm run typecheck`, `npm run lint`, and `npm run build`, then test the production server at 320, 360, 375, 390, 412, 430, 768, 1024, 1280, 1440, and 1920 pixels. Check console errors, overflow, menu keyboard behavior, delayed JavaScript, reduced motion, Save Data, WebGL failure, thumbnails, and form failures.

The dated measurements in `docs/V2_LAUNCHPAD_REPORT.md` are evidence, not certification. The 90+ mobile and 95+ desktop targets must not be described as achieved until reproducible results support them.

## Hero delivery — 2026-09-06

### What shipped locally

- A responsive AVIF/WebP poster is the first paint on every device. Ordinary phones and coarse pointers do not mount a canvas or request the Three.js scene.
- Capable desktops progressively replace the same poster composition with WebGL. Resizing back to mobile disposes the renderer and context.
- The restored art direction uses deep graphite panels, near-black recesses, selected white studio reflections, and a limited rear-right cyan rim. CSS provides the equivalent pointer/touch reflection over the mobile poster.
- Pointer work is requestAnimationFrame-throttled, touch keeps native vertical scrolling, the tap spotlight returns to idle after 400 ms, and motion pauses offscreen or in a hidden tab.
- Reduced-motion, Save Data, slow-network, and failed-WebGL paths remain static.

### Asset and bundle evidence

- Mobile poster: `public/hero/z-poster-512.avif`, 21,689 bytes.
- Desktop poster: `public/hero/z-poster-768.avif`, 34,963 bytes; 1280 px fallback, 58,470 bytes.
- The poster master is a real alpha-transparent PNG. The rejected bright-blue treatment is not used by the site.
- `@next/bundle-analyzer` is a development dependency and runs only through `npm run analyze`; it is not enabled in production builds.
- Analyzer snapshot: Three.js chunk 87,092 bytes gzip; `HeroWebGLScene` chunk 3,506 bytes gzip. Neither is requested in the verified mobile path.

### Before and after

Mobile Lighthouse was run against a clean local production build at `http://localhost:3250` using Lighthouse's default simulated mobile profile.

| Metric | Recorded baseline | Final clean run |
| --- | ---: | ---: |
| Performance | 82 | 90 |
| LCP | 3.5 s | 3.369 s |
| TBT | 320 ms | 138 ms |
| CLS | 0 | 0.0001 |
| Accessibility | 100 | 100 |
| Best Practices | 100 | 100 |
| SEO | 100 | 100 |

The performance, TBT, CLS, accessibility, best-practices, and SEO gates pass in the final clean run. The LCP target does not: 3.369 seconds remains above the 2.5-second budget. The poster transfer is only 24,479 bytes in that run; the remaining modeled delay is dominated by initial framework/script execution rather than the hero image. Treat the LCP gate as open until a stable hosted preview produces a three-run median at or below 2.5 seconds.

### Functional verification

- Passed at 320, 360, 375, 390, 400, 412, 430, 768, 1024, 1280, 1440, and 1920 px with zero horizontal overflow.
- At 390 px the poster is 319.8 px wide and the headline begins immediately below it without overlap.
- Passed desktop-to-mobile and mobile-to-desktop live transitions, offscreen pause, reduced-motion, Save Data, and WebGL-failure checks.
- `npm test`: 25/25 passed. `npm run typecheck`, `npm run lint`, and `npm run build`: passed. Production dependency audit: 0 vulnerabilities.
