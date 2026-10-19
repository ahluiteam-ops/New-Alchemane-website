import { chromium } from '@playwright/test';
import { createServer } from 'vite';
import { mkdir } from 'node:fs/promises';

const port = 4176;
const base = `http://127.0.0.1:${port}`;
const server = await createServer({
  logLevel: 'silent',
  server: { host: '127.0.0.1', port, strictPort: true },
});
await server.listen();
await mkdir('preview/permanent-reels-qa', { recursive: true });

const browser = await chromium.launch({ channel: 'chrome', headless: true });
try {
  for (const setup of [
    { width: 375, height: 812, isMobile: true },
    { width: 390, height: 844, isMobile: true },
    { width: 844, height: 390, isMobile: false },
    { width: 1440, height: 1000, isMobile: false },
  ]) {
    const page = await browser.newPage({
      viewport: { width: setup.width, height: setup.height },
      isMobile: setup.isMobile,
      hasTouch: setup.isMobile,
    });
    await page.goto(`${base}/permanent-extensions.html`, { waitUntil: 'domcontentloaded' });

    if (setup.isMobile) {
      const resultHeading = await page.locator('#results-title').evaluate(element => ({
        scrollWidth: element.scrollWidth,
        clientWidth: element.clientWidth,
        fontSize: getComputedStyle(element).fontSize,
        fontStyle: getComputedStyle(element).fontStyle,
      }));
      const methodHeadingSize = await page.locator('#methods-title').evaluate(element => getComputedStyle(element).fontSize);
      if (resultHeading.scrollWidth > resultHeading.clientWidth || resultHeading.fontSize !== methodHeadingSize || resultHeading.fontStyle !== 'normal') {
        throw new Error('Mobile client-results heading must follow the section type scale without overflowing.');
      }
    }

    const specialistReasons = page.locator('.pe-specialist__reasons li');
    if (await specialistReasons.count() !== 8) throw new Error('Expected eight Alchemane specialist benefits.');
    if (await page.locator('.pe-specialist__reasons .pe-specialist__check').count() !== 8) throw new Error('Every specialist benefit must keep its check icon.');
    if (await specialistReasons.first().locator('h3').textContent() !== 'Precision, Not Guesswork') throw new Error('Specialist benefits are not in the approved order.');

    const sectionOrder = await page.locator('main > section').evaluateAll(sections => sections.map(section => section.id || 'hero'));
    const expectedSectionOrder = ['hero', 'difference', 'what', 'salon-comparison', 'methods', 'method-guide', 'extension-options', 'alchemane-promise', 'transformations', 'results', 'how', 'consultation-promise', 'faq', 'book'];
    if (sectionOrder.join('|') !== expectedSectionOrder.join('|')) {
      throw new Error(`Permanent extension section order is incorrect: ${sectionOrder.join(' > ')}`);
    }
    if (await page.locator('.pe-skip').getAttribute('href') !== '#difference') {
      throw new Error('The skip link must lead to the first section after the hero.');
    }
    const comparison = page.locator('#salon-comparison');
    if (await comparison.locator('tbody tr').count() !== 7) throw new Error('Expected seven salon comparison rows.');
    const comparisonHeaders = await comparison.locator('thead th').allTextContents();
    if (comparisonHeaders.join('|') !== 'Feature|Other salons|Alchemane') throw new Error('Salon comparison columns are incorrect.');
    if (!await comparison.locator('table').evaluate(table => table.scrollWidth <= table.parentElement.clientWidth)) {
      throw new Error(`Salon comparison overflows at ${setup.width}px.`);
    }

    const brandPromise = page.locator('#alchemane-promise');
    if (await brandPromise.locator('li').count() !== 5) {
      throw new Error('Alchemane Promise must contain five points.');
    }

    const methodVideos = page.locator('.pe-method__video');
    const railVideos = page.locator('.pe-vcard video');
    if (await methodVideos.count() !== 6) throw new Error('Expected six method videos.');
    if (await railVideos.count() !== 18) throw new Error('Expected four consultation and fourteen client-result videos.');
    const consultationSources = await page.locator('#consult-track source').evaluateAll(sources => sources.map(source => source.getAttribute('src')));
    if (consultationSources.join(',') !== [
      '/assets/permanent/consult-1.mp4',
      '/assets/permanent/consult-2.mp4',
      '/assets/permanent/consult-3.mp4',
      '/assets/permanent/consult-4.mp4',
    ].join(',')) throw new Error('Consultation video order is incorrect.');
    const consultationPosters = await page.locator('#consult-track video').evaluateAll(videos => videos.map(video => video.getAttribute('poster')));
    if (consultationPosters.join(',') !== [
      '/assets/permanent/consult-1.webp',
      '/assets/permanent/consult-2.webp',
      '/assets/permanent/consult-3.webp',
      '/assets/permanent/consult-4.webp',
    ].join(',')) throw new Error('Consultation video posters do not match their clips.');
    const testimonialSources = await page.locator('#results-track source').evaluateAll(sources => sources.map(source => source.getAttribute('src')));
    if (testimonialSources.join(',') !== [
      ...Array.from({ length: 7 }, (_, index) => `/assets/permanent/testimonial-new-${index + 1}.mp4`),
      '/assets/permanent/testimonial-1.mp4',
      '/assets/permanent/testimonial-2.mp4',
      '/assets/permanent/testimonial-3.mp4',
      '/assets/permanent/testimonial-4.mp4',
      '/assets/permanent/testimonial-5.mp4',
      '/assets/permanent/testimonial-6.mp4',
      '/assets/permanent/testimonial-7.mp4',
    ].join(',')) throw new Error('Client testimonial video order is incorrect.');
    const testimonialPosters = await page.locator('#results-track video').evaluateAll(videos => videos.map(video => video.getAttribute('poster')));
    if (testimonialPosters.join(',') !== [
      ...Array.from({ length: 7 }, (_, index) => `/assets/permanent/testimonial-new-${index + 1}.jpg`),
      '/assets/permanent/testimonial-1.jpg',
      '/assets/permanent/testimonial-2.jpg',
      '/assets/permanent/testimonial-3.jpg',
      '/assets/permanent/testimonial-4.jpg',
      '/assets/permanent/testimonial-5.jpg',
      '/assets/permanent/testimonial-6.jpg',
      '/assets/permanent/testimonial-7.jpg',
    ].join(',')) throw new Error('Client testimonial posters do not match their clips.');
    if (await page.locator('#results .pe-dots span').count() !== 14) throw new Error('Each client video needs a navigation dot.');
    if (setup.width === 390 || setup.width === 1440) {
      await page.locator('#results').screenshot({ path: `preview/permanent-reels-qa/results-${setup.width}.png` });
    }
    if (setup.width === 390) {
      await page.locator('#results-track .pe-vplay').first().click();
      await page.waitForFunction(() => {
        const video = document.querySelector('#results-track video');
        return !video.paused && video.readyState >= 2;
      }, null, { timeout: 15000 });
      await page.locator('#results-track video').first().evaluate(video => video.pause());
    }
    if (await page.locator('#mpanel-tape source').getAttribute('src') !== '/assets/permanent/method-tape.mp4') {
      throw new Error('Tape method video is not mapped correctly.');
    }
    if (!(await page.getByRole('heading', { name: 'How would you like to meet?' }).first().isVisible())) {
      throw new Error('Consultation mode selector is missing.');
    }
    const consultationChoice = page.locator('[data-consultation-choice]');
    if (await consultationChoice.locator('[data-consultation-mode]').count() !== 2) throw new Error('Expected Online and Offline consultation choices.');
    await consultationChoice.getByRole('button', { name: 'Online' }).click();
    if (await page.locator('#pe-form input[name="meet"]').inputValue() !== 'Online') throw new Error('Consultation-card choice did not carry into the booking form.');
    if (await page.locator('[data-consultation-choice-cta]').textContent() !== 'Book an online consultation') throw new Error('Consultation CTA did not match the Online choice.');
    await page.locator('#pe-form [data-meet-option="Khar West studio"]').click();
    if (await consultationChoice.getByRole('button', { name: 'Offline' }).getAttribute('aria-pressed') !== 'true') throw new Error('Booking-form choice did not sync back to the consultation card.');
    const promise = page.locator('#consultation-promise');
    if (await page.locator('#how .pe-guarantee').count() !== 0
      || !(await promise.locator('img[src="/assets/permanent/fee-back.webp"]').isVisible())
      || await promise.getByRole('link', { name: 'Book a consultation now' }).getAttribute('href') !== '#book') {
      throw new Error('Dedicated consultation promise section is missing or incorrectly placed.');
    }

    const methodTabs = page.locator('.pe-mtabs [role="tab"]');
    if (await methodTabs.first().textContent() !== 'Feather') throw new Error('Feather must be the first method tab.');
    if (await methodTabs.first().getAttribute('aria-selected') !== 'true') throw new Error('Feather must be selected by default.');
    if (await page.locator('#mpanel-feather').isHidden()) throw new Error('Feather method panel did not activate.');

    if (setup.isMobile) {
      const touch = await page.context().newCDPSession(page);
      const swipeMethod = async (selector, direction, fromControls = false) => {
        const target = page.locator(selector);
        await target.scrollIntoViewIfNeeded();
        const bounds = await target.boundingBox();
        if (!bounds) throw new Error(`Method swipe target is not visible: ${selector}`);
        const x = Math.round(bounds.x + bounds.width * (direction === 'left' ? .66 : .34));
        const y = Math.round(fromControls ? bounds.y + bounds.height - 20 : bounds.y + Math.min(bounds.height / 2, 70));
        const distance = direction === 'left' ? -160 : 160;
        await touch.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [{ x, y, id: 1 }] });
        for (let step = 1; step <= 8; step += 1) {
          await touch.send('Input.dispatchTouchEvent', { type: 'touchMove', touchPoints: [{ x: x + distance * step / 8, y, id: 1 }] });
        }
        await touch.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] });
      };
      await swipeMethod('#mpanel-feather .pe-vplay', 'left');
      if (await page.locator('#mpanel-tape').isHidden()) throw new Error('Swiping the method video did not advance to Tape-in.');
      if (!await page.locator('#mpanel-feather video').evaluate(video => video.paused)) throw new Error('A video swipe started playback.');
      await swipeMethod('#mpanel-tape .pe-method__details li:first-child', 'left');
      if (await page.locator('#mpanel-micro-ring').isHidden()) throw new Error('Swiping method copy did not advance to Micro Ring.');
      await swipeMethod('#mpanel-micro-ring .pe-method__copy h3', 'right');
      if (await page.locator('#mpanel-tape').isHidden()) throw new Error('Swiping right did not return to Tape-in.');
      await page.locator('#mtab-feather').click();
      // A played-and-paused clip retains native controls. Recreate that state
      // without depending on headless Chrome's media decoder/network timing.
      await page.locator('#mpanel-feather video').evaluate(video => video.dispatchEvent(new Event('play')));
      if (!await page.locator('#mpanel-feather video').evaluate(video => video.paused && video.controls)) {
        throw new Error('The paused-with-controls regression state was not set up.');
      }
      await swipeMethod('#mpanel-feather video', 'left', true);
      if (await page.locator('#mpanel-feather').isHidden()) throw new Error('Swiping the paused video control strip should not change methods.');
      await swipeMethod('#mpanel-feather video', 'left');
      if (await page.locator('#mpanel-tape').isHidden()) throw new Error('Swiping a paused method video did not advance to Tape-in.');
      await touch.detach();
    }

    const guide = page.locator('#method-guide');
    const guideVideo = guide.locator('.pe-guide__video');
    if (await guide.evaluate(section => section.previousElementSibling?.id) !== 'methods'
      || await guide.evaluate(section => section.nextElementSibling?.id) !== 'extension-options') {
      throw new Error('Method decision guide must follow the methods and lead into the extension options.');
    }
    if (await guideVideo.getAttribute('poster') !== '/assets/permanent/hair-extension-enquiry-poster.webp'
      || await guideVideo.locator('source').getAttribute('src') !== '/assets/permanent/hair-extension-enquiry.mp4'
      || await guideVideo.getAttribute('preload') !== 'none') {
      throw new Error('Method decision guide media is mapped or loaded incorrectly.');
    }
    if (await guide.locator('.pe-guide__kicker, .pe-guide__chapters, .pe-guide__whatsapp, .pe-guide__transcript, figcaption').count() !== 0
      || await guide.locator('.pe-guide__actions .pe-btn').count() !== 1) {
      throw new Error('Method decision guide still contains removed content or is missing its consultation CTA.');
    }
    if (setup.width < 700) {
      const heading = await guide.locator('h2').evaluate(element => {
        const style = getComputedStyle(element);
        return { scrollWidth: element.scrollWidth, clientWidth: element.clientWidth, fontSize: style.fontSize };
      });
      if (heading.scrollWidth > heading.clientWidth || heading.fontSize !== await page.locator('#methods-title').evaluate(element => getComputedStyle(element).fontSize)) {
        throw new Error('Mobile method guide heading must use the section scale without overflowing.');
      }
      const [sectionBox, actionBox] = await Promise.all([
        guide.boundingBox(),
        guide.locator('.pe-guide__actions').boundingBox(),
      ]);
      if (!sectionBox || !actionBox || Math.abs((sectionBox.x + sectionBox.width / 2) - (actionBox.x + actionBox.width / 2)) > 1) {
        throw new Error('Mobile method guide CTA is not centred.');
      }
    } else {
      const intro = await guide.locator('.pe-guide__intro').boundingBox();
      const player = await guideVideo.boundingBox();
      if (!intro || !player || intro.x >= player.x || Math.abs(player.width / player.height - 9 / 16) > .03) {
        throw new Error('Desktop method guide split layout or portrait player ratio failed.');
      }
    }

    const shown = setup.isMobile ? '.pe-transform__video--mobile' : '.pe-transform__video--desktop';
    const hidden = setup.isMobile ? '.pe-transform__video--desktop' : '.pe-transform__video--mobile';
    if (!(await page.locator(shown).isVisible()) || await page.locator(hidden).isVisible()) {
      const states = await page.locator('.pe-transform__video').evaluateAll(videos => videos.map(video => ({
        className: video.className,
        display: getComputedStyle(video).display,
        width: video.getBoundingClientRect().width,
        height: video.getBoundingClientRect().height,
      })));
      throw new Error(`Responsive transformation video selection failed at ${setup.width}px: ${JSON.stringify(states)}.`);
    }
    const mobileTransform = page.locator('.pe-transform__video--mobile');
    if (await mobileTransform.getAttribute('poster') !== '/assets/client-portrait-collage-v2.webp') {
      throw new Error('Mobile transformation video must retain the temporary previous thumbnail.');
    }
    if (await page.locator('#expert, #studio').count() !== 0) {
      throw new Error('Removed expert and Khar West sections are still rendered.');
    }

    if (!setup.isMobile) {
      const heading = await page.locator('#transformations-title').boundingBox();
      const player = await page.locator(shown).boundingBox();
      const placementFailed = setup.width >= 1000 ? heading?.x >= player?.x : heading?.y >= player?.y;
      if (!heading || !player || placementFailed || Math.abs(player.width / player.height - 16 / 9) > .03) {
        throw new Error(`Desktop transformation heading or landscape player layout failed at ${setup.width}px: ${JSON.stringify({ heading, player })}.`);
      }
    }
    if (!await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)) {
      throw new Error(`Permanent extensions page overflows horizontally at ${setup.width}px.`);
    }
    await page.close();
  }
  console.log('Permanent-extension video checks passed.');
} finally {
  await browser.close();
  await server.close();
}
