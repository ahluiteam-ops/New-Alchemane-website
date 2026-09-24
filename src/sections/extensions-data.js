// Content for the Hair Extensions page.
//
// Structure and facts come from the client's Figma export, "Permanent
// Extensions page-desktop v2": the method list, the clip-in/salon comparison,
// the fitting and aftercare figures, and the questions. Product names, prices,
// shades, links and photography come from catalogue-products.js, so this page
// and the shop can never disagree about what Alchemane sells.
//
// Prose marked DRAFT below was written from the facts stated in that Figma and
// nothing else. It still needs the client's sign-off before the page goes live.

import { products, enquiryUrl } from './catalogue-data.js';

const esc = value => String(value).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
export const extensions = products.filter(p => ['permanent-extensions', 'clip-extensions'].includes(p.category));
const find = handle => extensions.find(p => p.handle === handle);

// The four ways Alchemane fits extensions. Each one names the products it
// covers so the "see the pieces" link lands on real stock, not a guess.
export const methods = [
  {
    id: 'clip-in',
    tab: 'Clip-in',
    kind: 'Wear and remove yourself',
    title: 'Clip-in extensions',
    lede: 'Put them in for the evening, take them out before bed.',
    // DRAFT
    body: 'Clip-in pieces attach to your own hair with small pressure clips. You fit them yourself in a few minutes, and you remove them at night and before washing. Nothing is bonded to your hair, so there is no salon appointment and no refit.',
    image: '/assets/range/one-set-clip-in-hair-extensions-a.webp',
    alt: 'A set of clip-in wefts showing the pressure clips along the top edge',
    facts: [['Fitted', 'By you, at home'], ['Worn', 'For the day or the evening'], ['Suits', 'Events, occasions, a fuller ponytail']],
    handles: ['one-set-clip-in-hair-extensions', 'two-set-clip-in-extensions', 'u-shaped-extensions', '2-clip-side-hair-extensions'],
  },
  {
    id: 'tape',
    tab: 'Tape-in',
    kind: 'Fitted at the studio',
    title: 'Tape-in extensions',
    lede: 'Flat, quick to fit, and the easiest of the three to live with.',
    // DRAFT — the 6–8 week figure and reusability are from the Figma.
    body: 'Tape-in wefts are sandwiched onto thin sections of your own hair with a medical-grade adhesive strip. They lie flat against the head, which makes them comfortable to sleep on and quick for us to fit. With the right care they last six to eight weeks before they need re-taping, and the hair itself can be reused.',
    image: '/assets/films/extensions-3.webp',
    alt: 'A tape-in weft being placed against a section of natural hair',
    facts: [['Fitted', 'At the Khar West studio'], ['Worn', '6–8 weeks before re-taping'], ['Suits', 'Fine hair, everyday fullness']],
    handles: ['tape-hair-extensions'],
  },
  {
    id: 'micro-ring',
    tab: 'Micro ring',
    kind: 'Fitted at the studio',
    title: 'Micro ring extensions',
    lede: 'No heat and no glue — each strand is held by a small ring.',
    // DRAFT
    body: 'Small strands of hair are threaded through a tiny ring along with your own hair, and the ring is closed to hold them. Nothing is heated and nothing is glued, so this is the gentlest of the fitted methods. The rings are repositioned as your hair grows.',
    image: '/assets/films/extensions-2.webp',
    alt: 'Micro rings holding extension strands close to the roots',
    facts: [['Fitted', 'At the Khar West studio'], ['Worn', 'Until your hair grows out the rings'], ['Suits', 'Anyone avoiding heat and adhesive']],
    handles: ['micro-ring-hair-extensions'],
  },
  {
    id: 'keratin',
    tab: 'Keratin bond',
    kind: 'Fitted at the studio',
    title: 'Keratin bond extensions',
    lede: 'The smallest bonds, and the most movement.',
    // DRAFT
    body: 'Each strand ends in a keratin tip that is warmed and moulded around a few of your own hairs. The bonds are the smallest of the three fitted methods, so the hair moves freely and the join is hard to find. Removal is done with a solvent at the studio.',
    image: '/assets/films/extensions-1.webp',
    alt: 'Keratin bonded strands sectioned close to the scalp',
    facts: [['Fitted', 'At the Khar West studio'], ['Worn', 'Until your hair grows out the bonds'], ['Suits', 'A natural fall and free styling']],
    handles: ['keratin-bond-hair-extensions'],
  },
];

