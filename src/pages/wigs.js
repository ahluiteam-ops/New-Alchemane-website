import '../design-tokens.css';
import '../sections/faq-tabs.css';
import '../sections/site-footer.css';
import '../sections/floating-contact.css';
import '../components/check-icon.css';
import '../sections/client-feature.css';
import { createStoryVideoViewer } from '../sections/story-video-viewer.js';
import { initConsultationMeet } from '../sections/consultation-meet.js';
// The Wigs page shares the Permanent Extensions page's layout pieces (header,
// buttons, rails, carousel, FAQ, booking form), so it builds on that stylesheet.
import './permanent-extensions.css';
import './wigs.css';
import { initFloatingContact } from '../sections/floating-contact';

const WHATSAPP = '919967123333';
const abort = new AbortController();
const on = (target, type, handler, options = {}) => target.addEventListener(type, handler, { signal: abort.signal, ...options });
const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)');

// ---- Menu (phones) ----
const header = document.querySelector('.pe-header');
const menu = header.querySelector('.pe-menu');
const setMenu = open => {
  header.classList.toggle('is-open', open);
  menu.setAttribute('aria-expanded', String(open));
  menu.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
};
on(menu, 'click', () => setMenu(menu.getAttribute('aria-expanded') !== 'true'));
on(document, 'keydown', event => { if (event.key === 'Escape') setMenu(false); });
on(document, 'click', event => { if (!header.contains(event.target)) setMenu(false); });

// ---- Floating contact button: appears once the hero's Book button has scrolled away ----
const contactCleanup = initFloatingContact();
const contact = document.querySelector('.floating-contact');
const heroCta = document.querySelector('[data-hero-cta]');
let frame = 0;
function sync() {
  frame = 0;
  contact?.classList.toggle('is-visible', heroCta.getBoundingClientRect().bottom < 0);
}
const requestSync = () => { if (!frame) frame = requestAnimationFrame(sync); };
on(window, 'scroll', requestSync, { passive: true });
on(window, 'resize', requestSync);
sync();

// ---- Hero loop: plays muted, except for reduced motion ----
const heroVideo = document.querySelector('.pe-hero__video');
if (reduceMotion.matches) { heroVideo.removeAttribute('autoplay'); heroVideo.pause(); }
// The opening seconds of the film are mostly white. Keep its poster visible
// until the first client footage appears on wide screens.
on(heroVideo, 'timeupdate', () => {
  heroVideo.parentElement.classList.toggle('is-playing', heroVideo.currentTime >= 2.5);
});

// ---- YouTube embeds for the wig-types and head-measurement films ----
// Click-to-load: nothing is fetched from YouTube until the visitor taps play,
// so the poster image is the only cost on page load.
document.querySelectorAll('[data-youtube]').forEach(figure => {
  const button = figure.querySelector('.wg-play');
  const loadVideo = () => {
    const iframe = document.createElement('iframe');
    iframe.src = `https://www.youtube-nocookie.com/embed/${figure.dataset.youtube}?autoplay=1&rel=0&modestbranding=1&playsinline=1`;
    iframe.title = button.getAttribute('aria-label') || 'YouTube video';
    iframe.allow = 'autoplay; encrypted-media; picture-in-picture; web-share';
    iframe.allowFullscreen = true;
    figure.replaceChildren(iframe);
  };
  on(button, 'click', loadVideo);
});

// ---- Swipe rows (client stories and consultation) ----
// Arrows (tablet and desktop) scroll one card and grey out at either end; dots
// (phones) follow the swipe. Controls hide when every card already fits.
document.querySelectorAll('[data-vrail]').forEach(section => {
  const track = section.querySelector('.pe-vtrack');
  const cards = [...track.children];
  const controls = section.querySelector('[data-rail-controls]');
  const [prev, next] = controls.querySelectorAll('button');
  const dots = [...section.querySelectorAll('.pe-dots span')];
  const dotsBox = section.querySelector('.pe-dots');
  const step = () => (cards[1] ? cards[1].offsetLeft - cards[0].offsetLeft : track.clientWidth);
  const syncRail = () => {
    const max = track.scrollWidth - track.clientWidth;
    const scrolls = max > 4;
    controls.style.visibility = scrolls ? '' : 'hidden';
    if (dotsBox) dotsBox.style.visibility = scrolls ? '' : 'hidden';
    prev.disabled = track.scrollLeft <= 4;
    next.disabled = track.scrollLeft >= max - 4;
    const index = track.scrollLeft >= max - 4 ? cards.length - 1 : Math.round(track.scrollLeft / step());
    dots.forEach((dot, i) => dot.classList.toggle('is-active', i === index));
  };
  controls.querySelectorAll('[data-rail-dir]').forEach(button => on(button, 'click', () => {
    track.scrollBy({ left: step() * Number(button.dataset.railDir), behavior: reduceMotion.matches ? 'auto' : 'smooth' });
  }));
  on(track, 'scroll', syncRail, { passive: true });
  on(window, 'resize', syncRail);
  syncRail();
});

