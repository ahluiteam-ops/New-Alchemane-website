// Product catalogue for "The full range". Source: alchemane.com/products.json
// (Shopify), read on 18 Sep 2026. Prices are the lowest variant price in INR.
// Change a price or shade here and the static cards regenerate at build time.
export const STORE_URL = 'https://alchemane.com/products/';

const shadeSwatch = {
  'Natural Black': '#1c1917',
  'Dark Brown': '#3a2a20',
  Highlights: 'linear-gradient(135deg, #3a2a20 0 46%, #a07a53 54% 100%)',
  'Brown Gold Highlights': 'linear-gradient(135deg, #3a2a20 0 46%, #b8904f 54% 100%)',
};
const THREE = ['Natural Black', 'Dark Brown', 'Highlights'];
const BLACK = ['Natural Black'];

export const toppers = [
  { handle: 'silk-hair-toppers', name: 'Silk Topper 5 × 3', flag: 'Silk base', size: [5, 3], spec: '14–16 in', from: 28000, ranged: true, shades: THREE, alt: 'Silk base hair topper held up to show its base and clips', altB: true },
  { handle: 'silk-hair-toppers-5x6', name: 'Silk Topper 5 × 6', flag: 'Silk base', size: [5, 6], spec: '14–16 in', from: 38000, ranged: true, shades: ['Natural Black', 'Dark Brown', 'Brown Gold Highlights'], alt: 'Larger silk base topper held up to show its base', altB: true },
  { handle: 'skin-topper', name: 'Skin Topper 5 × 3', flag: 'Skin base', size: [5, 3], spec: '14–18 in', from: 28000, ranged: true, shades: THREE, alt: 'Skin base hair topper held up to show its base and clips', altB: true },
  { handle: 'skin-topper-5x6', name: 'Skin Topper 5 × 6', flag: 'Skin base', size: [5, 6], spec: '14–18 in', from: 38000, ranged: true, shades: THREE, alt: 'Larger skin base topper held up to show its base', altB: true },
];

export const extensionGroups = [
  { id: 'salon', label: 'Salon-fitted', flag: 'Salon-fitted', noun: 'salon-fitted extensions', note: 'Fitted at our Khar West studio and worn day and night. Removed and refitted every two to four months.' },
  { id: 'clip', label: 'Clip-in', flag: 'Clip-in', noun: 'clip-in extensions', note: 'Clip them in when you want the length. Take them out before bed.' },
  { id: 'volume', label: 'Volumisers', flag: 'Volumiser', noun: 'volumisers', note: 'A halo, a ponytail or a single clip: lift and length in minutes.' },
  { id: 'fringe', label: 'Fringes', flag: 'Fringe', noun: 'fringes', note: 'Try a fringe without cutting your own hair. Each one can be trimmed to your face.' },
];

export const extensions = [
  { group: 'salon', handle: 'tape-hair-extensions', name: 'Tape-in Extensions', spec: '18–24 in · lasts 2–3 months', from: 40000, ranged: true, shades: BLACK, alt: 'Model holding a bundle of tape-in extensions', altB: true },
  { group: 'salon', handle: 'micro-ring-hair-extensions', name: 'Micro Ring Extensions', spec: '18–24 in · lasts 3–4 months', from: 40000, ranged: true, shades: BLACK, alt: 'Model holding a bundle of micro ring extensions', altB: true },
  { group: 'salon', handle: 'keratin-bond-hair-extensions', name: 'Keratin Bond Extensions', spec: '18–24 in · lasts 3–4 months', from: 40000, ranged: true, shades: BLACK, alt: 'Model holding a bundle of keratin bond extensions', altB: true },
  { group: 'clip', handle: 'one-set-clip-in-hair-extensions', name: 'One-Set Clip-in', spec: 'For the back · 14–22 in', from: 25000, ranged: true, shades: THREE, alt: 'Model holding a one-piece clip-in weft', altB: true },
  { group: 'clip', handle: 'two-set-clip-in-extensions', name: 'Two-Set Clip-in', spec: 'Two pieces · 14–22 in', from: 25000, ranged: true, shades: THREE, alt: 'Model holding two clip-in wefts', altB: false },
  { group: 'clip', handle: 'u-shaped-extensions', name: 'U-Shaped Extensions', spec: 'Sides, top and back · 14–22 in', from: 25000, ranged: true, shades: THREE, alt: 'Model holding a U-shaped clip-in extension', altB: true },
  { group: 'clip', handle: '2-clip-side-hair-extensions', name: '2-Clip Side Extensions', spec: 'For the sides · 14–18 in', from: 2500, ranged: true, shades: THREE, alt: 'Model holding a small two-clip side extension', altB: true },
  { group: 'volume', handle: 'halo-hair-extensions', name: 'Halo Extensions', spec: 'A band, no clips · 14–22 in', from: 14000, ranged: true, shades: THREE, alt: 'Model holding a halo extension by its band', altB: true },
  { group: 'volume', handle: 'pony-tail-hair-extensions', name: 'Ponytail Extensions', spec: 'Clip-on ponytail · 14–22 in', from: 14000, ranged: true, shades: THREE, alt: 'Model wearing a long ponytail extension', altB: true },
  { group: 'volume', handle: 'filler-clip-on-hair-extensions', name: 'Filler Clip-on', spec: 'Adds volume · 14–18 in', from: 2500, ranged: true, shades: THREE, alt: 'Model wearing filler clip-on extensions', altB: true },
  { group: 'volume', handle: 'single-clip-on-hair-extensions', name: 'Single Clip-on', spec: 'One clip · 14–18 in', from: 1500, ranged: true, shades: THREE, alt: 'Model holding a single clip-on extension', altB: true },
  { group: 'volume', handle: 'scrunchies', name: 'Scrunchie', spec: 'Hair scrunchie', from: 2500, ranged: false, shades: BLACK, alt: 'Model holding a hair scrunchie piece', altB: true },
  { group: 'fringe', handle: 'fringe-1', name: 'Fringe No. 1', spec: 'Clip-in fringe', from: 2500, ranged: false, shades: BLACK, alt: 'Model holding a clip-in fringe', altB: true },
  { group: 'fringe', handle: 'fringe-2', name: 'Fringe No. 2', spec: 'Clip-in fringe', from: 2500, ranged: false, shades: BLACK, alt: 'Model holding a second style of clip-in fringe', altB: false },
  { group: 'fringe', handle: 'fringe-with-sides', name: 'Fringe with Sides', spec: 'Fringe with side pieces', from: 2500, ranged: false, shades: BLACK, alt: 'Model holding a fringe with side pieces', altB: true },
  { group: 'fringe', handle: 'full-fringe-with-sides', name: 'Full Fringe with Sides', spec: 'Fuller fringe with sides', from: 2500, ranged: false, shades: BLACK, alt: 'Model holding a full fringe with side pieces', altB: true },
];