// Straight from the Figma's "Clip-On vs Permanent Extensions" table.
export const comparison = {
  columns: ['Clip-in', 'Fitted at the studio'],
  rows: [
    ['Usage', 'Wear and remove daily', 'Stays in for weeks'],
    ['Best for', 'Events and occasions', 'Everyday fullness'],
    ['Application', 'You fit them yourself', 'Studio only'],
    ['Sleeping', 'Remove at night', 'Sleep in them'],
    ['Washing', 'Remove before washing', 'Wash with aftercare'],
    ['Maintenance', 'Low maintenance', 'Refit every 6–8 weeks'],
    ['Look and blend', 'Styling for the day', 'A long-term natural look'],
  ],
};

// The Figma's "Application & Maintenance Details" list, unchanged.
export const aftercare = [
  ['Fitting time', 'Around 2–4 hours, depending on the method and how much hair you are adding.'],
  ['Wear time', 'Usually 6–12 weeks before a refit or maintenance appointment.'],
  ['Reusable', 'Three to four times with proper care.'],
  ['Removal', 'Around an hour, depending on the method.'],
  ['Servicing', 'Cleaning, re-taping, rebonding or refitting after removal.'],
  ['Where', 'Fitted at Alchemane, 4th floor, Empressa Building, Khar West, Mumbai.'],
];

// Questions from the Figma. Only the first arrived with an answer; the rest are
// DRAFT, written from figures stated elsewhere in the same document.
export const questions = [
  ['Which method is best for me?',
    'It depends on your natural hair density, scalp comfort, hair strength, lifestyle and how much maintenance you want. We look at your hair before suggesting tape-in, micro ring or keratin bond — which is why every fitting starts with a consultation.'],
  ['Are fitted extensions permanent?',
    'No. They stay in for weeks rather than days, but they are removed and refitted as your own hair grows. Expect 6–12 weeks between appointments.'],
  ['Can I wash my hair with them in?',
    'Yes. Fitted extensions are washed with your own hair, using the aftercare routine we take you through at the appointment. Clip-in pieces come out before you wash.'],
  ['Can I sleep in them?',
    'Fitted extensions are made to be slept in. Clip-in pieces should come out at night.'],
  ['Will they damage my hair?',
    'The fitting method is chosen around your hair, not the other way round, and micro ring uses neither heat nor adhesive. Wear time, aftercare and coming back for the refit are what protect your own hair.'],
  ['Can the hair be reused?',
    'Yes — three to four times with proper care. After removal the hair is cleaned and re-taped, rebonded or refitted.'],
  ['Where do you fit them?',
    'At our studio on the 4th floor of the Empressa Building, 2nd Road, Ram Krishna Nagar, Khar West, Mumbai 400052.'],
];

// The range, split the way someone shopping actually thinks about it.
export const families = [
  { id: 'salon', name: 'Fitted at the studio', note: 'Tape-in, micro ring and keratin bond.' },
  { id: 'clip', name: 'Clip-in sets', note: 'Fit them yourself, wear them for the day.' },
  { id: 'volume', name: 'Volume and finishing', note: 'Halos, ponytails, fillers and scrunchies.' },
  { id: 'unconfirmed', name: 'New additions', note: 'Recently added. Ask us for prices and options.' },
];

