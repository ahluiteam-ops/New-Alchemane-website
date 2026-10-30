import './product-video-viewer.css';
import './story-video-viewer.css';

const escape = value => String(value).replace(/[&<>"']/g, character => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[character]));
const svg = path => `<svg viewBox="0 0 24 24" aria-hidden="true">${path}</svg>`;
const icons = {
  close: svg('<path d="m6 6 12 12M18 6 6 18"/>'),
  sound: svg('<path d="m11 5-6 4H2v6h3l6 4V5Zm4 3a6 6 0 0 1 0 8m3-11a10 10 0 0 0 0 14"/>'),
  mute: svg('<path d="m11 5-6 4H2v6h3l6 4V5Zm5 4 6 6m0-6-6 6"/>'),
  play: svg('<path d="m8 5 11 7-11 7Z"/>'),
  up: svg('<path d="m5 15 7-7 7 7"/>'),
  down: svg('<path d="m5 9 7 7 7-7"/>'),
};

export function createStoryVideoViewer(onSelectCard, selectors = {}) {
  const collectionSelector = selectors.collection || '.voices';
  const cardSelector = selectors.card || '[data-voice]';
  const openerSelector = selectors.opener || '.voice-play';
  const abort = new AbortController();
  const options = { signal: abort.signal };
  const dialog = document.createElement('dialog');
  dialog.className = 'product-film-dialog story-film-dialog';
  dialog.setAttribute('aria-label', 'Video player');
  dialog.innerHTML = `<div class="product-film-shell">
    <div class="product-film-feed" tabindex="0" aria-label="Videos. Swipe up or down for another video."></div>
    <div class="product-film-toolbar"><button type="button" data-story-sound aria-label="Mute video">${icons.sound}</button><button type="button" data-story-close aria-label="Close video">${icons.close}</button></div>
    <div class="product-film-navigation"><button type="button" data-story-prev aria-label="Previous video">${icons.up}</button><button type="button" data-story-next aria-label="Next video">${icons.down}</button></div>
    <label class="product-film-progress"><span class="sr-only">Video progress</span><input type="range" min="0" max="1000" step="1" value="0" aria-label="Video progress"></label>
    <p class="sr-only" role="status" data-story-announcement></p>
  </div>`;
  document.body.append(dialog);
  const shell = dialog.querySelector('.product-film-shell');
  const feed = dialog.querySelector('.product-film-feed');
  const toolbar = dialog.querySelector('.product-film-toolbar');
  const sound = dialog.querySelector('[data-story-sound]');
  const prev = dialog.querySelector('[data-story-prev]');
  const next = dialog.querySelector('[data-story-next]');
  const progress = dialog.querySelector('input[type="range"]');
  const announcement = dialog.querySelector('[data-story-announcement]');
  const player = document.createElement('video');
  player.className = 'product-film-player';
  player.playsInline = true;
  player.preload = 'none';
  player.loop = true;
  let cards = [];
  let slides = [];
  let activeIndex = -1;
  let opener = null;
  let previousOverflow = '';
  let settleTimer = 0;
  let scrollFrame = 0;
  let disposed = false;

  const syncPlayState = () => {
    const slide = slides[activeIndex];
    if (!slide) return;
    slide.classList.toggle('is-paused', player.paused);
    slide.querySelector('.product-film-toggle').setAttribute('aria-label', `${player.paused ? 'Play' : 'Pause'} video`);
  };
  const play = () => {
    const index = activeIndex;
    player.play().catch(() => {
      if (!disposed && dialog.open && activeIndex === index) {
        slides[index].classList.remove('is-loading');
        syncPlayState();
      }
    });
  };
  const activate = index => {
    if (!dialog.open || index === activeIndex) return;
    activeIndex = index;
    player.pause();
    slides.forEach((slide, position) => {
      slide.classList.toggle('is-active', position === index);
      slide.inert = position !== index;
      slide.classList.remove('is-loading', 'is-paused', 'has-error');
    });
    const card = cards[index];
    const preview = card.querySelector('video');
    const slide = slides[index];
    opener = card.querySelector(openerSelector);
    slide.append(toolbar);
    slide.querySelector('.product-film-stage').prepend(player);
    slide.classList.add('is-loading');
    slide.querySelector('.product-film-loading').textContent = 'Loading video…';
    player.poster = preview.poster;
    player.src = preview.querySelector('source').src;
    player.setAttribute('aria-label', preview.getAttribute('aria-label') || 'Video');
    progress.value = 0;
    prev.disabled = index === 0;
    next.disabled = index === cards.length - 1;
    announcement.textContent = `${preview.getAttribute('aria-label') || 'Video'}, ${index + 1} of ${cards.length}.`;
    onSelectCard(card);
    play();
  };
  const nearest = () => Math.max(0, Math.min(cards.length - 1, Math.round(feed.scrollTop / feed.clientHeight)));
  const settle = () => { clearTimeout(settleTimer); if (dialog.open) activate(nearest()); };
  const go = index => feed.scrollTo({ top: Math.max(0, Math.min(index, cards.length - 1)) * feed.clientHeight, behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth' });

  dialog.querySelector('[data-story-close]').addEventListener('click', () => dialog.close(), options);
  dialog.addEventListener('click', event => { if (event.target === dialog) dialog.close(); }, options);
  sound.addEventListener('click', () => {
    player.muted = !player.muted;
    sound.innerHTML = player.muted ? icons.mute : icons.sound;
    sound.setAttribute('aria-label', player.muted ? 'Turn sound on' : 'Mute video');
  }, options);
  prev.addEventListener('click', () => go(activeIndex - 1), options);
  next.addEventListener('click', () => go(activeIndex + 1), options);
  feed.addEventListener('scroll', () => {
    if (!scrollFrame) scrollFrame = requestAnimationFrame(() => {
      scrollFrame = 0;
      if (Math.abs(feed.scrollTop / feed.clientHeight - nearest()) < .2) settle();
    });
    clearTimeout(settleTimer);
    settleTimer = setTimeout(settle, 140);
  }, { ...options, passive: true });
  feed.addEventListener('scrollend', settle, options);
  feed.addEventListener('keydown', event => {
    if (event.target !== feed && !event.target.closest('.product-film-toggle')) return;
    if (['ArrowDown', 'ArrowUp', 'PageDown', 'PageUp'].includes(event.key)) {
      event.preventDefault();
      go(activeIndex + (['ArrowDown', 'PageDown'].includes(event.key) ? 1 : -1));
    }
  }, options);
  feed.addEventListener('click', event => {
    if (!event.target.closest('.product-film-toggle')) return;
    if (slides[activeIndex]?.classList.contains('has-error')) {
      player.load();
      slides[activeIndex].classList.remove('has-error');
    }
    if (player.paused) play();
    else player.pause();
  }, options);
  player.addEventListener('playing', () => { slides[activeIndex]?.classList.remove('is-loading'); syncPlayState(); }, options);
  player.addEventListener('waiting', () => slides[activeIndex]?.classList.add('is-loading'), options);
  player.addEventListener('pause', syncPlayState, options);
  player.addEventListener('error', () => {
    const slide = slides[activeIndex];
    if (!dialog.open || !slide) return;
    slide.classList.remove('is-loading');
    slide.classList.add('has-error');
    slide.querySelector('.product-film-loading').textContent = 'Video couldn’t load. Tap to retry.';
  }, options);
  player.addEventListener('timeupdate', () => { if (Number.isFinite(player.duration)) progress.value = Math.round(player.currentTime / player.duration * 1000); }, options);
  progress.addEventListener('input', () => { if (Number.isFinite(player.duration)) player.currentTime = player.duration * Number(progress.value) / 1000; }, options);
  document.addEventListener('visibilitychange', () => { if (document.hidden) player.pause(); }, options);
  window.addEventListener('resize', () => { if (dialog.open) feed.scrollTo({ top: activeIndex * feed.clientHeight, behavior: 'instant' }); }, options);
  dialog.addEventListener('close', () => {
    player.pause();
    player.removeAttribute('src');
    player.load();
    player.remove();
    shell.append(toolbar);
    clearTimeout(settleTimer);
    document.body.style.overflow = previousOverflow;
    opener?.focus({ preventScroll: true });
    opener = null;
    activeIndex = -1;
  }, options);

  return {
    open(card, button) {
      const section = card.closest(collectionSelector);
      if (!section) return;
      cards = [...section.querySelectorAll(cardSelector)];
      const index = cards.indexOf(card);
      if (index < 0) return;
      dialog.setAttribute('aria-label', `${section.querySelector('h2')?.textContent || 'Videos'} player`);
      opener = button;
      previousOverflow = document.body.style.overflow;
      feed.innerHTML = cards.map((entry, position) => {
        const preview = entry.querySelector('video');
        return `<article class="product-film-slide" data-story-index="${position}" aria-label="${escape(preview.getAttribute('aria-label') || 'Video')}"><div class="product-film-stage"><img class="product-film-poster" src="${escape(preview.poster)}" width="540" height="960" alt="" loading="lazy"><button type="button" class="product-film-toggle" aria-label="Pause video"><span>${icons.play}</span></button><p class="product-film-loading" role="status">Loading video…</p></div></article>`;
      }).join('');
      slides = [...feed.children];
      player.muted = false;
      player.volume = 1;
      sound.innerHTML = icons.sound;
      sound.setAttribute('aria-label', 'Mute video');
      document.body.style.overflow = 'hidden';
      dialog.showModal();
      feed.scrollTo({ top: index * feed.clientHeight, behavior: 'instant' });
      activate(index);
    },
    destroy() {
      disposed = true;
      if (dialog.open) document.body.style.overflow = previousOverflow;
      abort.abort();
      clearTimeout(settleTimer);
      cancelAnimationFrame(scrollFrame);
      player.pause();
      dialog.remove();
    },
  };
}
