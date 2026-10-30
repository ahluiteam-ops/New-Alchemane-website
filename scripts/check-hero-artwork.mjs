import { chromium, expect } from '@playwright/test';
import sharp from 'sharp';
import { mkdir } from 'node:fs/promises';

const browser = await chromium.launch({ channel: 'chrome', headless: true });
const output = 'preview/hero-artwork-qa';
await mkdir(output, { recursive: true });
try {
  for (const [width, height] of [[320, 740], [390, 844], [600, 800], [768, 1024], [1440, 900], [1920, 1080], [844, 390]]) {
    const page = await browser.newPage({ viewport: { width, height } });
    const errors = [];
    page.on('pageerror', error => errors.push(error.message));
    await page.goto('http://localhost:5173/', { waitUntil: 'networkidle' });
    await expect(page.getByRole('heading', { name: 'Your Match', exact: true })).toBeVisible();
    await expect(page.locator('.hero-wordmark img')).not.toHaveJSProperty('naturalWidth', 0);
    await expect(page.locator('.hero-actions .collection-cta')).toBeInViewport();
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBeTruthy();
    expect(errors).toEqual([]);
    await page.screenshot({ path: `${output}/${width}.png` });
    await page.locator('.hero-actions .collection-cta').click();
    await expect(page.locator('#collection')).toBeInViewport({ ratio: .2 });
    await page.close();
    console.log(`Passed ${width}x${height}: heading, CTA, navigation, overflow and browser errors`);
  }

  // Compare the rendered hair with the photograph without lettering.
  // This catches letters painted over hair, even if all DOM/layout checks pass.
  const page = await browser.newPage({ viewport: { width: 1664, height: 1000 }, reducedMotion: 'reduce' });
  await page.goto('http://localhost:5173/', { waitUntil: 'networkidle' });
  const art = await page.locator('.hero-art-composition').boundingBox();
  const clip = { x: 0, y: art.y, width: 1664, height: 270 };
  const final = await sharp(await page.screenshot({ clip })).removeAlpha().raw().toBuffer();
  await page.locator('.hero-wordmark').evaluate(el => { el.style.visibility = 'hidden'; });
  const photo = await sharp(await page.screenshot({ clip })).removeAlpha().raw().toBuffer();
  let checked = 0;
  let changed = 0;
  for (const [left, right, top] of [[350, 520, 178], [687, 934, 124], [1098, 1272, 150]]) {
    for (let y = top; y < 250; y++) {
      for (let x = left; x < right; x++) {
        const i = (y * 1664 + x) * 3;
        // Dark core hair pixels, excluding antialiased boundary pixels.
        if (Math.max(photo[i], photo[i + 1], photo[i + 2]) >= 110) continue;
        checked++;
        if ([0, 1, 2].some(c => Math.abs(photo[i + c] - final[i + c]) > 8)) changed++;
      }
    }
  }
  expect(checked).toBeGreaterThan(10000);
  expect(changed / checked).toBeLessThan(.001);
  console.log(`Hair occlusion passed: ${checked} hair pixels compared, ${changed} changed`);
  await page.locator('.hero-wordmark').evaluate(el => { el.style.visibility = ''; });
  await page.locator('.hero-actions .collection-cta').click();
  await expect(page.locator('#collection')).toBeInViewport({ ratio: .2 });
  console.log('Reduced-motion CTA passed');
} finally {
  await browser.close();
}
