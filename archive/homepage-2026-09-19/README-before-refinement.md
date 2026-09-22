# Alchemane

Complete responsive homepage built from the supplied references. Vite, Tailwind CSS, and GSAP ScrollTrigger.

## Local preview

```powershell
npm.cmd install --cache .npm-cache
npm.cmd run dev -- --port 5173
```

Open http://localhost:5173. Scroll down to raise the clouds, pass through white, and reveal the collection. Scroll up or select **Back to the hero** to reverse. **Shop the collection** runs the same transition. Collection portraits open accessible preview dialogs; checkout and product catalog integration are outside this page's scope.

## Files

- `index.html`: semantic header, collection, and dialog markup.
- `src/styles.css`: responsive layout, typography, cloud layers, and hover effects.
- `src/main.js`: scroll timeline, navigation, reduced-motion handling, and dialogs.
- `src/homepage.html`: the sections after the collection and the footer, included as static HTML by Vite in development and production.
- `src/homepage.css`: base layouts and component styling for the later sections.
- `src/premium.css`: the current white editorial direction, responsive composition, and image treatments.
- `src/homepage.js`: accessible tabs, product filters, before/after comparison, video, story controls, guide, and consultation message preparation.
- `public/assets`: extracted, optimized photographic assets; original references are preserved.
- `scripts/prepare-assets.mjs`: reproducible extraction from the supplied PNGs.
- `scripts/prepare-editorial-assets.mjs`: optimized WebP output from the temporary editorial image originals.

The reference photography includes the large decorative hero wordmark. Header navigation, calls to action, collection headings, and category controls are HTML.

## Transition

Three copies of the supplied transparent cloud asset move at different speeds on a pinned stage. A white overlay becomes fully opaque before the scenes swap, holds briefly, and dissolves as the collection appears. The animation follows native scrolling in both directions, using a 0.85-second scrub and 2.35 viewports of scroll distance. Tune these in `src/main.js`.

Reduced-motion preferences and viewports shorter than 680px use ordinary document flow so all content stays reachable. No WebGL renderer or continuous animation loop is needed.

## Validation

```powershell
npm.cmd run build
npm.cmd run check:preview
npm.cmd run check:homepage
```

The preview check requires the dev server on port 5173 and locally installed Google Chrome. It verifies cloud rise, full-white coverage, forward/reverse navigation, mobile fit, product dialogs, reduced motion, and short viewports. Screenshots and results are written to `preview/qa`.

