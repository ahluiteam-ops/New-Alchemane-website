import './promise.css';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

// The promise band's cutout breaks its frame (see promise.css). This adds the
// only motion on top of that: a pointer-driven tilt so the piece reads as an
// object in front of the panel, plus a slow scroll parallax. Both are inert
// on touch devices and under prefers-reduced-motion; the static drop-shadow
// in CSS carries the "lifted" read on its own when motion is off.
export function initPromise() {
  const panel = document.querySelector('.promise-panel');
  const figure = document.querySelector('[data-promise-tilt]');
  const img = figure?.querySelector('img');
  if (!panel || !img) return () => {};

  const reduced = () => matchMedia('(prefers-reduced-motion: reduce)').matches;
  const canTilt = () => matchMedia('(hover: hover) and (pointer: fine)').matches;

  gsap.set(img, { transformPerspective: 1000, transformOrigin: '50% 65%' });
  const spinX = gsap.quickTo(img, 'rotationX', { duration: 0.7, ease: 'power3.out' });
  const spinY = gsap.quickTo(img, 'rotationY', { duration: 0.7, ease: 'power3.out' });

  const onMove = event => {
    if (!canTilt() || reduced()) return;
    const rect = panel.getBoundingClientRect();
    const px = (event.clientX - rect.left) / rect.width - 0.5;
    const py = (event.clientY - rect.top) / rect.height - 0.5;
    spinY(px * 14);
    spinX(py * -9);
  };
  const onLeave = () => { spinX(0); spinY(0); };
  panel.addEventListener('pointermove', onMove);
  panel.addEventListener('pointerleave', onLeave);

  const motion = gsap.matchMedia();
  motion.add('(prefers-reduced-motion: no-preference)', () => {
    gsap.to(img, { y: -24, ease: 'none', scrollTrigger: { trigger: panel, start: 'top bottom', end: 'bottom top', scrub: 0.6 } });
  });

  return () => {
    panel.removeEventListener('pointermove', onMove);
    panel.removeEventListener('pointerleave', onLeave);
    motion.revert();
  };
}
