import './testimonials.css';
import { createProductVideoViewer } from './product-video-viewer.js';
import { createStoryVideoViewer } from './story-video-viewer.js';

// The centered film previews share one silent playback slot across all rails.
export function initTestimonials() {
  const tracks = [...document.querySelectorAll('[data-voices-track]')];
  if (!tracks.length) return () => {};
  const abort = new AbortController();
  const options = { signal: abort.signal };
  const motion = matchMedia('(prefers-reduced-motion: reduce)');
  const reduced = () => motion.matches;
  const playable = tracks.flatMap(track => [...track.querySelectorAll('[data-voice]')]);
  const selectCard = new WeakMap();
  const productViewer = createProductVideoViewer(card => selectCard.get(card)?.());
  const storyViewer = createStoryVideoViewer(card => selectCard.get(card)?.());
  const cleanup = [];
  let currentPreview = null;
  let previewTimer = 0;
  let previewFrame = 0;
  const stopPreview = () => {
    clearTimeout(previewTimer);
    if (!currentPreview) return;
    currentPreview.pause();
    currentPreview.closest('.voice-card').classList.remove('is-previewing');
    currentPreview = null;
  };
  const visible = video => {
    const rect = video.getBoundingClientRect();
    const track = video.closest('[data-voices-track]').getBoundingClientRect();
    const width = Math.max(0, Math.min(rect.right, track.right, innerWidth) - Math.max(rect.left, track.left, 0));
    const height = Math.max(0, Math.min(rect.bottom, track.bottom, innerHeight) - Math.max(rect.top, track.top, 0));
    return rect.width > 0 && rect.height > 0 && width * height / (rect.width * rect.height) >= .55;
  };
  const syncPreview = () => {
    previewFrame = 0;
    if (document.hidden || reduced() || document.querySelector('dialog[open]')) { stopPreview(); return; }
    let candidate = null;
    let distance = Infinity;
    tracks.forEach(track => {
      const video = track.querySelector('.voice-card.is-active video');
      if (!video || !visible(video)) return;
      const rect = video.getBoundingClientRect();
      const offset = Math.abs(rect.top + rect.height / 2 - innerHeight / 2);
      if (offset < distance) { candidate = video; distance = offset; }
    });
    if (candidate === currentPreview) return;
    stopPreview();
    if (!candidate) return;
    currentPreview = candidate;
    previewTimer = setTimeout(() => {
      if (currentPreview !== candidate || document.hidden || reduced() || document.querySelector('dialog[open]') || !visible(candidate)) return;
      candidate.muted = true;
      candidate.loop = true;
      candidate.closest('.voice-card').classList.add('is-previewing');
      candidate.play().catch(() => {
        if (currentPreview === candidate) stopPreview();
      });
    }, 100);
  };
  const requestPreview = () => { if (!previewFrame) previewFrame = requestAnimationFrame(syncPreview); };
  const openPlayer = (card, button) => {
    stopPreview();
    if (card.hasAttribute('data-product-handle')) { productViewer.open(card, button); return; }
    storyViewer.open(card, button);
  };

  playable.forEach(card => {
    const play = card.querySelector('.voice-play');
    const video = card.querySelector('video');
    video.defaultMuted = true;
    video.muted = true;
    video.loop = true;
    play.addEventListener('click', () => openPlayer(card, play), options);
  });

  tracks.forEach(track => {
    const section = track.closest('.voices');
    const prev = section?.querySelector('[data-voices-prev]');
    const next = section?.querySelector('[data-voices-next]');
    const cards = [...track.querySelectorAll('.voice-card')];
    if (!prev || !next || !cards.length) return;
    const mobileFilm = () => matchMedia('(max-width: 700px)').matches;
    let activeIndex = 0;
    let correctionTimer = 0;
    let fallbackTimer = 0;
    let scrollFrame = 0;
    let correcting = false;

    const align = (index, behavior = 'instant') => {
      const cardBox = cards[index].getBoundingClientRect();
      const trackBox = track.getBoundingClientRect();
      track.scrollTo({ left: track.scrollLeft + cardBox.left + cardBox.width / 2 - trackBox.left - trackBox.width / 2, behavior });
    };
    const nearest = () => {
      const trackBox = track.getBoundingClientRect();
      const center = trackBox.left + trackBox.width / 2;
      const distance = card => {
        const { left, width } = card.getBoundingClientRect();
        return Math.abs(left + width / 2 - center);
      };
      return cards.reduce((best, card, index) => distance(card) < distance(cards[best]) ? index : best, 0);
    };
    const controls = prev.closest('.voices-controls');
    const sync = () => {
      // Nothing to scroll on desktop (every card already fits): hide the arrows.
      controls?.toggleAttribute('data-idle', !mobileFilm() && track.scrollWidth <= track.clientWidth + 2);
      if (mobileFilm()) {
        prev.disabled = activeIndex === 0;
        next.disabled = activeIndex === cards.length - 1;
      } else {
        prev.disabled = track.scrollLeft <= 2;
        next.disabled = track.scrollLeft >= track.scrollWidth - track.clientWidth - 2;
      }
    };
    const activate = (index, alignTo = false) => {
      activeIndex = Math.max(0, Math.min(index, cards.length - 1));
      cards.forEach((card, cardIndex) => {
        card.classList.toggle('is-active', cardIndex === activeIndex);
      });
      if (alignTo && mobileFilm()) {
        correcting = true;
        clearTimeout(correctionTimer);
        requestAnimationFrame(() => align(activeIndex, reduced() ? 'instant' : 'smooth'));
        correctionTimer = setTimeout(() => {
          align(activeIndex);
          correcting = false;
          sync();
        }, reduced() ? 0 : 220);
      }
      sync();
      requestPreview();
    };
    cards.forEach((card, index) => {
      if (card.hasAttribute('data-voice')) selectCard.set(card, () => activate(index, true));
    });
    const step = () => {
      const width = cards[0].getBoundingClientRect().width;
      const gap = parseFloat(getComputedStyle(track).columnGap) || 0;
      return Math.max(1, Math.floor((track.clientWidth - parseFloat(getComputedStyle(track).paddingLeft)) / (width + gap))) * (width + gap);
    };
    const settle = () => {
      if (correcting) return;
      const closest = nearest();
      if (closest !== activeIndex) activate(closest);
      if (mobileFilm()) align(activeIndex);
      requestPreview();
    };
    prev.addEventListener('click', () => mobileFilm()
      ? activate(activeIndex - 1, true)
      : track.scrollBy({ left: -step(), behavior: reduced() ? 'auto' : 'smooth' }), options);
    next.addEventListener('click', () => mobileFilm()
      ? activate(activeIndex + 1, true)
      : track.scrollBy({ left: step(), behavior: reduced() ? 'auto' : 'smooth' }), options);
    track.addEventListener('scroll', () => {
      sync();
      if (!correcting && !scrollFrame) {
        scrollFrame = requestAnimationFrame(() => {
          scrollFrame = 0;
          const closest = nearest();
          if (closest !== activeIndex) activate(closest);
          requestPreview();
        });
      }
      if (!('onscrollend' in track)) {
        clearTimeout(fallbackTimer);
        fallbackTimer = setTimeout(settle, 140);
      }
    }, { ...options, passive: true });
    track.addEventListener('scrollend', settle, options);
    window.addEventListener('resize', () => {
      if (mobileFilm()) align(activeIndex);
      else activate(nearest());
      sync();
      requestPreview();
    }, options);
    cleanup.push(() => { clearTimeout(correctionTimer); clearTimeout(fallbackTimer); cancelAnimationFrame(scrollFrame); });
    if (!mobileFilm()) activate(nearest());
    else sync();
  });

  const exposure = new IntersectionObserver(requestPreview, { threshold: [0, .25, .55, .8, 1] });
  tracks.forEach(track => exposure.observe(track));
  const dialogs = new MutationObserver(requestPreview);
  dialogs.observe(document.body, { subtree: true, attributes: true, attributeFilter: ['open'] });
  window.addEventListener('scroll', requestPreview, { ...options, passive: true });
  document.addEventListener('visibilitychange', requestPreview, options);
  motion.addEventListener('change', requestPreview, options);
  requestPreview();

  return () => {
    abort.abort();
    cleanup.forEach(clear => clear());
    exposure.disconnect();
    dialogs.disconnect();
    cancelAnimationFrame(previewFrame);
    stopPreview();
    productViewer.destroy();
    storyViewer.destroy();
  };
}
