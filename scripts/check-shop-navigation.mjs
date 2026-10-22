import { chromium, expect } from '@playwright/test';
import assert from 'node:assert/strict';
import { mkdir } from 'node:fs/promises';
import { categories, products, productBelongsToCategory } from '../src/sections/catalogue-data.js';

const base = process.env.BASE_URL || 'http://127.0.0.1:5174';
const browser = await chromium.launch({ channel: 'chrome', headless: true });
const routes = ['/', '/products/silk-hair-toppers/', '/toppers.html', '/permanent-extensions.html', '/wigs.html', '/extensions.html'];
const failures = [];
let checked = 0;
await mkdir('preview/shop-navigation', { recursive: true });

try {
  for (const [width, height] of [[320, 740], [390, 844], [768, 1024], [950, 900], [1024, 900], [1440, 1000], [844, 390]]) {
    for (const path of routes) {
      const context = await browser.newContext({ viewport: { width, height }, reducedMotion: 'reduce', hasTouch: width < 1000 });
      const page = await context.newPage();
      await page.route('**/*', route => {
        const request = route.request();
        if (request.resourceType() === 'media' || !request.url().startsWith(base)) return route.abort();
        return route.continue();
      });
      page.on('pageerror', error => failures.push(`${width} ${path}: ${error.message}`));
      await page.goto(base + path, { waitUntil: 'domcontentloaded' });
      const panel = page.locator('#shop-navigation');
      const trigger = page.locator('.shopnav__trigger:visible');
      await expect(trigger).toHaveCount(1);
      await expect(trigger).toBeVisible();
      await page.evaluate(() => document.fonts.ready);
      assert(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), `${width} ${path}: page overflows`);
      const buttonBox = await trigger.boundingBox();
      assert(buttonBox.height >= 44 && buttonBox.width >= 44, `${width} ${path}: small Shop button`);
      if ([390, 1440].includes(width) && ['/', '/products/silk-hair-toppers/'].includes(path)) {
        await page.screenshot({ path: `preview/shop-navigation/${path === '/' ? 'home' : 'product'}-header-${width}.png` });
      }
      await trigger.click();
      await expect(panel).toBeVisible();
      await expect(trigger).toHaveAttribute('aria-expanded', 'true');
      await expect(panel.locator('[data-shop-category]')).toHaveCount(categories.length);
      const bounds = await panel.boundingBox();
      assert(bounds.x >= -1 && bounds.x + bounds.width <= width + 1 && bounds.y + bounds.height <= height + 1, `${width} ${path}: menu exceeds viewport`);
      if ([390, 1440].includes(width) && path === '/') {
        await page.screenshot({ path: `preview/shop-navigation/menu-${width}.png` });
      }
      for (const category of categories) {
        await panel.locator(`[data-shop-category="${category.id}"]`).click();
        const group = panel.locator(`#shop-products-${category.id}`);
        await expect(group).toBeVisible();
        await expect(group.locator('li')).toHaveCount(products.filter(product => productBelongsToCategory(product, category.id)).length);
        const unavailable = group.locator('[aria-disabled="true"]').first();
        assert.equal(await unavailable.getAttribute('href'), null);
        if (width < 1000) await expect(group.locator('h2')).toBeFocused();
        await unavailable.click({ force: true });
        assert.equal(page.url(), base + path, 'Unfinished product must not navigate');
        await expect(panel).toBeVisible();
        if (width < 1000) {
          if (width === 390 && path === '/' && category.id === 'toppers') {
            await page.screenshot({ path: 'preview/shop-navigation/products-390.png' });
          }
          await panel.locator('[data-shop-back]').click();
          await expect(panel.locator(`[data-shop-category="${category.id}"]`)).toBeFocused();
        }
      }
      await page.keyboard.press('Escape');
      await expect(panel).not.toBeVisible();
      await expect(trigger).toHaveAttribute('aria-expanded', 'false');
      await expect(trigger).toBeFocused();
      await trigger.click();
      await panel.getByRole('button', { name: 'Close shop menu' }).click();
      await expect(panel).not.toBeVisible();
      await trigger.click();
      await page.mouse.click(4, 4);
      await expect(panel).not.toBeVisible();

      // Opening either navigation must dismiss the other, including tablets.
      if (width < 1000 && path !== '/extensions.html') {
        const hamburger = page.locator('.menu-toggle, .pe-menu, .pd-menu');
        await hamburger.click();
        await expect(hamburger).toHaveAttribute('aria-expanded', 'true');
        await trigger.click();
        await expect(hamburger).toHaveAttribute('aria-expanded', 'false');
        await expect(panel).toBeVisible();
        await hamburger.click();
        await expect(panel).not.toBeVisible();
        await expect(hamburger).toHaveAttribute('aria-expanded', 'true');
        await hamburger.click();
      }

      // Keyboard can enter and leave the popover without a focus trap.
      await trigger.focus();
      await page.keyboard.press('Enter');
      await expect(panel).toBeVisible();
      await page.keyboard.press('Tab');
      assert(await panel.evaluate(node => node.contains(document.activeElement)), `${width} ${path}: Tab misses shop navigation`);
      await page.keyboard.press('Escape');
      await expect(trigger).toBeFocused();

      if (path === '/' && [390, 1440].includes(width)) {
        await trigger.click();
        await panel.locator('[data-shop-category="toppers"]').click();
        await panel.getByRole('link', { name: /Silk Topper 5x3/ }).click();
        await expect(page).toHaveURL(base + '/products/silk-hair-toppers/');
        await expect(page.getByRole('heading', { level: 1 })).toHaveText('Silk Topper 5×3');
      }
      await context.close();
      checked++;
      console.log(`PASS ${width}×${height} ${path}`);
    }
  }
  assert.deepEqual(failures, [], 'Browser errors');
  console.log(`Shop navigation passed ${checked} responsive page checks.`);
} finally {
  await browser.close();
}
