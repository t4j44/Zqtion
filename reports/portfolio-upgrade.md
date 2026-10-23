# Zqtion portfolio upgrade

Release candidate on `feature/zqtion-community`, based on `db34e39f2ea18ea296ac072557721731f9d8d70d`. No main merge or production deployment.

## Portfolio content

Four new routes:

- `/work/g-force-tyres-mobile`: delivered website, with the owner's attribution explicitly distinguished from independent commissioning evidence. Genuine desktop, phone and booking-guidance captures. Visit website CTA.
- `/work/gruffet`: Zqtion open-source product. Authentic repository mark, MIT notice, GitHub and documentation destinations, early-v0.1 limitations and introduction link.
- `/work/gruffet-product-explainer`: the owner's 56-second product film, published on BuildwithTajuddin. Promotional illustration is distinguished from independently validated live output.
- `/work/bold-kinetic-type-showreel`: separate 31-second typography study, retaining the original video destination.

Exact publication titles, dates, repository revision, source relationships and scope limits are in [portfolio-project-provenance.md](portfolio-project-provenance.md). The supplied brief establishes permission relied upon for this showcase; public publication alone is not a complete third-party-rights audit.

The original seven case-study URLs, videos and independent/competition disclosures remain. `/work` now has three anchor-linked sections: websites/open-source products, motion design/commercials and AI films/experiments. The first section pairs the two digital projects, avoiding half-empty singleton rows. The underlying four-discipline content taxonomy remains intact. The homepage order is **G Force Tyres → Gruffet → Type in motion → SPARK**.

Two legacy descriptions were corrected against official video publication metadata: the former sports card is MOJO VFX 4, and the former beverage card is the published chicken-tikka photo-to-reel study. Their existing URLs and independent-work status remain. The corrected product studies now sit with motion work, and unsupported brand/production narratives were removed.

## Cards and browsing

Artwork is unobscured. Relationship, title, discipline and one View project affordance sit in a separate theme-aware caption. Case-study cards no longer imply that they directly play video. Actual case-study players retain their intentional playback control and gain a visible Watch video label. Final screenshot review also moved the YouTube source link to the upper corner, clear of the fixed contact control; collision checks cover phone and desktop positions. Starting another portfolio video removes the earlier player, so a collection cannot leave several clips playing simultaneously.

Landscape video stills use a predictable 16:9 media area. The genuine website capture is deliberately framed so its important content is not destructively cropped; the Gruffet media treatment uses its authentic mark and product name rather than a fabricated interface. Local responsive images replace remote thumbnail lookups on the cards. Source originals, encoded sizes and hashes are recorded in `portfolio-audit/media-manifest.json`.

The old desktop pinned reel measured **2,431px** high in a 900px viewport, requiring **1,531px** of vertical travel to move through the row. The replacement is a native horizontal scroll region on every device, with snapping, touch swipe, keyboard arrows, 44px previous/next controls and progress. It does not intercept vertical scrolling. Server-rendered cards are passed as children to a small interaction component; complete case-study records are no longer serialized into the carousel's client props.

## Visual review

Before: 32 route/theme/viewport samples across the homepage reel and work page. First candidate: 112 portfolio samples, retained under `portfolio-audit/iteration-1/`. Visual inspection caught the floating WhatsApp control overlapping the new carousel controls. A spacing correction and an automated collision assertion resolved it. The final 112-case portfolio matrix includes both themes and 320, 360, 390, 430, 768, 1024, 1440 and 1920px widths, including every new case study and a legacy film.

The final selected-work captures in both themes at 390/1440px, plus representative full portfolio captures and project-media captures, were visually reviewed. The [screenshot index](portfolio-screenshot-index.md) lists all saved artifacts. A further 32 samples cover the two corrected legacy routes; 24 final phone/desktop project-media captures cover both themes after the control refinements. Broader regression results and acceptance boundaries are in [production-readiness-update.md](production-readiness-update.md).

## Preservation and implementation notes

Approved light/dark defaults, persistent visitor choice, Instrument fonts, navigation, original modular Z imagery, content truth, contact workflows and application availability are preserved. Heavy hero media now begins on artwork intent; see the measured performance report for that deliberate behaviour change and its limits.

No API implementation, hosted database, RLS policy, auth configuration, Resend credential, DNS or Vercel Production configuration was changed. TypeScript now excludes the ignored `artifacts/` directory: an old generated snapshot was otherwise being compiled against today's data model. No historical snapshot was edited to hide that error.