const escapes = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' };
const esc = value => String(value).replace(/[&<>"']/g, ch => escapes[ch]);
export const rupees = amount => `₹${new Intl.NumberFormat('en-IN').format(amount)}`;

// Base footprint drawn to scale: 4 SVG units per inch, bottom-aligned.
export function footprint([a, b], className = 'footprint') {
  const u = 4;
  const box = [5 * u + 2, 6 * u + 2];
  return `<svg class="${className}" viewBox="0 0 ${box[0]} ${box[1]}" aria-hidden="true" focusable="false"><rect x="1" y="${box[1] - 1 - b * u}" width="${a * u}" height="${b * u}" /></svg>`;
}

function card(item, flag, extra = '') {
  const price = `${item.ranged ? 'From ' : ''}${rupees(item.from)}`;
  const alt = item.altB ? ` data-alt="/assets/range/${esc(item.handle)}-b.webp"` : '';
  const group = item.group ? ` data-group="${item.group}"` : '';
  const dots = item.shades.map(s => `<i style="--shade:${shadeSwatch[s]}" title="${esc(s)}"></i>`).join('');
  return `<li class="range-card" data-handle="${esc(item.handle)}"${group}${alt}>
  <a class="range-link" href="${STORE_URL}${esc(item.handle)}">
    <span class="range-media"><img class="range-photo" src="/assets/range/${esc(item.handle)}-a.webp" width="600" height="800" alt="${esc(item.alt)}" loading="lazy" decoding="async"><span class="range-flag">${esc(flag)}</span><span class="range-view" aria-hidden="true">View on alchemane.com <b>↗</b></span></span>
    <span class="range-title"><span class="range-name">${esc(item.name)}</span><span class="range-price">${price}</span></span>
    <span class="range-spec">${extra}<span>${esc(item.spec)}</span></span>
    <span class="range-shades">${dots}<span class="sr-only">Shades: ${esc(item.shades.join(', '))}</span></span>
  </a>
</li>`;
}

export function renderToppers() {
  return toppers.map(t => card(t, t.flag, `${footprint(t.size)}<span>${t.size[0]} × ${t.size[1]} in base</span><span aria-hidden="true">·</span>`)).join('\n');
}

export function renderExtensions() {
  const flags = Object.fromEntries(extensionGroups.map(g => [g.id, g.flag]));
  return extensions.map(e => card(e, flags[e.group])).join('\n');
}

export function renderFilters() {
  const all = `<button type="button" data-range-filter="all" aria-pressed="true" data-noun="hair extensions" data-note="Every extension we make, from salon-fitted strands to a clip-in fringe.">All <span>${extensions.length}</span></button>`;
  const groups = extensionGroups.map(g => `<button type="button" data-range-filter="${g.id}" aria-pressed="false" data-noun="${esc(g.noun)}" data-note="${esc(g.note)}">${esc(g.label)} <span>${extensions.filter(e => e.group === g.id).length}</span></button>`);
  return [all, ...groups].join('');
}

export const counts = { toppers: toppers.length, extensions: extensions.length, total: toppers.length + extensions.length };

// Replaces the range placeholders in src/homepage.html (called by vite.config.js).
export function renderRangePlaceholders(html) {
  return html
    .replace('<!-- range-toppers -->', renderToppers())
    .replace('<!-- range-extensions -->', renderExtensions())
    .replace('<!-- range-filters -->', renderFilters())
    .replace('<!-- range-footprint-5x3 -->', footprint([5, 3], 'footprint footprint-lg'))
    .replace('<!-- range-footprint-5x6 -->', footprint([5, 6], 'footprint footprint-lg'))
    .replaceAll('<!-- range-count-toppers -->', String(counts.toppers))
    .replaceAll('<!-- range-count-extensions -->', String(counts.extensions));
}
