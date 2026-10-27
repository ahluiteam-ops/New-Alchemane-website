import { chromium, expect } from '@playwright/test';
import assert from 'node:assert/strict';
import { mkdir } from 'node:fs/promises';

const base = process.env.BASE_URL ?? 'http://127.0.0.1:5173';
const out = 'preview/toppers-design-qa';
await mkdir(out, { recursive: true });
const browser = await chromium.launch({ channel: 'chrome', headless: true });
try {
  for (const [width, height] of [[320, 740], [390, 844], [768, 1024], [1024, 768], [1280, 800], [1440, 900]]) {
    const page = await browser.newPage({ viewport: { width, height }, isMobile: width < 700, hasTouch: width < 700, reducedMotion: 'reduce' });
    const errors = [];
    page.on('pageerror', error => errors.push(error.message));
    page.on('response', response => {
      if (response.status() >= 400 && response.url().startsWith(base)) errors.push(`${response.status()} ${response.url()}`);
    });
    await page.goto(`${base}/toppers.html`, { waitUntil: 'networkidle' });
    if (width === 1440) await page.screenshot({ path: `${out}/full-page-1440.png`, fullPage: true });
    await expect(page.locator('#topper-title')).toBeVisible();
    const [heroHeadingFont, sectionHeadingFont] = await Promise.all([
      page.locator('#topper-title').evaluate(element => getComputedStyle(element).fontFamily),
      page.locator('#difference-title').evaluate(element => getComputedStyle(element).fontFamily),
    ]);
    assert.equal(heroHeadingFont, sectionHeadingFont, 'Hero heading should use the same display typeface as section headings');
    await expect(page.locator('.tp-product')).toHaveCount(11);
    await expect(page.locator('#shop .tp-product')).toHaveCount(7);
    await expect(page.locator('#shop #hairline-toppers')).toHaveCount(0);
    await expect(page.locator('#hairline-toppers')).toHaveCount(1);
    const productSectionOrder = await page.locator('main > section').evaluateAll(sections => sections.map(section => section.id));
    assert.equal(productSectionOrder.indexOf('hairline-series'), productSectionOrder.indexOf('shop') + 1, 'Hairline series should follow the topper catalogue');
    const [shopBackground, hairlineBackground, consultationBackground] = await Promise.all([
      page.locator('#shop').evaluate(section => getComputedStyle(section).backgroundColor),
      page.locator('#hairline-series').evaluate(section => getComputedStyle(section).backgroundColor),
      page.locator('#how').evaluate(section => getComputedStyle(section).backgroundColor),
    ]);
    assert.notEqual(hairlineBackground, shopBackground, 'Hairline series should use the dark Alchemane background');
    assert.equal(await page.locator('#hairline-series-title').evaluate(title => getComputedStyle(title).color), 'rgb(255, 255, 255)', 'Hairline series heading should remain legible on the dark background');
    assert.equal(consultationBackground, shopBackground, 'Consultation section should use the white surface background');
    await expect(page.locator('#hairline-series .tp-product h3')).toHaveText(['Hairline Toppers', '3 inch Hairline Topper', '6 inch Hairline Topper', '11 inch Hairline Topper']);
    await expect(page.locator('.tp-client-reel video')).toHaveCount(9);
    await expect(page.locator('#client-stories .pe-dots span')).toHaveCount(9);
    await expect(page.locator('.pe-diff__slide')).toHaveCount(3);
    assert.equal(await page.evaluate(() => innerWidth), width, `Layout viewport must match the device at ${width}`);
    assert(await page.evaluate(width => document.documentElement.scrollWidth <= width, width), `Horizontal overflow at ${width}`);
    const brokenImages = await page.locator('img').evaluateAll(async images => {
      await Promise.all(images.map(async image => { image.loading = 'eager'; try { await image.decode(); } catch {} }));
      return images.filter(image => image.naturalWidth === 0).map(image => image.src);
    });
    assert.deepEqual(brokenImages, []);
    await page.screenshot({ path: `${out}/hero-${width}.png` });
    if (width < 1000) {
      await page.locator('.pe-menu').click();
      await expect(page.locator('.pe-menu')).toHaveAttribute('aria-expanded', 'true');
      await expect(page.locator('.pe-nav')).toBeVisible();
      await page.keyboard.press('Escape');
      await expect(page.locator('.pe-menu')).toHaveAttribute('aria-expanded', 'false');
      await expect(page.locator('.pe-menu')).toBeFocused();
    }
    if (width < 700) {
      await page.locator('[data-diff-direction="1"]').click();
      await expect(page.locator('[data-diff-status]')).toHaveText('Showing transformation 2 of 3');
      assert(await page.locator('.pe-diff__frame').evaluate(frame => frame.scrollLeft > 0), 'Next transformation should move the photograph');
      const positions = await page.locator('.tp-product').evaluateAll(cards => cards.slice(0, 2).map(card => card.getBoundingClientRect().x));
      assert(positions[1] > positions[0], 'Phone catalogue should show two products side by side');
      const hairlinePositions = await page.locator('#hairline-series .tp-product').evaluateAll(cards => cards.map(card => ({ x: card.getBoundingClientRect().x, y: card.getBoundingClientRect().y })));
      assert(hairlinePositions[1].x > hairlinePositions[0].x && hairlinePositions[1].y === hairlinePositions[0].y && hairlinePositions[2].y > hairlinePositions[0].y, 'Phone hairline series should use two columns');
      assert(await page.locator('#tp-client-track').evaluate(track => track.scrollWidth > track.clientWidth), 'Phone client films should swipe');
    }
    await expect(page.locator('#faq-tab-consultation')).toHaveAttribute('aria-selected', 'true');
    await expect(page.locator('#faq-panel-consultation')).toBeVisible();
    await page.locator('#faq-tab-toppers').click();
    await expect(page.locator('#faq-panel-toppers')).toBeVisible();
    await expect(page.locator('#faq-panel-consultation')).toBeHidden();
    await page.locator('#faq-panel-toppers details').nth(1).locator('summary').click();
    await expect(page.locator('#faq-panel-toppers details').nth(1)).toHaveAttribute('open', '');
    await page.locator('#faq-tab-toppers').press('ArrowLeft');
    await expect(page.locator('#faq-tab-consultation')).toHaveAttribute('aria-selected', 'true');
    await expect(page.locator('#faq-panel-consultation')).toBeVisible();
    assert.equal(await page.locator('.tp-product a[href^="https://alchemane.com/products/"]').count(), 6);
    assert.equal(await page.locator('.tp-product a[href="/products/silk-hair-toppers/"]').count(), 2);
    assert.equal(await page.locator('.tp-product__cta').count(), 22);
    assert.equal(await page.locator('.tp-product__cta:disabled').count(), 14);
    assert.equal(await page.locator('.tp-product__image--placeholder').count(), 7);
    assert.equal(await page.locator('.tp-product__image--placeholder:not(:empty)').count(), 0);
    assert.equal(await page.locator('.tp-product__body > p:not(.tp-price)').count(), 0);
    const missingAnchors = await page.locator('a[href^="#"]').evaluateAll(links => links.map(link => link.getAttribute('href')).filter(href => href.length > 1 && !document.getElementById(href.slice(1))));
    assert.deepEqual(missingAnchors, []);
    if (width === 390) {
      await page.locator('.pe-hero').scrollIntoViewIfNeeded();
      await page.locator('.tp-hero-toggle').click();
      await expect.poll(() => page.locator('.pe-hero__video').evaluate(video => !video.paused && video.readyState >= 2)).toBe(true);
      await page.locator('.pe-hero__video').evaluate(async video => { video.currentTime = 9; await new Promise(resolve => video.addEventListener('seeked', resolve, { once: true })); });
      await page.locator('.pe-hero__media').screenshot({ path: `${out}/hero-playing-390.png` });
      await page.locator('.tp-hero-toggle').click();
      await expect.poll(() => page.locator('.pe-hero__video').evaluate(video => video.paused)).toBe(true);
      await page.locator('.tp-hairline__play').scrollIntoViewIfNeeded();
      await page.locator('.tp-hairline__play').click();
      await expect.poll(() => page.locator('.tp-hairline__video').evaluate(video => !video.paused && video.readyState >= 2)).toBe(true);
      await page.locator('.tp-hairline__video').evaluate(video => video.pause());
      await expect(page.locator('.tp-hairline__play')).toBeVisible();
      assert.equal(await page.locator('.tp-hairline__video').evaluate(video => video.controls), false, 'Paused hairline film should show one play control');
      const guideVideo = page.locator('#topper-help .pe-guide__video');
      const guidePlay = page.locator('#topper-help .pe-vplay');
      await expect(guideVideo.locator('source')).toHaveAttribute('src', '/assets/topper-enquiry.mp4');
      await expect(guideVideo).toHaveAttribute('poster', '/assets/topper-enquiry-poster.webp');
      await expect(guidePlay).toBeVisible();
      await guidePlay.click();
      await expect.poll(() => guideVideo.evaluate(video => !video.paused && video.readyState >= 2)).toBe(true);
      await expect(guidePlay).toBeHidden();
      await guideVideo.evaluate(video => video.pause());
    }
    assert.deepEqual(errors, []);
    assert(await page.evaluate(width => document.documentElement.scrollWidth <= width, width), `Overflow after interaction at ${width}`);
    await page.addStyleTag({ content: '.pe-header { visibility: hidden !important; } .pe-specialist__media { position: static !important; }' });
    for (const [id, name] of [['difference', 'difference'], ['base-comparison', 'comparison'], ['why-alchemane', 'why'], ['natural-hairline', 'hairline'], ['topper-help', 'guide'], ['shop', 'shop'], ['hairline-series', 'hairline-series'], ['how', 'consultation'], ['transformations', 'transformations'], ['client-stories', 'stories'], ['faq', 'faq']]) {
      await page.locator(`#${id}`).screenshot({ path: `${out}/${name}-${width}.png` });
    }
    if (width === 320 || width === 390) {
      const lines = await page.locator('#transformations-title span').evaluateAll(spans => spans.map(span => ({ top: span.getBoundingClientRect().top, right: span.getBoundingClientRect().right })));
      assert.equal(lines.length, 2);
      assert(lines[1].top > lines[0].top, 'Phone transformation heading should use two lines');
      assert(lines.every(line => line.right <= width), 'Phone transformation heading should fit the viewport');
    }
    if (width === 390 || width === 1440) {
      const variant = width < 700 ? 'mobile' : 'desktop';
      const otherVariant = width < 700 ? 'desktop' : 'mobile';
      const video = page.locator(`#transformations .pe-transform__video--${variant}`);
      await expect(video).toBeVisible();
      await expect(page.locator(`#transformations .pe-transform__video--${otherVariant}`)).toBeHidden();
      await expect(video.locator('source')).toHaveAttribute('src', `/assets/topper-transformations-${variant}.mp4`);
      await page.locator(`#transformations .pe-transform__video--${variant} + .pe-vplay`).click();
      await expect.poll(() => video.evaluate(element => !element.paused && element.readyState >= 2)).toBe(true);
      await video.evaluate(element => element.pause());
    }
    if (width === 390) {
      const firstReel = page.locator('.tp-client-reel').first();
      const lastReel = page.locator('.tp-client-reel').last();
      await expect(firstReel.locator('video source')).toHaveAttribute('src', '/assets/topper-client-reel-02.mp4');
      await expect(lastReel.locator('video source')).toHaveAttribute('src', '/assets/topper-client-reel-09.mp4');
      await firstReel.locator('.pe-vplay').click();
      await expect.poll(() => firstReel.locator('video').evaluate(video => !video.paused && video.readyState >= 2)).toBe(true);
      await lastReel.locator('.pe-vplay').click();
      await expect.poll(() => lastReel.locator('video').evaluate(video => !video.paused && video.readyState >= 2)).toBe(true);
      await expect.poll(() => firstReel.locator('video').evaluate(video => video.paused)).toBe(true);
      await lastReel.locator('video').evaluate(video => video.pause());
    }
    if (width === 1440) {
      const reasonPositions = await page.locator('.pe-specialist__reasons li').evaluateAll(items => items.slice(0, 3).map(item => ({ x: item.getBoundingClientRect().x, y: item.getBoundingClientRect().y })));
      assert(reasonPositions[1].x > reasonPositions[0].x && reasonPositions[1].y === reasonPositions[0].y && reasonPositions[2].y > reasonPositions[0].y, 'Desktop reasons should use a compact two-column grid');
      const hairlineHeadingLines = await page.locator('#natural-hairline-title span').evaluateAll(spans => spans.map(span => span.getBoundingClientRect().top));
      assert(hairlineHeadingLines[1] > hairlineHeadingLines[0], 'Desktop natural-hairline heading should render as two intentional lines');
      await page.locator('#client-stories [data-rail-dir="1"]').click();
      await expect.poll(() => page.locator('#tp-client-track').evaluate(track => track.scrollLeft > 0)).toBe(true);
    }
    console.log(`Passed topper design ${width} × ${height}`);
    await page.close();
  }
} finally { await browser.close(); }
