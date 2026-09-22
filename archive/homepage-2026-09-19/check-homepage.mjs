import { chromium } from '@playwright/test';
import { mkdir, writeFile } from 'node:fs/promises';
import assert from 'node:assert/strict';

await mkdir('preview/homepage-qa', { recursive: true });
const BASE = process.env.BASE_URL ?? 'http://localhost:5173';
const browser = await chromium.launch({ channel: 'chrome', headless: true });
const page = await browser.newPage({ viewport: { width: 1440, height: 1000 } });
const errors = [];
page.on('pageerror', error => errors.push(error.message));
page.on('console', message => { if (message.type() === 'error') errors.push(message.text()); });
page.on('response', response => { if (response.status() >= 400) errors.push(`${response.status()} ${response.url()}`); });
// Films are YouTube embeds; stub them so the check runs offline and deterministically.
await page.route(/youtube(-nocookie)?\.com|ytimg\.com|googlevideo\.com/, route => route.fulfill({ status: 200, contentType: 'text/html', body: '<!doctype html><title>film</title>' }));
try {
  await page.goto(BASE, { waitUntil: 'networkidle' });
  assert.equal(await page.locator('.home-rest section').count(), 15);
  await page.locator('.editorial-overture').screenshot({ path: 'preview/homepage-qa/desktop-editorial-overture.png' });
  for (const section of ['solutions', 'the-edit', 'toppers-film', 'in-motion', 'extensions-film', 'range', 'promise', 'craft', 'our-story', 'studio', 'hair-guide', 'questions', 'consultation']) {
    await page.locator(`#${section}`).scrollIntoViewIfNeeded();
    await page.waitForTimeout(900);
    await page.locator(`#${section}`).screenshot({ path: `preview/homepage-qa/desktop-${section}.png` });
  }
  await page.getByRole('tab', { name: 'A little more length' }).click();
  assert.match(await page.locator('#solution-panel h3').textContent(), /length/);
  await page.keyboard.press('ArrowDown');
  assert.equal(await page.locator('#tab-volume').getAttribute('aria-selected'), 'true');
  await page.getByRole('tab', { name: 'Hair toppers', exact: true }).click();
  assert.equal(await page.locator('.edit-card:visible').count(), 1);
  await page.getByRole('tab', { name: 'Hair extensions', exact: true }).click();
  assert.equal(await page.locator('.edit-card:visible').count(), 3);
  await page.getByRole('button', { name: 'Discover Halo Extensions' }).click();
  assert.equal(await page.locator('.product-dialog').evaluate(el => el.open), true);
  await page.keyboard.press('Escape');
  await page.getByRole('tab', { name: 'The full edit' }).click();

  // The full range: tabs, filters, keyboard, product links.
  await page.locator('#range').scrollIntoViewIfNeeded();
  assert.equal(await page.locator('#range-tab-toppers').getAttribute('aria-selected'), 'true');
  assert.equal(await page.locator('#range-panel-toppers .range-card:visible').count(), 4);
  await page.locator('#range-tab-extensions').click();
  assert.equal(await page.locator('#range-panel-extensions .range-card:visible').count(), 16);
  await page.locator('#range [data-range-filter="salon"]').click();
  assert.equal(await page.locator('#range-panel-extensions .range-card:visible').count(), 3);
  assert.match(await page.locator('[data-range-status]').textContent(), /Showing 3 salon-fitted extensions/);
  await page.locator('#range [data-range-filter="volume"]').click();
  assert.equal(await page.locator('#range-panel-extensions .range-card:visible').count(), 5);
  await page.locator('#range [data-range-filter="all"]').click();
  await page.locator('#range-tab-extensions').focus();
  await page.keyboard.press('ArrowLeft');
  assert.equal(await page.locator('#range-tab-toppers').getAttribute('aria-selected'), 'true');
  assert.equal(await page.locator('#range-panel-extensions').isHidden(), true);
  const productLinks = await page.locator('.range-link').evaluateAll(links => links.map(link => link.href));
  assert.equal(productLinks.length, 20);
  assert.ok(productLinks.every(href => href.startsWith('https://alchemane.com/products/')));
  await page.locator('#range-panel-toppers .range-card').first().hover();
  await page.waitForTimeout(300);
  assert.equal(await page.locator('#range-panel-toppers .range-card').first().evaluate(card => card.classList.contains('has-alt')), true);

  // Collection detail leads on to the right place in the range.
  await page.getByRole('button', { name: 'Discover Halo Extensions' }).click();
  await page.getByRole('button', { name: 'See the halo in the full range' }).click();
  await page.waitForTimeout(2800);
  assert.equal(await page.locator('#range-tab-extensions').getAttribute('aria-selected'), 'true');
  assert.equal(await page.locator('#range [data-range-filter="volume"]').getAttribute('aria-pressed'), 'true');
  assert.ok(await page.locator('#range').evaluate(el => Math.abs(el.getBoundingClientRect().top) < 60), 'range scrolled into view');

  // Films: nothing loads until asked; chapters start the film at their timestamp.
  assert.equal(await page.locator('.film-frame iframe').count(), 0);
  await page.locator('#toppers-film').scrollIntoViewIfNeeded();
  await page.locator('#toppers-film .chapter[data-t="88"]').click();
  const topperSrc = await page.locator('#toppers-film iframe').getAttribute('src');
  assert.ok(topperSrc.startsWith('https://www.youtube-nocookie.com/embed/9F83RHz2tjE?') && topperSrc.includes('start=88'));
  assert.equal(await page.locator('#toppers-film .chapter[data-t="88"]').getAttribute('aria-current'), 'true');
  await page.locator('#extensions-film').scrollIntoViewIfNeeded();
  await page.locator('#extensions-film .film-play').click();
  assert.ok((await page.locator('#extensions-film iframe').getAttribute('src')).includes('/embed/pjts71_5kWQ?'));
  await page.locator('#extensions-film .chapter[data-t="154"]').click();
  assert.equal(await page.locator('#extensions-film .chapter[data-t="154"]').getAttribute('aria-current'), 'true');
  const range = page.getByRole('slider', { name: 'Compare before and after' });
  await range.fill('75');
  assert.match(await range.getAttribute('aria-valuetext'), /75 percent before/);
  await page.getByRole('button', { name: 'Watch the transformation' }).click();
  await page.waitForTimeout(500);
  assert.equal(await page.locator('.film-dialog').evaluate(el => el.open), true);
  assert.ok(await page.locator('video').evaluate(el => el.readyState > 0));
  await page.keyboard.press('Escape');
  assert.equal(await page.locator('video').evaluate(el => el.paused), true);
  await page.getByRole('button', { name: 'Next story' }).click();
  assert.equal(await page.locator('#story-person').textContent(), 'Ananya R.');
  await page.getByRole('button', { name: 'Previous story' }).click();
  assert.equal(await page.locator('#story-person').textContent(), 'Priya S.');
  await page.getByRole('button', { name: 'Open your hair guide' }).click();
  assert.equal(await page.locator('.guide-dialog').evaluate(el => el.open), true);
  await page.getByRole('button', { name: 'Let’s find your match' }).click();
  assert.equal(await page.locator('.guide-dialog').evaluate(el => el.open), false);
  await page.locator('.faq-list summary').nth(0).click();
  await page.locator('.faq-list summary').nth(1).click();
  assert.equal(await page.locator('.faq-list details[open]').count(), 1);
  await page.getByLabel('Your name', { exact: true }).fill('Preview Visitor');
  await page.getByLabel('Phone number', { exact: true }).fill('9876543210');
  await page.getByLabel('Your city', { exact: true }).fill('Mumbai');
  await page.getByLabel('What are you looking for?').selectOption('More volume');
  await page.getByRole('button', { name: 'Prepare my consultation request' }).click();
  assert.equal(await page.locator('.consultation-status').isVisible(), true);
  const destination = await page.locator('#send-consultation').getAttribute('href');
  assert.ok(destination.startsWith('https://wa.me/919967123333?text='));
  assert.ok(decodeURIComponent(destination).includes('Hair goal: More volume'));
  await page.getByLabel('Your city', { exact: true }).fill('Pune');
  assert.equal(await page.locator('.consultation-status').isVisible(), false);
  assert.equal(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), true);
  for (const width of [390, 320, 768]) {
    await page.setViewportSize({ width, height: 844 });
    await page.goto(BASE, { waitUntil: 'networkidle' });
    for (const section of ['solutions', 'the-edit', 'toppers-film', 'in-motion', 'extensions-film', 'range', 'promise', 'our-story', 'consultation']) {
      await page.locator(`#${section}`).scrollIntoViewIfNeeded();
      await page.waitForTimeout(800);
      assert.equal(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), true, `${width}px overflow at ${section}`);
      if (width === 390) await page.locator(`#${section}`).screenshot({ path: `preview/homepage-qa/mobile-${section}.png` });
    }
    if (width === 390) {
      assert.equal(await page.locator('#toppers-film .chapter-list li:visible').count(), 4);
      await page.getByRole('button', { name: 'Show all 11 chapters' }).click();
      assert.equal(await page.locator('#toppers-film .chapter-list li:visible').count(), 11);
      await page.locator('#range-tab-extensions').click();
      await page.waitForTimeout(1400);
      await page.locator('#range').screenshot({ path: 'preview/homepage-qa/mobile-range-extensions.png' });
      assert.equal(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), true, '390px overflow with extensions');
    }
    await page.locator('.site-footer').scrollIntoViewIfNeeded();
    await page.locator('.site-footer').screenshot({ path: `preview/homepage-qa/footer-${width}.png` });
  }
  // Header links open the range on the matching category.
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.goto(BASE, { waitUntil: 'networkidle' });
  await page.getByRole('link', { name: 'Hair Extensions', exact: true }).click();
  await page.waitForTimeout(3200);
  assert.equal(await page.locator('#range-tab-extensions').getAttribute('aria-selected'), 'true');
  assert.ok(await page.locator('#range').evaluate(el => Math.abs(el.getBoundingClientRect().top) < 60), 'header link reaches the range');
  // The promise band's cutout tilts on pointer move, and stays put under reduced motion.
  await page.locator('#promise').scrollIntoViewIfNeeded();
  const promiseImg = page.locator('.promise-figure img');
  const box = await page.locator('.promise-panel').boundingBox();
  await page.mouse.move(box.x + box.width * 0.15, box.y + box.height * 0.15);
  await page.waitForTimeout(500);
  const tiltedTransform = await promiseImg.evaluate(el => getComputedStyle(el).transform);
  assert.notEqual(tiltedTransform, 'none', 'promise figure tilts on pointer move');
  await page.mouse.move(box.x + box.width / 2, box.y - 40);

  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto(BASE, { waitUntil: 'networkidle' });
  assert.equal(await page.locator('.reveal-on-scroll').first().evaluate(el => getComputedStyle(el).opacity), '1');
  await page.locator('#promise').scrollIntoViewIfNeeded();
  const stillBox = await page.locator('.promise-panel').boundingBox();
  await page.mouse.move(stillBox.x + stillBox.width * 0.15, stillBox.y + stillBox.height * 0.15);
  await page.waitForTimeout(400);
  assert.equal(await page.locator('.promise-figure img').evaluate(el => getComputedStyle(el).transform), 'none', 'no tilt under reduced motion');
  assert.deepEqual(errors, []);
  await writeFile('preview/homepage-qa/results.json', JSON.stringify({ passed: true, checks: ['15 sections present', 'promise band tilts on pointer, still under reduced motion', 'full range tabs, filters, keyboard and product links', 'collection detail to range deep link', 'header links to range', 'films load on demand and seek to chapters', 'mobile chapter disclosure', 'keyboard accessible solution tabs', 'product filters and dialogs', 'comparison slider', 'video load and pause on close', 'story navigation', 'guide modal', 'exclusive FAQs', 'consultation message preparation and stale reset', '320/390/768/1440 widths', 'reduced motion'], errors }, null, 2));
  console.log('Homepage interaction and responsive checks passed.');
} finally { await browser.close(); }
