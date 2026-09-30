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
  const faqTabs = [...document.querySelectorAll('[data-faq-tab]')];
  if (faqTabs.length) {
    bindTabs('[data-faq-tab]', tab => {
      document.querySelectorAll('[data-faq-panel]').forEach(panel => {
        panel.hidden = panel.id !== tab.getAttribute('aria-controls');
      });
      tab.scrollIntoView({ block: 'nearest', inline: 'center', behavior: reduced() ? 'instant' : 'smooth' });
      ScrollTrigger.refresh();
    });
    document.querySelectorAll('[data-faq-panel] details').forEach(detail => detail.addEventListener('toggle', () => {
      if (!detail.open) return;
      detail.closest('[data-faq-panel]').querySelectorAll('details[open]').forEach(item => {
        if (item !== detail) item.open = false;
      });
    }));
  }
  const storySlides = [...document.querySelectorAll('.story-slide')];
  const storyTrack = document.querySelector('#story-slides');
  const storyViewport = document.querySelector('.story-photo-frame');
  const storyStatus = document.querySelector('[data-story-status]');
  const storyDesktop = matchMedia('(min-width: 701px)');
  let storyIndex = 0;
  let storyScrollTimeout = 0;
  const visibleStories = () => storyDesktop.matches ? 3 : 1;
  const lastStoryIndex = () => Math.max(0, storySlides.length - visibleStories());
  const updateStoryState = () => {
    const visibleCount = visibleStories();
    storyIndex = Math.max(0, Math.min(storyIndex, lastStoryIndex()));
    storySlides.forEach((slide, index) => {
      slide.setAttribute('aria-hidden', String(index < storyIndex || index >= storyIndex + visibleCount));
    });
    const first = storyIndex + 1;
    const last = Math.min(storySlides.length, storyIndex + visibleCount);
    storyStatus.textContent = visibleCount === 1
      ? `Showing transformation ${first} of ${storySlides.length}`
      : `Showing transformations ${first} to ${last} of ${storySlides.length}`;
  };
  const storyOffset = index => storySlides[index].offsetLeft - storySlides[0].offsetLeft;
  const closestStoryIndex = () => {
    const currentOffset = storyViewport.scrollLeft;
    return storySlides.reduce((closestIndex, slide, index) => (
      Math.abs(storyOffset(index) - currentOffset) < Math.abs(storyOffset(closestIndex) - currentOffset)
        ? index
        : closestIndex
    ), 0);
  };
  const renderStory = (behavior = 'auto') => {
    const visibleCount = storyDesktop.matches ? 3 : 1;
    const lastIndex = Math.max(0, storySlides.length - visibleCount);
    storyIndex = Math.max(0, Math.min(storyIndex, lastIndex));
    storyTrack.style.transform = '';
    updateStoryState();
    storyViewport.scrollTo({ left: storyOffset(storyIndex), behavior });
  };
  const changeStory = direction => {
    const lastIndex = lastStoryIndex();
    if (direction > 0) storyIndex = storyIndex >= lastIndex ? 0 : storyIndex + 1;
    else storyIndex = storyIndex <= 0 ? lastIndex : storyIndex - 1;
    renderStory(reduced() ? 'auto' : 'smooth');
  };
  const syncStoryFromScroll = () => {
    clearTimeout(storyScrollTimeout);
    storyScrollTimeout = window.setTimeout(() => {
      storyIndex = Math.min(closestStoryIndex(), lastStoryIndex());
      updateStoryState();
    }, 160);
  };
  renderStory('auto');
  document.querySelectorAll('[data-story-direction]').forEach(button => {
    button.addEventListener('click', event => {
      event.preventDefault();
      changeStory(Number(button.dataset.storyDirection));
    });
  });
  storyViewport.addEventListener('scroll', syncStoryFromScroll, { passive: true });
  const resizeStoryViewport = () => renderStory('auto');
  storyDesktop.addEventListener('change', resizeStoryViewport);
  let storyResizeFrame = 0;
  const resizeStories = () => {
    cancelAnimationFrame(storyResizeFrame);
    storyResizeFrame = requestAnimationFrame(resizeStoryViewport);
  };
  window.addEventListener('resize', resizeStories);
  document.querySelectorAll('[data-consult-type]').forEach(link => link.addEventListener('click', () => {
    document.querySelector(`[name=meeting][value="${link.dataset.consultType === 'studio' ? 'Khar West studio' : 'Online'}"]`).checked = true;
  }));
  document.querySelectorAll('.home-rest a[href^="#"]').forEach(link => {
    if (document.body.classList.contains('simple-home') || ['#home', '#collection'].includes(link.hash) || link.hasAttribute('data-range-open') || link.hasAttribute('data-catalogue-category')) return;
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
  form.elements.phone.addEventListener('input', event => {
    const digits = event.target.value.replace(/\D/g, '');
    event.target.setCustomValidity(digits.length >= 7 && digits.length <= 15 ? '' : 'Enter a valid phone number with 7–15 digits.');
  });
  ['name'].forEach(name => form.elements[name].addEventListener('input', event => {
    event.target.setCustomValidity(event.target.value.trim() ? '' : 'Please enter a value.');
  }));
  form.addEventListener('submit', event => {
    event.preventDefault();
    const data = new FormData(form);
    const message = `Hello Alchemane, I’d like to arrange a consultation.\n\nName: ${data.get('name').trim()}\nPhone: ${data.get('phone').trim()}\nCity: ${data.get('city').trim()}\nMeeting: ${data.get('meeting')}${data.get('email') ? `\nEmail: ${data.get('email').trim()}` : ''}`;
    document.querySelector('#send-consultation').href = `https://wa.me/919967123333?text=${encodeURIComponent(message)}`;
    form.querySelector('.consultation-status').hidden = false;
    document.querySelector('#send-consultation').focus();
  });
  form.addEventListener('input', () => { form.querySelector('.consultation-status').hidden = true; document.querySelector('#send-consultation').removeAttribute('href'); });

  const discountForm = document.querySelector('#checkout-discount-form');
  if (discountForm) {
    const discountPhone = discountForm.elements.phone;
    discountPhone.addEventListener('input', () => {
      discountPhone.value = discountPhone.value.replace(/[^+0-9 ()-]/g, '').slice(0, 20);
      const digits = discountPhone.value.replace(/\D/g, '');
      discountPhone.setCustomValidity(digits.length >= 7 && digits.length <= 15 ? '' : 'Enter a valid phone number.');
    });
    discountForm.addEventListener('submit', event => {
      event.preventDefault();
      if (!discountForm.reportValidity()) return;
      const phone = discountPhone.value.trim();
      const updates = discountForm.elements.updates.checked;
      const message = `Hello Alchemane, I would like to unlock special discounts on checkout.\nPhone: ${phone}${updates ? '\nGet updates on WhatsApp: Yes' : ''}`;
      window.open(`https://wa.me/919967123333?text=${encodeURIComponent(message)}`, '_blank', 'noopener');
    });
  }
  document.querySelectorAll('.ruled-accordions details').forEach(detail => detail.addEventListener('toggle', () => ScrollTrigger.refresh()));

  const motion = gsap.matchMedia();
  motion.add('(prefers-reduced-motion: no-preference) and (min-width: 1001px)', () => {
    gsap.utils.toArray('.reveal-on-scroll').forEach(element => {
      gsap.from(element, { y: 16, opacity: 0, duration: .55, ease: 'power2.out', scrollTrigger: { trigger: element, start: 'top 91%', once: true } });
    });
  });
  // The overture's own scroll behaviour lives in src/sections/overture.js — the
  // portrait is held still there, so no parallax drift on it here.
  return () => {
    motion.revert();
    storyViewport.removeEventListener('scroll', syncStoryFromScroll);
    storyDesktop.removeEventListener('change', resizeStoryViewport);
    window.removeEventListener('resize', resizeStories);
    cancelAnimationFrame(storyResizeFrame);
    clearTimeout(storyScrollTimeout);
  };
}
