import { escapeHtml as e } from './render-product.js';

const star = '<svg viewBox="0 0 20 20" aria-hidden="true" focusable="false"><path d="m10 1.6 2.57 5.2 5.74.84-4.15 4.04.98 5.72L10 14.7l-5.14 2.7.98-5.72L1.7 7.64l5.74-.84L10 1.6Z"/></svg>';
const stars = (rating, label) => `<span class="pd-review-stars" role="img" aria-label="${e(label)}">${Array.from({ length: 5 }, (_, index) => {
  const fill = Math.max(0, Math.min(1, rating - index));
  return `<span class="pd-review-star" style="--star-clip:${Math.round((1 - fill) * 100)}%">${star}<span class="pd-review-star__fill">${star}</span></span>`;
}).join('')}</span>`;
const safePhoto = value => {
  try {
    const url = new URL(value);
    return url.protocol === 'https:' && url.hostname === 'img.trustoo.io' ? url.href : '';
  } catch { return ''; }
};

export function initProductReviews(config) {
  const root = document.querySelector('#customer-reviews');
  if (!root || !config) return () => {};
  const controller = new AbortController();
  const { signal } = controller;
  const content = root.querySelector('[data-review-content]');
  const loading = root.querySelector('[data-review-loading]');
  const error = root.querySelector('[data-review-error]');
  const list = root.querySelector('[data-review-list]');
  const showMore = root.querySelector('[data-review-show-more]');
  const showLess = root.querySelector('[data-review-show-less]');
  const actions = root.querySelector('.pd-reviews__actions');
  const breakdown = root.querySelector('[data-review-breakdown]');
  const announcement = root.querySelector('[data-review-announcement]');
  const clear = root.querySelector('[data-review-clear]');
  let reviews = [];
  let filter = 0;
  let visibleCount = 4;
  const expanded = new Set();
  const batchSize = 4;

  const fetchPage = async number => {
    const query = new URLSearchParams({
      shop_id: config.shopId,
      product_id: config.productId,
      limit: '100',
      page: String(number),
      sort_by: 'commented-at-descending',
      lang: 'en',
    });
    const response = await fetch(`https://api.trustoo.io/api/v1/reviews/get_product_reviews?${query}`, { signal, credentials: 'omit' });
    if (!response.ok) throw new Error(`Reviews returned ${response.status}`);
    const result = await response.json();
    if (result.code !== 0 || !Array.isArray(result.data?.list)) throw new Error('Invalid review response');
    return result.data;
  };

  const card = review => {
    const author = String(review.author || 'Alchemane customer').trim();
    const body = String(review.content || '').trim();
    const rating = Math.max(1, Math.min(5, Number(review.star) || 1));
    const initials = author.split(/\s+/).slice(0, 2).map(part => part[0]).join('').toUpperCase();
    const photo = safePhoto(review.resources?.[0]?.src);
    const thumbnail = safePhoto(review.resources?.[0]?.thumb_src) || photo;
    const isLong = body.length > 190;
    const isExpanded = expanded.has(review.id);
    const cut = body.lastIndexOf(' ', 187);
    const shown = isLong && !isExpanded ? `${body.slice(0, cut > 130 ? cut : 187)}…` : body;
    return `<article class="pd-review" data-review-id="${e(review.id)}">
      ${photo ? `<a class="pd-review__photo" href="${e(photo)}" target="_blank" rel="noopener noreferrer" aria-label="Open customer photo from ${e(author)} in a new tab"><img src="${e(thumbnail)}" alt="" loading="lazy" decoding="async"></a>` : ''}
      <div class="pd-review__body">${stars(rating, `${rating} out of 5 stars`)}<div class="pd-review__author"><span class="pd-review__initial" aria-hidden="true">${e(initials)}</span><strong>${e(author)}</strong></div><p>${e(shown)}</p>${isLong ? `<button class="pd-review__more" type="button" data-review-more="${e(review.id)}" aria-expanded="${isExpanded}">${isExpanded ? 'Show less' : 'Show full review'}</button>` : ''}</div>
    </article>`;
  };

  const render = () => {
    const filtered = filter ? reviews.filter(review => Number(review.star) === filter) : reviews;
    visibleCount = Math.min(visibleCount, filtered.length);
    const shown = filtered.slice(0, visibleCount);
    list.innerHTML = shown.map(card).join('');
    root.querySelector('[data-review-results]').textContent = filter
      ? `Showing ${shown.length} of ${filtered.length} ${filter}-star ${filtered.length === 1 ? 'review' : 'reviews'}`
      : `Showing ${shown.length} of ${reviews.length} product reviews`;
    clear.hidden = !filter;
    breakdown.querySelectorAll('[data-review-filter]').forEach(button => button.setAttribute('aria-pressed', String(Number(button.dataset.reviewFilter) === filter)));
    showMore.hidden = shown.length >= filtered.length;
    showLess.hidden = shown.length <= batchSize;
    actions.hidden = showMore.hidden && showLess.hidden;
    announcement.textContent = `Showing ${shown.length} of ${filtered.length} ${filter ? `${filter}-star ` : ''}reviews`;
  };

  root.addEventListener('click', event => {
    const filterButton = event.target.closest('[data-review-filter]');
    const moreButton = event.target.closest('[data-review-more]');
    if (filterButton) {
      filter = Number(filterButton.dataset.reviewFilter) === filter ? 0 : Number(filterButton.dataset.reviewFilter);
      visibleCount = batchSize;
      render();
    } else if (event.target.closest('[data-review-clear]')) {
      filter = 0;
      visibleCount = batchSize;
      render();
      breakdown.querySelector('[data-review-filter]')?.focus();
    } else if (event.target.closest('[data-review-show-more]')) {
      visibleCount += batchSize;
      render();
      (showMore.hidden ? showLess : showMore).focus({ preventScroll: true });
    } else if (event.target.closest('[data-review-show-less]')) {
      visibleCount = Math.max(batchSize, visibleCount - batchSize);
      render();
      (showLess.hidden ? showMore : showLess).focus({ preventScroll: true });
    } else if (moreButton) {
      const id = Number(moreButton.dataset.reviewMore);
      if (expanded.has(id)) expanded.delete(id); else expanded.add(id);
      render();
      list.querySelector(`[data-review-more="${id}"]`)?.focus({ preventScroll: true });
    }
  }, { signal });

  (async () => {
    try {
      const first = await fetchPage(1);
      const rest = await Promise.all(Array.from({ length: Math.max(0, Number(first.page?.total_page || 1) - 1) }, (_, index) => fetchPage(index + 2)));
      reviews = [first, ...rest].flatMap(batch => batch.list).filter(review => review.content && review.author);
      if (!reviews.length) throw new Error('No product reviews');
      const counts = Array.from({ length: 6 }, () => 0);
      reviews.forEach(review => { const value = Number(review.star); if (value >= 1 && value <= 5) counts[value] += 1; });
      const average = reviews.reduce((sum, review) => sum + Number(review.star || 0), 0) / reviews.length;
      const displayAverage = (Math.floor(average * 10) / 10).toFixed(1);
      root.querySelector('[data-review-average]').textContent = displayAverage;
      root.querySelector('[data-review-stars]').innerHTML = stars(Number(displayAverage), `${displayAverage} out of 5 stars`);
      root.querySelector('[data-review-count]').textContent = `${reviews.length} reviews`;
      const productRating = document.querySelector('[data-product-rating]');
      if (productRating) {
        productRating.querySelector('[data-product-rating-stars]').innerHTML = stars(Number(displayAverage), `${displayAverage} out of 5 stars`);
        productRating.querySelector('[data-product-rating-average]').textContent = displayAverage;
        productRating.querySelector('[data-product-rating-count]').textContent = `${reviews.length} reviews`;
        productRating.setAttribute('aria-label', `Rated ${displayAverage} out of 5 from ${reviews.length} customer reviews. Read reviews.`);
        productRating.hidden = false;
      }
      breakdown.innerHTML = [5, 4, 3, 2, 1].map(value => `<button type="button" data-review-filter="${value}" aria-pressed="false" aria-label="Show ${value}-star reviews, ${counts[value]} ${counts[value] === 1 ? 'review' : 'reviews'}" ${counts[value] ? '' : 'disabled'}><span>${value} Star</span><span class="pd-reviews__bar" aria-hidden="true"><span style="width:${Math.round(counts[value] / reviews.length * 100)}%"></span></span><span>${counts[value]}</span></button>`).join('');
      const photos = reviews.flatMap(review => (review.resources || []).map(resource => ({ author: String(review.author).trim(), src: safePhoto(resource.src), thumb: safePhoto(resource.thumb_src) }))).filter(photo => photo.src).slice(0, 8);
      root.querySelector('[data-review-photos]').innerHTML = photos.map(photo => `<a href="${e(photo.src)}" target="_blank" rel="noopener noreferrer" aria-label="Open customer photo from ${e(photo.author)} in a new tab"><img src="${e(photo.thumb || photo.src)}" alt="" loading="lazy" decoding="async"></a>`).join('');
      render();
      loading.hidden = true;
      content.hidden = false;
      root.dataset.reviewState = 'ready';
    } catch (cause) {
      if (signal.aborted) return;
      loading.hidden = true;
      error.hidden = false;
      root.dataset.reviewState = 'error';
      console.error('Customer reviews could not load', cause);
    }
  })();

  return () => controller.abort();
}
