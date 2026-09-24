// Copy is grounded in the existing catalogue and consultation/FAQ information.
// Generated editorial illustrations are not photographs of specific inventory.
export const solutions = [
  {
    id: 'toppers', name: 'Scalp Like Hair Toppers', title: 'Scalp Like<br>Hair Toppers',
    benefit: 'A little coverage. A beautiful difference.',
    description: 'Add coverage at the parting and crown without covering all of your hair. Explore silk and skin-base toppers, with guidance on the shade, base size and fit that work for you.',
    details: ['Parting & crown', 'Silk & skin bases'], action: 'Explore hair toppers',
    alt: 'Illustrative close-up of a dark hair topper held in two hands, showing its scalp-like centre parting',
  },
  {
    id: 'extensions', name: 'Seamless Hair Extensions', title: 'Seamless<br>Hair Extensions',
    benefit: 'Your hair. With a little more possibility.',
    description: 'Bring extra length and fullness to your own hair. Choose removable clip-in pieces or explore salon-fitted methods, with help finding the right shade, texture and attachment for your routine.',
    details: ['Length & fullness', 'Clip-in or salon-fitted'], action: 'Explore hair extensions',
    alt: 'Illustrative studio photograph of three dark wavy clip-in extension wefts with visible attachment clips',
  },
  {
    id: 'wigs', name: 'Luxury Wigs', title: 'Luxury<br>Wigs',
    benefit: 'A complete look. Entirely your own.',
    description: 'Discover full-head coverage in one complete hair piece. Explore our premium wigs and speak with the team about the available lengths, shades and fit before choosing your new look.',
    details: ['Full-head coverage', 'Personal fitting guidance'], action: 'Explore luxury wigs',
    alt: 'Illustrative studio photograph of a dark shoulder-length wavy wig on an ivory display bust',
  },
];

export function renderSolutions() {
  return `<section class="solutions-journey" id="hair-solutions" aria-labelledby="solutions-title">
    <header class="solutions-heading section-wrap">
      <div><p class="eyebrow">Find your solution</p><h2 id="solutions-title">Industry-leading solutions<br>for your hair.</h2></div>
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
