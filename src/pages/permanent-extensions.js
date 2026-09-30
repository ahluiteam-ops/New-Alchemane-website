import '../design-tokens.css';
import '../sections/faq-tabs.css';
import '../sections/site-footer.css';
import '../sections/floating-contact.css';
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
  on(play, 'click', () => { video.play(); video.focus({ preventScroll: true }); });
  on(video, 'play', () => { film.classList.add('is-playing'); pauseOthers(video); });
  on(video, 'ended', () => film.classList.remove('is-playing'));
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

// ---- Method tabs ----
const methodTabs = [...document.querySelectorAll('.pe-mtabs [role="tab"]')];
const selectMethod = (tab, focus = false) => {
  methodTabs.forEach(item => {
    const selected = item === tab;
    item.setAttribute('aria-selected', String(selected));
    item.tabIndex = selected ? 0 : -1;
    document.getElementById(item.getAttribute('aria-controls')).hidden = !selected;
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
  const message = `Hello Alchemane, I'd like to book a permanent extensions consultation.\n\nName: ${name}\nPhone: ${phone}${city ? `\nCity: ${city}` : ''}\nMeet: ${form.elements.meet.value}`;
  const link = `https://wa.me/${WHATSAPP}?text=${encodeURIComponent(message)}`;
  form.querySelector('#pe-send').href = link;
  status.hidden = false;
  window.open(link, '_blank', 'noopener');
});

if (import.meta.hot) import.meta.hot.dispose(() => { abort.abort(); offscreen.disconnect(); contactCleanup?.(); });
