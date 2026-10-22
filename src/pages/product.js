import { productPages, formatPrice } from '../products/product-content.js';
import { escapeHtml as e, icon } from '../products/render-product.js';
import { initConsultationMeet } from '../sections/consultation-meet.js';
import { initProductReviews } from '../products/product-reviews.js';
import '../sections/faq-tabs.css';

const product = JSON.parse(document.querySelector('#product-data').textContent);
const stopReviews = initProductReviews(product.reviews);
document.body.classList.add('pd-has-js');
const form = document.querySelector('#product-form');
const lengthInputs = form.elements.namedItem('length');
const colourInputs = form.elements.namedItem('colour');
const textureInputs = form.elements.namedItem('texture');
const abort = new AbortController();
const on = (node, event, fn, options = {}) => node.addEventListener(event, fn, { ...options, signal: abort.signal });
const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
const motion = () => reducedMotion.matches ? 'instant' : 'smooth';
const status = document.querySelector('[data-product-status]');
document.querySelector('[data-year]').textContent = new Date().getFullYear();

// Match the shared consultation used across the homepage and service pages,
// while retaining the product and selected variant in the WhatsApp request.
const consultationForm = document.querySelector('#topper-consultation-form');
const consultationError = consultationForm.querySelector('#booking-errors');
const consultationStatus = consultationForm.querySelector('#booking-status');
const consultationLink = consultationForm.querySelector('#booking-message');
initConsultationMeet(consultationForm);
on(consultationForm, 'input', event => {
  event.target.removeAttribute('aria-invalid');
  const fieldError = event.target.getAttribute('aria-describedby');
  if (fieldError) document.getElementById(fieldError).hidden = true;
  consultationError.hidden = true;
  consultationStatus.hidden = true;
  consultationLink.removeAttribute('href');
});
on(consultationForm, 'submit', event => {
  event.preventDefault();
  const name = consultationForm.elements.name.value.trim();
  const phone = consultationForm.elements.phone.value.trim();
  const digits = phone.replace(/\D/g, '');
  const problems = [];
  if (!name) {
    problems.push('your name');
    consultationForm.elements.name.setAttribute('aria-invalid', 'true');
    document.querySelector('#booking-name-error').hidden = false;
  }
  if (digits.length < 7 || digits.length > 15) {
    problems.push('a valid phone number');
    consultationForm.elements.phone.setAttribute('aria-invalid', 'true');
    document.querySelector('#booking-phone-error').hidden = false;
  }
  if (problems.length) {
    consultationError.textContent = `Please add ${problems.join(' and ')}.`;
    consultationError.hidden = false;
    consultationError.focus();
    return;
  }
  const data = new FormData(consultationForm);
  const city = data.get('city').trim();
  const message = `Hello Alchemane, I’d like to arrange a consultation.\n\nProduct: ${data.get('product')}\nSelected options: ${data.get('selection')}\nName: ${name}\nPhone: ${phone}${city ? `\nCity: ${city}` : ''}\nMeeting: ${data.get('meeting')}\nConsultation fee: ₹299`;
  consultationLink.href = `https://wa.me/919967123333?text=${encodeURIComponent(message)}`;
  consultationStatus.hidden = false;
  window.open(consultationLink.href, '_blank', 'noopener,noreferrer');
});
consultationForm.noValidate = true;
consultationForm.hidden = false;

// Menu stays in normal document order and closes with Escape or an outside tap.
const header = document.querySelector('.pd-header');
const menu = document.querySelector('.pd-menu');
const setMenu = open => {
  header.classList.toggle('is-open', open);
  menu.setAttribute('aria-expanded', String(open));
  menu.setAttribute('aria-label', open ? 'Close navigation' : 'Open navigation');
};
on(menu, 'click', () => setMenu(menu.getAttribute('aria-expanded') !== 'true'));
on(document, 'click', event => { if (!header.contains(event.target)) setMenu(false); });
on(document.querySelector('.pd-nav'), 'click', () => setMenu(false));
on(matchMedia('(min-width: 1000px)'), 'change', () => setMenu(false));
on(document, 'keydown', event => {
  if (event.key === 'Escape' && header.classList.contains('is-open')) { setMenu(false); menu.focus(); }
});

