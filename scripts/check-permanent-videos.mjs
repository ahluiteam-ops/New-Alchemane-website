import { chromium } from '@playwright/test';
import { createServer } from 'vite';

const port = 4176;
const base = `http://127.0.0.1:${port}`;
const server = await createServer({
  logLevel: 'silent',
  server: { host: '127.0.0.1', port, strictPort: true },
});
await server.listen();

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

    const methodVideos = page.locator('.pe-method__video');
    const railVideos = page.locator('.pe-vcard video');
    if (await methodVideos.count() !== 6) throw new Error('Expected six method videos.');
    if (await railVideos.count() !== 11) throw new Error('Expected four consultation and seven client-result videos.');
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
      '/assets/permanent/testimonial-1.jpg',
      '/assets/permanent/testimonial-2.jpg',
      '/assets/permanent/testimonial-3.jpg',
      '/assets/permanent/testimonial-4.jpg',
      '/assets/permanent/testimonial-5.jpg',
      '/assets/permanent/testimonial-6.jpg',
      '/assets/permanent/testimonial-7.jpg',
    ].join(',')) throw new Error('Client testimonial posters do not match their clips.');
    if (await page.locator('#mpanel-tape source').getAttribute('src') !== '/assets/permanent/method-tape.mp4') {
      throw new Error('Tape method video is not mapped correctly.');
    }
    if (!(await page.getByRole('heading', { name: 'Consultation Options:' }).isVisible())) {
      throw new Error('Original consultation-options card is missing.');
    }
    if (await page.locator('.pe-both .pe-tick').count() !== 2) throw new Error('Original consultation-option ticks are missing.');
    if (!(await page.locator('.pe-guarantee img[src="/assets/permanent/fee-back.webp"]').isVisible())) {
      throw new Error('Original fee-back card artwork is missing.');
    }

    await page.getByRole('tab', { name: 'Feather' }).click();
    if (await page.locator('#mpanel-feather').isHidden()) throw new Error('Feather method panel did not activate.');

    if (setup.isMobile) {
      await page.locator('.pe-methods').evaluate(element => {
        element.dispatchEvent(new PointerEvent('pointerdown', { bubbles: true, pointerId: 1, pointerType: 'touch', clientX: 260, clientY: 160 }));
        element.dispatchEvent(new PointerEvent('pointerup', { bubbles: true, pointerId: 1, pointerType: 'touch', clientX: 120, clientY: 164 }));
      });
      if (await page.locator('#mpanel-vlight').isHidden()) throw new Error('Mobile method swipe did not advance to the next method.');
    }

    const guide = page.locator('#method-guide');
    const guideVideo = guide.locator('.pe-guide__video');
    if (await guide.evaluate(section => section.previousElementSibling?.id) !== 'extension-options'
      || await guide.evaluate(section => section.nextElementSibling?.id) !== 'how') {
      throw new Error('Method decision guide must follow the options and lead into consultation.');
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
      throw new Error('Responsive transformation video selection failed.');
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
      if (!heading || !player || heading.y >= player.y || Math.abs(player.width / player.height - 16 / 9) > .03) {
        throw new Error('Desktop transformation heading or landscape player layout failed.');
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
