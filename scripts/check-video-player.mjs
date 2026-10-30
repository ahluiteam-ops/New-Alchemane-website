import { chromium, expect } from '@playwright/test';
import { createServer } from 'vite';
import assert from 'node:assert/strict';

const port = 4185;
const base = `http://127.0.0.1:${port}`;
const server = await createServer({ logLevel: 'silent', server: { host: '127.0.0.1', port, strictPort: true } });
await server.listen();
const browser = await chromium.launch({ channel: 'chrome', headless: true });
const errors = [];
const watch = page => page.on('pageerror', error => errors.push(error.message));
const viewer = page => page.locator('.product-film-dialog[open]');
const movie = page => viewer(page).locator('video');

async function assertCenteredPreview(page, section) {
  const active = page.locator(`${section} .voice-card.is-active video`);
  await expect.poll(() => active.evaluate(video => !video.paused && video.currentTime > 0 && video.muted && video.loop), { timeout: 15000 }).toBe(true);
  assert.equal(await page.locator('.voice-card video').evaluateAll(videos => videos.filter(video => !video.paused).length), 1, 'Only the centered visible film should preview');
}

async function assertPlayingWithSound(page) {
  await expect(viewer(page)).toBeVisible();
  await expect.poll(() => movie(page).evaluate(video => !video.paused && video.currentTime > 0), { timeout: 15000 }).toBe(true);
  assert(await movie(page).evaluate(video => !video.muted && video.volume > 0), 'Tapped film must play with audio');
  const frame = await movie(page).boundingBox();
  const size = page.viewportSize();
  assert(frame.height > size.height * .7, 'The expanded film should use most of the viewport height');
  assert(frame.x >= 0 && frame.x + frame.width <= size.width + 1, 'The expanded film must fit the screen width');
}