// Native dialogs provide focus trapping, Escape dismissal and focus restoration.
const openDialog = dialog => {
  dialog.showModal();
  document.documentElement.style.overflow = 'hidden';
};
document.querySelectorAll('dialog').forEach(dialog => {
  on(dialog, 'close', () => { document.documentElement.style.overflow = ''; });
  on(dialog, 'click', event => {
    if (event.target.closest('[data-close]')) dialog.close();
    if (event.target === dialog) {
      const bounds = dialog.getBoundingClientRect();
      if (event.clientX < bounds.left || event.clientX > bounds.right || event.clientY < bounds.top || event.clientY > bounds.bottom) dialog.close();
    }
  });
});

// Native scroll-snap supports touch; arrows, thumbnails and keyboard are alternatives.
const track = document.querySelector('.pd-gallery__track');
const thumbnails = [...document.querySelectorAll('[data-thumbnail]')];
let galleryIndex = 0;
const wrap = i => (i + product.gallery.length) % product.gallery.length;
const updateGallery = i => {
  galleryIndex = wrap(i);
  thumbnails.forEach((button, index) => button.setAttribute('aria-pressed', String(index === galleryIndex)));
  document.querySelector('[data-gallery-count]').textContent = `${galleryIndex + 1} / ${product.gallery.length}`;
  document.querySelector('[data-gallery-caption]').textContent = product.gallery[galleryIndex].caption;
};
const goToImage = i => {
  const index = wrap(i);
  track.scrollTo({ left: track.clientWidth * index, behavior: motion() });
  if (reducedMotion.matches) updateGallery(index);
};
let scrollFrame;
on(track, 'scroll', () => {
  cancelAnimationFrame(scrollFrame);
  scrollFrame = requestAnimationFrame(() => updateGallery(Math.round(track.scrollLeft / track.clientWidth)));
}, { passive: true });
thumbnails.forEach(button => on(button, 'click', () => goToImage(Number(button.dataset.thumbnail))));
document.querySelectorAll('[data-gallery-step]').forEach(button => on(button, 'click', () => goToImage(galleryIndex + Number(button.dataset.galleryStep))));
on(track, 'keydown', event => {
  if (event.key === 'ArrowRight' || event.key === 'ArrowLeft') { event.preventDefault(); goToImage(galleryIndex + (event.key === 'ArrowRight' ? 1 : -1)); }
});
let previousWidth = track.clientWidth;
const galleryResize = new ResizeObserver(() => {
  if (track.clientWidth !== previousWidth) {
    previousWidth = track.clientWidth;
    track.scrollTo({ left: previousWidth * galleryIndex, behavior: 'instant' });
  }
});
galleryResize.observe(track);

