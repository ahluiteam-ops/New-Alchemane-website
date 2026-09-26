import { chromium } from '@playwright/test';
import assert from 'node:assert/strict';
import { mkdir } from 'node:fs/promises';

const browser = await chromium.launch({ headless: true });
await mkdir('preview/quality-banner', { recursive: true });
try {
  for (const [name, width, height, reducedMotion] of [
    ['desktop', 1440, 900, 'no-preference'],
    ['laptop', 1024, 768, 'no-preference'],
    ['tablet', 768, 1024, 'no-preference'],
    ['mobile', 390, 844, 'no-preference'],
    ['small-mobile', 320, 740, 'no-preference'],
    ['reduced-mobile', 390, 844, 'reduce'],
  ]) {
    const page = await browser.newPage({ viewport: { width, height }, reducedMotion });
    const errors = [];
    page.on('pageerror', error => errors.push(error.message));
    page.on('response', response => {
      if (response.status() >= 400 && response.url().includes('/assets/quality/')) errors.push(response.url());
    });
    await page.addInitScript(() => {
      const original = HTMLDialogElement.prototype.showModal;
      HTMLDialogElement.prototype.showModal = function () {
        if (!this.classList.contains('offer-dialog')) original.call(this);
      };
    });
    await page.goto('http://127.0.0.1:5173', { waitUntil: 'networkidle' });
    await page.evaluate(() => document.fonts.ready);
    await page.waitForTimeout(400);
    const section = page.locator('.quality-banner');
    assert.equal(await section.evaluate(el => el.previousElementSibling.classList.contains('stories-section')), true, `${name}: placement`);
    assert.deepEqual(await section.locator('.quality-banner-list li > span:last-child').allTextContents(), [
      '100% Pro-GradeHuman Hair', 'Ethically Sourced &Carefully Treated', 'Alchemane QualityGuarantee',
    ], `${name}: claim word spacing`);
    await section.scrollIntoViewIfNeeded();
    await page.locator('.quality-banner-picture img').evaluate(img => img.decode());
    assert.equal(await section.locator('h2, .quality-banner-kicker, .quality-banner-number').count(), 0, `${name}: no extra copy`);
    const transforms = [];
    for (const position of [.85, .3, -.25]) {
      await section.evaluate((el, position) => scrollTo({ top: scrollY + el.getBoundingClientRect().top - innerHeight * position, behavior: 'instant' }), position);
      await page.waitForTimeout(650);
      const metrics = await section.evaluate(el => {
        const frame = el.querySelector('.quality-banner-media');
        const picture = el.querySelector('picture');
        const img = el.querySelector('img');
        const f = frame.getBoundingClientRect();
        const p = picture.getBoundingClientRect();
        return {
          covered: p.top <= Math.max(0, f.top) + 1 && p.bottom >= Math.min(innerHeight, f.bottom) - 1 && p.left <= f.left + 1 && p.right >= f.right - 1,
          pictureTop: p.top,
          clip: getComputedStyle(frame).overflow,
          transform: getComputedStyle(picture).transform,
          source: img.currentSrc,
          loaded: img.naturalWidth > 0,
          overflow: document.documentElement.scrollWidth - innerWidth,
          overlay: getComputedStyle(frame, '::after').content,
          textColors: [...el.querySelectorAll('li')].map(li => getComputedStyle(li).color),
          rules: [...el.querySelectorAll('li')].slice(1).map(li => {
            const css = getComputedStyle(li, '::before');
            return { width: css.width, height: parseFloat(css.height), color: css.backgroundColor };
          }),
          items: [...el.querySelectorAll('li')].map(li => {
            const b = li.getBoundingClientRect();
            return { x: b.x, y: b.y, width: b.width };
          }),
        };
      });
      assert.ok(metrics.covered, `${name}: image covers frame throughout parallax`);
      assert.equal(metrics.clip, 'hidden');
      assert.ok(metrics.loaded);
      assert.ok(metrics.overflow <= 1, `${name}: no horizontal overflow`);
      assert.equal(metrics.overlay, 'none', `${name}: no white photo overlay`);
      assert.deepEqual(metrics.textColors, Array(3).fill('rgb(255, 255, 255)'), `${name}: matching claim colors`);
      assert.ok(metrics.rules.every(rule => rule.width === '1px' && rule.height >= 48 && rule.color === 'rgb(255, 255, 255)'), `${name}: matching vertical dividers`);
      if (width <= 700) {
        assert.ok(metrics.items.every(item => Math.abs(item.x + item.width / 2 - width / 2) < 1), `${name}: mobile centered stack`);
        assert.ok(metrics.items[1].y > metrics.items[0].y);
      } else {
        assert.ok(metrics.items.every(item => Math.abs(item.y - metrics.items[0].y) < 1), `${name}: desktop single row`);
      }
      if (reducedMotion !== 'reduce') assert.ok(Math.abs(metrics.pictureTop) <= 2, `${name}: image stays viewport-fixed (${metrics.pictureTop})`);
      assert.ok(metrics.source.includes(width <= 700 ? 'daylight-mobile' : 'daylight-desktop'));
      transforms.push(metrics.transform);
    }
    assert.equal(new Set(transforms).size > 1, reducedMotion !== 'reduce', `${name}: motion preference`);
    if (reducedMotion !== 'reduce') {
      for (const offset of [-100, 180, -60]) {
        await section.evaluate((el, offset) => scrollTo({ top: scrollY + el.getBoundingClientRect().top + offset, behavior: 'instant' }), offset);
        await page.waitForTimeout(70);
        const top = await section.locator('picture').evaluate(el => el.getBoundingClientRect().top);
        assert.ok(Math.abs(top) <= 2, `${name}: viewport lock during fast scroll`);
      }
    }
    await section.evaluate(el => scrollTo({ top: scrollY + el.getBoundingClientRect().top, behavior: 'instant' }));
    await page.waitForTimeout(650);
    await section.screenshot({ path: `preview/quality-banner/${name}.png` });
    assert.deepEqual(errors, [], `${name}: browser errors`);
    console.log(`${name}: placement, responsive image, clipping, motion, contrast and overflow passed`);
    await page.close();
  }
} finally {
  await browser.close();
}
