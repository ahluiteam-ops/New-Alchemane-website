import { categories, products, productBelongsToCategory, priceLabel, enquiryUrl } from '../sections/catalogue-data.js';

export const collectionIds = ['all', ...categories.map(category => category.id), 'extensions'];
export const collectionUrl = id => `/collections/${collectionIds.includes(id) ? id : 'all'}/`;
export const escapeHtml = value => String(value).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
export const arrowIcon = '<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="M5 12h14m-6-6 6 6-6 6"/></svg>';
const chevronIcon = '<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="m7 9 5 5 5-5"/></svg>';
const filterIcon = '<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="M4 5h16l-6.5 7.4V18l-3 2v-7.6L4 5Z"/></svg>';
const sortIcon = '<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="M4 7h16M4 12h12M4 17h8"/></svg>';
const closeIcon = '<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="m6 6 12 12M18 6 6 18"/></svg>';

const descriptions = {
  all: 'Explore hair toppers, extensions, wigs and fringes. Find the piece that feels like you.',
  'hairline-series': 'Explore pieces for the front hairline. Our team can help you choose your coverage and fit.',
  toppers: 'Find coverage for your parting and crown, with options to blend with your own hair.',
  'permanent-extensions': 'Explore length and volume fitted by our team. Get help choosing a method for your hair.',
  'clip-extensions': 'Add length, fullness or a new style with extensions you can put on and take off.',
  wigs: 'Explore full-head coverage, with personal guidance on fit, shade and styling.',
  fringes: 'Try a fringe or refresh your look with pieces you can clip in and take off.',
  extensions: 'Explore removable pieces and professionally fitted extensions for length and volume.',
};

export function getCollection(id) {
  const name = categories.find(item => item.id === id)?.name ?? (id === 'extensions' ? 'Hair Extensions' : 'All hair products');
  return { id, name, description: descriptions[id] ?? descriptions.all, products: products.filter(p => id === 'all' || productBelongsToCategory(p, id) || (id === 'extensions' && ['clip-extensions', 'permanent-extensions'].includes(p.category))) };
}

export function renderCollectionProduct(product, index = 0) {
  const consultation = ['wigs', 'permanent-extensions'].includes(product.category);
  const local = product.handle === 'silk-hair-toppers';
  const href = consultation ? '/consultation.html' : local ? '/products/silk-hair-toppers/' : enquiryUrl(product);
  const category = categories.find(item => item.id === product.category);
  return `<li class="collection-product" data-product="${product.handle}" data-category="${escapeHtml(product.category)}" data-categories="${[product.category, ...(product.categories ?? [])].join(',')}" data-colors="${(verifiedProductColors[product.handle] ?? []).join(',')}" data-price="${product.price ?? ''}" data-new="${Boolean(product.isNew)}">
    <a class="collection-product__link" href="${escapeHtml(href)}"${!consultation && !local ? ' target="_blank" rel="noopener noreferrer"' : ''}>
      <span class="collection-product__photo${product.image ? '' : ' collection-product__photo--pending'}">
        ${product.image ? `<img src="${escapeHtml(product.image)}" alt="${escapeHtml(product.alt || product.name)}" width="720" height="900" loading="${index < 4 ? 'eager' : 'lazy'}" decoding="async">` : '<span class="collection-product__pending">Photograph<br>coming soon</span>'}
        ${product.isNew ? '<span class="collection-product__badge">New</span>' : ''}
        <span class="collection-product__open" aria-hidden="true">${arrowIcon}</span>
      </span>
      <div class="collection-product__details">
        <span class="collection-product__category">${escapeHtml(category?.name ?? '')}</span>
        <h2>${escapeHtml(product.name)}</h2>
        <span class="collection-product__price">${product.price === null ? 'Price on request' : priceLabel(product)}</span>
        <span class="sr-only">${consultation ? 'Book consultation' : local ? 'View product' : 'Ask for details on WhatsApp (opens in a new tab)'}</span>
      </div>
    </a>
  </li>`;
}

function collectionNavigation(id) {
  return `<div class="collection-category-bar" data-category-bar><div class="collection-width collection-category-bar__inner">
    <span class="collection-category-bar__heading">Shop by category</span>
    <nav class="collection-category-nav" aria-label="Product categories" data-category-nav>${[{ id: 'all', name: 'All products' }, ...categories].map(c => `<a href="${collectionUrl(c.id)}"${c.id === id ? ' aria-current="page"' : ''}>${escapeHtml(c.name)}</a>`).join('')}</nav>
  </div></div>`;
}

