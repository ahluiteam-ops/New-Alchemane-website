import { productPages, formatPrice } from './product-content.js';
import { products } from '../sections/catalogue-products.js';
import { topperVideos } from './topper-videos.js';

export const escapeHtml = value => String(value).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const e = escapeHtml;
const paths = {
  arrow: '<path d="M5 12h14m-6-6 6 6-6 6"/>',
  left: '<path d="m14 6-6 6 6 6"/>',
  right: '<path d="m10 6 6 6-6 6"/>',
  close: '<path d="m6 6 12 12M6 18 18 6"/>',
  plus: '<path d="M5 12h14M12 5v14"/>',
  minus: '<path d="M5 12h14"/>',
  bag: '<path d="M5 7h14l1 14H4L5 7Zm3 0V6a4 4 0 0 1 8 0v1"/>',
  card: '<rect x="3" y="5" width="18" height="14" rx="2"/><path d="M3 10h18M7 15h4"/>',
  zoom: '<circle cx="10.5" cy="10.5" r="6.5"/><path d="m16 16 5 5M8 10.5h5M10.5 8v5"/>',
  check: '<path d="m5 12 4 4L19 6"/>',
  truck: '<path d="M3 6h11v12H3zM14 10h4l3 4v4h-7"/><circle cx="7" cy="18" r="2"/><circle cx="17" cy="18" r="2"/>',
  chat: '<path d="M21 11.5a8.5 8.5 0 0 1-8.5 8.5H4l-2 2v-9.5A8.5 8.5 0 0 1 10.5 4H13a8 8 0 0 1 8 7.5Z"/><path d="M7 11h9M7 15h6"/>',
  ruler: '<path d="m3 15 12-12 6 6L9 21l-6-6Zm5-5 3 3m1-7 3 3M5 13l3 3"/>',
  fileText: '<path d="M6 3h8l4 4v14H6a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2Zm8 0v5h5M8 12h8M8 16h6"/>',
  sliders: '<path d="M4 7h8m4 0h4M4 17h4m4 0h8"/><circle cx="14" cy="7" r="2"/><circle cx="10" cy="17" r="2"/>',
  circleHelp: '<circle cx="12" cy="12" r="9"/><path d="M9.5 9a2.5 2.5 0 1 1 4.3 1.7c-.8.7-1.8 1.1-1.8 2.8M12 17h.01"/>',
  archive: '<path d="M4 4h16v4H4zM6 8v12h12V8M10 12h4"/>',
  menu: '<path d="M4 6h16M4 12h16M4 18h16"/>',
};
export const icon = name => `<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">${paths[name]}</svg>`;
const detailIcons = {
  Description: 'fileText',
  'Need Customization?': 'sliders',
  'Shipping & Return': 'truck',
  'Is this topper right for me?': 'circleHelp',
  'Care & storage': 'archive',
};
const dialogHeader = (title, id) => `<div class="pd-dialog__head"><h2 id="${id}">${title}</h2><button class="pd-icon-button" type="button" data-close aria-label="Close dialog">${icon('close')}</button></div>`;

