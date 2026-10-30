import { categories, products, productBelongsToCategory } from '../sections/catalogue-data.js';

const escape = value => String(value).replace(/[&<>"']/g, character => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[character]));
const chevron = '<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="m9 5 7 7-7 7"/></svg>';
const arrow = '<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="M5 12h14m-6-6 6 6-6 6"/></svg>';
const menuIcon ='<svg class="nav-menu-icon" viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path class="nav-menu-icon__open" d="M4 7h16M4 12h16M4 17h16"/><path class="nav-menu-icon__close" d="m6 6 12 12M6 18 18 6"/></svg>';

// Only published local product pages belong here. Catalogue entries can remain
// visible before their pages are ready without linking to unfinished routes.
const productRoutes = { 'silk-hair-toppers': '/products/silk-hair-toppers/' };

const trigger = mobile => `<button class="shopnav__trigger shopnav__${mobile ? 'mobile' : 'desktop'}-trigger" type="button" popovertarget="shop-navigation" aria-controls="shop-navigation" aria-expanded="false">Shop ${chevron}</button>`;
export const desktopShopTrigger = () => trigger(false);

export function renderShopPanel(isProductPage = false) {
  return `<nav class="shopnav" id="shop-navigation" popover="auto" aria-label="Shop by category">
    <div class="shopnav__heading"><span id="shop-navigation-title">Shop by category</span><button class="shopnav__close" type="button" popovertarget="shop-navigation" popovertargetaction="hide" aria-label="Close shop menu"><svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="m6 6 12 12M6 18 18 6"/></svg></button></div>
    <div class="shopnav__layout">
      <div class="shopnav__categories" aria-label="Product categories">${categories.map(category => `<button class="shopnav__category" type="button" data-shop-category="${category.id}" aria-controls="shop-products-${category.id}" aria-pressed="${category.id === 'toppers'}"><span>${escape(category.name)}</span>${chevron}</button>`).join('')}</div>
      <div class="shopnav__products">
        <button class="shopnav__back" type="button" data-shop-back>${chevron} All categories</button>
        ${categories.map(category => `<section class="shopnav__group" id="shop-products-${category.id}" aria-labelledby="shop-title-${category.id}"${category.id === 'toppers' ? '' : ' hidden'}>
          <div class="shopnav__intro"><h2 id="shop-title-${category.id}" tabindex="-1">${escape(category.name)}</h2><p>${escape(category.benefit)}</p></div>
          <ul class="shopnav__list">${products.filter(product => productBelongsToCategory(product, category.id)).map(product => {
            const route = productRoutes[product.handle];
            return `<li>${route
              ? `<a class="shopnav__product shopnav__product--available" href="${route}"${isProductPage ? ' aria-current="page"' : ''}><span>${escape(product.name)}</span><span class="shopnav__product-action">${isProductPage ? 'Current product' : 'View product'} ${arrow}</span></a>`
              : `<span class="shopnav__product shopnav__product--soon" role="link" aria-disabled="true"><span>${escape(product.name)}</span></span>`}</li>`;
          }).join('')}</ul>
        </section>`).join('')}
      </div>
    </div>
  </nav>`;
}

export function addShopNavigation(html) {
  let decorated = false;
  const isProductPage = /<body[^>]*class="[^"]*\bpd\b/.test(html);
  html = html.replace(/<header class="(site-header|pe-header|pd-header|shop-header|consult-header)"[^>]*>[\s\S]*?<\/header>/, (header, type) => {
    decorated = true;
    header = header.replace(/(<nav[^>]*class="(?:main-nav|pe-nav|pd-nav|shop-nav|consult-nav)"[^>]*>)(\s*<a href="\/"[^>]*>Home<\/a>)?/, (_, opening, home = '') => opening + home + trigger(false));
    if (type === 'shop-header') header = header.replace(/(<a class="header-help"[\s\S]*?<\/a>)/, `<div class="shopnav__masthead-links">${trigger(true)}$1</div>`);
    else if (type === 'consult-header') header = header.replace(/(<button class="consult-menu")/, '<a class="desktop-header-cta" href="#booking" aria-current="page">Book consultation</a>$1');
    else header = header
      .replace(/<button class="(?:menu-toggle|pe-menu|pd-icon-button pd-menu)"/, match => trigger(true) + match)
      // One icon with both states, so the open menu shows a close (X) in the same place.
      .replace(/(<button class="(?:menu-toggle|pe-menu|pd-icon-button pd-menu)"[^>]*>)\s*<svg[\s\S]*?<\/svg>/, `$1${menuIcon}`);
    return header.replace('</header>', `${renderShopPanel(isProductPage)}</header>`);
  });
  return decorated ? html.replace('</body>', '<script type="module" src="/src/components/shop-navigation.js"></script></body>') : html;
}
