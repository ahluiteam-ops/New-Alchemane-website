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

function card(film, index) {
  const label = film.name ? `${film.name}, client film` : `Client film ${index + 1} of ${films.length}`;
  return `<li class="voice-card" data-voice>
      <video preload="none" playsinline poster="/assets/testimonials/${film.id}.webp" aria-label="${esc(label)}"><source src="/assets/testimonials/${film.id}.mp4" type="video/mp4"><a href="/assets/testimonials/${film.id}.mp4">Watch the film</a></video>
      <button type="button" class="voice-play" aria-label="Play ${esc(label)}, ${spoken(film.seconds)}">
        <span class="voice-badge" aria-hidden="true"><svg viewBox="0 0 24 24"><path d="M8 5.5v13l11-6.5z"/></svg></span>
        <span class="voice-time" aria-hidden="true">${clock(film.seconds)}</span>
      </button>
      ${film.note ? `<p class="voice-note">${esc(film.note)}</p>` : ''}
    </li>`;
}

export function renderTestimonials() {
  return `<section class="voices" id="voices" aria-labelledby="voices-title">
    <div class="voices-inner section-wrap">
      <div class="voices-head reveal-on-scroll">
        <div><h2 id="voices-title">Hear It From Real People</h2><p class="voices-sub">Same woman. Same scalp.<br>Just the right solution.</p></div>
        <div class="voices-controls" role="group" aria-label="Scroll the films">
          <button type="button" data-voices-prev aria-label="Previous films" disabled><svg viewBox="0 0 24 24" aria-hidden="true"><path d="m15 5-7 7 7 7"/></svg></button>
          <button type="button" data-voices-next aria-label="Next films"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="m9 5 7 7-7 7"/></svg></button>
        </div>
      </div>
    </div>
    <ul class="voices-track" role="list" tabindex="-1" data-voices-track aria-label="Client films">
      ${films.map(card).join('\n      ')}
    </ul>
  </section>`;
}
