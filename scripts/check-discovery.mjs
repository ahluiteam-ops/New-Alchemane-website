import { chromium, expect } from '@playwright/test';
import assert from 'node:assert/strict';
import { mkdir, writeFile, readFile } from 'node:fs/promises';
import { products } from '../src/sections/catalogue-products.js';

const BASE = process.env.BASE_URL ?? 'http://127.0.0.1:5173';
const browser = await chromium.launch({ channel: 'chrome', headless: true });
const page = await browser.newPage({ viewport: { width: 1440, height: 1000 } });
const errors = [];
page.on('pageerror', error => errors.push(error.message));
page.on('response', response => { if (response.status() >= 400 && response.url().startsWith(BASE)) errors.push(`${response.status()} ${response.url()}`); });
await mkdir('preview/discovery-qa', { recursive: true });
try {
  const live = JSON.parse(await readFile('docs/live-products-2026-09-21.json', 'utf8')).products;
  assert.equal(products.length, 40);
  assert.equal(new Set(products.map(p => p.handle)).size, 40);
  for (const p of products.filter(p => !p.isNew)) {
    const source = live.find(item => item.handle === p.handle);
    assert.equal(p.name, source.title);
    assert.equal(p.price, Math.min(...source.variants.map(v => Number(v.price))));
  }
  assert.equal(products.filter(p => p.isNew && p.image === null && p.price === null && p.url === null).length, 19);
  await page.goto(BASE, { waitUntil: 'networkidle' });
  await expect(page.locator('.catalogue-card')).toHaveCount(40);
  await expect(page.locator('.catalogue-card:visible')).toHaveCount(8);
  await page.screenshot({ path: 'preview/discovery-qa/desktop-home.png' });
  await expect(page.locator('.hero-scene')).toBeVisible();
  assert.equal(await page.locator('html').evaluate(el => el.classList.contains('motion-enabled')), true);
  await page.getByRole('link', { name: 'Shop the collection' }).click();
  await page.waitForTimeout(2800);
  await expect(page.locator('.collection-scene')).toBeVisible();
  await expect(page.getByRole('heading', { name: 'The Hairline Series.' })).toBeVisible();
  await expect(page.locator('.collection-kicker')).toHaveText('The Alchemane collection');
  await expect(page.locator('.collection-scene .category')).toHaveCount(0);
  await expect(page.locator('.collection-scene .discovery-category')).toHaveCount(5);
  await expect(page.getByText('What would you like to find?')).toHaveCount(0);
  await expect(page.getByText('Start here', { exact: true })).toHaveCount(0);
  await expect(page.getByText('New to hair pieces?', { exact: false })).toHaveCount(0);
  await page.locator('.collection-scene').screenshot({ path: 'preview/discovery-qa/desktop-cloud-reveal.png' });

  for (const [index, category] of ['toppers', 'permanent-extensions', 'clip-extensions', 'wigs', 'fringes'].entries()) {
    const link = page.locator(`.discovery [data-catalogue-category="${category}"]`);
    if (index === 0) await link.click();
    else await link.evaluate(element => element.click());
    await expect(page.locator(`[data-category="${category}"]`)).toHaveAttribute('aria-pressed', 'true');
    await expect(page.locator('[data-results-count]')).toContainText(`${products.filter(p => p.category === category).length} products`);
  }
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
  await expect(page.locator('[data-results-count]')).toContainText('19 products');
  await expect(page.locator('.catalogue-card:visible img')).toHaveCount(0);
  const enquiry = await page.locator('.catalogue-card:visible a').first().getAttribute('href');
  assert.ok(enquiry.startsWith('https://wa.me/919967123333?text='));
  assert.ok(decodeURIComponent(enquiry).includes('Diamond Net Fringes'));
  await page.locator('#range').screenshot({ path: 'preview/discovery-qa/desktop-new.png' });
  await page.locator('#new-products').uncheck();
  await page.locator('[data-category="wigs"]').click();
  await expect(page.locator('.catalogue-card:visible')).toHaveCount(4);
  await expect(page.locator('.catalogue-card:visible .catalogue-price')).toHaveCount(0);
  await page.locator('[data-category="clip-extensions"]').click();
  await expect(page.locator('.catalogue-card:visible')).toHaveCount(7);
  await expect(page.locator('.catalogue-card:visible .catalogue-price')).toHaveCount(0);
  await page.locator('[data-category="permanent-extensions"]').click();
  await expect(page.locator('.catalogue-card:visible')).toHaveCount(8);
  await expect(page.locator('.catalogue-card:visible .catalogue-price')).toHaveCount(0);
  await page.locator('.catalogue-filters [data-category="all"]').click();
  await page.locator('#range').screenshot({ path: 'preview/discovery-qa/desktop-catalogue.png' });

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
  await page.getByLabel('What are you looking for?').selectOption('More volume');
  await page.getByRole('button', { name: 'Submit' }).click();
  await expect(page.locator('.consultation-status')).toBeVisible();
  await page.getByLabel('Your city', { exact: true }).fill('Pune');
  await expect(page.locator('.consultation-status')).toBeHidden();

  for (const width of [320, 375, 390, 768, 1440]) {
    await page.setViewportSize({ width, height: 900 });
    await page.goto(BASE, { waitUntil: 'networkidle' });
    await page.screenshot({ path: `preview/discovery-qa/home-${width}.png` });
    assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), `No horizontal overflow at ${width}`);
    await page.locator('[data-category="fringes"]').click();
    await expect(page.locator('[data-category="fringes"]')).toHaveAttribute('aria-pressed', 'true');
    await page.locator('#range').screenshot({ path: `preview/discovery-qa/fringes-${width}.png` });
    await page.locator('[data-show-more]').click();
    await expect(page.locator('.catalogue-card:visible')).toHaveCount(13);
    await expect(page.locator('[data-show-more]')).toBeHidden();
    const broken = await page.locator('.catalogue-card:visible img').evaluateAll(images => images.filter(i => i.complete && !i.naturalWidth).map(i => i.src));
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
  await writeFile('preview/discovery-qa/results.json', JSON.stringify({ passed: true, products: products.length, newProducts: 19, widths: [320, 375, 390, 768, 1440, '844x390'], checks: ['Hairline Series title and five-category discovery', 'live product names', 'search removal', 'category links and counts', 'extension and wig price removal', 'new placeholders and enquiries', 'sort and pagination', 'URL reload and back', 'retained interactions', 'keyboard skip link', 'reduced motion'], errors }, null, 2));
  console.log('Product discovery checks passed.');
} finally { await browser.close(); }
