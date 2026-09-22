import sharp from 'sharp';
import { mkdir } from 'node:fs/promises';

// "The promise" band: a photographic trust panel with the hair-and-hand cutout
// breaking out of its top and bottom edge. Sources are cached locally (not
// fetched at build time) in Images/promise-source/, copied on 18 Sep 2026
// from the current alchemane.com build's own quality-band photography.
const SRC = 'Images/promise-source';
await mkdir('public/assets', { recursive: true });

// Background: a teal texture, used as a photographic panel behind the copy.
await sharp(`${SRC}/bg.jpg`)
  .resize({ width: 2200 })
  .webp({ quality: 78, effort: 6 })
  .toFile('public/assets/promise-bg.webp');
await sharp(`${SRC}/bg.jpg`)
  .resize({ width: 1000 })
  .webp({ quality: 76, effort: 6 })
  .toFile('public/assets/promise-bg-mobile.webp');

// Foreground cutout: trim to its real content (the source canvas pads the
// right edge with transparency) and keep the alpha channel so it can sit on
// top of the panel and bleed past its edges.
const hair = sharp(`${SRC}/hair.png`);
const trimmed = await hair.clone().trim({ background: '#00000000', threshold: 4 }).toBuffer();
const meta = await sharp(trimmed).metadata();
for (const [name, width] of [['promise-hair', 1100], ['promise-hair-mobile', 620]]) {
  await sharp(trimmed)
    .resize({ width: Math.min(width, meta.width) })
    .webp({ quality: 90, effort: 6, alphaQuality: 100 })
    .toFile(`public/assets/${name}.webp`);
}
console.log(`Prepared the promise band: panel photography and a ${meta.width}×${meta.height} cutout (trimmed).`);
