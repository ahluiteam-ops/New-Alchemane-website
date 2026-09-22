import './showcase.css';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { ScrollToPlugin } from 'gsap/ScrollToPlugin';

gsap.registerPlugin(ScrollTrigger, ScrollToPlugin);

// "The full range": category tabs, method filters, hover photography and
// deep links. Other parts of the page open it with
//   <a href="#range" data-range-open="extensions" data-range-filter="salon">
// or window.dispatchEvent(new CustomEvent('alchemane:range', { detail: { tab, filter, handle } })).
export function initRange() {
  const section = document.querySelector('#range');
  if (!section) return () => {};
  const reduced = () => matchMedia('(prefers-reduced-motion: reduce)').matches;
  const tabs = [...section.querySelectorAll('[data-range-tab]')];
  const chips = [...section.querySelectorAll('[data-range-filter]')];
  const indicator = section.querySelector('.range-indicator');
  const note = section.querySelector('[data-range-note]');
  const status = section.querySelector('[data-range-status]');
  const panelOf = name => section.querySelector(`#range-panel-${name}`);
  const current = () => tabs.find(tab => tab.getAttribute('aria-selected') === 'true') ?? tabs[0];
  const shown = name => [...panelOf(name).querySelectorAll('.range-card:not([hidden])')];
  let navigation;
  let spotlightTimer;

  function settle(tab = current()) {
    indicator.style.width = `${tab.offsetWidth}px`;
    indicator.style.transform = `translateX(${tab.offsetLeft}px)`;
  }

  function enter(cards) {
    if (reduced() || !cards.length) return;
    gsap.fromTo(cards, { opacity: 0, y: 16 }, { opacity: 1, y: 0, duration: 0.45, stagger: 0.035, ease: 'power2.out', overwrite: true, clearProps: 'opacity,transform' });
  }

  function announce() {
    if (current().dataset.rangeTab === 'toppers') {
      status.textContent = `Showing all ${shown('toppers').length} hair toppers`;
      return;
    }
    const chip = chips.find(item => item.getAttribute('aria-pressed') === 'true') ?? chips[0];
    const count = shown('extensions').length;
    status.textContent = chip.dataset.rangeFilter === 'all' ? `Showing all ${count} hair extensions` : `Showing ${count} ${chip.dataset.noun}`;
  }

  function selectTab(name, { focus = false, animate = true } = {}) {
    const tab = tabs.find(item => item.dataset.rangeTab === name) ?? tabs[0];
    tabs.forEach(item => {
      const selected = item === tab;
      item.setAttribute('aria-selected', String(selected));
      item.tabIndex = selected ? 0 : -1;
      panelOf(item.dataset.rangeTab).hidden = !selected;
    });
    settle(tab);
    if (focus) tab.focus({ preventScroll: true });
    announce();
    if (animate) enter(shown(tab.dataset.rangeTab));
    ScrollTrigger.refresh();
  }

  function applyFilter(id = 'all', { animate = true } = {}) {
    const chip = chips.find(item => item.dataset.rangeFilter === id) ?? chips[0];
    const filter = chip.dataset.rangeFilter;
    chips.forEach(item => item.setAttribute('aria-pressed', String(item === chip)));
    panelOf('extensions').querySelectorAll('.range-card').forEach(card => {
      card.hidden = filter !== 'all' && card.dataset.group !== filter;
    });
    if (note) note.textContent = chip.dataset.note;
    announce();
    if (animate) enter(shown('extensions'));
    ScrollTrigger.refresh();
  }

  function spotlight(handle) {
    const card = section.querySelector(`.range-card[data-handle="${CSS.escape(handle)}"]`);
    if (!card) return;
    clearTimeout(spotlightTimer);
    section.querySelectorAll('.is-spotlit').forEach(item => item.classList.remove('is-spotlit'));
    void card.offsetWidth;
    card.classList.add('is-spotlit');
    spotlightTimer = setTimeout(() => card.classList.remove('is-spotlit'), 2800);
  }

  function open({ tab = 'toppers', filter, handle } = {}) {
    selectTab(tab, { animate: false });
    if (tab === 'extensions') applyFilter(filter ?? 'all', { animate: false });
    history.replaceState(null, '', '#range');
    navigation?.kill();
    const y = Math.max(0, section.getBoundingClientRect().top + scrollY - 12);
    const distance = Math.abs(y - scrollY);
    navigation = gsap.to(window, {
      scrollTo: { y, autoKill: true },
      duration: reduced() ? 0 : Math.min(2.4, 0.7 + distance / 5000),
      ease: 'power2.inOut',
      onComplete() {
        current().focus({ preventScroll: true });
        enter(shown(tab));
        if (handle) spotlight(handle);
      },
    });
  }

  // Load the second photograph only when someone shows interest in a card.
  function prime(card) {
    if (!card?.dataset.alt || card.classList.contains('has-alt')) return;
    const img = new Image();
    img.className = 'range-photo range-photo-alt';
    img.alt = '';
    img.setAttribute('aria-hidden', 'true');
    img.decoding = 'async';
    img.width = 600;
    img.height = 800;
    img.src = card.dataset.alt;
    card.querySelector('.range-media').insertBefore(img, card.querySelector('.range-flag'));
    card.classList.add('has-alt');
  }

  const onTabKey = event => {
    const i = tabs.indexOf(event.currentTarget);
    const next = { ArrowRight: i + 1, ArrowDown: i + 1, ArrowLeft: i - 1, ArrowUp: i - 1, Home: 0, End: tabs.length - 1 }[event.key];
    if (next === undefined) return;
    event.preventDefault();
    selectTab(tabs[(next + tabs.length) % tabs.length].dataset.rangeTab, { focus: true });
  };
  const onTabClick = event => selectTab(event.currentTarget.dataset.rangeTab);
  const onChip = event => applyFilter(event.currentTarget.dataset.rangeFilter);
  const onPointer = event => { if (event.pointerType !== 'touch') prime(event.target.closest?.('.range-card')); };
  const onFocus = event => prime(event.target.closest?.('.range-card'));
  const onLink = event => {
    const link = event.target.closest?.('a[data-range-open]');
    if (!link) return;
    event.preventDefault();
    event.stopPropagation();
    open({ tab: link.dataset.rangeOpen, filter: link.dataset.rangeFilter, handle: link.dataset.rangeHandle });
  };
  const onOpen = event => open(event.detail);
  const onResize = () => settle();

  tabs.forEach(tab => { tab.addEventListener('click', onTabClick); tab.addEventListener('keydown', onTabKey); });
  chips.forEach(chip => chip.addEventListener('click', onChip));
  section.addEventListener('pointerover', onPointer);
  section.addEventListener('focusin', onFocus);
  document.addEventListener('click', onLink, true);
  window.addEventListener('alchemane:range', onOpen);
  window.addEventListener('resize', onResize);
  settle();
  document.fonts?.ready.then(() => settle());
  announce();

  const motion = gsap.matchMedia();
  motion.add('(prefers-reduced-motion: no-preference)', () => {
    gsap.from(shown('toppers'), { opacity: 0, y: 22, duration: 0.6, stagger: 0.06, ease: 'power2.out', scrollTrigger: { trigger: panelOf('toppers'), start: 'top 85%', once: true } });
  });

  return () => {
    navigation?.kill();
    clearTimeout(spotlightTimer);
    motion.revert();
    tabs.forEach(tab => { tab.removeEventListener('click', onTabClick); tab.removeEventListener('keydown', onTabKey); });
    chips.forEach(chip => chip.removeEventListener('click', onChip));
    section.removeEventListener('pointerover', onPointer);
    section.removeEventListener('focusin', onFocus);
    document.removeEventListener('click', onLink, true);
    window.removeEventListener('alchemane:range', onOpen);
    window.removeEventListener('resize', onResize);
  };
}
