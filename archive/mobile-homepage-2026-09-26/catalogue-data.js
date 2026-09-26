import { products } from './catalogue-products.js';
export { products };
export const categories = [
  // Category tile photos stay separate from similarly named product-card assets,
  // so either use case can be replaced without silently changing the other.
  { id: 'hairline-series', name: 'Hairline Series', benefit: 'Shop coverage for the front hairline', image: 'category-hairline-series' },
  { id: 'toppers', name: 'Hair Toppers', benefit: 'Shop coverage for the parting or crown', image: 'category-silk-hair-toppers' },
  { id: 'permanent-extensions', name: 'Permanent Extensions', benefit: 'Book a fitting at our studio', image: 'category-halo-hair-extensions' },
  { id: 'clip-extensions', name: 'Clip Extensions', benefit: 'Shop removable length and volume', image: 'clip-extensions' },
  { id: 'wigs', name: 'Wigs', benefit: 'Book a fitting with our team', image: 'category-premium-wigs' },
  { id: 'fringes', name: 'Fringes', benefit: 'Shop a new look without a haircut', image: 'category-fringe-with-sides' },
];
export const productBelongsToCategory = (product, category) => product.category === category || product.categories?.includes(category);
const categoryCount = category => products.filter(product => productBelongsToCategory(product, category)).length;
const esc = value => String(value).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
export const priceLabel = p => p.price === null ? 'Enquire for price' : `${p.ranged ? 'From ' : ''}₹${new Intl.NumberFormat('en-IN').format(p.price)}`;
export const enquiryUrl = p => `https://wa.me/919967123333?text=${encodeURIComponent(`Hello Alchemane, I would like to know more about ${p.name}. Please share the price, available options and fitting details.`)}`;
const needsConsultation = p => ['permanent-extensions', 'wigs'].includes(p.category);
const hidesPrice = p => needsConsultation(p);

function card(p) {
  const showPrice = !hidesPrice(p);
  const consultation = needsConsultation(p);
  const family = [p.category, ...(p.categories ?? [])]
    .map(id => categories.find(category => category.id === id)?.name)
    .filter(Boolean)
    .join(' · ');
  return `<li class="catalogue-card" data-handle="${p.handle}">
    <a class="catalogue-product${showPrice ? '' : ' catalogue-product--without-price'}" href="${consultation ? '#consultation' : esc(p.url ?? enquiryUrl(p))}"${!consultation && p.isNew ? ' target="_blank" rel="noopener noreferrer"' : ''}>
      <span class="catalogue-photo${p.image ? '' : ' is-placeholder'}">${p.image ? `<img src="${esc(p.image)}" alt="${esc(p.alt || p.name)}" width="720" height="900" loading="lazy" decoding="async">` : `<span class="sr-only">Product photograph not yet available</span>`}${p.isNew ? '<span class="new-label">New addition</span>' : ''}</span>
      <span class="catalogue-family">${family}</span>
      <h3>${esc(p.name)}</h3><p class="catalogue-description">${esc(p.description)}</p>
      ${showPrice ? `<span class="catalogue-price">${priceLabel(p)}</span>` : ''}
      <span class="catalogue-action">${consultation ? 'Book a consultation' : p.isNew ? 'Ask about this product' : 'View product'} <span aria-hidden="true">↗</span></span>
    </a>
  </li>`;
}

export function renderDiscovery() {
  return `<div class="discovery collection-discovery" id="product-finder" aria-label="Browse the Alchemane collection by product type">
    <div class="discovery-categories">${categories.map(c => `<a class="discovery-category" href="#range" data-catalogue-category="${c.id}"><span class="discovery-image"><img src="/assets/range/${c.image}-a.webp" alt="" width="600" height="800" loading="lazy"></span><span class="discovery-category-copy"><strong>${c.name} <span aria-hidden="true">↗</span></strong><span>${c.benefit}</span><small>${categoryCount(c.id)} products</small></span></a>`).join('')}</div>
  </div>`;
}

export function renderCatalogue() {
  return `<section class="catalogue section-wrap" id="range" aria-labelledby="range-title">
    <div class="catalogue-heading"><div><p class="eyebrow">Shop or book a consultation</p><h2 id="range-title" tabindex="-1">All hair products</h2></div><div class="catalogue-sort"><label for="product-sort">Sort by</label><select id="product-sort"><option value="recommended">Featured</option><option value="az">Name: A–Z</option><option value="price-low">Price: low to high</option><option value="price-high">Price: high to low</option><option value="new">New additions first</option></select></div></div>
    <div class="catalogue-filters" role="group" aria-label="Product category"><button type="button" data-category="all" aria-pressed="true">All products <span>${products.length}</span></button>${categories.map(c => `<button type="button" data-category="${c.id}" aria-pressed="false">${c.name} <span>${categoryCount(c.id)}</span></button>`).join('')}</div>
    <div class="catalogue-results"><p role="status" aria-live="polite" aria-atomic="true" data-results-count>${products.length} products</p><label class="new-filter"><input type="checkbox" id="new-products"> New additions only <span>${products.filter(product => product.isNew).length}</span></label><button type="button" class="reset-filters" data-reset-filters hidden>Reset filters</button></div>
    <ul class="catalogue-grid" role="list">${products.map(card).join('\n')}</ul>
    <div class="catalogue-empty" hidden><h3>No products found</h3><p>Choose another category or reset your filters.</p><button type="button" data-reset-filters class="solid-button">Show all products</button><a href="#consultation">Ask us to help you find it ↗</a></div>
    <div class="catalogue-more"><button type="button" data-show-more hidden>Show more products <span aria-hidden="true">↓</span></button></div>
    <p class="catalogue-price-note">Shop toppers, clip-in extensions and fringes online. Book a consultation for permanent extensions and wigs.</p>
  </section>`;
}
