import { chromium } from '@playwright/test';
import { pathToFileURL } from 'node:url';
import { resolve } from 'node:path';
import { mkdir, writeFile } from 'node:fs/promises';
import sharp from 'sharp';

const browser = await chromium.launch({ channel: 'chrome', headless: true });
await mkdir('preview/checkout-reference', { recursive: true });
try {
  for (const [name, filename] of [
    ['mobile', 'Recording/checkout mobile v recording.mp4'],
    ['desktop', 'Recording/checkout desktop v recording.mp4'],
  ]) {
    const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
    await page.goto(pathToFileURL(resolve(filename)).href);
    const metadata = await page.locator('video').evaluate(video => new Promise((done, fail) => {
      if (video.readyState >= 1) return done({ duration: video.duration, width: video.videoWidth, height: video.videoHeight });
      video.addEventListener('loadedmetadata', () => done({ duration: video.duration, width: video.videoWidth, height: video.videoHeight }), { once: true });
      video.addEventListener('error', () => fail(video.error?.message || 'Video load failed'), { once: true });
    }));
    console.log(name, metadata);
    await page.setViewportSize({ width: metadata.width, height: metadata.height });
    await page.locator('video').evaluate((video, size) => {
      video.controls = false;
      video.style.width = `${size.width}px`;
      video.style.height = `${size.height}px`;
      video.style.maxWidth = 'none';
      video.style.maxHeight = 'none';
      video.style.objectFit = 'contain';
      document.body.style.margin = '0';
    }, metadata);
    const times = Array.from({ length: Math.floor(metadata.duration / 4) + 1 }, (_, index) => Math.min(index * 4, metadata.duration - .2));
    const tileWidth = name === 'mobile' ? 360 : 600;
    const tileHeight = Math.round(tileWidth * metadata.height / metadata.width);
    const tiles = [];
    for (const [index, time] of times.entries()) {
      await page.locator('video').evaluate(async (video, target) => {
        video.pause();
        video.currentTime = target;
        await new Promise(done => video.addEventListener('seeked', done, { once: true }));
      }, time);
      const full = await page.locator('video').screenshot({ animations: 'disabled', type: 'jpeg', quality: 88 });
      await writeFile(`preview/checkout-reference/${name}-${String(index).padStart(2, '0')}.jpg`, full);
      const image = await sharp(full).resize({ width: tileWidth }).jpeg({ quality: 82 }).toBuffer();
      const label = Buffer.from(`<svg width="${tileWidth}" height="34"><rect width="${tileWidth}" height="34" fill="#232928"/><text x="12" y="23" fill="white" font-size="18" font-family="Arial">${name} ${Math.floor(time / 60)}:${String(Math.floor(time % 60)).padStart(2, '0')}</text></svg>`);
      tiles.push({ input: image, label });
    }
    for (let start = 0; start < tiles.length; start += 9) {
      const batch = tiles.slice(start, start + 9);
      const composites = batch.flatMap((tile, offset) => {
        const x = offset % 3 * tileWidth;
        const y = Math.floor(offset / 3) * (tileHeight + 34);
        return [{ input: tile.label, left: x, top: y }, { input: tile.input, left: x, top: y + 34 }];
      });
      await sharp({ create: { width: tileWidth * 3, height: (tileHeight + 34) * 3, channels: 3, background: '#fff' } })
        .composite(composites).jpeg({ quality: 88 }).toFile(`preview/checkout-reference/${name}-grid-${Math.floor(start / 9) + 1}.jpg`);
    }
    await page.close();
  }
} finally { await browser.close(); }