export function renderProductPage(handle) {
  const product = productPages[handle];
  if (!product) throw new Error(`No product page content for ${handle}`);
  const initial = product.variants[0];
  const directory = `/assets/products/${handle}`;
  const enquiry = `https://wa.me/919967123333?text=${encodeURIComponent(`Hello Alchemane, I would like help choosing the size and colour for ${product.name}.`)}`;
  const gallery = product.gallery.map(image => ({ ...image, src: `${directory}/${image.file}.webp`, thumb: `${directory}/${image.file}-thumb.webp` }));
  const related = product.related.map(id => products.find(p => p.handle === id)).filter(Boolean);
  const relatedImage = item => item.image || (item.handle === 'skin-topper-5x6' ? '/assets/range/skin-topper-5x6-a.webp' : '');
  const relatedHref = item => `https://wa.me/919967123333?text=${encodeURIComponent(`Hello Alchemane, I would like to know more about ${item.name}. Please share the price, available options and fitting details.`)}`;
  const recommendations = (product.recommendations || []).map(({ handle: id, label }) => ({ ...products.find(p => p.handle === id), label })).filter(item => item.handle && item.image && item.price);
  const productVideos = product.category === 'Hair Toppers' ? topperVideos : [];
  const productVideoPicker = productVideos.length ? `
              <section class="pd-product-videos" aria-label="Watch the topper in motion" data-product-videos>
                <div class="pd-product-videos__choices" role="group" aria-label="Choose a topper video">
                  ${productVideos.map((video, index) => `<button class="pd-product-videos__choice" type="button" data-product-video-select="${index}" aria-label="Watch ${e(video.title)}"><span class="pd-product-videos__circle"><video muted loop playsinline autoplay preload="none" poster="/assets/topper-consultation/${video.file}.webp" data-preview-src="/assets/topper-consultation/${video.file}.mp4" aria-hidden="true" tabindex="-1"></video></span><span class="pd-product-videos__title" aria-hidden="true">${e(video.title)}</span></button>`).join('')}
                </div>
              </section>` : '';
  const productVideoDialog = productVideos.length ? `
    <dialog class="pd-product-video-dialog" id="product-video-dialog" aria-label="Topper videos">
      <div class="pd-product-video-dialog__stage">
        <button class="pd-product-video-dialog__arrow pd-product-video-dialog__arrow--previous" type="button" data-product-video-direction="-1" aria-label="Previous topper video">${icon('left')}</button>
        <button class="pd-product-video-dialog__preview pd-product-video-dialog__preview--previous" type="button" data-product-video-direction="-1" aria-label="View ${e(productVideos.at(-1).title)}"><img src="/assets/topper-consultation/${productVideos.at(-1).file}.webp" alt="" width="240" height="420" data-product-video-previous></button>
        <div class="pd-product-video-dialog__center">
          <div class="pd-product-video-dialog__current">
            <video data-product-video-player controls playsinline preload="none" poster="/assets/topper-consultation/${productVideos[0].file}.webp"></video>
            <button class="pd-product-video-dialog__close" type="button" data-close aria-label="Close topper video">${icon('close')}</button>
          </div>
          <p class="pd-product-video-dialog__title" data-product-video-title>${e(productVideos[0].title)}</p>
        </div>
        <button class="pd-product-video-dialog__preview pd-product-video-dialog__preview--next" type="button" data-product-video-direction="1" aria-label="View ${e(productVideos[1].title)}"><img src="/assets/topper-consultation/${productVideos[1].file}.webp" alt="" width="240" height="420" data-product-video-next></button>
        <button class="pd-product-video-dialog__arrow pd-product-video-dialog__arrow--next" type="button" data-product-video-direction="1" aria-label="Next topper video">${icon('right')}</button>
      </div>
      <p class="pd-sr-only" data-product-video-status aria-live="polite"></p>
    </dialog>` : '';
  const consultationOffer = product.category === 'Hair Toppers' ? `
      <section class="pd-consult-offer pd-section" id="consultation-options" aria-labelledby="consultation-options-title">
        <div class="pd-wrap">
          <div class="pd-consult-offer__intro">
            <div class="pd-consult-offer__copy">
              <h2 id="consultation-options-title"><span>Prefer a consultation</span> <span>before you buy?</span></h2>
              <p>Choose a private video call from anywhere, or meet our team at the Khar West studio in Mumbai.</p>
            </div>
            <div class="pd-consult-offer__choice" role="group" aria-labelledby="consultation-offer-meet-label" data-product-consultation-choice>
              <p class="consultation-meet__label" id="consultation-offer-meet-label">How would you like to meet?</p>
              <div class="consultation-meet__options">
                <button type="button" data-product-consultation-mode="Online" aria-pressed="false">Online</button>
                <button type="button" data-product-consultation-mode="Khar West studio" aria-pressed="true">Offline</button>
              </div>
              <p class="consultation-meet__note" data-product-consultation-note aria-live="polite"><strong>In-person</strong><span>At our Khar West studio, Mumbai.</span></p>
              <a class="pd-button" href="#consultation" data-product-consultation-cta>Book an offline consultation</a>
            </div>
          </div>
        </div>
      </section>` : '';
  return `
    <a class="pd-skip" href="#main">Skip to product</a>
    <header class="pd-header">
      <div class="pd-wrap pd-header__inner">
        <a class="pd-brand" href="/" aria-label="Alchemane home"><img src="/icons/new%20logo.svg" width="160" height="40" alt=""></a>
        <nav class="pd-nav" id="product-navigation" aria-label="Main navigation"><a href="/">Home</a><a href="/permanent-extensions.html">Permanent Extensions</a><a href="/toppers.html">Hair Toppers</a><a href="/wigs.html">Wigs</a><a href="/consultation.html">Book A Consultation</a></nav>
        <div class="pd-header__actions"><a class="pd-header__help" href="#consultation">Book a consultation</a><button class="pd-icon-button pd-bag-button" type="button" data-open="bag-dialog" aria-label="Open shopping bag">${icon('bag')}<span data-bag-count>0</span></button><button class="pd-icon-button pd-menu" type="button" aria-label="Open navigation" aria-expanded="false" aria-controls="product-navigation">${icon('menu')}</button></div>
      </div>
    </header>
    <main id="main" class="pd-main">
      <div class="pd-wrap">
        <nav class="pd-breadcrumb" aria-label="Breadcrumb"><a href="/">Home</a>${icon('right')}<a href="${e(product.categoryUrl)}">${e(product.category)}</a>${icon('right')}<span aria-current="page">${e(product.name)}</span></nav>
        <section class="pd-product" aria-labelledby="product-title">
          <div class="pd-gallery" aria-label="Product photographs">
            <div class="pd-gallery__stage">
              <div class="pd-gallery__track" id="product-gallery" tabindex="0" aria-label="Product gallery; use arrow keys to browse">
                ${gallery.map((image, i) => `<figure class="pd-gallery__slide"><button type="button" data-zoom="${i}" aria-label="Enlarge image ${i + 1}: ${e(image.caption)}"><img src="${e(image.display || image.src)}" alt="${e(image.alt)}" width="${i === 0 ? 720 : 1080}" height="${i === 0 ? 900 : 1920}" ${i === 0 ? 'fetchpriority="high"' : 'loading="lazy"'} decoding="async"></button></figure>`).join('')}
              </div>
              <button class="pd-icon-button pd-gallery__zoom" type="button" data-zoom-current aria-label="Enlarge current product image">${icon('zoom')}</button>
              <div class="pd-gallery__controls"><button class="pd-icon-button" type="button" data-gallery-step="-1" aria-label="Previous product image" aria-controls="product-gallery">${icon('left')}</button><span data-gallery-count aria-live="polite" aria-atomic="true">1 / ${gallery.length}</span><button class="pd-icon-button" type="button" data-gallery-step="1" aria-label="Next product image" aria-controls="product-gallery">${icon('right')}</button></div>
            </div>
            <div class="pd-thumbnails" aria-label="Choose a product image">${gallery.map((image, i) => `<button type="button" data-thumbnail="${i}" aria-label="View image ${i + 1}: ${e(image.caption)}" aria-pressed="${i === 0}"><img src="${image.thumb}" alt="" width="90" height="120" loading="lazy"></button>`).join('')}</div>
            <p class="pd-sr-only" data-gallery-caption aria-live="polite">${e(gallery[0].caption)}</p>
          </div>
          <div class="pd-summary">
            <h1 id="product-title">${e(product.name)}</h1>
            <a class="pd-product-rating" href="#customer-reviews" data-product-rating hidden><span data-product-rating-stars aria-hidden="true"></span><strong data-product-rating-average></strong><span data-product-rating-count></span><span class="pd-sr-only">Read customer reviews</span></a>
            <p class="pd-lede">${e(product.description)}</p>
            <div class="pd-pricing" aria-live="polite" aria-atomic="true"><strong data-price>${formatPrice(initial.price)}</strong><span>Includes 18% GST</span></div>
            <p class="pd-payment">${icon('card')} Payment is being set up</p>
            <form id="product-form">
              <input type="hidden" name="id" value="${initial.id}">
              <button class="pd-size-card" type="button" data-open="size-guide" aria-haspopup="dialog"><span class="pd-size-card__icon">${icon('ruler')}</span><span class="pd-size-card__copy"><strong>Size guide</strong><span>${e(product.base)} silk base · check your fit</span></span><span class="pd-size-card__chevron">${icon('right')}</span></button>
              <fieldset class="pd-options"><legend>Hair length <span data-length-label hidden>${e(initial.length)}</span></legend><div class="pd-lengths">${product.lengths.map((length, i) => `<label class="pd-choice"><input type="radio" name="length" value="${e(length)}" ${i === 0 ? 'checked' : ''}><span>${e(length)}</span></label>`).join('')}</div></fieldset>
              <fieldset class="pd-options"><legend>Colour <span data-colour-label hidden>${e(initial.colour)}</span></legend><div class="pd-colours">${product.colours.map((colour, i) => `<label class="pd-colour"><input type="radio" name="colour" value="${e(colour.name)}" ${i === 0 ? 'checked' : ''}><span class="pd-swatch pd-swatch--${colour.swatch}">${icon('check')}</span><span>${e(colour.name)}</span></label>`).join('')}</div></fieldset>
              <fieldset class="pd-options pd-texture-options"><legend>Texture <span data-texture-label hidden>Choose a texture</span></legend><div class="pd-textures">${product.textures.map(texture => `<label class="pd-choice"><input type="radio" name="texture" value="${e(texture)}"><span>${e(texture)}</span></label>`).join('')}</div></fieldset>
              <p class="pd-stock" role="status" data-stock>Choose your options</p>
              <div class="pd-purchase" id="purchase-actions">
                <div class="pd-buy-row"><div class="pd-quantity" role="group" aria-label="Quantity"><button type="button" data-quantity-step="-1" aria-label="Decrease quantity">${icon('minus')}</button><label class="pd-sr-only" for="product-quantity">Quantity</label><input id="product-quantity" type="number" name="quantity" min="1" max="10" value="1" inputmode="numeric"><button type="button" data-quantity-step="1" aria-label="Increase quantity">${icon('plus')}</button></div><button class="pd-button" type="submit" data-add-to-bag>Add to bag ${icon('bag')}</button></div>
                <a class="pd-button pd-button--secondary pd-buy-now" data-buy-now href="/checkout.html">Buy now ${icon('arrow')}</a>
                <p class="pd-form-status" role="status" data-product-status></p>
              </div>
            </form>
            ${productVideoPicker}
            <noscript><style>#product-form, .pd-bag-button, .pd-menu, .pd-gallery__zoom, .pd-gallery__controls, .pd-thumbnails, .pd-product-videos { display: none !important; }</style><p>Enable JavaScript to choose your length, colour and texture.</p></noscript>
            <p class="pd-delivery">${icon('truck')} Free shipping across India</p>
          </div>
        </section>
        <section class="pd-details" aria-labelledby="product-details-title">
          <h2 id="product-details-title">Product details</h2>
          <div class="pd-accordions">${product.details.map(detail => `<details><summary><span class="pd-accordion-label"><span class="pd-accordion-icon">${icon(detailIcons[detail.title] || 'fileText')}</span>${e(detail.title)}</span><span class="pd-accordion-toggle">${icon('plus')}</span></summary><div class="pd-accordion-body">${detail.html}</div></details>`).join('')}</div>
        </section>
      </div>
      ${product.differences?.length ? `<section class="pd-difference pd-section" id="difference" aria-labelledby="difference-title"><div class="pd-wrap"><h2 id="difference-title">See the difference</h2><div class="pd-difference__layout" role="region" aria-roledescription="carousel" aria-label="Hair topper client transformations"><div class="pd-difference__frame"><div class="pd-difference__slides" id="difference-slides">${product.differences.map(item => `<figure class="pd-difference__slide"><img src="${e(item.image)}" alt="${e(item.alt)}" width="1440" height="1080" loading="lazy" decoding="async"></figure>`).join('')}</div></div><div class="pd-difference__footer"><span class="pd-sr-only" data-difference-status aria-live="polite">Showing transformation 1 of ${product.differences.length}</span><div class="pd-difference__controls" role="group" aria-label="Browse transformations"><button class="pd-icon-button" type="button" aria-label="Previous transformation" aria-controls="difference-slides" data-difference-direction="-1">${icon('left')}</button><button class="pd-icon-button" type="button" aria-label="Next transformation" aria-controls="difference-slides" data-difference-direction="1">${icon('right')}</button></div></div></div></div></section>` : ''}
      ${consultationOffer}
      <section class="pd-section pd-related" aria-labelledby="related-title"><div class="pd-wrap"><header class="pd-section-heading"><h2 id="related-title">Explore other toppers</h2></header><div class="pd-related__grid">${related.map(item => { const image = relatedImage(item); return `<a class="pd-related__card" href="${e(relatedHref(item))}" target="_blank" rel="noopener noreferrer"><div class="pd-related__media${image ? '' : ' is-placeholder'}">${image ? `<img src="${e(image)}" alt="${e(item.alt || item.name)}" width="720" height="900" loading="lazy" decoding="async">` : `<span class="pd-related__placeholder"><small>New addition</small><span>Product image coming soon</span></span>`}${icon('arrow')}</div><h3>${e(item.name)}</h3><p>${e(item.description)}</p><strong>${item.price === null ? 'Enquire for price' : `From ${formatPrice(item.price)}`}</strong></a>`; }).join('')}</div></div></section>
      <section class="faq-section faq-section--tabs pd-faq" id="faq" aria-labelledby="faq-title"><div class="faq-section__inner"><header class="faq-intro"><h2 id="faq-title">Frequently asked questions</h2></header><div class="faq-panels"><div class="faq-panel"><div class="faq-list">${product.faqs.map((faq, i) => `<details${i === 0 ? ' open' : ''}><summary>${e(faq.question)}<i aria-hidden="true">+</i></summary><p>${e(faq.answer)}</p></details>`).join('')}</div></div></div><aside class="faq-support" aria-labelledby="faq-support-title"><div><h3 id="faq-support-title">Still have questions?</h3><p>Tell us what you need help with. Our hair experts will guide you on fit, size and shade.</p></div><a href="${e(enquiry)}" class="faq-support__link" target="_blank" rel="noopener noreferrer">Talk to our team <span aria-hidden="true">↗</span></a></aside></div></section>
      ${product.reviews ? `<section class="pd-reviews pd-section" id="customer-reviews" aria-labelledby="reviews-title"><div class="pd-wrap"><h2 id="reviews-title">Customer Reviews</h2><div data-review-content hidden><div class="pd-reviews__summary"><div class="pd-reviews__rating"><strong data-review-average></strong><div data-review-stars></div><span data-review-count></span></div><div class="pd-reviews__breakdown" data-review-breakdown role="group" aria-label="Filter reviews by star rating"></div><div class="pd-reviews__photos" data-review-photos aria-label="Customer review photos"></div></div><div class="pd-reviews__results"><p data-review-results></p><button type="button" data-review-clear hidden>Show all reviews</button></div><div class="pd-reviews__grid" data-review-list></div><div class="pd-reviews__actions"><button class="pd-reviews__show-less" type="button" data-review-show-less hidden>Show less</button><button class="pd-reviews__show-more" type="button" data-review-show-more>Show more</button></div></div><p class="pd-reviews__loading" data-review-loading role="status">Loading customer reviews…</p><p class="pd-reviews__error" data-review-error hidden>Reviews are unavailable right now.</p><p class="pd-sr-only" data-review-announcement role="status" aria-live="polite"></p><noscript><style>#customer-reviews [data-review-loading]{display:none}</style><p>Customer reviews need JavaScript to load.</p></noscript></div></section>` : ''}
      <section class="pd-consult pd-section" id="consultation" tabindex="-1" aria-labelledby="consult-title" data-consultation-fee="299">
        <div class="pd-wrap pd-consult__layout">
          <div class="pd-consult__copy">
            <h2 id="consult-title">Book your consultation.</h2>
            <p>Paid and refundable. Always private, always handled with care.</p>
            <a class="pd-consult__help" href="tel:+919967123333">Prefer to call us? +91 99671 23333</a>
          </div>
          <form class="pd-consult__form" id="topper-consultation-form" hidden>
            <input type="hidden" name="product" value="${e(product.name)}">
            <input type="hidden" name="selection" value="${e(product.base)} / ${e(initial.length)} / ${e(initial.colour)}">
            <p class="pd-consult__error" id="booking-errors" role="alert" tabindex="-1" hidden></p>
            <div class="pd-consult__row">
              <div class="pd-consult__field"><label for="booking-name">Your name</label><input id="booking-name" name="name" autocomplete="name" placeholder="Full name" required maxlength="80" aria-describedby="booking-name-error"><small class="pd-consult__field-error" id="booking-name-error" hidden>Enter your name.</small></div>
              <div class="pd-consult__field"><label for="booking-phone">Phone number</label><input id="booking-phone" name="phone" type="tel" inputmode="tel" autocomplete="tel" placeholder="+91" required maxlength="20" aria-describedby="booking-phone-error"><small class="pd-consult__field-error" id="booking-phone-error" hidden>Enter a valid phone number with 7–15 digits.</small></div>
            </div>
            <div class="pd-consult__row">
              <div class="pd-consult__field"><label for="booking-city">Your city <em>(optional)</em></label><input id="booking-city" name="city" autocomplete="address-level2" placeholder="City" maxlength="80"></div>
            </div>
            <div class="consultation-meet" role="group" aria-labelledby="product-meet-label" data-consultation-meet>
              <p class="consultation-meet__label" id="product-meet-label">How would you like to meet?</p>
              <div class="consultation-meet__options">
                <button type="button" data-meet-option="Online" aria-pressed="false">Online</button>
                <button type="button" data-meet-option="Khar West studio" aria-pressed="true">Offline</button>
              </div>
              <p class="consultation-meet__note" data-meet-note aria-live="polite">In-person at our Khar West studio, Mumbai.</p>
              <input type="hidden" name="meeting" value="Khar West studio">
            </div>
            <button class="pd-button consultation-submit" type="submit">Book now — ₹299</button>
            <p class="pd-consult__note">We’ll confirm your slot and payment details on WhatsApp.</p>
            <p class="pd-consult__status" id="booking-status" role="status" hidden>WhatsApp opened with your request. Didn’t open? <a id="booking-message" target="_blank" rel="noopener noreferrer">Send it here</a>.</p>
          </form>
          <noscript><p>To arrange your ₹299 consultation, <a href="${e(enquiry)}" target="_blank" rel="noopener noreferrer">message our team on WhatsApp</a> or call <a href="tel:+919967123333">+91 99671 23333</a>.</p></noscript>
        </div>
      </section>
      ${recommendations.length ? `<section class="pd-section pd-may-like" aria-labelledby="may-like-title"><div class="pd-wrap"><header class="pd-section-heading"><div><h2 id="may-like-title">You May Also Like</h2><p class="pd-section-intro">Other ways to add coverage, length and volume.</p></div></header><div class="pd-may-like__grid">${recommendations.map(item => `<a class="pd-may-like__card" href="${e(relatedHref(item))}" target="_blank" rel="noopener noreferrer"><div class="pd-may-like__image"><img src="${e(item.image)}" alt="${e(item.alt)}" width="720" height="900" loading="lazy" decoding="async">${icon('arrow')}</div><div class="pd-may-like__copy"><span>${e(item.label)}</span><h3>${e(item.name)}</h3><p>${item.ranged ? 'From ' : ''}${formatPrice(item.price)}</p></div></a>`).join('')}</div></div></section>` : ''}
    </main>
    <footer class="site-footer" aria-label="Footer"><div class="footer-main"><div class="footer-brand-column"><a class="footer-brand" href="/" aria-label="Alchemane home"><img class="footer-logo" src="/icons/new%20logo.svg" alt="" width="160" height="40"></a><address class="footer-address">4th floor Empressa Building, 2nd Rd, Khar, Ram Krishna Nagar, Khar West, Mumbai, Maharashtra 400052.</address></div><nav class="footer-nav-column" aria-label="Hair solutions"><p class="footer-title">Solutions</p><a href="/permanent-extensions.html">Permanent Extensions</a><a href="/wigs.html">Hair Wigs</a><a href="/toppers.html">Hair Toppers</a></nav><nav class="footer-nav-column" aria-label="Shopping information"><p class="footer-title">Shopping information</p><a href="/pages/shipping-delivery">Shipping & delivery</a><a href="/pages/returns-and-exchanges">Returns & exchanges</a><a href="/pages/privacy-policy">Privacy policy</a><a href="/pages/terms-of-service">Terms of service</a></nav><div class="footer-contact-column"><p class="footer-title">Here to help</p><a class="footer-contact-link" href="tel:+919967123333">+91 99671 23333</a><a class="footer-contact-link" href="mailto:info@alchemane.com">info@alchemane.com</a><a class="footer-contact-link" href="${e(enquiry)}" target="_blank" rel="noopener noreferrer">WhatsApp us ${icon('arrow')}</a></div></div><div class="footer-bottom"><span class="footer-copyright">&copy; <span data-year>2026</span> Alchemane Hair Extensions</span><a class="footer-back-to-top" href="#top">Back to top</a></div></footer>
    <div class="pd-mobile-purchase" hidden><a href="#product-form" aria-label="Review your product selection"><strong data-sticky-price>${formatPrice(initial.price)}</strong><span data-sticky-selection>14″ · Natural Black</span><span>Includes 18% GST</span></a><button class="pd-button" type="submit" form="product-form" data-add-to-bag>Add to bag ${icon('bag')}</button></div>
    <dialog class="pd-dialog pd-size-guide" id="size-guide" aria-labelledby="size-title">${dialogHeader('Find your base size', 'size-title')}<div class="pd-dialog__body"><p>A comfortable fit starts with the area you want to cover.</p><div class="pd-measure"><div class="pd-measure__base"><span>${e(product.base)}</span></div><span>Base dimensions · diagram not to scale</span></div><ol><li>Measure your thinning area from front to back.</li><li>Measure the widest point from side to side.</li><li>Check that the clips will sit on surrounding hair with a comfortable hold.</li></ol><p>A bigger base may be needed if your thinning area extends beyond this size. If your roots are fragile, ask us about attachment comfort first.</p><a class="pd-button" href="${e(enquiry)}" target="_blank" rel="noopener noreferrer">Help me choose ${icon('chat')}</a></div></dialog>
    <dialog class="pd-dialog pd-lightbox" id="image-dialog" aria-labelledby="image-title"><div class="pd-dialog__head"><h2 class="pd-sr-only" id="image-title">Product image</h2><span data-zoom-count>1 / ${gallery.length}</span><button class="pd-icon-button" type="button" data-close aria-label="Close enlarged image">${icon('close')}</button></div><div class="pd-lightbox__image"><img src="${gallery[0].src}" alt="${e(gallery[0].alt)}" width="1080" height="1920" data-zoom-image></div><div class="pd-lightbox__footer"><button class="pd-icon-button" type="button" data-zoom-step="-1" aria-label="Previous enlarged image">${icon('left')}</button><p data-zoom-caption>${e(gallery[0].caption)}</p><button class="pd-icon-button" type="button" data-zoom-step="1" aria-label="Next enlarged image">${icon('right')}</button></div></dialog>
    <dialog class="pd-dialog pd-bag" id="bag-dialog" aria-labelledby="bag-title">${dialogHeader('Your bag', 'bag-title')}<div class="pd-dialog__body"><p class="pd-bag__confirmation" role="status" data-bag-message></p><div data-bag-items></div><div class="pd-bag__summary" hidden><div><span>Subtotal</span><strong data-bag-subtotal></strong></div><p>Includes 18% GST. International delivery needs a quote.</p><a class="pd-button" data-checkout>Continue to checkout ${icon('arrow')}</a><p class="pd-purchase-note">Payment is being set up.</p></div><button class="pd-text-button" type="button" data-close>Continue shopping ${icon('arrow')}</button></div></dialog>
    ${productVideoDialog}
    <script id="product-data" type="application/json">${JSON.stringify({ ...product, gallery }).replace(/</g, '\\u003c')}</script>
  `;
}
