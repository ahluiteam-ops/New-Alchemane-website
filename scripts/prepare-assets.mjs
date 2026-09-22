import sharp from 'sharp';
import { mkdir } from 'node:fs/promises';

await mkdir('public/assets', { recursive: true });
// Hero artwork: the supplied 16:9 master (16720×9410) includes the wordmark,
// models and cloud base. Navigation, buttons and collection typography stay HTML.
// The master is effectively opaque (0.05% of pixels < 255 alpha), so it is
// flattened on white and shipped without an alpha channel to keep files small.
const HERO_SOURCE = 'Images/hero image.png';
const heroSizes = [['hero-1280', 1280], ['hero', 2400], ['hero-3200', 3200]];
for (const [name, width] of heroSizes) {
  await sharp(HERO_SOURCE, { limitInputPixels: false })
    .flatten({ background: '#ffffff' })
    .resize({ width })
    .webp({ quality: 84, effort: 6, smartSubsample: true })
    .toFile(`public/assets/${name}.webp`);
}

const portraits = [
  ['hair-toppers', 600], ['ponytails', 2250], ['u-shaped', 3920],
  ['tape-extensions', 5570], ['halo-extensions', 7220],
];
for (const [name, left] of portraits) {
  await sharp('Images/image 532.png')
    .extract({ left, top: 2340, width: 1410, height: 1410 })
    .resize(480, 480).webp({ quality: 90 }).toFile(`public/assets/${name}.webp`);
}
await sharp('Images/Codex Image Sep 17, 2026, 01_45_58 PM.png')
  .webp({ quality: 92, alphaQuality: 100 }).toFile('public/assets/cloud.webp');

// The five collection cards share the category image paths rendered at build
// time. Replace those former card photos with the supplied product imagery.
const collectionCards = [
  ['toppern.png', 'silk-hair-toppers-a.webp'],
  ['extensionn.png', 'halo-hair-extensions-a.webp'],
  ['clip extensions.png', 'clip-extensions-a.webp'],
  ['fringen.png', 'fringe-with-sides-a.webp'],
  ['wign.png', 'premium-wigs-a.webp'],
];
for (const [source, output] of collectionCards) {
  await sharp(`Images/2nd section/${source}`, { limitInputPixels: false })
    .resize({ width: 1200, withoutEnlargement: true })
    .webp({ quality: 84, alphaQuality: 100, effort: 6, smartSubsample: true })
    .toFile(`public/assets/range/${output}`);
}

console.log('Prepared hero artwork, collection cards, portraits, and the original transparent cloud.');
