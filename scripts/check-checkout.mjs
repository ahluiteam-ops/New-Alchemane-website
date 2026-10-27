import assert from 'node:assert/strict';
import { chromium } from '@playwright/test';

const browser = await chromium.launch({ channel: 'chrome', headless: true });
const base = process.env.BASE_URL ?? 'http://127.0.0.1:5173';
const items = [
  { handle: 'silk-hair-toppers', id: '41758814142523', texture: 'Straight', quantity: 1 },
  { handle: 'silk-hair-toppers', id: '41758814240827', texture: 'Natural Wave', quantity: 1 },
];
try {
  for (const [width, height] of [[320, 740], [390, 844], [768, 1024], [844, 390], [1440, 900]]) {
    const page = await browser.newPage({ viewport: { width, height }, isMobile: width < 600, hasTouch: width < 600 });
    const errors = [], outbound = [];
    page.on('pageerror', error => errors.push(error.message));
    page.on('request', request => { if (new URL(request.url()).hostname === 'alchemane.com') outbound.push(request.url()); });
    await page.goto(`${base}/checkout.html?preview=1`, { waitUntil: 'networkidle' });
    assert.equal(await page.locator('.co-item').count(), 1);
    assert.equal(await page.locator('#summary-subtotal').textContent(), '₹28,000');
    assert.match(await page.locator('#summary-tax-note').textContent(), /Includes 18% GST/);
    assert.equal((await page.locator('.co-submit button').textContent()).trim(), 'Pay now');
    assert.equal(await page.locator('.co-header__secure').count(), 0);
    assert.equal(await page.locator('.co-summary__chevron').evaluate(node => node.tagName.toLowerCase()), 'svg');
    assert(await page.locator('#checkout-country option').count() > 200);
    assert.equal(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth), false, `${width}: horizontal overflow`);
    assert.equal(await page.locator('#order-summary').evaluate(node => node.open), width > 850);
    await page.screenshot({ path: `preview/checkout-${width}-top.png` });
    if (width === 390 || width === 1440) await page.screenshot({ path: `preview/checkout-${width}-full.png`, fullPage: true });
    await page.locator('#checkout-country').selectOption('AE');
    assert.equal(await page.locator('#checkout-phone-country').inputValue(), 'AE');
    assert.equal(await page.locator('#summary-shipping').textContent(), 'Quote required');
    assert.doesNotMatch(await page.locator('#summary-tax-note').textContent(), /18% GST/);
    await page.locator('#checkout-phone-country').selectOption('GB');
    await page.locator('#checkout-country').selectOption('US');
    assert.equal(await page.locator('#checkout-phone-country').inputValue(), 'GB');
    await page.locator('#policy-open').click();
    assert(await page.locator('#policy-dialog').isVisible());
    await page.keyboard.press('Escape');
    assert.deepEqual(errors, []);
    assert.deepEqual(outbound, []);
    await page.close();
  }

  const page = await browser.newPage({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true });
  const outbound = [];
  page.on('request', request => { if (new URL(request.url()).hostname === 'alchemane.com') outbound.push(request.url()); });
  await page.addInitScript(bag => localStorage.setItem('alchemane-product-bag-v2', JSON.stringify(bag)), items);
  await page.goto(`${base}/checkout.html`, { waitUntil: 'networkidle' });
  assert.equal(await page.locator('.co-item').count(), 2);
  assert.equal(await page.locator('#summary-toggle-total').textContent(), '₹58,000');
  await page.locator('.co-submit button').click();
  assert(await page.locator('#checkout-errors').isVisible());
  assert(await page.locator('#checkout-errors').evaluate(node => node === document.activeElement));
  await page.locator('#checkout-email').fill('buyer@example.com');
  await page.locator('#checkout-phone').fill('9999999999');
  await page.locator('#checkout-name').fill('Asha Shah');
  await page.locator('#checkout-address').fill('12 Hill Road');
  await page.locator('#checkout-city').fill('Mumbai');
  await page.locator('#checkout-region').fill('Maharashtra');
  await page.locator('#checkout-postal').fill('400050');
  await page.locator('.co-submit button').click();
  assert(await page.locator('#review-dialog').isVisible());
  assert.match(await page.locator('#review-details').textContent(), /Asha Shah/);
  assert.match(await page.locator('#review-details').textContent(), /\+919999999999/);
  assert.match(await page.locator('#review-dialog').textContent(), /Payment is not available yet/);
  await page.keyboard.press('Escape');
  await page.locator('#billing-different').check();
  assert(await page.locator('#billing-fields').isVisible());
  await page.locator('.co-submit button').click();
  assert(await page.locator('#checkout-errors').isVisible());
  await page.locator('#billing-country').selectOption('GB');
  await page.locator('#billing-name').fill('Asha Shah');
  await page.locator('#billing-address').fill('10 Downing Street');
  await page.locator('#billing-city').fill('London');
  await page.locator('#billing-postal').fill('SW1A 2AA');
  await page.locator('.co-submit button').click();
  assert(await page.locator('#review-dialog').isVisible());
  assert.match(await page.locator('#review-details').textContent(), /United Kingdom/);
  assert.deepEqual(outbound, []);
  const stored = await page.evaluate(() => Object.fromEntries(Object.entries(localStorage)));
  assert.equal(JSON.stringify(stored).includes('buyer@example.com'), false);
  await page.close();

  const product = await browser.newPage();
  const productOutbound = [];
  product.on('request', request => { if (new URL(request.url()).hostname === 'alchemane.com') productOutbound.push(request.url()); });
  await product.goto(`${base}/products/silk-hair-toppers/`, { waitUntil: 'domcontentloaded' });
  await product.locator('.pd-texture-options label.pd-choice:has(input[value="Straight"])').click();
  await product.locator('[data-buy-now]').click();
  await product.waitForURL('**/checkout.html');
  assert.equal(await product.locator('.co-item').count(), 1);
  assert.deepEqual(productOutbound, []);
  await product.close();

  const empty = await browser.newPage();
  await empty.goto(`${base}/checkout.html`, { waitUntil: 'networkidle' });
  assert(await empty.locator('#checkout-empty').isVisible());
  assert.equal(await empty.locator('#checkout-form').isVisible(), false);
  await empty.close();
  console.log('Checkout passed: responsive sizes, international selectors, validation, review, billing, no old-store request or personal-data storage.');
} finally { await browser.close(); }
