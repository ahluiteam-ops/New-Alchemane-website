import './styles.css';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { ScrollToPlugin } from 'gsap/ScrollToPlugin';
import { initHomepage } from './homepage';
import { initCatalogue } from './sections/catalogue';
import { initFilms } from './sections/films';
import { initPromise } from './sections/promise';
import { initOverture } from './sections/overture';
import { initTestimonials } from './sections/testimonials';
import './premium.css';
import './design-tokens.css';
import './sections/discovery.css';
// Last, so its small-screen corrections settle ties with everything above.
import './mobile.css';

gsap.registerPlugin(ScrollTrigger, ScrollToPlugin);
const hero = document.querySelector('.hero-scene');
const collection = document.querySelector('.collection-scene');
const motionPreference = window.matchMedia('(prefers-reduced-motion: reduce)');
let reveal;
let navigationTween;
const resetScrollOnLoad = !location.hash || location.hash === '#home' || location.hash === '#collection';
const resetHomepageScroll = () => window.scrollTo(0, 0);

// A browser can restore its prior scroll position during a reload. That would
// start the pinned hero timeline part-way through, rather than at its opening.
if (resetScrollOnLoad) {
  if ('scrollRestoration' in history) history.scrollRestoration = 'manual';
  resetHomepageScroll();
  window.addEventListener('pagehide', resetHomepageScroll);
  window.addEventListener('pageshow', () => {
    resetHomepageScroll();
    requestAnimationFrame(() => {
      resetHomepageScroll();
      ScrollTrigger.update();
    });
  });
}

function setFloatingContactVisible(visible) {
  document.querySelector('.floating-contact')?.classList.toggle('is-visible', visible);
}

function updateFloatingContactForFlow() {
  if (document.documentElement.classList.contains('motion-enabled')) return;
  const secondSection = document.querySelector('.collection-scene');
  if (!secondSection) return;
  const bounds = secondSection.getBoundingClientRect();
  setFloatingContactVisible(bounds.top <= innerHeight * .55 && bounds.bottom > 0);
}

function initMainNavigation() {
  const header = document.querySelector('.site-header');
  const toggle = document.querySelector('.menu-toggle');
  const nav = document.querySelector('#main-navigation');
  if (!header || !toggle || !nav) return () => {};

  const setOpen = (open) => {
    header.classList.toggle('is-menu-open', open);
    toggle.setAttribute('aria-expanded', String(open));
    toggle.setAttribute('aria-label', open ? 'Close navigation menu' : 'Open navigation menu');
  };
  const onToggle = () => setOpen(!header.classList.contains('is-menu-open'));
  const onKeydown = (event) => { if (event.key === 'Escape') setOpen(false); };
  const onDocumentClick = (event) => {
    if (header.classList.contains('is-menu-open') && !header.contains(event.target)) setOpen(false);
  };
  const desktop = window.matchMedia('(min-width: 601px)');
  const onBreakpointChange = (event) => { if (event.matches) setOpen(false); };

  toggle.addEventListener('click', onToggle);
  nav.addEventListener('click', () => setOpen(false));
  document.addEventListener('keydown', onKeydown);
  document.addEventListener('click', onDocumentClick);
  desktop.addEventListener('change', onBreakpointChange);

  return () => {
    toggle.removeEventListener('click', onToggle);
    document.removeEventListener('keydown', onKeydown);
    document.removeEventListener('click', onDocumentClick);
    desktop.removeEventListener('change', onBreakpointChange);
  };
}

const cleanupMainNavigation = initMainNavigation();

function initFloatingContact() {
  if (!document.querySelector('.floating-contact')) return () => {};
  const options = { passive: true };
  window.addEventListener('scroll', updateFloatingContactForFlow, options);
  window.addEventListener('resize', updateFloatingContactForFlow, options);
  updateFloatingContactForFlow();
  return () => {
    window.removeEventListener('scroll', updateFloatingContactForFlow);
    window.removeEventListener('resize', updateFloatingContactForFlow);
  };
}