Animation API reference: [GSAP ScrollTrigger documentation](https://gsap.com/docs/v3/Plugins/ScrollTrigger/).

## Remaining homepage sections

The page continues after the original pinned collection with a quality ribbon, hair-goal tabs, a filterable product edit, a before/after slider and original demonstration film, craftsmanship accordions, the founder story, a four-story carousel, the Khar West studio, an immediately readable buying guide, FAQs, consultation, and footer.

The consultation form validates details and prepares an encoded WhatsApp message to the number confirmed in the supplied audit. A visitor explicitly opens WhatsApp and presses send. The site does not submit leads to a server or claim a booking is confirmed. Changing any form value clears the prepared message so stale details cannot be sent.

The supplied homepage PDF is the source for product photographs, founder portrait, transformation photograph, and the four existing quotes. The founder numbers (15+ years and 6,330+ clients), address, and contact details follow the decisions recorded in `Alchemane Website Audit and Plan.html`. These are existing brand claims carried into this design for review, not independently verified claims. The transformation archive image is illustrative alongside the carousel and is not an identity match for each reviewer. No new celebrity endorsement, press claim, price, or stock count has been invented.

The five-part on-page guide is new draft copy. The decorative book is a CSS object, not a promised downloadable PDF. Product cards open category details; checkout remains outside this homepage implementation.

`scripts/prepare-home-assets.mjs` prepares optimized photographs from the PDF image extraction in `preview/pdf-assets` and the supplied footage. To reproduce extraction, use `pdfimages -j "Figma design/Homepage-desktop v2.pdf" "preview/pdf-assets/home"` first. Original images and the user's updated hero master are preserved.

Homepage checks cover keyboard tab navigation, filtered products, dialogs, slider state, video playback and pause-on-dismiss, review navigation, guide controls, exclusive FAQ expansion, form handoff, responsive overflow, and reduced motion. Screenshots and results are saved to `preview/homepage-qa`.

## Toppers, extensions and the full range (added 18 Sep 2026)

Three sections sit between the edit and the craftsmanship section; the section eyebrows now run 01–13.

- **03 Toppers, explained** (`#toppers-film`): the brand film "Human Hair Toppers For Women" (YouTube `9F83RHz2tjE`, 6:24). Its eleven chapters use the uploader's own chapter times; the one-line summaries are written from the film's transcript.
- **05 Extensions, explained** (`#extensions-film`): Vinitt Dessai's "Which Permanent Hair Extensions are right for you?" (YouTube `pjts71_5kWQ`, 4:38). Chapter times come from a local transcription of the film. The bar chart shows the months until refitting that the film states.
- **06 The full range** (`#range`): every topper (4) and extension (16) with photograph, base or method, lengths, starting price and shades. Toppers show their base area drawn to scale; extensions filter by the old site's own groups (salon-fitted, clip-in, volumisers, fringes). Each card links to the product on alchemane.com.

How it fits together:

- `src/sections/range-data.js` is the single source for product names, prices, lengths and shades (taken from `alchemane.com/products.json`). `vite.config.js` renders the cards into `src/homepage.html` at build time, so the grid is static HTML. Change `STORE_URL` there when product pages move to the new site. Restart the dev server after editing this file.
- `src/sections/range.js` handles tabs, filters, the hover photograph and deep links. Any link with `data-range-open="toppers|extensions"` (plus optional `data-range-filter` and `data-range-handle`) opens the range; the header's Hair Extensions and Hair Toppers links and the collection dialog's button now use it.
- `src/sections/films.js` loads nothing from YouTube until someone presses play or picks a chapter. It embeds from `youtube-nocookie.com`, seeks with the embed's postMessage commands and marks the playing chapter.
- `src/sections/showcase.css` styles all three sections from the page's existing tokens.
- `npm run assets:range` rebuilds `public/assets/range` (cards) and `public/assets/films` (posters) from `Images/range-source`, downloading any missing source photo from the Shopify feed.

QA: both check scripts accept `BASE_URL` (default port 5173). `check:homepage` now also covers the range tabs, filters and keyboard use, product links, the collection-to-range link, header links, on-demand films and chapter seeking, and the mobile chapter list. YouTube is stubbed during checks so they run offline.

## Editorial direction and temporary photography

The current post-hero direction pairs the existing cloud transition with a bright editorial overture, oversized serif typography, generous white space, asymmetric product layouts, tactile hair details, and restrained scroll reveals. The inspiration board is at `http://localhost:5173/references/`, with source notes in `docs/reference-direction-v2.md`.

Three high-resolution AI-generated photographs are **design placeholders**, saved as originals in `Images/generated-temporary` and optimized to `public/assets/editorial`. The studio visual is labeled as concept imagery on the page; it does not represent the actual Khar West space. Product photographs, the transformation photo, and the founder source remain from the supplied materials. Replace the generated images with approved brand photography of similar composition and rebuild with `npm.cmd run assets:editorial`; the page references the WebP filenames, so no HTML or CSS change is needed. The files and target compositions are:

- `campaign-portrait.png` → 3:2 South Asian woman in white, flowing hair on the right with clear space for copy on the left.
- `hair-detail.png` → vertical close-up of dark hair and hand against a light background.
- `consultation-studio.png` → wide bright consultation scene; replace with a verified photograph of the real studio before launch.

All three were generated for this design preview with prompts specifying realistic hair texture, an ivory/white editorial palette, and no logos or text. They are not product evidence or customer testimonials.
