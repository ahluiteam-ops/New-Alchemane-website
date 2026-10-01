import { chromium } from '@playwright/test';
import { createServer } from 'vite';

const port = 4177;
const base = `http://127.0.0.1:${port}`;
const files = Array.from({ length: 7 }, (_, index) => index + 1);
const server = await createServer({
  logLevel: 'silent',
  server: { host: '127.0.0.1', port, strictPort: true },
});

await server.listen();
const browser = await chromium.launch({ channel: 'chrome', headless: true });

try {
  const page = await browser.newPage({ viewport: { width: 390, height: 700 } });
  await page.goto(base, { waitUntil: 'domcontentloaded' });

  for (const number of files) {
    await page.setContent(`<video muted playsinline src="/assets/permanent/testimonial-${number}.mp4" style="display:block;width:390px;height:auto"></video>`);
    const video = page.locator('video');
    await video.evaluate(async element => {
      await new Promise((resolve, reject) => {
        element.addEventListener('loadedmetadata', resolve, { once: true });
        element.addEventListener('error', reject, { once: true });
        element.load();
      });
      element.currentTime = Math.min(0.5, Math.max(0.05, element.duration * 0.1));
      await new Promise((resolve, reject) => {
        element.addEventListener('seeked', resolve, { once: true });
        element.addEventListener('error', reject, { once: true });
      });
    });
    await video.screenshot({ path: `public/assets/permanent/testimonial-${number}.jpg`, type: 'jpeg', quality: 84 });
  }
} finally {
  await browser.close();
  await server.close();
}
