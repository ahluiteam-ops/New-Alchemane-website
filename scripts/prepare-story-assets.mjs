import sharp from 'sharp';
import { mkdir } from 'node:fs/promises';

const clients = [
  ['Priya S.', 'priya-s'],
  ['Ananya R.', 'ananya-r'],
  ['Divya M.', 'divya-m'],
  ['Ritika V.', 'ritika-v'],
  ['Meera K.', 'meera-k'],
];

await mkdir('public/assets/stories', { recursive: true });
for (const [name, slug] of clients) {
  const output = `public/assets/stories/${slug}.webp`;
  const result = await sharp(`Images/beforerafter/${name} transformation.png`)
    .rotate()
    .resize({ width: 1400, height: 1050, fit: 'inside', withoutEnlargement: true })
    .webp({ quality: 88, effort: 6 })
    .toFile(output);
  console.log(`${output}: ${result.width} × ${result.height}, ${result.size} bytes`);
}

// Permanent Extensions page "See the difference" — four extra extension
// transformations (the clip-on, feather and Upasna micro-ring images already
// exist above). Source: Images/Client stories In their own words/Extension/.
const extensionStories = [
  ['Micro Ring Hair Extensions Lavina', 'micro-ring-hair-extensions-lavina'],
  ['Micro Ring Hair Extensions-2 Sneha', 'micro-ring-hair-extensions-sneha'],
  ['Tape in Hair Extensions Jalpa', 'tape-in-hair-extensions-jalpa'],
  ['Tape in Hair Extensions-1 Navya', 'tape-in-hair-extensions-navya'],
];
for (const [name, slug] of extensionStories) {
  const output = `public/assets/stories/${slug}.webp`;
  const result = await sharp(`Images/Client stories In their own words/Extension/${name}.png`).webp({ quality: 86, effort: 6 }).toFile(output);
  console.log(`${output}: ${result.width} × ${result.height}, ${result.size} bytes`);
}
