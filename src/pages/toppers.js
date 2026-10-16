import './toppers.css';

// Keep the content fully visible for walkthroughs. Only the sticky-header
// anchor offset and the footer year need JavaScript on this basic preview.
const header = document.querySelector('.tp-header');
const offset = () => document.documentElement.style.setProperty('--tp-header-height', `${header.offsetHeight}px`);
const observer = new ResizeObserver(offset);
observer.observe(header); offset();
document.querySelector('[data-year]').textContent = String(new Date().getFullYear());
if (import.meta.hot) import.meta.hot.dispose(() => observer.disconnect());