const media = gsap.matchMedia();
media.add({ motion: '(prefers-reduced-motion: no-preference)', room: '(min-height: 680px)' }, (context) => {
  // Short viewports use normal document flow so all collection items stay reachable.
  if (!context.conditions.motion || !context.conditions.room || (innerWidth <= 600 && innerHeight < 760)) return;
  document.documentElement.classList.add('motion-enabled');
  collection.inert = true;
  const cloudLayers = gsap.utils.toArray('.cloud-layer');
  gsap.set(collection, { autoAlpha: 0 });
  gsap.set('.collection-lockup', { opacity: 0, y: 18, scale: 0.985 });
  gsap.set('.collection-discovery', { opacity: 0, y: 18 });

  reveal = gsap.timeline({
    defaults: { ease: 'none' },
    scrollTrigger: {
      trigger: '.experience', pin: '.stage', start: 'top top',
      end: () => `+=${Math.round(window.innerHeight * 2.55)}`,
      scrub: 0.85, anticipatePin: 1, invalidateOnRefresh: true,
    },
    onUpdate() {
      const progress = this.progress();
      hero.inert = progress > 0.42;
      collection.inert = progress < 0.78;
      setFloatingContactVisible(progress >= 0.67);
    },
  });

  reveal.to('.hero-art', { scale: 1.045, yPercent: -3, duration: 0.52 }, 0)
    .to('.hero-actions', { opacity: 0, y: -22, duration: 0.16 }, 0)
    .to('.site-header', { y: -24, opacity: 0, duration: 0.22 }, 0.2)
    .to('.cloud-far', { y: () => -innerHeight * 1.22, xPercent: 4, duration: 0.52 }, 0)
    .to('.cloud-near', { y: () => -innerHeight * 1.4, xPercent: -4, duration: 0.49 }, 0.025)
    .to('.cloud-front', { y: () => -innerHeight * 1.58, xPercent: 3, duration: 0.47 }, 0.055)
    .to('.whiteout', { opacity: 1, duration: 0.15, ease: 'power1.inOut' }, 0.36)
    .set(hero, { autoAlpha: 0 }, 0.53)
    .set(collection, { autoAlpha: 1 }, 0.53)
    .set(cloudLayers, { opacity: 0 }, 0.54)
    .to('.whiteout', { opacity: 0, duration: 0.22, ease: 'power1.inOut' }, 0.61)
    .to('.collection-lockup', { opacity: 1, y: 0, scale: 1, duration: 0.2, ease: 'power2.out' }, 0.67)
    .to('.collection-discovery', { opacity: 1, y: 0, duration: 0.22, ease: 'power2.out' }, 0.76);

  return () => {
    navigationTween?.kill();
    reveal = undefined;
    document.documentElement.classList.remove('motion-enabled');
    hero.inert = false;
    collection.inert = false;
    updateFloatingContactForFlow();
  };
});

function navigate(toCollection, focus = true) {
  navigationTween?.kill();
  const target = toCollection ? (reveal?.scrollTrigger.end ?? collection.offsetTop) : 0;
  navigationTween = gsap.to(window, {
    scrollTo: { y: target, autoKill: true },
    duration: motionPreference.matches ? 0 : (reveal ? 2.5 : 0.8),
    ease: 'power2.inOut',
    onComplete() {
      if (reveal) {
        reveal.scrollTrigger.getTween()?.progress(1);
        reveal.progress(toCollection ? 1 : 0);
      }
      if (focus) (toCollection ? document.querySelector('#collection-title') : document.querySelector('.brand')).focus({ preventScroll: true });
    },
  });
}

document.querySelectorAll('a[href="#collection"], a[href="#home"]').forEach((link) => {
  link.addEventListener('click', (event) => {
    event.preventDefault();
    const isCollection = link.hash === '#collection';
    // Collection is an in-page transition, not a reload destination. Keeping
    // its fragment made a browser refresh replay the hero-to-collection motion.
    history.replaceState(null, '', location.pathname + location.search);
    navigate(isCollection);
  });
});