function card(p) {
  const href = p.url ?? enquiryUrl(p);
  const external = !p.url;
  return `<li class="catalogue-card" data-family="${p.group}">
    <a class="catalogue-product catalogue-product--without-price" href="${esc(href)}"${external ? ' target="_blank" rel="noopener noreferrer"' : ''}>
      <span class="catalogue-photo${p.image ? '' : ' is-placeholder'}">${p.image
        ? `<img src="${esc(p.image)}" alt="${esc(p.alt || p.name)}" width="720" height="900" loading="lazy" decoding="async">`
        : '<span class="sr-only">Product photograph not yet available</span>'}${p.isNew ? '<span class="new-label">New addition</span>' : ''}</span>
      <h3>${esc(p.name)}</h3>
      <p class="catalogue-description">${esc(p.description || 'Ask us about this piece')}</p>
      ${p.shades?.length ? `<p class="ext-lengths">${p.shades.map(esc).join(' · ')}</p>` : ''}
      <span class="catalogue-action">${p.isNew ? 'Ask about this piece' : 'View product'} <span aria-hidden="true">↗</span></span>
    </a>
  </li>`;
}

function methodPanel(m, index) {
  const pieces = m.handles.map(find).filter(Boolean);
  return `<div class="ext-method" id="method-${m.id}" role="tabpanel" aria-labelledby="tab-${m.id}"${index ? ' hidden' : ''}>
    <div class="ext-method-figure"><img src="${m.image}" alt="${esc(m.alt)}" width="1080" height="1350" loading="lazy" decoding="async"></div>
    <div class="ext-method-copy">
      <p class="eyebrow">${esc(m.kind)}</p>
      <h3>${esc(m.title)}</h3>
      <p class="ext-lede">${esc(m.lede)}</p>
      <p>${esc(m.body)}</p>
      <dl class="ext-facts">${m.facts.map(([k, v]) => `<div><dt>${esc(k)}</dt><dd>${esc(v)}</dd></div>`).join('')}</dl>
      <p class="ext-method-pieces">${pieces.length === 1
        ? `<a class="text-link" href="${esc(pieces[0].url ?? enquiryUrl(pieces[0]))}"${pieces[0].url ? '' : ' target="_blank" rel="noopener noreferrer"'}>${esc(pieces[0].name)} <span aria-hidden="true">↗</span></a>`
        : `<a class="text-link" href="#ext-range" data-ext-family="${m.id === 'clip-in' ? 'clip' : 'salon'}">See the ${pieces.length} pieces <span aria-hidden="true">↓</span></a>`}</p>
    </div>
  </div>`;
}

