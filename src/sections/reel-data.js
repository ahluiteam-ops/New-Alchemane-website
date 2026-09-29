// Add the approved 9:16 film URLs here when the edits are ready.
// Empty src means a still photograph and an honest coming-soon label.
export const reels = {
  toppers: {
    title: 'How hair toppers work',
    description: 'See how a topper fits, looks and is cared for.',
    poster: '/assets/films/toppers-3.webp',
    alt: 'A closer look at the finish of an Alchemane hair topper',
    src: '',
    captions: '',
    link: 'See hair toppers',
    category: 'toppers',
  },
  extensions: {
    title: 'How hair extensions work',
    description: 'See the difference between clip-in and permanent extensions.',
    poster: '/assets/films/extensions-3.webp',
    alt: 'Alchemane demonstrating a tape-in hair extension',
    src: '',
    captions: '',
    link: 'See hair extensions',
    category: 'extensions',
  },
  wigs: {
    title: 'How wigs work',
    description: 'See the fit, the finish and the fitting itself.',
    poster: '/assets/range/premium-wigs-a.webp',
    alt: 'An Alchemane premium wig shown on a mannequin head',
    src: '',
    captions: '',
    link: 'See wigs',
    category: 'wigs',
  },
};

const escape = value => String(value).replace(/[&<>"']/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[char]);

export function renderReels(html) {
  for (const [key, film] of Object.entries(reels)) {
    const media = film.src
      ? `<video controls playsinline preload="none" poster="${escape(film.poster)}" aria-label="${escape(film.title)}"><source src="${escape(film.src)}" type="video/mp4">${film.captions ? `<track kind="captions" src="${escape(film.captions)}" srclang="en" label="English" default>` : ''}<a href="${escape(film.src)}">Watch the film</a></video><p class="reel-error" role="status" hidden>This film couldn’t load. <a href="${escape(film.src)}">Open the video</a></p>`
      : `<img src="${escape(film.poster)}" width="540" height="960" alt="${escape(film.alt)}" loading="lazy" decoding="async"><span class="reel-pending">Full video coming soon</span>`;
    html = html.replace(`<!-- reel-${key} -->`, `<section class="reel-section" id="${key}-film" aria-labelledby="${key}-film-title"><div class="reel-copy"><h2 id="${key}-film-title">${escape(film.title)}</h2><p>${escape(film.description)}</p><a href="/?category=${film.category}#range" class="text-link">${escape(film.link)} <span aria-hidden="true">↗</span></a></div><div class="reel-frame" data-reel>${media}</div></section>`);
  }
  return html;
}
