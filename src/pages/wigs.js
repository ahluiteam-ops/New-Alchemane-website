import '../styles.css';
import '../homepage.css';
import '../sections/discovery.css';
import '../premium.css';
import '../design-tokens.css';
import '../palette.css';
import './wigs.css';
import { initFilms } from '../sections/films.js';

const cleanup = initFilms();
const header = document.querySelector('.shop-header');
const offset = () => document.documentElement.style.setProperty('--shop-header-height', `${header.offsetHeight}px`);
const observer = new ResizeObserver(offset);
observer.observe(header); offset();
if (import.meta.hot) import.meta.hot.dispose(() => { cleanup(); observer.disconnect(); });
