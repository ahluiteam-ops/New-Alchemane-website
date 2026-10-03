import { mkdir } from 'node:fs/promises';
import { chromium } from '@playwright/test';

const baseUrl = process.env.PREVIEW_URL || 'http://127.0.0.1:5173';
const outputDir = 'preview/specialist-section';
const viewports = [
  { name: 'mobile-small', width: 320, height: 700 },
  { name: 'mobile', width: 375, height: 812 },
  { name: 'mobile-landscape', width: 812, height: 375 },
  { name: 'tablet', width: 768, height: 1024 },
  { name: 'desktop', width: 1440, height: 900 },
];

await mkdir(outputDir, { recursive: true });
const browser = await chromium.launch({ headless: true });

try {
  for (const viewport of viewports) {
    const page = await browser.newPage({ viewport });
    await page.goto(`${baseUrl}/permanent-extensions.html`, { waitUntil: 'networkidle' });

    const section = page.locator('.pe-specialist');
    await section.scrollIntoViewIfNeeded();
    await section.screenshot({ path: `${outputDir}/${viewport.name}.png` });

    const result = await page.evaluate(() => {
      const body = document.body;
      const section = document.querySelector('.pe-specialist');
      const title = section?.querySelector('h2');
      const video = section?.querySelector('video');
      const videoSource = video?.querySelector('source');
      const cta = section?.querySelector('.pe-btn');
      const ctaBox = cta?.getBoundingClientRect();
      const headingLines = new Set(
        [...(title?.querySelectorAll('span') || [])].map((span) => Math.round(span.getBoundingClientRect().top)),
      ).size;

      return {
        horizontalOverflow: body.scrollWidth > body.clientWidth,
        title: title?.textContent?.trim(),
        headingLines,
        videoSource: videoSource?.getAttribute('src'),
        videoPoster: video?.getAttribute('poster'),
        ctaHeight: Math.round(ctaBox?.height || 0),
      };
    });

    if (result.horizontalOverflow) throw new Error(`${viewport.name}: horizontal overflow`);
    if (viewport.width < 700 && result.headingLines !== 2) throw new Error(`${viewport.name}: heading is not two lines`);
    if (result.videoSource !== '/assets/permanent/why.mp4') throw new Error(`${viewport.name}: previous specialist video is missing`);
    if (result.videoPoster !== '/assets/permanent/why-poster.webp') throw new Error(`${viewport.name}: specialist video poster is missing`);
    if (result.ctaHeight < 44) throw new Error(`${viewport.name}: CTA is smaller than 44px`);

    console.log(`${viewport.name}: ${JSON.stringify(result)}`);
    await page.close();
  }
} finally {
  await browser.close();
}
