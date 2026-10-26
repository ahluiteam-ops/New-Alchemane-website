import { chromium, expect } from '@playwright/test';
import assert from 'node:assert/strict';
import { mkdir } from 'node:fs/promises';

const base = process.env.BASE_URL || 'http://127.0.0.1:5174';
const path = '/products/silk-hair-toppers/';
const browser = await chromium.launch({ channel: 'chrome', headless: true });
const failures = [];
const reviewFixture = Array.from({ length: 20 }, (_, index) => ({
  id: index + 1,
  author: `Reviewer ${index + 1}`,
  star: index < 12 ? 5 : index < 19 ? 4 : 3,
  content: index === 0 ? 'A comfortably fitted silk topper with a natural looking parting. '.repeat(5) : `Product review ${index + 1} about the silk topper.`,
  resources: [],
}));
const stockFixture = [
  ['41758814142523', 5], ['41758814175291', 5], ['41758814208059', 5],
  ['41758814240827', 3], ['41758814273595', 5], ['41758814306363', 5],
];
const expectTextureLink = async (locator, id, count, texture) => {
  const url = new URL(await locator.getAttribute('href'));
  assert.equal(url.pathname, `/cart/${id}:${count}`);
  assert.equal(JSON.parse(Buffer.from(url.searchParams.get('properties'), 'base64url').toString()).Texture, texture);
};
await mkdir('preview/product-page', { recursive: true });
try {
  for (const [width, height] of [[320, 740], [375, 812], [390, 844], [768, 1024], [1440, 1000], [844, 390]]) {
    const context = await browser.newContext({ viewport: { width, height }, isMobile: width < 701, hasTouch: width < 1000 });
    const page = await context.newPage();
    await page.route('https://api.trustoo.io/api/v1/reviews/get_product_reviews?*', route => route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ code: 0, data: { page: { total_page: 1, count: 20 }, list: reviewFixture } }),
    }));
    await page.route('https://alchemane.com/products/silk-hair-toppers.js', route => route.fulfill({
      status: 200, contentType: 'application/json',
      body: JSON.stringify({ variants: stockFixture.map(([id]) => ({ id, available: true })) }),
    }));
    await page.route('https://alchemane.com/products/silk-hair-toppers?pb=0', route => route.fulfill({
      status: 200, contentType: 'text/html',
      body: `<variant-inventory>${stockFixture.map(([id, count]) => `<span data-variant-id="${id}" data-quantity="${count}"></span>`).join('')}</variant-inventory>`,
    }));
    await page.addInitScript(() => { window.consultationRequests = []; window.open = url => { window.consultationRequests.push(url); return null; }; });
    page.on('pageerror', error => failures.push(`${width}: ${error.message}`));
    page.on('response', response => { if (response.url().startsWith(base) && response.status() >= 400) failures.push(`${width}: ${response.status()} ${response.url()}`); });
    await page.goto(base + path, { waitUntil: 'domcontentloaded' });
    await page.locator('.pd-gallery__slide img').first().evaluate(image => image.decode());
    await page.evaluate(() => document.fonts.ready);
    await expect(page.getByRole('heading', { level: 1 })).toHaveText('Silk Topper 5×3');
    await expect(page.locator('[data-product-rating]')).toBeVisible();
    await expect(page.locator('[data-product-rating-average]')).toHaveText('4.5');
    await expect(page.locator('[data-stock]')).toHaveText('5 in stock');
    await expect(page.locator('.pd-details .pd-accordions summary')).toHaveText([
      'Description', 'Need Customization?', 'Shipping & Return', 'Is this topper right for me?', 'Care & storage',
    ]);
    const productVideos = page.locator('[data-product-videos]');
    await expect(productVideos.locator('[data-product-video-select]')).toHaveCount(5);
    await expect(productVideos.locator('.pd-product-videos__title')).toHaveText([
      'Real-life result', 'How to wear', 'Natural parting', 'Coverage close-up', 'Size & clips',
    ]);
    await expect(productVideos.locator('[data-product-video-pause]')).toHaveCount(0);
    await expect(productVideos.locator('[data-product-video-select] svg')).toHaveCount(0);
    await expect(productVideos.locator('video[muted][autoplay][loop][playsinline]')).toHaveCount(5);
    await expect(page.locator('#product-video-dialog')).not.toBeVisible();
    assert(await page.locator('#product-form').evaluate((form, selector) => form.nextElementSibling?.matches(selector), '[data-product-videos]'), 'Video circles should sit directly below the purchase form');
    await productVideos.scrollIntoViewIfNeeded();
    await expect(productVideos.locator('video').first()).toHaveAttribute('src', /consult-1\.mp4$/);
    await expect.poll(() => productVideos.locator('video').first().evaluate(video => video.paused)).toBe(false);
    await productVideos.getByRole('button', { name: 'Watch How to wear', exact: true }).click();
    const videoDialog = page.locator('#product-video-dialog');
    await expect(videoDialog).toBeVisible();
    await expect(videoDialog.locator('[data-product-video-player]')).toHaveAttribute('src', /consult-2\.mp4$/);
    await expect(videoDialog.locator('[data-product-video-title]')).toHaveText('How to wear');
    await expect(videoDialog.locator('[data-product-video-status]')).toHaveText('Playing How to wear, video 2 of 5.');
    await videoDialog.getByRole('button', { name: 'Next topper video', exact: true }).click();
    await expect(videoDialog).toHaveAttribute('data-video-transitioning', '1');
    const incomingVideo = videoDialog.locator('video.pd-product-video-dialog__incoming');
    await expect(incomingVideo).toBeVisible();
    await expect.poll(() => incomingVideo.evaluate(video => video.readyState)).toBeGreaterThanOrEqual(2);
    if (width === 390 || width === 1440) {
      await page.waitForTimeout(240);
      await videoDialog.screenshot({ path: `preview/product-page/video-swipe-${width}.png` });
    }
    await expect(videoDialog.locator('[data-product-video-player]')).toHaveAttribute('src', /consult-3\.mp4$/);
    await expect(videoDialog.locator('[data-product-video-title]')).toHaveText('Natural parting');
    await expect.poll(() => videoDialog.locator('[data-product-video-player]').evaluate(video => video.readyState)).toBeGreaterThanOrEqual(2);
    await expect(videoDialog.locator('.pd-product-video-dialog__incoming')).toHaveCount(0);
    await videoDialog.screenshot({ path: `preview/product-page/video-overlay-${width}.png` });
    await videoDialog.getByRole('button', { name: 'Previous topper video', exact: true }).click();
    await expect(videoDialog).toHaveAttribute('data-video-transitioning', '-1');
    await expect(videoDialog.locator('[data-product-video-player]')).toHaveAttribute('src', /consult-2\.mp4$/);
    await page.keyboard.press('Escape');
    await expect(videoDialog).not.toBeVisible();
    await expect(videoDialog.locator('[data-product-video-player]')).not.toHaveAttribute('src');
    await expect(productVideos.getByRole('button', { name: 'Watch How to wear', exact: true })).toBeFocused();
    if (width === 390) {
      await productVideos.getByRole('button', { name: 'Watch Size & clips', exact: true }).click();
      await expect(videoDialog.locator('[data-product-video-title]')).toHaveText('Size & clips');
      await videoDialog.getByRole('button', { name: 'Next topper video', exact: true }).click();
      await expect(videoDialog.locator('[data-product-video-title]')).toHaveText('Real-life result');
      await page.keyboard.press('Escape');
    }
    assert(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), `Horizontal overflow at ${width}`);
    await page.screenshot({ path: `preview/product-page/top-${width}.png` });

    // A customer can explore the gallery and return from its modal using Escape.
    await page.getByRole('button', { name: 'Next product image', exact: true }).click();
    await expect(page.locator('[data-gallery-count]')).toHaveText('2 / 5');
    await page.getByRole('button', { name: 'Enlarge current product image' }).click();
    await expect(page.locator('#image-dialog')).toBeVisible();
    await page.keyboard.press('ArrowRight');
    await expect(page.locator('[data-zoom-count]')).toHaveText('3 / 5');
    await page.keyboard.press('Escape');
    await expect(page.locator('#image-dialog')).not.toBeVisible();
    await expect(page.getByRole('button', { name: 'Enlarge current product image' })).toBeFocused();
    if (width < 701) await page.getByRole('button', { name: 'Previous product image', exact: true }).click();
    else await page.getByRole('button', { name: 'View image 1:', exact: false }).click();

    // Texture is required and travels to Shopify with every purchasable option.
    await page.locator('.pd-texture-options label.pd-choice:has(input[value="Natural Wave"])').click();
    await expect(page.locator('[data-texture-label]')).toHaveText('Natural Wave');
    // Every purchasable option produces the verified price and Shopify variant.
    const variants = [
      ['14 inches', 'Natural Black', '₹28,000', '41758814142523'],
      ['14 inches', 'Dark Brown', '₹28,000', '41758814175291'],
      ['14 inches', 'Highlights', '₹30,000', '41758814208059'],
      ['16 inches', 'Natural Black', '₹30,000', '41758814240827'],
      ['16 inches', 'Dark Brown', '₹30,000', '41758814273595'],
      ['16 inches', 'Highlights', '₹32,000', '41758814306363'],
    ];
    for (const [length, colour, price, id] of variants) {
      await page.locator(`label.pd-choice:has(input[value="${length}"])`).click();
      await page.locator(`label.pd-colour:has(input[value="${colour}"])`).click();
      await expect(page.locator('[data-price]')).toHaveText(price);
      await expectTextureLink(page.locator('[data-buy-now]'), id, 1, 'Natural Wave');
      if (id === '41758814240827') await expect(page.locator('[data-stock]')).toHaveText('3 in stock');
    }
    await page.locator('#product-quantity').fill('2');
    await page.locator('#product-quantity').dispatchEvent('change');
    await page.locator('#product-form [data-add-to-bag]').click();
    await expect(page.locator('#bag-dialog')).toBeVisible();
    await expect(page.locator('[data-bag-subtotal]')).toHaveText('₹64,000');
    await expectTextureLink(page.locator('[data-checkout]'), '41758814306363', 2, 'Natural Wave');
    await expect(page.locator('.pd-bag__item')).toContainText('Natural Wave');
    await page.screenshot({ path: `preview/product-page/bag-${width}.png` });
    await page.keyboard.press('Escape');
    await page.reload({ waitUntil: 'domcontentloaded' });
    await expect(page.locator('[data-price]')).toHaveText('₹32,000');
    await expect(page.locator('[data-bag-count]')).toHaveText('2');
    await page.getByRole('button', { name: 'Open shopping bag, 2 items' }).click();
    await page.locator('[data-remove]').click();
    await expect(page.locator('[data-bag-count]')).toHaveText('0');
    await expect(page.locator('.pd-bag__summary')).not.toBeVisible();
    await page.keyboard.press('Escape');

    const sizeGuide = page.getByRole('button', { name: /^Size guide/ });
    await expect(sizeGuide).toHaveCount(1);
    const sizeGuideBox = await sizeGuide.boundingBox();
    const summaryBox = await page.locator('.pd-summary').boundingBox();
    assert(sizeGuideBox.height >= 56 && sizeGuideBox.width >= summaryBox.width - 1, `Size guide should be a full-width card at ${width}px`);
    await sizeGuide.click();
    await expect(page.locator('#size-guide')).toBeVisible();
    if (width < 701) {
      // Poll past the slide-up animation before measuring where the sheet settles.
      await expect.poll(async () => {
        const sheet = await page.locator('#size-guide').boundingBox();
        return Math.round(sheet.y + sheet.height);
      }, { message: 'Size guide should open as a bottom sheet on phones' }).toBe(page.viewportSize().height);
    }
    await page.keyboard.press('Escape');
    await page.locator('.pd-texture-options label.pd-choice:has(input[value="Straight"])').click();

    if (width < 701) {
      await page.locator('#customer-reviews').scrollIntoViewIfNeeded();
      await expect(page.locator('.pd-mobile-purchase')).toBeVisible();
      await expect(page.locator('[data-sticky-price]')).toHaveText('₹32,000');
      await page.locator('.pd-mobile-purchase [data-add-to-bag]').click();
      await expect(page.locator('#bag-dialog')).toBeVisible();
      await page.keyboard.press('Escape');
    }
    await expect(page.getByText('A natural-looking parting, up close.', { exact: true })).toHaveCount(0);
    const difference = page.locator('.pd-difference');
    await difference.scrollIntoViewIfNeeded();
    await expect(difference.getByRole('heading', { name: 'See the difference', exact: true })).toBeVisible();
    await expect(difference.locator('.pd-difference__slide')).toHaveCount(3);
    if (width < 701) {
      await difference.getByRole('button', { name: 'Next transformation', exact: true }).click();
      await expect(difference.locator('[data-difference-status]')).toHaveText('Showing transformation 2 of 3');
    } else {
      await expect(difference.locator('.pd-difference__controls')).toBeHidden();
      await expect(difference.locator('[data-difference-status]')).toHaveText('Showing transformations 1 to 3 of 3');
    }
    await difference.screenshot({ path: `preview/product-page/difference-${width}.png` });
    const consultationOffer = page.locator('#consultation-options');
    await expect(consultationOffer.getByRole('heading', { name: 'Prefer a consultation before you buy?', exact: true })).toBeVisible();
    const consultationHeadingLines = await consultationOffer.locator('h2 span').evaluateAll(spans => spans.map(span => ({ top: span.getBoundingClientRect().top, right: span.getBoundingClientRect().right })));
    assert.equal(consultationHeadingLines.length, 2);
    assert(consultationHeadingLines[1].top > consultationHeadingLines[0].top, 'Consultation heading should use two intentional lines');
    assert(consultationHeadingLines.every(line => line.right <= width), `Consultation heading should fit at ${width}px`);
    await expect(consultationOffer.locator('video')).toHaveCount(0);
    await consultationOffer.getByRole('button', { name: 'Online', exact: true }).click();
    await expect(page.locator('#topper-consultation-form [name="meeting"]')).toHaveValue('Online');
    await expect(consultationOffer.locator('[data-product-consultation-note]')).toContainText('Meet from anywhere.');
    await expect(consultationOffer.locator('[data-product-consultation-cta]')).toHaveText('Book an online consultation');
    await consultationOffer.getByRole('button', { name: 'Offline', exact: true }).click();
    await expect(page.locator('#topper-consultation-form [name="meeting"]')).toHaveValue('Khar West studio');
    await expect(consultationOffer.locator('[data-product-consultation-cta]')).toHaveText('Book an offline consultation');
    await consultationOffer.screenshot({ path: `preview/product-page/consultation-offer-${width}.png` });
    await expect(page.getByText('Life with a hair topper.', { exact: true })).toHaveCount(0);
    const relatedToppers = page.locator('.pd-related');
    await expect(relatedToppers.locator('.pd-related__card')).toHaveCount(7);
    await expect(relatedToppers.locator('.pd-related__card h3')).toHaveText([
      'Silk Toppers 5x6', 'Skin Topper 5x3', 'Skin Topper 5x6', 'Hairline Toppers', 'Rose Topper', 'Classic Clip Topper', 'Mesh Topper',
    ]);
    await expect(relatedToppers.getByRole('heading', { name: 'Silk Topper 5x3', exact: true })).toHaveCount(0);
    await expect(relatedToppers.locator('.pd-related__media.is-placeholder')).toHaveCount(4);
    await expect(relatedToppers.getByRole('link', { name: /Shop all toppers/ })).toHaveCount(0);
    const reviews = page.locator('#customer-reviews');
    await expect(reviews.getByRole('heading', { name: 'Customer Reviews', exact: true })).toBeVisible();
    await expect(reviews).toHaveAttribute('data-review-state', 'ready');
    await expect(reviews.locator('[data-review-average]')).toHaveText('4.5');
    await expect(reviews.locator('[data-review-count]')).toHaveText('20 reviews');
    await expect(reviews.locator('.pd-review')).toHaveCount(4);
    await expect(reviews.getByRole('button', { name: 'Show more', exact: true })).toBeVisible();
    await expect(reviews.getByRole('button', { name: 'Show less', exact: true })).toBeHidden();
    await reviews.getByRole('button', { name: 'Show more', exact: true }).click();
    await expect(reviews.locator('.pd-review')).toHaveCount(8);
    await reviews.getByRole('button', { name: 'Show more', exact: true }).click();
    await expect(reviews.locator('.pd-review')).toHaveCount(12);
    await reviews.getByRole('button', { name: 'Show more', exact: true }).click();
    await expect(reviews.locator('.pd-review')).toHaveCount(16);
    await reviews.getByRole('button', { name: 'Show more', exact: true }).click();
    await expect(reviews.locator('.pd-review')).toHaveCount(20);
    await expect(reviews.getByRole('button', { name: 'Show more', exact: true })).toBeHidden();
    await reviews.getByRole('button', { name: 'Show less', exact: true }).click();
    await expect(reviews.locator('.pd-review')).toHaveCount(16);
    await reviews.getByRole('button', { name: 'Show less', exact: true }).click();
    await expect(reviews.locator('.pd-review')).toHaveCount(12);
    await reviews.getByRole('button', { name: 'Show less', exact: true }).click();
    await expect(reviews.locator('.pd-review')).toHaveCount(8);
    await reviews.getByRole('button', { name: 'Show less', exact: true }).click();
    await expect(reviews.locator('.pd-review')).toHaveCount(4);
    await reviews.getByRole('button', { name: 'Show 3-star reviews, 1 review' }).click();
    await expect(reviews.locator('.pd-review')).toHaveCount(1);
    await reviews.getByRole('button', { name: 'Show all reviews' }).click();
    await expect(reviews.locator('.pd-review')).toHaveCount(4);
    await reviews.locator('.pd-review__more').first().click();
    await expect(reviews.locator('.pd-review__more').first()).toHaveAttribute('aria-expanded', 'true');
    await reviews.locator('.pd-review__more').first().click();
    await expect(reviews.getByRole('link', { name: /Write a review on Alchemane/ })).toHaveAttribute('href', 'https://alchemane.com/products/silk-hair-toppers?pb=0#vstar-reviews');
    await expect(reviews.getByRole('link', { name: /See reviews on Alchemane/ })).toHaveCount(0);
    assert(await reviews.evaluate(node => node.nextElementSibling?.id === 'consultation'), 'Customer reviews should sit directly above consultation');
    assert.deepEqual(await page.locator('main > section').evaluateAll(nodes => nodes.map(node => node.classList.contains('pd-difference') ? 'difference' : node.classList.contains('pd-consult-offer') ? 'consultation-offer' : node.classList.contains('pd-related') ? 'related' : node.classList.contains('pd-faq') ? 'faq' : node.classList.contains('pd-reviews') ? 'reviews' : node.classList.contains('pd-consult') ? 'consultation' : node.classList.contains('pd-may-like') ? 'may-like' : 'unknown')), ['difference', 'consultation-offer', 'related', 'faq', 'reviews', 'consultation', 'may-like']);
    await reviews.screenshot({ path: `preview/product-page/reviews-${width}.png` });
    // Consultation is completed on this product page before broader product discovery.
    await expect(page.locator('a[href*="topper-consultation.html"]')).toHaveCount(0);
    const mayLike = page.locator('.pd-may-like');
    await expect(mayLike.getByRole('heading', { name: 'You May Also Like', exact: true })).toBeVisible();
    await expect(mayLike.locator('.pd-may-like__card')).toHaveCount(4);
    for (const card of await mayLike.locator('.pd-may-like__card').all()) {
      await expect(card).toHaveAttribute('href', /https:\/\/alchemane\.com\/products\//);
      await expect(card.locator('img')).toBeVisible();
    }
    await mayLike.screenshot({ path: `preview/product-page/you-may-also-like-${width}.png` });
    const consultationForm = page.locator('#topper-consultation-form');
    await consultationForm.locator('button[type="submit"]').click();
    await expect(page.locator('#booking-errors')).toBeVisible();
    await expect(page.locator('#booking-errors')).toBeFocused();
    await page.getByLabel('Your name', { exact: true }).fill('Product page test');
    await page.getByLabel('Phone number', { exact: true }).fill('+91 99999 99999');
    await consultationForm.getByRole('button', { name: 'Offline', exact: true }).click();
    await expect(consultationForm.locator('[name="meeting"]')).toHaveValue('Khar West studio');
    await expect(consultationForm.locator('[data-meet-note]')).toHaveText('In-person at our Khar West studio, Mumbai.');
    await consultationForm.locator('button[type="submit"]').click();
    await expect(page.locator('#booking-status')).toBeVisible();
    const request = await page.evaluate(() => window.consultationRequests.at(-1));
    const message = new URL(request).searchParams.get('text');
    assert(message.includes('Product: Silk Topper 5×3') && message.includes('16 inches / Highlights') && message.includes('₹299') && message.includes('Khar West'), 'Consultation should retain the product selection and meeting details');
    await expect(page).toHaveURL(/\/products\/silk-hair-toppers\//);
    await page.locator('.pd-consult').screenshot({ path: `preview/product-page/consultation-${width}.png` });
    await expect(page.locator('.pd-faq details').first()).toHaveAttribute('open', '');
    await page.locator('.pd-faq details').nth(1).locator('summary').click();
    await expect(page.locator('.pd-faq details').nth(1)).toHaveAttribute('open', '');
    assert(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), `Lower page overflow at ${width}`);
    if (width < 1000) {
      await page.evaluate(() => scrollTo(0, 0));
      await page.getByRole('button', { name: 'Open navigation', exact: true }).click();
      await expect(page.locator('.pd-nav')).toBeVisible();
      await page.keyboard.press('Escape');
      await expect(page.locator('.pd-nav')).not.toBeVisible();
    }
    await context.close();
  }
  const staticContext = await browser.newContext({ javaScriptEnabled: false, viewport: { width: 390, height: 844 } });
  const staticPage = await staticContext.newPage();
  await staticPage.goto(base + path);
  await expect(staticPage.getByRole('heading', { level: 1 })).toBeVisible();
  await expect(staticPage.locator('[data-buy-now]')).toHaveAttribute('href', /41758814142523/);
  await expect(staticPage.getByRole('link', { name: 'Choose options in store' })).toBeVisible();
  await expect(staticPage.locator('[data-product-videos]')).not.toBeVisible();
  await staticContext.close();
  const reducedContext = await browser.newContext({ reducedMotion: 'reduce', viewport: { width: 390, height: 844 } });
  const reducedPage = await reducedContext.newPage();
  await reducedPage.route('https://api.trustoo.io/api/v1/reviews/get_product_reviews?*', route => route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ code: 0, data: { page: { total_page: 1, count: 20 }, list: reviewFixture } }) }));
  await reducedPage.goto(base + path);
  assert.equal(await reducedPage.locator('html').evaluate(node => getComputedStyle(node).scrollBehavior), 'auto');
  await reducedPage.getByRole('button', { name: 'Watch Real-life result' }).click();
  await reducedPage.getByRole('button', { name: 'Next topper video', exact: true }).click();
  await expect(reducedPage.locator('#product-video-dialog [data-product-video-player]')).toHaveAttribute('src', /consult-2\.mp4$/);
  await expect(reducedPage.locator('#product-video-dialog')).not.toHaveAttribute('data-video-transitioning', '1');
  await reducedContext.close();
  assert.deepEqual(failures, [], 'No browser errors or missing local assets');
  console.log('Product page passed: responsive layout, six variants, gallery/zoom, bag persistence, checkout handoff, four-at-a-time reviews, dialogs, FAQs, mobile purchase bar, no-JS and reduced motion.');
} finally {
  await browser.close();
}
