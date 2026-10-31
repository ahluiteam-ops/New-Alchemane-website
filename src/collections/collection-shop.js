document.body.classList.add('is-enhanced');

const abort = new AbortController();
const on = (target, event, handler, options = {}) => target?.addEventListener(event, handler, { ...options, signal: abort.signal });
const grid = document.querySelector('.collection-product-grid');
const originalCards = [...grid.children];
const select = document.querySelector('#collection-sort');
const count = document.querySelector('[data-collection-count]');
const categoryNav = document.querySelector('[data-category-nav]');
const filterPanel = document.querySelector('[data-filter-panel]');
const filterSheet = document.querySelector('[data-filter-sheet]');
const sortSheet = document.querySelector('[data-sort-sheet]');
const consultationChoice = document.querySelector('[data-collection-consultation-choice]');
const activeFilters = document.querySelector('[data-active-filters]');
const empty = document.querySelector('[data-collection-empty]');
const mobileForm = document.querySelector('[data-filter-form="mobile"]');
const desktopForm = document.querySelector('[data-filter-form="desktop"]');
const sortValues = new Set([...select.options].map(option => option.value));
const MAX_PRICE = 80000;
const colorNames = new Map([['brown-gold-highlights', 'Brown Gold Highlights'], ['dark-brown', 'Dark Brown'], ['highlights', 'Highlights'], ['natural-black', 'Natural Black']]);
const typeNames = new Map([...desktopForm.querySelectorAll('[data-filter-type]')].map(input => [input.value, input.closest('label').querySelector('span').textContent]));
const collectionId = document.body.dataset.collection;
const defaultTypes = collectionId === 'all' ? [] : collectionId === 'extensions' ? ['clip-extensions', 'permanent-extensions'] : [collectionId];
const sameTypes = (a, b) => a.length === b.length && a.every(type => b.includes(type));
const bestSellers = ['hairline-toppers', 'silk-hair-toppers', 'skin-topper', 'fringe-with-sides'];
const closeIcon = '<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="m7 7 10 10M17 7 7 17"/></svg>';
const formatPrice = value => `₹${new Intl.NumberFormat('en-IN').format(value)}`;
const clamp = (value, min, max) => Math.min(max, Math.max(min, Number.isFinite(Number(value)) ? Number(value) : min));

function parseList(value, allowed) {
  return [...new Set((value ?? '').split(',').filter(item => allowed.has(item)))];
}

function stateFromUrl() {
  const params = new URLSearchParams(location.search);
  return {
    sort: sortValues.has(params.get('sort')) ? params.get('sort') : 'featured',
    min: clamp(params.get('min') ?? 0, 0, MAX_PRICE),
    max: clamp(params.get('max') ?? MAX_PRICE, 0, MAX_PRICE),
    colors: parseList(params.get('color'), new Set(colorNames.keys())),
    types: params.has('type') ? parseList(params.get('type'), new Set(typeNames.keys())) : [...defaultTypes],
  };
}

let state = stateFromUrl();
if (state.min > state.max) state.min = state.max;

function updateUrl(mode = 'push') {
  const url = new URL(location.href);
  const typeChanged = !sameTypes(state.types, defaultTypes);
  const destination = typeChanged ? (state.types.length === 1 ? state.types[0] : 'all') : collectionId;
  url.pathname = `/collections/${destination}/`;
  if (state.sort === 'featured') url.searchParams.delete('sort');
  else url.searchParams.set('sort', state.sort);
  url.searchParams.delete('price');
  url.searchParams.delete('new');
  if (state.min === 0) url.searchParams.delete('min');
  else url.searchParams.set('min', state.min);
  if (state.max === MAX_PRICE) url.searchParams.delete('max');
  else url.searchParams.set('max', state.max);
  if (state.colors.length) url.searchParams.set('color', state.colors.join(','));
  else url.searchParams.delete('color');
  if (destination === 'all' && state.types.length) url.searchParams.set('type', state.types.join(','));
  else url.searchParams.delete('type');
  if (url.pathname !== location.pathname) {
    location.assign(url.href);
    return true;
  }
  history[mode === 'replace' ? 'replaceState' : 'pushState'](null, '', url);
  return false;
}

function syncForm(form) {
  form.querySelectorAll('[data-filter-color]').forEach(input => { input.checked = state.colors.includes(input.value); });
  form.querySelectorAll('[data-filter-type]').forEach(input => { input.checked = state.types.includes(input.value); });
  syncPriceFields(form, state.min, state.max);
  syncSelectedColors(form);
}

function syncSelectedColors(form) {
  const output = form.querySelector('[data-selected-colors]');
  if (!output) return;
  const selected = [...form.querySelectorAll('[data-filter-color]:checked')].map(input => colorNames.get(input.value));
  output.hidden = selected.length === 0;
  output.textContent = selected.join(', ');
}

