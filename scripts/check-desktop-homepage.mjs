import { chromium, expect } from '@playwright/test';
import assert from 'node:assert/strict';
import { createServer } from 'vite';

const base = 'http://127.0.0.1:4186';
const server = await createServer({ logLevel: 'silent', server: { host: '127.0.0.1', port: 4186, strictPort: true } });
await server.listen();
const browser = await chromium.launch({ channel: 'chrome', headless: true });
const errors = [];
const auditHomepageSections = page => page.locator('.home-rest > section').evaluateAll(sections => sections.map(section => ({
  name: section.id || section.classList[0],
  visible: getComputedStyle(section).display !== 'none' && getComputedStyle(section).visibility !== 'hidden' && section.getBoundingClientRect().height > 0,
})));

try {
  const desktop = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  desktop.on('pageerror', error => errors.push(error.message));
  await desktop.goto(`${base}/#product-videos`, { waitUntil: 'networkidle' });
  await expect(desktop.locator('.product-videos-intro')).toBeVisible();
  await expect(desktop.locator('#celebrity-picks')).toBeVisible();
  await expect(desktop.locator('#flagship-store')).toBeVisible();
  await expect(desktop.locator('#celebrity-picks .voice-card--pending')).toHaveCount(7);
  await expect(desktop.locator('#flagship-store .voice-card--pending')).toHaveCount(3);
  await expect(desktop.locator('#celebrity-picks .voice-play[disabled]')).toHaveCount(7);
  await expect(desktop.locator('#flagship-store .voice-play[disabled]')).toHaveCount(3);
  const desktopSections = await auditHomepageSections(desktop);
  assert(desktopSections.length >= 16, 'Desktop should render the complete homepage section set');
  assert.deepEqual(desktopSections.filter(section => !section.visible), [], 'No desktop homepage section should be hidden');
  await desktop.locator('#product-videos').screenshot({ path: 'preview/product-videos-desktop-audit.png' });
  await desktop.locator('#celebrity-picks').scrollIntoViewIfNeeded();
  await desktop.waitForTimeout(350);
  await desktop.locator('#celebrity-picks').screenshot({ path: 'preview/celebrity-choice-desktop-audit.png' });
  await desktop.locator('#flagship-store').scrollIntoViewIfNeeded();
  await desktop.waitForTimeout(350);
  await desktop.locator('#flagship-store').screenshot({ path: 'preview/flagship-store-desktop-audit.png' });

  const trigger = desktop.locator('#product-videos .voice-play').nth(1);
  await trigger.click();
  const dialog = desktop.locator('.product-film-dialog[open]');
  await expect(dialog).toBeVisible();
  await expect(dialog.locator('[data-film-neighbor="previous"]')).toBeVisible();
  await expect(dialog.locator('[data-film-neighbor="next"]')).toBeVisible();
  await expect(dialog.locator('.product-film-slide.is-active')).toHaveAttribute('data-film-index', '1');
  await expect.poll(() => dialog.locator('video').evaluate(video => !video.paused && video.currentTime > 0), { timeout: 15000 }).toBe(true);
  const frame = await dialog.locator('.product-film-feed').boundingBox();
  assert(frame.width < 500 && frame.width > 300 && frame.x > 300 && frame.x + frame.width < 1140, 'Desktop film should be centered, with room for adjacent previews');
  await dialog.screenshot({ path: 'preview/product-film-desktop-audit.png' });

  await dialog.locator('[data-film-neighbor="next"]').click();
  await expect(dialog.locator('.product-film-slide.is-active')).toHaveAttribute('data-film-index', '2');
  await dialog.locator('.product-film-feed').focus();
  await desktop.keyboard.press('ArrowLeft');
  await expect(dialog.locator('.product-film-slide.is-active')).toHaveAttribute('data-film-index', '1');
  await dialog.locator('.product-film-slide.is-active [data-shop-start]').click();
  await expect(dialog.locator('.product-film-slide.is-active form')).toBeVisible();
  await expect(dialog.locator('[data-film-neighbor="next"]')).toBeHidden();
  await dialog.locator('.product-film-slide.is-active [data-shop-cancel]').click();
  await expect(dialog.locator('[data-film-neighbor="next"]')).toBeVisible();
  await desktop.keyboard.press('Escape');
  await expect(dialog).toBeHidden();
  assert(await trigger.evaluate(button => document.activeElement === button), 'Close returns focus to the opened film');

  for (const width of [1024, 1920]) {
    const sized = await browser.newPage({ viewport: { width, height: 900 } });
    sized.on('pageerror', error => errors.push(error.message));
    await sized.goto(`${base}/#product-videos`, { waitUntil: 'networkidle' });
    await sized.locator('#product-videos .voice-play').nth(1).click();
    const sideFrames = await sized.locator('.product-film-neighbor:not([hidden])').evaluateAll(buttons => buttons.map(button => {
      const { left, right } = button.getBoundingClientRect();
      return { left, right };
    }));
    assert.equal(sideFrames.length, 2, `${width}: both adjacent films should be visible`);
    assert(sideFrames.every(frame => frame.left >= 0 && frame.right <= width), `${width}: adjacent films should fit the viewport`);
    assert.equal(await sized.evaluate(() => document.documentElement.scrollWidth > innerWidth), false, `${width}: page should not overflow horizontally`);
    await sized.close();
  }

  const mobile = await browser.newPage({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true });
  mobile.on('pageerror', error => errors.push(error.message));
  await mobile.goto(`${base}/#product-videos`, { waitUntil: 'networkidle' });
  await expect(mobile.locator('.product-videos-intro')).toBeHidden();
  await expect(mobile.locator('#celebrity-picks')).toBeVisible();
  await expect(mobile.locator('#flagship-store')).toBeVisible();
  const mobileSections = await auditHomepageSections(mobile);
  assert.deepEqual(mobileSections.filter(section => !section.visible), [], 'No mobile homepage section should be hidden');
  assert.deepEqual(mobileSections.map(section => section.name), desktopSections.map(section => section.name), 'Desktop and mobile should contain the same homepage sections');
  await mobile.locator('#product-videos .voice-play').first().click();
  const mobileDialog = mobile.locator('.product-film-dialog[open]');
  await expect(mobileDialog.locator('[data-film-neighbor="next"]')).toBeHidden();
  const mobileFrame = await mobileDialog.locator('.product-film-feed').boundingBox();
  assert(mobileFrame.height >= 840 && mobileFrame.width <= 390, 'Mobile keeps its full-height swipe viewer');
  await mobileDialog.screenshot({ path: 'preview/product-film-mobile-regression.png' });

  assert.deepEqual(errors, []);
  console.log('Desktop homepage checks passed: desktop film layout, adjacent navigation, shopping state, close focus, restored celebrity/flagship rails, and mobile layout isolation.');
} finally {
  await browser.close();
  await server.close();
}
