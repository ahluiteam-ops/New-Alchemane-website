import assert from 'node:assert/strict';
import { mkdir } from 'node:fs/promises';
import { chromium } from '@playwright/test';
import { blogArticles } from '../src/pages/blog-data.generated.js';

const base = process.env.BREADCRUMB_BASE_URL || 'http://127.0.0.1:4173';
const routes = [
  ['/extensions.html', 'Hair Extensions'],
  ['/permanent-extensions.html', 'Permanent Hair Extensions'],
  ['/toppers.html', 'Hair Toppers'],
  ['/wigs.html', 'Wigs'],
  ['/consultation.html', 'Book A Consultation'],
  ['/topper-consultation.html', 'Hair Topper Consultation'],
  ['/products/silk-hair-toppers/', 'Silk Topper 5×3'],
  ['/pages/privacy-policy/', 'Privacy Policy'],
  ['/pages/returns-and-exchanges/', 'Returns and Exchanges'],
  ['/pages/shipping-delivery/', 'Shipping and Delivery'],
  ['/pages/terms-of-service/', 'Terms of Service'],
  ['/blogs.html', 'Blogs'],
  [`/blogs/${blogArticles[0].slug}/`, blogArticles[0].title],
];

const browser = await chromium.launch({ headless: true });
await mkdir('preview/breadcrumb-qa', { recursive: true });

try {
  for (const { name, viewport } of [
    { name: 'desktop', viewport: { width: 1440, height: 900 } },
    { name: 'mobile', viewport: { width: 390, height: 844 } },
  ]) {
    const page = await browser.newPage({ viewport });
    await page.goto(`${base}/`, { waitUntil: 'domcontentloaded' });
    assert.equal(await page.locator('[aria-label="Breadcrumb"]').count(), 0, `${name}: homepage remains the breadcrumb origin`);

    for (const [route, label] of routes) {
      await page.goto(`${base}${route}`, { waitUntil: 'domcontentloaded' });
      const breadcrumb = page.locator('nav[aria-label="Breadcrumb"]');
      await breadcrumb.waitFor({ state: 'visible' });
      assert.equal(await breadcrumb.count(), 1, `${name} ${route}: one breadcrumb landmark`);
      assert.equal(await breadcrumb.locator('a').first().getAttribute('href'), '/', `${name} ${route}: breadcrumb starts at Home`);
      assert.equal((await breadcrumb.locator('[aria-current="page"]').textContent()).trim(), label, `${name} ${route}: current page is identified`);
      const box = await breadcrumb.boundingBox();
      assert.ok(box.x >= 0 && box.x + box.width <= viewport.width + 1, `${name} ${route}: breadcrumb remains inside the viewport`);
      assert.equal(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), true, `${name} ${route}: no horizontal overflow`);
    }

    await page.goto(`${base}/permanent-extensions.html`, { waitUntil: 'domcontentloaded' });
    await page.screenshot({ path: `preview/breadcrumb-qa/${name}-service.png` });
    await page.goto(`${base}/topper-consultation.html`, { waitUntil: 'domcontentloaded' });
    await page.screenshot({ path: `preview/breadcrumb-qa/${name}-consultation.png` });
    await page.close();
  }

  console.log(`PASS: breadcrumbs verified on ${routes.length} internal route types at desktop and mobile widths.`);
} finally {
  await browser.close();
}