// Shades listed on Alchemane's public collection page (31 Oct 2026).
// New catalogue entries have no confirmed colors and are not attributed a guessed shade.
const standardShades = ['natural-black', 'dark-brown', 'highlights'];
export const verifiedProductColors = {
  'silk-hair-toppers': standardShades,
  'silk-hair-toppers-5x6': ['natural-black', 'dark-brown', 'brown-gold-highlights'],
  'skin-topper': standardShades,
  'skin-topper-5x6': standardShades,
  'halo-hair-extensions': standardShades,
  'one-set-clip-in-hair-extensions': standardShades,
  'two-set-clip-in-extensions': standardShades,
  'u-shaped-extensions': standardShades,
  '2-clip-side-hair-extensions': standardShades,
  'filler-clip-on-hair-extensions': standardShades,
  'pony-tail-hair-extensions': standardShades,
  'single-clip-on-hair-extensions': standardShades,
};
const colorLabels = [
  ['brown-gold-highlights', 'Brown Gold Highlights'],
  ['dark-brown', 'Dark Brown'],
  ['highlights', 'Highlights'],
  ['natural-black', 'Natural Black'],
];
const chevronUpIcon = '<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="m6 15 6-6 6 6"/></svg>';

function filterSection(id, title, content, expanded = true) {
  return `<details class="collection-filter-section"${expanded ? ' open' : ''}><summary>${title}${chevronUpIcon}</summary><div id="${id}" class="collection-filter-section__content">${content}</div></details>`;
}

function filterFields(prefix) {
  const counts = new Map(categories.map(category => [category.id, products.filter(product => productBelongsToCategory(product, category.id)).length]));
  const availableColors = new Set(products.flatMap(product => verifiedProductColors[product.handle] ?? []));
  const colorFields = `<fieldset class="collection-color-options"><legend class="sr-only">Select colors</legend>${colorLabels.filter(([id]) => availableColors.has(id)).map(([id, label]) => `<label class="collection-color-option" title="${label}"><input type="checkbox" value="${id}" data-filter-color aria-label="${label}"><span class="collection-color-swatch collection-color-swatch--${id}" aria-hidden="true"></span></label>`).join('')}</fieldset><output class="collection-color-selection" data-selected-colors hidden></output>`;
  const typeFields = `<fieldset class="collection-type-options"><legend class="sr-only">Select product types</legend>${categories.filter(category => counts.get(category.id) > 0).map(category => `<label class="collection-type-option"><input type="checkbox" value="${category.id}" data-filter-type><span>${escapeHtml(category.name)}</span><span class="collection-type-option__count">${counts.get(category.id)}</span></label>`).join('')}</fieldset>`;
  const priceFields = `<div class="collection-price-range" data-price-range><div class="collection-price-range__track"><span data-price-fill></span></div><input type="range" min="0" max="80000" step="500" value="0" aria-label="Minimum price" data-price-min><input type="range" min="0" max="80000" step="500" value="80000" aria-label="Maximum price" data-price-max></div><div class="collection-price-fields"><label>From <span>₹ <input type="number" min="0" max="80000" step="500" value="0" inputmode="numeric" data-price-min-number></span></label><span class="collection-price-fields__to">to</span><label>To <span>₹ <input type="number" min="0" max="80000" step="500" value="80000" inputmode="numeric" data-price-max-number></span></label></div>`;
  const availability = `<div class="collection-availability"><label class="collection-switch"><input type="checkbox" disabled aria-label="In stock only (unavailable)"><span class="collection-switch__track" aria-hidden="true"></span><span aria-hidden="true">In stock only</span></label></div>`;
  return `${availableColors.size ? filterSection(`${prefix}-colors`, 'Color', colorFields) : ''}${filterSection(`${prefix}-types`, 'Product type', typeFields)}${filterSection(`${prefix}-price`, 'Price', priceFields)}${filterSection(`${prefix}-availability`, 'Availability', availability)}`;
}

