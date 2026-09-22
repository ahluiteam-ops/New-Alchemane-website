import sharp from 'sharp';
import { readdir, readFile, writeFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
const seen = new Set();
const tiles = [];
for (const name of await readdir('preview/pdf-assets')) {
  if (!name.endsWith('.jpg')) continue;
  const buffer = await readFile(`preview/pdf-assets/${name}`);
  const meta = await sharp(buffer).metadata();
  const hash = createHash('sha256').update(buffer).digest('hex');
  if (seen.has(hash) || meta.width < 300 || meta.height < 260) continue;
  seen.add(hash);
  const image = await sharp(buffer).resize(150, 175, { fit: 'contain', background: '#f5f4f1' }).toBuffer();
  const label = Buffer.from(`<svg width="150" height="25"><rect width="150" height="25" fill="white"/><text x="8" y="17" font-size="12">${name}</text></svg>`);
  tiles.push(await sharp({ create: { width: 150, height: 200, channels: 3, background: 'white' } }).composite([{ input: image, top: 0, left: 0 }, { input: label, top: 175, left: 0 }]).png().toBuffer());
}
await sharp({ create: { width: 900, height: Math.ceil(tiles.length / 6) * 200, channels: 3, background: 'white' } }).composite(tiles.map((input, i) => ({ input, left: i % 6 * 150, top: Math.floor(i / 6) * 200 }))).png().toFile('preview/reference-contact-sheet.png');
console.log(`${tiles.length} unique reference photographs`);
