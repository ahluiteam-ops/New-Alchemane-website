# Craftsmanship section archive — 21 September 2026

The “The details make the difference” section was removed from the live homepage at the user's request. It used the supplied construction demonstration image at `/assets/construction.webp`; no asset was deleted.

## Restore

1. Copy `section.html` into `src/homepage.html` before the founder section (`#our-story`).
2. Append `craftsmanship.css` after the live homepage CSS, or move its rules back into `src/homepage.css` and `src/premium.css`.
3. The existing `initHomepage()` binding already refreshes GSAP when shared accordion details are expanded. No JavaScript restoration is required.
4. Run `npm.cmd run build` and `npm.cmd run check:discovery` with the local server running.

The archived styles depend on the live design tokens and the shared `.ruled-accordions` rules. Keep those current rules if restoring the section.
