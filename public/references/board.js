import { references, chapters } from './board-data.js';

const escape = value => String(value).replace(/[&<>"']/g, character => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[character]));
const sourceLinks = reference => `<a class="source-link" href="${escape(reference.source)}" target="_blank" rel="noopener noreferrer">${escape(reference.sourceLabel)} ↗</a>${reference.secondary ? `<a class="source-link" href="${escape(reference.secondary)}" target="_blank" rel="noopener noreferrer">${escape(reference.secondaryLabel)} ↗</a>` : ''}`;
const grid = document.querySelector('#reference-grid');
grid.innerHTML = references.map((reference,index) => `<article class="reference-card" data-id="${reference.id}">
  <button class="reference-visual" data-open="${reference.id}" aria-label="Inspect ${escape(reference.title)} reference"><img src="${reference.image}" alt="${escape(reference.alt)}" loading="lazy" width="1000" height="650"><span class="inspect">Inspect reference ↗</span></button>
  <div class="reference-meta"><span>${String(index+1).padStart(2,'0')} / ${escape(reference.type)}</span><span>${reference.tags.includes('pinterest')?'PIN':'STUDY'}</span></div>
  <h3>${escape(reference.title)}</h3><p class="reference-takeaway">${escape(reference.takeaway)}</p><p class="application"><strong>For Alchemane:</strong> ${escape(reference.application)}</p>
  <details><summary>Evidence & proposed interaction</summary><p><strong>Observed / documented:</strong> ${escape(reference.evidence)}</p><p>${escape(reference.proposal)}</p><p>Credit: ${escape(reference.credit)}</p></details>${sourceLinks(reference)}
</article>`).join('');

document.querySelector('#chapters').innerHTML = chapters.map((chapter,index) => `<article><span>${String(index+1).padStart(2,'0')}</span><h3>${escape(chapter[0])}</h3><div><p><strong>${escape(chapter[1])}</strong> ${escape(chapter[2])}</p><small>${escape(chapter[3])}</small></div></article>`).join('');

function filterReferences(filter) {
  let count = 0;
  references.forEach(reference => {
    const visible = filter === 'all' || reference.tags.includes(filter);
    grid.querySelector(`[data-id="${reference.id}"]`).hidden = !visible;
    if (visible) count++;
  });
  document.querySelectorAll('[data-filter]').forEach(button => button.setAttribute('aria-pressed', String(button.dataset.filter === filter)));
  document.querySelector('#result-count').textContent = `${count} of ${references.length} references`;
}
document.querySelectorAll('[data-filter]').forEach(button => button.addEventListener('click', () => filterReferences(button.dataset.filter)));
filterReferences('all');

const dialog = document.querySelector('#reference-dialog');
let dialogOpener;
grid.addEventListener('click', event => {
  const button = event.target.closest('[data-open]');
  if (!button) return;
  const reference = references.find(item => item.id === button.dataset.open);
  dialogOpener = button;
  document.querySelector('#dialog-title').textContent = reference.title;
  document.querySelector('#dialog-type').textContent = reference.type;
  const image = document.querySelector('#dialog-image');
  image.src = reference.image;
  image.alt = reference.alt;
  document.querySelector('#dialog-details').innerHTML = `<p><strong>For Alchemane:</strong> ${escape(reference.application)}</p><p>${escape(reference.evidence)}</p><p>${escape(reference.proposal)}</p>${sourceLinks(reference)}${reference.detailImage ? `<p class="tiny">Additional project image · ${escape(reference.credit)}</p><img src="${reference.detailImage}" alt="Additional published ${escape(reference.title)} design showing related page compositions" loading="lazy">` : ''}`;
  dialog.showModal();
  dialog.scrollTop = 0;
  document.body.style.overflow = 'hidden';
});
dialog.querySelector('.dialog-close').addEventListener('click', () => dialog.close());
dialog.addEventListener('close', () => { document.body.style.overflow = ''; dialogOpener?.focus({preventScroll:true}); });
dialog.addEventListener('click', event => {
  if (event.target !== dialog) return;
  const rect = dialog.getBoundingClientRect();
  if (event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom) dialog.close();
});

const studyTabs = [...document.querySelectorAll('[data-study]')];
function selectStudy(tab,focus=false) {
  studyTabs.forEach(button => {
    const selected = button === tab;
    button.setAttribute('aria-selected', String(selected));
    button.tabIndex = selected ? 0 : -1;
    document.querySelector(`#study-${button.dataset.study}`).hidden = !selected;
  });
  if (focus) tab.focus();
}
studyTabs.forEach((tab,index) => {
  tab.addEventListener('click', () => selectStudy(tab));
  tab.addEventListener('keydown', event => {
    const indexes = {ArrowRight:(index+1)%studyTabs.length, ArrowLeft:(index+studyTabs.length-1)%studyTabs.length, Home:0, End:studyTabs.length-1};
    if (!(event.key in indexes)) return;
    event.preventDefault();
    selectStudy(studyTabs[indexes[event.key]],true);
  });
});

const progress = document.querySelector('#motion-progress');
const play = document.querySelector('#play-motion');
const target = document.querySelector('.motion-target');
const cloud = document.querySelector('.demo-cloud');
const white = document.querySelector('.demo-white');
const output = document.querySelector('#motion-state');
const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
let animationFrame = 0;
const clamp = value => Math.min(1,Math.max(0,value));
function setProgress(value) {
  progress.value = value;
  const fraction = value/100;
  cloud.style.transform = `translateY(${-Math.min(fraction/.55,1)*145}%)`;
  cloud.style.opacity = fraction > .72 ? String(1-clamp((fraction-.72)/.15)) : '1';
  const cover = fraction < .52 ? clamp((fraction-.3)/.22) : 1-clamp((fraction-.65)/.28);
  white.style.opacity = String(cover);
  target.style.opacity = fraction >= .52 ? '1' : '0';
  output.value = fraction < .28 ? 'Hero' : fraction < .52 ? 'Cloud rise' : fraction < .66 ? 'Whiteout' : fraction < .93 ? 'Reveal' : 'Collection';
}
function stopPlayback() { cancelAnimationFrame(animationFrame); animationFrame = 0; play.textContent = reducedMotion.matches ? 'Show final state ↗' : 'Play sequence ↗'; }
play.addEventListener('click', () => {
  if (animationFrame) { stopPlayback(); return; }
  if (reducedMotion.matches) { setProgress(100); return; }
  const started = performance.now();
  play.textContent = 'Pause sequence';
  const frame = now => {
    const value = Math.min(100,(now-started)/55);
    setProgress(value);
    if(value<100) animationFrame=requestAnimationFrame(frame);
    else stopPlayback();
  };
  animationFrame=requestAnimationFrame(frame);
});
progress.addEventListener('input', () => { stopPlayback(); setProgress(Number(progress.value)); });
reducedMotion.addEventListener('change', () => { stopPlayback(); if(reducedMotion.matches) setProgress(100); });
document.addEventListener('visibilitychange', () => { if(document.hidden) stopPlayback(); });
stopPlayback();
setProgress(0);
