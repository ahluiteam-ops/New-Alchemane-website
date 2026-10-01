import '../design-tokens.css';
import '../sections/faq-tabs.css';
import '../sections/site-footer.css';
import '../sections/floating-contact.css';
import '../sections/client-feature.css';
import './permanent-extensions.css';
import { initFloatingContact } from '../sections/floating-contact';

const WHATSAPP = '919967123333';
const abort = new AbortController();
const on = (target, type, handler, options = {}) => target.addEventListener(type, handler, { signal: abort.signal, ...options });
const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)');

// ---- Menu (phones) ----
const header = document.querySelector('.pe-header');
const menu = header.querySelector('.pe-menu');
const setMenu = open => {
  header.classList.toggle('is-open', open);
  menu.setAttribute('aria-expanded', String(open));
  menu.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
};
on(menu, 'click', () => setMenu(menu.getAttribute('aria-expanded') !== 'true'));
on(document, 'keydown', event => { if (event.key === 'Escape') setMenu(false); });
on(document, 'click', event => { if (!header.contains(event.target)) setMenu(false); });

// ---- Floating contact FAB (same widget as the homepage) ----
const contactCleanup = initFloatingContact();
const contact = document.querySelector('.floating-contact');

// ---- Floating contact visibility ----
// Shows once the hero's own Book button has scrolled out of view.
const heroCta = document.querySelector('[data-hero-cta]');
let frame = 0;

function sync() {
  frame = 0;
  const pastHero = heroCta.getBoundingClientRect().bottom < 0;
  contact?.classList.toggle('is-visible', pastHero);
}
const requestSync = () => { if (!frame) frame = requestAnimationFrame(sync); };
on(window, 'scroll', requestSync, { passive: true });
on(window, 'resize', requestSync);
sync();

// ---- Videos ----
// Hero loop plays muted (not for reduced motion). Story films play on tap,
// one at a time, and pause when scrolled away.
const hero = document.querySelector('.pe-hero__video');
if (reduceMotion.matches) { hero.removeAttribute('autoplay'); hero.pause(); }
const films = [...document.querySelectorAll('.pe-film')];
const pauseOthers = current => films.forEach(film => { const video = film.querySelector('video'); if (video !== current) video.pause(); });
films.forEach(film => {
  const video = film.querySelector('video');
  const play = film.querySelector('.pe-film__play');
  on(play, 'click', () => { video.play().catch(() => {}); });
  on(video, 'play', () => { film.classList.add('is-playing'); pauseOthers(video); });
  on(video, 'ended', () => film.classList.remove('is-playing'));
});
// Every content video starts with its own clean poster and ONE play button.
// The browser's native controls (a second play button, the timeline and the
// three-dot menu) are switched off until playback actually starts, then
// switched on so the visitor can pause, scrub and go fullscreen.
const PLAY_ICON = '<svg viewBox="0 0 32 32" aria-hidden="true"><path d="M7.1244 4 28.1244 16.1244 7.1244 28.2487Z"/></svg>';
document.querySelectorAll('main video:not(.pe-hero__video)').forEach(video => {
  video.controls = false;
  video.removeAttribute('controls');
  const inFilm = Boolean(video.closest('.pe-film'));
  let button = null;
  if (!inFilm) {
    if (video.matches('.pe-method__video')) {
      const wrap = document.createElement('span');
      wrap.className = 'pe-vwrap';
      video.before(wrap);
      wrap.append(video);
    }
    button = document.createElement('button');
    button.type = 'button';
    button.className = 'pe-vplay';
    button.setAttribute('aria-label', `Play video${video.getAttribute('aria-label') ? `: ${video.getAttribute('aria-label')}` : ''}`);
    button.innerHTML = PLAY_ICON;
    video.after(button);
    on(button, 'click', () => { video.play().catch(() => {}); });
  }
  on(video, 'play', () => { video.controls = true; if (button) button.hidden = true; });
});
const offscreen = new IntersectionObserver(entries => entries.forEach(entry => {
  if (!entry.isIntersecting) entry.target.querySelector('video').pause();
}), { threshold: 0.15 });
films.forEach(film => offscreen.observe(film));
on(document, 'visibilitychange', () => { if (document.hidden) films.forEach(film => film.querySelector('video').pause()); });

