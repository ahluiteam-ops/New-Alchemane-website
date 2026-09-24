import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import './quality-banner.css';

gsap.registerPlugin(ScrollTrigger);

export function initQualityBanner() {
  const section = document.querySelector('.quality-banner');
  if (!section) return () => {};
  const frame = section.querySelector('.quality-banner-media');
  const picture = section.querySelector('.quality-banner-picture');
  const motion = gsap.matchMedia();

  motion.add('(prefers-reduced-motion: no-preference)', () => {
    // Counter-scroll at page speed: the photograph stays at viewport y=0
    // while the section and text pass over it. Its absolute clipped wrapper
    // contains it on mobile, without fixed children escaping or pin spacers.
    const sizePicture = () => gsap.set(picture, {
      height: Math.max(window.innerHeight, frame.clientHeight),
    });
    sizePicture();
    gsap.fromTo(picture,
      { y: () => -window.innerHeight },
      {
        y: () => frame.clientHeight,
        ease: 'none',
        scrollTrigger: {
          id: 'quality-banner-parallax',
          trigger: frame,
          start: 'top bottom',
          end: 'bottom top',
          // No catch-up lag, including during a quick swipe.
          scrub: true,
          onRefreshInit: sizePicture,
          invalidateOnRefresh: true,
        },
      },
    );
  }, section);

  return () => motion.revert();
}
