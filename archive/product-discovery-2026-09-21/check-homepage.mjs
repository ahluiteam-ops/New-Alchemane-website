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
  assert.equal(await page.locator('.home-rest section').count(), 12);
  assert.equal(await page.locator('#solutions, #in-motion, #hair-guide, .quality-ribbon, .film-dialog, .guide-dialog').count(), 0);
  assert.equal(await page.locator('.reel-pending').count(), 2);
  assert.equal(await page.locator('.reel-frame button, .reel-frame iframe').count(), 0);
  assert.equal(await page.locator('body').evaluate(el => getComputedStyle(el).fontFamily.includes('Source Sans 3')), true);
  assert.equal(await page.locator('h2').first().evaluate(el => getComputedStyle(el).fontFamily.includes('Source Serif 4')), true);
  const brokenAnchors = await page.locator('a[href^="#"]').evaluateAll(links => links.map(link => link.getAttribute('href')).filter(href => href.length > 1 && !document.getElementById(href.slice(1))));
  assert.deepEqual(brokenAnchors, []);
  await page.locator('.editorial-overture').screenshot({ path: 'preview/homepage-qa/desktop-editorial-overture.png' });
  for (const section of ['the-edit', 'toppers-film', 'extensions-film', 'range', 'craft', 'our-story', 'studio', 'questions', 'consultation']) {
    await page.locator(`#${section}`).scrollIntoViewIfNeeded();
    await page.waitForTimeout(900);
    await page.locator(`#${section}`).screenshot({ path: `preview/homepage-qa/desktop-${section}.png` });
  }
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

  // Reel frames keep their portrait aspect ratio and links select the matching range.
  for (const kind of ['toppers', 'extensions']) {
    const ratio = await page.locator('#' + kind + '-film .reel-frame').evaluate(el => el.clientWidth / el.clientHeight);
    assert.ok(Math.abs(ratio - 9 / 16) < 0.01);
    await page.locator('#' + kind + '-film .text-link').click();
    await page.waitForTimeout(1000);
    assert.equal(await page.locator('#range-tab-' + kind).getAttribute('aria-selected'), 'true');
  }
  await page.getByRole('button', { name: 'Next story' }).click();
  assert.equal(await page.locator('#story-person').textContent(), 'Ananya R.');
  await page.getByRole('button', { name: 'Previous story' }).click();
  assert.equal(await page.locator('#story-person').textContent(), 'Priya S.');
  await page.locator('.faq-list summary').nth(0).click();
  await page.locator('.faq-list summary').nth(1).click();
  assert.equal(await page.locator('.faq-list details[open]').count(), 1);
  await page.getByLabel('Your name', { exact: true }).fill('Preview Visitor');
  await page.getByLabel('Phone number', { exact: true }).fill('9876543210');
  await page.getByLabel('Your city', { exact: true }).fill('Mumbai');
  await page.getByLabel('What are you looking for?').selectOption('More volume');
  await page.getByRole('button', { name: 'Continue to WhatsApp' }).click();
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
    for (const section of ['the-edit', 'toppers-film', 'extensions-film', 'range', 'our-story', 'consultation']) {
      await page.locator(`#${section}`).scrollIntoViewIfNeeded();
      await page.waitForTimeout(800);
      assert.equal(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), true, `${width}px overflow at ${section}`);
      if (width === 390) await page.locator(`#${section}`).screenshot({ path: `preview/homepage-qa/mobile-${section}.png` });
    }
    if (width === 390) {
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
  // The promise band is hidden for now; it stays in the markup so it can be restored.
  assert.equal(await page.locator('#promise').isVisible(), false, 'promise band is hidden');

  // The overture holds its portrait still while the copy is carried up over it
  // and #the-edit rides in to cover it (src/sections/overture.{css,js}).
  const stageTop = await page.evaluate(() => Math.round(document.querySelector('.overture-stage').getBoundingClientRect().top + scrollY));
  const overtureAt = async (screens) => {
    await page.evaluate(([top, s]) => scrollTo(0, top + innerHeight * s), [stageTop, screens]);
    await page.waitForTimeout(500);
    return page.evaluate(() => {
      const top = selector => Math.round(document.querySelector(selector).getBoundingClientRect().top);
      return { img: top('.editorial-overture > img'), copy: top('.editorial-overture-copy'), edit: top('#the-edit') };
    });
  };
  const overtureStart = await overtureAt(0);
  const overtureMid = await overtureAt(0.6);
  const overtureCovered = await overtureAt(1.6);
  assert.equal(overtureStart.img, 0, 'portrait pins to the top of the viewport');
  assert.equal(overtureMid.img, 0, 'portrait stays still while the copy travels');
  assert.ok(overtureMid.copy < overtureStart.copy - 200, 'copy is carried up past the top edge');
  assert.ok(overtureCovered.edit <= 0, 'the next section covers the pinned portrait');
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto(BASE, { waitUntil: 'networkidle' });
  assert.equal(await page.locator('.reveal-on-scroll').first().evaluate(el => getComputedStyle(el).opacity), '1');
  assert.equal(await page.locator('.editorial-overture > img').evaluate(el => getComputedStyle(el).transform), 'none');
  assert.equal(await page.locator('.editorial-overture').evaluate(el => getComputedStyle(el).position), 'relative', 'no pinning under reduced motion');
  assert.deepEqual(errors, []);
  await writeFile('preview/homepage-qa/results.json', JSON.stringify({ passed: true, checks: ['12 sections present; requested sections archived', 'portrait reel placeholders and category links', 'no broken local anchor links', 'local font families', 'full range tabs, filters, keyboard and product links', 'collection and header navigation', 'product filters and dialogs', 'story navigation', 'exclusive FAQs', 'consultation handoff and stale reset', '320/390/768/1440 widths', 'campaign parallax and reduced motion'], errors }, null, 2));
  console.log('Homepage interaction and responsive checks passed.');
} finally { await browser.close(); }
