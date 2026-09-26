import { products, categories, productBelongsToCategory } from './catalogue-data';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

const extensionCategories = new Set(['permanent-extensions', 'clip-extensions']);
const supported = id => id === 'all' || id === 'extensions' || categories.some(category => category.id === id);
const matches = (product, id) => id === 'all' || productBelongsToCategory(product, id) || (id === 'extensions' && extensionCategories.has(product.category));

export function initCatalogue() {
  const section = document.querySelector('#range');
  const grid = section.querySelector('.catalogue-grid');
  const cards = new Map([...grid.children].map(card => [card.dataset.handle, card]));
  const heading = section.querySelector('#range-title');
  const more = section.querySelector('[data-show-more]');
  const empty = section.querySelector('.catalogue-empty');
  const count = section.querySelector('[data-results-count]');
  const controller = new AbortController();
  const listen = (target, event, handler) => target.addEventListener(event, handler, { signal: controller.signal });
  let category = 'hairline-series';
  let visibleLimit = 4;

  function writeUrl(push = false, hash = '') {
    const url = new URL(location.href);
    if (category === 'hairline-series') url.searchParams.delete('category');
    else url.searchParams.set('category', category);
    url.searchParams.delete('sort');
    url.searchParams.delete('new');
    url.searchParams.delete('q');
    url.hash = hash;
    history[push ? 'pushState' : 'replaceState'](null, '', url);
  }

  function render() {
    const result = products.filter(product => matches(product, category));
    cards.forEach(card => { card.hidden = true; });
    result.forEach((product, index) => {
      const card = cards.get(product.handle);
      card.hidden = index >= visibleLimit;
      grid.append(card);
    });
    heading.textContent = category === 'all' ? 'All hair products' : category === 'extensions' ? 'Hair Extensions' : categories.find(item => item.id === category).name;
    count.textContent = `${result.length} product${result.length === 1 ? '' : 's'}`;
    empty.hidden = result.length !== 0;
    more.hidden = result.length <= visibleLimit;
    more.textContent = `Show more products (${Math.max(0, result.length - visibleLimit)} remaining) ↓`;
    window.dispatchEvent(new CustomEvent('alchemane:category', { detail: { category } }));
    ScrollTrigger.refresh();
  }

  function choose(id, { navigate = false, push = false } = {}) {
    category = supported(id) ? id : 'all';
    visibleLimit = 4;
    render();
    writeUrl(push, navigate ? 'range' : '');
    if (navigate) {
      section.scrollIntoView({ behavior: 'instant', block: 'start' });
      heading.focus({ preventScroll: true });
    }
  }

  function restore() {
    const params = new URLSearchParams(location.search);
    category = supported(params.get('category')) ? params.get('category') : params.has('category') ? 'all' : 'hairline-series';
    visibleLimit = 4;
    render();
  }

  listen(window, 'alchemane:solution', event => choose(event.detail.category, { push: true }));
  listen(more, 'click', () => {
    const oldCards = new Set([...cards.values()].filter(card => !card.hidden));
    visibleLimit += 4;
    render();
    [...grid.children].find(card => !card.hidden && !oldCards.has(card))?.querySelector('a')?.focus({ preventScroll: true });
  });
  listen(document, 'click', event => {
    const link = event.target.closest('a[data-catalogue-category], a[data-range-open], a[data-new-products]');
    if (!link || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
    event.preventDefault();
    event.stopImmediatePropagation();
    choose(link.dataset.catalogueCategory ?? link.dataset.rangeOpen ?? 'all', { navigate: true, push: true });
  });
  listen(window, 'alchemane:range', event => choose(event.detail.tab ?? 'all', { navigate: true, push: true }));
  listen(window, 'popstate', restore);
  restore();
  return () => controller.abort();
}
