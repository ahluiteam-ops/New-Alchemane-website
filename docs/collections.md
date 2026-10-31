# Category discovery and collections

The homepage's second section keeps the original six circular category tabs and the product grid they control. The tabs switch products in place and form a swipeable row on mobile. Best Sellers follows. A separate visual collection section then shows six square category cards: three rows × two columns through 700px, two rows × three columns through 1000px, then one row × six columns on desktop. The square cards open dedicated collection pages.

Each card opens a static collection under `/collections/`. All products, Hairline Series, Hair Toppers, Permanent Extensions, Clip Extensions, Wigs and Fringes share one template. The combined Extensions collection supports older campaign links.

## Design and navigation

- Use the existing tokens in `src/design-tokens.css`: white, charcoal, pale teal, Source Serif 4 and Source Sans 3.
- Circular tabs filter the homepage product grid in place, with the original selected ring and keyboard arrow navigation. Square cards show approved photographs and open collection pages. Every square card stays visible on phones.
- Collection pages have a compact category rail above the results. On mobile, the filter and sort bar stays reachable while scrolling. The active category has `aria-current="page"`; the rail supports native horizontal scrolling.
- Product grids use two columns through 700px and three above that, alongside a filter sidebar on desktop. Sort and filter state lives in the URL and supports browser Back.
- The mobile filter sheet uses the website's serif dialog heading, sentence-case labels, pale teal selection state, and ink primary button. It has verified color swatches, all six product types with catalogue-wide counts, a dual price slider with numeric inputs, and an availability switch disabled until reliable stock data exists. These shades match Alchemane's published collection page on 31 Oct 2026; products without confirmed shade data are omitted from selected-color results.
- The current collection is checked in Product type. A single type opens its collection route; multiple types open combined results under All products. Changing types retains color, price, and sort selections. Clearing filters restores the current collection's defaults. Every collection exposes all six types, including products cross-listed under more than one category.
- The mobile sort sheet has Featured, Best selling, alphabetical A–Z/Z–A, and price low/high. Best selling uses the existing homepage curated list; there is no search relevance ranking.
- The shop ends with the product-page consultation choice layout. Online and studio choices open the booking form with the chosen mode selected. The footer uses the same site-wide layout and links as the homepage.
- Returning from a square card restores the square section's anchor. Circular tabs keep the shopper on the homepage.
- Old homepage category URLs and campaign links resolve to the matching collection.
- Product pages, consultation links and WhatsApp enquiries retain the existing destinations. No cart or checkout behaviour is added.

## Content and fallback

`src/sections/catalogue-products.js` remains the product source of truth. Unconfirmed prices say “Price on request.” Products without approved images use the existing neutral grey placeholder with a visible “Photograph coming soon” label. No substitute product images or prices are invented.

`src/collections/collection-data.js` renders complete documents through the Vite HTML transform. The small entries in `collections/*/index.html` select the collection. All product names, prices, category links and styles are delivered as HTML/CSS; JavaScript enhances sorting and filtering. The primary collection navigation works with JavaScript disabled.

## Verification

Run `npm run check:collections` with the dev server at port 5173, or set `BASE_URL` to a production preview. The check covers the original homepage tabs and product grid, the square-card-to-collection journey, correct category membership, sorting, color/type/price filtering, browser Back, keyboard focus, reduced motion, static rendering and responsive widths from 320px to 1920px plus landscape. Screenshots and a JSON report are saved under `preview/collections-qa/`.

Run `npm run build` to verify every collection is included in the production output.