function syncPriceFields(form, min, max) {
  form.querySelector('[data-price-min]').value = min;
  form.querySelector('[data-price-max]').value = max;
  form.querySelector('[data-price-min-number]').value = min;
  form.querySelector('[data-price-max-number]').value = max;
  const fill = form.querySelector('[data-price-fill]');
  fill.style.left = `${min / MAX_PRICE * 100}%`;
  fill.style.right = `${100 - max / MAX_PRICE * 100}%`;
}

function handlePriceInput(form, target) {
  const low = target.matches('[data-price-min], [data-price-min-number]');
  const min = clamp(form.querySelector('[data-price-min]').value, 0, MAX_PRICE);
  const max = clamp(form.querySelector('[data-price-max]').value, 0, MAX_PRICE);
  const next = clamp(target.value, 0, MAX_PRICE);
  syncPriceFields(form, low ? Math.min(next, max) : min, low ? max : Math.max(next, min));
}

function syncControls() {
  select.value = state.sort;
  syncForm(desktopForm);
  syncForm(mobileForm);
  const activeCount = state.colors.length + (sameTypes(state.types, defaultTypes) ? 0 : state.types.length) + Number(state.min > 0 || state.max < MAX_PRICE);
  document.querySelectorAll('[data-filter-count]').forEach(badge => {
    badge.hidden = activeCount === 0;
    badge.textContent = activeCount;
  });
  document.querySelectorAll('[data-clear-filters]').forEach(button => {
    if (!button.closest('dialog')) button.hidden = activeCount === 0;
  });
  document.querySelectorAll('[data-sort-value]').forEach(button => button.setAttribute('aria-current', String(button.dataset.sortValue === state.sort)));
  const sortName = select.selectedOptions[0].textContent;
  document.querySelector('[data-open-sort]')?.setAttribute('aria-label', `Sort products. Current order: ${sortName}`);
}

function matchesPrice(card) {
  const price = card.dataset.price === '' ? null : Number(card.dataset.price);
  if (state.min === 0 && state.max === MAX_PRICE) return true;
  return price !== null && price >= state.min && price <= state.max;
}

function renderActiveFilters() {
  const filters = [];
  state.colors.forEach(color => filters.push({ key: 'color', value: color, label: colorNames.get(color) }));
  if (!sameTypes(state.types, defaultTypes)) state.types.forEach(type => filters.push({ key: 'type', value: type, label: typeNames.get(type) }));
  if (state.min > 0 || state.max < MAX_PRICE) filters.push({ key: 'price', value: '', label: `${formatPrice(state.min)}–${formatPrice(state.max)}` });
  activeFilters.hidden = filters.length === 0;
  activeFilters.innerHTML = filters.map(filter => `<button class="collection-filter-chip" type="button" data-remove-filter="${filter.key}" data-filter-value="${filter.value}" aria-label="Remove ${filter.label} filter"><span>${filter.label}</span>${closeIcon}</button>`).join('') + (filters.length > 1 ? '<button class="collection-active-filters__clear" type="button" data-clear-active>Clear all</button>' : '');
}

function syncCategoryLinks() {
  categoryNav.querySelectorAll('a').forEach(link => {
    const url = new URL(link.href);
    if (state.sort === 'featured') url.searchParams.delete('sort');
    else url.searchParams.set('sort', state.sort);
    link.href = url.pathname + url.search;
  });
}

function renderProducts(announce = false) {
  const cards = originalCards.map((card, index) => ({
    card,
    index,
    price: card.dataset.price === '' ? null : Number(card.dataset.price),
    visible: matchesPrice(card)
      && (!state.types.length || state.types.some(type => card.dataset.categories.split(',').includes(type)))
      && (!state.colors.length || state.colors.some(color => card.dataset.colors.split(',').includes(color))),
  }));
  cards.sort((a, b) => {
    if (state.sort === 'name') return a.card.querySelector('h2').textContent.localeCompare(b.card.querySelector('h2').textContent, 'en');
    if (state.sort === 'name-desc') return b.card.querySelector('h2').textContent.localeCompare(a.card.querySelector('h2').textContent, 'en');
    if (state.sort === 'best-selling') {
      const rank = card => { const position = bestSellers.indexOf(card.dataset.product); return position < 0 ? bestSellers.length : position; };
      return rank(a.card) - rank(b.card) || a.index - b.index;
    }
    if (state.sort.startsWith('price-')) {
      if (a.price === null || b.price === null) return Number(a.price === null) - Number(b.price === null) || a.index - b.index;
      return (state.sort === 'price-asc' ? a.price - b.price : b.price - a.price) || a.index - b.index;
    }
    return a.index - b.index;
  });
  cards.forEach(item => { item.card.hidden = !item.visible; });
  grid.append(...cards.map(item => item.card));
  const visible = cards.filter(item => item.visible).length;
  count.textContent = `${visible} ${visible === 1 ? 'product' : 'products'}${announce ? ' shown' : ''}`;
  grid.hidden = visible === 0;
  empty.hidden = visible !== 0;
  renderActiveFilters();
  syncControls();
  syncCategoryLinks();
}

