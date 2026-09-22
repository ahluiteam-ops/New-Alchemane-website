import { chromium } from '@playwright/test';
import assert from 'node:assert/strict';
import { mkdir } from 'node:fs/promises';

const output = 'preview/stories-studio-qa';
await mkdir(output, { recursive: true });
const browser = await chromium.launch({ channel: 'chrome', headless: true });
const page = await browser.newPage({ viewport: { width: 1440, height: 1000 } });
const errors = [];
page.on('pageerror', error => errors.push(error.message));
page.on('response', response => { if (response.status() >= 400) errors.push(`${response.status()} ${response.url()}`); });
const clients = [['Priya S.', 'priya-s'], ['Ananya R.', 'ananya-r'], ['Divya M.', 'divya-m'], ['Ritika V.', 'ritika-v'], ['Meera K.', 'meera-k']];
try {
  await page.goto(process.env.BASE_URL ?? 'http://127.0.0.1:5173/', { waitUntil: 'networkidle' });
  await page.locator('.stories-section').scrollIntoViewIfNeeded();
  for (let i = 0; i < clients.length; i++) {
    const [name, slug] = clients[i];
    assert.equal(await page.locator('#story-person').textContent(), name);
    assert.equal(await page.locator('#story-image').getAttribute('src'), `/assets/stories/${slug}.webp`);
    assert.equal(await page.locator('#story-current').textContent(), String(i + 1).padStart(2, '0'));
    await page.locator('#story-image').evaluate(image => image.decode());
    assert.equal(await page.locator('#story-image').evaluate(image => getComputedStyle(image).objectFit), 'contain');
    assert.equal(await page.locator('#story-caption').textContent(), i < 3 ? 'Before / After' : `${name} · Client photograph`);
    await page.waitForTimeout(600);
    await page.locator('.stories-section').screenshot({ path: `${output}/desktop-${slug}.png` });
    if (i === 4) {
      assert.equal(await page.locator('#story-text').isHidden(), true);
      assert.equal(await page.locator('#story-product').isHidden(), true);
      assert.equal(await page.locator('#story-photo-title').isVisible(), true);
    }
    await page.getByRole('button', { name: 'Next story' }).click();
  }
  assert.equal(await page.locator('#story-person').textContent(), 'Priya S.');
  assert.equal(await page.locator('#story-text').isVisible(), true);
  await page.getByRole('button', { name: 'Previous story' }).focus();
  await page.keyboard.press('Enter');
  assert.equal(await page.locator('#story-person').textContent(), 'Meera K.');
  await page.locator('#studio').scrollIntoViewIfNeeded();
  await page.locator('.studio-photo').evaluate(image => image.decode());
  await page.waitForTimeout(600);
  await page.locator('#studio').screenshot({ path: `${output}/desktop-studio.png` });
  assert.equal(await page.locator('.studio-window').count(), 0);
  for (const width of [390, 320, 768]) {
    await page.setViewportSize({ width, height: 844 });
    for (const section of ['.stories-section', '#studio']) {
      await page.locator(section).scrollIntoViewIfNeeded();
      await page.waitForTimeout(300);
      assert.equal(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), true, `${section} overflows at ${width}`);
      await page.locator(section).screenshot({ path: `${output}/${width}-${section === '#studio' ? 'studio' : 'stories'}.png` });
    }
  }
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.getByRole('button', { name: 'Next story' }).click();
  assert.equal(await page.locator('#story-person').textContent(), 'Priya S.');
  assert.deepEqual(errors, []);
  console.log('Passed: five matching photographs, full-image fit, honest captions, quote visibility, wraparound, keyboard, studio image, responsive layouts, reduced motion.');
} finally { await browser.close(); }
