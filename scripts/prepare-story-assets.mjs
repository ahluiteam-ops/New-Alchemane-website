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
