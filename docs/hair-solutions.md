# Hair solutions section

Placed after the “Beautiful hair. Entirely you.” editorial banner and before the two explainer films. The new opaque section also covers the outgoing pinned editorial banner.

## Interaction and references

- Desktop reference: `Recording/leading solution desktop reference.mp4` (12.1 seconds). A large left-hand numbered arc, centered text/product composition, vertical crossfades and a held viewport.
- Mobile reference: `Recording/leading solution mobile reference.mp4` (11.93 seconds). The arc sits above centered text with the visual below. Scrolling rotates the active number and changes the content/visual together.
- Three accessible numbered tabs support click/tap, arrow keys, Home and End. Desktop scrolling drives a scrubbed GSAP timeline. Mobile scrolling selects one topic at a time and completes a short sequential exit/entrance animation, preventing overlapping copy and imagery. Neither version intercepts the wheel or touch gestures.
- Reverse scrolling selects earlier topics. Clicking a number scrolls to that topic's section of the pinned journey, keeping tabs and scroll position in sync.
- Reduced-motion and viewports shorter than 600px use unpinned, immediate-change tabs. Without JavaScript, all three stories remain readable in normal document flow.
- Primary colour: `#232928`; white background; a restrained `#59B1A5` indicator. Existing typography and semantic tokens are reused.

## Content and assets

Copy uses the existing catalogue (`catalogue-products.js`) and consultation/FAQ information. It distinguishes parting/crown coverage, added length/fullness, and full-head coverage. No medical outcomes or unsupported construction/quality guarantees were added. CTAs open the matching existing catalogue category; extensions combines clip-in and salon-fitted categories.

Images were generated with the built-in image generation tool, not the CLI. They are photorealistic editorial illustrations, not actual inventory photos. The user's follow-up removed the visible illustrative-imagery note; the image alt text still identifies each photograph as illustrative. Six optimized responsive assets are saved under `public/assets/solutions/`:

- `toppers-480.webp`, `toppers-960.webp`
- `extensions-480.webp`, `extensions-960.webp`
- `wigs-480.webp`, `wigs-960.webp`

Originals remain in `C:/Users/ADMIN/.codex/generated_images/01a0d272-5b33-7fe0-9854-667af5abca83/`. `scripts/prepare-solutions-assets.mjs` records the exact source filenames; deployment needs only the workspace WebP files.

## Final prompt set

### toppers

Use case: product-mockup. Asset type: premium hair solutions website editorial product photograph, portrait 4:5 composition. Create a photorealistic close-up of a small scalp-like hair topper, NOT a full wig. It has rich natural dark brown nearly black straight human hair with a precise central parting showing a realistic narrow warm beige scalp-like silk base. Two natural medium-brown female hands gently support the topper from below at its sides, lower in frame, showing the parting clearly. The topper hair falls softly to the lower part of the image. Seamless off-white studio background, very subtle cool grey-green tint, soft daylight from upper left, realistic fine individual strands and subtle flyaways, restrained highlights, no plastic shine. Premium understated salon product photography, 85mm lens. Center the complete topper in frame with generous clean space around the top and sides so it can be cropped square or portrait. No face, no lettering, no logo, no watermark, no decorative objects, no comparison, no collage.

### extensions

Use case: product-mockup. Asset type: premium hair solutions website editorial product photograph, portrait 4:5 composition. Create a photorealistic studio still life of three rich natural dark brown nearly black clip-in hair extension wefts laid in a softly flowing arrangement on a seamless off-white surface, subtly cool grey-green. The slim fabric bands with a few small dark snap clips are visibly arranged at the upper third, with long dense strands falling down the center of the image into gentle S-shaped waves and softly tapered natural ends. These are real-looking removable hair extension wefts, not a wig, not a whole head of hair. Soft daylight from upper left, delicate contact shadows, realistic individual strands and subtle flyaways, understated lustre, no plastic shine. Premium minimalist salon product photography shot from above, harmonious restrained composition, generous empty margin around the products for square or portrait crop. No face, no hands, no lettering, no logo, no watermark, no decorative objects, no comparison, no collage.

### wigs

Use case: product-mockup. Asset type: premium hair solutions website editorial product photograph, portrait 4:5 composition. Create a photorealistic premium full-head hair wig on a simple matte ivory faceless salon display head and short neck bust. The wig is natural dark brown nearly black, shoulder-length with soft loose salon waves and a natural-looking slightly off-center parting. The display is turned in a gentle three-quarter view, showing full crown coverage, hairline and the wave structure. All hair and the bust fit fully inside the frame with generous margin for square or portrait cropping. Seamless off-white studio backdrop, a very subtle cool grey-green tint, soft daylight from upper left, delicate shadows, realistic individual hair strands and subtle flyaways, understated healthy lustre, no plastic shine. Sophisticated minimalist high-end salon product photography, 85mm lens. No real person, no eyes or facial features on the display head, no lettering, no logo, no watermark, no props, no comparison, no collage.

## Verification

Run `node scripts/check-solutions.mjs` against the Vite development server, and `npm.cmd run build` for production output. The check covers viewport sizes, all three scroll states, reverse navigation, click/tap, keyboard controls, hidden-panel inertness, image loading, layout overflow, category links, reduced motion and the no-JavaScript fallback. Screenshots go to the ignored `preview/solutions-check/` directory.

Verified: build and section checks pass at 1440×900, 1024×768, 390×844, 360×740, 320×640 and 320×568, plus reduced motion at 390×844. Additional native-touch, pin-release and portrait/landscape resize checks pass.

The broader `check:homepage` suite stops at its existing mobile collection-heading assertion: it waits only one second after starting the cloud navigation and assumes the animation is desktop-only. A browser-route comparison with this section and its initializer removed reproduces that assertion; the collection heading is correctly within the viewport once navigation settles. That unrelated test was left unchanged.
