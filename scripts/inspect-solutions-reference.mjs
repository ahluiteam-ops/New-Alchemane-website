import { chromium } from '@playwright/test';
import { mkdir, writeFile } from 'node:fs/promises';
import sharp from 'sharp';

const browser = await chromium.launch({ headless: true });
const page = await browser.newPage();
await page.goto('http://127.0.0.1:5173');
for (const kind of ['desktop', 'mobile']) {
  const dir = `preview/solutions-reference-${kind}`;
  await mkdir(dir, { recursive: true });
  const meta = await page.evaluate(async kind => {
    document.body.innerHTML = '<video muted preload="auto" id="reference"></video>';
    const video = document.querySelector('video');
    video.src = `/Recording/leading solution ${kind} reference.mp4`;
    await new Promise((resolve, reject) => { video.onloadeddata = resolve; video.onerror = reject; });
    return { duration: video.duration, width: video.videoWidth, height: video.videoHeight };
  }, kind);
  const times = Array.from({ length: 12 }, (_, i) => (meta.duration - .1) * i / 11);
  const tiles = [];
  for (const [i, time] of times.entries()) {
    const data = await page.evaluate(async time => {
      const video = document.querySelector('video');
      if (time > 0) {
        const ready = new Promise(resolve => { video.onseeked = resolve; });
        video.currentTime = time;
        await ready;
      }
      const canvas = document.createElement('canvas');
      canvas.width = video.videoWidth; canvas.height = video.videoHeight;
      canvas.getContext('2d').drawImage(video, 0, 0);
      return canvas.toDataURL('image/jpeg', .92).split(',')[1];
    }, time);
    const buffer = Buffer.from(data, 'base64');
    await writeFile(`${dir}/${String(i).padStart(2, '0')}-${time.toFixed(1)}s.jpg`, buffer);
    const width = kind === 'mobile' ? 300 : 520;
    const height = Math.round(width * meta.height / meta.width);
    tiles.push({ input: await sharp(buffer).resize(width, height).toBuffer(), left: (i % 3) * width, top: Math.floor(i / 3) * height });
  }
  const width = kind === 'mobile' ? 300 : 520;
  const height = Math.round(width * meta.height / meta.width);
  await sharp({ create: { width: width * 3, height: height * 4, channels: 3, background: '#fff' } }).composite(tiles).jpeg().toFile(`${dir}/contact-sheet.jpg`);
  await writeFile(`${dir}/MANIFEST.txt`, JSON.stringify({ ...meta, times }, null, 2));
  console.log(kind, meta);
}
await browser.close();
