import './styles.css';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { initHomepage } from './homepage';
import { initCatalogue } from './sections/catalogue';
import { initSolutions } from './sections/solutions';
import { initTestimonials } from './sections/testimonials';
import { initHeroCloud, navigateToCollection } from './sections/hero-cloud';
import { initQualityBanner } from './sections/quality-banner';
import { initOfferPopup } from './sections/offer-popup';
import { initFloatingContact } from './sections/floating-contact';
import './premium.css';
import './design-tokens.css';
import './sections/discovery.css';
import './mobile.css';
import './palette.css';
import './mobile-homepage.css';
import './sections/best-sellers.css';
import './sections/shop-concerns.css';
import './sections/checkout-discount.css';
import './sections/risk-free-banner.css';
import './sections/faq-tabs.css';
import './sections/studio-visit.css';
import './sections/hero-cloud.css';
import './sections/floating-contact.css';
import './sections/site-footer.css';

gsap.registerPlugin(ScrollTrigger);
const controller = new AbortController();
const options = { signal: controller.signal };
const legacyCollectionHash = location.hash === '#collection' && new URLSearchParams(location.search).has('category');
if (legacyCollectionHash) history.replaceState(null, '', location.pathname + location.search);
const startAtHero = !location.hash || location.hash === '#home';
let userMoved = false;
if (startAtHero) {
  if ('scrollRestoration' in history) history.scrollRestoration = 'manual';
  window.scrollTo(0, 0);
  for (const event of ['touchstart', 'wheel', 'keydown']) window.addEventListener(event, () => { userMoved = true; }, { once: true, passive: true, signal: controller.signal });
}
const header = document.querySelector('.site-header');
const toggle = document.querySelector('.menu-toggle');
const nav = document.querySelector('#main-navigation');
const compact = matchMedia('(max-width: 900px)');
function setMenu(open, returnFocus = false) {
  header.classList.toggle('is-menu-open', open);
  toggle.setAttribute('aria-expanded', String(open));
  toggle.setAttribute('aria-label', open ? 'Close navigation menu' : 'Open navigation menu');
  nav.inert = compact.matches && !open;
  if (returnFocus) toggle.focus();
}
toggle.addEventListener('click', () => setMenu(toggle.getAttribute('aria-expanded') !== 'true'), options);
nav.addEventListener('click', event => { if (event.target.closest('a')) setMenu(false); }, options);
document.addEventListener('keydown', event => {
  if (event.key === 'Escape' && toggle.getAttribute('aria-expanded') === 'true') setMenu(false, true);
}, options);
document.addEventListener('click', event => { if (!header.contains(event.target)) setMenu(false); }, options);
header.addEventListener('focusout', event => { if (!header.contains(event.relatedTarget)) setMenu(false); }, options);
compact.addEventListener('change', () => setMenu(false), options);
setMenu(false);

document.addEventListener('click', event => {
  const link = event.target.closest('a[href^="#"]');
  if (!link || link.hasAttribute('data-catalogue-category') || link.hasAttribute('data-range-open') || event.defaultPrevented || event.ctrlKey || event.metaKey || event.shiftKey || event.altKey) return;
  const target = document.getElementById(link.hash.slice(1));
  if (!target) return;
  event.preventDefault();
  if (link.hash === '#collection') {
    navigateToCollection({ fast: Boolean(link.closest('.hero-actions')) });
    return;
  }
  target.scrollIntoView({ behavior: 'instant', block: 'start' });
  if (!target.hasAttribute('tabindex')) target.setAttribute('tabindex', '-1');
  target.focus({ preventScroll: true });
  history.pushState(null, '', link.hash);
}, options);

const cleanups = [initHomepage(), initSolutions(), initCatalogue(), initTestimonials(), initHeroCloud(), initQualityBanner(), initOfferPopup(), initFloatingContact()];
const contact = document.querySelector('.floating-contact');
const bestSellers = document.querySelector('.best-sellers');
let contactFrame = 0;
const syncContactVisibility = () => {
  contactFrame = 0;
  contact?.classList.toggle('is-visible', Boolean(bestSellers && bestSellers.getBoundingClientRect().top <= 0));
};
const requestContactVisibilitySync = () => {
  if (!contactFrame) contactFrame = requestAnimationFrame(syncContactVisibility);
};
window.addEventListener('scroll', requestContactVisibilitySync, { passive: true, signal: controller.signal });
window.addEventListener('resize', requestContactVisibilitySync, options);
syncContactVisibility();
window.addEventListener('load', () => {
  ScrollTrigger.refresh();
  if (startAtHero) {
    if (!userMoved) window.scrollTo(0, 0);
    requestAnimationFrame(() => {
      if (!userMoved) window.scrollTo(0, 0);
      ScrollTrigger.update();
    });
  } else if (location.hash === '#collection') navigateToCollection({ fast: true, focus: false });
  else if (location.hash) document.getElementById(location.hash.slice(1))?.scrollIntoView({ block: 'start' });
}, options);
window.addEventListener('pageshow', event => {
  if (startAtHero && !event.persisted && !userMoved) requestAnimationFrame(() => window.scrollTo(0, 0));
}, options);
if (import.meta.hot) import.meta.hot.dispose(() => {
  controller.abort(); cancelAnimationFrame(contactFrame); cleanups.forEach(cleanup => cleanup?.());
});
