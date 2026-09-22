# "The everyday edit" archive — 21 September 2026

The "Selected pieces / The everyday edit" section (Silk Topper, Halo Extension, Ponytail, Tape Extension, with the full edit / toppers / extensions tabs) was removed from the live homepage at the user's request. No asset was deleted: it used `/assets/topper-editorial.webp`, `halo-editorial.webp`, `ponytail-editorial.webp` and `tape-editorial.webp`, which are all still in `public/assets/`.

## Restore

1. Copy `section.html` into `src/homepage.html` directly after the `.overture-stage` block.
2. Nothing needs adding to the CSS or JS. The rules in `edit.css` are a reference copy — they were left in `homepage.css` and `premium.css`, and the tab behaviour (`bindTabs('[data-edit]')`) is still in `homepage.js`, where it does nothing while the section is absent.
3. These cards were the only thing on the page that opened the product dialog (`[data-product]` in `main.js`). While the section is archived the dialog and its handlers stay in place but have no trigger; restoring the section brings them back to life.
4. Restoring changes what covers the overture: `overture.css` pulls whatever section follows `.overture-stage` up over the pinned portrait (it used to be this one by id). Placing this section back after the stage restores the original look exactly.
5. Run `npm run build`, then `node scripts/check-homepage.mjs`. `check-discovery.mjs` no longer tests the dialog; add that step back (click `.edit-card[data-product="halo-extensions"]`, expect `.product-dialog` visible, click `.dialog-return`, expect the catalogue to show Halo Hair Extensions) when restoring.
