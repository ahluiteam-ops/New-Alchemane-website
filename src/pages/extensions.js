// Behaviour for the Hair Extensions page: the method tabs, the range filter,
// and the scroll reveals. Everything here degrades to a readable, fully
// navigable page with JavaScript off — the panels ship in the HTML, the filter
// only hides cards that are already there, and nothing starts out invisible.

import '../styles.css';
import '../homepage.css';
import '../sections/discovery.css';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import '../premium.css';
import '../design-tokens.css';
import './extensions.css';
import '../palette.css';
import { families } from '../sections/extensions-data.js';
import { initOfferPopup } from '../sections/offer-popup.js';

gsap.registerPlugin(ScrollTrigger);

const reduced = () => matchMedia('(prefers-reduced-motion: reduce)').matches;

/* ---------- Method tabs ---------- */
function initMethods() {
  const tabs = [...document.querySelectorAll('.ext-tabs [data-method]')];
  if (!tabs.length) return;
  const panelOf = tab => document.querySelector(`#${tab.getAttribute('aria-controls')}`);

  const select = (tab, { focus = false } = {}) => {
    tabs.forEach(item => {
      const on = item === tab;
      item.setAttribute('aria-selected', String(on));
      item.tabIndex = on ? 0 : -1;
      panelOf(item).hidden = !on;
    });
    const panel = panelOf(tab);
    // Crossfade only — the panels are different heights, so sliding them would
    // shift everything below the stage on every tab press.
    if (!reduced()) gsap.fromTo(panel, { opacity: 0 }, { opacity: 1, duration: 0.3, ease: 'power1.out', overwrite: true });
    if (focus) tab.focus();
    ScrollTrigger.refresh();
  };

  tabs.forEach((tab, i) => {
    tab.addEventListener('click', () => select(tab));
    tab.addEventListener('keydown', event => {
      const last = tabs.length - 1;
      let next;
      if (event.key === 'ArrowRight' || event.key === 'ArrowDown') next = i === last ? 0 : i + 1;
      if (event.key === 'ArrowLeft' || event.key === 'ArrowUp') next = i === 0 ? last : i - 1;
      if (event.key === 'Home') next = 0;
      if (event.key === 'End') next = last;
      if (next === undefined) return;
      event.preventDefault();
      select(tabs[next], { focus: true });
    });
  });
}

/* ---------- Range filter ---------- */
function initFilter() {
  const buttons = [...document.querySelectorAll('[data-ext-family]')];
  const cards = [...document.querySelectorAll('.ext-grid .catalogue-card')];
  const note = document.querySelector('[data-family-note]');
  const count = document.querySelector('[data-ext-count]');
  if (!cards.length) return;

  const apply = family => {
    let shown = 0;
    cards.forEach(card => {
      const on = family === 'all' || card.dataset.family === family;
      card.hidden = !on;
      if (on) shown += 1;
    });
    document.querySelectorAll('.ext-filters [data-ext-family]').forEach(button => {
      button.setAttribute('aria-pressed', String(button.dataset.extFamily === family));
    });
    const chosen = families.find(f => f.id === family);
    note.textContent = chosen ? chosen.note : '';
    note.hidden = !chosen;
    count.textContent = `${shown} ${shown === 1 ? 'piece' : 'pieces'}`;
    if (!reduced()) {
      gsap.fromTo(cards.filter(c => !c.hidden), { opacity: 0.25, y: 10 },
        { opacity: 1, y: 0, duration: 0.35, stagger: 0.025, ease: 'power2.out', overwrite: true });
    }
    ScrollTrigger.refresh();
  };

  buttons.forEach(button => button.addEventListener('click', event => {
    const family = button.dataset.extFamily;
    // Links inside the method panels jump down to the range and filter it.
    if (button.tagName === 'A') {
      event.preventDefault();
      document.querySelector('#ext-range').scrollIntoView({ behavior: reduced() ? 'instant' : 'smooth', block: 'start' });
    }
    apply(family);
  }));
}

/* ---------- Reveals ---------- */
function initReveals() {
  if (reduced()) return;
  const motion = gsap.matchMedia();
  motion.add('(prefers-reduced-motion: no-preference)', () => {
    gsap.utils.toArray('.ext-page .ext-section-head, .ext-page .reveal-on-scroll').forEach(element => {
      gsap.from(element, { y: 16, opacity: 0, duration: 0.55, ease: 'power2.out', scrollTrigger: { trigger: element, start: 'top 91%', once: true } });
    });
  });
  return () => motion.revert();
}

/* ---------- Sticky header offset ---------- */
// discovery.css sets html { scroll-padding-top } from --shop-header-height so
// anchor jumps clear the sticky header. On the homepage the catalogue keeps
// that variable current; this page has to do it for itself, or every in-page
// link lands with its heading hidden behind the header.
function initHeaderOffset() {
  const header = document.querySelector('.shop-header');
  if (!header) return;
  const measure = () => document.documentElement.style.setProperty('--shop-header-height', `${header.offsetHeight}px`);
  measure();
  new ResizeObserver(measure).observe(header);
}

initHeaderOffset();
initMethods();
initFilter();
initReveals();
initOfferPopup();
document.querySelectorAll('.ext-faq details').forEach(d => d.addEventListener('toggle', () => ScrollTrigger.refresh()));
window.addEventListener('load', () => ScrollTrigger.refresh());
