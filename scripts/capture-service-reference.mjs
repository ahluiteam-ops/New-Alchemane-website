import { chromium } from '@playwright/test';
import { mkdir } from 'node:fs/promises';

const out = 'preview/service-page-alignment';
await mkdir(out, { recursive: true });
const browser = await chromium.launch({ channel: 'chrome', headless: true });
try {
  for (const width of [390, 1440]) {
    const page = await browser.newPage({ viewport: { width, height: width === 390 ? 844 : 900 }, reducedMotion: 'reduce' });
    await page.goto('http://127.0.0.1:5173/permanent-extensions.html', { waitUntil: 'networkidle' });
    await page.locator('img').evaluateAll(async images => Promise.all(images.map(async image => { image.loading = 'eager'; try { await image.decode(); } catch {} })));
    await page.screenshot({ path: `${out}/permanent-hero-${width}.png` });
    for (const id of ['difference', 'what', 'salon-comparison', 'method-guide', 'extension-options', 'transformations', 'results', 'faq']) {
      await page.locator(`#${id}`).screenshot({ path: `${out}/permanent-${id}-${width}.png` });
    }
    await page.close();
  }
} finally { await browser.close(); }
