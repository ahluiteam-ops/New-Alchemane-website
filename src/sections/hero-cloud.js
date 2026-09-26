import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { ScrollToPlugin } from 'gsap/ScrollToPlugin';

gsap.registerPlugin(ScrollTrigger, ScrollToPlugin);

let reveal;
let navigationTween;
let collection;

export function navigateToCollection({ fast = false, focus = true } = {}) {
  collection ??= document.querySelector('#collection');
  if (!collection) return;
  navigationTween?.kill();
  const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;
  // On desktop, .scrollTrigger.end IS collection's on-screen position — the
  // pinned preview swaps for the real thing exactly there. On phones, since
  // .hero-runway made that end point the (earlier) cloud-reveal finish line
  // rather than collection's actual flow position, landing there would strand
  // the scroll short of collection — so aim at collection's own position instead.
  const destination = reveal?.scrollTrigger?.id === 'desktop-cloud-reveal'
    ? reveal.scrollTrigger.end
    : collection.getBoundingClientRect().top + scrollY;
  const duration = reduceMotion ? 0 : fast && matchMedia('(max-width: 700px)').matches ? 0.65 : reveal ? 1.15 : 0.45;
  navigationTween = gsap.to(window, {
    scrollTo: { y: destination, autoKill: false },
    duration,
    ease: 'power2.inOut',
    onComplete() {
      if (reveal) {
        reveal.scrollTrigger.getTween()?.progress(1);
        reveal.progress(1);
      }
      if (focus) {
        const heading = collection.querySelector('h2') ?? collection;
        if (!heading.hasAttribute('tabindex')) heading.setAttribute('tabindex', '-1');
        heading.focus({ preventScroll: true });
      }
    },
  });
}

