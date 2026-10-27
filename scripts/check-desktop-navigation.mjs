import assert from 'node:assert/strict';
import { chromium } from '@playwright/test';

const base = process.env.BASE_URL ?? 'http://127.0.0.1:5173';
const browser = await chromium.launch({ channel: 'chrome', headless: true });
const routes = [
  ['/', 'Home'],
  ['/permanent-extensions.html', 'Permanent Extensions'],
  ['/toppers.html', 'Hair Toppers'],
  ['/wigs.html', 'Wigs'],
  ['/blogs.html', 'Blogs'],
  ['/consultation.html', 'Book A Consultation'],
];

try {
  for (const width of [1100, 1440]) {
    const page = await browser.newPage({ viewport: { width, height: 900 } });
    for (const [route, current] of routes) {
      const errors = [];
      page.on('pageerror', error => errors.push(error.message));
      const response = await page.goto(base + route, { waitUntil: 'domcontentloaded' });
      await page.locator('.shopnav__desktop-trigger').waitFor();
      assert.equal(response.status(), 200, route);
      const state = await page.evaluate(() => {
        const header = document.querySelector('.site-header, .pe-header, .blog-header, .consult-header');
        const nav = header.querySelector('.main-nav, .pe-nav, .blog-nav, .consult-nav');
        const current = nav.querySelector('[aria-current="page"]');
        const shop = nav.querySelector('.shopnav__desktop-trigger');
        const cta = header.querySelector('.header-cta, .pe-header__cta, .desktop-header-cta');
        const underline = current && getComputedStyle(current, '::after');
        const rect = node => node.getBoundingClientRect();
        return {
          height: rect(header).height,
          logoWidth: rect(header.querySelector('img')).width,
          navCenter: rect(nav).left + rect(nav).width / 2,
          current: current?.textContent.trim(),
          underline: underline?.transform,
          shopWeight: getComputedStyle(shop).fontWeight,
          cta: cta?.textContent.trim(),
          ctaVisible: getComputedStyle(cta).display !== 'none',
          ctaCurrent: cta?.getAttribute('aria-current'),
          overflow: document.documentElement.scrollWidth > innerWidth,
        };
      });
      assert.equal(state.height, 88, `${route}: header height at ${width}`);
      assert.equal(state.logoWidth, 160, `${route}: logo width`);
      assert(Math.abs(state.navCenter - width / 2) < 2, `${route}: centered navigation`);
      assert.equal(state.current, current, `${route}: current page`);
      if (route === '/consultation.html') assert.equal(state.ctaCurrent, 'page', `${route}: current action`);
      else assert.equal(state.underline, 'matrix(1, 0, 0, 1, 0, 0)', `${route}: active underline`);
      assert.equal(state.shopWeight, '400', `${route}: Shop text weight`);
      assert.equal(state.cta, 'Book consultation', `${route}: action label`);
      assert(state.ctaVisible, `${route}: action visible`);
      assert(!state.overflow, `${route}: horizontal overflow`);
      assert.deepEqual(errors, [], `${route}: page errors`);
      if (width === 1440) {
        await page.locator('.site-header, .pe-header, .blog-header, .consult-header').screenshot({ path: `preview/desktop-header-${route === '/' ? 'home' : route.slice(1).replace('.html', '')}.png` });
        await page.locator('.shopnav__desktop-trigger').click();
        assert.equal(await page.locator('#shop-navigation').evaluate(node => node.matches(':popover-open')), true, `${route}: Shop opens`);
        await page.keyboard.press('Escape');
        assert.equal(await page.locator('#shop-navigation').evaluate(node => node.matches(':popover-open')), false, `${route}: Escape closes Shop`);
      }
      console.log(`Passed ${width}px ${route}`);
    }
    await page.close();
  }
  const desktop = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  await desktop.goto(base, { waitUntil: 'domcontentloaded' });
  await desktop.locator('.shopnav__desktop-trigger').waitFor();
  const topperLink = desktop.locator('.main-nav a[href="/toppers.html"]');
  await topperLink.hover();
  await desktop.waitForTimeout(220);
  assert.equal(await topperLink.evaluate(node => getComputedStyle(node, '::after').transform), 'matrix(1, 0, 0, 1, 0, 0)', 'hover underline');
  await topperLink.click();
  assert.equal(new URL(desktop.url()).pathname, '/toppers.html', 'topper link destination');
  assert.equal(await desktop.locator('.pe-nav a[aria-current="page"]').textContent(), 'Hair Toppers', 'destination current state');
  await desktop.close();

  const mobile = await browser.newPage({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true });
  for (const [route] of routes) {
    await mobile.goto(base + route, { waitUntil: 'domcontentloaded' });
    await mobile.locator('.shopnav__desktop-trigger').waitFor({ state: 'attached' });
    assert.equal(await mobile.locator('.shopnav__desktop-trigger').isVisible(), false, `${route}: desktop Shop control hidden on mobile`);
    assert.equal(await mobile.locator('.header-cta, .pe-header__cta, .desktop-header-cta').first().isVisible(), false, `${route}: desktop action hidden on mobile`);
    assert.equal(await mobile.evaluate(() => document.documentElement.scrollWidth > innerWidth), false, `${route}: mobile overflow`);
  }
  await mobile.close();
} finally {
  await browser.close();
}