// ---- Client videos, including the responsive transformation film ----
// Each clip shows its clean poster and one play button; the browser's native
// controls only appear once it plays. One clip plays at a time, and a clip
// pauses when scrolled out of view.
const PLAY_ICON = '<svg viewBox="0 0 32 32" aria-hidden="true"><path d="M7.1244 4 28.1244 16.1244 7.1244 28.2487Z"/></svg>';
const storyMobile = matchMedia('(max-width: 699px)');
let activateStoryCard = () => {};
let stopStoryPreview = () => {};
const storyViewer = createStoryVideoViewer(card => activateStoryCard(card), {
  collection: '#stories',
  card: '.pe-vcard',
  opener: '.pe-vplay',
});
const clips = [...document.querySelectorAll('.pe-vcard video, #transformations video')];
const offscreen = new IntersectionObserver(entries => entries.forEach(entry => {
  if (!entry.isIntersecting) entry.target.pause();
}), { threshold: 0.15 });
clips.forEach(video => {
  const storyCard = video.closest('#stories .pe-vcard');
  video.controls = false;
  video.removeAttribute('controls');
  const button = document.createElement('button');
  button.type = 'button';
  button.className = 'pe-vplay';
  button.setAttribute('aria-label', storyCard
    ? `Open ${video.getAttribute('aria-label')} with sound`
    : `Play video: ${video.getAttribute('aria-label')}`);
  button.innerHTML = PLAY_ICON;
  video.after(button);
  on(button, 'click', () => {
    if (storyCard && storyMobile.matches) {
      stopStoryPreview();
      storyViewer.open(storyCard, button);
    } else video.play().catch(() => {});
  });
  on(video, 'play', () => {
    if (storyCard && storyMobile.matches) {
      video.controls = false;
      button.hidden = false;
      storyCard.classList.add('is-previewing');
      return;
    }
    video.controls = true;
    button.hidden = true;
    clips.forEach(other => { if (other !== video) other.pause(); });
  });
  on(video, 'pause', () => storyCard?.classList.remove('is-previewing'));
  offscreen.observe(video);
});
on(document, 'visibilitychange', () => { if (document.hidden) clips.forEach(video => video.pause()); });