// ---- Video-style rails (consultation, results) ----
// Same behaviour as the homepage's client films: arrows (tablet/desktop)
// scroll one card and grey out at either end; dots (phones) follow the swipe.
document.querySelectorAll('[data-vrail]').forEach(section => {
  const track = section.querySelector('.pe-vtrack');
  const cards = [...track.children];
  const controls = section.querySelector('[data-rail-controls]');
  const [prev, next] = controls.querySelectorAll('button');
  const dots = [...section.querySelectorAll('.pe-dots span')];
  const step = () => (cards[1] ? cards[1].offsetLeft - cards[0].offsetLeft : track.clientWidth);
  const syncRail = () => {
    const max = track.scrollWidth - track.clientWidth;
    controls.style.visibility = max > 4 ? '' : 'hidden';
    prev.disabled = track.scrollLeft <= 4;
    next.disabled = track.scrollLeft >= max - 4;
    const index = track.scrollLeft >= max - 4 ? cards.length - 1 : Math.round(track.scrollLeft / step());
    dots.forEach((dot, i) => dot.classList.toggle('is-active', i === index));
  };
  controls.querySelectorAll('[data-rail-dir]').forEach(button => on(button, 'click', () => {
    track.scrollBy({ left: step() * Number(button.dataset.railDir), behavior: reduceMotion.matches ? 'auto' : 'smooth' });
  }));
  on(track, 'scroll', syncRail, { passive: true });
  on(window, 'resize', syncRail);
  syncRail();
});

// ---- See the difference carousel ----
// Same logic as the homepage's stories carousel: native scroll-snap, arrows step
// one photo and wrap at the ends, and the visible photos (three from 701px up,
// one on phones) are the only ones exposed to assistive tech.
const diffSlides = [...document.querySelectorAll('.pe-diff__slide')];
const diffFrame = document.querySelector('.pe-diff__frame');
const diffStatus = document.querySelector('[data-diff-status]');
const diffWide = matchMedia('(min-width: 701px)');
let diffIndex = 0;
let diffTimer = 0;
const diffVisible = () => (diffWide.matches ? 3 : 1);
const diffLast = () => Math.max(0, diffSlides.length - diffVisible());
const diffOffset = index => diffSlides[index].offsetLeft - diffSlides[0].offsetLeft;
const diffUpdate = () => {
  const visible = diffVisible();
  diffIndex = Math.max(0, Math.min(diffIndex, diffLast()));
  diffSlides.forEach((slide, i) => slide.setAttribute('aria-hidden', String(i < diffIndex || i >= diffIndex + visible)));
  const first = diffIndex + 1;
  const last = Math.min(diffSlides.length, diffIndex + visible);
  diffStatus.textContent = visible === 1
    ? `Showing transformation ${first} of ${diffSlides.length}`
    : `Showing transformations ${first} to ${last} of ${diffSlides.length}`;
};
const diffRender = (behavior = 'auto') => {
  diffIndex = Math.max(0, Math.min(diffIndex, diffLast()));
  diffUpdate();
  diffFrame.scrollTo({ left: diffOffset(diffIndex), behavior });
};
const diffClosest = () => diffSlides.reduce((best, slide, i) => (
  Math.abs(diffOffset(i) - diffFrame.scrollLeft) < Math.abs(diffOffset(best) - diffFrame.scrollLeft) ? i : best
), 0);
document.querySelectorAll('[data-diff-direction]').forEach(button => on(button, 'click', () => {
  const direction = Number(button.dataset.diffDirection);
  if (direction > 0) diffIndex = diffIndex >= diffLast() ? 0 : diffIndex + 1;
  else diffIndex = diffIndex <= 0 ? diffLast() : diffIndex - 1;
  diffRender(reduceMotion.matches ? 'auto' : 'smooth');
}));
on(diffFrame, 'scroll', () => {
  clearTimeout(diffTimer);
  diffTimer = window.setTimeout(() => { diffIndex = Math.min(diffClosest(), diffLast()); diffUpdate(); }, 160);
}, { passive: true });
on(diffWide, 'change', () => diffRender('auto'));
on(window, 'resize', () => diffRender('auto'));
diffRender('auto');

// ---- Method tabs ----
const methodTabs = [...document.querySelectorAll('.pe-mtabs [role="tab"]')];
const selectMethod = (tab, focus = false) => {
  methodTabs.forEach(item => {
    const selected = item === tab;
    item.setAttribute('aria-selected', String(selected));
    item.tabIndex = selected ? 0 : -1;
    const panel = document.getElementById(item.getAttribute('aria-controls'));
    panel.hidden = !selected;
    if (!selected) panel.querySelector('video')?.pause();
  });
  const list = tab.parentElement;
  list.scrollTo({ left: tab.offsetLeft - (list.clientWidth - tab.offsetWidth) / 2, behavior: reduceMotion.matches ? 'auto' : 'smooth' });
  if (focus) tab.focus();
};
methodTabs.forEach((tab, index) => {
  on(tab, 'click', () => selectMethod(tab));
  on(tab, 'keydown', event => {
    const step = event.key === 'ArrowRight' ? 1 : event.key === 'ArrowLeft' ? -1 : 0;
    if (!step) return;
    event.preventDefault();
    selectMethod(methodTabs[(index + step + methodTabs.length) % methodTabs.length], true);
  });
});

