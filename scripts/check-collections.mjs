import { chromium, expect } from '@playwright/test';
import assert from 'node:assert/strict';
import { mkdir, writeFile } from 'node:fs/promises';
import { collectionIds, getCollection } from '../src/collections/collection-data.js';
import { categories } from '../src/sections/catalogue-data.js';

const base = process.env.BASE_URL ?? 'http://127.0.0.1:5173';
const output = 'preview/collections-qa';
await mkdir(output, { recursive: true });
const browser = await chromium.launch({ channel: 'chrome', headless: true });
const errors = [];
const report = [];
function track(page) {
  page.on('pageerror', error => errors.push(error.message));
  page.on('response', response => { if (response.url().startsWith(base) && response.status() >= 400) errors.push(`${response.status()} ${response.url()}`); });
}
async function noOverflow(page, label) {
  assert(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1), `${label}: horizontal page overflow`);
}
async function capture(page, path, locator, loadAll = Boolean(locator)) {
  if (loadAll) {
    for (const image of await (locator ?? page).locator('img').all()) await image.scrollIntoViewIfNeeded();
    await expect.poll(() => (locator ?? page).locator('img').evaluateAll(images => images.every(image => image.complete && image.naturalWidth > 0)), { timeout: 20000 }).toBe(true);
  }
  await expect.poll(() => page.locator('img').evaluateAll(images => images.filter(image => {
    const box = image.getBoundingClientRect();
    return box.bottom > 0 && box.top < innerHeight && box.right > 0 && box.left < innerWidth;
  }).every(image => image.complete && image.naturalWidth > 0))).toBe(true);
  await page.locator('.solutions-tabs').evaluateAll(lists => lists.forEach(list => { list.scrollLeft = 0; }));
  await page.evaluate(() => document.fonts.ready);
  await (locator ?? page).screenshot({ path });
}
async function collectionContents(page, id) {
  const expected = getCollection(id);
  await expect(page.locator('h1')).toHaveText(expected.name);
  await expect(page.getByText('The Alchemane collection', { exact: true })).toHaveCount(0);
  await expect(page.getByText('Stock status unavailable', { exact: true })).toHaveCount(0);
  await expect(page.getByText('Find your match, with a little help.', { exact: true })).toHaveCount(0);
  await expect(page.locator('.collection-consult-offer h2')).toHaveText('Prefer a consultation before you buy?');
  await expect(page.locator('.site-footer .footer-nav-column')).toHaveCount(2);
  await expect(page.locator('.site-footer .footer-contact-column')).toHaveCount(1);
  await expect(page.locator('.collection-product')).toHaveCount(expected.products.length);
  assert.deepEqual(await page.locator('.collection-product').evaluateAll(cards => cards.map(card => card.dataset.product).sort()), expected.products.map(product => product.handle).sort());
  await expect(page.locator('[data-category-nav] a')).toHaveCount(7);
  await expect(page.locator('[data-filter-form="mobile"] [data-filter-type]')).toHaveCount(6);
  await expect.poll(() => page.locator('.collection-product img[loading="eager"]').evaluateAll(images => images.every(img => img.complete && img.naturalWidth > 0))).toBe(true);
  if (id !== 'extensions') await expect(page.locator('[data-category-nav] [aria-current="page"]')).toHaveAttribute('href', new RegExp(`/collections/${id}/`));
  const badImages = await page.locator('.collection-product img').evaluateAll(images => images.filter(image => image.complete && image.naturalWidth === 0).map(image => image.src));
  assert.deepEqual(badImages, []);
}
try {
  // The original circular tabs filter the homepage grid; square cards open collections.
  const mobile = await browser.newPage({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true });
  track(mobile);
  await mobile.addInitScript(() => {
    const show = HTMLDialogElement.prototype.showModal;
    HTMLDialogElement.prototype.showModal = function () { if (!this.classList.contains('offer-dialog')) show.call(this); };
  });
  await mobile.goto(base, { waitUntil: 'networkidle' });
  await mobile.locator('.hero-actions .scroll-cue').click();
  await expect.poll(() => mobile.locator('#collection').evaluate(node => Math.abs(node.getBoundingClientRect().top))).toBeLessThan(5);
  await expect.poll(() => mobile.locator('.hero-scene').evaluate(node => getComputedStyle(node).visibility)).toBe('hidden');
  await expect(mobile.locator('#collection .solutions-tab')).toHaveCount(6);
  await expect(mobile.locator('#collection .solution-card')).toHaveCount(0);
  await expect(mobile.locator('#range-title')).toHaveText('Hairline Series');
  await expect(mobile.locator('.solutions-tab[data-solution="hairline-series"]')).toHaveAttribute('aria-selected', 'true');
  await capture(mobile, `${output}/circles-390.png`, undefined, false);
  await mobile.locator('.solutions-tab[data-solution="toppers"]').tap();
  await expect(mobile).toHaveURL(/\?category=toppers$/);
  await expect(mobile.locator('.solutions-tab[data-solution="toppers"]')).toHaveAttribute('aria-selected', 'true');
  await expect(mobile.locator('#range-title')).toHaveText('Hair Toppers');
  assert.deepEqual(await mobile.locator('.catalogue-card:not([hidden])').evaluateAll(cards => cards.map(card => card.dataset.handle)), getCollection('toppers').products.slice(0, 4).map(product => product.handle));
  await mobile.locator('.solutions-tab[data-solution="toppers"]').focus();
  await mobile.keyboard.press('ArrowRight');
  await expect(mobile.locator('.solutions-tab[data-solution="permanent-extensions"]')).toHaveAttribute('aria-selected', 'true');
  await expect(mobile.locator('#range-title')).toHaveText('Permanent Extensions');
  await expect(mobile.locator('.best-sellers')).toBeVisible();
  await expect(mobile.locator('.solution-card')).toHaveCount(6);
  await mobile.locator('#explore-collections').scrollIntoViewIfNeeded();
  for (const card of await mobile.locator('.solution-card').all()) await expect(card).toBeInViewport();
  await capture(mobile, `${output}/homepage-390.png`, mobile.locator('#explore-collections'));
  await mobile.locator('.solution-card[href="/collections/toppers/"]').tap();
  await expect(mobile).toHaveURL(`${base}/collections/toppers/`);
  await collectionContents(mobile, 'toppers');
  await mobile.goBack({ waitUntil: 'networkidle' });
  await expect(mobile.locator('#collection .solutions-tab')).toHaveCount(6);
  await expect(mobile).toHaveURL(/#explore-collections$/);
  await expect(mobile.locator('.solutions-tab[data-solution="permanent-extensions"]')).toHaveAttribute('aria-selected', 'true');
  await mobile.locator('.solution-card[href="/collections/toppers/"]').tap();
  await collectionContents(mobile, 'toppers');
  await capture(mobile, `${output}/toppers-390.png`);

  // The compact category rail keeps every collection reachable without returning home.
  const rail = mobile.locator('[data-category-nav]');
  await rail.getByRole('link', { name: 'Fringes', exact: true }).click();
  await collectionContents(mobile, 'fringes');
  await mobile.getByRole('button', { name: /Sort products/ }).click();
  await mobile.locator('[data-sort-value="price-asc"]').click();
  await expect(mobile).toHaveURL(/sort=price-asc/);
  const prices = await mobile.locator('.collection-product').evaluateAll(cards => cards.map(card => card.dataset.price === '' ? null : Number(card.dataset.price)));
  const known = prices.filter(price => price !== null);
  assert.deepEqual(known, [...known].sort((a, b) => a - b));
  assert(prices.slice(known.length).every(price => price === null), 'Unpriced products follow known prices');
  await rail.getByRole('link', { name: 'Wigs', exact: true }).click();
  await expect(mobile).toHaveURL(/\/collections\/wigs\/\?sort=price-asc/);
  await collectionContents(mobile, 'wigs');
  await mobile.goBack({ waitUntil: 'networkidle' });
  await expect(mobile.locator('#collection-sort')).toHaveValue('price-asc');
  await mobile.getByRole('button', { name: /Sort products/ }).click();
  await mobile.locator('[data-sort-value="name"]').click();
  const names = await mobile.locator('.collection-product h2').allTextContents();
  assert.deepEqual(names, [...names].sort((a, b) => a.localeCompare(b, 'en')));
  await mobile.goBack();
  await expect(mobile.locator('#collection-sort')).toHaveValue('price-asc');
  await mobile.getByRole('button', { name: 'Filter', exact: true }).click();
  await expect(mobile.locator('[data-filter-sheet]')).toBeVisible();
  await expect(mobile.locator('[data-filter-form="mobile"] .collection-color-option')).toHaveCount(4);
  await expect(mobile.locator('[data-filter-form="mobile"] .collection-type-option')).toHaveCount(6);
  await expect(mobile.locator('[data-filter-form="mobile"] [data-filter-type][value="fringes"]')).toBeChecked();
  await expect(mobile.locator('[data-filter-form="mobile"] .collection-switch input')).toBeDisabled();
  await capture(mobile, `${output}/filter-sheet-390.png`, undefined, false);
  await mobile.locator('[data-filter-form="mobile"] [data-price-max-number]').fill('4000');
  await mobile.locator('[data-apply-filters]').click();
  await expect(mobile).toHaveURL(/max=4000/);
  await expect(mobile.locator('[data-filter-chip], [data-remove-filter="price"]')).toHaveCount(1);
  const lowPrices = await mobile.locator('.collection-product:visible').evaluateAll(cards => cards.map(card => Number(card.dataset.price)));
  assert(lowPrices.length > 0 && lowPrices.every(price => price < 5000), 'Mobile price filter shows matching products');
  await mobile.goBack();
  await expect(mobile.locator('[data-remove-filter="price"]')).toHaveCount(0);
  await mobile.goto(`${base}/collections/all/`, { waitUntil: 'networkidle' });
  await mobile.getByRole('button', { name: 'Filter', exact: true }).click();
  await expect(mobile.locator('[data-filter-form="mobile"] .collection-color-option')).toHaveCount(4);
  await capture(mobile, `${output}/filter-shop-390.png`, undefined, false);
  await mobile.locator('[data-filter-form="mobile"] [data-price-min]').focus();
  await mobile.keyboard.press('ArrowRight');
  await expect(mobile.locator('[data-filter-form="mobile"] [data-price-min-number]')).toHaveValue('500');
  await mobile.locator('[data-filter-sheet] [data-clear-filters]').click();
  await expect(mobile.locator('[data-filter-form="mobile"] [data-price-min-number]')).toHaveValue('0');
  await mobile.locator('[data-filter-form="mobile"] [data-filter-color][value="dark-brown"]').check();
  await expect(mobile.locator('[data-filter-form="mobile"] [data-selected-colors]')).toHaveText('Dark Brown');
  await mobile.locator('[data-filter-form="mobile"] [data-filter-type][value="toppers"]').check();
  await mobile.locator('[data-apply-filters]').click();
  await expect(mobile).toHaveURL(/\/collections\/toppers\/\?color=dark-brown/);
  await expect(mobile.locator('[data-remove-filter="color"]')).toBeVisible();
  assert((await mobile.locator('.collection-product:visible').count()) > 0, 'Verified color and type filters have results');
  assert(await mobile.locator('.collection-product:visible').evaluateAll(cards => cards.every(card => card.dataset.category === 'toppers' && card.dataset.colors.split(',').includes('dark-brown'))));
  await mobile.locator('[data-remove-filter="color"]').click();
  await expect(mobile.locator('[data-remove-filter="color"]')).toHaveCount(0);
  await mobile.getByRole('button', { name: 'Filter', exact: true }).click();
  await expect(mobile.locator('[data-filter-form="mobile"] [data-filter-type][value="toppers"]')).toBeChecked();
  await mobile.locator('[data-filter-form="mobile"] [data-filter-type][value="clip-extensions"]').check();
  await mobile.locator('[data-apply-filters]').click();
  await expect(mobile).toHaveURL(/\/collections\/all\/\?type=toppers%2Cclip-extensions/);
  await expect(mobile.locator('[data-remove-filter="type"]')).toHaveCount(2);
  assert(await mobile.locator('.collection-product:visible').evaluateAll(cards => cards.length > 8 && cards.every(card => ['toppers', 'clip-extensions'].includes(card.dataset.category))), 'Selecting another type broadens the results across collections');
  await mobile.locator('[data-remove-filter="type"][data-filter-value="toppers"]').click();
  await expect(mobile).toHaveURL(/\/collections\/clip-extensions\/$/);
  await expect(mobile.locator('.collection-product:visible')).toHaveCount(getCollection('clip-extensions').products.length);
  await mobile.getByRole('button', { name: /Sort products/ }).click();
  await mobile.locator('[data-sort-value="price-desc"]').click();
  await mobile.getByRole('button', { name: 'Filter', exact: true }).click();
  await mobile.locator('[data-filter-form="mobile"] [data-price-min-number]').fill('1000');
  await mobile.locator('[data-filter-form="mobile"] [data-filter-type][value="clip-extensions"]').uncheck();
  await mobile.locator('[data-filter-form="mobile"] [data-filter-type][value="wigs"]').check();
  await mobile.locator('[data-apply-filters]').click();
  await expect(mobile).toHaveURL(/\/collections\/wigs\/\?sort=price-desc&min=1000$/);
  await collectionContents(mobile, 'wigs');
  await expect(mobile.locator('.collection-product:visible')).toHaveCount(1);
  await mobile.goBack({ waitUntil: 'networkidle' });
  await expect(mobile.locator('[data-filter-form="mobile"] [data-filter-type][value="clip-extensions"]')).toBeChecked();
  await mobile.goto(`${base}/collections/all/`, { waitUntil: 'networkidle' });
  await mobile.getByRole('button', { name: /Sort products/ }).click();
  await capture(mobile, `${output}/sort-sheet-390.png`, undefined, false);
  await mobile.locator('[data-sort-value="name-desc"]').click();
  const reversed = await mobile.locator('.collection-product h2').allTextContents();
  assert.deepEqual(reversed, [...reversed].sort((a, b) => b.localeCompare(a, 'en')));
  await noOverflow(mobile, 'mobile interaction');
  await mobile.close();

  for (const [width, height] of [[320, 740], [375, 812], [390, 844], [430, 932], [640, 900], [700, 900], [768, 1024], [1000, 900], [1024, 900], [1440, 1000], [1920, 1080], [844, 390]]) {
    const page = await browser.newPage({ viewport: { width, height }, isMobile: width < 701, hasTouch: width < 1001 });
    track(page);
    await page.addInitScript(() => {
      const show = HTMLDialogElement.prototype.showModal;
      HTMLDialogElement.prototype.showModal = function () { if (!this.classList.contains('offer-dialog')) show.call(this); };
    });
    await page.goto(`${base}/#collection`, { waitUntil: 'networkidle' });
    await expect.poll(() => page.locator('#collection').evaluate(node => Math.abs(node.getBoundingClientRect().top)), { timeout: 10000 }).toBeLessThan(5);
    if (height >= 520) await expect.poll(() => page.locator('.hero-scene').evaluate(node => getComputedStyle(node).visibility), { timeout: 10000 }).toBe('hidden');
    await page.evaluate(() => document.fonts.ready);
    await expect(page.locator('#collection .solutions-tab')).toHaveCount(6);
    assert(await page.locator('#collection .solutions-tab').evaluateAll(tabs => tabs.every(tab => tab.getAttribute('role') === 'tab' && tab.getAttribute('aria-controls') === 'range')));
    await expect(page.locator('#range-title')).toHaveText('Hairline Series');
    assert(await page.locator('.catalogue-card:not([hidden])').count() > 0);
    assert(await page.locator('.best-sellers').evaluate(section => section.compareDocumentPosition(document.querySelector('#explore-collections')) & Node.DOCUMENT_POSITION_FOLLOWING));
    const boxes = await page.locator('.solution-card').evaluateAll(cards => cards.map(card => card.getBoundingClientRect().toJSON()));
    assert.equal(boxes.length, 6);
    const columns = boxes.filter(box => Math.abs(box.top - boxes[0].top) < 2).length;
    const rows = new Set(boxes.map(box => Math.round(box.top))).size;
    assert.equal(columns, width <= 700 ? 2 : width <= 1000 ? 3 : 6, `${width}: category columns`);
    assert.equal(rows, width <= 700 ? 3 : width <= 1000 ? 2 : 1, `${width}: category rows`);
    assert(boxes.every(box => box.width >= 44 && box.height >= 44));
    await expect(page.locator('.solution-discovery__heading p')).toHaveCount(0);
    if (width <= 700) {
      assert(await page.locator('.solution-card__label').evaluateAll(labels => labels.every(label => parseFloat(getComputedStyle(label).fontSize) >= 16)), `${width}: category labels are too small`);
    }
    if (width >= 1000) {
      await expect(page.locator('.product-videos-intro h2')).toHaveText('Hair solutions in action');
      await expect(page.locator('.product-videos-intro p')).toHaveCount(0);
    }
    await page.locator('#explore-collections').scrollIntoViewIfNeeded();
    for (const image of await page.locator('.solution-card img').all()) await image.scrollIntoViewIfNeeded();
    await expect.poll(() => page.locator('.solution-card img').evaluateAll(images => images.every(img => img.complete && img.naturalWidth > 0)), { timeout: 20000 }).toBe(true);
    await noOverflow(page, `homepage ${width}`);
    if ([320, 768, 1440].includes(width)) {
      await capture(page, `${output}/homepage-${width}.png`, page.locator('#explore-collections'));
    }
    if (width === 1440) {
      await page.goto(base, { waitUntil: 'networkidle' });
      await page.locator('.hero-actions .scroll-cue').click();
      await expect.poll(() => page.locator('#collection').evaluate(node => Math.abs(node.getBoundingClientRect().top))).toBeLessThan(5);
      await expect(page.locator('#collection')).not.toHaveAttribute('inert', '');
      await expect.poll(() => page.evaluate(() => document.documentElement.classList.contains('mobile-reveal-complete'))).toBe(true);
      await capture(page, `${output}/circles-1440.png`, undefined, false);
    }
    await page.goto(`${base}/collections/all/`, { waitUntil: 'networkidle' });
    await collectionContents(page, 'all');
    if (width === 390) {
      const offer = page.locator('.collection-consult-offer');
      await offer.getByRole('button', { name: 'Online' }).click();
      await expect(offer.getByRole('button', { name: 'Online' })).toHaveAttribute('aria-pressed', 'true');
      await expect(offer.locator('[data-collection-consultation-note]')).toContainText('Meet from anywhere.');
      await offer.getByRole('link', { name: 'Book an online consultation' }).click();
      await expect(page).toHaveURL(/\/consultation\.html\?meeting=Online#booking$/);
      await expect(page.locator('#consultation-booking-form [data-meet-option="Online"]')).toHaveAttribute('aria-pressed', 'true');
      await page.goBack({ waitUntil: 'networkidle' });
      await expect(page).toHaveURL(`${base}/collections/all/`);
    }
    await noOverflow(page, `collection ${width}`);
    const gridColumns = await page.locator('.collection-product-grid').evaluate(node => getComputedStyle(node).gridTemplateColumns.split(' ').length);
    assert.equal(gridColumns, width <= 700 ? 2 : 3, `${width}: product columns`);
    if ([320, 390, 768, 1440].includes(width)) await capture(page, `${output}/collection-${width}.png`);
    if ([390, 1440].includes(width)) {
      await capture(page, `${output}/consultation-offer-${width}.png`, page.locator('.collection-consult-offer'));
      await capture(page, `${output}/shop-footer-${width}.png`, page.locator('.site-footer'));
    }
    if (width === 320 || height === 390) {
      await page.getByRole('button', { name: 'Filter', exact: true }).click();
      await expect(page.locator('[data-filter-form="mobile"] [data-filter-type]')).toHaveCount(6);
      await page.locator('[data-filter-form="mobile"] .collection-availability').scrollIntoViewIfNeeded();
      await expect(page.locator('[data-apply-filters]')).toBeInViewport();
      await expect(page.locator('[data-filter-form="mobile"] .collection-switch')).toBeInViewport();
      await noOverflow(page, `filter sheet ${width}x${height}`);
      if (width === 320) await capture(page, `${output}/filter-footer-320.png`, undefined, false);
      await page.keyboard.press('Escape');
    }
    if (width === 1440) {
      await page.locator('[data-filter-form="desktop"] [data-price-max-number]').fill('4000');
      await page.locator('[data-filter-form="desktop"] [data-price-max-number]').blur();
      await expect(page).toHaveURL(/max=4000/);
      assert(await page.locator('.collection-product:visible').evaluateAll(cards => cards.length > 0 && cards.every(card => Number(card.dataset.price) < 5000)), 'Desktop price filter shows matching products');
      await page.locator('[data-filter-panel] [data-clear-filters]').click();
      await expect(page.locator('.collection-product:visible')).toHaveCount(getCollection('all').products.length);
      await page.locator('#collection-sort').selectOption('best-selling');
      await expect(page.locator('.collection-product').first()).toHaveAttribute('data-product', 'hairline-toppers');
    }
    if (width === 390) {
      await page.locator('.collection-product').nth(8).scrollIntoViewIfNeeded();
      const stickyTop = await page.locator('[data-collection-toolbar]').evaluate(node => node.getBoundingClientRect().top);
      assert(Math.abs(stickyTop) < 2, 'Filter and sort controls stay reachable while browsing');
      await capture(page, `${output}/sticky-mobile.png`);
    }
    report.push({ width, height, status: 'passed' });
    console.log(`Responsive collection checks passed: ${width} x ${height}`);
    await page.close();
  }
  // Every collection is a real, independently loadable, statically rendered page.
  const staticContext = await browser.newContext({ javaScriptEnabled: false, viewport: { width: 390, height: 844 } });
  const staticPage = await staticContext.newPage();
  track(staticPage);
  for (const id of collectionIds) {
    const response = await staticPage.goto(`${base}/collections/${id}/`, { waitUntil: 'load' });
    assert.equal(response.status(), 200);
    await collectionContents(staticPage, id);
    await noOverflow(staticPage, `static ${id}`);
  }
  await expect(staticPage.locator('[data-collection-sort]')).toBeHidden();
  await staticContext.close();

  const accessible = await browser.newPage({ viewport: { width: 390, height: 844 }, reducedMotion: 'reduce' });
  track(accessible);
  await accessible.goto(`${base}/collections/toppers/`, { waitUntil: 'networkidle' });
  await accessible.keyboard.press('Tab');
  await expect(accessible.getByRole('link', { name: 'Skip to products' })).toBeFocused();
  await accessible.keyboard.press('Enter');
  await expect(accessible.locator('#collection-products')).toBeFocused();
  await accessible.keyboard.press('Tab');
  await expect(accessible.locator('[data-open-filter]')).toBeFocused();
  await accessible.keyboard.press('Tab');
  await expect(accessible.locator('[data-open-sort]')).toBeFocused();
  await accessible.keyboard.press('Tab');
  await expect(accessible.locator('.collection-product__link').first()).toBeFocused();
  const focusBounds = await accessible.locator('.collection-product__link').first().boundingBox();
  const barBottom = await accessible.locator('[data-collection-toolbar]').evaluate(node => node.getBoundingClientRect().bottom);
  assert(focusBounds.y >= barBottom, 'Sticky discovery toolbar must not obscure the focused product');
  await accessible.getByRole('button', { name: 'Shop', exact: true }).click();
  await expect(accessible.locator('#shop-navigation')).toBeVisible();
  await accessible.keyboard.press('Escape');
  await expect(accessible.locator('#shop-navigation')).toBeHidden();
  await accessible.goto(`${base}/?category=wigs#range`, { waitUntil: 'networkidle' });
  await expect(accessible.locator('#range-title')).toHaveText('Wigs');
  await expect(accessible.locator('.solutions-tab[data-solution="wigs"]')).toHaveAttribute('aria-selected', 'true');
  assert.deepEqual(errors, []);
  await writeFile(`${output}/report.json`, JSON.stringify({ report, collections: collectionIds, errors, checks: ['homepage circular tabs and product filtering', 'square-card collection journey', 'browser Back', 'sort and URL preservation', 'sticky navigation', 'no-JS collection products and links', 'keyboard and reduced motion', 'homepage category deep link'] }, null, 2));
  console.log(`All collection checks passed: ${categories.length} homepage tabs, ${collectionIds.length} static collections, sorting, Back navigation, keyboard and reduced motion.`);
} finally { await browser.close(); }
