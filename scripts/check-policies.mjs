import { chromium, expect } from '@playwright/test';
import assert from 'node:assert/strict';

const base = process.env.BASE_URL ?? 'http://127.0.0.1:4173';
const routes = [
  ['privacy-policy', 'Privacy Policy'],
  ['returns-and-exchanges', 'Returns and Exchanges'],
  ['shipping-delivery', 'Shipping and Delivery'],
  ['terms-of-service', 'Terms of Service'],
];
const browser = await chromium.launch({ channel: 'chrome', headless: true });
try {
  for (const width of [320, 390, 1440]) {
    const page = await browser.newPage({ viewport: { width, height: 844 }, isMobile: width < 700, hasTouch: width < 700 });
    const errors = [];
    page.on('pageerror', error => errors.push(error.message));
    for (const [slug, title] of routes) {
      const response = await page.goto(`${base}/pages/${slug}/`, { waitUntil: 'networkidle' });
      assert.equal(response.status(), 200, `${slug} must load`);
      await expect(page.locator('h1')).toHaveText(title);
      await expect(page.locator('.policy-body h2')).not.toHaveCount(0);
      await expect(page.locator(`.site-footer a[href="/pages/${slug}/"]`)).toHaveAttribute('aria-current', 'page');
      const malformedQuotes = await page.locator('.policy-body p').evaluateAll(paragraphs => paragraphs.filter(paragraph => paragraph.textContent.trimStart().startsWith('”')).map(paragraph => paragraph.textContent));
      assert.deepEqual(malformedQuotes, [], `${slug} has a closing quotation mark where an opening mark is required`);
      assert.equal(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), true, `${slug} overflows at ${width}px`);
      if (slug === 'privacy-policy' && width === 390) await page.screenshot({ path: 'preview/policy-mobile.png', fullPage: true });
    }
    assert.deepEqual(errors, []);
    await page.close();
    console.log(`Policy pages passed at ${width}px on ${base}`);
  }
  const page = await browser.newPage();
  await page.goto(base, { waitUntil: 'domcontentloaded' });
  for (const [slug, title] of routes) {
    const link = page.locator(`.site-footer a[href="/pages/${slug}/"]`);
    await expect(link).toHaveText(title);
    await link.click();
    await expect(page.locator('h1')).toHaveText(title);
    await page.goto(base, { waitUntil: 'domcontentloaded' });
  }
  await page.close();
  console.log('Homepage footer navigation passed.');
} finally {
  await browser.close();
}
