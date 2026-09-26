// Copy is grounded in the existing catalogue and consultation/FAQ information.
// Generated editorial illustrations are not photographs of specific inventory.
export const solutions = [
  {
    id: 'toppers', name: 'Hair Toppers', title: 'Hair<br>Toppers',
    benefit: 'Cover thinning at the top.',
    description: 'A topper adds hair at the parting or crown. We help you choose the right base size, colour and fit.',
    details: ['Parting & crown', 'Silk or skin base'], action: 'See hair toppers',
    alt: 'Illustrative close-up of a dark hair topper held in two hands, showing its scalp-like centre parting',
  },
  {
    id: 'extensions', name: 'Hair Extensions', title: 'Hair<br>Extensions',
    benefit: 'Add length or volume.',
    description: 'Choose clip-in extensions you can wear at home, or permanent extensions fitted at our studio.',
    details: ['Clip-in or permanent', 'Help with colour matching'], action: 'See hair extensions',
    alt: 'Illustrative studio photograph of three dark wavy clip-in extension wefts with visible attachment clips',
  },
  {
    id: 'wigs', name: 'Wigs', title: 'Wigs',
    benefit: 'Get full-head coverage.',
    description: 'A wig covers the whole head. Book a consultation so we can help you choose the right length, colour and fit.',
    details: ['Full-head coverage', 'Consultation required'], action: 'See wigs',
    alt: 'Illustrative studio photograph of a dark shoulder-length wavy wig on an ivory display bust',
  },
];

export function renderSolutions() {
  return `<section class="solutions-journey" id="hair-solutions" aria-labelledby="solutions-title">
    <header class="solutions-heading section-wrap">
      <div><p class="eyebrow">Choose what you need</p><h2 id="solutions-title">Find the right<br>hair solution.</h2></div>
    </header>
    <div class="solutions-stage">
      <div class="solutions-orbit" aria-label="Choose a hair solution" hidden>
        <span class="solutions-orbit-line" aria-hidden="true"></span>
        ${solutions.map((s, i) => `<button type="button" class="solutions-tab" id="solution-tab-${s.id}" aria-label="${s.name}" aria-controls="solution-panel-${s.id}" title="${s.name}" data-solution="${i}"><span class="solutions-tab-dot" aria-hidden="true"></span><span aria-hidden="true">0${i + 1}</span><span class="sr-only">${s.name}</span></button>`).join('')}
      </div>
      <div class="solutions-panels">
        ${solutions.map((s, i) => `<article class="solutions-panel" id="solution-panel-${s.id}" aria-labelledby="solution-heading-${s.id}" data-solution-panel="${i}">
          <div class="solutions-copy">
            <p class="solutions-benefit">${s.benefit}</p>
            <h3 id="solution-heading-${s.id}">${s.title}</h3>
            <p class="solutions-description">${s.description}</p>
            <ul class="solutions-details" aria-label="At a glance">${s.details.map(d => `<li>${d}</li>`).join('')}</ul>
            <a class="solutions-link" href="?category=${s.id}#range" data-catalogue-category="${s.id}">${s.action}<span aria-hidden="true">↗</span></a>
          </div>
          <figure class="solutions-figure">
            <img src="/assets/solutions/${s.id}-960.webp" srcset="/assets/solutions/${s.id}-480.webp 480w, /assets/solutions/${s.id}-960.webp 960w" sizes="(max-width: 760px) 65vw, 36vw" width="960" height="1200" alt="${s.alt}" loading="lazy" decoding="async">
          </figure>
        </article>`).join('')}
      </div>
    </div>
  </section>`;
}
