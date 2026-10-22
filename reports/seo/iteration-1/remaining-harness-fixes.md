# Final QA harness corrections

The first combined final-build article run passed 224 layouts and four axe scans, then timed out because an exact accessible-name selector omitted the existing homepage CTA subtitle. The corrected selector retains the visible title and subtitle; all 13 remaining journeys subsequently passed on the same build.

The separate Community-disabled build succeeded. Its legacy smoke test then looked for a Play button, but the existing portfolio uses the accessible name Watch video:. The selector was updated to the current component, preserving the activation, iframe, CSP and fallback assertions. A retry reuses the identical source-hashed disabled snapshot.

Initial article desktop fold captures retained scroll from the element screenshot. The capture now explicitly resets scroll to the top. No product source changed for these harness corrections.
