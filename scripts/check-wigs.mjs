import { chromium } from '@playwright/test';
import { createServer } from 'vite';
import { mkdir } from 'node:fs/promises';

const port = 4177;
const base = `http://127.0.0.1:${port}`;
const server = await createServer({
  logLevel: 'silent',
  server: { host: '127.0.0.1', port, strictPort: true },
});
await server.listen();

const expectedSources = Array.from({ length: 7 }, (_, index) => `/assets/wigs/testimonial-${index + 1}.mp4`);
const expectedPosters = Array.from({ length: 7 }, (_, index) => `/assets/wigs/testimonial-${index + 1}.webp`);
const browser = await chromium.launch({ channel: 'chrome', headless: true });
await mkdir('preview/wig-guide-qa', { recursive: true });
await mkdir('preview/wigs-hero-qa', { recursive: true });
await mkdir('preview/wigs-transformations-qa', { recursive: true });
await mkdir('preview/wigs-products-qa', { recursive: true });
await mkdir('preview/wigs-new-sections-qa', { recursive: true });

try {
  for (const setup of [
    { width: 320, height: 700, isMobile: true },
    { width: 390, height: 844, isMobile: true },
    { width: 768, height: 1024, isMobile: false },
    { width: 1440, height: 1000, isMobile: false },
  ]) {
    const page = await browser.newPage({
      viewport: { width: setup.width, height: setup.height },
      isMobile: setup.isMobile,
      hasTouch: setup.isMobile,
    });
    const runtimeErrors = [];
    page.on('console', message => {
      const text = message.text();
      if (message.type() === 'error' && !text.startsWith('Permissions policy violation: compute-pressure')) runtimeErrors.push(text);
    });
    page.on('pageerror', error => runtimeErrors.push(String(error)));

    await page.goto(`${base}/wigs.html`, { waitUntil: 'domcontentloaded' });

    if (await page.locator('h1').count() !== 1) throw new Error('Wigs page must have exactly one h1.');
    const hero = page.locator('.pe-hero');
    if (await hero.locator('.pe-hero__eyebrow').textContent() !== 'Hair wigs'
      || !(await hero.locator('h1').textContent()).includes('looks natural and feels comfortable')) {
      throw new Error('The wigs hero must identify the service and its natural, comfortable fit.');
    }
    if (await hero.locator('.pe-hero__sub').count() !== 0) throw new Error('The hero paragraph should be removed.');
    if (await hero.locator('[data-hero-cta]').getAttribute('href') !== '#book') {
      throw new Error('The wigs hero consultation action is incorrect.');
    }
    const heroAction = await hero.locator('.pe-hero__action').boundingBox();
    const heroMedia = await hero.locator('.pe-hero__media').boundingBox();
    if (setup.width < 1000 && heroAction.y + heroAction.height > heroMedia.y + 1) {
      throw new Error(`The hero consultation action must sit above the video at ${setup.width}px.`);
    }
    await hero.screenshot({ path: `preview/wigs-hero-qa/hero-${setup.width}.png` });
    const sectionOrder = await page.locator('main > section').evaluateAll(sections => sections.map(section => section.id || 'hero'));
    const expectedOrder = ['hero', 'journey', 'natural-hairline', 'difference', 'stories', 'wig-comparison', 'types', 'wig-guide', 'wig-options', 'alchemane-promise', 'plan', 'order', 'transformations', 'wig-expert', 'consultation-promise', 'faq', 'book'];
    if (sectionOrder.join(',') !== expectedOrder.join(',')) {
      throw new Error(`Wigs section order is incorrect: ${sectionOrder.join(', ')}.`);
    }
    const hairlinePlay = page.locator('#natural-hairline').getByRole('button', { name: 'Natural hairline video coming soon', disabled: true });
    if (await hairlinePlay.count() !== 1 || !await hairlinePlay.isDisabled()) {
      throw new Error('The natural-hairline feature needs one disabled play button until its video is available.');
    }
    if (await page.locator('#stories-track video').count() !== 7) throw new Error('Expected seven client testimonial videos.');
    if (await page.locator('#stories-track .pe-vplay').count() !== 7) throw new Error('Each testimonial needs a play control.');
    if (await page.locator('#stories .pe-dots').count() !== 0) throw new Error('Client-story pagination dots should be removed.');

    const sources = await page.locator('#stories-track source').evaluateAll(elements => elements.map(element => element.getAttribute('src')));
    const posters = await page.locator('#stories-track video').evaluateAll(elements => elements.map(element => element.getAttribute('poster')));
    const preload = await page.locator('#stories-track video').evaluateAll(elements => elements.map(element => element.getAttribute('preload')));
    if (sources.join(',') !== expectedSources.join(',')) throw new Error('Client testimonial video order is incorrect.');
    if (posters.join(',') !== expectedPosters.join(',')) throw new Error('Client testimonial posters do not match their clips.');
    if (preload.some(value => value !== 'none')) throw new Error('Testimonials must not preload their video files.');

    if (setup.width === 390) {
      await page.locator('#stories').scrollIntoViewIfNeeded();
      const storyCards = await page.locator('#stories-track .pe-vcard').evaluateAll(cards => {
        const active = cards.find(card => card.classList.contains('is-active'));
        const neighbour = cards.find(card => card !== active);
        const trackBox = active.parentElement.getBoundingClientRect();
        const activeBox = active.getBoundingClientRect();
        return {
          activeWidth: activeBox.width,
          neighbourWidth: neighbour.getBoundingClientRect().width,
          centerOffset: activeBox.left + activeBox.width / 2 - (trackBox.left + trackBox.width / 2),
        };
      });
      if (Math.abs(storyCards.neighbourWidth / storyCards.activeWidth - .8) >= .02) {
        throw new Error('Mobile story neighbours should be 80% of the active card.');
      }
      if (Math.abs(storyCards.centerOffset) >= 2) throw new Error('The active mobile story should be centred.');
      const playIcon = await page.locator('#stories-track .pe-vcard').nth(1).locator('.pe-vplay svg').boundingBox();
      if (Math.abs(playIcon.width - 46) >= 1 || Math.abs(playIcon.height - 46) >= 1) {
        throw new Error('Mobile story play controls should match the homepage 46px size.');
      }
      await page.locator('#stories').screenshot({ path: 'preview/wigs-new-sections-qa/stories-mobile-390.png' });
      await page.locator('#stories-track .pe-vcard').first().locator('.pe-vplay').click();
      const storyDialog = page.locator('.story-film-dialog[open]');
      await storyDialog.waitFor({ state: 'visible' });
      await page.waitForFunction(() => {
        const video = document.querySelector('.story-film-dialog[open] video');
        return video && !video.paused && !video.muted && video.readyState >= 2;
      });
      await storyDialog.locator('[data-story-next]').click();
      await page.waitForFunction(() => document.querySelector('.story-film-dialog[open] .product-film-slide.is-active')?.dataset.storyIndex === '1');
      await storyDialog.locator('[data-story-close]').click();
      await storyDialog.waitFor({ state: 'hidden' });
      await page.waitForFunction(() => document.activeElement === document.querySelectorAll('#stories-track .pe-vplay')[1]);
    }

    if (await page.locator('.wg-journeys > li').count() !== 3) throw new Error('Expected three hair-loss journey cards.');
    if (await page.locator('#types .wg-youtube').count() !== 1 || await page.locator('#types .pe-product-card').count() !== 0) {
      throw new Error('The wig-types section should contain only its explainer video.');
    }
    const wigProducts = page.locator('#wig-options');
    if (await wigProducts.getByRole('heading', { name: 'Choose your real wigs' }).count() !== 1
      || await wigProducts.locator('.pe-product-grid > li').count() !== 4) {
      throw new Error('The separate wig options section needs its heading and four product cards.');
    }
    const wigProductNames = await wigProducts.locator('.pe-product-card__name').allTextContents();
    if (wigProductNames.join(',') !== 'European Wig,Lace Wig,Skin-Top Wig,Wig with Natural Hairline') {
      throw new Error('The wig product cards are missing or out of order.');
    }
    if (await wigProducts.locator('.pe-products__help').getAttribute('href') !== '#book') {
      throw new Error('The wig options expert-help link is incorrect.');
    }
    await wigProducts.locator('img').evaluateAll(images => Promise.all(images.map(image => {
      image.loading = 'eager';
      return image.decode();
    })));
    await wigProducts.screenshot({ path: `preview/wigs-products-qa/products-${setup.width}.png` });
    const wigComparison = page.locator('#wig-comparison');
    if (await wigComparison.getByRole('heading', { name: 'Other Wig Companies vs Alchemane Wigs' }).count() !== 1
      || await wigComparison.locator('tbody tr').count() !== 10) {
      throw new Error('The wig comparison heading or ten comparison rows are missing.');
    }
    const comparisonRows = await wigComparison.locator('tbody tr').evaluateAll(rows => rows.map(row => [...row.cells].map(cell => cell.textContent.trim())));
    const expectedComparison = [
      ['Texture', 'Looks artificial', 'Natural'],
      ['Volume', 'Too bulky', 'Balanced'],
      ['Hairline', 'Visible & artificial', 'Ultra natural'],
      ['Size', 'One-size', 'Custom'],
      ['Base Type', 'Retail', 'Tailored'],
      ['Movement', 'Stiff', 'Natural'],
      ['Fit', 'Online, often misfit', 'Custom, perfect fit'],
      ['Hair Type', 'Synthetic / mixed', '100% human hair'],
      ['Comfort', 'Heavy & uncomfortable', 'Lightweight & breathable'],
      ['Safety', 'Irritation-prone', 'Medical-grade lining'],
    ];
    if (JSON.stringify(comparisonRows) !== JSON.stringify(expectedComparison)) throw new Error('The wig comparison differs from the supplied content.');
    const wigPromise = page.locator('#alchemane-promise');
    const promiseItems = await wigPromise.locator('li').evaluateAll(items => items.map(item =>
      `${item.querySelector('h3').textContent.trim()} ${item.querySelector('p').textContent.trim()}`));
    const expectedPromiseItems = [
      'Designed to Match You Matches your original hair’s look and fall.',
      'Emotionally Grounded Restores confidence, not just appearance.',
      'Custom-Crafted Tailored to your face and lifestyle.',
      'Natural Movement Flows and parts like real hair.',
      'Confidence-First You’ll feel like yourself again.',
    ];
    if (await wigPromise.getByRole('heading', { name: 'The Alchemane Promise' }).count() !== 1
      || !await wigPromise.textContent().then(text => text.includes('Because your wig should feel like you.'))
      || JSON.stringify(promiseItems) !== JSON.stringify(expectedPromiseItems)) {
      throw new Error('The wig-specific Alchemane Promise is incomplete.');
    }
    const consultationPromise = page.locator('#consultation-promise');
    if (await consultationPromise.getByRole('heading', { name: "Let's start with a consultation" }).count() !== 1
      || await consultationPromise.getByRole('link', { name: 'Book a consultation now' }).getAttribute('href') !== '#book') {
      throw new Error('The consultation reassurance section is incomplete.');
    }
    await consultationPromise.locator('img').evaluate(image => {
      image.loading = 'eager';
      return image.decode();
    });
    await wigComparison.evaluate(section => section.scrollIntoView({ block: 'start', behavior: 'instant' }));
    const comparisonTitleBox = await wigComparison.locator('h2').boundingBox();
    const stickyHeaderBox = await page.locator('.pe-header').boundingBox();
    if (comparisonTitleBox.y < stickyHeaderBox.y + stickyHeaderBox.height - 1) {
      throw new Error(`The wig comparison heading is obscured by the header at ${setup.width}px.`);
    }
    await page.screenshot({ path: `preview/wigs-new-sections-qa/comparison-viewport-${setup.width}.png` });
    await wigComparison.screenshot({ path: `preview/wigs-new-sections-qa/comparison-${setup.width}.png` });
    await wigPromise.screenshot({ path: `preview/wigs-new-sections-qa/promise-${setup.width}.png` });
    await consultationPromise.screenshot({ path: `preview/wigs-new-sections-qa/consultation-${setup.width}.png` });
    const wigExpert = page.locator('#wig-expert');
    await wigExpert.locator('img').evaluate(image => {
      image.loading = 'eager';
      return image.decode();
    });
    await wigExpert.evaluate(section => section.scrollIntoView({ block: 'start', behavior: 'instant' }));
    await wigExpert.screenshot({
      path: `preview/wigs-new-sections-qa/expert-${setup.width}.png`,
      style: '.pe-header, .floating-contact { visibility: hidden !important; }',
    });
    if (await page.locator('[data-youtube]').count() !== 2) throw new Error('Expected the wig-types and head-measurement videos.');
    if (await page.locator('#trust, #studio').count() !== 0) throw new Error('Removed trust and studio sections are still rendered.');

    const wigGuide = page.locator('#wig-guide');
    if (await wigGuide.getByRole('heading', { name: 'Still unsure which wig is right for you?' }).count() !== 1) {
      throw new Error('The wig decision guide heading is missing.');
    }
    if (await wigGuide.locator('.pe-guide__media').isHidden()) throw new Error('The wig guide frame is not visible.');
    if (await wigGuide.locator('img, video, source').count() !== 0) {
      throw new Error('The wig guide frame must remain free of media until the film is available.');
    }
    const guidePlay = wigGuide.getByRole('button', { name: 'Wig guide video coming soon', disabled: true });
    if (await guidePlay.count() !== 1 || !await guidePlay.isDisabled()) {
      throw new Error('The unavailable wig guide needs one disabled play button.');
    }
    const guideFrame = await wigGuide.locator('.pe-guide__video').boundingBox();
    const playBadge = await guidePlay.boundingBox();
    if (Math.abs(playBadge.x + playBadge.width / 2 - guideFrame.x - guideFrame.width / 2) > 1
      || Math.abs(playBadge.y + playBadge.height / 2 - guideFrame.y - guideFrame.height / 2) > 1) {
      throw new Error(`The wig guide play button is off-center at ${setup.width}px.`);
    }
    if (Math.abs(guideFrame.height - guideFrame.width * 4 / 3) > 2) {
      throw new Error(`The empty wig guide frame has the wrong proportions at ${setup.width}px.`);
    }
    if (await wigGuide.getByRole('link', { name: 'Book a one-to-one consultation' }).getAttribute('href') !== '#book') {
      throw new Error('The wig guide consultation link is incorrect.');
    }
    if (setup.width < 700) {
      const cta = await wigGuide.locator('.pe-guide__actions .pe-btn').boundingBox();
      if (Math.abs(cta.x - guideFrame.x) > 1 || Math.abs(cta.width - guideFrame.width) > 1) {
        throw new Error(`The wig guide CTA should fill the padded content width at ${setup.width}px.`);
      }
    }
    await wigGuide.screenshot({ path: `preview/wig-guide-qa/guide-${setup.width}.png` });
    const measurement = page.locator('#order [data-youtube]');
    if (!await measurement.isVisible() || await measurement.locator('iframe').count() !== 0) {
      throw new Error('The head-measurement poster must be visible before playback.');
    }
    const measurementPlay = measurement.getByRole('button', { name: 'Play: how to measure your head' });
    await measurementPlay.focus();
    await measurementPlay.press('Enter');
    if (!(await measurement.locator('iframe').getAttribute('src'))?.startsWith('https://www.youtube-nocookie.com/embed/IWrdvU82aP4?')) {
      throw new Error('The head-measurement play control did not load the correct video.');
    }
    const transformation = page.locator('#transformations');
    const transformationHeading = transformation.locator('h2');
    if (await transformationHeading.textContent() !== 'See real hair transformations') {
      throw new Error('The real hair transformations section is missing.');
    }
    const transformationVideos = transformation.locator('video');
    if (await transformationVideos.count() !== 2) throw new Error('The transformations section needs both responsive video cuts.');
    const transformationSources = await transformationVideos.locator('source').evaluateAll(sources => sources.map(source => source.getAttribute('src')));
    if (transformationSources.join(',') !== '/assets/wigs/transformations-mobile.mp4,/assets/wigs/transformations-desktop.mp4') {
      throw new Error('The transformations section uses the wrong video sources.');
    }
    const transformationPosters = await transformationVideos.evaluateAll(videos => videos.map(video => video.getAttribute('poster')));
    if (transformationPosters.join(',') !== '/assets/wigs/transformations-mobile.webp,/assets/wigs/transformations-desktop.webp') {
      throw new Error('The transformation posters should match their video cuts.');
    }
    if ((await transformationVideos.evaluateAll(videos => videos.map(video => video.preload))).some(value => value !== 'none')) {
      throw new Error('Transformation videos should not preload.');
    }
    const selectedVideo = transformationVideos.nth(setup.width < 700 ? 0 : 1);
    const inactiveVideo = transformationVideos.nth(setup.width < 700 ? 1 : 0);
    if (!await selectedVideo.isVisible() || !await inactiveVideo.isHidden()) {
      throw new Error(`The wrong transformation video is visible at ${setup.width}px.`);
    }
    const titleBox = await transformationHeading.boundingBox();
    const filmBox = await transformation.locator('.client-film-frame').boundingBox();
    if (titleBox.y + titleBox.height > filmBox.y || Math.abs(titleBox.x + titleBox.width / 2 - filmBox.x - filmBox.width / 2) > 2) {
      throw new Error(`The transformation heading must be centered above the film at ${setup.width}px.`);
    }
    const targetRatio = setup.width < 700 ? 4 / 5 : 16 / 9;
    if (Math.abs(filmBox.width / filmBox.height - targetRatio) > .015) {
      throw new Error(`The transformation film has the wrong aspect ratio at ${setup.width}px.`);
    }
    const playTransformation = transformation.locator('.client-film-frame .pe-vplay');
    if (await playTransformation.count() !== 2 || !await playTransformation.nth(setup.width < 700 ? 0 : 1).isVisible()) {
      throw new Error(`The transformation film needs a visible play button at ${setup.width}px.`);
    }
    await transformation.screenshot({ path: `preview/wigs-transformations-qa/transformations-${setup.width}.png` });
    await playTransformation.nth(setup.width < 700 ? 0 : 1).click();
    await page.waitForFunction(index => {
      const video = document.querySelectorAll('#transformations video')[index];
      return !video.paused && video.currentTime > 0 && video.controls;
    }, setup.width < 700 ? 0 : 1, { timeout: 20000 });
    await selectedVideo.evaluate(video => video.pause());

    await page.getByRole('button', { name: 'Next transformation', exact: true }).click();
    await page.waitForFunction(() => document.querySelector('[data-diff-status]').textContent.includes('2'));

    const firstEmbed = page.locator('[data-youtube]').first();
    await firstEmbed.locator('button').click();
    const embedSource = await firstEmbed.locator('iframe').getAttribute('src');
    if (!embedSource?.startsWith('https://www.youtube-nocookie.com/embed/xdWbadk9rtU?')) {
      throw new Error('Wig-types video did not create the privacy-enhanced YouTube embed.');
    }

    await wigProducts.locator('.wg-type-card').first().locator('a').click();
    const selection = page.locator('.pe-product-selection');
    const selectionText = await selection.textContent();
    if (await selection.isHidden() || !selectionText?.includes('a European wig')) {
      throw new Error('Wig-type selection was not carried into the consultation form.');
    }

    await page.evaluate(() => {
      window.open = url => {
        window.__wigsOpenedUrl = String(url);
        return null;
      };
    });
    await page.locator('#pe-form input[name="name"]').fill('Test Client');
    await page.locator('#pe-form input[name="phone"]').fill('+91 98765 43210');
    await page.locator('#pe-form').evaluate(form => form.requestSubmit());
    const openedUrl = await page.evaluate(() => window.__wigsOpenedUrl);
    if (!openedUrl?.startsWith('https://wa.me/919967123333?text=') || !decodeURIComponent(openedUrl).includes('Interested in: a European wig')) {
      throw new Error('Consultation form did not create the expected WhatsApp request.');
    }

    const consultationTab = page.getByRole('tab', { name: 'Consultation' });
    await consultationTab.focus();
    await consultationTab.press('ArrowRight');
    if (await page.getByRole('tab', { name: 'Wigs' }).getAttribute('aria-selected') !== 'true'
      || !await page.locator('#faq-panel-consultation').isHidden()) {
      throw new Error('FAQ keyboard navigation did not select the Wigs panel.');
    }

    await page.evaluate(async () => {
      for (let y = 0; y < document.documentElement.scrollHeight; y += 600) {
        window.scrollTo(0, y);
        await new Promise(resolve => setTimeout(resolve, 20));
      }
      window.scrollTo(0, 0);
    });
    const brokenImages = await page.locator('img').evaluateAll(images => images
      .filter(image => image.complete && image.naturalWidth === 0)
      .map(image => image.getAttribute('src')));
    if (brokenImages.length) throw new Error(`Broken images: ${brokenImages.join(', ')}`);
    if (!await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)) {
      throw new Error(`Wigs page overflows horizontally at ${setup.width}px.`);
    }
    if (runtimeErrors.length) throw new Error(`Runtime errors at ${setup.width}px: ${runtimeErrors.join(' | ')}`);

    await page.close();
  }
  console.log('Wigs page checks passed.');
} finally {
  await browser.close();
  await server.close();
}
