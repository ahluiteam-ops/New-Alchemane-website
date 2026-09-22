import './overture.css';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

// Match the reference's cover-reveal parallax: the campaign stays fixed while
// its copy scrolls upward at full opacity, and the following section rises over
// the portrait. Zero pin spacing lets that next section provide the scroll
// distance and cover the fixed image without an empty hold at the end.
export function initOverture() {
  const stage = document.querySelector('.overture-stage');
  const campaign = stage?.querySelector('.editorial-overture');
  const portrait = campaign?.querySelector('.overture-picture > img');
  const copy = campaign?.querySelector('.editorial-overture-copy');
  const nextSection = stage?.nextElementSibling;
  if (!stage || !campaign || !portrait || !copy || !nextSection) return () => {};

  const motion = gsap.matchMedia();
  motion.add('(prefers-reduced-motion: no-preference)', () => {
    const copyTravel = () => copy.offsetTop + copy.offsetHeight + 48;
    gsap.set(portrait, { xPercent: 0, yPercent: 0, scale: 1 });

    const timeline = gsap.timeline({
      defaults: { ease: 'none' },
      scrollTrigger: {
        trigger: stage,
        start: 'top top',
        endTrigger: nextSection,
        end: 'top top',
        pin: stage,
        pinSpacing: false,
        scrub: 0.45,
        anticipatePin: 1,
        invalidateOnRefresh: true,
      },
    });

    timeline.to(copy, { y: () => -copyTravel(), duration: 1 }, 0);
  });

  return () => motion.revert();
}