// Product-specific before/after results: three cards on larger screens and a
// swipeable, button-controlled carousel on phones.
const differenceSlides = [...document.querySelectorAll('.pd-difference__slide')];
const differenceFrame = document.querySelector('.pd-difference__frame');
const differenceStatus = document.querySelector('[data-difference-status]');
const differenceWide = matchMedia('(min-width: 701px)');
let differenceIndex = 0;
let differenceTimer = 0;
if (differenceFrame && differenceSlides.length) {
  const differenceVisible = () => differenceWide.matches ? Math.min(3, differenceSlides.length) : 1;
  const differenceLast = () => Math.max(0, differenceSlides.length - differenceVisible());
  const differenceOffset = index => differenceSlides[index].offsetLeft - differenceSlides[0].offsetLeft;
  const updateDifference = () => {
    const visible = differenceVisible();
    differenceIndex = Math.max(0, Math.min(differenceIndex, differenceLast()));
    differenceSlides.forEach((slide, index) => slide.setAttribute('aria-hidden', String(index < differenceIndex || index >= differenceIndex + visible)));
    const first = differenceIndex + 1;
    const last = Math.min(differenceSlides.length, differenceIndex + visible);
    differenceStatus.textContent = visible === 1
      ? `Showing transformation ${first} of ${differenceSlides.length}`
      : `Showing transformations ${first} to ${last} of ${differenceSlides.length}`;
  };
  const renderDifference = (behavior = 'auto') => {
    differenceIndex = Math.max(0, Math.min(differenceIndex, differenceLast()));
    updateDifference();
    differenceFrame.scrollTo({ left: differenceOffset(differenceIndex), behavior });
  };
  const closestDifference = () => differenceSlides.reduce((best, slide, index) => (
    Math.abs(differenceOffset(index) - differenceFrame.scrollLeft) < Math.abs(differenceOffset(best) - differenceFrame.scrollLeft) ? index : best
  ), 0);
  document.querySelectorAll('[data-difference-direction]').forEach(button => on(button, 'click', () => {
    const direction = Number(button.dataset.differenceDirection);
    if (direction > 0) differenceIndex = differenceIndex >= differenceLast() ? 0 : differenceIndex + 1;
    else differenceIndex = differenceIndex <= 0 ? differenceLast() : differenceIndex - 1;
    renderDifference(motion());
  }));
  on(differenceFrame, 'scroll', () => {
    clearTimeout(differenceTimer);
    differenceTimer = window.setTimeout(() => {
      differenceIndex = Math.min(closestDifference(), differenceLast());
      updateDifference();
    }, 160);
  }, { passive: true });
  on(differenceWide, 'change', () => renderDifference('auto'));
  on(window, 'resize', () => renderDifference('auto'));
  renderDifference('auto');
}

const lightbox = document.querySelector('#image-dialog');
const zoomFrame = lightbox.querySelector('.pd-lightbox__image');
let zoomIndex = 0;
const updateZoom = i => {
  zoomIndex = wrap(i);
  const image = product.gallery[zoomIndex];
  const target = lightbox.querySelector('[data-zoom-image]');
  target.src = image.src;
  target.alt = image.alt;
  lightbox.querySelector('[data-zoom-count]').textContent = `${zoomIndex + 1} / ${product.gallery.length}`;
  lightbox.querySelector('[data-zoom-caption]').textContent = image.caption;
  zoomFrame.classList.remove('is-zoomed');
  zoomFrame.scrollTo(0, 0);
};
document.querySelectorAll('[data-zoom]').forEach(button => on(button, 'click', () => { updateZoom(Number(button.dataset.zoom)); openDialog(lightbox); }));
on(document.querySelector('[data-zoom-current]'), 'click', () => { updateZoom(galleryIndex); openDialog(lightbox); });
lightbox.querySelectorAll('[data-zoom-step]').forEach(button => on(button, 'click', () => updateZoom(zoomIndex + Number(button.dataset.zoomStep))));
on(lightbox, 'keydown', event => {
  if (event.key === 'ArrowRight' || event.key === 'ArrowLeft') { event.preventDefault(); updateZoom(zoomIndex + (event.key === 'ArrowRight' ? 1 : -1)); }
});
on(zoomFrame, 'click', event => {
  if (event.target.matches('img')) zoomFrame.classList.toggle('is-zoomed');
});

