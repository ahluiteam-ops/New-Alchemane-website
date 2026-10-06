// Wigs page imagery. Source: the Alchemane Wigs landing page folder
// (D:\AHL landing page revision\Alchemane LP revision\Alchemane Wigs LP\images).
// The PNGs there are large poster frames; this writes web-sized WebP copies to
// public/assets/wigs/. Re-run only if the sources change.
import sharp from 'sharp';
import { mkdir } from 'node:fs/promises';

const SOURCE = process.env.WIG_LP_IMAGES ?? 'D:/AHL landing page revision/Alchemane LP revision/Alchemane Wigs LP/images';
const OUT = 'public/assets/wigs';
const jobs = [
  // [source file, output name, max width]
  ['consult-real-poster.png', 'consultation', 720],
  ['edu-wig-types.png', 'wig-types', 1100],
  ['edu-place-order.png', 'how-to-order', 1000],
  ['edu-measure-head.png', 'measure-head', 1000],
  ['vinitt-founder.png', 'founder', 900],
  ['location-1.png', 'studio-1', 900],
  ['location-2.png', 'studio-2', 900],
  ['location-3.png', 'studio-3', 900],
];

await mkdir(OUT, { recursive: true });
for (const [file, name, width] of jobs) {
  const result = await sharp(`${SOURCE}/${file}`).resize({ width, withoutEnlargement: true }).webp({ quality: 84, effort: 6 }).toFile(`${OUT}/${name}.webp`);
  console.log(`${OUT}/${name}.webp: ${result.width} × ${result.height}, ${Math.round(result.size / 1024)} KB`);
}