export function initHeroCloud() {
  const root = document.documentElement;
  const hero = document.querySelector('.hero-scene');
  const experience = document.querySelector('.experience');
  const stage = experience?.querySelector('.stage');
  collection = document.querySelector('#collection');
  if (!hero || !experience || !stage || !collection) return () => {};
  const media = gsap.matchMedia();

  // On phones .hero-scene sticks (CSS position: sticky, via .hero-runway in
  // hero-cloud.css) at the top of the viewport for one scroll "runway", so
  // the clouds finish rising before the real, usable product section — right
  // after .hero-runway in document flow — ever starts to appear. No GSAP pin,
  // so there's no pin-spacer left behind for a tap to catch on.
  media.add('(prefers-reduced-motion: no-preference) and (max-width: 1000px) and (min-height: 520px)', () => {
    const cloudStage = stage.querySelector('.cloud-stage-mobile');
    const far = cloudStage.querySelector('.cloud-far');
    const near = cloudStage.querySelector('.cloud-near');
    const front = cloudStage.querySelector('.cloud-front');
    const whiteout = cloudStage.querySelector('.whiteout');
    const layers = [far, near, front];
    root.classList.add('motion-flow');
    gsap.set(layers, { y: 0, xPercent: 0, force3D: true });
    gsap.set(whiteout, { opacity: 0 });

    // .hero-runway reserves 100svh plus exactly one "runway" of extra scroll
    // (--cloud-runway in hero-cloud.css; kept at the same 0.55 below so this
    // scroll-trigger's distance matches what that CSS ratio actually reserves).
    // .hero-scene can only stay stuck at the top of the viewport for that
    // runway's worth of scroll — the room CSS gives it to stay put runs out
    // once the page has scrolled past it. So the trigger's end is capped to
    // that same distance, not to .hero-scene's own (unchanged, 100svh)
    // height: the whole cloud reveal has to fit inside the window where the
    // hero is actually still stuck, or it would still be mid-fade when
    // #collection, right after .hero-runway in flow, starts entering the
    // viewport underneath it.
    const runway = () => Math.round(innerHeight * 0.55);
    reveal = gsap.timeline({
      defaults: { ease: 'none' },
      scrollTrigger: {
        id: 'mobile-cloud-flow',
        trigger: hero,
        start: 'top top',
        end: () => `+=${runway()}`,
        scrub: 0.08,
        invalidateOnRefresh: true,
      },
    });
    reveal.to(hero.querySelector('.hero-art'), { scale: 1.025, yPercent: -2, duration: 1 }, 0)
      .to(hero.querySelector('.hero-actions'), { opacity: 0, y: -18, duration: 0.16 }, 0)
      .to(far, { y: () => -innerHeight * 0.58, xPercent: 3, duration: 0.92 }, 0)
      .to(near, { y: () => -innerHeight * 0.72, xPercent: -3, duration: 0.88 }, 0.03)
      .to(front, { y: () => -innerHeight * 0.85, xPercent: 2, duration: 0.86 }, 0.06)
      .to(whiteout, { opacity: 0.24, duration: 0.12 }, 0.7)
      .to(whiteout, { opacity: 0, duration: 0.1 }, 0.87);
    ScrollTrigger.refresh();
    return () => {
      navigationTween?.kill();
      reveal = undefined;
      root.classList.remove('motion-flow');
      gsap.set([hero.querySelector('.hero-art'), hero.querySelector('.hero-actions'), ...layers, whiteout], { clearProps: 'all' });
    };
  });

  // Keep the original pinned scene change on roomy desktop screens.
  media.add('(prefers-reduced-motion: no-preference) and (min-width: 1001px) and (min-height: 520px)', () => {
    const cloudStage = stage.querySelector('.cloud-stage-desktop');
    const far = cloudStage.querySelector('.cloud-far');
    const near = cloudStage.querySelector('.cloud-near');
    const front = cloudStage.querySelector('.cloud-front');
    const whiteout = cloudStage.querySelector('.whiteout');
    const layers = [far, near, front];
    const next = collection.nextSibling;
    const preview = collection.cloneNode(false);
    const content = document.createElement('div');
    content.className = 'collection-content';
    const heading = collection.querySelector('.solutions-journey').cloneNode(true);
    heading.querySelector('.solutions-tabs').remove();
    heading.removeAttribute('id');
    heading.removeAttribute('aria-labelledby');
    heading.querySelectorAll('[id]').forEach(element => element.removeAttribute('id'));
    content.append(heading);
    preview.append(content);
    preview.classList.add('collection-scene-mobile');
    preview.removeAttribute('id');
    preview.setAttribute('aria-hidden', 'true');
    preview.inert = true;
    stage.insertBefore(preview, cloudStage);
    experience.after(collection);
    collection.classList.add('collection-scene-flow');
    collection.inert = true;
    root.classList.add('motion-mobile');
    gsap.set(preview, { autoAlpha: 0 });
    gsap.set(heading, { opacity: 0, y: 18 });
    gsap.set(layers, { y: 0, xPercent: 0, opacity: 1, force3D: true });
    gsap.set(whiteout, { opacity: 0 });

    reveal = gsap.timeline({
      defaults: { ease: 'none' },
      scrollTrigger: {
        id: 'desktop-cloud-reveal',
        trigger: experience,
        pin: stage,
        start: 'top top',
        end: () => `+=${Math.round(innerHeight * 1.8)}`,
        scrub: 0.55,
        anticipatePin: 1,
        invalidateOnRefresh: true,
        refreshPriority: 1,
      },
      onUpdate() { hero.inert = this.progress() > 0.42; },
    });
    reveal.to(hero.querySelector('.hero-art'), { scale: 1.045, yPercent: -3, duration: 0.52 }, 0)
      .to(hero.querySelector('.hero-actions'), { opacity: 0, y: -22, duration: 0.16 }, 0)
      .to(hero.querySelector('.site-header'), { y: -24, opacity: 0, duration: 0.22 }, 0.2)
      .to(far, { y: () => -innerHeight * 1.22, xPercent: 4, duration: 0.52 }, 0)
      .to(near, { y: () => -innerHeight * 1.4, xPercent: -4, duration: 0.49 }, 0.025)
      .to(front, { y: () => -innerHeight * 1.58, xPercent: 3, duration: 0.47 }, 0.055)
      .to(whiteout, { opacity: 1, duration: 0.1 }, 0.38)
      .set(hero, { autoAlpha: 0 }, 0.49)
      .set(preview, { autoAlpha: 1 }, 0.49)
      .set(layers, { opacity: 0 }, 0.5)
      .to(whiteout, { opacity: 0, duration: 0.12 }, 0.51)
      .to(heading, { opacity: 1, y: 0, duration: 0.16, ease: 'power2.out' }, 0.58);

    const trigger = reveal.scrollTrigger;
    function syncAccessibility() {
      const complete = scrollY >= trigger.end - 1;
      collection.inert = !complete;
      root.classList.toggle('mobile-reveal-complete', complete);
    }
    window.addEventListener('scroll', syncAccessibility, { passive: true });
    ScrollTrigger.addEventListener('refresh', syncAccessibility);
    ScrollTrigger.refresh();
    syncAccessibility();
    return () => {
      navigationTween?.kill();
      reveal = undefined;
      window.removeEventListener('scroll', syncAccessibility);
      ScrollTrigger.removeEventListener('refresh', syncAccessibility);
      root.classList.remove('motion-mobile', 'mobile-reveal-complete');
      hero.inert = false;
      collection.inert = false;
      collection.classList.remove('collection-scene-flow');
      stage.insertBefore(collection, next);
      preview.remove();
      gsap.set([hero, collection, hero.querySelector('.hero-art'), hero.querySelector('.hero-actions'), hero.querySelector('.site-header'), ...layers, whiteout], { clearProps: 'all' });
    };
  });

  return () => { navigationTween?.kill(); media.revert(); };
}