// Variant is the single source of truth for price, direct checkout and bag actions.
const quantityInput = form.elements.quantity;
const quantity = () => Math.min(10, Math.max(1, Number.parseInt(quantityInput.value, 10) || 1));
const cartLink = (id, count, texture) => {
  const properties = btoa(JSON.stringify({ Texture: texture })).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
  return `https://alchemane.com/cart/${id}:${count}?properties=${properties}&checkout`;
};
const stock = document.querySelector('[data-stock]');
const liveAvailability = new Map();
const stockCounts = new Map();
let stockChecked = false;
const initialVariant = product.variants.find(v => v.id === new URLSearchParams(location.search).get('variant'));
if (initialVariant) {
  lengthInputs.value = initialVariant.length;
  colourInputs.value = initialVariant.colour;
}
let selected;
const syncSelection = () => {
  selected = product.variants.find(v => v.length === lengthInputs.value && v.colour === colourInputs.value);
  if (!selected) return;
  quantityInput.value = quantity();
  form.elements.id.value = selected.id;
  document.querySelector('[data-price]').textContent = formatPrice(selected.price);
  document.querySelector('[data-sticky-price]').textContent = formatPrice(selected.price);
  document.querySelector('[data-sticky-selection]').textContent = `${selected.length.replace(' inches', '″')} · ${selected.colour}`;
  document.querySelector('[data-length-label]').textContent = selected.length;
  document.querySelector('[data-colour-label]').textContent = selected.colour;
  document.querySelector('[data-texture-label]').textContent = textureInputs.value || 'Choose a texture';
  document.querySelector('#topper-consultation-form [name="selection"]').value = `${product.base} / ${selected.length} / ${selected.colour}${textureInputs.value ? ` / ${textureInputs.value}` : ''}`;
  const buyNow = document.querySelector('[data-buy-now]');
  const available = liveAvailability.get(selected.id) ?? selected.available;
  const count = stockCounts.get(selected.id);
  if (!available) {
    stock.textContent = 'Currently unavailable';
    stock.dataset.state = 'unavailable';
  } else {
    stock.textContent = Number.isInteger(count) && count > 0 ? `${count} in stock` : stockChecked ? 'Available to order; confirm at checkout' : 'Checking availability…';
    stock.dataset.state = stockChecked ? 'available' : 'checking';
  }
  if (available) {
    buyNow.href = textureInputs.value ? cartLink(selected.id, quantity(), textureInputs.value) : '#product-form';
    buyNow.removeAttribute('aria-disabled');
  } else {
    buyNow.removeAttribute('href');
    buyNow.setAttribute('aria-disabled', 'true');
  }
  document.querySelectorAll('[data-add-to-bag]').forEach(button => {
    button.disabled = !available;
    button.innerHTML = available ? `Add to bag ${icon('bag')}` : 'Currently unavailable';
  });
  document.querySelector('[data-quantity-step="-1"]').disabled = quantity() <= 1;
  document.querySelector('[data-quantity-step="1"]').disabled = quantity() >= 10;
};
on(form, 'change', event => {
  syncSelection();
  status.textContent = '';
  if (event.target.type === 'radio' && event.target.name !== 'texture') {
    const url = new URL(location.href);
    url.searchParams.set('variant', selected.id);
    history.replaceState(null, '', url);
  }
});
document.querySelectorAll('[data-quantity-step]').forEach(button => on(button, 'click', () => {
  quantityInput.value = Math.min(10, Math.max(1, quantity() + Number(button.dataset.quantityStep)));
  syncSelection();
}));
syncSelection();

on(document.querySelector('[data-buy-now]'), 'click', event => {
  if (textureInputs.value) return;
  event.preventDefault();
  status.textContent = 'Choose a texture before continuing to checkout.';
  form.querySelector('[name="texture"]').focus();
});

// Shopify publishes variant availability and current stock in its storefront.
// Keep the local purchase controls in sync when that source is reachable.
const refreshStock = async () => {
  const source = `https://alchemane.com/products/${product.handle}`;
  const [variantsResult, inventoryResult] = await Promise.allSettled([
    fetch(`${source}.js`, { signal: abort.signal, cache: 'no-store' }).then(response => { if (!response.ok) throw new Error('Variant availability unavailable'); return response.json(); }),
    fetch(`${source}?pb=0`, { signal: abort.signal, cache: 'no-store' }).then(response => { if (!response.ok) throw new Error('Inventory unavailable'); return response.text(); }),
  ]);
  if (abort.signal.aborted) return;
  if (variantsResult.status === 'fulfilled') variantsResult.value.variants?.forEach(variant => liveAvailability.set(String(variant.id), Boolean(variant.available)));
  if (inventoryResult.status === 'fulfilled') {
    const sourcePage = new DOMParser().parseFromString(inventoryResult.value, 'text/html');
    sourcePage.querySelectorAll('variant-inventory [data-variant-id][data-quantity]').forEach(node => {
      const count = Number.parseInt(node.dataset.quantity, 10);
      if (Number.isInteger(count)) stockCounts.set(node.dataset.variantId, count);
    });
  }
  stockChecked = true;
  syncSelection();
};
refreshStock();