// Match the homepage client-story behaviour on phones: the centred story is
// prominent, previews silently while visible, and opens with sound on tap.
const storySection = document.querySelector('#stories');
const storyTrack = storySection.querySelector('.pe-vtrack');
const storyCards = [...storyTrack.querySelectorAll('.pe-vcard')];
let storyIndex = 0;
let storyPreview = null;
let storyPreviewFrame = 0;
let storySettleTimer = 0;
const storyVisible = video => {
  const rect = video.getBoundingClientRect();
  const sectionRect = storySection.getBoundingClientRect();
  const width = Math.max(0, Math.min(rect.right, innerWidth) - Math.max(rect.left, 0));
  const height = Math.max(0, Math.min(rect.bottom, sectionRect.bottom, innerHeight) - Math.max(rect.top, sectionRect.top, 0));
  return rect.width > 0 && rect.height > 0 && width * height / (rect.width * rect.height) >= .55;
};
stopStoryPreview = () => {
  if (!storyPreview) return;
  storyPreview.pause();
  storyPreview.closest('.pe-vcard').classList.remove('is-previewing');
  storyPreview = null;
};
const syncStoryPreview = () => {
  storyPreviewFrame = 0;
  const video = storyCards[storyIndex]?.querySelector('video');
  if (!storyMobile.matches || reduceMotion.matches || document.hidden || document.querySelector('dialog[open]') || !video || !storyVisible(video)) {
    stopStoryPreview();
    return;
  }
  if (video === storyPreview) return;
  stopStoryPreview();
  storyPreview = video;
  video.defaultMuted = true;
  video.muted = true;
  video.loop = true;
  video.controls = false;
  video.play().catch(() => { if (storyPreview === video) stopStoryPreview(); });
};
const requestStoryPreview = () => {
  if (!storyPreviewFrame) storyPreviewFrame = requestAnimationFrame(syncStoryPreview);
};
const nearestStory = () => {
  const trackBox = storyTrack.getBoundingClientRect();
  const center = trackBox.left + trackBox.width / 2;
  return storyCards.reduce((best, card, index) => {
    const box = card.getBoundingClientRect();
    const bestBox = storyCards[best].getBoundingClientRect();
    return Math.abs(box.left + box.width / 2 - center) < Math.abs(bestBox.left + bestBox.width / 2 - center) ? index : best;
  }, 0);
};
const alignStory = (index, behavior = 'auto') => {
  const cardBox = storyCards[index].getBoundingClientRect();
  const trackBox = storyTrack.getBoundingClientRect();
  storyTrack.scrollTo({ left: storyTrack.scrollLeft + cardBox.left + cardBox.width / 2 - trackBox.left - trackBox.width / 2, behavior });
};
const selectStory = (index, align = false) => {
  storyIndex = Math.max(0, Math.min(index, storyCards.length - 1));
  storyCards.forEach((card, cardIndex) => card.classList.toggle('is-active', cardIndex === storyIndex));
  if (align && storyMobile.matches) alignStory(storyIndex, reduceMotion.matches ? 'auto' : 'smooth');
  requestStoryPreview();
};
activateStoryCard = card => selectStory(storyCards.indexOf(card), true);
const settleStory = () => {
  if (!storyMobile.matches) return;
  selectStory(nearestStory());
  alignStory(storyIndex);
};
on(storyTrack, 'scroll', () => {
  if (!storyMobile.matches) return;
  const nearest = nearestStory();
  if (nearest !== storyIndex) selectStory(nearest);
  clearTimeout(storySettleTimer);
  storySettleTimer = window.setTimeout(settleStory, 140);
}, { passive: true });
on(storyTrack, 'scrollend', settleStory);
on(window, 'scroll', requestStoryPreview, { passive: true });
on(storyMobile, 'change', () => {
  stopStoryPreview();
  storyCards.forEach(card => {
    const video = card.querySelector('video');
    video.pause();
    video.controls = false;
    card.querySelector('.pe-vplay').hidden = false;
  });
  if (storyMobile.matches) selectStory(nearestStory(), true);
  else storyCards.forEach(card => card.classList.remove('is-active', 'is-previewing'));
});
const storyExposure = new IntersectionObserver(requestStoryPreview, { threshold: [0, .25, .55, .8, 1] });
storyExposure.observe(storySection);
const storyDialogs = new MutationObserver(requestStoryPreview);
storyDialogs.observe(document.body, { subtree: true, attributes: true, attributeFilter: ['open'] });
selectStory(0);

// ---- See the difference carousel ----
// Native scroll-snap; arrows step one photo and wrap. Three photos show from
// 701px up, one on phones, so the arrows hide when every photo already fits.
const diffSlides = [...document.querySelectorAll('.pe-diff__slide')];
const diffFrame = document.querySelector('.pe-diff__frame');
const diffStatus = document.querySelector('[data-diff-status]');
const diffFooter = document.querySelector('.pe-diff__footer');
const diffWide = matchMedia('(min-width: 701px)');
let diffIndex = 0;
let diffTimer = 0;
const diffVisible = () => (diffWide.matches ? 3 : 1);
const diffLast = () => Math.max(0, diffSlides.length - diffVisible());
const diffOffset = index => diffSlides[index].offsetLeft - diffSlides[0].offsetLeft;
const diffUpdate = () => {
  const visible = diffVisible();
  diffIndex = Math.max(0, Math.min(diffIndex, diffLast()));
  diffSlides.forEach((slide, i) => slide.setAttribute('aria-hidden', String(i < diffIndex || i >= diffIndex + visible)));
  const first = diffIndex + 1;
  const last = Math.min(diffSlides.length, diffIndex + visible);
  diffStatus.textContent = visible === 1
    ? `Showing transformation ${first} of ${diffSlides.length}`
    : `Showing transformations ${first} to ${last} of ${diffSlides.length}`;
  diffFooter.hidden = diffLast() === 0;
};
const diffRender = (behavior = 'auto') => {
  diffIndex = Math.max(0, Math.min(diffIndex, diffLast()));
  diffUpdate();
  diffFrame.scrollTo({ left: diffOffset(diffIndex), behavior });
};
const diffClosest = () => diffSlides.reduce((best, slide, i) => (
  Math.abs(diffOffset(i) - diffFrame.scrollLeft) < Math.abs(diffOffset(best) - diffFrame.scrollLeft) ? i : best
), 0);
document.querySelectorAll('[data-diff-direction]').forEach(button => on(button, 'click', () => {
  const direction = Number(button.dataset.diffDirection);
  if (direction > 0) diffIndex = diffIndex >= diffLast() ? 0 : diffIndex + 1;
  else diffIndex = diffIndex <= 0 ? diffLast() : diffIndex - 1;
  diffRender(reduceMotion.matches ? 'auto' : 'smooth');
}));
on(diffFrame, 'scroll', () => {
  clearTimeout(diffTimer);
  diffTimer = window.setTimeout(() => { diffIndex = Math.min(diffClosest(), diffLast()); diffUpdate(); }, 160);
}, { passive: true });
on(diffWide, 'change', () => diffRender('auto'));
on(window, 'resize', () => diffRender('auto'));
diffRender('auto');

