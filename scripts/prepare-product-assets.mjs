import { mkdir, writeFile } from 'node:fs/promises';
import sharp from 'sharp';

// Original Alchemane product photography, never reference-store assets.
const source = 'https://alchemane.com/products/silk-hair-toppers.js';
const response = await fetch(source);
if (!response.ok) throw new Error(`Product feed: ${response.status}`);
const product = await response.json();
await mkdir('public/assets/products/silk-hair-toppers', { recursive: true });
await mkdir('docs/product-sources', { recursive: true });
await writeFile('docs/product-sources/silk-hair-toppers.json', JSON.stringify({ source, fetchedAt: new Date().toISOString(), product }, null, 2));
for (const [index, image] of product.images.entries()) {
  const imageResponse = await fetch(`https:${image}`);
  if (!imageResponse.ok) throw new Error(`Product image: ${imageResponse.status}`);
  const input = Buffer.from(await imageResponse.arrayBuffer());
  await sharp(input).rotate().resize({ width: 1100, withoutEnlargement: true }).webp({ quality: 86 }).toFile(`public/assets/products/silk-hair-toppers/${index + 1}.webp`);
  await sharp(input).rotate().resize({ width: 180, withoutEnlargement: true }).webp({ quality: 78 }).toFile(`public/assets/products/silk-hair-toppers/${index + 1}-thumb.webp`);
}
console.log(`Prepared ${product.images.length} original product images and source snapshot.`);
