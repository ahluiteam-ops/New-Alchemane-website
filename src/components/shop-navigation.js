import './shop-navigation.css';

const panel = document.querySelector('#shop-navigation');
if (panel) {
  const abort = new AbortController();
  const on = (target, type, listener, options = {}) => target.addEventListener(type, listener, { ...options, signal: abort.signal });
  const header = panel.parentElement;
  const triggers = [...header.querySelectorAll('.shopnav__trigger')];
  const categoryButtons = [...panel.querySelectorAll('[data-shop-category]')];
  const groups = [...panel.querySelectorAll('.shopnav__group')];
  const compact = matchMedia('(max-width: 999px)');
  const back = panel.querySelector('[data-shop-back]');
  const mainToggle = header.querySelector('.menu-toggle, .pe-menu, .pd-menu');
  let opener;
  let category = 'toppers';

  const position = () => {
    const bottom = Math.max(0, header.getBoundingClientRect().bottom);
    panel.style.setProperty('--shopnav-top', `${bottom}px`);
  };
  const select = (id, focus = false) => {
    category = id;
    categoryButtons.forEach(button => button.setAttribute('aria-pressed', String(button.dataset.shopCategory === id)));
    groups.forEach(group => { group.hidden = group.id !== `shop-products-${id}`; });
    panel.classList.add('shopnav--detail');
    panel.scrollTop = 0;
    if (focus && compact.matches) panel.querySelector(`#shop-title-${id}`).focus({ preventScroll: true });
  };
  const close = () => { if (panel.matches(':popover-open')) panel.hidePopover(); };

  on(panel, 'beforetoggle', event => {
    if (event.newState !== 'open') return;
    position();
    if (mainToggle?.getAttribute('aria-expanded') === 'true') mainToggle.click();
    panel.classList.remove('shopnav--detail');
    select(category);
    if (compact.matches) panel.classList.remove('shopnav--detail');
  });
  on(panel, 'toggle', event => {
    const open = event.newState === 'open';
    triggers.forEach(button => button.setAttribute('aria-expanded', String(open)));
    header.classList.toggle('has-shop-open', open);
  });
  triggers.forEach(button => on(button, 'click', () => { opener = button; }));
  on(panel, 'click', event => {
    const button = event.target.closest('[data-shop-category]');
    if (button) select(button.dataset.shopCategory, true);
    if (event.target.closest('a')) close();
  });
  on(back, 'click', () => {
    panel.classList.remove('shopnav--detail');
    panel.scrollTop = 0;
    categoryButtons.find(button => button.dataset.shopCategory === category).focus({ preventScroll: true });
  });
  // Native popovers handle outside taps and Escape. Keep Tab navigation in the
  // normal document flow, dismissing the panel once focus moves beyond it.
  on(document, 'focusin', event => {
    if (!panel.matches(':popover-open') || panel.contains(event.target) || triggers.includes(event.target)) return;
    close();
  });
  on(document, 'keydown', event => {
    if (event.key !== 'Escape' || !panel.matches(':popover-open')) return;
    event.preventDefault();
    close();
    opener?.focus({ preventScroll: true });
  }, { capture: true });
  if (mainToggle) on(mainToggle, 'click', close);
  on(window, 'resize', position);
  on(window, 'scroll', () => {
    if (panel.matches(':popover-open') && header.getBoundingClientRect().top < -1) close();
  }, { passive: true });
  on(compact, 'change', () => { close(); });

  const categoryForPage = { '/toppers.html': 'toppers', '/permanent-extensions.html': 'permanent-extensions', '/extensions.html': 'clip-extensions', '/wigs.html': 'wigs' };
  select(categoryForPage[location.pathname] || category);
  if (compact.matches) panel.classList.remove('shopnav--detail');

  if (import.meta.hot) import.meta.hot.dispose(() => { close(); abort.abort(); });
}