export function renderExtensions() {
  const counts = Object.fromEntries(families.map(f => [f.id, extensions.filter(p => p.group === f.id).length]));
  return `
  <section class="ext-hero" aria-labelledby="ext-title">
    <div class="ext-hero-copy">
      <p class="eyebrow">Hair extensions</p>
      <h1 id="ext-title">Longer hair,<br>on your terms.</h1>
      <p class="ext-hero-lede">Clip a piece in for the evening, or have it fitted at the studio and forget about it for weeks. ${extensions.length} pieces, all human hair, matched to your colour and texture.</p>
      <div class="ext-hero-actions">
        <a class="solid-button" href="#methods">See the four methods <span aria-hidden="true">↓</span></a>
        <a class="text-link" href="#ext-consultation">Book a consultation <span aria-hidden="true">↗</span></a>
      </div>
      <ul class="ext-hero-facts">
        <li><strong>${extensions.length}</strong> pieces in the range</li>
        <li><strong>4</strong> ways to wear them</li>
        <li><strong>Khar West</strong> fitting studio</li>
      </ul>
    </div>
    <div class="ext-hero-figure">
      <img src="/assets/editorial/hair-detail.webp" alt="A woman running her hand through long, dark extended hair" width="1122" height="1402" fetchpriority="high" decoding="async">
    </div>
  </section>

  <section class="ext-methods section-wrap" id="methods" aria-labelledby="methods-title">
    <div class="ext-section-head">
      <div><p class="eyebrow">How they are worn</p><h2 id="methods-title">Four ways to add length</h2></div>
      <p>One you fit yourself. Three we fit for you. The right one depends on your hair, not on the price.</p>
    </div>
    <div class="ext-tabs" role="tablist" aria-label="Extension methods">
      ${methods.map((m, i) => `<button role="tab" type="button" id="tab-${m.id}" aria-controls="method-${m.id}" aria-selected="${i === 0}" tabindex="${i === 0 ? 0 : -1}" data-method="${m.id}">${esc(m.tab)}</button>`).join('')}
    </div>
    <div class="ext-method-stage">${methods.map(methodPanel).join('')}</div>
  </section>

  <section class="ext-compare section-wrap" id="compare" aria-labelledby="compare-title">
    <div class="ext-section-head">
      <div><p class="eyebrow">Side by side</p><h2 id="compare-title">Clip in, or have them fitted</h2></div>
      <p>Not every extension suits every week. Here is the honest difference.</p>
    </div>
    <table class="ext-table">
      <caption class="sr-only">Clip-in extensions compared with extensions fitted at the studio</caption>
      <thead><tr><th scope="col">What changes</th>${comparison.columns.map(c => `<th scope="col">${esc(c)}</th>`).join('')}</tr></thead>
      <tbody>${comparison.rows.map(([label, a, b]) => `<tr><th scope="row">${esc(label)}</th><td data-column="${esc(comparison.columns[0])}">${esc(a)}</td><td data-column="${esc(comparison.columns[1])}">${esc(b)}</td></tr>`).join('')}</tbody>
    </table>
  </section>

  <section class="ext-range section-wrap" id="ext-range" aria-labelledby="ext-range-title">
    <div class="ext-section-head">
      <div><p class="eyebrow">The range</p><h2 id="ext-range-title" tabindex="-1">Every extension we make</h2></div>
      <p>Choose a piece to see its available lengths, fitting method and options.</p>
    </div>
    <div class="ext-filters" role="group" aria-label="Filter extensions">
      <button type="button" data-ext-family="all" aria-pressed="true">All <span>${extensions.length}</span></button>
      ${families.map(f => `<button type="button" data-ext-family="${f.id}" aria-pressed="false">${esc(f.name)} <span>${counts[f.id]}</span></button>`).join('')}
    </div>
    <p class="ext-family-note" data-family-note hidden></p>
    <p class="sr-only" role="status" aria-live="polite" data-ext-count>${extensions.length} pieces</p>
    <ul class="catalogue-grid ext-grid" role="list">${extensions.map(card).join('\n')}</ul>
  </section>

  <section class="ext-care section-wrap" id="care" aria-labelledby="care-title">
    <div class="ext-section-head">
      <div><p class="eyebrow">Before you book</p><h2 id="care-title">Fitting, wear and aftercare</h2></div>
      <p>What a fitted set asks of you, written down before you commit to it.</p>
    </div>
    <dl class="ext-care-list">${aftercare.map(([k, v], i) => `<div class="reveal-on-scroll"><dt><span class="ext-care-index" aria-hidden="true">${String(i + 1).padStart(2, '0')}</span>${esc(k)}</dt><dd>${esc(v)}</dd></div>`).join('')}</dl>
  </section>

  <section class="ext-faq section-wrap" id="ext-questions" aria-labelledby="faq-title">
    <div class="ext-section-head"><div><p class="eyebrow">Questions</p><h2 id="faq-title">The things people ask</h2></div></div>
    <div class="ruled-accordions">${questions.map(([q, a], i) => `<details name="ext-faq"${i === 0 ? ' open' : ''}><summary>${esc(q)}<i aria-hidden="true">+</i></summary><p>${esc(a)}</p></details>`).join('')}</div>
  </section>

  <section class="ext-cta" id="ext-consultation" aria-labelledby="ext-cta-title">
    <div class="ext-cta-inner">
      <p class="eyebrow">Expert guidance</p>
      <h2 id="ext-cta-title">We look at your hair first.</h2>
      <p>Bring us your hair and your week. We will tell you which method suits both — online, or at the studio in Khar West.</p>
      <div class="ext-cta-actions">
        <a class="solid-button" href="/#consultation">Book a consultation <span aria-hidden="true">↗</span></a>
        <a class="text-link" href="https://wa.me/919967123333" target="_blank" rel="noopener noreferrer">Ask on WhatsApp <span aria-hidden="true">↗</span></a>
      </div>
    </div>
  </section>`;
}
