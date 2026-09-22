import sharp from 'sharp';
import { copyFile } from 'node:fs/promises';
const images = { 'topper-editorial': 26, 'tape-editorial': 14, 'halo-editorial': 34, 'ponytail-editorial': 38, 'u-editorial': 42, 'founder': 152, 'craft-hair': 260, 'transformation': 214, 'friends': 116 };
for (const [name, id] of Object.entries(images)) {
  await sharp(`preview/pdf-assets/home-${String(id).padStart(3, '0')}.jpg`).resize({ width: 1000, withoutEnlargement: true }).webp({ quality: 86 }).toFile(`public/assets/${name}.webp`);
}
for (const [name, file] of [['before', 'ref-01-thinning-parting.jpg'], ['after', 'ref-07-reveal-smile.jpg'], ['construction', 'ref-04-silk-base-clips.jpg'], ['placing', 'ref-05-placing.jpg']]) {
  await sharp(`Higgsfield hero refs/${file}`).resize({ width: 800, withoutEnlargement: true }).webp({ quality: 86 }).toFile(`public/assets/${name}.webp`);
}
await copyFile('a1d4c793cc644cbb94a82821cbdc7173.HD-1080p-7.2Mbps-34021146.mp4', 'public/assets/topper-demo.mp4');
console.log('Prepared homepage photography and original demonstration film.');
