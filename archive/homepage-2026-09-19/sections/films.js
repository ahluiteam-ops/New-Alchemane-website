import './showcase.css';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

// Chaptered film sections. Nothing loads from YouTube until someone presses
// play or picks a chapter; the privacy-enhanced domain is used for the embed.
// The embed is driven with the documented postMessage commands (enablejsapi=1);
// if progress messages never arrive, the chosen chapter simply stays marked.
const EMBED = 'https://www.youtube-nocookie.com/embed/';

export function initFilms() {
  const films = [...document.querySelectorAll('[data-film]')].map(root => {
    const chapters = [...root.querySelectorAll('.chapter')];
    return {
      root,
      chapters,
      id: root.dataset.film,
      title: root.dataset.filmTitle,
      duration: Number(root.dataset.duration),
      starts: chapters.map(chapter => Number(chapter.dataset.t)),
      frame: root.querySelector('.film-frame'),
      list: root.querySelector('.chapter-list'),
      more: root.querySelector('.chapters-more'),
      iframe: null,
      time: 0,
    };
  });
  if (!films.length) return () => {};

  const send = (film, func, args = []) => film.iframe?.contentWindow?.postMessage(JSON.stringify({ event: 'command', func, args }), '*');

  function setExpanded(film, expanded) {
    if (!film.more) return;
    film.list.classList.toggle('is-expanded', expanded);
    film.more.setAttribute('aria-expanded', String(expanded));
    film.more.textContent = expanded ? 'Show fewer chapters' : `Show all ${film.chapters.length} chapters`;
  }

  function mark(film, time) {
    film.time = time;
    let active = 0;
    film.starts.forEach((start, i) => { if (start <= time + 0.25) active = i; });
    film.chapters.forEach((chapter, i) => {
      const end = film.starts[i + 1] ?? film.duration;
      const progress = i < active ? 1 : i > active ? 0 : Math.min(1, Math.max(0, (time - film.starts[i]) / (end - film.starts[i])));
      chapter.style.setProperty('--p', progress.toFixed(3));
      if (i === active) chapter.setAttribute('aria-current', 'true');
      else chapter.removeAttribute('aria-current');
    });
    if (active >= 4 && film.more && !film.list.classList.contains('is-expanded') && getComputedStyle(film.more).display !== 'none') setExpanded(film, true);
  }

  function mount(film, start) {
    const params = new URLSearchParams({ autoplay: '1', start: String(Math.floor(start)), rel: '0', playsinline: '1', iv_load_policy: '3', enablejsapi: '1', origin: location.origin });
    const iframe = document.createElement('iframe');
    iframe.src = `${EMBED}${film.id}?${params}`;
    iframe.title = film.title;
    iframe.allow = 'autoplay; encrypted-media; picture-in-picture; fullscreen';
    iframe.allowFullscreen = true;
    iframe.addEventListener('load', () => {
      iframe.contentWindow?.postMessage(JSON.stringify({ event: 'listening', id: film.id, channel: 'widget' }), '*');
    });
    film.frame.append(iframe);
    film.frame.classList.add('is-playing');
    film.iframe = iframe;
  }

  function play(film, start = 0) {
    films.forEach(other => { if (other !== film) send(other, 'pauseVideo'); });
    mark(film, start);
    if (!film.iframe) mount(film, start);
    else { send(film, 'seekTo', [start, true]); send(film, 'playVideo'); }
  }

  const onMessage = event => {
    const film = films.find(item => item.iframe && event.source === item.iframe.contentWindow);
    if (!film || typeof event.data !== 'string') return;
    let data;
    try { data = JSON.parse(event.data); } catch { return; }
    const info = data.info;
    if (data.event === 'infoDelivery' && info && typeof info.currentTime === 'number') mark(film, info.currentTime);
    const playing = (data.event === 'onStateChange' && info === 1) || (info && info.playerState === 1);
    if (playing) films.forEach(other => { if (other !== film) send(other, 'pauseVideo'); });
  };
  window.addEventListener('message', onMessage);

  films.forEach(film => {
    film.root.querySelector('.film-play').addEventListener('click', () => play(film, film.time));
    film.chapters.forEach(chapter => chapter.addEventListener('click', () => play(film, Number(chapter.dataset.t))));
    film.more?.addEventListener('click', () => {
      setExpanded(film, !film.list.classList.contains('is-expanded'));
      ScrollTrigger.refresh();
    });
  });

  // A quiet entrance: the screen settles to full size as it scrolls in, and
  // the chapter list follows. Nothing moves once it is in place.
  const motion = gsap.matchMedia();
  motion.add('(prefers-reduced-motion: no-preference) and (min-width: 701px)', () => {
    films.forEach(film => {
      gsap.fromTo(film.frame, { scale: 0.93, clipPath: 'inset(0% 4% 0% 4%)' }, { scale: 1, clipPath: 'inset(0% 0% 0% 0%)', ease: 'none', scrollTrigger: { trigger: film.frame, start: 'top 92%', end: 'top 45%', scrub: 0.6 } });
    });
  });
  motion.add('(prefers-reduced-motion: no-preference)', () => {
    films.forEach(film => {
      gsap.from(film.chapters, { opacity: 0, y: 14, duration: 0.5, stagger: 0.04, ease: 'power2.out', scrollTrigger: { trigger: film.list, start: 'top 88%', once: true } });
    });
  });

  return () => {
    window.removeEventListener('message', onMessage);
    motion.revert();
    films.forEach(film => send(film, 'pauseVideo'));
  };
}
