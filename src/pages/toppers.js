import '../design-tokens.css';
import '../sections/faq-tabs.css';
import '../sections/site-footer.css';
import '../components/check-icon.css';
import '../sections/client-feature.css';
import '../sections/consultation-meet.css';
import '../components/consultation-submit.css';
import './permanent-extensions.css';
import './toppers-design.css';
import './topper-consultation.js';

const abort = new AbortController();
const on = (target, type, handler, options = {}) => target.addEventListener(type, handler, { signal: abort.signal, ...options });
const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)');
document.querySelector('[data-year]').textContent = String(new Date().getFullYear());

// Use the same responsive header as Permanent Extensions.
const header = document.querySelector('.pe-header');
const menu = document.querySelector('.pe-menu');
const setMenu = open => {
  header.classList.toggle('is-open', open);
  menu.setAttribute('aria-expanded', String(open));
  menu.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
};
on(menu, 'click', () => setMenu(menu.getAttribute('aria-expanded') !== 'true'));
on(document.querySelector('.pe-nav'), 'click', () => setMenu(false));
on(document, 'click', event => { if (!header.contains(event.target)) setMenu(false); });
on(document, 'keydown', event => {
  if (event.key === 'Escape' && menu.getAttribute('aria-expanded') === 'true') {
    setMenu(false);
    menu.focus();
  }
});
on(matchMedia('(min-width: 1000px)'), 'change', () => setMenu(false));

// The hero film follows the reference hero loop, with an explicit
// pause control and a still poster for people who prefer reduced motion.
const hero = document.querySelector('.pe-hero__video');
const heroToggle = document.querySelector('.tp-hero-toggle');
let userPaused = reduceMotion.matches;
if (reduceMotion.matches) {
  hero.removeAttribute('autoplay');
  hero.pause();
}
const syncHero = () => {
  heroToggle.textContent = hero.paused ? 'Play video' : 'Pause video';
  heroToggle.setAttribute('aria-label', `${hero.paused ? 'Play' : 'Pause'} hair topper film`);
};
on(hero, 'play', syncHero);
on(hero, 'pause', syncHero);
on(heroToggle, 'click', () => {
  userPaused = !hero.paused;
  if (hero.paused) hero.play().catch(syncHero);
  else hero.pause();
});
const heroVisibility = new IntersectionObserver(entries => {
  const visible = entries[0].isIntersecting;
  if (!visible) hero.pause();
  else if (!userPaused && !reduceMotion.matches && !document.hidden) hero.play().catch(syncHero);
}, { threshold: .1 });
heroVisibility.observe(hero);
on(document, 'visibilitychange', () => {
  if (document.hidden) hero.pause();
});
syncHero();

// Natural-hairline film starts only after a clear user action.
const hairlineVideo = document.querySelector('.tp-hairline__video');
const hairlinePlay = document.querySelector('.tp-hairline__play');
const syncHairlineVideo = () => {
  const isPlaying = !hairlineVideo.paused && !hairlineVideo.ended;
  hairlinePlay.hidden = isPlaying;
  hairlineVideo.controls = isPlaying;
  hairlinePlay.setAttribute('aria-label', hairlineVideo.ended ? 'Replay natural hairline video' : 'Play natural hairline video');
};
on(hairlinePlay, 'click', () => {
  if (hairlineVideo.ended) hairlineVideo.currentTime = 0;
  hairlineVideo.play().catch(syncHairlineVideo);
});
on(hairlineVideo, 'play', syncHairlineVideo);
on(hairlineVideo, 'pause', syncHairlineVideo);
on(hairlineVideo, 'ended', syncHairlineVideo);
syncHairlineVideo();

// Keep one clear play control over the responsive transformation poster.
const transformationVideos = [...document.querySelectorAll('.tp-transform-film video')];
transformationVideos.forEach(video => {
  const playButton = video.nextElementSibling;
  video.controls = false;
  on(playButton, 'click', () => {
    video.play().catch(() => { playButton.hidden = false; });
  });
  on(video, 'play', () => {
    video.controls = true;
    playButton.hidden = true;
  });
  on(video, 'ended', () => {
    video.controls = false;
    playButton.hidden = false;
    playButton.setAttribute('aria-label', 'Replay hair topper transformation video');
  });
});
const transformationWide = matchMedia('(min-width: 700px)');
on(transformationWide, 'change', () => {
  transformationVideos.forEach(video => video.pause());
});
const transformationVisibility = new IntersectionObserver(entries => {
  if (!entries[0].isIntersecting) transformationVideos.forEach(video => video.pause());
}, { threshold: .1 });
transformationVisibility.observe(document.querySelector('.tp-transform-film'));
on(document, 'visibilitychange', () => {
  if (document.hidden) transformationVideos.forEach(video => video.pause());
});

