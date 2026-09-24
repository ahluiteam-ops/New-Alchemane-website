import { readFileSync, writeFileSync } from 'node:fs';
import { toppers, extensions } from '../src/sections/range-data.js';

// Offline, reviewable snapshot of the official store, checked 21 September 2026.
const live = JSON.parse(readFileSync('docs/live-products-2026-09-21.json', 'utf8')).products;
const metadata = [...toppers, ...extensions];
const clipExtensionHandles = new Set(['one-set-clip-in-hair-extensions', 'two-set-clip-in-extensions', 'u-shaped-extensions', '2-clip-side-hair-extensions', 'pony-tail-hair-extensions', 'filler-clip-on-hair-extensions', 'single-clip-on-hair-extensions']);
const order = ['silk-hair-toppers', 'halo-hair-extensions', 'fringe-with-sides', 'premium-wigs', ...metadata.map(p => p.handle)];
const existing = [...new Set(order)].map(handle => {
  const product = live.find(p => p.handle === handle);
  if (!product) throw new Error(`Missing live product: ${handle}`);
  const meta = metadata.find(p => p.handle === handle);
  const category = toppers.some(p => p.handle === handle) ? 'toppers' : handle === 'premium-wigs' ? 'wigs' : meta?.group === 'fringe' ? 'fringes' : clipExtensionHandles.has(handle) ? 'clip-extensions' : 'permanent-extensions';
  const prices = product.variants.map(v => Number(v.price));
  return { handle, name: product.title, category, group: meta?.group ?? category, price: Math.min(...prices), ranged: new Set(prices).size > 1,
    image: `/assets/range/${handle}-a.webp`, alt: meta?.alt ?? 'Alchemane Premium Wigs product photograph',
    description: category === 'toppers' ? 'Coverage at the parting and crown' : category === 'wigs' ? 'A full-head hair piece' : category === 'fringes' ? 'Change your fringe without a haircut' : meta?.group === 'salon' ? 'Professionally fitted length and volume' : meta?.group === 'clip' ? 'Clip-in length and fullness' : 'Removable volume and styling',
    aliases: `${meta?.name ?? ''} ${meta?.spec ?? ''}`, shades: [...new Set(product.variants.map(v => v.option1).filter(v => v && v !== 'Default Title'))],
    url: `https://alchemane.com/products/${handle}`, isNew: false };
});
const additions = [
  ['Diamond Net Fringes', 'fringes'], ['Fringe with Skin Base', 'fringes'], ['Net Fringe Toppers', 'fringes'],
  ['Fringe Net Base', 'fringes'], ['Slim Fringe Net Base', 'fringes'], ['Mini Fringes', 'fringes'],
  ['Velcro Fringes', 'fringes'], ['V-Shape Fringes', 'fringes'], ['Fringes Filler', 'fringes'],
  ['European Full Wig', 'wigs'], ['Skin Top Wig', 'wigs'], ['Lace Wig', 'wigs'],
  ['Feather Extension', 'permanent-extensions'], ['V-Light Extension', 'permanent-extensions'], ['Ice Extension', 'permanent-extensions'],
  ['7-Inch Hairline', 'hairline-series'], ['11-Inch Hairline', 'hairline-series'], ['Hairline Toppers', 'toppers', ['hairline-series']],
  ['Rose Topper', 'toppers'], ['Classic Clip Topper', 'toppers'], ['Mesh Topper', 'toppers'],
].map(([name, category, categories]) => ({ handle: name.toLowerCase().replace(/[^a-z0-9]+/g, '-'), name, category, ...(categories ? { categories } : {}), group: 'unconfirmed', price: null, image: null,
  description: 'Ask our team about this new addition', aliases: '', shades: [], url: null, isNew: true }));
writeFileSync('src/sections/catalogue-products.js', `// Official store snapshot: 21 Sep 2026. New names: supplied client list.\n// Set image to an approved asset path when supplied; null renders a blank grey card.\nexport const products = ${JSON.stringify([...existing, ...additions], null, 2)};\n`);
console.log(`Prepared ${existing.length} existing + ${additions.length} new products.`);