function applyState(nextState, { historyMode = 'push', announce = true } = {}) {
  state = { ...state, ...nextState };
  if (updateUrl(historyMode)) return;
  renderProducts(announce);
}

function stateFromForm(form) {
  return {
    min: Number(form.querySelector('[data-price-min]').value),
    max: Number(form.querySelector('[data-price-max]').value),
    colors: [...form.querySelectorAll('[data-filter-color]:checked')].map(input => input.value),
    types: [...form.querySelectorAll('[data-filter-type]:checked')].map(input => input.value),
  };
}

function resetFilters({ draft = false } = {}) {
  if (draft) {
    mobileForm.querySelectorAll('[data-filter-color]').forEach(input => { input.checked = false; });
    mobileForm.querySelectorAll('[data-filter-type]').forEach(input => { input.checked = defaultTypes.includes(input.value); });
    syncPriceFields(mobileForm, 0, MAX_PRICE);
    syncSelectedColors(mobileForm);
    return;
  }
  applyState({ min: 0, max: MAX_PRICE, colors: [], types: [...defaultTypes] });
}

on(select, 'change', () => applyState({ sort: select.value }));
for (const form of [desktopForm, mobileForm]) {
  on(form, 'input', event => { if (event.target.matches('[data-price-min], [data-price-max], [data-price-min-number], [data-price-max-number]')) handlePriceInput(form, event.target); });
  on(form, 'change', event => { if (event.target.matches('[data-filter-color]')) syncSelectedColors(form); });
}
on(desktopForm, 'change', () => applyState(stateFromForm(desktopForm)));
on(document.querySelector('[data-open-filter]'), 'click', () => { syncForm(mobileForm); filterSheet.showModal(); });
on(document.querySelector('[data-open-sort]'), 'click', () => sortSheet.showModal());
document.querySelectorAll('[data-close-sheet]').forEach(button => on(button, 'click', () => button.closest('dialog').close()));
[filterSheet, sortSheet].forEach(dialog => on(dialog, 'click', event => { if (event.target === dialog) dialog.close(); }));
on(document.querySelector('[data-apply-filters]'), 'click', () => {
  applyState(stateFromForm(mobileForm));
  filterSheet.close();
});
document.querySelectorAll('[data-clear-filters]').forEach(button => on(button, 'click', () => resetFilters({ draft: Boolean(button.closest('[data-filter-sheet]')) })));
on(activeFilters, 'click', event => {
  const remove = event.target.closest('[data-remove-filter]');
  if (remove) {
    const key = remove.dataset.removeFilter;
    const value = remove.dataset.filterValue;
    if (key === 'price') applyState({ min: 0, max: MAX_PRICE });
    if (key === 'color') applyState({ colors: state.colors.filter(color => color !== value) });
    if (key === 'type') applyState({ types: state.types.filter(type => type !== value) });
  }
  if (event.target.closest('[data-clear-active]')) resetFilters();
});
document.querySelectorAll('[data-sort-value]').forEach(button => on(button, 'click', () => {
  applyState({ sort: button.dataset.sortValue });
  sortSheet.close();
}));
on(window, 'popstate', () => { state = stateFromUrl(); renderProducts(true); });
on(window, 'pageshow', () => { state = stateFromUrl(); renderProducts(); });

if (consultationChoice) {
  const buttons = [...consultationChoice.querySelectorAll('[data-collection-consultation-mode]')];
  const note = consultationChoice.querySelector('[data-collection-consultation-note]');
  const cta = consultationChoice.querySelector('[data-collection-consultation-cta]');
  buttons.forEach(button => on(button, 'click', () => {
    const online = button.dataset.collectionConsultationMode === 'Online';
    buttons.forEach(option => option.setAttribute('aria-pressed', String(option === button)));
    note.querySelector('strong').textContent = online ? 'Online' : 'In-person';
    note.querySelector('span').textContent = online ? 'Meet from anywhere.' : 'At our Khar West studio, Mumbai.';
    cta.textContent = online ? 'Book an online consultation' : 'Book an offline consultation';
    cta.href = `/consultation.html?meeting=${encodeURIComponent(button.dataset.collectionConsultationMode)}#booking`;
  }));
}

filterPanel.hidden = false;
document.querySelector('[data-collection-sort]').hidden = false;
document.querySelector('[data-open-filter]').hidden = false;
document.querySelector('[data-open-sort]').hidden = false;

const activeCategory = categoryNav.querySelector('[aria-current="page"]');
if (activeCategory) categoryNav.scrollLeft = Math.max(0, activeCategory.offsetLeft - categoryNav.offsetLeft - 12);
renderProducts();

if (import.meta.hot) import.meta.hot.dispose(() => abort.abort());
