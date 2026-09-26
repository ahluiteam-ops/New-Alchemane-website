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
import { initOfferPopup } from './sections/offer-popup';
import { initSolutions } from './sections/solutions';
import { initQualityBanner } from './sections/quality-banner';
import './premium.css';
import './design-tokens.css';
import './sections/discovery.css';
// Last, so its small-screen corrections settle ties with everything above.
import './mobile.css';
// Final colour pass: one restrained palette across legacy and newer sections.
import './palette.css';

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
  if (document.documentElement.classList.contains('motion-mobile') && !document.documentElement.classList.contains('mobile-reveal-complete')) {
    setFloatingContactVisible(false);
    return;
  }
  const secondSection = document.querySelector('.collection-scene');
  if (!secondSection) return;
  const bounds = secondSection.getBoundingClientRect();
  const compactLayout = matchMedia('(max-width: 1000px)').matches;
  // On compact layouts the controls would cover the final category cards.
  // Bring them in only after that section has almost completely cleared.
  setFloatingContactVisible(compactLayout
    ? bounds.bottom <= innerHeight * .2
    : bounds.top <= innerHeight * .55 && bounds.bottom > 0);
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
  const desktop = window.matchMedia('(min-width: 901px)');
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
media.add({
  motion: '(prefers-reduced-motion: no-preference)',
  room: '(min-height: 680px)',
  fullRow: '(min-width: 1001px)',
}, (context) => {
  // The pinned reveal requires the entire heading and category grid to fit in
  // one viewport. Phones and tablets use normal flow so no content can be
  // centred outside, or clipped by, the fixed-height animation stage.
  if (!context.conditions.motion || !context.conditions.room || !context.conditions.fullRow) return;
  const cloudStage = document.querySelector('.cloud-stage-desktop');
  const cloudFar = cloudStage?.querySelector('.cloud-far');
  const cloudNear = cloudStage?.querySelector('.cloud-near');
  const cloudFront = cloudStage?.querySelector('.cloud-front');
  const whiteout = cloudStage?.querySelector('.whiteout');
  if (!cloudStage || !cloudFar || !cloudNear || !cloudFront || !whiteout) return;
  const cloudLayers = gsap.utils.toArray('.cloud-layer', cloudStage);
  document.documentElement.classList.add('motion-enabled');
  collection.inert = true;
  gsap.set(collection, { autoAlpha: 0 });
  gsap.set('.collection-lockup', { opacity: 0, y: 18, scale: 0.985 });
  gsap.set('.collection-discovery', { opacity: 0, y: 18 });

  reveal = gsap.timeline({
    defaults: { ease: 'none' },
    scrollTrigger: {
      trigger: '.experience', pin: '.stage', start: 'top top',
      end: () => `+=${Math.round(window.innerHeight * 2.55)}`,
      scrub: 0.85, anticipatePin: 1, invalidateOnRefresh: true,
      // collection.inert is toggled here, not from onUpdate's scrubbed
      // progress: scrub eases behind the real scroll position, so a fast
      // flick can cross this boundary while progress still reads stale,
      // leaving the category cards inert (untappable) after they're visible.
      // onLeave/onEnterBack fire from the actual scroll position instead.
      onLeave() { collection.inert = false; },
      onEnterBack() { collection.inert = true; },
    },
    onUpdate() {
      const progress = this.progress();
      hero.inert = progress > 0.42;
      setFloatingContactVisible(progress >= 0.67);
    },
  });

  reveal.to('.hero-art', { scale: 1.045, yPercent: -3, duration: 0.52 }, 0)
    .to('.hero-actions', { opacity: 0, y: -22, duration: 0.16 }, 0)
    .to('.site-header', { y: -24, opacity: 0, duration: 0.22 }, 0.2)
    .to(cloudFar, { y: () => -innerHeight * 1.22, xPercent: 4, duration: 0.52 }, 0)
    .to(cloudNear, { y: () => -innerHeight * 1.4, xPercent: -4, duration: 0.49 }, 0.025)
    .to(cloudFront, { y: () => -innerHeight * 1.58, xPercent: 3, duration: 0.47 }, 0.055)
    .to(whiteout, { opacity: 1, duration: 0.15, ease: 'power1.inOut' }, 0.36)
    .set(hero, { autoAlpha: 0 }, 0.53)
    .set(collection, { autoAlpha: 1 }, 0.53)
    .set(cloudLayers, { opacity: 0 }, 0.54)
    .to(whiteout, { opacity: 0, duration: 0.22, ease: 'power1.inOut' }, 0.61)
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

// Phones and tablets use the same pinned cloud / whiteout / scene-swap
// choreography as desktop. The real collection is taller than one viewport,
// so an inert clone supplies the pinned reveal frame and aligns exactly with
// the real collection as the pin releases.
media.add('(prefers-reduced-motion: no-preference) and (max-width: 1000px)', () => {
  const root = document.documentElement;
  const experience = document.querySelector('.experience');
  const stage = document.querySelector('.stage');
  const cloudStage = document.querySelector('.cloud-stage-mobile');
  if (!experience || !stage || !cloudStage || !hero || !collection) return;
  const cloudLayers = gsap.utils.toArray('.cloud-layer', cloudStage);
  const cloudFar = cloudStage.querySelector('.cloud-far');
  const cloudNear = cloudStage.querySelector('.cloud-near');
  const cloudFront = cloudStage.querySelector('.cloud-front');
  const whiteout = cloudStage.querySelector('.whiteout');
  if (!cloudFar || !cloudNear || !cloudFront || !whiteout) return;

  const collectionNext = collection.nextSibling;
  const preview = collection.cloneNode(true);
  preview.classList.add('collection-scene-mobile');
  preview.classList.remove('collection-scene-flow');
  preview.removeAttribute('id');
  preview.removeAttribute('aria-labelledby');
  preview.setAttribute('aria-hidden', 'true');
  preview.inert = true;
  preview.querySelectorAll('[id]').forEach(element => element.removeAttribute('id'));
  preview.querySelectorAll('a, button, input, select, textarea, [tabindex]').forEach(element => element.setAttribute('tabindex', '-1'));

  stage.insertBefore(preview, cloudStage);
  experience.after(collection);
  collection.classList.add('collection-scene-flow');
  root.classList.add('motion-mobile');
  collection.inert = true;

  const previewLockup = preview.querySelector('.collection-lockup');
  const previewDiscovery = preview.querySelector('.collection-discovery');
  gsap.set(cloudLayers, { y: 0, xPercent: 0, force3D: true });
  gsap.set(whiteout, { opacity: 0 });
  gsap.set(preview, { autoAlpha: 0 });
  gsap.set(previewLockup, { opacity: 0, y: 18, scale: 0.985 });
  gsap.set(previewDiscovery, { opacity: 0, y: 18 });

  reveal = gsap.timeline({
    defaults: { ease: 'none' },
    scrollTrigger: {
      id: 'mobile-cloud-reveal',
      trigger: experience,
      pin: stage,
      start: 'top top',
      end: () => `+=${Math.round(window.innerHeight * 2.55)}`,
      scrub: 0.85,
      anticipatePin: 1,
      invalidateOnRefresh: true,
      refreshPriority: 1,
      // collection.inert is toggled here, not from onUpdate's scrubbed
      // progress: scrub eases behind the real scroll position, so a fast
      // flick can cross this boundary while progress still reads stale,
      // leaving the category cards inert (untappable) after they're visible.
      // onLeave/onEnterBack fire from the actual scroll position instead.
      onLeave() {
        root.classList.add('mobile-reveal-complete');
        collection.inert = false;
        updateFloatingContactForFlow();
      },
      onEnterBack() {
        root.classList.remove('mobile-reveal-complete');
        collection.inert = true;
        setFloatingContactVisible(false);
      },
    },
    onUpdate() {
      const progress = this.progress();
      hero.inert = progress > 0.42;
    },
  });
  reveal.to('.hero-art', { scale: 1.045, yPercent: -3, duration: 0.52 }, 0)
    .to('.hero-actions', { opacity: 0, y: -22, duration: 0.16 }, 0)
    .to('.site-header', { y: -24, opacity: 0, duration: 0.22 }, 0.2)
    .to(cloudFar, { y: () => -innerHeight * 1.22, xPercent: 4, duration: 0.52 }, 0)
    .to(cloudNear, { y: () => -innerHeight * 1.4, xPercent: -4, duration: 0.49 }, 0.025)
    .to(cloudFront, { y: () => -innerHeight * 1.58, xPercent: 3, duration: 0.47 }, 0.055)
    .to(whiteout, { opacity: 1, duration: 0.15, ease: 'power1.inOut' }, 0.36)
    .set(hero, { autoAlpha: 0 }, 0.53)
    .set(preview, { autoAlpha: 1 }, 0.53)
    .set(cloudLayers, { opacity: 0 }, 0.54)
    .to(whiteout, { opacity: 0, duration: 0.22, ease: 'power1.inOut' }, 0.61)
    .to(previewLockup, { opacity: 1, y: 0, scale: 1, duration: 0.2, ease: 'power2.out' }, 0.67)
    .to(previewDiscovery, { opacity: 1, y: 0, duration: 0.22, ease: 'power2.out' }, 0.76);

  return () => {
    navigationTween?.kill();
    reveal = undefined;
    root.classList.remove('motion-mobile', 'mobile-reveal-complete');
    hero.inert = false;
    collection.inert = false;
    collection.classList.remove('collection-scene-flow');
    stage.insertBefore(collection, collectionNext);
    preview.remove();
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
  'hair-toppers': ['Silk Toppers', 'Cover thinning at the parting or crown. Choose a silk or skin base in the right size.'],
  'scrunchies': ['Scrunchies', 'Add quick volume to a ponytail or bun with a removable human hair piece.'],
  'ponytails': ['Ponytail Extensions', 'Add length and volume to your ponytail with a removable hair piece.'],
  'u-shaped': ['U-Shaped Extensions', 'Add length and volume with a clip-in piece. Your own hair falls over it for a natural look.'],
  'tape-extensions': ['Tape Hair Extensions', 'Add length and volume with permanent extensions fitted at our studio. Book a consultation before fitting.'],
  'halo-extensions': ['Halo Extensions', 'A removable extension held by a thin band. Your own hair covers the band.'],
};
// Each collection piece leads on to its place in the full range (#range).
const rangeTargets = {
  'hair-toppers': { tab: 'toppers', label: 'See all hair toppers' },
  'ponytails': { tab: 'clip-extensions', handle: 'pony-tail-hair-extensions', label: 'See the ponytail in the full range' },
  'u-shaped': { tab: 'clip-extensions', handle: 'u-shaped-extensions', label: 'See every clip-in piece' },
  'tape-extensions': { tab: 'permanent-extensions', handle: 'tape-hair-extensions', label: 'See permanent extensions' },
  'halo-extensions': { tab: 'clip-extensions', handle: 'halo-hair-extensions', label: 'See halo extensions' },
  'scrunchies': { tab: 'fringes', handle: 'scrunchies', label: 'See hair scrunchies' },
};
const collectionImages = new Set(['hair-toppers', 'tape-extensions', 'scrunchies', 'u-shaped', 'ponytails']);
let dialogProduct;
const dialog = document.querySelector('.product-dialog');
document.querySelectorAll('[data-product]').forEach((button) => {
  button.setAttribute('aria-label', `${button.classList.contains('edit-card') ? 'Discover ' : ''}${products[button.dataset.product][0]}`);
  button.addEventListener('click', () => {
    const id = button.dataset.product;
    dialogProduct = id;
    document.querySelector('.dialog-return-label').textContent = rangeTargets[id]?.label ?? 'See all hair solutions';
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
const cleanupSolutions = initSolutions();
const cleanupTestimonials = initTestimonials();
const cleanupQualityBanner = initQualityBanner();
const cleanupOfferPopup = initOfferPopup();
window.addEventListener('load', () => {
  if (resetScrollOnLoad) {
    resetHomepageScroll();
    if (location.hash) history.replaceState(null, '', location.pathname + location.search);
  }
  ScrollTrigger.refresh();
  if (!resetScrollOnLoad && location.hash) document.getElementById(location.hash.slice(1))?.scrollIntoView({ block: 'start' });
});
if (import.meta.hot) import.meta.hot.dispose(() => { navigationTween?.kill(); cleanupMainNavigation(); cleanupFloatingContact(); cleanupHomepage(); cleanupRange(); cleanupFilms(); cleanupPromise(); cleanupOverture(); cleanupSolutions(); cleanupTestimonials(); cleanupQualityBanner(); cleanupOfferPopup(); media.revert(); });
