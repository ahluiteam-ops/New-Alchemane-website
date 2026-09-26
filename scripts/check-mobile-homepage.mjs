import { chromium, expect } from '@playwright/test';
import assert from 'node:assert/strict';
import { mkdir, writeFile } from 'node:fs/promises';
import { products } from '../src/sections/catalogue-products.js';
import { productBelongsToCategory } from '../src/sections/catalogue-data.js';

const base = process.env.BASE_URL ?? 'http://127.0.0.1:5173';
const browser = await chromium.launch({ channel: 'chrome', headless: true });
const errors = [];
const report = [];
await mkdir('preview/mobile-homepage-qa', { recursive: true });
try {
  for (const [width, height] of [[320, 740], [390, 844], [700, 900], [768, 1024], [900, 700], [1440, 1000], [844, 390]]) {
    const page = await browser.newPage({ viewport: { width, height }, isMobile: width < 701, hasTouch: width < 901 });
    await page.addInitScript(() => {
      const showModal = HTMLDialogElement.prototype.showModal;
      HTMLDialogElement.prototype.showModal = function () {
        if (!this.classList.contains('offer-dialog')) showModal.call(this);
      };
    });
    page.on('pageerror', error => errors.push(`${width}: ${error.message}`));
    page.on('response', response => { if (response.status() >= 400 && response.url().startsWith(base)) errors.push(`${width}: ${response.status()} ${response.url()}`); });
    await page.goto(base, { waitUntil: 'networkidle' });
    await expect(page.locator('.catalogue-card:visible')).toHaveCount(Math.min(4, products.filter(product => productBelongsToCategory(product, 'hairline-series')).length));
    await expect(page.locator('#collection .solutions-tab')).toHaveCount(6);
    await expect(page.locator('#collection [data-solution="hairline-series"]')).toHaveAttribute('aria-selected', 'true');
    await expect(page.locator('#range-title')).toHaveText('Hairline Series');
    await expect(page.locator('#range .catalogue-options, #range .reset-filters')).toHaveCount(0);
    await expect(page.locator('#collection .solutions-panel')).toHaveCount(0);
    if (width <= 1000 && height >= 520) {
      const handoffSpace = await page.locator('#collection').evaluate(node => parseFloat(getComputedStyle(node).paddingTop));
      assert(handoffSpace >= 72, 'cloud reveal should leave breathing room before the product heading');
    }
    await expect(page.locator('.solutions-orbit, .editorial-overture, .offer-popup, .reel-section')).toHaveCount(0);
    await expect(page.locator('.cloud-layer')).toHaveCount(6);
    await expect(page.locator('#voices-title')).toHaveText('Watch our clients’ stories');
    await expect(page.locator('#alchemane-standard .quality-banner-picture img')).toHaveCount(1);
    await expect(page.locator('#alchemane-standard .quality-banner-list li')).toHaveCount(3);
    await expect(page.locator('#celebrity-picks-title')).toHaveText('Celebrity Choice');
    await expect(page.locator('#celebrity-picks .voice-card--pending')).toHaveCount(2);
    await expect(page.locator('#celebrity-picks .voice-play')).toHaveCount(0);
    assert(await page.locator('#celebrity-picks').evaluate(node => node.previousElementSibling.classList.contains('media-coverage')), 'Celebrity Choice should follow Featured In');
    await expect(page.locator('#client-closeups-title')).toHaveText('See real hair transformations');
    await expect(page.locator('#client-closeups img')).toHaveAttribute('src', '/assets/client-portrait-collage-v2.webp');
    await expect(page.locator('#client-closeups figcaption')).toHaveCount(0);
    assert.equal(await page.locator('#client-closeups').evaluate(node => getComputedStyle(node).backgroundColor), 'rgb(255, 255, 255)', 'client film section should have a white background');
    await expect(page.locator('#client-closeups .client-film-play')).toHaveCount(1);
    await expect(page.locator('#client-closeups video')).toHaveCount(0);
    assert.equal(await page.locator('#client-closeups').evaluate(node => node.previousElementSibling.id), 'studio', 'close-up film should follow the studio');
    assert.equal(await page.locator('#client-closeups').evaluate(node => node.nextElementSibling.id), 'questions', 'close-up film should sit directly above FAQ');
    await expect(page.locator('.floating-contact-link')).toHaveCount(2);
    await expect(page.locator('.stories-section .story-action a[href="#consultation"]')).toHaveCount(1);
    await expect(page.locator('.section-help')).toHaveCount(0);
    const storyPhoto = await page.locator('.stories-section .story-photo-frame').boundingBox();
    const storyControls = await page.locator('.stories-section .story-image-footer .story-controls').boundingBox();
    assert(storyControls.y >= storyPhoto.y + storyPhoto.height + 8, 'story arrows should sit below the image');
    assert(Math.abs(storyControls.x + storyControls.width - storyPhoto.x - storyPhoto.width) <= 2, 'story arrows should align to the image right edge');
    const sectionPadding = await page.locator('.stories-section').evaluate(node => parseFloat(getComputedStyle(node).paddingTop));
    assert(sectionPadding >= (width >= 701 ? 80 : 56), 'story section should have clear vertical spacing');
    if (width <= 700) {
      await expect(page.locator('#voices .voices-controls')).toBeHidden();
      await expect(page.locator('.stories-section .story-quote')).toBeHidden();
      await expect(page.locator('.stories-section .story-caption')).toBeHidden();
      const storyHeading = await page.locator('#stories-title').evaluate(node => ({ height: node.getBoundingClientRect().height, lineHeight: parseFloat(getComputedStyle(node).lineHeight) }));
      assert(storyHeading.height <= storyHeading.lineHeight + 2, 'story heading should stay on one line');
    }
    if (height >= 520) await expect(page.locator('html')).toHaveClass(width <= 1000 ? /motion-flow/ : /motion-mobile/);
    await expect(page.locator('.pin-spacer')).toHaveCount(height >= 520 && width > 1000 ? 1 : 0);
    await expect(page.locator('.hero-scene')).toBeInViewport({ ratio: 0.8 });
    assert.equal(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), true, `overflow at ${width}`);
    await page.screenshot({ path: `preview/mobile-homepage-qa/home-${width}.png` });
    if (width === 390 || width === 1440) {
      if (width === 390) {
        // .hero-runway (hero-cloud.css) is 100svh plus one "cloud runway" of
        // extra scroll (--cloud-runway, matched here since a static check
        // can't read a CSS custom property); .hero-scene sticks at the top of
        // the viewport for exactly that runway, and #collection — right
        // after .hero-runway in flow — only starts entering once it's used
        // up. That's the fix under test: #collection tracks .hero-runway's
        // full height throughout, but the cloud reveal itself must be done
        // long before #collection is anywhere near the viewport.
        const CLOUD_RUNWAY_RATIO = 0.55;
        const runwayHeight = await page.locator('.hero-runway').evaluate(node => node.offsetHeight);
        const runwayPx = height * CLOUD_RUNWAY_RATIO;
        const positions = [];
        for (const fraction of [0.2, 0.5, 0.8]) { // fractions of the runway itself, where the sticky hero still holds
          await page.evaluate(y => scrollTo(0, y), runwayPx * fraction);
          await page.waitForTimeout(150);
          positions.push(await page.locator('.cloud-stage-mobile .cloud-front').evaluate(node => new DOMMatrix(getComputedStyle(node).transform).m42));
          const sectionTop = await page.locator('#collection').evaluate(node => node.getBoundingClientRect().top);
          assert(Math.abs(sectionTop - (runwayHeight - runwayPx * fraction)) < 5, 'mobile collection should enter steadily with manual scroll');
        }
        assert(positions[0] > positions[1] && positions[1] > positions[2], 'clouds should rise smoothly as the user scrolls');

        // The actual bug this page was rebuilt to fix: the cloud reveal must
        // fully finish (whiteout back to 0) before #collection ever reaches
        // the viewport, not still be mid-fade while #collection is already
        // showing underneath it.
        await page.evaluate(y => scrollTo(0, y), runwayPx * 0.99);
        await page.waitForTimeout(200);
        const [whiteoutOpacity, sectionTopAtHandoff] = await Promise.all([
          page.locator('.cloud-stage-mobile .whiteout').evaluate(node => parseFloat(getComputedStyle(node).opacity)),
          page.locator('#collection').evaluate(node => node.getBoundingClientRect().top),
        ]);
        assert(whiteoutOpacity < 0.05, 'cloud whiteout should have fully cleared before #collection arrives');
        assert(sectionTopAtHandoff > 0, '#collection should not have entered the viewport yet when the cloud reveal finishes');
      }
      await page.evaluate(() => scrollTo(0, innerHeight * 0.8));
      await page.waitForTimeout(500);
      const selector = width === 390 ? '.cloud-stage-mobile .cloud-front' : '.cloud-stage-desktop .cloud-front';
      const moved = await page.locator(selector).evaluate(node => Math.abs(new DOMMatrix(getComputedStyle(node).transform).m42));
      assert(moved > 30, 'clouds should move as the hero leaves');
      if (width === 390) await expect(page.locator('.collection-scene-mobile .solutions-tab')).toHaveCount(0);
      if (width === 390) assert.equal(await page.locator('#collection').evaluate(node => node.inert), false, 'mobile section must stay usable during manual scroll');
      await page.screenshot({ path: `preview/mobile-homepage-qa/cloud-${width}.png` });
      await page.evaluate(() => scrollTo(0, 0));
      await page.waitForTimeout(500);
      const tapStart = Date.now();
      await page.locator('.hero-actions a[href="#collection"]').first().click();
      await expect(page.locator('#collection')).toBeInViewport({ ratio: 0.2 });
      await expect.poll(() => page.locator('#collection').evaluate(node => Math.abs(node.getBoundingClientRect().top))).toBeLessThan(5);
      await expect(page.locator('#collection')).not.toHaveAttribute('inert', '');
      await page.screenshot({ path: `preview/mobile-homepage-qa/after-cta-${width}.png` });
      if (width === 390) assert(Date.now() - tapStart < 1600, 'mobile CTA should finish the reveal quickly');
      if (width === 390) {
        await page.goto(`${base}/#collection`, { waitUntil: 'networkidle' });
        await expect(page.locator('#collection')).toBeInViewport({ ratio: 0.2 });
      }
      await page.evaluate(() => scrollTo(0, 0));
      await page.waitForTimeout(500);
    }
    if (width === 390 || width === 1440) {
      await page.evaluate(async () => {
        for (let y = 0; y < document.body.scrollHeight; y += innerHeight) { scrollTo(0, y); await new Promise(resolve => setTimeout(resolve, 70)); }
        scrollTo(0, 0);
      });
      await page.screenshot({ path: `preview/mobile-homepage-qa/full-${width}.png`, fullPage: true });
    }
    if (height >= 520) {
      await page.evaluate(() => scrollTo(0, document.querySelector('.pin-spacer') ? document.querySelector('.pin-spacer').offsetHeight - innerHeight + 2 : document.querySelector('#collection').getBoundingClientRect().top + scrollY + 2));
      await page.waitForTimeout(300);
    } else await page.locator('#collection').scrollIntoViewIfNeeded();
    const gap = await page.evaluate(() => document.querySelector('#range').getBoundingClientRect().top - document.querySelector('#collection .solutions-tabs').getBoundingClientRect().bottom);
    assert(gap < 24, `tabs and products should meet without a large gap at ${width}`);
    const firstProducts = await page.locator('#range .catalogue-card:visible').evaluateAll(cards => cards.map(card => card.dataset.handle));
    assert.deepEqual(firstProducts, products.filter(product => productBelongsToCategory(product, 'hairline-series')).slice(0, 4).map(product => product.handle));
    if (width === 390) {
      const tapTarget = await page.locator('#collection [data-solution="toppers"]').boundingBox();
      await page.touchscreen.tap(tapTarget.x + tapTarget.width / 2, tapTarget.y + tapTarget.height / 2);
      await expect(page.locator('#collection [data-solution="toppers"]')).toHaveAttribute('aria-selected', 'true');
      await expect(page.locator('#range-title')).toHaveText('Hair Toppers');
      await page.locator('#collection [data-solution="hairline-series"]').click();
    }
    for (const category of ['hairline-series', 'toppers', 'permanent-extensions', 'clip-extensions', 'wigs', 'fringes']) {
      const tab = page.locator(`#collection [data-solution="${category}"]`);
      await tab.evaluate(element => { const row = element.parentElement; row.scrollLeft = element.offsetLeft - row.offsetLeft - (row.clientWidth - element.clientWidth) / 2; });
      await tab.click();
      await expect(tab).toHaveAttribute('aria-selected', 'true');
      assert.equal(await page.evaluate(() => location.hash), '', 'category tabs should not leave a collection fragment');
      const expected = products.filter(p => productBelongsToCategory(p, category));
      await expect(page.locator('.catalogue-card:visible')).toHaveCount(Math.min(4, expected.length));
      const handles = await page.locator('.catalogue-card:visible').evaluateAll(cards => cards.map(card => card.dataset.handle));
      assert.deepEqual(handles, expected.slice(0, 4).map(product => product.handle));
      const size = await tab.boundingBox();
      assert(size.height >= 44 && size.width >= 44);
    }
    await page.locator('#hair-solutions').screenshot({ path: `preview/mobile-homepage-qa/solutions-${width}.png` });
    if (width === 390 || width === 1440) {
      await page.locator('#alchemane-standard').scrollIntoViewIfNeeded();
      await expect(page.locator('.floating-contact')).toHaveClass(/is-visible/);
      await expect(page.locator('.floating-contact')).toBeVisible();
      await expect(page.locator('.floating-contact-link--whatsapp')).toHaveAttribute('href', 'https://wa.me/919967123333');
      await expect(page.locator('.floating-contact-link--call')).toHaveAttribute('href', 'tel:+919967123333');
      if (width === 390) {
        const links = await page.locator('.floating-contact-link').evaluateAll(items => items.map(item => item.getBoundingClientRect().toJSON()));
        assert(links.every(link => link.width >= 44 && link.height >= 44), 'floating contact touch targets should be at least 44px');
        assert(links[1].top - links[0].bottom >= 8, 'floating contact links should have enough tap spacing');
      }
      await page.locator('.stories-section [data-story-direction="1"]').click();
      await expect(page.locator('#story-image')).toHaveAttribute('src', /ananya-r\.webp/);
      await page.locator('.stories-section [data-story-direction="-1"]').click();
      await page.locator('.stories-section').screenshot({ path: `preview/mobile-homepage-qa/stories-${width}.png` });
      await page.locator('#celebrity-picks').scrollIntoViewIfNeeded();
      await page.waitForTimeout(600);
      await page.locator('#celebrity-picks').screenshot({ path: `preview/mobile-homepage-qa/celebrity-${width}.png` });
      await page.locator('#client-closeups').scrollIntoViewIfNeeded();
      await page.waitForTimeout(600);
      await page.locator('#client-closeups').screenshot({ path: `preview/mobile-homepage-qa/closeups-${width}.png` });
    }
    await page.locator('.footer-grid [data-catalogue-category="all"]').click();
    while (await page.locator('#range [data-show-more]').isVisible()) await page.locator('#range [data-show-more]').click();
    await expect(page.locator('.catalogue-card:visible')).toHaveCount(42);
    await page.locator('.story-action a[href="#consultation"]').click();
    await expect(page.locator('#consultation')).toBeFocused();
    await expect(page.locator('.floating-contact')).not.toHaveClass(/is-visible/);
    await page.locator('[name="name"]').fill('Preview Test');
    await page.locator('#consultation-form [name="phone"]').fill('9999999999');
    await page.locator('#consultation-form button[type="submit"]').click();
    const url = await page.locator('#send-consultation').getAttribute('href');
    assert(url.startsWith('https://wa.me/919967123333?text='));
    assert(decodeURIComponent(url).includes('Preview Test'));
    await expect(page.locator('#send-consultation')).toBeFocused();
    await page.locator('[name="name"]').fill('Updated Preview');
    await expect(page.locator('.consultation-status')).toBeHidden();
    await page.locator('#consultation').screenshot({ path: `preview/mobile-homepage-qa/consultation-${width}.png` });
    await page.locator('#voices').screenshot({ path: `preview/mobile-homepage-qa/videos-${width}.png` });
    await page.locator('#range').screenshot({ path: `preview/mobile-homepage-qa/products-${width}.png` });
    await page.locator('[data-consult-type="online"]').click();
    await expect(page.locator('[name="meeting"][value="Online"]')).toBeChecked();
    await page.locator('[data-consult-type="studio"]').click();
    await expect(page.locator('[name="meeting"][value="Khar West studio"]')).toBeChecked();
    await page.locator('.faq-list summary').first().click();
    await expect(page.locator('.faq-list details').first()).toHaveAttribute('open', '');
    // Every fragment on the homepage points somewhere real.
    const missing = await page.locator('a[href^="#"]').evaluateAll(links => links.map(link => link.getAttribute('href')).filter(href => href.length > 1 && !document.getElementById(href.slice(1))));
    assert.deepEqual(missing, []);
    if (width <= 900) {
      await page.evaluate(() => scrollTo(0, 0));
      await page.locator('.menu-toggle').click();
      await expect(page.locator('.menu-toggle')).toHaveAttribute('aria-expanded', 'true');
      await page.keyboard.press('Escape');
      await expect(page.locator('.menu-toggle')).toHaveAttribute('aria-expanded', 'false');
      await expect(page.locator('.menu-toggle')).toBeFocused();
    }
    await page.goto(`${base}/?category=wigs#range`, { waitUntil: 'networkidle' });
    await expect(page.locator('#collection [data-solution="wigs"]')).toHaveAttribute('aria-selected', 'true');
    await page.locator('#collection [data-solution="toppers"]').click();
    await page.goBack();
    await expect(page.locator('#collection [data-solution="wigs"]')).toHaveAttribute('aria-selected', 'true');
    await page.evaluate(() => scrollTo(0, document.querySelector('.pin-spacer') ? document.querySelector('.pin-spacer').offsetHeight - innerHeight + 2 : document.querySelector('#collection').getBoundingClientRect().top + scrollY + 2));
    await page.waitForTimeout(300);
    await page.locator('#collection [data-solution="wigs"]').focus();
    await page.keyboard.press('Home');
    await expect(page.locator('#collection [data-solution="hairline-series"]')).toBeFocused();
    if (width === 390) {
      await page.goto(`${base}/?category=fringes#collection`, { waitUntil: 'networkidle' });
      await expect.poll(() => page.evaluate(() => scrollY)).toBeLessThan(5);
      await expect(page.locator('.hero-scene')).toBeInViewport({ ratio: 0.8 });
      assert.equal(await page.evaluate(() => location.hash), '', 'legacy category fragment should be cleared');
      await expect(page.locator('#collection [data-solution="fringes"]')).toHaveAttribute('aria-selected', 'true');
      await page.locator('#range').scrollIntoViewIfNeeded();
      await page.reload({ waitUntil: 'networkidle' });
      await expect.poll(() => page.evaluate(() => scrollY)).toBeLessThan(5);
      await expect(page.locator('.hero-scene')).toBeInViewport({ ratio: 0.8 });
    }
    assert.equal(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), true, `overflow after interaction at ${width}`);
    report.push({ width, height, status: 'passed' });
    await page.close();
    console.log(`Passed ${width} × ${height}`);
  }
  const page = await browser.newPage({ viewport: { width: 390, height: 844 }, reducedMotion: 'reduce' });
  await page.addInitScript(() => {
    const showModal = HTMLDialogElement.prototype.showModal;
    HTMLDialogElement.prototype.showModal = function () {
      if (!this.classList.contains('offer-dialog')) showModal.call(this);
    };
  });
  page.on('pageerror', error => errors.push(error.message));
  await page.goto(base, { waitUntil: 'networkidle' });
  await expect(page.locator('.cloud-stage:visible')).toHaveCount(0);
  await expect(page.locator('.pin-spacer')).toHaveCount(0);
  await page.goto(`${base}/#collection`, { waitUntil: 'networkidle' });
  await expect(page.locator('#collection')).toBeInViewport({ ratio: 0.2 });
  await page.locator('#voices').scrollIntoViewIfNeeded();
  assert(await page.locator('.voice-card video').evaluateAll(videos => videos.every(video => video.paused && video.preload === 'none')));
  await page.locator('.voice-play').first().click();
  await expect.poll(() => page.locator('.voice-card video').first().evaluate(video => !video.paused)).toBe(true);
  await page.locator('#consultation').scrollIntoViewIfNeeded();
  await expect.poll(() => page.locator('.voice-card video').first().evaluate(video => video.paused)).toBe(true);
  for (const [route, id] of [['/toppers.html', 'toppers'], ['/extensions.html', 'extensions']]) {
    await page.goto(base + route, { waitUntil: 'networkidle' });
    await expect(page.locator(`#${id}-film`)).toHaveCount(1);
    await expect(page.locator('.reel-play')).toHaveCount(0);
    await expect(page.locator(`#${id}-film a`).first()).toHaveAttribute('href', /\/\?category=.+#range/);
    assert.equal(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), true, route);
    await page.locator(`#${id}-film`).screenshot({ path: `preview/mobile-homepage-qa/${id}-guide.png` });
  }
  for (const [width, height] of [[320, 740], [390, 844], [1440, 1000]]) {
    const offerPage = await browser.newPage({ viewport: { width, height }, isMobile: width < 701, hasTouch: width < 701 });
    await offerPage.goto(`${base}/?offer=1`, { waitUntil: 'networkidle' });
    await expect(offerPage.locator('.offer-dialog')).toBeVisible();
    await expect(offerPage.locator('.offer-dialog')).toHaveAttribute('aria-labelledby', 'offer-title');
    if (width < 701) {
      await expect(offerPage.locator('.offer-submit').first()).toBeInViewport();
      const overflow = await offerPage.locator('.offer-dialog').evaluate(dialog => dialog.scrollWidth - dialog.clientWidth);
      assert(overflow <= 1, `offer dialog should not clip content horizontally at ${width}px`);
    }
    await offerPage.screenshot({ path: `preview/mobile-homepage-qa/offer-${width}.png` });
    await offerPage.keyboard.press('Escape');
    await expect(offerPage.locator('.offer-dialog')).toBeHidden();
    await offerPage.close();
  }
  assert.deepEqual(errors, []);
  await writeFile('preview/mobile-homepage-qa/report.json', JSON.stringify({ report, errors, videos: 'request-only playback and offscreen pause passed', details: 'both explainer destinations passed' }, null, 2));
  console.log('Mobile homepage checks passed.');
} finally { await browser.close(); }
