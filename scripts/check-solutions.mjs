import { chromium } from '@playwright/test';
import assert from 'node:assert/strict';
import { mkdir } from 'node:fs/promises';

const base = process.env.BASE_URL ?? 'http://127.0.0.1:5173';
const output = 'preview/solutions-check';
await mkdir(output, { recursive: true });
const browser = await chromium.launch({ headless: true });
try {
  for (const device of [
    { name: 'desktop', width: 1440, height: 900 },
    { name: 'laptop', width: 1024, height: 768 },
    { name: 'phone', width: 390, height: 844, isMobile: true, hasTouch: true },
    { name: 'small-phone', width: 360, height: 740, isMobile: true, hasTouch: true },
    { name: 'compact-phone', width: 320, height: 640, isMobile: true, hasTouch: true },
    { name: 'short-phone', width: 320, height: 568, isMobile: true, hasTouch: true },
    { name: 'reduced', width: 390, height: 844, reducedMotion: 'reduce' },
  ]) {
    const { name, width, height, ...options } = device;
    const page = await browser.newPage({ viewport: { width, height }, ...options });
    const errors = [];
    page.on('pageerror', error => errors.push(error.message));
    page.on('response', response => { if (response.status() >= 400 && response.url().startsWith(base)) errors.push(`${response.status()} ${response.url()}`); });
    // Isolate this section from the unrelated timed marketing modal.
    await page.addInitScript(() => {
      const original = HTMLDialogElement.prototype.showModal;
      HTMLDialogElement.prototype.showModal = function () { if (!this.classList.contains('offer-dialog')) original.call(this); };
    });
    await page.goto(base, { waitUntil: 'networkidle' });
    await page.evaluate(() => document.fonts.ready);
    await page.waitForTimeout(500);
    const pinned = name !== 'reduced' && name !== 'short-phone';
    const bounds = await page.evaluate(() => {
      const stage = document.querySelector('.solutions-stage');
      const parent = stage.parentElement.classList.contains('pin-spacer') ? stage.parentElement : stage;
      return { start: parent.getBoundingClientRect().top + scrollY, distance: stage.offsetHeight * (innerWidth <= 760 ? 1.65 : 2.4) };
    });
    const scrollToState = async index => {
      await page.evaluate(({ bounds, index, pinned }) => scrollTo({ top: bounds.start + (pinned ? bounds.distance * (index + .5) / 3 : 0), behavior: 'instant' }), { bounds, index, pinned });
      await page.waitForTimeout(800);
    };
    await scrollToState(0);
    for (let i = 0; i < 3; i++) {
      if (pinned) await scrollToState(i);
      else await page.locator(`.solutions-tab[data-solution="${i}"]`).click();
      assert.equal(await page.locator(`.solutions-tab[data-solution="${i}"]`).getAttribute('aria-selected'), 'true', `${name}: selected ${i}`);
      const metrics = await page.locator(`.solutions-panel[data-solution-panel="${i}"]`).evaluate(panel => {
        const copy = panel.querySelector('.solutions-copy').getBoundingClientRect();
        const photo = panel.querySelector('img').getBoundingClientRect();
        const stage = document.querySelector('.solutions-stage').getBoundingClientRect();
        return { copyTop: copy.top, copyBottom: copy.bottom, photoTop: photo.top, photoBottom: photo.bottom, photoWidth: photo.width, stageBottom: stage.bottom, imageLoaded: panel.querySelector('img').naturalWidth > 0, opacity: getComputedStyle(panel).opacity, inert: panel.inert, overflow: document.documentElement.scrollWidth - innerWidth };
      });
      assert.equal(metrics.inert, false);
      assert.equal(metrics.imageLoaded, true, `${name}: image loaded`);
      assert.equal(Number(metrics.opacity), 1, `${name}: transition settled`);
      assert.ok(metrics.overflow <= 1, `${name}: no horizontal overflow`);
      if (pinned) {
        assert.ok(metrics.copyTop >= 0, `${name}: copy in viewport`);
        assert.ok(metrics.photoBottom <= height - 25, `${name}: photo in viewport`);
        assert.ok(metrics.copyBottom <= metrics.stageBottom, `${name}: copy within stage`);
        assert.ok(metrics.photoBottom <= metrics.stageBottom, `${name}: photo within stage`);
        if (width <= 760) assert.ok(metrics.photoTop >= metrics.copyBottom, `${name}: image below copy`);
      }
      await page.screenshot({ path: `${output}/${name}-${i + 1}.png` });
      console.log(name, i + 1, metrics);
    }
    // Pointer, reverse scroll, keyboard, and category CTA all update the same state.
    await page.locator('.solutions-tab[data-solution="0"]').click();
    await page.waitForTimeout(1200);
    assert.equal(await page.locator('.solutions-tab[data-solution="0"]').getAttribute('aria-selected'), 'true');
    await page.locator('.solutions-tab[data-solution="0"]').focus();
    await page.keyboard.press('ArrowRight');
    await page.waitForTimeout(1200);
    assert.equal(await page.locator('.solutions-tab[data-solution="1"]').getAttribute('aria-selected'), 'true');
    assert.equal(await page.locator('.solutions-panel[aria-hidden="false"]').count(), 1);
    assert.equal(await page.locator('.solutions-panel[inert]').count(), 2);
    await page.locator('#solution-panel-extensions .solutions-link').click();
    assert.equal(new URL(page.url()).searchParams.get('category'), 'extensions');
    assert.equal(await page.locator('#range-title').textContent(), 'Hair Extensions');
    assert.deepEqual(errors, [], `${name}: no runtime or resource errors`);
    await page.close();
  }
  const noJs = await browser.newPage({ javaScriptEnabled: false, viewport: { width: 390, height: 844 } });
  await noJs.goto(base);
  assert.equal(await noJs.locator('.solutions-panel:visible').count(), 3, 'No-JS fallback contains every solution');
  await noJs.close();
  console.log('Solutions checks passed.');
} finally { await browser.close(); }
