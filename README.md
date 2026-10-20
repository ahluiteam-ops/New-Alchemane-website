# Alchemane website

Mobile-first homepage and hair guides, built with Vite, Tailwind CSS and the existing Source Serif 4 / Source Sans 3 design system.

## Preview

```powershell
npm.cmd run dev -- --port 5173
```

Open http://127.0.0.1:5173/.

## Current homepage

Hero → solution tabs and matching products → client videos → before/after stories → quality → founder → Featured In → Celebrity Choice → studio → hair-transformation preview → questions → consultation.

The category grid and catalogue are combined. Six tabs run in one horizontal row: Hairline Series, Hair Toppers, Permanent Extensions, Clip Extensions, Wigs and Fringes. Hairline Series is selected by default. Products follow the tabs directly, in their existing category order. All 42 products remain accessible, with up to four shown at a time. Help and guidance buttons lead to the consultation form. The form prepares a WhatsApp message for the visitor to review and send.

The original full-screen hero and layered clouds are restored. On phones, clouds rise with manual scrolling in normal page flow; the hero button reaches the products in about 0.65 seconds. Larger desktop screens retain the pinned reveal. The first-order popup, quality photo section and floating WhatsApp/call buttons are restored. Celebrity Choice and the close-up before-and-after film preview are back with honest coming-soon states until approved footage is supplied. The later parallax campaign and numbered arc remain archived; see [archive notes](archive/mobile-homepage-2026-09-26/README.md).

Full explainers live on `/toppers.html` and `/extensions.html`. Their approved MP4 and caption URLs are still pending in `src/sections/reel-data.js`. The homepage keeps the supplied, playable client videos. No video autoplays.

The topper product grid is followed by three supplied consultation reels and an
optional ₹299 online or Khar West studio consultation. The meeting selector is
synced with the on-page booking form at `#book`. The following consultation
promise repeats the approved full fee-back guarantee and limit of 30 new
consultations per week. The separate `/topper-consultation.html` page remains
available. Customers can select online or Khar West studio,
enter their contact details and an optional preferred date, then open their
WhatsApp draft to review and send. The team confirms time and payment details; this
page does not reserve live slots or collect payments. On mobile, the photograph,
title and fee appear together in the first screen, followed by a short form.
The page uses the same footer as the topper page. Run
`npm.cmd run check:topper-consultation` to check the booking flow.
Run `npm.cmd run check:topper-consultation-sections` for the on-page reels,
meeting choice and booking. Rebuild their posters from the supplied clips with
`node scripts/prepare-topper-consultation.mjs`.

All consultation form submit buttons display the approved ₹299 fee inside the
CTA, with a WhatsApp confirmation note underneath. This applies to the homepage,
permanent extensions, wigs, toppers and the dedicated topper booking page.

## Source

- `index.html`, `src/main.js`, `src/mobile-homepage.css`: homepage opening, navigation and responsive refinements.
- `src/sections/solutions-data.js`, `solutions.js`, `solutions.css`: six category tabs and their responsive layout.
- `src/sections/catalogue-data.js`, `catalogue.js`, `catalogue-products.js`: verified product content, category switching and Show more pagination.
- `src/homepage.html`, `src/homepage.js`: later sections and consultation form.
- `src/sections/testimonials-data.js`, `testimonials.js`: supplied client video rail.
- `src/sections/reel-data.js`, `films.js`: detail-page explainer configuration and playback.
- `src/design-tokens.css`: shared fonts, colors and spacing.

## Checks

Run the preview server, then:

```powershell
npm.cmd run build
npm.cmd run check:homepage
npm.cmd run check:reels
npm.cmd run check:wigs
```

`BASE_URL` overrides the local URL. The current homepage checks cover mobile through desktop, keyboard controls, catalogue state, consultation and video playback. Results and screenshots: `preview/mobile-homepage-qa`. Older discovery/solutions/quality scripts target archived layouts and are retained as historical checks.

See [mobile homepage decisions](docs/mobile-homepage.md) and [design foundations](docs/design-system.md).

## Content still needed

Approved full explainer videos and captions; the close-up before-and-after client collage film; approved Celebrity Choice footage; photography and commercial details for new product entries. Existing blank product-photo areas remain honest placeholders. The close-up thumbnail is labelled as illustrative, and the studio image retains its concept-image label. Existing product names, prices, quotes and client claims are preserved from the supplied material.