// Consultation, client reels and the topper guide share the same visible play control.
const reelVideos = [...document.querySelectorAll('.tp-client-reel video, .tp-consult-reel video, .pe-guide__video')];
const reelPlayIcon = '<svg viewBox="0 0 32 32" aria-hidden="true"><path d="M7.1244 4 28.1244 16.1244 7.1244 28.2487Z"></path></svg>';
reelVideos.forEach(video => {
  const button = document.createElement('button');
  button.type = 'button';
  button.className = 'pe-vplay';
  button.setAttribute('aria-label', `Play ${video.getAttribute('aria-label')}`);
  button.innerHTML = reelPlayIcon;
  video.after(button);
  video.controls = false;
  on(button, 'click', () => video.play().catch(() => { button.hidden = false; }));
  on(video, 'play', () => {
    video.controls = true;
    button.hidden = true;
  });
  on(video, 'ended', () => {
    video.controls = false;
    button.hidden = false;
    button.setAttribute('aria-label', `Replay ${video.getAttribute('aria-label')}`);
  });
});
const reelObservers = [];
document.querySelectorAll('#client-stories, #how').forEach(section => {
  const track = section.querySelector('.pe-vtrack');
  const videos = [...track.querySelectorAll('video')];
  const cardObserver = new IntersectionObserver(entries => {
    entries.forEach(entry => { if (!entry.isIntersecting) entry.target.querySelector('video').pause(); });
  }, { root: track, threshold: .15 });
  track.querySelectorAll('.pe-vcard').forEach(card => cardObserver.observe(card));
  const sectionObserver = new IntersectionObserver(entries => {
    if (!entries[0].isIntersecting) videos.forEach(video => video.pause());
  }, { threshold: .05 });
  sectionObserver.observe(section);
  reelObservers.push(cardObserver, sectionObserver);
});
const contentVideos = [...document.querySelectorAll('main video:not(.pe-hero__video)')];
on(document, 'play', event => {
  if (contentVideos.includes(event.target)) contentVideos.forEach(video => { if (video !== event.target) video.pause(); });
}, { capture: true });
on(document, 'visibilitychange', () => {
  if (document.hidden) reelVideos.forEach(video => video.pause());
});

// Keep the meeting choice below the videos in sync with the booking form.
const bookingForm = document.querySelector('#topper-consultation-form');
const consultationChoice = document.querySelector('[data-consultation-choice]');
const syncConsultationChoice = () => {
  const mode = bookingForm.elements.meeting.value;
  const studio = mode === 'studio';
  consultationChoice.querySelectorAll('[data-consultation-mode]').forEach(button => button.setAttribute('aria-pressed', String(button.dataset.consultationMode === mode)));
  const note = consultationChoice.querySelector('[data-consultation-choice-note]');
  note.querySelector('strong').textContent = studio ? 'In-person' : 'Online';
  note.querySelector('span').textContent = studio ? 'At our Khar West studio, Mumbai.' : 'Meet from anywhere.';
  document.querySelector('[data-consultation-choice-cta]').textContent = studio ? 'Book an offline consultation' : 'Book an online consultation';
  document.querySelector('#tp-book-meeting-note').textContent = studio ? 'In-person at our Khar West studio, Mumbai.' : 'Meet from anywhere.';
};
consultationChoice.querySelectorAll('[data-consultation-mode]').forEach(button => on(button, 'click', () => {
  bookingForm.elements.meeting.value = button.dataset.consultationMode;
  bookingForm.querySelector('[name="meeting"]:checked').dispatchEvent(new Event('change', { bubbles: true }));
}));
bookingForm.querySelectorAll('[name="meeting"]').forEach(input => on(input, 'change', syncConsultationChoice));
syncConsultationChoice();

