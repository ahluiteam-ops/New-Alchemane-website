import './testimonials.css';

// Wires every film rail on the page ("Hear It From Real People", "Celebrity
// Picks"). Playback is always visitor-initiated and one film at a time across
// all rails. Leaving a film, hiding the tab or starting another film pauses
// it, so nobody is left with a voice playing from somewhere they can't see.
// Placeholder cards (no film yet) have no video and are skipped.
export function initTestimonials() {
  const tracks = [...document.querySelectorAll('[data-voices-track]')];
  if (!tracks.length) return () => {};
  const abort = new AbortController();
  const options = { signal: abort.signal };
  const reduced = () => matchMedia('(prefers-reduced-motion: reduce)').matches;

  const playable = tracks.flatMap(track => [...track.querySelectorAll('[data-voice]')]);
  const videos = playable.map(card => card.querySelector('video'));
  const stop = video => { video.pause(); };

  playable.forEach(card => {
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

  // Each rail's arrow buttons move its own track one page of cards at a time.
  tracks.forEach(track => {
    const section = track.closest('.voices');
    const prev = section?.querySelector('[data-voices-prev]');
    const next = section?.querySelector('[data-voices-next]');
    const first = track.querySelector('.voice-card');
    if (!prev || !next || !first) return;
    const step = () => {
      const width = first.getBoundingClientRect().width;
      const gap = parseFloat(getComputedStyle(track).columnGap) || 0;
      return Math.max(1, Math.floor((track.clientWidth - parseFloat(getComputedStyle(track).paddingLeft)) / (width + gap))) * (width + gap);
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
  });

  return () => { abort.abort(); away.disconnect(); videos.forEach(stop); };
}
