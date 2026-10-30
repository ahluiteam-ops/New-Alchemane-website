import { readFileSync, writeFileSync } from 'node:fs';
import { products } from '../src/sections/catalogue-products.js';
import { productPages } from '../src/products/product-content.js';

// Compact purchase records from the same approved snapshot as the catalogue.
const snapshot = JSON.parse(readFileSync('docs/live-products-2026-09-21.json', 'utf8')).products;
const records = Object.fromEntries(products.flatMap(product => {
  const source = snapshot.find(item => item.handle === product.handle);
  if (!source) return [];
  const local = productPages[product.handle];
  const variants = source.variants.map(variant => {
    const override = local?.variants.find(item => item.id === String(variant.id));
    const options = source.options.map((_, index) => variant[`option${index + 1}`]);
    return { id: String(variant.id), title: options.join(' / '), options, price: override?.price ?? Number(variant.price), available: override?.available ?? variant.available };
  });
  return [[product.handle, {
    handle: product.handle, name: local?.name ?? product.name, image: product.image,
    url: local ? `/products/${product.handle}/` : `https://alchemane.com/products/${product.handle}`,
    options: source.options.map(option => ({ name: option.name.replace('Color', 'Colour'), values: option.values })),
    textures: local?.textures ?? [], variants,
  }]];
}));
writeFileSync('src/products/shop-products.js', `// Purchase data from docs/live-products-2026-09-21.json; run scripts/prepare-shop-products.mjs to rebuild.\nexport const shopProducts = ${JSON.stringify(records, null, 2)};\n`);
console.log(`Prepared ${Object.keys(records).length} purchase records.`);