// ---- FAQ tabs ----
const tabs = [...document.querySelectorAll('[data-faq-tab]')];
const selectTab = tab => tabs.forEach(item => {
  const selected = item === tab;
  item.setAttribute('aria-selected', String(selected));
  item.tabIndex = selected ? 0 : -1;
  document.getElementById(item.getAttribute('aria-controls')).hidden = !selected;
});
tabs.forEach((tab, index) => {
  on(tab, 'click', () => selectTab(tab));
  on(tab, 'keydown', event => {
    const step = event.key === 'ArrowRight' ? 1 : event.key === 'ArrowLeft' ? -1 : 0;
    if (!step) return;
    event.preventDefault();
    const next = tabs[(index + step + tabs.length) % tabs.length];
    selectTab(next); next.focus();
  });
});

// ---- Consultation form → WhatsApp ----
const form = document.querySelector('#pe-form');
const selectMeeting = initConsultationMeet(form);
const error = form.querySelector('.pe-error');
const status = form.querySelector('.pe-status');
const productSelection = form.querySelector('.pe-product-selection');
let productInterest = '';

// A card says where the consultation should begin; wigs are never bought online.
document.querySelectorAll('[data-product-interest]').forEach(card => on(card, 'click', () => {
  productInterest = card.dataset.productInterest;
  productSelection.textContent = `Interested in ${productInterest}. We’ll talk about it during your consultation.`;
  productSelection.hidden = false;
}));

// "Meet online instead" preselects how to meet.
document.querySelectorAll('[data-meet]').forEach(link => on(link, 'click', () => {
  selectMeeting(link.dataset.meet);
}));
on(form, 'input', event => {
  event.target.removeAttribute('aria-invalid');
  error.hidden = true;
  status.hidden = true;
});
on(form, 'submit', event => {
  event.preventDefault();
  const name = form.elements.name.value.trim();
  const phone = form.elements.phone.value.trim();
  const digits = phone.replace(/\D/g, '');
  const problems = [];
  if (!name) { problems.push('your name'); form.elements.name.setAttribute('aria-invalid', 'true'); }
  if (digits.length < 7 || digits.length > 15) { problems.push('a valid phone number'); form.elements.phone.setAttribute('aria-invalid', 'true'); }
  if (problems.length) {
    error.textContent = `Please add ${problems.join(' and ')}.`;
    error.hidden = false;
    form.querySelector('[aria-invalid="true"]').focus();
    return;
  }
  const city = form.elements.city.value.trim();
  const message = `Hello Alchemane, I'd like to book a wig consultation.\n\nName: ${name}\nPhone: ${phone}${city ? `\nCity: ${city}` : ''}${productInterest ? `\nInterested in: ${productInterest}` : ''}\nMeet: ${form.elements.meet.value}`;
  const link = `https://wa.me/${WHATSAPP}?text=${encodeURIComponent(message)}`;
  form.querySelector('#pe-send').href = link;
  status.hidden = false;
  window.open(link, '_blank', 'noopener');
});

if (import.meta.hot) import.meta.hot.dispose(() => {
  abort.abort();
  offscreen.disconnect();
  storyExposure.disconnect();
  storyDialogs.disconnect();
  storyViewer.destroy();
  contactCleanup?.();
});