// Native swipe, arrow controls and screen-reader status match the reference.
const diffSlides = [...document.querySelectorAll('.pe-diff__slide')];
const diffFrame = document.querySelector('.pe-diff__frame');
const diffStatus = document.querySelector('[data-diff-status]');
const diffControls = document.querySelector('.pe-diff__controls');
const diffWide = matchMedia('(min-width: 700px)');
let diffIndex = 0;
let diffTimer = 0;
const visibleCount = () => diffWide.matches ? 3 : 1;
const lastIndex = () => Math.max(0, diffSlides.length - visibleCount());
const offset = index => diffSlides[index].offsetLeft - diffSlides[0].offsetLeft;
const updateDifference = () => {
  diffIndex = Math.max(0, Math.min(diffIndex, lastIndex()));
  diffSlides.forEach((slide, index) => slide.setAttribute('aria-hidden', String(index < diffIndex || index >= diffIndex + visibleCount())));
  diffControls.hidden = lastIndex() === 0;
  diffStatus.textContent = visibleCount() === 1
    ? `Showing transformation ${diffIndex + 1} of ${diffSlides.length}`
    : `Showing transformations 1 to ${diffSlides.length} of ${diffSlides.length}`;
};
const renderDifference = (behavior = 'auto') => {
  updateDifference();
  diffFrame.scrollTo({ left: offset(diffIndex), behavior });
};
const stepDifference = direction => {
  diffIndex = direction > 0
    ? (diffIndex >= lastIndex() ? 0 : diffIndex + 1)
    : (diffIndex <= 0 ? lastIndex() : diffIndex - 1);
  renderDifference(reduceMotion.matches ? 'auto' : 'smooth');
};
document.querySelectorAll('[data-diff-direction]').forEach(button => on(button, 'click', () => stepDifference(Number(button.dataset.diffDirection))));
on(diffFrame, 'keydown', event => {
  if (!['ArrowLeft', 'ArrowRight'].includes(event.key)) return;
  event.preventDefault();
  stepDifference(event.key === 'ArrowRight' ? 1 : -1);
});
on(diffFrame, 'scroll', () => {
  clearTimeout(diffTimer);
  diffTimer = window.setTimeout(() => {
    diffIndex = diffSlides.reduce((best, slide, index) => Math.abs(offset(index) - diffFrame.scrollLeft) < Math.abs(offset(best) - diffFrame.scrollLeft) ? index : best, 0);
    updateDifference();
  }, 160);
}, { passive: true });
on(window, 'resize', () => renderDifference());
renderDifference();

// Client reels use the same card sizes, arrows and swipe dots.
document.querySelectorAll('[data-vrail]').forEach(section => {
  const track = section.querySelector('.pe-vtrack');
  const cards = [...track.children];
  const controls = section.querySelector('.pe-rail-controls');
  const [prev, next] = controls.querySelectorAll('button');
  const dotRow = section.querySelector('.pe-dots');
  dotRow.replaceChildren(...cards.map(() => document.createElement('span')));
  const dots = [...dotRow.children];
  const step = () => cards[1] ? cards[1].offsetLeft - cards[0].offsetLeft : track.clientWidth;
  const syncRail = () => {
    const max = track.scrollWidth - track.clientWidth;
    controls.style.visibility = max > 4 ? '' : 'hidden';
    prev.disabled = track.scrollLeft <= 4;
    next.disabled = track.scrollLeft >= max - 4;
    const index = track.scrollLeft >= max - 4 ? cards.length - 1 : Math.round(track.scrollLeft / step());
    dots.forEach((dot, dotIndex) => dot.classList.toggle('is-active', dotIndex === index));
  };
  const scrollRail = direction => track.scrollBy({ left: step() * direction, behavior: reduceMotion.matches ? 'auto' : 'smooth' });
  controls.querySelectorAll('button').forEach(button => on(button, 'click', () => scrollRail(Number(button.dataset.railDir))));
  on(track, 'keydown', event => {
    if (!['ArrowLeft', 'ArrowRight'].includes(event.key)) return;
    event.preventDefault();
    scrollRail(event.key === 'ArrowRight' ? 1 : -1);
  });
  on(track, 'scroll', syncRail, { passive: true });
  on(window, 'resize', syncRail);
  syncRail();
});

// Match the consultation/product FAQ tabs used on the other product pages.
const faqTabs = [...document.querySelectorAll('#faq [data-faq-tab]')];
const selectFaqTab = selectedTab => faqTabs.forEach(tab => {
  const selected = tab === selectedTab;
  tab.setAttribute('aria-selected', String(selected));
  tab.tabIndex = selected ? 0 : -1;
  document.getElementById(tab.getAttribute('aria-controls')).hidden = !selected;
});
faqTabs.forEach((tab, index) => {
  on(tab, 'click', () => selectFaqTab(tab));
  on(tab, 'keydown', event => {
    const step = event.key === 'ArrowRight' ? 1 : event.key === 'ArrowLeft' ? -1 : 0;
    if (!step) return;
    event.preventDefault();
    const next = faqTabs[(index + step + faqTabs.length) % faqTabs.length];
    selectFaqTab(next);
    next.focus();
  });
});

if (import.meta.hot) import.meta.hot.dispose(() => {
  abort.abort();
  heroVisibility.disconnect();
  transformationVisibility.disconnect();
  reelObservers.forEach(observer => observer.disconnect());
  clearTimeout(diffTimer);
});
