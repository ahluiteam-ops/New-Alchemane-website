import sharp from 'sharp';
import { mkdir, readdir, writeFile } from 'node:fs/promises';
import { existsSync } from 'node:fs';

// Product photography for the "full range" and film posters.
// Sources: the live Shopify catalogue (alchemane.com/products.json), cached in
// Images/range-source as <handle>__<imageNumber>.<ext>. Missing files are
// downloaded once; outputs are written to public/assets/range and public/assets/films.
const SOURCE = 'Images/range-source';
const FEED = 'https://alchemane.com/products.json?limit=250';
const INSET_CLEAR = 0.35;

// [handle, primary [image, focus], alternate [image, focus] | null]
// focus 0 keeps the top of the frame; 1 keeps the bottom and starts below the
// circular inset that the Shopify photography carries in its top 30%.
const cards = [
  ['silk-hair-toppers', [2, 1], [1, 0.12]],
  ['silk-hair-toppers-5x6', [3, 1], [1, 0.12]],
  ['skin-topper', [3, 1], [4, 0.12]],
  ['skin-topper-5x6', [3, 1], [1, 0.12]],
  ['tape-hair-extensions', [1, 0.12], [2, 1]],
  ['micro-ring-hair-extensions', [1, 0.12], [2, 1]],
  ['keratin-bond-hair-extensions', [2, 0.12], [1, 1]],
  ['one-set-clip-in-hair-extensions', [1, 0.12], [2, 0.12]],
  ['two-set-clip-in-extensions', [1, 0.12], null],
  ['u-shaped-extensions', [1, 0.12], [2, 1]],
  ['2-clip-side-hair-extensions', [1, 0.12], [2, 1]],
  ['halo-hair-extensions', [1, 0.12], [2, 1]],
  ['pony-tail-hair-extensions', [1, 0.12], [2, 1]],
  ['filler-clip-on-hair-extensions', [1, 1], [2, 1]],
  ['single-clip-on-hair-extensions', [1, 0.12], [2, 1]],
  ['scrunchies', [1, 0.12], [2, 1]],
  ['fringe-1', [1, 0.12], [2, 1]],
  ['fringe-2', [1, 0.12], null],
  ['fringe-with-sides', [1, 0.12], [2, 1]],
  ['full-fringe-with-sides', [1, 0.12], [2, 1]],
];

// Film posters: three 9:16 panels each. Box = [left, top, right, bottom] as fractions.
const posters = {
  toppers: [['silk-hair-toppers', 2, [0.15, 0.35, 0.85, 1]], ['silk-hair-toppers', 1, [0, 0, 1, 1]], ['skin-topper', 4, [0, 0, 1, 1]]],
  extensions: [['keratin-bond-hair-extensions', 1, [0, 0.3, 0.7, 1]], ['micro-ring-hair-extensions', 2, [0.1, 0.3, 0.8, 1]], ['tape-hair-extensions', 2, [0.1, 0.3, 0.8, 1]]],
};

await mkdir(SOURCE, { recursive: true });
await mkdir('public/assets/range', { recursive: true });
await mkdir('public/assets/films', { recursive: true });

const cached = await readdir(SOURCE);
const find = (handle, n) => cached.find(f => f.startsWith(`${handle}__${n}.`));
const needed = new Set();
for (const [handle, a, b] of cards) { needed.add(`${handle}|${a[0]}`); if (b) needed.add(`${handle}|${b[0]}`); }
for (const panels of Object.values(posters)) for (const [handle, n] of panels) needed.add(`${handle}|${n}`);
const missing = [...needed].filter(key => { const [h, n] = key.split('|'); return !find(h, n); });
if (missing.length) {
  const feed = await (await fetch(FEED)).json();
  for (const key of missing) {
    const [handle, n] = key.split('|');
    const image = feed.products.find(p => p.handle === handle)?.images[Number(n) - 1];
    if (!image) throw new Error(`No image ${n} for ${handle} in the Shopify feed`);
    const src = image.src.split('?')[0];
    const file = `${handle}__${n}.${src.split('.').pop()}`;
    await writeFile(`${SOURCE}/${file}`, Buffer.from(await (await fetch(`${src}?width=1080`)).arrayBuffer()));
    cached.push(file);
  }
}

async function card(handle, n, focus, out) {
  const input = `${SOURCE}/${find(handle, n)}`;
  const { width: W, height: H } = await sharp(input).metadata();
  let w = W, h = Math.round(W * 4 / 3);
  if (h > H) { h = H; w = Math.round(H * 3 / 4); }
  let top = Math.round((H - h) * focus);
  if (focus === 1) { top = Math.round(H * INSET_CLEAR); h = H - top; w = Math.min(W, Math.floor(h * 3 / 4)); h = Math.min(H - top, Math.floor(w * 4 / 3)); }
  await sharp(input).flatten({ background: '#ffffff' })
    .extract({ left: Math.round((W - w) / 2), top, width: w, height: h })
    .resize(600, 800).webp({ quality: 80, effort: 6 }).toFile(out);
}
for (const [handle, a, b] of cards) {
  await card(handle, a[0], a[1], `public/assets/range/${handle}-a.webp`);
  if (b) await card(handle, b[0], b[1], `public/assets/range/${handle}-b.webp`);
}
for (const [film, panels] of Object.entries(posters)) {
  for (const [i, [handle, n, box]] of panels.entries()) {
    const input = `${SOURCE}/${find(handle, n)}`;
    const { width: W, height: H } = await sharp(input).metadata();
    const [l, t, r, b] = box;
    await sharp(input).flatten({ background: '#ffffff' })
      .extract({ left: Math.round(l * W), top: Math.round(t * H), width: Math.round((r - l) * W), height: Math.round((b - t) * H) })
      .resize(540, 960, { fit: 'cover' }).webp({ quality: 80, effort: 6 }).toFile(`public/assets/films/${film}-${i + 1}.webp`);
  }
}
console.log(`Prepared ${cards.length} range cards and ${Object.keys(posters).length} film posters.`);
