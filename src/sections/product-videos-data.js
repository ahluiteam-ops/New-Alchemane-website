import { products } from './catalogue-products.js';

// Only use footage that demonstrates the named product. Products without a
// matching film keep a blank frame until their own video is supplied.
export const productVideoMedia = {
  'silk-hair-toppers': { src: '/assets/product-videos/silk-hair-toppers.mp4', poster: '/assets/product-videos/silk-hair-toppers.webp' },
  'halo-hair-extensions': { src: '/assets/product-videos/halo-hair-extensions.mp4', poster: '/assets/product-videos/halo-hair-extensions.webp' },
  'fringe-with-sides': { src: '/assets/product-videos/fringe-with-sides.mp4', poster: '/assets/product-videos/fringe-with-sides.webp' },
  'one-set-clip-in-hair-extensions': { src: '/assets/product-videos/one-set-clip-in-hair-extensions.mp4', poster: '/assets/product-videos/one-set-clip-in-hair-extensions.webp' },
  'tape-hair-extensions': { src: '/assets/product-videos/tape-hair-extensions.mp4', poster: '/assets/product-videos/tape-hair-extensions.webp' },
  'u-shaped-extensions': { src: '/assets/product-videos/u-shaped-extensions.mp4', poster: '/assets/product-videos/u-shaped-extensions.webp' },
  'pony-tail-hair-extensions': { src: '/assets/product-videos/pony-tail-hair-extensions.mp4', poster: '/assets/product-videos/pony-tail-hair-extensions.webp' },
  scrunchies: { src: '/assets/product-videos/scrunchies.mp4', poster: '/assets/product-videos/scrunchies.webp' },
  'micro-ring-hair-extensions': { src: '/assets/permanent/method-micro-ring.mp4', poster: '/assets/permanent/method-micro-ring.webp' },
  'keratin-bond-hair-extensions': { src: '/assets/permanent/method-keratin.mp4', poster: '/assets/permanent/method-keratin.webp' },
};

const esc = value => String(value).replace(/[&<>"']/g, character => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[character]));

export function renderProductVideos() {
  const ordered = [...products.filter(product => productVideoMedia[product.handle]), ...products.filter(product => !productVideoMedia[product.handle])];
  return `<section class="voices product-videos" id="product-videos" aria-label="Product videos">
    <div class="section-wrap product-videos-heading">
      <div class="product-videos-intro"><h2>See it in action</h2><p>Explore the fit and finish of each hair solution.</p></div>
      <div class="voices-controls product-videos-controls" role="group" aria-label="Scroll product videos">
        <button type="button" data-voices-prev aria-label="Previous product videos" disabled><svg viewBox="0 0 24 24" aria-hidden="true"><path d="m15 5-7 7 7 7"/></svg></button>
        <button type="button" data-voices-next aria-label="Next product videos"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="m9 5 7 7-7 7"/></svg></button>
      </div>
    </div>
    <ul class="voices-track" role="list" tabindex="0" data-voices-track aria-label="All product videos">
      ${ordered.map((product, index) => {
        const film = productVideoMedia[product.handle];
        const name = esc(product.name);
        return `<li class="voice-card voice-card--product${index === 0 ? ' is-active' : ''}" data-product-handle="${product.handle}"${film ? ' data-voice' : ''}>
          <div class="voice-product-frame${film ? '' : ' voice-product-frame--empty'}"${film ? '' : ` role="img" aria-label="Video not yet available for ${name}"`}>
            ${film ? `<video preload="none" muted loop playsinline poster="${film.poster}" aria-label="${name}"><source src="${film.src}" type="video/mp4"><a href="${film.src}">Watch ${name}</a></video>
            <button type="button" class="voice-play" aria-label="Open ${name} video with sound"><span class="voice-badge" aria-hidden="true"><svg viewBox="0 0 32 32"><path d="M7.1244 4 28.1244 16.1244 7.1244 28.2487Z"/></svg></span></button>` : ''}
          </div>
          <p class="voice-product-name" title="${name}">${name}</p>
        </li>`;
      }).join('\n      ')}
    </ul>
  </section>`;
}