const products = {
  'hair-toppers': ['Silk Toppers', 'Coverage for a widening parting or thinning at the crown. Compare silk and skin bases to find the right size.'],
  'scrunchies': ['Scrunchies', 'A soft, curly human hair scrunchie that adds instant volume to a ponytail or bun.'],
  'ponytails': ['Ponytail Extensions', 'Add length and fullness to your ponytail with a removable human hair piece.'],
  'u-shaped': ['U-Shaped Extensions', 'A clip-in piece for extra length and volume, with space for your own hair to fall over the top.'],
  'tape-extensions': ['Tape Hair Extensions', 'Discreet, salon-fitted extensions for length and volume. Speak to the team about fitting and maintenance.'],
  'halo-extensions': ['Halo Extensions', 'A removable extension held by a fine wire, with your own hair brushed over it to blend.'],
};
// Each collection piece leads on to its place in the full range (#range).
const rangeTargets = {
  'hair-toppers': { tab: 'toppers', label: 'See all hair toppers' },
  'ponytails': { tab: 'clip-extensions', handle: 'pony-tail-hair-extensions', label: 'See the ponytail in the full range' },
  'u-shaped': { tab: 'clip-extensions', handle: 'u-shaped-extensions', label: 'See every clip-in piece' },
  'tape-extensions': { tab: 'permanent-extensions', handle: 'tape-hair-extensions', label: 'See every salon-fitted method' },
  'halo-extensions': { tab: 'permanent-extensions', handle: 'halo-hair-extensions', label: 'See the halo in the full range' },
  'scrunchies': { tab: 'permanent-extensions', handle: 'scrunchies', label: 'See the scrunchie in the full range' },
};
const collectionImages = new Set(['hair-toppers', 'tape-extensions', 'scrunchies', 'u-shaped', 'ponytails']);
let dialogProduct;
const dialog = document.querySelector('.product-dialog');
document.querySelectorAll('[data-product]').forEach((button) => {
  button.setAttribute('aria-label', `${button.classList.contains('edit-card') ? 'Discover ' : ''}${products[button.dataset.product][0]}`);
  button.addEventListener('click', () => {
    const id = button.dataset.product;
    dialogProduct = id;
    document.querySelector('.dialog-return-label').textContent = rangeTargets[id]?.label ?? 'Explore the collection';
    document.querySelector('#product-title').textContent = products[id][0];
    document.querySelector('.product-description').textContent = products[id][1];
    document.querySelector('.dialog-image').src = collectionImages.has(id) ? `/assets/collection/${id}.webp` : `/assets/${id}.webp`;
    document.querySelector('.dialog-image').alt = products[id][0];
    dialog.showModal();
  });
});
document.querySelector('.dialog-close').addEventListener('click', () => dialog.close());
document.querySelector('.dialog-return').addEventListener('click', () => {
  dialog.close();
  const target = rangeTargets[dialogProduct];
  if (target) window.dispatchEvent(new CustomEvent('alchemane:range', { detail: target }));
});
dialog.addEventListener('click', (event) => {
  if (event.target === dialog) {
    const rect = dialog.getBoundingClientRect();
    if (event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom) dialog.close();
  }
});

const cleanupHomepage = initHomepage();
const cleanupFloatingContact = initFloatingContact();
const cleanupRange = initCatalogue();
const cleanupFilms = initFilms();
const cleanupPromise = initPromise();
const cleanupOverture = initOverture();
const cleanupTestimonials = initTestimonials();
window.addEventListener('load', () => {
  if (resetScrollOnLoad) {
    resetHomepageScroll();
    if (location.hash) history.replaceState(null, '', location.pathname + location.search);
  }
  ScrollTrigger.refresh();
  if (!resetScrollOnLoad && location.hash) document.getElementById(location.hash.slice(1))?.scrollIntoView({ block: 'start' });
});
if (import.meta.hot) import.meta.hot.dispose(() => { navigationTween?.kill(); cleanupMainNavigation(); cleanupFloatingContact(); cleanupHomepage(); cleanupRange(); cleanupFilms(); cleanupPromise(); cleanupOverture(); cleanupTestimonials(); media.revert(); });
