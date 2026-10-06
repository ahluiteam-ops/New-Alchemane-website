import { chromium } from '@playwright/test';
import { createServer } from 'vite';

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
    const sectionOrder = await page.locator('main > section').evaluateAll(sections => sections.map(section => section.id || 'hero'));
    const expectedOrder = ['hero', 'journey', 'difference', 'stories', 'types', 'plan', 'how', 'order', 'transformations', 'faq', 'book'];
    if (sectionOrder.join(',') !== expectedOrder.join(',')) {
      throw new Error(`Wigs section order is incorrect: ${sectionOrder.join(', ')}.`);
    }
    if (await page.locator('#stories-track video').count() !== 7) throw new Error('Expected seven client testimonial videos.');
    if (await page.locator('#stories-track .pe-vplay').count() !== 7) throw new Error('Each testimonial needs a play control.');

    const sources = await page.locator('#stories-track source').evaluateAll(elements => elements.map(element => element.getAttribute('src')));
    const posters = await page.locator('#stories-track video').evaluateAll(elements => elements.map(element => element.getAttribute('poster')));
    const preload = await page.locator('#stories-track video').evaluateAll(elements => elements.map(element => element.getAttribute('preload')));
    if (sources.join(',') !== expectedSources.join(',')) throw new Error('Client testimonial video order is incorrect.');
    if (posters.join(',') !== expectedPosters.join(',')) throw new Error('Client testimonial posters do not match their clips.');
    if (preload.some(value => value !== 'none')) throw new Error('Testimonials must not preload their video files.');

    if (await page.locator('.wg-journeys > li').count() !== 3) throw new Error('Expected three hair-loss journey cards.');
    if (await page.locator('.wg-types > li').count() !== 3) throw new Error('Expected three wig-type cards.');
    if (await page.locator('[data-youtube]').count() !== 2) throw new Error('Expected the wig-types and head-measurement videos.');
    if (await page.locator('#trust, #studio').count() !== 0) throw new Error('Removed trust and studio sections are still rendered.');

    if (await page.locator('#consult-track > li').count() !== 4) throw new Error('Expected four consultation video slots.');
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
    if (await page.locator('#transformations h2').textContent() !== 'See real hair transformations') {
      throw new Error('The real hair transformations section is missing.');
    }

    await page.getByRole('button', { name: 'Next transformation', exact: true }).click();
    await page.waitForFunction(() => document.querySelector('[data-diff-status]').textContent.includes('2'));

    const firstEmbed = page.locator('[data-youtube]').first();
    await firstEmbed.locator('button').click();
    const embedSource = await firstEmbed.locator('iframe').getAttribute('src');
    if (!embedSource?.startsWith('https://www.youtube-nocookie.com/embed/xdWbadk9rtU?')) {
      throw new Error('Wig-types video did not create the privacy-enhanced YouTube embed.');
    }

    await page.locator('.wg-type-card').first().locator('a').click();
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
