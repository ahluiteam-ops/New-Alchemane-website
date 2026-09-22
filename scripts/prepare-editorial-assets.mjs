import sharp from 'sharp';
import { mkdir } from 'node:fs/promises';

const assets = [
  ['campaign-portrait', 'campaign-portrait'],
  ['consultation-studio', 'consultation-studio'],
  ['hair-detail', 'hair-detail'],
];

await mkdir('public/assets/editorial', { recursive: true });
for (const [source, output] of assets) {
  const input = `Images/generated-temporary/${source}.png`;
  const destination = `public/assets/editorial/${output}.webp`;
  const metadata = await sharp(input).metadata();
  await sharp(input).webp({ quality: 88, effort: 6 }).toFile(destination);
  console.log(`${destination} (${metadata.width} x ${metadata.height})`);
}
