import { chromium } from '@playwright/test';
import { createServer } from 'vite';
import { copyFile, mkdir } from 'node:fs/promises';
import sharp from 'sharp';

// Supplied compressed portrait clips; playback is requested only on tap.
const clips = [
  ['silk-hair-toppers', 'Hair Toppers', .9],
  ['halo-hair-extensions', 'Halo Hair Extensions', .3],
  ['fringe-with-sides', 'Clip in Bangs', .6],
  ['one-set-clip-in-hair-extensions', 'Back hair extensions', .6],
  ['tape-hair-extensions', 'Tape-in Hair Extensions', .3],
  ['u-shaped-extensions', 'U-Shaped Hair Extensions', .6],
  ['pony-tail-hair-extensions', 'Ponytail Hair Extensions', .6],
  ['scrunchies', 'Scrunchies', .3],
];
const directory = 'public/assets/product-videos';
await mkdir(directory, { recursive: true });
for (const [handle, source] of clips) {
  await copyFile(`Videos/Our collection/compressed videos/${source}.mp4`, `${directory}/${handle}.mp4`);
}
const port = 4182;
const server = await createServer({ logLevel: 'silent', server: { host: '127.0.0.1', port, strictPort: true } });
await server.listen();
const browser = await chromium.launch({ channel: 'chrome', headless: true });
try {
  const page = await browser.newPage();
  await page.goto(`http://127.0.0.1:${port}/`, { waitUntil: 'domcontentloaded' });
  for (const [handle, , position] of clips) {
    const frame = await page.evaluate(async ({ handle, position }) => {
      const video = document.createElement('video');
      video.muted = true;
      video.src = `/assets/product-videos/${handle}.mp4`;
      try {
        await new Promise((resolve, reject) => {
          video.addEventListener('loadeddata', resolve, { once: true });
          video.addEventListener('error', () => reject(new Error(`Cannot decode ${handle}`)), { once: true });
          video.load();
        });
        video.currentTime = video.duration * position;
        await new Promise(resolve => video.addEventListener('seeked', resolve, { once: true }));
        const canvas = document.createElement('canvas');
        canvas.width = 540;
        canvas.height = Math.round(540 * video.videoHeight / video.videoWidth);
        canvas.getContext('2d').drawImage(video, 0, 0, canvas.width, canvas.height);
        return { png: canvas.toDataURL('image/png').split(',')[1], seconds: video.duration };
      } finally {
        video.removeAttribute('src');
        video.load();
      }
    }, { handle, position });
    await sharp(Buffer.from(frame.png, 'base64')).webp({ quality: 82 }).toFile(`${directory}/${handle}.webp`);
    console.log(`${handle}: ${frame.seconds.toFixed(1)}s, poster ready`);
  }
} finally {
  await browser.close();
  await server.close();
}