// The bag is local to this preview. Texture travels to Shopify as a line item property.
const bagKey = 'alchemane-product-bag-v2';
let bag = [];
try {
  const stored = JSON.parse(localStorage.getItem(bagKey) || '[]');
  if (Array.isArray(stored)) bag = stored.filter(item => {
    const itemProduct = productPages[item.handle || product.handle];
    return itemProduct?.variants.some(v => v.id === item.id) && itemProduct.textures.includes(item.texture) && Number.isInteger(item.quantity) && item.quantity > 0;
  }).map(item => ({ handle: item.handle || product.handle, id: item.id, texture: item.texture, quantity: Math.min(10, item.quantity) }));
} catch { /* Private browsing or unavailable storage: in-memory bag still works. */ }
const bagDialog = document.querySelector('#bag-dialog');
const bagItems = document.querySelector('[data-bag-items]');
const bagSummary = document.querySelector('.pd-bag__summary');
const saveBag = () => { try { localStorage.setItem(bagKey, JSON.stringify(bag)); } catch { /* Keep the active bag in memory. */ } };
const renderBag = () => {
  document.querySelector('[data-bag-count]').textContent = bag.reduce((sum, item) => sum + item.quantity, 0);
  document.querySelector('.pd-bag-button').setAttribute('aria-label', `Open shopping bag, ${bag.reduce((sum, item) => sum + item.quantity, 0)} items`);
  bagSummary.hidden = !bag.length;
  if (!bag.length) { bagItems.innerHTML = '<div class="pd-bag__empty"><h3>Your bag is waiting.</h3><p>Choose your length, colour and texture to add a topper.</p></div>'; return; }
  let subtotal = 0;
  bagItems.innerHTML = bag.map(item => {
    const itemProduct = productPages[item.handle];
    const variant = itemProduct.variants.find(v => v.id === item.id);
    subtotal += variant.price * item.quantity;
    const key = `${item.id}-${item.texture}`;
    return `<article class="pd-bag__item"><img src="${e(itemProduct.gallery[0].display || `/assets/products/${itemProduct.handle}/${itemProduct.gallery[0].file}.webp`)}" alt="" width="80" height="100"><div><h3>${e(itemProduct.name)}</h3><p>${e(itemProduct.base)} · ${e(variant.length)}</p><p>${e(variant.colour)} · ${e(item.texture)}</p><strong>${formatPrice(variant.price * item.quantity)}</strong><div class="pd-bag__item-controls"><div class="pd-quantity" role="group" aria-label="Quantity for ${e(variant.length)} ${e(variant.colour)} ${e(item.texture)}"><button type="button" data-bag-step="-1" data-key="${e(key)}" aria-label="Decrease quantity" ${item.quantity <= 1 ? 'disabled' : ''}>${icon('minus')}</button><span>${item.quantity}</span><button type="button" data-bag-step="1" data-key="${e(key)}" aria-label="Increase quantity" ${item.quantity >= 10 ? 'disabled' : ''}>${icon('plus')}</button></div><button class="pd-text-button" type="button" data-remove="${e(key)}">Remove</button></div></div></article>`;
  }).join('');
  document.querySelector('[data-bag-subtotal]').textContent = formatPrice(subtotal);
  document.querySelector('[data-checkout]').href = bag.length === 1 ? cartLink(bag[0].id, bag[0].quantity, bag[0].texture) : 'https://alchemane.com/cart';
};
const bagItemKey = item => `${item.id}-${item.texture}`;
on(bagItems, 'click', event => {
  const remove = event.target.closest('[data-remove]');
  const step = event.target.closest('[data-bag-step]');
  let focusId;
  if (remove) { bag = bag.filter(item => bagItemKey(item) !== remove.dataset.remove); }
  else if (step) {
    const item = bag.find(item => bagItemKey(item) === step.dataset.key);
    item.quantity = Math.min(10, Math.max(1, item.quantity + Number(step.dataset.bagStep)));
    focusId = bagItemKey(item);
  } else return;
  saveBag(); renderBag();
  document.querySelector('[data-bag-message]').textContent = remove ? 'Item removed from your bag.' : 'Quantity updated.';
  const restoreTarget = focusId ? [...bagItems.querySelectorAll('[data-bag-step]')].find(button => button.dataset.key === focusId && button.dataset.bagStep === step.dataset.bagStep && !button.disabled) : null;
  (restoreTarget || bagDialog.querySelector('[data-close]')).focus();
});
on(form, 'submit', event => {
  event.preventDefault();
  if (!selected || !(liveAvailability.get(selected.id) ?? selected.available)) return;
  if (!textureInputs.value) {
    status.textContent = 'Choose a texture before adding this topper to your bag.';
    form.querySelector('[name="texture"]').focus();
    return;
  }
  const existing = bag.find(item => item.id === selected.id && item.texture === textureInputs.value);
  if (existing && existing.quantity + quantity() > 10) {
    status.textContent = 'You already have this option in your bag. You can order up to 10 of each option, or contact us for a larger order.';
    return;
  }
  if (existing) existing.quantity += quantity();
  else bag.push({ handle: product.handle, id: selected.id, texture: textureInputs.value, quantity: quantity() });
  saveBag(); renderBag();
  document.querySelector('[data-bag-message]').textContent = `${quantity()} ${quantity() === 1 ? 'item' : 'items'} added to your bag.`;
  openDialog(bagDialog);
});
renderBag();
on(document.querySelector('[data-checkout]'), 'click', event => {
  if (bag.length < 2) return;
  event.preventDefault();
  const checkoutForm = document.createElement('form');
  checkoutForm.action = 'https://alchemane.com/cart/add';
  checkoutForm.method = 'post';
  checkoutForm.hidden = true;
  const addField = (name, value) => {
    const input = document.createElement('input');
    input.type = 'hidden';
    input.name = name;
    input.value = value;
    checkoutForm.append(input);
  };
  bag.forEach((item, index) => {
    addField(`items[${index}][id]`, item.id);
    addField(`items[${index}][quantity]`, item.quantity);
    addField(`items[${index}][properties][Texture]`, item.texture);
  });
  addField('return_to', '/checkout');
  document.body.append(checkoutForm);
  checkoutForm.submit();
});
document.querySelectorAll('[data-open]').forEach(button => on(button, 'click', () => {
  if (button.dataset.open === 'bag-dialog') document.querySelector('[data-bag-message]').textContent = '';
  openDialog(document.getElementById(button.dataset.open));
}));

