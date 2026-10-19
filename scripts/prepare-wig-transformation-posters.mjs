import { chromium } from '@playwright/test';
import { createServer } from 'vite';
import sharp from 'sharp';

const port = 4178;
const server = await createServer({
  logLevel: 'silent',
  server: { host: '127.0.0.1', port, strictPort: true },
});
await server.listen();
const browser = await chromium.launch({ channel: 'chrome', headless: true });

try {
  const page = await browser.newPage();
  await page.goto(`http://127.0.0.1:${port}/wigs.html`, { waitUntil: 'domcontentloaded' });
  for (const { cut, width } of [
    { cut: 'mobile', width: 560 },
    { cut: 'desktop', width: 960 },
  ]) {
    const png = await page.evaluate(async ({ cut, width }) => {
      const video = document.createElement('video');
      video.preload = 'auto';
      video.muted = true;
      video.src = `/assets/wigs/transformations-${cut}.mp4`;
      document.body.append(video);
      try {
        await new Promise((resolve, reject) => {
          video.addEventListener('loadeddata', resolve, { once: true });
          video.addEventListener('error', () => reject(new Error(`Cannot decode ${cut} video`)), { once: true });
          video.load();
        });
        video.currentTime = cut === 'mobile' ? video.duration * .65 : Math.min(1, video.duration / 3);
        await new Promise(resolve => video.addEventListener('seeked', resolve, { once: true }));
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = Math.round(width * video.videoHeight / video.videoWidth);
        canvas.getContext('2d').drawImage(video, 0, 0, canvas.width, canvas.height);
        return canvas.toDataURL('image/png').split(',')[1];
      } finally {
        video.remove();
      }
    }, { cut, width });
    const path = `public/assets/wigs/transformations-${cut}.webp`;
    await sharp(Buffer.from(png, 'base64')).webp({ quality: 85 }).toFile(path);
    console.log(`Created ${path}`);
  }
} finally {
  await browser.close();
  await server.close();
}