// On phones, the method card follows the same left/right convention as the
// video rails. The tabs remain available as the visible, keyboard-friendly
// alternative; a vertical movement is left to normal page scrolling.
const methods = document.querySelector('.pe-methods');
let swipeStart;
on(methods, 'pointerdown', event => {
  if (!matchMedia('(max-width: 999px)').matches || event.pointerType !== 'touch') return;
  if (event.target.closest('a, button, video')) return;
  swipeStart = { x: event.clientX, y: event.clientY, pointerId: event.pointerId };
});
on(methods, 'pointerup', event => {
  if (!swipeStart || event.pointerId !== swipeStart.pointerId) return;
  const deltaX = event.clientX - swipeStart.x;
  const deltaY = event.clientY - swipeStart.y;
  swipeStart = undefined;
  if (Math.abs(deltaX) < 48 || Math.abs(deltaX) <= Math.abs(deltaY) * 1.2) return;
  const current = methodTabs.findIndex(tab => tab.getAttribute('aria-selected') === 'true');
  const next = (current + (deltaX < 0 ? 1 : -1) + methodTabs.length) % methodTabs.length;
  selectMethod(methodTabs[next]);
});
on(methods, 'pointercancel', () => { swipeStart = undefined; });

// Only one rail clip can play at a time, preventing overlapping audio when a
// visitor moves through the consultation or client-result stories.
const railVideos = [...document.querySelectorAll('.pe-vcard video')];
railVideos.forEach(video => on(video, 'play', () => {
  railVideos.forEach(other => { if (other !== video) other.pause(); });
}));

// Spoken-content videos share one playback lane to prevent overlapping audio
// across sections; an off-screen guide pauses automatically.
const guideMedia = document.querySelector('.pe-guide__media');
const contentVideos = [...document.querySelectorAll('main video:not(.pe-hero__video)')];
contentVideos.forEach(video => on(video, 'play', () => {
  contentVideos.forEach(other => { if (other !== video) other.pause(); });
}));
if (guideMedia) offscreen.observe(guideMedia);

// ---- FAQ tabs ----
const tabs = [...document.querySelectorAll('[data-faq-tab]')];
const selectTab = tab => tabs.forEach(item => {
  const selected = item === tab;
  item.setAttribute('aria-selected', String(selected));
  item.tabIndex = selected ? 0 : -1;
  document.getElementById(item.getAttribute('aria-controls')).hidden = !selected;
});
tabs.forEach((tab, index) => {
  on(tab, 'click', () => selectTab(tab));
  on(tab, 'keydown', event => {
    const step = event.key === 'ArrowRight' ? 1 : event.key === 'ArrowLeft' ? -1 : 0;
    if (!step) return;
    event.preventDefault();
    const next = tabs[(index + step + tabs.length) % tabs.length];
    selectTab(next); next.focus();
  });
});

// ---- Consultation form → WhatsApp ----
const form = document.querySelector('#pe-form');
const error = form.querySelector('.pe-error');
const status = form.querySelector('.pe-status');
const productSelection = form.querySelector('.pe-product-selection');
let productInterest = '';

// The card identifies where a consultation should begin; it does not present
// a fitted extension as a self-service purchase.
document.querySelectorAll('[data-product-interest]').forEach(card => on(card, 'click', () => {
  productInterest = card.dataset.productInterest;
  productSelection.textContent = `Interested in ${productInterest}. We’ll talk about it during your consultation.`;
  productSelection.hidden = false;
}));

// "Meet online instead" and similar links preselect how to meet.
document.querySelectorAll('[data-meet]').forEach(link => on(link, 'click', () => {
  const choice = form.querySelector(`input[name="meet"][value="${link.dataset.meet}"]`);
  if (choice) choice.checked = true;
}));
on(form, 'input', event => {
  event.target.removeAttribute('aria-invalid');
  error.hidden = true;
  status.hidden = true;
});
on(form, 'submit', event => {
  event.preventDefault();
  const name = form.elements.name.value.trim();
  const phone = form.elements.phone.value.trim();
  const digits = phone.replace(/\D/g, '');
  const problems = [];
  if (!name) { problems.push('your name'); form.elements.name.setAttribute('aria-invalid', 'true'); }
  if (digits.length < 7 || digits.length > 15) { problems.push('a valid phone number'); form.elements.phone.setAttribute('aria-invalid', 'true'); }
  if (problems.length) {
    error.textContent = `Please add ${problems.join(' and ')}.`;
    error.hidden = false;
    form.querySelector('[aria-invalid="true"]').focus();
    return;
  }
  const city = form.elements.city.value.trim();
  const message = `Hello Alchemane, I'd like to book a permanent extensions consultation.\n\nName: ${name}\nPhone: ${phone}${city ? `\nCity: ${city}` : ''}${productInterest ? `\nInterested in: ${productInterest}` : ''}\nMeet: ${form.elements.meet.value}`;
  const link = `https://wa.me/${WHATSAPP}?text=${encodeURIComponent(message)}`;
  form.querySelector('#pe-send').href = link;
  status.hidden = false;
  window.open(link, '_blank', 'noopener');
});

if (import.meta.hot) import.meta.hot.dispose(() => { abort.abort(); offscreen.disconnect(); contactCleanup?.(); });
