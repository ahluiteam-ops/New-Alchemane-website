import './homepage.css';
import './sections/client-feature.css';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

export function initHomepage() {
  const reduced = () => matchMedia('(prefers-reduced-motion: reduce)').matches;
  function bindTabs(selector, onSelect) {
    const tabs = [...document.querySelectorAll(selector)];
    const select = tab => {
      tabs.forEach(item => { item.setAttribute('aria-selected', String(item === tab)); item.tabIndex = item === tab ? 0 : -1; });
      onSelect(tab);
    };
    tabs.forEach((tab, i) => {
      tab.addEventListener('click', () => select(tab));
      tab.addEventListener('keydown', event => {
        let next;
        if (event.key === 'ArrowRight' || event.key === 'ArrowDown') next = (i + 1) % tabs.length;
        if (event.key === 'ArrowLeft' || event.key === 'ArrowUp') next = (i - 1 + tabs.length) % tabs.length;
        if (event.key === 'Home') next = 0;
        if (event.key === 'End') next = tabs.length - 1;
        if (next !== undefined) { event.preventDefault(); tabs[next].focus(); select(tabs[next]); }
      });
    });
  }
  bindTabs('[data-edit]', tab => {
    document.querySelector('#product-edit').setAttribute('aria-labelledby', tab.id);
    document.querySelectorAll('.edit-card').forEach(card => { card.hidden = tab.dataset.edit !== 'all' && card.dataset.group !== tab.dataset.edit; });
    if (!reduced()) gsap.fromTo('.edit-card:not([hidden])', { opacity: .2, y: 12 }, { opacity: 1, y: 0, duration: .4, stagger: .05, overwrite: true });
    ScrollTrigger.refresh();
  });
  const stories = [
    ["No one could tell it wasn't my real hair. My confidence skyrocketed overnight.", 'Priya S.', 'Seamless Clip-In Extensions', 'priya-s', true],
    ['Finally found a solution that looks real and feels weightless. Simply amazing!', 'Ananya R.', 'Tape Hair Extensions', 'ananya-r', true],
    ['I can finally style my hair with confidence again. Thank you, Alchemane team!', 'Divya M.', 'Skin Hair Topper 5x6', 'divya-m', true],
    ["The blend is so natural even my closest friends couldn't tell the difference.", 'Ritika V.', 'Silk Hair Topper 5x3', 'ritika-v', false],
    // The supplied Meera image has no accompanying approved quote or product.
    ['', 'Meera K.', '', 'meera-k', false],
  ];
  let storyIndex = 0;
  document.querySelectorAll('[data-story-direction]').forEach(button => button.addEventListener('click', () => {
    storyIndex = (storyIndex + Number(button.dataset.storyDirection) + stories.length) % stories.length;
    const story = stories[storyIndex];
    ['#story-text', '#story-person', '#story-product'].forEach((selector, i) => { document.querySelector(selector).textContent = story[i]; });
    const photo = document.querySelector('#story-image');
    photo.src = `/assets/stories/${story[3]}.webp`;
    photo.alt = story[4] ? `${story[1]} before and after her hair transformation` : `${story[1]} — client photograph`;
    document.querySelector('#story-caption').textContent = story[4] ? 'Before / After' : `${story[1]} · Client photograph`;
    document.querySelector('#story-text').hidden = !story[0];
    document.querySelector('.quote-mark').hidden = !story[0];
    document.querySelector('#story-product').hidden = !story[2];
    document.querySelector('#story-photo-title').hidden = Boolean(story[0]);
    document.querySelector('#story-current').textContent = String(storyIndex + 1).padStart(2, '0');
    document.querySelector('.story-pagination').setAttribute('aria-label', `Story ${storyIndex + 1} of ${stories.length}`);
    document.querySelector('.story-track i').style.width = `${(storyIndex + 1) / stories.length * 100}%`;
    if (!reduced()) gsap.fromTo('.story-quote blockquote', { opacity: .25, y: 8 }, { opacity: 1, y: 0, duration: .4, overwrite: true });
  }));
  document.querySelectorAll('[data-consult-type]').forEach(link => link.addEventListener('click', () => {
    document.querySelector(`[name=meeting][value="${link.dataset.consultType === 'studio' ? 'Mumbai studio' : 'Online'}"]`).checked = true;
  }));
  document.querySelectorAll('.home-rest a[href^="#"]').forEach(link => {
    if (['#home', '#collection'].includes(link.hash) || link.hasAttribute('data-range-open') || link.hasAttribute('data-catalogue-category')) return;
    link.addEventListener('click', event => {
      const target = document.querySelector(link.hash);
      if (!target) return;
      event.preventDefault();
      target.scrollIntoView({ behavior: reduced() ? 'instant' : 'smooth', block: 'start' });
      target.setAttribute('tabindex', '-1'); target.focus({ preventScroll: true });
      history.replaceState(null, '', link.hash);
    });
  });

  const form = document.querySelector('#consultation-form');
  form.elements.phone.pattern = '[+0-9 ]{7,20}';
  form.elements.phone.title = 'Use 7–20 digits, spaces, or a leading +.';
  ['name', 'city'].forEach(name => form.elements[name].addEventListener('input', event => {
    event.target.setCustomValidity(event.target.value.trim() ? '' : 'Please enter a value.');
  }));
  form.addEventListener('submit', event => {
    event.preventDefault();
    const data = new FormData(form);
    const message = `Hello Alchemane, I’d like to arrange a consultation.\n\nName: ${data.get('name').trim()}\nPhone: ${data.get('phone').trim()}\nCity: ${data.get('city').trim()}\nHair goal: ${data.get('interest')}\nMeeting: ${data.get('meeting')}${data.get('email') ? `\nEmail: ${data.get('email').trim()}` : ''}`;
    document.querySelector('#send-consultation').href = `https://wa.me/919967123333?text=${encodeURIComponent(message)}`;
    form.querySelector('.consultation-status').hidden = false;
  });
  form.addEventListener('input', () => { form.querySelector('.consultation-status').hidden = true; document.querySelector('#send-consultation').removeAttribute('href'); });
  document.querySelectorAll('.ruled-accordions details').forEach(detail => detail.addEventListener('toggle', () => ScrollTrigger.refresh()));

  const motion = gsap.matchMedia();
  motion.add('(prefers-reduced-motion: no-preference)', () => {
    gsap.utils.toArray('.reveal-on-scroll').forEach(element => {
      gsap.from(element, { y: 16, opacity: 0, duration: .55, ease: 'power2.out', scrollTrigger: { trigger: element, start: 'top 91%', once: true } });
    });
  });
  // The overture's own scroll behaviour lives in src/sections/overture.js — the
  // portrait is held still there, so no parallax drift on it here.
  return () => { motion.revert(); };
}
