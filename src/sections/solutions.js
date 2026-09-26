import './solutions.css';

export function initSolutions() {
  const tabs = [...document.querySelectorAll('#collection [data-solution]')];
  const list = document.querySelector('#collection .solutions-tabs');
  const panel = document.querySelector('#range');
  const abort = new AbortController();
  const options = { signal: abort.signal };
  function select(id, notify = true) {
    const selected = tabs.find(tab => tab.dataset.solution === id);
    tabs.forEach((tab, index) => {
      const active = tab.dataset.solution === id;
      tab.setAttribute('aria-selected', String(active));
      tab.tabIndex = active || (!selected && index === 0) ? 0 : -1;
    });
    panel.setAttribute('aria-labelledby', selected?.id ?? 'range-title');
    if (selected && list.scrollWidth > list.clientWidth) {
      list.scrollTo({ left: selected.offsetLeft - (list.clientWidth - selected.clientWidth) / 2, behavior: 'instant' });
    }
    if (notify) window.dispatchEvent(new CustomEvent('alchemane:solution', { detail: { category: id } }));
  }
  tabs.forEach((tab, i) => {
    tab.addEventListener('click', () => select(tab.dataset.solution), options);
    tab.addEventListener('keydown', event => {
      const index = event.key === 'ArrowRight' ? (i + 1) % tabs.length : event.key === 'ArrowLeft' ? (i - 1 + tabs.length) % tabs.length : event.key === 'Home' ? 0 : event.key === 'End' ? tabs.length - 1 : -1;
      if (index < 0) return;
      event.preventDefault(); select(tabs[index].dataset.solution); tabs[index].focus({ preventScroll: true });
    }, options);
  });
  window.addEventListener('alchemane:category', event => {
    const id = event.detail.category;
    select(id, false);
  }, options);
  return () => abort.abort();
}
