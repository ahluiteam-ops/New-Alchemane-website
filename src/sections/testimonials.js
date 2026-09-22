import './testimonials.css';

// Playback is always visitor-initiated and one film at a time. Leaving the
// section, hiding the tab or starting another film pauses the current one, so
// nobody is left with a voice playing from somewhere they can no longer see.
export function initTestimonials() {
  const track = document.querySelector('[data-voices-track]');
  if (!track) return () => {};
  const abort = new AbortController();
  const options = { signal: abort.signal };
  const cards = [...track.querySelectorAll('[data-voice]')];
  const reduced = () => matchMedia('(prefers-reduced-motion: reduce)').matches;

  const videos = cards.map(card => card.querySelector('video'));
  const stop = video => { video.pause(); };

  cards.forEach(card => {
    const video = card.querySelector('video');
    const play = card.querySelector('.voice-play');
    play.addEventListener('click', () => {
      video.controls = true;
      video.play().catch(() => { video.controls = false; });
    }, options);
    video.addEventListener('play', () => {
      card.classList.add('is-playing');
      videos.forEach(other => { if (other !== video) stop(other); });
      // Bring a half-visible card fully into view so its controls are usable.
      card.scrollIntoView({ behavior: reduced() ? 'auto' : 'smooth', inline: 'nearest', block: 'nearest' });
    }, options);
    video.addEventListener('ended', () => {
      card.classList.remove('is-playing');
      video.controls = false;
      video.currentTime = 0;
      video.load();
    }, options);
    // A paused film keeps its controls so it can be resumed from where it stopped.
    video.addEventListener('error', () => card.classList.remove('is-playing'), options);
  });

  const away = new IntersectionObserver(entries => {
    entries.forEach(entry => { if (!entry.isIntersecting) stop(entry.target); });
  }, { threshold: 0.05 });
  videos.forEach(video => away.observe(video));
  document.addEventListener('visibilitychange', () => { if (document.hidden) videos.forEach(stop); }, options);

  // Arrow buttons move the track one page of cards at a time.
  const prev = document.querySelector('[data-voices-prev]');
  const next = document.querySelector('[data-voices-next]');
  const step = () => {
    const first = cards[0].getBoundingClientRect().width;
    const gap = parseFloat(getComputedStyle(track).columnGap) || 0;
    return Math.max(1, Math.floor((track.clientWidth - parseFloat(getComputedStyle(track).paddingLeft)) / (first + gap))) * (first + gap);
  };
  const sync = () => {
    const max = track.scrollWidth - track.clientWidth;
    prev.disabled = track.scrollLeft <= 2;
    next.disabled = track.scrollLeft >= max - 2;
  };
  prev.addEventListener('click', () => track.scrollBy({ left: -step(), behavior: reduced() ? 'auto' : 'smooth' }), options);
  next.addEventListener('click', () => track.scrollBy({ left: step(), behavior: reduced() ? 'auto' : 'smooth' }), options);
  track.addEventListener('scroll', sync, { ...options, passive: true });
  window.addEventListener('resize', sync, options);
  sync();

  return () => { abort.abort(); away.disconnect(); videos.forEach(stop); };
}
