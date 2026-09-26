// "Hear It From Real People" — nine client films on the homepage.
//
// The films are vertical 480×854 phone-format clips with their own audio and
// on-screen text. They ship as supplied (only re-muxed with the index at the
// front of the file so playback starts without downloading the whole clip).
// Nobody is named on the page: the clips do not come with approved names or
// quotes, and this section does not invent them. Add `name` and `note` to an
// entry below once the client has confirmed them.
//
// Durations were read from the files with ffprobe.

const films = [
  { id: 'c1', seconds: 48 },
  { id: 'c2', seconds: 29 },
  { id: 'c3', seconds: 33 },
  { id: 'c4', seconds: 25 },
  { id: 'c5', seconds: 22 },
  { id: 'c6', seconds: 42 },
  { id: 'c7', seconds: 19 },
  { id: 'c8', seconds: 19 },
  { id: 'c9', seconds: 58 },
];

const esc = value => String(value).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const clock = seconds => `${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, '0')}`;
const spoken = seconds => (seconds < 60 ? `${seconds} seconds` : `${Math.floor(seconds / 60)} minute${seconds >= 120 ? 's' : ''} ${seconds % 60} seconds`);

function card(film, index, total) {
  const dir = film.dir ?? 'testimonials';
  const kind = film.kind ?? 'client film';
  const label = film.name ? `${film.name}, ${kind}` : `${kind[0].toUpperCase()}${kind.slice(1)} ${index + 1} of ${total}`;
  return `<li class="voice-card" data-voice>
      <video preload="none" playsinline poster="/assets/${dir}/${film.id}.webp" aria-label="${esc(label)}"><source src="/assets/${dir}/${film.id}.mp4" type="video/mp4"><a href="/assets/${dir}/${film.id}.mp4">Watch the film</a></video>
      <button type="button" class="voice-play" aria-label="Play ${esc(label)}, ${spoken(film.seconds)}">
        <span class="voice-badge" aria-hidden="true"><svg viewBox="0 0 32 32"><path d="M7.1244 4 28.1244 16.1244 7.1244 28.2487Z"/></svg></span>
        <span class="voice-time" aria-hidden="true">${clock(film.seconds)}</span>
      </button>
      ${film.note ? `<p class="voice-note">${esc(film.note)}</p>` : ''}
    </li>`;
}

// "Celebrity Picks" — seven reels, still being edited. Each entry becomes a
// playable card the moment it gets a file: add `id` (the name of
// /assets/celebrities/<id>.mp4 and its <id>.webp poster) and `seconds`, plus
// `name` once the celebrity has approved being named. Until then the card is
// an honest placeholder with no fake playback.
const celebrityFilms = Array.from({ length: 7 }, () => ({ id: '', seconds: 0, name: '' }));

function pendingCard(index, total, kind) {
  return `<li class="voice-card voice-card--pending">
      <div class="voice-pending">
        <span class="voice-pending-label">Film coming soon</span>
        <span class="sr-only">${kind} ${index + 1} of ${total}</span>
      </div>
    </li>`;
}

function rail({ id, title, sub, label, items }) {
  return `<section class="voices" id="${id}" aria-labelledby="${id}-title">
    <div class="voices-inner section-wrap">
      <div class="voices-head reveal-on-scroll">
        <div><h2 id="${id}-title">${title}</h2>${sub ? `<p class="voices-sub">${sub}</p>` : ''}</div>
        <div class="voices-controls" role="group" aria-label="Scroll the films">
          <button type="button" data-voices-prev aria-label="Previous films" disabled><svg viewBox="0 0 24 24" aria-hidden="true"><path d="m15 5-7 7 7 7"/></svg></button>
          <button type="button" data-voices-next aria-label="Next films"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="m9 5 7 7-7 7"/></svg></button>
        </div>
      </div>
    </div>
    <ul class="voices-track" role="list" tabindex="-1" data-voices-track aria-label="${label}">
      ${items.join('\n      ')}
    </ul>
  </section>`;
}

export function renderTestimonials() {
  return rail({
    id: 'voices',
    title: 'Watch our clients’ stories',
    label: 'Client films',
    items: films.map((film, i) => card(film, i, films.length)),
  });
}

export function renderCelebrityPicks() {
  const ready = celebrityFilms.filter(film => film.id);
  return rail({
    id: 'celebrity-picks',
    title: 'Celebrity Choice',
    label: 'Celebrity films',
    items: ready.length
      ? ready.map((film, index) => card({ ...film, dir: 'celebrities', kind: 'celebrity film' }, index, ready.length))
      : [pendingCard(0, 2, 'Celebrity film'), pendingCard(1, 2, 'Celebrity film')],
  });
}