// Only show the mobile bar after the primary purchase controls have been passed.
const stickyBar = document.querySelector('.pd-mobile-purchase');
const purchase = document.querySelector('#purchase-actions');
const consultation = document.querySelector('#consultation');
document.querySelectorAll('a[href="#consultation"]').forEach(link => on(link, 'click', event => {
  event.preventDefault();
  consultation.focus({ preventScroll: true });
  consultation.scrollIntoView({ behavior: motion(), block: 'start' });
}));
let stickyFrame;
const syncStickyBar = () => {
  const consultationBounds = consultation.getBoundingClientRect();
  const headerHeight = header.getBoundingClientRect().height;
  const isConsulting = (consultationBounds.top < innerHeight && consultationBounds.bottom > headerHeight) || consultation.contains(document.activeElement);
  const hidden = isConsulting || purchase.getBoundingClientRect().bottom > headerHeight;
  if (stickyBar.hidden !== hidden) stickyBar.hidden = hidden;
};
on(window, 'scroll', () => {
  cancelAnimationFrame(stickyFrame);
  stickyFrame = requestAnimationFrame(syncStickyBar);
}, { passive: true });
on(window, 'resize', syncStickyBar);
on(consultation, 'focusin', syncStickyBar);
on(consultation, 'focusout', () => { stickyFrame = requestAnimationFrame(syncStickyBar); });
syncStickyBar();

if (import.meta.hot) import.meta.hot.dispose(() => { abort.abort(); stopReviews(); galleryResize.disconnect(); clearTimeout(differenceTimer); cancelAnimationFrame(scrollFrame); cancelAnimationFrame(stickyFrame); });
