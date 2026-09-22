# Product discovery update — 22 September 2026

The task: make it easy to find a product, including for visitors who do not know hair-piece terminology. This is a design review and implementation, not a claim of completed user research or measured conversion improvement.

## Evidence and decisions

- [Official catalogue](https://alchemane.com/collections/all) and [public product feed](https://alchemane.com/products.json?limit=250): 21 products verified on 21 September 2026. The full response is retained in `live-products-2026-09-21.json`. Names, handles and minimum variant prices match the source. Existing local product photos are reused; the missing Premium Wigs photograph was downloaded from its official product image URL.
- The preceding local build had 20 products, two top-level categories, fringes nested inside extensions, and its full range after several storytelling sections. Premium Wigs was missing. The opening also required an extended scroll transition.
- The supplied image adds 19 names. All 19 are included exactly as supplied. No new specifications, prices, availability, product page URLs or photography were supplied.
- The original full-height hero and cloud reveal are preserved. The revealed five-piece collection now includes a direct “Browse all 40 products” action, and the product finder follows immediately after the animated experience.
- The Hairline Series uses five categories: Hair Toppers, Permanent Extensions, Clip Extensions, Wigs and Fringes. Product names remain prominent beneath each image. No hover interaction is required to see an action.
- Show eight products initially and allow more to be revealed. Category and new-product filters work across all 40, including hidden cards, and result counts are announced. The search interface has been removed.

## Catalogue

| Category | Existing | New | Total |
| --- | ---: | ---: | ---: |
| Hair toppers | 4 | 4 | 8 |
| Permanent extensions | 5 | 3 | 8 |
| Clip extensions | 7 | 0 | 7 |
| Fringes | 4 | 9 | 13 |
| Wigs | 1 | 3 | 4 |
| Total | 21 | 19 | 40 |

Net Fringe Toppers sits with the fringe family, following its placement in the supplied list; its full name remains searchable, including “topper”. New extension attachment methods are deliberately unclassified until confirmed. New-product categories are navigation groupings, not fitting recommendations.

## Updating approved content

Edit `src/sections/catalogue-products.js`:

1. Place an approved image in `public/assets/range/` and set its product's `image` to `/assets/range/filename.webp`. Add a factual `alt` description. A null image renders a blank grey area.
2. Set a confirmed `price` in rupees and `ranged` as appropriate. Prices render for toppers and fringes; extension and wig prices stay hidden in the interface.
3. Add the confirmed shop `url` and set `isNew: false` when the product should use the normal shop action. The current new-product action opens WhatsApp with its name; the visitor chooses whether to send.
4. Replace the neutral description with approved product information. Never infer a material or fitting method from a name alone.
5. Run `npm.cmd run build` and `npm.cmd run check:discovery` with the dev server running. The source verification expectations need updating when the live catalogue snapshot or supplied list changes.

`scripts/prepare-catalogue.mjs` generated the initial catalogue from the saved source and client list. It overwrites the generated product file; do not rerun after editing approved photos/details without incorporating those edits into the generator first. Normal development and builds do not run it.

## Verification and follow-up

Automated browser checks cover the five categories and counts, search removal, extension and wig price removal, price sorting, new placeholders/enquiries, show-more behaviour, reload/back navigation, retained dialogs, stories, FAQs and consultation, keyboard skip navigation, reduced motion, and 320/390/768/1440px widths. Screenshots and the report live in `preview/discovery-qa`.

Python was unavailable for the UI/UX Pro Max search script; applicable navigation, keyboard and empty-state guidance was read directly from its local UX guidelines. Caveman Compress was reviewed, but no memory/todo file was nominated for compression; application source and interface copy were not compression targets.

Suggested validation with customers: ask first-time visitors to find a piece for a widening parting, a removable fringe, a named new product, and a wig. Observe completion, wrong turns and time to the first relevant product. Compare against the preceding design before making claims about improved conversion. No analytics service or tracking was added.
