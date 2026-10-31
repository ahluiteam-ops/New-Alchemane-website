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
    await page.addInitScript(() => {
      const show = HTMLDialogElement.prototype.showModal;
      HTMLDialogElement.prototype.showModal = function () { if (!this.classList.contains('offer-dialog')) show.call(this); };
    });
    page.on('pageerror', error => errors.push(error.message));
    await page.goto('http://localhost:5173/', { waitUntil: 'networkidle' });
    await page.evaluate(() => document.fonts.ready);
    await expect(page.getByRole('heading', { name: 'Hairline Series', exact: true, level: 1 })).toBeVisible();
    await expect(page.locator('.hero-wordmark-vector')).toBeVisible();
    await expect(page.locator('.hero-description')).toHaveCount(0);
    await expect(page.locator('.hero-actions .collection-cta')).toHaveText('Shop now');
    await expect(page.locator('.hero-actions .collection-cta')).toHaveAttribute('href', '/collections/hairline-series/');
    await expect(page.locator('.hero-actions .scroll-cue')).toHaveText('See more options');
    await expect(page.locator('.hero-actions .collection-cta')).toBeInViewport();
    await expect(page.locator('.hero-actions .scroll-cue')).toBeInViewport();
    await expect(page.locator('.site-header')).toHaveCSS('position', 'fixed');
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBeTruthy();
    expect(errors).toEqual([]);
    await page.screenshot({ path: `${output}/${width}.png` });
    await page.locator('.hero-actions .scroll-cue').click();
    await expect(page.locator('#collection')).toBeInViewport({ ratio: .2 });
    await expect.poll(() => page.locator('.site-header').evaluate(header => header.getBoundingClientRect().top)).toBe(0);
    await expect(page.locator('.site-header')).toHaveCSS('opacity', '1');
    await expect(page.locator('#solutions-title')).toBeVisible();
    expect(await page.locator('#solutions-title').evaluate(heading => heading.getBoundingClientRect().top >= document.querySelector('.site-header').getBoundingClientRect().bottom)).toBeTruthy();
    await page.locator('.shopnav__trigger:visible').click();
    await expect(page.locator('#shop-navigation')).toBeVisible();
    await page.keyboard.press('Escape');
    await page.locator('#explore-collections').scrollIntoViewIfNeeded();
    await expect(page.locator('.site-header')).toBeInViewport();
    await page.screenshot({ path: `${output}/header-scrolled-${width}.png` });
    await page.close();
    console.log(`Passed ${width}x${height}: artwork, CTAs, fixed header, scrolled menu, overflow and browser errors`);
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
  await page.locator('.hero-actions .scroll-cue').click();
  await expect(page.locator('#collection')).toBeInViewport({ ratio: .2 });
  await page.goto('http://localhost:5173/', { waitUntil: 'networkidle' });
  await page.locator('.hero-actions .collection-cta').click();
  await expect(page).toHaveURL('http://localhost:5173/collections/hairline-series/');
  console.log('Reduced-motion reveal and Shop now destination passed');
} finally {
  await browser.close();
}
