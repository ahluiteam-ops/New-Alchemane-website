// Add the approved 9:16 film URLs here when the edits are ready.
// Empty src means a still photograph and an honest coming-soon label.
export const reels = {
  toppers: {
    title: 'Toppers, explained.',
    description: 'The fit, the finish, the everyday care.',
    poster: '/assets/films/toppers-3.webp',
    alt: 'A closer look at the finish of an Alchemane hair topper',
    src: '',
    captions: '',
    link: 'Explore toppers',
    category: 'toppers',
  },
  extensions: {
    title: 'Extensions, explained.',
    description: 'Tape, micro ring or keratin. See the difference.',
    poster: '/assets/films/extensions-3.webp',
    alt: 'Alchemane demonstrating a tape-in hair extension',
    src: '',
    captions: '',
    link: 'Explore extensions',
    category: 'extensions',
  },
};

const escape = value => String(value).replace(/[&<>"']/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[char]);

export function renderReels(html) {
  for (const [key, film] of Object.entries(reels)) {
    const media = film.src
      ? `<video controls playsinline preload="none" poster="${escape(film.poster)}" aria-label="${escape(film.title)}"><source src="${escape(film.src)}" type="video/mp4">${film.captions ? `<track kind="captions" src="${escape(film.captions)}" srclang="en" label="English" default>` : ''}<a href="${escape(film.src)}">Watch the film</a></video><p class="reel-error" role="status" hidden>This film couldn’t load. <a href="${escape(film.src)}">Open the video</a></p>`
      : `<img src="${escape(film.poster)}" width="540" height="960" alt="${escape(film.alt)}" loading="lazy" decoding="async"><span class="reel-play" aria-hidden="true"><svg viewBox="0 0 32 32"><path d="M7.1244 4 28.1244 16.1244 7.1244 28.2487Z"/></svg></span><span class="reel-pending">Film coming soon</span>`;
    html = html.replace(`<!-- reel-${key} -->`, `<section class="reel-section" id="${key}-film" aria-labelledby="${key}-film-title"><div class="reel-copy"><p class="eyebrow">A closer look</p><h2 id="${key}-film-title">${escape(film.title)}</h2><p>${escape(film.description)}</p><a href="#range" class="text-link" data-range-open="${film.category}">${escape(film.link)} <span aria-hidden="true">↗</span></a></div><div class="reel-frame" data-reel>${media}</div></section>`);
  }
  return html;
}