try {
  const context = await browser.newContext({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true });
  const page = await context.newPage();
  watch(page);
  await page.goto(`${base}/#product-videos`, { waitUntil: 'networkidle' });
  await assertCenteredPreview(page, '#product-videos');

  const firstButton = page.locator('#product-videos .voice-play').first();
  await firstButton.click();
  await assertPlayingWithSound(page);
  const firstSource = await movie(page).evaluate(video => video.currentSrc);
  assert(await page.locator('#product-videos .voice-card video').evaluateAll(videos => videos.every(video => video.paused)));
  await page.screenshot({ path: 'preview/video-player-product-mobile.png' });

  await page.keyboard.press('Escape');
  await expect(viewer(page)).not.toBeVisible();
  await expect(page.locator('.product-film-dialog video')).toHaveCount(0);
  await assertCenteredPreview(page, '#product-videos');
  assert(await firstButton.evaluate(button => document.activeElement === button), 'Closing should return focus to the tapped card');
  assert.equal(await page.evaluate(() => document.body.style.overflow), '');

  const track = page.locator('#product-videos .voices-track');
  await track.evaluate(node => node.scrollBy({ left: 210, behavior: 'instant' }));
  await expect.poll(() => page.locator('#product-videos .is-active').getAttribute('data-product-handle')).not.toBe('silk-hair-toppers');
  await assertCenteredPreview(page, '#product-videos');
  await page.locator('#product-videos .is-active .voice-play').click();
  await assertPlayingWithSound(page);
  assert.notEqual(await movie(page).evaluate(video => video.currentSrc), firstSource, 'The newly selected product should open its own film');
  await page.locator('[data-film-close]').click();
  await expect(viewer(page)).not.toBeVisible();

  // Product shopping: choose real variants, add to the shared bag, then swipe
  // to a different product without closing the full-screen player.
  await track.evaluate(node => node.scrollTo({ left: 0, behavior: 'instant' }));
  await page.locator('#product-videos .voice-play').first().click();
  let shop = page.locator('.product-film-slide.is-active .product-film-shop');
  await shop.locator('[data-shop-start]').click();
  await expect(shop.locator('form')).toBeVisible();
  await shop.getByLabel('16 inches', { exact: true }).check();
  await shop.getByLabel('Dark Brown', { exact: true }).check();
  await shop.getByLabel('Straight', { exact: true }).check();
  await expect(shop.locator('[data-film-price]')).toHaveText('₹30,000');
  await page.screenshot({ path: 'preview/product-video-shopping-options-mobile.png' });
  await shop.locator('button[type="submit"]').click();
  await expect(shop.locator('.product-film-cart-status')).toHaveText('Added to cart');
  await shop.getByRole('button', { name: 'Increase quantity' }).click();
  await expect(shop.locator('[data-shop-quantity]')).toHaveText('2');

  const session = await page.context().newCDPSession(page);
  await session.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [{ x: 360, y: 650 }] });
  for (let step = 1; step <= 10; step++) {
    await session.send('Input.dispatchTouchEvent', { type: 'touchMove', touchPoints: [{ x: 360, y: 650 - step * 45 }] });
    await page.waitForTimeout(30);
  }
  await session.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] });
  await expect(page.locator('.product-film-slide.is-active')).toHaveAttribute('data-film-index', '1');
  await assertPlayingWithSound(page);
  shop = page.locator('.product-film-slide.is-active .product-film-shop');
  await expect(shop.locator('.product-film-name')).toHaveText('Halo Hair Extensions');
  await expect(page.locator('.product-film-dialog video')).toHaveCount(1);
  await shop.locator('[data-shop-start]').click();
  await shop.getByLabel('22 inch', { exact: true }).check();
  await shop.getByLabel('Highlights', { exact: true }).check();
  await shop.locator('button[type="submit"]').click();
  await expect(shop.locator('.product-film-cart-status')).toHaveText('Added to cart');
  await page.screenshot({ path: 'preview/product-video-shopping-mobile.png' });
  const saved = await page.evaluate(() => JSON.parse(localStorage.getItem('alchemane-product-bag-v2')));
  assert.equal(saved.length, 2);
  assert(saved.some(item => item.handle === 'silk-hair-toppers' && item.id === '41758814273595' && item.texture === 'Straight' && item.quantity === 2));
  assert(saved.some(item => item.handle === 'halo-hair-extensions' && item.quantity === 1));
  await page.locator('[data-film-close]').click();
  await expect(page.locator('#product-videos .is-active')).toHaveAttribute('data-product-handle', 'halo-hair-extensions');

  // A bag built in the video viewer survives visiting the product page and checkout.
  const purchase = await page.context().newPage();
  watch(purchase);
  await purchase.goto(`${base}/products/silk-hair-toppers/`, { waitUntil: 'domcontentloaded' });
  await purchase.locator('.pd-bag-button').click();
  await expect(purchase.locator('.pd-bag__item')).toHaveCount(2);
  await expect(purchase.locator('.pd-bag__item').filter({ hasText: 'Halo Hair Extensions' })).toHaveCount(1);
  await purchase.goto(`${base}/checkout.html`, { waitUntil: 'domcontentloaded' });
  await expect(purchase.locator('.co-item')).toHaveCount(2);
  await expect(purchase.locator('.co-item').filter({ hasText: 'Halo Hair Extensions' })).toHaveCount(1);
  assert.equal(await purchase.evaluate(() => document.documentElement.scrollWidth > innerWidth), false);
  await purchase.close();

  await page.locator('#voices').scrollIntoViewIfNeeded();
  await assertCenteredPreview(page, '#voices');
  await page.locator('#voices .voice-play').first().click();
  await assertPlayingWithSound(page);
  assert.match(await movie(page).evaluate(video => video.currentSrc), /\/assets\/testimonials\/c1\.mp4$/);
  assert(await page.locator('.voice-card video').evaluateAll(videos => videos.every(video => video.paused)));
  await page.screenshot({ path: 'preview/story-video-mobile.png' });
  await session.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [{ x: 340, y: 650 }] });
  for (let step = 1; step <= 10; step++) {
    await session.send('Input.dispatchTouchEvent', { type: 'touchMove', touchPoints: [{ x: 340, y: 650 - step * 45 }] });
    await page.waitForTimeout(30);
  }
  await session.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] });
  await expect(page.locator('.story-film-dialog .product-film-slide.is-active')).toHaveAttribute('data-story-index', '1');
  await assertPlayingWithSound(page);
  assert.match(await movie(page).evaluate(video => video.currentSrc), /\/assets\/testimonials\/c2\.mp4$/);
  await page.locator('[data-story-close]').click();
  await expect(viewer(page)).not.toBeVisible();
  await page.locator('#voices .voice-card.is-active').scrollIntoViewIfNeeded();
  await assertCenteredPreview(page, '#voices');
  assert.equal(await page.locator('#celebrity-picks .voice-play[disabled]').count(), 7);
  assert.equal(await page.locator('#celebrity-picks video').count(), 0);
  await expect(page.locator('#flagship-store-title')).toHaveText('Our flagship store');
  await expect(page.locator('#flagship-store .voice-card--pending')).toHaveCount(3);
  await expect(page.locator('#flagship-store .voice-play[disabled]')).toHaveCount(3);
  await expect(page.locator('#flagship-store video')).toHaveCount(0);
  assert(await page.locator('#flagship-store').evaluate(section => section.previousElementSibling?.classList.contains('studio-visit') && section.nextElementSibling?.classList.contains('media-coverage')), 'Featured In should sit immediately after the flagship store');
  await page.locator('#flagship-store').scrollIntoViewIfNeeded();
  const flagshipLayout = await page.locator('#flagship-store').evaluate(section => {
    const cards = [...section.querySelectorAll('.voice-card')];
    const track = section.querySelector('.voices-track');
    const first = cards[0].getBoundingClientRect();
    const second = cards[1].getBoundingClientRect();
    return { first: first.width, second: second.width, gap: second.left - first.right, center: first.left + first.width / 2 - innerWidth / 2, trackWidth: track.getBoundingClientRect().width };
  });
  assert(Math.abs(flagshipLayout.center) < 2 && Math.abs(flagshipLayout.second / flagshipLayout.first - .8) < .02 && Math.abs(flagshipLayout.gap - 16) < 1, 'Flagship cards should open centered with the same 80% neighbors and 16px gap');
  await page.locator('#flagship-store').screenshot({ path: 'preview/flagship-store-mobile.png' });

  const desktop = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  watch(desktop);
  await desktop.goto(`${base}/#voices`, { waitUntil: 'networkidle' });
  await desktop.locator('#voices .voice-play').first().click();
  await assertPlayingWithSound(desktop);
  await desktop.locator('.story-film-dialog').click({ position: { x: 20, y: 20 } });
  await expect(viewer(desktop)).not.toBeVisible();

  for (const [width, height] of [[320, 740], [768, 1024], [844, 390], [1440, 900]]) {
    const sized = await browser.newPage({ viewport: { width, height }, isMobile: width < 701, hasTouch: width < 1000 });
    watch(sized);
    await sized.goto(`${base}/#product-videos`, { waitUntil: 'networkidle' });
    await sized.locator('#product-videos .voice-play').first().click();
    await assertPlayingWithSound(sized);
    await sized.locator('.product-film-slide.is-active [data-shop-start]').click();
    const bounds = await sized.locator('.product-film-slide.is-active .product-film-shop').boundingBox();
    assert(bounds.x >= 0 && bounds.x + bounds.width <= width + 1 && bounds.y >= 60 && bounds.y + bounds.height <= height, `${width}: shopping panel must fit the screen`);
    await expect(sized.locator('[data-film-close]')).toBeInViewport();
    const submit = sized.locator('.product-film-slide.is-active button[type="submit"]');
    await submit.scrollIntoViewIfNeeded();
    await expect(submit).toBeInViewport();
    await sized.locator('[data-film-close]').click();
    await expect(viewer(sized)).not.toBeVisible();
    assert.equal(await sized.evaluate(() => document.documentElement.scrollWidth > innerWidth), false);
    await sized.close();
  }

  const reduced = await browser.newPage({ viewport: { width: 390, height: 844 }, reducedMotion: 'reduce' });
  watch(reduced);
  await reduced.goto(`${base}/#voices`, { waitUntil: 'networkidle' });
  assert(await reduced.locator('.voice-card video').evaluateAll(videos => videos.every(video => video.paused)));
  await reduced.locator('#voices .voice-play').first().click();
  await assertPlayingWithSound(reduced);

  // The Celebrity Choice placeholder can use this same player when footage arrives.
  const celebrity = await browser.newPage({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true });
  watch(celebrity);
  await celebrity.route('**/?celebrity-player-fixture', async route => {
    const response = await route.fetch();
    const html = (await response.text()).replace(
      /(<section[^>]*id="celebrity-picks"[\s\S]*?<ul[^>]*>)[\s\S]*?<\/li>/,
      '$1<li class="voice-card is-active" data-voice><video playsinline preload="none" poster="/assets/testimonials/c1.webp" aria-label="Test celebrity film one"><source src="/assets/testimonials/c1.mp4" type="video/mp4"></video><button type="button" class="voice-play" aria-label="Open test celebrity film one with sound"><span class="voice-badge">Play</span></button></li><li class="voice-card" data-voice><video playsinline preload="none" poster="/assets/testimonials/c2.webp" aria-label="Test celebrity film two"><source src="/assets/testimonials/c2.mp4" type="video/mp4"></video><button type="button" class="voice-play" aria-label="Open test celebrity film two with sound"><span class="voice-badge">Play</span></button></li>',
    );
    await route.fulfill({ response, body: html });
  });
  await celebrity.goto(`${base}/?celebrity-player-fixture#celebrity-picks`, { waitUntil: 'domcontentloaded' });
  await assertCenteredPreview(celebrity, '#celebrity-picks');
  await celebrity.locator('#celebrity-picks .voice-play:not([disabled])').first().click();
  await assertPlayingWithSound(celebrity);
  await celebrity.locator('[data-story-next]').click();
  await expect(celebrity.locator('.story-film-dialog .product-film-slide.is-active')).toHaveAttribute('data-story-index', '1');
  await assertPlayingWithSound(celebrity);
  assert.match(await movie(celebrity).evaluate(video => video.currentSrc), /\/assets\/testimonials\/c2\.mp4$/);

  // A future salon film uses the same autoplay preview and vertical viewer.
  const flagship = await browser.newPage({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true });
  watch(flagship);
  await flagship.route('**/?flagship-player-fixture', async route => {
    const response = await route.fetch();
    const html = (await response.text()).replace(
      /(<section[^>]*id="flagship-store"[\s\S]*?<ul[^>]*>)[\s\S]*?<\/li>/,
      '$1<li class="voice-card is-active" data-voice><video playsinline preload="none" poster="/assets/testimonials/c1.webp" aria-label="Test salon film one"><source src="/assets/testimonials/c1.mp4" type="video/mp4"></video><button type="button" class="voice-play" aria-label="Open test salon film one with sound"><span class="voice-badge">Play</span></button></li><li class="voice-card" data-voice><video playsinline preload="none" poster="/assets/testimonials/c2.webp" aria-label="Test salon film two"><source src="/assets/testimonials/c2.mp4" type="video/mp4"></video><button type="button" class="voice-play" aria-label="Open test salon film two with sound"><span class="voice-badge">Play</span></button></li>',
    );
    await route.fulfill({ response, body: html });
  });
  await flagship.goto(`${base}/?flagship-player-fixture#flagship-store`, { waitUntil: 'domcontentloaded' });
  await assertCenteredPreview(flagship, '#flagship-store');
  await flagship.locator('#flagship-store .voice-play:not([disabled])').first().click();
  await assertPlayingWithSound(flagship);
  await flagship.locator('[data-story-next]').click();
  await expect(flagship.locator('.story-film-dialog .product-film-slide.is-active')).toHaveAttribute('data-story-index', '1');
  await assertPlayingWithSound(flagship);
  assert.match(await movie(flagship).evaluate(video => video.currentSrc), /\/assets\/testimonials\/c2\.mp4$/);
  await flagship.locator('[data-story-close]').click();
  await expect(viewer(flagship)).not.toBeVisible();

  assert.deepEqual(errors, []);
  console.log('Video player checks passed: sound on tap, full-screen shopping, real option selection, cart quantities, native vertical swipe, shared bag/checkout, close/focus return and client/celebrity/flagship playback.');
} finally {
  await browser.close();
  await server.close();
}
