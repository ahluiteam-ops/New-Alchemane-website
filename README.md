# Alchemane homepage

Responsive homepage built with Vite, Tailwind CSS and GSAP. The original cloud hero resolves into the “Beautiful hair. New possibilities.” collection section with six product categories, followed by a catalogue of 42 products. The existing Source Serif 4 / Source Sans 3 typography and ink-led neutral palette are retained.

## Local preview

```powershell
npm.cmd install --cache .npm-cache
npm.cmd run dev -- --port 5173
```

Open http://127.0.0.1:5173/.

## Current structure

Cloud hero → collection title and six product categories → filterable catalogue → contained editorial campaign → selected products → two portrait film panels → founder → client stories → Mumbai studio → FAQs → consultation and footer.

The pre-catalogue source is backed up in `archive/product-discovery-2026-09-21`. The cloud opening has since been restored, and its former five-item collection grid has been replaced by the category discovery layout. The discovery section links to all 42 products. See [product discovery decisions](docs/product-discovery.md) for source verification, taxonomy and validation.

The four-item quality ribbon and the hair-goals, before/after and guide sections have been removed. Their markup, source snapshots and restoration instructions live in [the homepage archive](archive/homepage-2026-09-19/README.md). The craftsmanship section is separately retained in [its archive](archive/craftsmanship-2026-09-21/README.md). Original media has been preserved.

## Design system and source files

- [Design system](docs/design-system.md): typography, palette, spacing, components, motion and responsive rules.
- `src/design-tokens.css`: shared primitive and semantic tokens, local font declarations.
- `src/premium.css`: current art direction.
- `index.html`, `src/styles.css`, `src/main.js`: cloud hero, scroll reveal, opening collection and product dialogs.
- `src/sections/catalogue-products.js`: all 21 verified live products and 21 supplied additions; edit image paths here when approved photography arrives.
- `src/sections/catalogue-data.js`, `catalogue.js`, `discovery.css`: static catalogue markup, search/filter behaviour and responsive layout.
- `src/homepage.html`, `src/homepage.css`, `src/homepage.js`: later sections and their interactions.
- `src/sections/range-data.js`: legacy product metadata retained for asset preparation and the archived range.
- `src/sections/reel-data.js`: film metadata, posters and approved video/caption URLs.
- `src/sections/films.js`: native video playback coordination and offscreen pause.
- `public/fonts`: open-source font files and SIL Open Font Licenses.

## Finished reels

Both new films are still in production. Until supplied, the panels show still images with “Film coming soon”; there are no inactive play buttons or unrelated substitute videos.

Place the approved portrait MP4s and corresponding English WebVTT captions in `public/assets/films`. Set `src` and `captions` for each entry in `src/sections/reel-data.js`, then restart Vite. Each panel becomes a 9:16 native player. Playback starts on request, pauses the other film, and pauses offscreen or when the browser tab is hidden.

## Validation

```powershell
npm.cmd run build
npm.cmd run check:discovery
npm.cmd run check:reels
```

Browser checks use locally installed Chrome and the running dev server. `BASE_URL` can override the default. Discovery checks verify all 42 products, source names and prices, category filters, shared category membership, new-product placeholders and enquiries, sorting, pagination, reload/back navigation, dialogs, FAQs, consultation, local anchors, portrait and landscape layouts, and reduced motion. The reels check tests the future ready state with existing local footage only in an isolated test route; production configuration stays pending. The older `check:preview` and `check:homepage` commands now run the current discovery suite.

Current screenshots and report: `preview/discovery-qa`. Older reports remain in `preview/qa` and `preview/homepage-qa` for historical comparison.

## Content and launch notes

The consultation prepares a WhatsApp message; the visitor reviews and sends it. Existing product links open the alchemane.com shop. New additions open a product-specific WhatsApp enquiry; they have no invented price, stock status, fitting specification or checkout URL. No message is sent automatically.

Product photos, founder portrait, quotes and brand claims are carried over from supplied materials. The campaign portrait remains an existing design placeholder awaiting approved photography. The studio concept photograph has been restored at the user's request, retaining its concept-image label and the current layout. The construction demonstration photograph remains stored in `public/assets` for the archived craftsmanship section.

The five named transformation files in `Images/beforerafter` now accompany the matching client slides. Run `node scripts/prepare-story-assets.mjs` to regenerate their WebP versions without cropping. Meera's fifth slide is a photograph feature, since no quote or product details were supplied for her. Meera and Ritika's single portraits are not labelled as before/after pairs.

Prior research, asset provenance and the previous layout documentation are retained in `docs` and `archive/homepage-2026-09-19/README-before-refinement.md`.
