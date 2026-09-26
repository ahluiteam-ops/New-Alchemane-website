import { chromium, expect } from '@playwright/test';
import assert from 'node:assert/strict';
import { mkdir, writeFile, readFile } from 'node:fs/promises';
import { products } from '../src/sections/catalogue-products.js';
import { productBelongsToCategory } from '../src/sections/catalogue-data.js';

const BASE = process.env.BASE_URL ?? 'http://127.0.0.1:5173';
const browser = await chromium.launch({ channel: 'chrome', headless: true });
const page = await browser.newPage({ viewport: { width: 1440, height: 1000 } });
const errors = [];
page.on('pageerror', error => errors.push(error.message));
page.on('response', response => { if (response.status() >= 400 && response.url().startsWith(BASE)) errors.push(`${response.status()} ${response.url()}`); });
await mkdir('preview/discovery-qa', { recursive: true });
try {
  const live = JSON.parse(await readFile('docs/live-products-2026-09-21.json', 'utf8')).products;
  assert.equal(products.length, 42);
  assert.equal(new Set(products.map(p => p.handle)).size, 42);
  for (const p of products.filter(p => !p.isNew)) {
    const source = live.find(item => item.handle === p.handle);
    assert.equal(p.name, source.title);
    assert.equal(p.price, Math.min(...source.variants.map(v => Number(v.price))));
  }
  assert.equal(products.filter(p => p.isNew && p.image === null && p.price === null && p.url === null).length, 21);
  await page.goto(BASE, { waitUntil: 'networkidle' });
  await expect(page.locator('.catalogue-card')).toHaveCount(42);
  await expect(page.locator('.catalogue-card:visible')).toHaveCount(8);
  await page.screenshot({ path: 'preview/discovery-qa/desktop-home.png' });
  await expect(page.locator('.hero-scene')).toBeVisible();
  assert.equal(await page.locator('html').evaluate(el => el.classList.contains('motion-enabled')), true);
  await page.getByRole('link', { name: 'Find your hair solution' }).click();
  await page.waitForTimeout(2800);
  await expect(page.locator('.collection-scene')).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Find your hair solution.' })).toBeVisible();
  await expect(page.locator('.collection-kicker')).toHaveText('Shop or book');
  await expect(page.locator('.collection-scene .category')).toHaveCount(0);
  await expect(page.locator('.collection-scene .discovery-category')).toHaveCount(6);
  await expect(page.getByText('What would you like to find?')).toHaveCount(0);
  await expect(page.getByText('Start here', { exact: true })).toHaveCount(0);
  await expect(page.getByText('New to hair pieces?', { exact: false })).toHaveCount(0);
  await page.locator('.collection-scene').screenshot({ path: 'preview/discovery-qa/desktop-cloud-reveal.png' });

  for (const [index, category] of ['toppers', 'permanent-extensions', 'clip-extensions', 'hairline-series', 'wigs', 'fringes'].entries()) {
    const link = page.locator(`.discovery [data-catalogue-category="${category}"]`);
    if (index === 0) await link.click();
    else await link.evaluate(element => element.click());
    await expect(page.locator(`[data-category="${category}"]`)).toHaveAttribute('aria-pressed', 'true');
    await expect(page.locator('[data-results-count]')).toContainText(`${products.filter(p => productBelongsToCategory(p, category)).length} products`);
  }
  await page.locator('[data-category="hairline-series"]').click();
  await expect(page.locator('.catalogue-card:visible')).toHaveCount(3);
  await expect(page.locator('.catalogue-card:visible img')).toHaveCount(0);
  await expect(page.locator('[data-handle="hairline-toppers"]:visible')).toHaveCount(1);
  await page.locator('[data-category="wigs"]').click();
  await page.locator('[data-category="fringes"]').click();
  await page.goBack();
  await expect(page.locator('[data-category="wigs"]')).toHaveAttribute('aria-pressed', 'true');
  await page.reload();
  await expect(page.locator('[data-category="wigs"]')).toHaveAttribute('aria-pressed', 'true');
  await page.locator('.catalogue-filters [data-category="all"]').click();
  await page.evaluate(() => scrollTo(0, 0));
  await page.waitForTimeout(1600);
  await expect(page.locator('.hero-scene')).toBeVisible();
  await expect(page.locator('#product-search')).toHaveCount(0);
  const brokenAnchors = await page.locator('a[href^="#"]').evaluateAll(links => links.map(l => l.getAttribute('href')).filter(h => h.length > 1 && !document.getElementById(h.slice(1))));
  assert.deepEqual(brokenAnchors, []);
  await expect(page.locator('.catalogue-card:visible')).toHaveCount(8);
  await page.locator('[data-show-more]').click();
  await expect(page.locator('.catalogue-card:visible')).toHaveCount(16);
  await page.locator('#product-sort').selectOption('price-low');
  await expect(page.locator('.catalogue-card:visible').first()).toHaveAttribute('data-handle', 'single-clip-on-hair-extensions');
  await page.locator('#product-sort').selectOption('price-high');
  await expect(page.locator('.catalogue-card:visible').first()).toHaveAttribute('data-handle', 'premium-wigs');
  await page.locator('#new-products').check();
  await expect(page.locator('[data-results-count]')).toContainText('21 products');
  await expect(page.locator('.catalogue-card:visible img')).toHaveCount(0);
  const enquiry = await page.locator('.catalogue-card:visible a').first().getAttribute('href');
  assert.ok(enquiry.startsWith('https://wa.me/919967123333?text='));
  assert.ok(decodeURIComponent(enquiry).includes('Diamond Net Fringes'));
  await page.locator('#range').screenshot({ path: 'preview/discovery-qa/desktop-new.png' });
  await page.locator('#new-products').uncheck();
  await page.locator('[data-category="wigs"]').click();
  await expect(page.locator('.catalogue-card:visible')).toHaveCount(4);
  await expect(page.locator('.catalogue-card:visible .catalogue-price')).toHaveCount(0);
  assert.deepEqual(await page.locator('.catalogue-card:visible .catalogue-product').evaluateAll(links => [...new Set(links.map(link => link.getAttribute('href')))]), ['#consultation']);
  await page.locator('[data-category="clip-extensions"]').click();
  await expect(page.locator('.catalogue-card:visible')).toHaveCount(8);
  await expect(page.locator('.catalogue-card:visible .catalogue-price')).toHaveCount(8);
  await page.locator('[data-category="permanent-extensions"]').click();
  await expect(page.locator('.catalogue-card:visible')).toHaveCount(6);
  await expect(page.locator('.catalogue-card:visible .catalogue-price')).toHaveCount(0);
  assert.deepEqual(await page.locator('.catalogue-card:visible .catalogue-product').evaluateAll(links => [...new Set(links.map(link => link.getAttribute('href')))]), ['#consultation']);
  await page.locator('.catalogue-filters [data-category="all"]').click();
  await page.locator('#range').screenshot({ path: 'preview/discovery-qa/desktop-catalogue.png' });

  // The animated reveal is a desktop enhancement. On phones, navigating to
  // the collection must land on a fully visible heading in normal flow.
  await page.setViewportSize({ width: 412, height: 800 });
  await page.goto(BASE, { waitUntil: 'networkidle' });
  assert.equal(await page.locator('html').evaluate(el => el.classList.contains('motion-enabled')), false);
  await page.getByRole('link', { name: 'Find your hair solution' }).click();
  await page.waitForTimeout(2800);
  const mobileHeadingBounds = await page.locator('#collection-title').evaluate(element => {
    const bounds = element.getBoundingClientRect();
    return { top: bounds.top, bottom: bounds.bottom, viewport: innerHeight };
  });
  assert.ok(mobileHeadingBounds.top >= 0, 'Collection heading is not cropped above the mobile viewport');
  assert.ok(mobileHeadingBounds.bottom <= mobileHeadingBounds.viewport, 'Collection heading fits inside the mobile viewport');
  await page.locator('.collection-scene-flow .discovery-category:last-child').scrollIntoViewIfNeeded();
  await page.waitForTimeout(100);
  await expect(page.locator('.floating-contact')).not.toHaveClass(/is-visible/);

  // Stories, FAQs and consultation still work. The product dialog has no trigger
  // on the page since "The everyday edit" was archived, so it is not exercised here.
  await page.getByRole('button', { name: 'Next story' }).click();
  await expect(page.locator('#story-person')).toHaveText('Ananya R.');
  await page.locator('.faq-list summary').first().click();
  await page.locator('.faq-list summary').nth(1).click();
  assert.equal(await page.locator('.faq-list details[open]').count(), 1);
  await page.getByLabel('Your name', { exact: true }).fill('Preview Visitor');
  await page.getByLabel('Phone number', { exact: true }).fill('9876543210');
  await page.getByLabel('Your city', { exact: true }).fill('Mumbai');
  await page.getByLabel('What do you need help with?').selectOption('Add hair volume');
  await page.getByRole('button', { name: 'Send my request' }).click();
  await expect(page.locator('.consultation-status')).toBeVisible();
  await page.getByLabel('Your city', { exact: true }).fill('Pune');
  await expect(page.locator('.consultation-status')).toBeHidden();

  const responsiveWidths = [320, 360, 375, 390, 412, 600, 768, 900, 1000, 1024, 1280, 1440];
  for (const width of responsiveWidths) {
    await page.setViewportSize({ width, height: 900 });
    await page.goto(BASE, { waitUntil: 'networkidle' });
    await page.screenshot({ path: `preview/discovery-qa/home-${width}.png` });
    assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), `No horizontal overflow at ${width}`);
    assert.equal(await page.locator('html').evaluate(el => el.classList.contains('motion-enabled')), width >= 1001, `Motion mode matches available layout width at ${width}`);
    const collectionBounds = await page.locator('#collection').evaluate(section => {
      const sectionBox = section.getBoundingClientRect();
      const headingBox = section.querySelector('#collection-title').getBoundingClientRect();
      const lastCardBox = section.querySelector('.discovery-category:last-child').getBoundingClientRect();
      return { sectionTop: sectionBox.top, sectionBottom: sectionBox.bottom, headingTop: headingBox.top, lastCardBottom: lastCardBox.bottom };
    });
    assert.ok(collectionBounds.headingTop >= collectionBounds.sectionTop - 1, `Collection heading stays inside its section at ${width}`);
    assert.ok(collectionBounds.lastCardBottom <= collectionBounds.sectionBottom + 1, `Last category card stays inside its section at ${width}`);
    await page.locator('[data-category="fringes"]').click();
    await expect(page.locator('[data-category="fringes"]')).toHaveAttribute('aria-pressed', 'true');
    await page.locator('#range').screenshot({ path: `preview/discovery-qa/fringes-${width}.png` });
    await page.locator('[data-show-more]').click();
    await expect(page.locator('.catalogue-card:visible')).toHaveCount(14);
    await expect(page.locator('[data-show-more]')).toBeHidden();
    const broken = await page.locator('.catalogue-card:visible img').evaluateAll(images => images.filter(i => i.complete && !i.naturalWidth).map(i => i.src));
    assert.deepEqual(broken, []);
  }
  for (const width of [320, 390, 600, 768, 900, 1024, 1440]) {
    await page.setViewportSize({ width, height: 900 });
    await page.goto(`${BASE}/extensions.html`, { waitUntil: 'networkidle' });
    assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), `Extensions page has no horizontal overflow at ${width}`);
    const headingBounds = await page.locator('h1').evaluate(element => {
      const bounds = element.getBoundingClientRect();
      return { left: bounds.left, right: bounds.right, viewport: innerWidth };
    });
    assert.ok(headingBounds.left >= 0 && headingBounds.right <= headingBounds.viewport, `Extensions heading fits at ${width}`);
    const broken = await page.locator('img').evaluateAll(images => images.filter(image => image.complete && !image.naturalWidth).map(image => image.src));
    assert.deepEqual(broken, []);
  }
  await page.setViewportSize({ width: 844, height: 390 });
  await page.goto(BASE, { waitUntil: 'networkidle' });
  assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), 'No horizontal overflow at 844x390 landscape');
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto(BASE, { waitUntil: 'networkidle' });
  await page.keyboard.press('Tab');
  await expect(page.locator('.skip-link')).toBeFocused();
  await page.keyboard.press('Enter');
  assert.ok(await page.locator('#range').evaluate(el => Math.abs(el.getBoundingClientRect().top) < 25));
  await expect(page.locator('.reveal-on-scroll').first()).toHaveCSS('opacity', '1');
  assert.deepEqual(errors, []);
  await writeFile('preview/discovery-qa/results.json', JSON.stringify({ passed: true, products: products.length, newProducts: 21, widths: [...responsiveWidths, '844x390'], checks: ['Restored collection title and six-category discovery', 'responsive collection containment and mobile heading visibility', 'shared Hairline Toppers category membership', 'live product names', 'search removal', 'category links and counts', 'extension and wig price removal', 'new placeholders and enquiries', 'sort and pagination', 'URL reload and back', 'retained interactions', 'keyboard skip link', 'reduced motion'], errors }, null, 2));
  console.log('Product discovery checks passed.');
} finally { await browser.close(); }
