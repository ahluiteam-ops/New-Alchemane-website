import { products, categories, productBelongsToCategory } from './catalogue-data';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

const extensionCategories = new Set(['permanent-extensions', 'clip-extensions']);
const isSupportedCategory = id => id === 'all' || id === 'extensions' || categories.some(c => c.id === id);
const matchesCategory = (product, category) => category === 'all' || productBelongsToCategory(product, category) || (category === 'extensions' && extensionCategories.has(product.category));

export function initCatalogue() {
  const section = document.querySelector('#range');
  const grid = section.querySelector('.catalogue-grid');
  const sort = section.querySelector('#product-sort');
  const newOnly = section.querySelector('#new-products');
  const buttons = [...section.querySelectorAll('[data-category]')];
  const cards = new Map([...grid.children].map(card => [card.dataset.handle, card]));
  const more = section.querySelector('[data-show-more]');
  const reset = section.querySelector('.reset-filters');
  const heading = section.querySelector('#range-title');
  const controller = new AbortController();
  const listen = (el, name, cb) => el.addEventListener(name, cb, { signal: controller.signal });
  let category = 'all';
  let visibleLimit = 8;
  const header = document.querySelector('.shop-header');
  const resize = header ? new ResizeObserver(() => document.documentElement.style.setProperty('--shop-header-height', `${header.offsetHeight}px`)) : null;
  if (header) resize.observe(header);

  function writeUrl(push = false) {
    const url = new URL(location.href);
    for (const [key, value] of Object.entries({ category: category === 'all' ? '' : category, sort: sort.value === 'recommended' ? '' : sort.value, new: newOnly.checked ? '1' : '' })) {
      if (value) url.searchParams.set(key, value); else url.searchParams.delete(key);
    }
    url.searchParams.delete('q');
    if (push) url.hash = 'range';
    history[push ? 'pushState' : 'replaceState'](null, '', url);
  }
  function render({ persist = true, push = false } = {}) {
    const result = products.filter(p => matchesCategory(p, category) && (!newOnly.checked || p.isNew));
    if (sort.value === 'az') result.sort((a, b) => a.name.localeCompare(b.name));
    if (sort.value === 'new') result.sort((a, b) => Number(b.isNew) - Number(a.isNew));
    if (sort.value.startsWith('price-')) result.sort((a, b) => {
      if (a.price === null) return b.price === null ? 0 : 1;
      if (b.price === null) return -1;
      return sort.value === 'price-low' ? a.price - b.price : b.price - a.price;
    });
    cards.forEach(card => { card.hidden = true; });
    result.forEach((p, i) => { const card = cards.get(p.handle); card.hidden = i >= visibleLimit; grid.append(card); });
    buttons.forEach(button => button.setAttribute('aria-pressed', String(button.dataset.category === category)));
    document.querySelectorAll('.shop-nav [data-catalogue-category]').forEach(link => {
      const selected = link.dataset.catalogueCategory === category && !newOnly.checked;
      if (selected) link.setAttribute('aria-current', 'true'); else link.removeAttribute('aria-current');
    });
    const newLink = document.querySelector('.shop-nav [data-new-products]');
    if (newLink) {
      if (newOnly.checked) newLink.setAttribute('aria-current', 'true'); else newLink.removeAttribute('aria-current');
    }
    heading.textContent = category === 'all' ? (newOnly.checked ? 'New additions' : 'All hair products') : category === 'extensions' ? 'Hair Extensions' : categories.find(c => c.id === category).name;
    const count = Math.min(visibleLimit, result.length);
    section.querySelector('[data-results-count]').textContent = `${result.length ? `Showing ${count} of ` : ''}${result.length} product${result.length === 1 ? '' : 's'}`;
    section.querySelector('.catalogue-empty').hidden = result.length !== 0;
    reset.hidden = category === 'all' && !newOnly.checked && sort.value === 'recommended';
    more.hidden = count === result.length;
    more.textContent = `Show more products (${result.length - count} remaining) ↓`;
    if (persist) writeUrl(push);
    ScrollTrigger.refresh();
  }
  function goToResults() {
    section.scrollIntoView({ behavior: 'instant', block: 'start' });
    heading.focus({ preventScroll: true });
  }
  function choose(id, onlyNew = false) {
    category = isSupportedCategory(id) ? id : 'all';
    newOnly.checked = onlyNew; visibleLimit = 8;
    render({ push: true }); goToResults();
  }
  function restore() {
    const params = new URLSearchParams(location.search);
    category = isSupportedCategory(params.get('category')) ? params.get('category') : 'all';
    newOnly.checked = params.get('new') === '1';
    sort.value = [...sort.options].some(o => o.value === params.get('sort')) ? params.get('sort') : 'recommended';
    visibleLimit = 8; render({ persist: false });
  }
  buttons.forEach(button => listen(button, 'click', () => { category = button.dataset.category; visibleLimit = 8; render({ push: true }); }));
  listen(sort, 'change', () => { visibleLimit = 8; render(); });
  listen(newOnly, 'change', () => { visibleLimit = 8; render({ push: true }); });
  listen(more, 'click', () => {
    const previous = new Set([...cards.values()].filter(card => !card.hidden));
    visibleLimit += 8; render();
    [...grid.children].find(card => !card.hidden && !previous.has(card))?.querySelector('a').focus({ preventScroll: true });
  });
  section.querySelectorAll('[data-reset-filters]').forEach(button => listen(button, 'click', () => { sort.value = 'recommended'; choose('all'); }));
  listen(document, 'click', event => {
    const link = event.target.closest('a[data-catalogue-category], a[data-range-open], a[data-new-products]');
    if (!link || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
    event.preventDefault(); event.stopImmediatePropagation();
    choose(link.dataset.catalogueCategory ?? link.dataset.rangeOpen, link.hasAttribute('data-new-products'));
  });
  listen(window, 'alchemane:range', event => {
    choose(event.detail.tab ?? 'all');
    if (event.detail.handle) {
      const p = products.find(item => item.handle === event.detail.handle);
      if (p) { category = p.category; render(); }
    }
  });
  listen(window, 'popstate', restore);
  restore();
  return () => { controller.abort(); resize?.disconnect(); };
}
