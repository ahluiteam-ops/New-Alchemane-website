import './homepage.css';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

const solutions = {
  coverage: ['Meet your hair topper', 'Coverage that feels<br>like you.', 'For a widening parting or thinning at the crown. Discover a naturally blended finish, with a topper chosen around your hair, your shade, and your everyday life.', 'topper-editorial', 'Model holding a topper beside her natural parting', 'Coverage at the crown'],
  length: ['Meet your extensions', 'A little length.<br>A whole new possibility.', 'From a subtle change to a longer silhouette. Explore halo, tape, and clip-in extensions matched to the texture and movement of your own hair.', 'halo-editorial', 'Model showing the length and construction of a halo extension', 'More length'],
  volume: ['Meet your fuller finish', 'More movement.<br>More possibilities.', 'An elevated ponytail or fuller lengths. Discover pieces that bring body to the hair you already love, for everyday moments and special occasions.', 'ponytail-editorial', 'Model wearing a sleek, full ponytail', 'More volume'],
  guidance: ['Meet your hair expert', 'You don’t have to<br>know just yet.', 'Tell us about your hair and what you have in mind. We’ll explore coverage, length, texture, and the way you like to wear it, together.', 'tape-editorial', 'Alchemane model demonstrating an individual extension', 'I’d like some guidance'],
};

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
  bindTabs('[data-solution]', tab => {
    const [kicker, title, description, image, alt] = solutions[tab.dataset.solution];
    const panel = document.querySelector('#solution-panel');
    panel.setAttribute('aria-labelledby', tab.id);
    panel.querySelector('.solution-kicker').textContent = kicker;
    panel.querySelector('h3').innerHTML = title;
    panel.querySelector('.solution-description').textContent = description;
    const photo = document.querySelector('#solution-image');
    photo.src = `/assets/${image}.webp`; photo.alt = alt;
    document.querySelector('.image-index').textContent = `THE PERFECT BLEND — ${tab.querySelector('span').textContent}`;
    if (!reduced()) gsap.fromTo([photo, panel], { opacity: .35, y: 8 }, { opacity: 1, y: 0, duration: .4, overwrite: true });
  });
  document.querySelector('.solution-link').addEventListener('click', () => {
    const key = document.querySelector('[data-solution][aria-selected=true]').dataset.solution;
    document.querySelector('[name=interest]').value = solutions[key][5];
  });
  bindTabs('[data-edit]', tab => {
    document.querySelector('#product-edit').setAttribute('aria-labelledby', tab.id);
    document.querySelectorAll('.edit-card').forEach(card => { card.hidden = tab.dataset.edit !== 'all' && card.dataset.group !== tab.dataset.edit; });
    if (!reduced()) gsap.fromTo('.edit-card:not([hidden])', { opacity: .2, y: 12 }, { opacity: 1, y: 0, duration: .4, stagger: .05, overwrite: true });
    ScrollTrigger.refresh();
  });
  const slider = document.querySelector('.compare-range');
  slider.addEventListener('input', () => {
    slider.closest('.compare-frame').style.setProperty('--reveal', `${slider.value}%`);
    slider.setAttribute('aria-valuetext', `${slider.value} percent before, ${100 - slider.value} percent after`);
  });

  const film = document.querySelector('.film-dialog');
  const video = film.querySelector('video');
  document.querySelector('.film-trigger').addEventListener('click', () => { film.showModal(); video.play().catch(() => {}); });
  film.addEventListener('close', () => video.pause());
  film.addEventListener('cancel', () => video.pause());
  const guide = document.querySelector('.guide-dialog');
  document.querySelector('.guide-trigger').addEventListener('click', () => guide.showModal());
  document.querySelector('.guide-consult').addEventListener('click', () => { guide.close(); document.querySelector('#consultation').scrollIntoView({ behavior: reduced() ? 'instant' : 'smooth' }); document.querySelector('[name=name]').focus({ preventScroll: true }); });
  [film, guide].forEach(dialog => {
    dialog.querySelector('.modal-close').addEventListener('click', () => dialog.close());
    dialog.addEventListener('click', event => {
      const rect = dialog.getBoundingClientRect();
      if (event.target === dialog && (event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom)) dialog.close();
    });
  });

  const stories = [
    ["No one could tell it wasn't my real hair. My confidence skyrocketed overnight.", 'Priya S.', 'Seamless Clip-In Extensions'],
    ['Finally found a solution that looks real and feels weightless. Simply amazing!', 'Ananya R.', 'Tape Hair Extensions'],
    ['I can finally style my hair with confidence again. Thank you, Alchemane team!', 'Divya M.', 'Skin Hair Topper 5x6'],
    ["The blend is so natural even my closest friends couldn't tell the difference.", 'Ritika V.', 'Silk Hair Topper 5x3'],
  ];
  let storyIndex = 0;
  document.querySelectorAll('[data-story-direction]').forEach(button => button.addEventListener('click', () => {
    storyIndex = (storyIndex + Number(button.dataset.storyDirection) + stories.length) % stories.length;
    const story = stories[storyIndex];
    ['#story-text', '#story-person', '#story-product'].forEach((selector, i) => { document.querySelector(selector).textContent = story[i]; });
    document.querySelector('#story-current').textContent = String(storyIndex + 1).padStart(2, '0');
    document.querySelector('.story-track i').style.width = `${(storyIndex + 1) * 25}%`;
    if (!reduced()) gsap.fromTo('.story-quote blockquote', { opacity: .25, y: 8 }, { opacity: 1, y: 0, duration: .4, overwrite: true });
  }));
  document.querySelectorAll('[data-consult-type]').forEach(link => link.addEventListener('click', () => {
    document.querySelector(`[name=meeting][value="${link.dataset.consultType === 'studio' ? 'Mumbai studio' : 'Online'}"]`).checked = true;
  }));
  document.querySelectorAll('.home-rest a[href^="#"]').forEach(link => {
    if (['#home', '#collection'].includes(link.hash)) return;
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
      gsap.from(element, { y: 26, opacity: 0, duration: .7, ease: 'power2.out', scrollTrigger: { trigger: element, start: 'top 91%', once: true } });
    });
  });
  motion.add('(min-width: 701px) and (prefers-reduced-motion: no-preference)', () => {
    gsap.fromTo('.editorial-overture > img',
      { yPercent: -3, scale: 1.1 },
      { yPercent: 3, scale: 1.1, ease: 'none', scrollTrigger: { trigger: '.editorial-overture', start: 'top bottom', end: 'bottom top', scrub: true } });
  });
  return () => { motion.revert(); video.pause(); };
}
