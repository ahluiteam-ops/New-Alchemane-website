# Reusable product page

Preview: `/products/silk-hair-toppers/`.

This first page is Silk Topper 5×3. It uses the existing Alchemane palette and local Source Serif 4 / Source Sans 3 fonts. It is a static Vite page, with a shared build-time renderer and browser interactions. No framework, icon package, analytics or payment service was added.

## Files

- `src/products/product-content.js`: product content registry, actual Shopify variant IDs, rupee prices, gallery metadata, product details, FAQs and related product handles.
- `src/products/render-product.js`: shared static HTML template. Essential content is in the delivered HTML.
- `src/pages/product.css`: scoped responsive styles, shared design tokens, touch targets, focus and reduced-motion support.
- `src/pages/product.js`: gallery, zoom, variant/price selection, bag, dialogs, mobile purchase bar and videos.
- `products/silk-hair-toppers/index.html`: page metadata and the product marker used by Vite.
- `scripts/prepare-product-assets.mjs`: downloads original Alchemane photography and optimises WebP images/thumbnails. It also saves the public source response.
- `scripts/check-product-page.mjs`: responsive and purchase-flow verification.

## Add the next product

1. Add a content record to `productPages`, keyed by the product's real handle. Use the same record structure as the first page. Confirm all product facts, prices, option combinations, Shopify IDs and availability against that product's official feed. Prices in the content registry are rupees; Shopify's JSON feed prices are paise.
2. Put its approved images in `public/assets/products/<handle>/`. Set gallery file numbers, accurate alt text and captions. A `display` path is optional for an existing approved main image. Full-image zoom uses the uncropped source.
3. Create `products/<handle>/index.html` from the first entry. Change its title, description, preload and `<!-- product-page:<handle> -->` marker. Keep preview pages `noindex` until publication is intended.
4. Register that HTML entry in `vite.config.js` under `build.rollupOptions.input`. The shared renderer uses the marker to pick the content record. The optional `story` and `films` sections can be omitted.
5. Connect the matching category/homepage card to `/products/<handle>/`. The first product is already connected from Best Sellers, the homepage catalogue and the toppers page.
6. Run the build and product checks, then review desktop and phone screenshots. Category-specific language, fit guidance and media must be tailored when extending the topper template to wigs or extensions.

## Commerce behaviour

Product-page consultation links scroll to the embedded `#consultation` form directly above the footer. The form reuses `topper-consultation.js`, includes the selected product/options in the WhatsApp request, and retains the existing ₹299 fee. The mobile purchase bar hides while that section is visible or focused. The separate booking page remains available elsewhere on the site.

The six Silk Topper variants were read from [Alchemane's public product feed](https://alchemane.com/products/silk-hair-toppers.js) on 21 October 2026. The full response, including image URLs, is retained in `docs/product-sources/silk-hair-toppers.json`. No reference-store product images, specifications or reviews were reused. The [reference page](https://1hairstop.in/products/starter-silk-hair-topper-size-1-5x3) informed the buying-information hierarchy.

The bag uses local storage, keyed by product handle and variant ID. It supports multiple registered products, quantities, removal and reload persistence. A restricted-storage browser retains the bag in memory for the session.

Buy now and bag checkout use [Shopify cart permalinks](https://shopify.dev/docs/apps/build/checkout/create-cart-permalinks) with real variant IDs and quantities, continuing to the existing Alchemane store. No payment or order is created locally. Server checkout remains authoritative for prices, availability, shipping and tax. This preview does not share its local bag with an existing remote store session. Browser tests check the handoff URLs; they do not place an order.

Variant data is a verified snapshot, not a live inventory integration. Refresh and reconcile the source before production release, or connect a storefront API when the site becomes the production shop. Do not display unverified delivery estimates, review counts, stock urgency or discount claims. The current official copy contains conflicting delivery estimates, so this page offers team confirmation and links to the policies.

No-JavaScript visitors can read the static product details and use the original store to select options. Interactive selectors are hidden in that fallback to avoid submitting a different variant from the one displayed.

## Verification

`npm.cmd run build`

`npm.cmd run check:product` (default server `http://127.0.0.1:5174`; override `BASE_URL` as needed).

Checks cover 320, 390, 768, 1440 and landscape widths, all six variant prices, direct-checkout quantities, persisted bag, removal, zoom keyboard controls and focus restoration, size-guide dismissal, mobile navigation, sticky purchase controls, FAQ expansion, local asset errors, reduced motion and the static fallback. Screenshots are in `preview/product-page/`.

UI/UX Pro Max's Python search runner was unavailable. Design decisions used the project's existing design system plus the skill's built-in accessibility, touch, layout and performance guidance. The other named design skills informed restraint, content hierarchy and token reuse. Caveman Compress was inspected; no prose file was nominated for compression, and its code-file exclusion was respected.
