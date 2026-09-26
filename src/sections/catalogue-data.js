import { products } from './catalogue-products.js';

export { products };
export const categories = [
  { id: 'hairline-series', name: 'Hairline Series', benefit: 'Shop coverage for the front hairline', image: 'category-hairline-series' },
  { id: 'toppers', name: 'Hair Toppers', benefit: 'Shop coverage for the parting or crown', image: 'category-silk-hair-toppers' },
  { id: 'permanent-extensions', name: 'Permanent Extensions', benefit: 'Book a fitting at our studio', image: 'category-halo-hair-extensions' },
  { id: 'clip-extensions', name: 'Clip Extensions', benefit: 'Shop removable length and volume', image: 'clip-extensions' },
  { id: 'wigs', name: 'Wigs', benefit: 'Book a fitting with our team', image: 'category-premium-wigs' },
  { id: 'fringes', name: 'Fringes', benefit: 'Shop a new look without a haircut', image: 'category-fringe-with-sides' },
];

export const productBelongsToCategory = (product, category) => product.category === category || product.categories?.includes(category);
const esc = value => String(value).replace(/[&<>"']/g, character => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[character]));
export const priceLabel = product => product.price === null ? 'Enquire for price' : `${product.ranged ? 'From ' : ''}₹${new Intl.NumberFormat('en-IN').format(product.price)}`;
export const enquiryUrl = product => `https://wa.me/919967123333?text=${encodeURIComponent(`Hello Alchemane, I would like to know more about ${product.name}. Please share the price, available options and fitting details.`)}`;
const needsConsultation = product => ['permanent-extensions', 'wigs'].includes(product.category);

function card(product) {
  const consultation = needsConsultation(product);
  const showPrice = !consultation;
  return `<li class="catalogue-card" data-handle="${product.handle}">
    <a class="catalogue-product${showPrice ? '' : ' catalogue-product--without-price'}" href="${consultation ? '#consultation' : esc(product.url ?? enquiryUrl(product))}"${!consultation && product.isNew ? ' target="_blank" rel="noopener noreferrer"' : ''}>
      <span class="catalogue-photo${product.image ? '' : ' is-placeholder'}">${product.image ? `<img src="${esc(product.image)}" alt="${esc(product.alt || product.name)}" width="720" height="900" loading="lazy" decoding="async">` : '<span class="sr-only">Product photograph not yet available</span>'}${product.isNew ? '<span class="new-label">New addition</span>' : ''}</span>
      <h3>${esc(product.name)}</h3>
      ${showPrice ? `<span class="catalogue-price">${priceLabel(product)}</span>` : ''}
      <span class="catalogue-action">${consultation ? 'Need Consultation' : product.isNew ? 'Ask for details' : 'View product'} <span aria-hidden="true">↗</span></span>
    </a>
  </li>`;
}

export function renderCatalogue() {
  return `<section class="catalogue section-wrap" id="range" role="tabpanel" aria-labelledby="solution-tab-hairline-series">
    <h3 class="sr-only" id="range-title" tabindex="-1">Hairline Series</h3>
    <div class="catalogue-results"><p role="status" aria-live="polite" aria-atomic="true" data-results-count></p></div>
    <ul class="catalogue-grid" role="list">${products.map(card).join('\n')}</ul>
    <div class="catalogue-empty" hidden><h3>No products found</h3><p>Choose another category above.</p><a href="#consultation">Need Help</a></div>
    <div class="catalogue-more"><button type="button" data-show-more hidden>Show more products <span aria-hidden="true">↓</span></button></div>
  </section>`;
}
