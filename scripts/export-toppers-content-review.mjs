import { chromium } from '@playwright/test';
import { mkdir } from 'node:fs/promises';
import { resolve } from 'node:path';
import { pathToFileURL } from 'node:url';

// Export the separate approval draft. This does not build or alter toppers.html.
const input = resolve('review/toppers-content-review.html');
const output = resolve('output/pdf/toppers-content-review.pdf');
const screenshots = resolve('preview/toppers-content-review');
await mkdir(resolve('output/pdf'), { recursive: true });
await mkdir(screenshots, { recursive: true });

const browser = await chromium.launch({ channel: 'chrome', headless: true });
try {
  const page = await browser.newPage();
  const errors = [];
  page.on('pageerror', error => errors.push(error.message));
  await page.goto(pathToFileURL(input).href, { waitUntil: 'load' });

  for (const width of [320, 390, 1440]) {
    await page.setViewportSize({ width, height: 1000 });
    const overflows = await page.evaluate(() => document.documentElement.scrollWidth > innerWidth + 1);
    if (overflows) throw new Error(`The review layout overflows at ${width}px.`);
    if (width === 390) {
      await page.locator('#hero').screenshot({ path: resolve(screenshots, 'hero-mobile.png') });
      await page.locator('#compare').screenshot({ path: resolve(screenshots, 'comparison-mobile.png') });
    }
    if (width === 1440) {
      const sheets = page.locator('.sheet');
      for (let index = 0; index < await sheets.count(); index++) {
        await sheets.nth(index).screenshot({ path: resolve(screenshots, `sheet-${index + 1}.png`) });
      }
    }
  }

  const brokenAnchors = await page.locator('a[href^="#"]').evaluateAll(links =>
    links.map(link => link.getAttribute('href')).filter(href => !document.getElementById(href.slice(1)))
  );
  if (brokenAnchors.length) throw new Error(`Missing review anchors: ${brokenAnchors.join(', ')}`);
  if (errors.length) throw new Error(errors.join('\n'));

  await page.pdf({
    path: output,
    format: 'A4',
    preferCSSPageSize: true,
    printBackground: true,
    tagged: true,
    displayHeaderFooter: true,
    headerTemplate: '<span></span>',
    footerTemplate: '<div style="width:100%;padding:0 13mm;font:8px Arial;color:#555;display:flex;justify-content:space-between;"><span>ALCHEMANE / Hair toppers content review / v1</span><span><span class="pageNumber"></span> / <span class="totalPages"></span></span></div>',
  });
  console.log('Review rendered at 320, 390 and 1440px; links checked; PDF exported.');
  console.log(output);
} finally {
  await browser.close();
}
