import { chromium, expect } from '@playwright/test';
import assert from 'node:assert/strict';
import { mkdir } from 'node:fs/promises';

const base = process.env.BASE_URL ?? 'http://127.0.0.1:5173';
const out = 'preview/topper-consultation-sections-qa';
await mkdir(out, { recursive: true });
const browser = await chromium.launch({ headless: true });
try {
  for (const [width, height] of [[320, 740], [390, 844], [768, 1024], [844, 390], [1440, 1000]]) {
    const page = await browser.newPage({ viewport: { width, height }, reducedMotion: 'reduce', isMobile: width < 700, hasTouch: width < 700 });
    const errors = [];
    const loadedConsultationVideos = [];
    page.on('pageerror', error => errors.push(error.message));
    page.on('response', response => { if (response.url().startsWith(base) && response.status() >= 400) errors.push(`${response.status()} ${response.url()}`); });
    page.on('request', request => { if (/\/topper-consultation\/consult-\d\.mp4/.test(request.url())) loadedConsultationVideos.push(request.url()); });
    await page.addInitScript(() => { window.__drafts = []; window.open = url => { window.__drafts.push(String(url)); return null; }; });
    await page.goto(`${base}/toppers.html`, { waitUntil: 'networkidle' });
    const section = page.locator('#how');
    await expect(section.locator('h2')).toHaveText('Prefer a consultation before you buy');
    await expect(section.locator('video')).toHaveCount(3);
    await expect(section.locator('.pe-vplay')).toHaveCount(3);
    for (let index = 0; index < 3; index++) {
      const video = section.locator('video').nth(index);
      await expect(video.locator('source')).toHaveAttribute('src', `/assets/topper-consultation/consult-${index + 1}.mp4`);
      await expect(video).toHaveAttribute('poster', `/assets/topper-consultation/consult-${index + 1}.webp`);
      assert(await video.evaluate(video => video.paused && video.preload === 'none' && !video.autoplay));
    }
    assert.deepEqual(loadedConsultationVideos, [], 'Consultation clips should not download before playback');
    await expect(page.locator('#consultation-promise')).toContainText('100% consultation fee-back guarantee');
    await expect(page.locator('#consultation-promise')).toContainText('Limited to 30 consultations per week');
    await expect(page.locator('#book-title')).toHaveText('Book your consultation.');
    await expect(page.getByRole('textbox', { name: 'Your city (optional)' })).toHaveAttribute('autocomplete', 'address-level2');
    await expect(page.locator('#booking-date')).toHaveCount(0);
    await expect(page.locator('#book')).toContainText('₹299');
    await section.locator('[data-consultation-mode="studio"]').click();
    await expect(page.locator('#book [value="studio"]')).toBeChecked();
    await expect(section.locator('[data-consultation-choice-cta]')).toHaveText('Book an offline consultation');
    await section.locator('[data-consultation-choice-cta]').click();
    await expect(page).toHaveURL(/#book$/);
    await page.locator('#booking-submit').click();
    await expect(page.locator('#booking-errors')).toBeFocused();
    assert.equal(await page.evaluate(() => window.__drafts.length), 0);
    await page.locator('#booking-name').fill('Topper QA');
    await page.locator('#booking-phone').fill('+91 90000 00000');
    await page.locator('#booking-city').fill('London');
    await page.locator('#booking-submit').click();
    const request = new URL(await page.evaluate(() => window.__drafts[0]));
    assert.equal(request.pathname, '/919967123333');
    assert(request.searchParams.get('text').includes('City: London') && !request.searchParams.get('text').includes('Preferred date:'));
    assert(request.searchParams.get('text').includes('In person') && request.searchParams.get('text').includes('₹299'));
    await page.locator('#book .tp-meet-choice').filter({ hasText: 'Online' }).click();
    await expect(section.locator('[data-consultation-mode="online"]')).toHaveAttribute('aria-pressed', 'true');
    if (width === 390) {
      const first = section.locator('video').nth(0);
      const second = section.locator('video').nth(1);
      await section.locator('.pe-vplay').nth(0).click();
      await expect.poll(() => first.evaluate(video => !video.paused && video.readyState >= 2)).toBe(true);
      await section.locator('.pe-vplay').nth(1).click();
      await expect.poll(() => second.evaluate(video => !video.paused && video.readyState >= 2)).toBe(true);
      await expect.poll(() => first.evaluate(video => video.paused)).toBe(true);
      await page.locator('#consultation-promise').scrollIntoViewIfNeeded();
      await expect.poll(() => second.evaluate(video => video.paused)).toBe(true);
      await section.locator('.pe-vplay').nth(2).click();
      await expect.poll(() => section.locator('video').nth(2).evaluate(video => !video.paused && video.readyState >= 2)).toBe(true);
      await section.locator('video').nth(2).evaluate(video => video.pause());
      const track = section.locator('.pe-vtrack');
      await track.focus();
      await page.keyboard.press('ArrowLeft');
      assert(await track.evaluate(track => track.scrollWidth > track.clientWidth), 'Phone consultation row should swipe');
      await expect(section.locator('.pe-dots span')).toHaveCount(3);
    }
    assert(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), `Overflow at ${width}`);
    const missingAnchors = await page.locator('a[href^="#"]').evaluateAll(links => links.map(link => link.getAttribute('href')).filter(href => href.length > 1 && !document.getElementById(href.slice(1))));
    assert.deepEqual(missingAnchors, []);
    await page.addStyleTag({ content: '.pe-header { visibility: hidden !important; }' });
    for (const id of ['how', 'consultation-promise', 'book']) await page.locator(`#${id}`).screenshot({ path: `${out}/${id}-${width}.png` });
    assert.deepEqual(errors, []);
    console.log(`Passed topper consultation sections ${width} × ${height}`);
    await page.close();
  }
} finally { await browser.close(); }
