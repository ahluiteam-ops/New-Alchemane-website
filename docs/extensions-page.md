# Hair Extensions page — design phase 1

Written for: whoever picks this page up next (Astra, or a developer joining the build).

The page lives at `/extensions.html`. Source: `src/sections/extensions-data.js` (content),
`src/pages/extensions.css` (layout), `src/pages/extensions.js` (behaviour).

## What this page is for

Someone who knows they want longer hair but does not know how extensions
actually work. The page has to answer three questions before it asks for a
booking:

1. **What are my options?** → the four methods
2. **Which one fits my life?** → the clip-in vs fitted comparison
3. **What am I signing up for?** → fitting time, wear time, refits, cost

Only then does it ask for the consultation. The old approach — lead with a
price grid — asks for a decision before the reader has the information to make
one.

## Where the content came from

| Source | What it gave us |
|---|---|
| `Figma design/Permanent Extensions page-desktop v2.pdf` | Section order, the comparison table, the fitting/aftercare figures, the seven questions |
| `src/sections/catalogue-products.js` | All 15 products — names, prices, lengths, photography, store links |

Product data is imported, never retyped. If a price changes in the catalogue it
changes here, and the two can't drift apart.

## Visual direction

The Figma export is teal with a bold grotesque. The live site is the white
atelier system — Source Serif 4 display, Source Sans 3 body, forest `#304638`
action, fog `#f3f5f1` surfaces. **This page follows the live site, not the
Figma.** The Figma is the client's content brief; the site's design system is
the approved skin. Mixing them would give Alchemane two visual identities.

Everything reuses existing tokens and components: `.section-wrap`,
`.solid-button`, `.text-link`, `.eyebrow`, `.ruled-accordions`, and the whole
`.catalogue-*` card from `sections/discovery.css`. The `.ext-*` classes are
layout only.

## Motion

Deliberately quiet, per the brief's "3D in the homepage hero, micro-interactions
everywhere else":

- Section reveals: 16px rise, 550ms, `power2.out`, fires once
- Method tabs: 300ms crossfade only. Panels differ in height, so sliding them
  would shove the rest of the page around on every tab press.
- Filter: 350ms fade with 25ms stagger

No pinning, no scrubbing. All of it sits behind `prefers-reduced-motion`, and
nothing starts at opacity 0 in the HTML — with JavaScript off the page is
complete and readable.

## Accessibility notes

- Tabs are a real tablist: roving `tabindex`, arrow/Home/End keys, `aria-selected`,
  `aria-controls`.
- Filter buttons carry `aria-pressed`; the result count is announced through a
  visually hidden `role="status"`.
- The comparison table uses `<th scope>` on both axes. On phones it collapses to
  stacked statements, with each value labelled from `data-column`.
- `--shop-header-height` is measured on load and on resize, so in-page anchors
  clear the sticky header instead of landing under it.

## Copy that still needs sign-off

Marked `DRAFT` in `extensions-data.js`. Written only from figures stated in the
client's own Figma — nothing invented — but nobody has approved the wording:

- The four method descriptions
- Six of the seven FAQ answers (the first arrived with an answer in the Figma)

The comparison table and the aftercare figures are the Figma's own words and
numbers, lightly re-punctuated.

## Deferred to phase 2

Cut for one reason only: the assets don't exist yet.

| Section | Blocked on |
|---|---|
| "Real hair, real results" reel wall | The 9:16 edits (`reel-data.js` is still empty — client is editing them) |
| Before/after transformations | Approved pairings of story photos to extension methods |
| "Meet your extension expert" | The expert profile video |
| "See the blend for yourself" | The blend film |
| Buying-guide lead magnet | The PDF, and somewhere to capture the email |

Two open decisions for the client:

1. **Navigation.** The header's "Hair extensions" link still filters the
   homepage catalogue. Should it point here instead? Right now this page is
   reached from the footer's "The extensions guide" and from its own header.
2. **Toppers and Wigs.** If this page's shape works, those two want the same
   treatment, and the homepage catalogue becomes the shop rather than the
   discovery route.

## Checks

`preview/check-extensions.mjs` — four widths (1440/1180/820/390), tab and filter
behaviour, keyboard navigation, anchor offsets under the sticky header, broken
images, horizontal overflow, and a reduced-motion pass that nothing is left
invisible.