export function renderCollectionPage(id) {
  const collection = getCollection(id);
  return `<!doctype html>
<html lang="en"><head>
  <meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1"><meta name="theme-color" content="#ffffff">
  <meta name="description" content="${escapeHtml(collection.description)}">
  <link rel="icon" type="image/svg+xml" href="/favicon.svg">
  <link rel="stylesheet" href="/src/design-tokens.css">
  <link rel="stylesheet" href="/src/collections/collection-shop.css">
  <link rel="stylesheet" href="/src/sections/consultation-meet.css">
  <link rel="stylesheet" href="/src/sections/site-footer.css">
  <link rel="stylesheet" href="/src/components/shop-navigation.css">
  <link rel="preload" href="/fonts/source-sans-3-regular.ttf" as="font" type="font/ttf" crossorigin>
  <link rel="preload" href="/fonts/source-serif-4-regular.ttf" as="font" type="font/ttf" crossorigin>
  <title>${escapeHtml(collection.name)} | Alchemane</title>
</head><body class="collection-page" id="top" data-collection="${id}">
  <a class="skip-link" href="#collection-products">Skip to products</a>
  <header class="shop-header"><div class="shop-masthead">
    <a class="brand" href="/" aria-label="Alchemane home"><img class="brand-logo" src="/icons/new%20logo.svg" alt="" width="160" height="40"></a>
    <nav class="shop-nav" aria-label="Main navigation"><a href="/">Home</a><a href="/permanent-extensions.html">Permanent Extensions</a><a href="/toppers.html">Hair Toppers</a><a href="/wigs.html">Wigs</a></nav>
    <a class="header-help" href="/consultation.html">Book consultation</a>
  </div></header>
  <main id="collection-main">
    <nav class="site-breadcrumb" aria-label="Breadcrumb"><ol><li><a href="/">Home</a></li>${id === 'all' ? '' : `<li><a href="${collectionUrl('all')}">Shop</a></li>`}<li aria-current="page"><span class="site-breadcrumb__current">${escapeHtml(collection.name)}</span></li></ol></nav>
    <div class="collection-intro collection-width"><div><h1>${escapeHtml(collection.name)}</h1></div><p>${escapeHtml(collection.description)}</p></div>
    ${collectionNavigation(id)}
    <section class="collection-results collection-width" id="collection-products" aria-label="${escapeHtml(collection.name)} products" tabindex="-1">
      <div class="collection-layout">
        <aside class="collection-filter-panel" aria-labelledby="collection-filter-title" data-filter-panel hidden>
          <div class="collection-filter-panel__heading"><h2 id="collection-filter-title">Filters</h2><button type="button" data-clear-filters hidden>Clear all</button></div>
          <form data-filter-form="desktop">${filterFields('desktop')}</form>
        </aside>
        <div class="collection-products-column">
          <div class="collection-toolbar" data-collection-toolbar>
            <p role="status" aria-live="polite" aria-atomic="true" data-collection-count>${collection.products.length} products</p>
            <div class="collection-toolbar__actions">
              <button class="collection-toolbar-button collection-toolbar-button--filter" type="button" data-open-filter hidden>${filterIcon}<span>Filter</span><span class="collection-toolbar-button__count" data-filter-count hidden></span></button>
              <div class="collection-sort" data-collection-sort hidden><label for="collection-sort">Sort by</label><select id="collection-sort"><option value="featured">Featured</option><option value="best-selling">Best selling</option><option value="name">Alphabetically, A–Z</option><option value="name-desc">Alphabetically, Z–A</option><option value="price-asc">Price, low to high</option><option value="price-desc">Price, high to low</option></select></div>
              <button class="collection-toolbar-button collection-toolbar-button--sort" type="button" data-open-sort hidden>${sortIcon}<span data-sort-label>Sort</span>${chevronIcon}</button>
            </div>
          </div>
          <div class="collection-active-filters" data-active-filters hidden aria-label="Applied filters"></div>
          <ul class="collection-product-grid" role="list">${collection.products.map(renderCollectionProduct).join('')}</ul>
          <div class="collection-empty" data-collection-empty hidden><h2>No products found</h2><p>Change a filter to see more products.</p><button type="button" data-clear-filters>Clear filters</button></div>
          <p class="collection-price-note">Prices shown in INR. Our team can help with shade, length and fitting details.</p>
        </div>
      </div>
    </section>
    <section class="collection-consult-offer" aria-labelledby="collection-consult-title"><div class="collection-width collection-consult-offer__layout">
      <div class="collection-consult-offer__copy"><h2 id="collection-consult-title"><span>Prefer a consultation</span> <span>before you buy?</span></h2><p>Choose a private video call from anywhere, or meet our team at the Khar West studio in Mumbai.</p></div>
      <div class="collection-consult-offer__choice" role="group" aria-labelledby="collection-meet-label" data-collection-consultation-choice>
        <p class="consultation-meet__label" id="collection-meet-label">How would you like to meet?</p>
        <div class="consultation-meet__options"><button type="button" data-collection-consultation-mode="Online" aria-pressed="false">Online</button><button type="button" data-collection-consultation-mode="Khar West studio" aria-pressed="true">Offline</button></div>
        <p class="consultation-meet__note" data-collection-consultation-note aria-live="polite"><strong>In-person</strong><span>At our Khar West studio, Mumbai.</span></p>
        <a class="collection-button" href="/consultation.html?meeting=Khar+West+studio#booking" data-collection-consultation-cta>Book an offline consultation</a>
      </div>
    </div></section>
  </main>
  <dialog class="collection-sheet collection-filter-sheet" data-filter-sheet aria-labelledby="mobile-filter-title"><div class="collection-sheet__surface">
    <div class="collection-sheet__header"><h2 id="mobile-filter-title">Filters</h2><button type="button" class="collection-sheet__close" data-close-sheet aria-label="Close filters">${closeIcon}</button></div>
    <div class="collection-sheet__body"><form data-filter-form="mobile">${filterFields('mobile')}</form></div>
    <div class="collection-sheet__footer"><button type="button" class="collection-sheet__secondary" data-clear-filters>Clear</button><button type="button" class="collection-sheet__primary" data-apply-filters>View results</button></div>
  </div></dialog>
  <dialog class="collection-sheet collection-sort-sheet" data-sort-sheet aria-labelledby="mobile-sort-title"><div class="collection-sheet__surface collection-sheet__surface--compact">
    <div class="collection-sheet__header"><h2 id="mobile-sort-title">Sort by</h2><button type="button" class="collection-sheet__close" data-close-sheet aria-label="Close sorting">${closeIcon}</button></div>
    <div class="collection-sort-options" role="group" aria-label="Sort products"><button type="button" data-sort-value="featured">Featured</button><button type="button" data-sort-value="best-selling">Best selling</button><button type="button" data-sort-value="name">Alphabetically, A–Z</button><button type="button" data-sort-value="name-desc">Alphabetically, Z–A</button><button type="button" data-sort-value="price-asc">Price, low to high</button><button type="button" data-sort-value="price-desc">Price, high to low</button></div>
  </div></dialog>
  <footer class="site-footer" aria-label="Footer"><div class="footer-main">
    <div class="footer-brand-column"><a class="footer-brand" href="/" aria-label="Alchemane home"><img class="footer-logo" src="/icons/new%20logo.svg" alt="" width="160" height="40"></a><address class="footer-address"><strong>Address</strong> – 4th floor Empressa Building, 2nd Rd, Khar, Ram Krishna Nagar, Khar West, Mumbai, Maharashtra 400052.</address><nav class="footer-social" aria-label="Alchemane social media"><a href="https://www.facebook.com/" target="_blank" rel="noopener noreferrer" aria-label="Facebook"><img src="/icons/footer/Facebook-1--Streamline-Plump%201.svg" alt="" width="28" height="28"></a><a href="https://www.instagram.com/" target="_blank" rel="noopener noreferrer" aria-label="Instagram"><img src="/icons/footer/Instagram--Streamline-Core%201.svg" alt="" width="28" height="28"></a><a href="https://x.com/" target="_blank" rel="noopener noreferrer" aria-label="X"><img src="/icons/footer/x.svg" alt="" width="28" height="28"></a><a href="https://www.youtube.com/" target="_blank" rel="noopener noreferrer" aria-label="YouTube"><img src="/icons/footer/Youtube--Streamline-Bootstrap%201.svg" alt="" width="28" height="28"></a></nav></div>
    <nav class="footer-nav-column" aria-label="Solutions"><p class="footer-title">Solutions</p><a href="/permanent-extensions.html">Permanent Extensions</a><a href="/wigs.html">Hair Wigs</a><a href="/toppers.html">Hair Toppers</a></nav>
    <nav class="footer-nav-column" aria-label="Information"><p class="footer-title">Information</p><a href="/blogs.html">Blogs</a><a href="/pages/privacy-policy/">Privacy Policy</a><a href="/pages/returns-and-exchanges/">Returns and Exchanges</a><a href="/pages/shipping-delivery/">Shipping and Delivery</a><a href="/pages/terms-of-service/">Terms of Service</a></nav>
    <div class="footer-contact-column"><p class="footer-title">Contact Us</p><a class="footer-contact-link" href="tel:+919967123333"><img src="/icons/footer/call.svg" alt="" width="24" height="24"><span>+91 9967123333</span></a><a class="footer-contact-link" href="mailto:info@alchemane.com"><img src="/icons/footer/mail.svg" alt="" width="24" height="24"><span>info@alchemane.com</span></a></div>
  </div><div class="footer-bottom"><span class="footer-copyright">© ${new Date().getFullYear()} - Alchemane Hair Extensions</span><a class="footer-back-to-top" href="#top">Back to top <span aria-hidden="true">↑</span></a></div></footer>
  <script type="module" src="/src/collections/collection-shop.js"></script>
</body></html>`;
}
