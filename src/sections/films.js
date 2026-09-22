import './showcase.css';

// Native controls keep the approved reels usable without an embed or custom player.
// Playback is always visitor-initiated; leaving a film pauses its sound.
export function initFilms() {
  const videos = [...document.querySelectorAll('[data-reel] video')];
  const abort = new AbortController();
  const options = { signal: abort.signal };
  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => { if (!entry.isIntersecting) entry.target.pause(); });
  }, { threshold: 0.1 });
  videos.forEach(video => {
    video.addEventListener('play', () => videos.forEach(other => { if (other !== video) other.pause(); }), options);
    const showError = () => { video.parentElement.querySelector('.reel-error').hidden = false; };
    video.addEventListener('error', showError, options);
    video.querySelector('source')?.addEventListener('error', showError, options);
    observer.observe(video);
  });
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) videos.forEach(video => video.pause());
  }, options);
  return () => { abort.abort(); observer.disconnect(); videos.forEach(video => video.pause()); };
}
