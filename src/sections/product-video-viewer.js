import { shopProducts } from '../products/shop-products.js';
import { readBag, writeBag, addToBag } from '../products/cart.js';
import './product-video-viewer.css';

const escape = value => String(value).replace(/[&<>"']/g, character => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[character]));
const money = value => `₹${new Intl.NumberFormat('en-IN').format(value)}`;
const svg = path => `<svg viewBox="0 0 24 24" aria-hidden="true">${path}</svg>`;
const icons = {
  close: svg('<path d="m6 6 12 12M18 6 6 18"/>'),
  sound: svg('<path d="m11 5-6 4H2v6h3l6 4V5Zm4 3a6 6 0 0 1 0 8m3-11a10 10 0 0 1 0 14"/>'),
  mute: svg('<path d="m11 5-6 4H2v6h3l6 4V5Zm5 4 6 6m0-6-6 6"/>'),
  play: svg('<path d="m8 5 11 7-11 7Z"/>'),
  up: svg('<path d="m5 15 7-7 7 7"/>'),
  down: svg('<path d="m5 9 7 7 7-7"/>'),
  bag: svg('<path d="M5 8h14l1 13H4L5 8Zm3 0V6a4 4 0 0 1 8 0v2"/>'),
};

function optionsMarkup(product, index, state) {
  const groups = [...product.options, ...(product.textures.length ? [{ name: 'Texture', values: product.textures }] : [])];
  return groups.map((group, groupIndex) => `<fieldset><legend>${escape(group.name)}</legend><div class="product-film-options">
    ${group.values.map(value => `<label><input type="radio" name="film-${index}-option-${groupIndex}" value="${escape(value)}" data-option="${groupIndex}" required${(groupIndex < product.options.length ? state.options[groupIndex] : state.texture) === value ? ' checked' : ''}><span>${escape(value)}</span></label>`).join('')}
  </div></fieldset>`).join('');
}

export function createProductVideoViewer(onSelectCard) {
  const cards = [...document.querySelectorAll('#product-videos [data-voice]')];
  const films = cards.map(card => ({ card, product: shopProducts[card.dataset.productHandle], preview: card.querySelector('video') })).filter(film => film.product);
  if (!films.length) return { open() {}, destroy() {} };
  const abort = new AbortController();
  const options = { signal: abort.signal };
  const states = new Map();
  const editBackups = new Map();
  const dialog = document.createElement('dialog');
  dialog.className = 'product-film-dialog product-film-dialog--product';
  dialog.setAttribute('aria-label', 'Shop product videos');
  dialog.innerHTML = `<div class="product-film-shell">
    <div class="product-film-feed" tabindex="0" aria-label="Product videos. Swipe up or down for another product."></div>
    <button type="button" class="product-film-neighbor product-film-neighbor--previous" data-film-neighbor="previous" hidden><img alt="" width="200" height="356"><span></span></button>
    <button type="button" class="product-film-neighbor product-film-neighbor--next" data-film-neighbor="next" hidden><img alt="" width="200" height="356"><span></span></button>
    <div class="product-film-toolbar"><button type="button" data-film-sound aria-label="Mute video">${icons.sound}</button><button type="button" data-film-close aria-label="Close product videos">${icons.close}</button></div>
    <div class="product-film-navigation"><button type="button" data-film-prev aria-label="Previous product video">${icons.up}</button><button type="button" data-film-next aria-label="Next product video">${icons.down}</button></div>
    <label class="product-film-progress"><span class="sr-only">Video progress</span><input type="range" min="0" max="1000" step="1" value="0" aria-label="Video progress"></label>
    <p class="sr-only" role="status" data-film-announcement></p>
  </div>`;
  document.body.append(dialog);
  const feed = dialog.querySelector('.product-film-feed');
  const toolbar = dialog.querySelector('.product-film-toolbar');
  const sound = dialog.querySelector('[data-film-sound]');
  const prev = dialog.querySelector('[data-film-prev]');
  const next = dialog.querySelector('[data-film-next]');
  const neighbors = [...dialog.querySelectorAll('[data-film-neighbor]')];
  const desktopView = matchMedia('(min-width: 1000px)');
  const progress = dialog.querySelector('input[type="range"]');
  const announcement = dialog.querySelector('[data-film-announcement]');
  const player = document.createElement('video');
  player.className = 'product-film-player';
  player.playsInline = true;
  player.preload = 'none';
  player.loop = true;
  let activeIndex = -1;
  let opener = null;
  let previousOverflow = '';
  let settleTimer = 0;
  let scrollFrame = 0;
  let slides = [];
  let disposed = false;

  const stateFor = product => {
    if (!states.has(product.handle)) {
      const saved = readBag().find(item => item.handle === product.handle);
      const variant = product.variants.find(item => item.id === saved?.id) || product.variants.find(item => item.available) || product.variants[0];
      states.set(product.handle, { options: [...variant.options], texture: saved?.texture || '' });
    }
    return states.get(product.handle);
  };
  const selection = index => {
    const { product } = films[index];
    const state = stateFor(product);
    return { state, variant: product.variants.find(variant => variant.options.every((value, option) => value === state.options[option])) };
  };
  const renderSlides = () => {
    feed.innerHTML = films.map(({ product, preview }, index) => {
      const state = stateFor(product);
      return `<article class="product-film-slide" data-film-index="${index}" aria-label="${escape(product.name)} video, ${index + 1} of ${films.length}">
        <div class="product-film-stage"><img class="product-film-poster" src="${escape(preview.poster)}" width="540" height="960" alt="" loading="lazy"><button type="button" class="product-film-toggle" aria-label="Pause ${escape(product.name)} video"><span>${icons.play}</span></button><p class="product-film-loading" role="status">Loading video…</p></div>
        <section class="product-film-shop" aria-label="Shop ${escape(product.name)}">
          <div class="product-film-summary"><img src="${escape(product.image)}" width="64" height="76" alt=""><div><p class="product-film-name">${escape(product.name)}</p><strong data-film-price></strong><button type="button" class="product-film-change" data-shop-change hidden>Change options</button></div></div>
          <form class="product-film-form" hidden>${optionsMarkup(product, index, state)}<div class="product-film-form-actions"><button type="button" data-shop-cancel>Cancel</button><button type="submit" class="product-film-add">Add to cart</button></div></form>
          <button type="button" class="product-film-add product-film-start" data-shop-start>Add to cart ${icons.bag}</button>
          <div class="product-film-added" hidden><div class="product-film-quantity" role="group" aria-label="Quantity in cart"><button type="button" data-shop-step="-1" aria-label="Decrease quantity">−</button><span data-shop-quantity></span><button type="button" data-shop-step="1" aria-label="Increase quantity">+</button></div><a href="/checkout.html">Checkout</a></div>
          <p class="product-film-cart-status" role="status" aria-live="polite"></p>
        </section>
      </article>`;
    }).join('');
    slides = [...feed.children];
    slides.forEach((_, index) => syncShop(index));
  };
  const syncShop = index => {
    const slide = slides[index];
    const { product } = films[index];
    const { variant, state } = selection(index);
    const existing = readBag().find(item => item.handle === product.handle && item.id === variant?.id && item.texture === state.texture);
    const choosing = !slide.querySelector('form').hidden;
    const available = variant?.available && (!product.textures.length || state.texture);
    slide.querySelector('[data-film-price]').textContent = variant ? money(variant.price) : `From ${money(Math.min(...product.variants.map(item => item.price)))}`;
    slide.querySelector('[data-shop-start]').hidden = choosing || Boolean(existing);
    slide.querySelector('[data-shop-change]').hidden = choosing || !existing;
    slide.querySelector('.product-film-added').hidden = choosing || !existing;
    slide.querySelector('[data-shop-quantity]').textContent = existing?.quantity || 0;
    slide.querySelector('[data-shop-step="1"]').disabled = existing?.quantity >= 10;
    slide.querySelector('button[type="submit"]').disabled = !variant?.available;
    // Fixed values remain visible; incompatible combinations cannot be chosen.
    slide.querySelectorAll('[data-option]').forEach(input => {
      const position = Number(input.dataset.option);
      if (position >= product.options.length) return;
      input.disabled = !product.variants.some(item => item.available && item.options[position] === input.value && item.options.every((value, option) => option === position || value === state.options[option]));
    });
    return { variant, state, existing, available };
  };
  const chooseOptions = (index, open) => {
    const slide = slides[index];
    if (open) {
      const state = stateFor(films[index].product);
      editBackups.set(index, { options: [...state.options], texture: state.texture });
      slide.querySelector('.product-film-cart-status').textContent = '';
    } else editBackups.delete(index);
    slide.querySelector('form').hidden = !open;
    slide.querySelector('.product-film-shop').classList.toggle('is-choosing', open);
    feed.classList.toggle('is-choosing', open);
    prev.disabled = open || activeIndex === 0;
    next.disabled = open || activeIndex === films.length - 1;
    syncNeighbors();
    syncShop(index);
    if (open) slide.querySelector('input:not(:disabled)')?.focus({ preventScroll: true });
  };
  const addSelection = index => {
    const { product } = films[index];
    const { variant, state } = selection(index);
    const status = slides[index].querySelector('.product-film-cart-status');
    const result = addToBag({ handle: product.handle, id: variant?.id, texture: state.texture, quantity: 1 });
    if (result.error) { status.textContent = result.error; return; }
    chooseOptions(index, false);
    status.textContent = 'Added to cart';
    slides[index].querySelector('.product-film-added a').focus({ preventScroll: true });
  };
  const syncPlayState = () => {
    const slide = slides[activeIndex];
    if (!slide) return;
    slide.classList.toggle('is-paused', player.paused);
    slide.querySelector('.product-film-toggle').setAttribute('aria-label', `${player.paused ? 'Play' : 'Pause'} ${films[activeIndex].product.name} video`);
  };
  const syncNeighbors = () => {
    neighbors.forEach((button, position) => {
      const index = activeIndex + (position === 0 ? -1 : 1);
      const film = films[index];
      button.hidden = !desktopView.matches || !film || feed.classList.contains('is-choosing');
      if (!button.hidden) {
        button.dataset.index = String(index);
        button.querySelector('img').src = film.preview.poster;
        button.querySelector('span').textContent = film.product.name;
        button.setAttribute('aria-label', `${position === 0 ? 'Previous' : 'Next'} video: ${film.product.name}`);
      }
    });
  };
  const play = () => {
    const index = activeIndex;
    player.play().catch(() => {
      if (!disposed && dialog.open && activeIndex === index) {
        slides[index].classList.remove('is-loading');
        syncPlayState();
      }
    });
  };
  const activate = index => {
    if (!dialog.open || index === activeIndex) return;
    activeIndex = index;
    player.pause();
    feed.classList.remove('is-choosing');
    slides.forEach((slide, position) => {
      slide.classList.toggle('is-active', position === index);
      slide.inert = position !== index;
      slide.querySelector('form').hidden = true;
      slide.querySelector('.product-film-shop').classList.remove('is-choosing');
      slide.classList.remove('has-error', 'is-loading', 'is-paused');
    });
    const { preview, product, card } = films[index];
    opener = card.querySelector('.voice-play');
    const slide = slides[index];
    syncShop(index);
    slide.append(toolbar);
    slide.classList.add('is-loading');
    slide.querySelector('.product-film-loading').textContent = 'Loading video…';
    slide.querySelector('.product-film-stage').prepend(player);
    player.poster = preview.poster;
    player.src = preview.querySelector('source').src;
    player.setAttribute('aria-label', `${product.name} video`);
    progress.value = 0;
    play();
    prev.disabled = index === 0;
    next.disabled = index === films.length - 1;
    syncNeighbors();
    announcement.textContent = `${product.name}, video ${index + 1} of ${films.length}.`;
    onSelectCard(card);
  };
  const nearest = () => Math.max(0, Math.min(films.length - 1, Math.round(feed.scrollTop / feed.clientHeight)));
  const settle = () => { clearTimeout(settleTimer); if (dialog.open && !feed.classList.contains('is-choosing')) activate(nearest()); };
  const go = index => feed.scrollTo({ top: Math.max(0, Math.min(index, films.length - 1)) * feed.clientHeight, behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth' });
  const close = () => dialog.close();
  dialog.querySelector('[data-film-close]').addEventListener('click', close, options);
  prev.addEventListener('click', () => go(activeIndex - 1), options);
  next.addEventListener('click', () => go(activeIndex + 1), options);
  neighbors.forEach(button => button.addEventListener('click', () => go(Number(button.dataset.index)), options));
  dialog.addEventListener('click', event => { if (event.target === dialog) close(); }, options);
  sound.addEventListener('click', () => {
    player.muted = !player.muted;
    sound.innerHTML = player.muted ? icons.mute : icons.sound;
    sound.setAttribute('aria-label', player.muted ? 'Turn sound on' : 'Mute video');
  }, options);
  feed.addEventListener('scroll', () => {
    if (!scrollFrame) scrollFrame = requestAnimationFrame(() => {
      scrollFrame = 0;
      // Keep the outgoing video until the incoming frame occupies most of the screen.
      if (Math.abs(feed.scrollTop / feed.clientHeight - nearest()) < .2) settle();
    });
    clearTimeout(settleTimer);
    settleTimer = setTimeout(settle, 140);
  }, { ...options, passive: true });
  feed.addEventListener('scrollend', settle, options);
  feed.addEventListener('keydown', event => {
    if (event.target !== feed && !event.target.closest('.product-film-toggle')) return;
    if (['ArrowDown', 'ArrowUp', 'PageDown', 'PageUp', ...(desktopView.matches ? ['ArrowRight', 'ArrowLeft'] : [])].includes(event.key)) {
      event.preventDefault();
      go(activeIndex + (['ArrowDown', 'PageDown', 'ArrowRight'].includes(event.key) ? 1 : -1));
    }
  }, options);
  feed.addEventListener('click', event => {
    const slide = event.target.closest('[data-film-index]');
    if (!slide) return;
    const index = Number(slide.dataset.filmIndex);
    if (index !== activeIndex) return;
    if (event.target.closest('.product-film-toggle')) {
      if (slide.classList.contains('has-error')) { player.load(); slide.classList.remove('has-error'); }
      if (player.paused) play();
      else player.pause();
    } else if (event.target.closest('[data-shop-start]')) {
      const { product } = films[index];
      if (product.variants.length > 1 || product.textures.length) chooseOptions(index, true);
      else addSelection(index);
    } else if (event.target.closest('[data-shop-change]')) chooseOptions(index, true);
    else if (event.target.closest('[data-shop-cancel]')) {
      const state = stateFor(films[index].product);
      const backup = editBackups.get(index);
      if (backup) {
        state.options = backup.options;
        state.texture = backup.texture;
        slide.querySelectorAll('[data-option]').forEach(input => {
          const position = Number(input.dataset.option);
          input.checked = input.value === (position < state.options.length ? state.options[position] : state.texture);
        });
      }
      chooseOptions(index, false);
      slide.querySelector('[data-shop-change]:not([hidden]), [data-shop-start]:not([hidden])')?.focus({ preventScroll: true });
    } else {
      const step = event.target.closest('[data-shop-step]');
      if (!step) return;
      const { variant, state } = selection(index);
      const items = readBag();
      const item = items.find(item => item.id === variant.id && item.texture === state.texture);
      if (!item) return;
      item.quantity = Math.min(10, item.quantity + Number(step.dataset.shopStep));
      writeBag(items.filter(item => item.quantity > 0));
      syncShop(index);
      slide.querySelector('.product-film-cart-status').textContent = item.quantity ? 'Cart updated' : 'Removed from cart';
      if (!item.quantity) slide.querySelector('[data-shop-start]').focus({ preventScroll: true });
    }
  }, options);
  feed.addEventListener('change', event => {
    const input = event.target.closest('[data-option]');
    if (!input) return;
    const index = Number(input.closest('[data-film-index]').dataset.filmIndex);
    const { product } = films[index];
    const state = stateFor(product);
    const position = Number(input.dataset.option);
    if (position < product.options.length) state.options[position] = input.value;
    else state.texture = input.value;
    syncShop(index);
  }, options);
  feed.addEventListener('submit', event => {
    event.preventDefault();
    addSelection(Number(event.target.closest('[data-film-index]').dataset.filmIndex));
  }, options);
  player.addEventListener('playing', () => { slides[activeIndex]?.classList.remove('is-loading'); syncPlayState(); }, options);
  player.addEventListener('waiting', () => slides[activeIndex]?.classList.add('is-loading'), options);
  player.addEventListener('pause', syncPlayState, options);
  player.addEventListener('error', () => {
    const slide = slides[activeIndex];
    if (!dialog.open || !slide) return;
    slide.classList.remove('is-loading');
    slide.classList.add('has-error');
    slide.querySelector('.product-film-loading').textContent = 'Video couldn’t load. Tap to retry.';
  }, options);
  player.addEventListener('timeupdate', () => { if (Number.isFinite(player.duration)) progress.value = Math.round(player.currentTime / player.duration * 1000); }, options);
  progress.addEventListener('input', () => { if (Number.isFinite(player.duration)) player.currentTime = player.duration * Number(progress.value) / 1000; }, options);
  document.addEventListener('visibilitychange', () => { if (document.hidden) player.pause(); }, options);
  window.addEventListener('resize', () => { if (dialog.open) { feed.scrollTo({ top: activeIndex * feed.clientHeight, behavior: 'instant' }); feed.setAttribute('aria-label', desktopView.matches ? 'Product videos. Use left or right arrow keys for another product.' : 'Product videos. Swipe up or down for another product.'); syncNeighbors(); } }, options);
  dialog.addEventListener('close', () => {
    player.pause();
    player.removeAttribute('src');
    player.load();
    player.remove();
    dialog.querySelector('.product-film-shell').append(toolbar);
    clearTimeout(settleTimer);
    document.body.style.overflow = previousOverflow;
    opener?.focus({ preventScroll: true });
    opener = null;
    activeIndex = -1;
  }, options);

  return {
    open(card, button) {
      const index = films.findIndex(film => film.card === card);
      if (index < 0) return;
      opener = button;
      previousOverflow = document.body.style.overflow;
      renderSlides();
      player.muted = false;
      player.volume = 1;
      sound.innerHTML = icons.sound;
      sound.setAttribute('aria-label', 'Mute video');
      document.body.style.overflow = 'hidden';
      dialog.showModal();
      feed.setAttribute('aria-label', desktopView.matches ? 'Product videos. Use left or right arrow keys for another product.' : 'Product videos. Swipe up or down for another product.');
      feed.scrollTo({ top: index * feed.clientHeight, behavior: 'instant' });
      activate(index);
    },
    destroy() {
      disposed = true;
      if (dialog.open) document.body.style.overflow = previousOverflow;
      abort.abort();
      clearTimeout(settleTimer);
      cancelAnimationFrame(scrollFrame);
      player.pause();
      dialog.remove();
    },
  };
}
