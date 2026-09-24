import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { ScrollToPlugin } from 'gsap/ScrollToPlugin';
import './solutions.css';

gsap.registerPlugin(ScrollTrigger, ScrollToPlugin);

export function initSolutions() {
  const section = document.querySelector('.solutions-journey');
  if (!section) return () => {};
  const stage = section.querySelector('.solutions-stage');
  const orbit = section.querySelector('.solutions-orbit');
  const tabs = [...section.querySelectorAll('.solutions-tab')];
  const panels = [...section.querySelectorAll('.solutions-panel')];
  const ctaOrigins = panels.map(panel => {
    const copy = panel.querySelector('.solutions-copy');
    const link = copy.querySelector('.solutions-link');
    const figure = panel.querySelector('.solutions-figure');
    figure.after(link);
    return { copy, link };
  });
  const motion = gsap.matchMedia();
  let active = 0;

  section.classList.add('solutions-ready');
  orbit.hidden = false;
  orbit.setAttribute('role', 'tablist');
  tabs.forEach(tab => tab.setAttribute('role', 'tab'));
  panels.forEach((panel, i) => {
    panel.setAttribute('role', 'tabpanel');
    panel.setAttribute('aria-labelledby', tabs[i].id);
  });

  function selectSemantics(index) {
    const focusWasInPanel = panels.some((panel, i) => i !== index && panel.contains(document.activeElement));
    active = index;
    tabs.forEach((tab, i) => {
      tab.setAttribute('aria-selected', String(i === index));
      tab.tabIndex = i === index ? 0 : -1;
    });
    panels.forEach((panel, i) => {
      panel.setAttribute('aria-hidden', String(i !== index));
      panel.inert = i !== index;
    });
    if (focusWasInPanel) tabs[index].focus({ preventScroll: true });
  }

  motion.add({ mobile: '(max-width: 760px)', animate: '(prefers-reduced-motion: no-preference)', tall: '(min-height: 600px)', all: 'all' }, context => {
    const { mobile, animate, tall } = context.conditions;
    const abort = new AbortController();
    const positions = { value: active };
    let scrollTween;
    let timeline;
    let panelTransition;
    let orbitTween;
    let navigatingTo = null;
    const canPin = animate && tall;

    orbit.setAttribute('aria-orientation', mobile ? 'horizontal' : 'vertical');
    // Move the numbers along a real arc, not a straight-line approximation.
    const placeNumbers = value => {
      const radius = mobile ? 190 : 350;
      tabs.forEach((tab, i) => {
        const angle = (mobile ? 90 - (i - value) * 18 : (i - value) * 22) * Math.PI / 180;
        gsap.set(tab, { x: Math.cos(angle) * radius, y: Math.sin(angle) * radius, xPercent: -50, yPercent: -50 });
      });
    };
    const display = index => {
      panels.forEach((panel, i) => {
        gsap.set(panel, { autoAlpha: i === index ? 1 : 0 });
        gsap.set(panel.querySelectorAll('.solutions-copy, .solutions-figure'), { y: 0, opacity: 1, scale: 1 });
      });
      positions.value = index;
      placeNumbers(index);
      selectSemantics(index);
    };

    if (canPin && mobile) {
      display(0);
      const switchTo = index => {
        if (index === active) return;
        const outgoing = panels[active];
        const incoming = panels[index];
        panelTransition?.kill();
        orbitTween?.kill();
        // One panel exits before the next enters, so text and photos never overlap.
        panels.forEach(panel => {
          if (panel !== outgoing) gsap.set(panel, { autoAlpha: 0 });
        });
        gsap.set(incoming.querySelectorAll('.solutions-copy, .solutions-figure'), { y: 0, scale: 1, opacity: 1 });
        selectSemantics(index);
        orbitTween = gsap.to(positions, {
          value: index, duration: .3, ease: 'power2.out', overwrite: true,
          onUpdate: () => placeNumbers(positions.value),
        });
        panelTransition = gsap.timeline()
          .to(outgoing, { autoAlpha: 0, duration: .1, ease: 'power1.out' })
          .fromTo(incoming, { autoAlpha: 0 }, { autoAlpha: 1, duration: .22, ease: 'power2.out' })
          .fromTo(incoming.querySelector('.solutions-copy'), { y: 12 }, { y: 0, duration: .22, ease: 'power2.out' }, '<')
          .fromTo(incoming.querySelector('.solutions-figure'), { y: 12 }, { y: 0, duration: .22, ease: 'power2.out' }, '<');
      };
      timeline = ScrollTrigger.create({
        id: 'hair-solutions', trigger: stage, start: 'top top',
        end: () => `+=${stage.offsetHeight * 1.65}`,
        pin: stage, anticipatePin: 1, invalidateOnRefresh: true,
        onUpdate: trigger => {
          if (navigatingTo !== null) return;
          switchTo(Math.min(panels.length - 1, Math.floor(trigger.progress * panels.length)));
        },
      });
      timeline.switchTo = switchTo;
    } else if (canPin) {
      display(0);
      timeline = gsap.timeline({
        defaults: { ease: 'none' },
        onUpdate: () => {
          placeNumbers(positions.value);
          const next = Math.round(positions.value);
          if (next !== active) selectSemantics(next);
        },
        scrollTrigger: {
          id: 'hair-solutions', trigger: stage, start: 'top top',
          end: () => `+=${stage.offsetHeight * 2.4}`,
          pin: stage, scrub: .45, anticipatePin: 1, invalidateOnRefresh: true,
        },
      });
      for (let i = 1; i < panels.length; i++) {
        const at = i - .25;
        const outgoing = panels[i - 1];
        const incoming = panels[i];
        timeline.to(outgoing, { autoAlpha: 0, duration: .5 }, at)
          .to(outgoing.querySelector('.solutions-copy'), { y: -48, duration: .5 }, at)
          .to(outgoing.querySelector('.solutions-figure'), { y: -24, scale: .97, duration: .5 }, at)
          .fromTo(incoming, { autoAlpha: 0 }, { autoAlpha: 1, duration: .5 }, at)
          .fromTo(incoming.querySelector('.solutions-copy'), { y: 48 }, { y: 0, duration: .5 }, at)
          .fromTo(incoming.querySelector('.solutions-figure'), { y: 24, scale: .97 }, { y: 0, scale: 1, duration: .5 }, at)
          .to(positions, { value: i, duration: .5 }, at);
      }
      // Equal reading holds before, between and after the two transitions.
      timeline.to({}, { duration: .75 }, 2.25);
    } else {
      // Reduced motion and short viewports retain real, fully usable tabs.
      display(active);
    }

    const choose = index => {
      scrollTween?.kill();
      if (!timeline) { display(index); return; }
      const trigger = mobile ? timeline : timeline.scrollTrigger;
      const progress = (index + .5) / panels.length;
      if (mobile) { timeline.switchTo(index); navigatingTo = index; }
      scrollTween = gsap.to(window, {
        scrollTo: { y: trigger.start + (trigger.end - trigger.start) * progress, autoKill: true },
        duration: mobile ? .42 : .65, ease: 'power2.inOut', overwrite: 'auto',
        onComplete: () => { navigatingTo = null; },
        onInterrupt: () => { navigatingTo = null; },
      });
    };
    tabs.forEach((tab, index) => {
      tab.addEventListener('click', () => choose(index), { signal: abort.signal });
      tab.addEventListener('keydown', event => {
        let next;
        if (['ArrowRight', 'ArrowDown'].includes(event.key)) next = (index + 1) % tabs.length;
        if (['ArrowLeft', 'ArrowUp'].includes(event.key)) next = (index - 1 + tabs.length) % tabs.length;
        if (event.key === 'Home') next = 0;
        if (event.key === 'End') next = tabs.length - 1;
        if (next === undefined) return;
        event.preventDefault();
        tabs[next].focus({ preventScroll: true });
        choose(next);
      }, { signal: abort.signal });
    });
    return () => { abort.abort(); scrollTween?.kill(); panelTransition?.kill(); orbitTween?.kill(); };
  });

  return () => {
    motion.revert();
    section.classList.remove('solutions-ready');
    orbit.hidden = true;
    orbit.removeAttribute('role');
    panels.forEach((panel, i) => {
      const cta = ctaOrigins[i];
      cta.copy.append(cta.link);
      panel.inert = false;
      panel.removeAttribute('aria-hidden');
      panel.removeAttribute('role');
      panel.setAttribute('aria-labelledby', `solution-heading-${['toppers', 'extensions', 'wigs'][i]}`);
    });
  };
}
