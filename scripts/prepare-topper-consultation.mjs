import { chromium } from '@playwright/test';
import { createServer } from 'vite';
import { copyFile, mkdir } from 'node:fs/promises';
import sharp from 'sharp';

const directory = 'public/assets/topper-consultation';
await mkdir(directory, { recursive: true });
for (const number of [1, 2, 3]) {
  await copyFile(`Videos/Hair toppers/new/consultation reels/consult-${number}.mp4`, `${directory}/consult-${number}.mp4`);
}
const server = await createServer({ logLevel: 'silent', server: { host: '127.0.0.1', port: 4179, strictPort: true } });
await server.listen();
const browser = await chromium.launch({ headless: true });
try {
  const page = await browser.newPage();
  await page.goto('http://127.0.0.1:4179/topper-consultation.html', { waitUntil: 'domcontentloaded' });
  for (const number of [1, 2, 3]) {
    const frame = await page.evaluate(async number => {
      const video = document.createElement('video');
      video.muted = true;
      video.playsInline = true;
      video.src = `/assets/topper-consultation/consult-${number}.mp4`;
      document.body.append(video);
      try {
        await new Promise((resolve, reject) => {
          video.addEventListener('loadeddata', resolve, { once: true });
          video.addEventListener('error', () => reject(new Error(`Cannot decode consultation video ${number}`)), { once: true });
          video.load();
        });
        video.currentTime = Math.min(.5, video.duration / 3);
        await new Promise(resolve => video.addEventListener('seeked', resolve, { once: true }));
        const canvas = document.createElement('canvas');
        canvas.width = Math.min(540, video.videoWidth);
        canvas.height = Math.round(canvas.width * video.videoHeight / video.videoWidth);
        canvas.getContext('2d').drawImage(video, 0, 0, canvas.width, canvas.height);
        return { png: canvas.toDataURL('image/png').split(',')[1], width: video.videoWidth, height: video.videoHeight, seconds: video.duration };
      } finally { video.remove(); }
    }, number);
    await sharp(Buffer.from(frame.png, 'base64')).webp({ quality: 84 }).toFile(`${directory}/consult-${number}.webp`);
    console.log(`Consultation ${number}: ${frame.width} × ${frame.height}, ${frame.seconds.toFixed(1)}s; poster created.`);
  }
} finally { await browser.close(); await server.close(); }
