import { chromium, expect } from '@playwright/test';
import { createServer } from 'vite';

const port = 4175;
const base = `http://127.0.0.1:${port}`;
const server = await createServer({
  logLevel: 'silent',
  server: { host: '127.0.0.1', port, strictPort: true },
});
await server.listen();

const browser = await chromium.launch({ channel: 'chrome', headless: true });
try {
  for (const setup of [
    { width: 390, height: 844, isMobile: true, hasTouch: true, visible: 1 },
    { width: 1440, height: 1000, isMobile: false, hasTouch: false, visible: 3 },
  ]) {
    const page = await browser.newPage({
      viewport: { width: setup.width, height: setup.height },
      isMobile: setup.isMobile,
      hasTouch: setup.hasTouch,
    });
    const errors = [];
    page.on('pageerror', error => errors.push(error.message));
    await page.goto(base, { waitUntil: 'networkidle' });
    await page.locator('.stories-section').scrollIntoViewIfNeeded();

    const slides = page.locator('.story-slide');
    const next = page.getByRole('button', { name: 'Next transformation' });
    const previous = page.getByRole('button', { name: 'Previous transformation' });
    await expect(slides).toHaveCount(9);
    await expect(next).toBeVisible();
    await expect(previous).toBeVisible();
    await expect(page.locator('.story-slide[aria-hidden="false"]')).toHaveCount(setup.visible);

    if (setup.hasTouch) {
      const target = await next.boundingBox();
      if (!target || target.width < 44 || target.height < 44) throw new Error('Mobile carousel controls must be at least 44 by 44 CSS pixels.');
    }

    const viewport = page.locator('.story-photo-frame');
    const initialScroll = await viewport.evaluate(node => node.scrollLeft);
    if (setup.hasTouch) await next.tap();
    else await next.click();
    await expect(slides.first()).toHaveAttribute('aria-hidden', 'true');
    await expect.poll(() => viewport.evaluate(node => node.scrollLeft)).toBeGreaterThan(initialScroll);

    if (setup.hasTouch) await previous.tap();
    else await previous.click();
    await expect(slides.first()).toHaveAttribute('aria-hidden', 'false');
    await expect.poll(() => viewport.evaluate(node => node.scrollLeft)).toBeLessThanOrEqual(1);

    if (setup.hasTouch) {
      const seen = [];
      for (let index = 0; index < 9; index += 1) {
        seen.push(await page.locator('.story-slide[aria-hidden="false"] img').first().getAttribute('src'));
        await next.tap();
      }
      if (new Set(seen).size !== 9) throw new Error(`Mobile carousel did not visit all nine transformations: ${seen.join(', ')}`);
      await expect(slides.first()).toHaveAttribute('aria-hidden', 'false');
    }
    if (errors.length) throw new Error(errors.join('\n'));
    await page.close();
  }

  console.log('Story carousel checks passed: native scroll movement, 1 mobile slide, 3 desktop slides, touch and pointer arrows working.');
} finally {
  await browser.close();
  await server.close();
}
