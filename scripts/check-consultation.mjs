import assert from 'node:assert/strict';
import { chromium, expect } from '@playwright/test';

const base = process.env.BASE_URL ?? 'http://127.0.0.1:4173';
const browser = await chromium.launch({ channel: 'chrome', headless: true });
const routes = ['/', '/permanent-extensions.html', '/toppers.html', '/wigs.html', '/products/silk-hair-toppers/', '/pages/privacy-policy/'];

try {
  for (const width of [320, 390, 768, 1024, 1440]) {
    const page = await browser.newPage({ viewport: { width, height: 900 }, isMobile: width < 800, hasTouch: width < 800 });
    const errors = [];
    page.on('pageerror', error => errors.push(error.message));
    const response = await page.goto(`${base}/consultation.html`, { waitUntil: 'networkidle' });
    assert.equal(response.status(), 200, 'Consultation page should load');
    await expect(page.locator('h1')).toHaveText('Find the right hair option for you.');
    await expect(page.locator('.consult-hero .consult-eyebrow')).toHaveCount(0);
    await expect(page.locator('.consult-hero__copy > p')).toContainText('hair needs, lifestyle, and preferences');
    await expect(page.locator('.consult-hero__media img')).toBeVisible();
    const heroCta = page.locator('.consult-hero__cta');
    await expect(heroCta).toHaveAttribute('href', '#booking');
    await expect(heroCta).toContainText('₹299');
    assert.ok((await heroCta.boundingBox()).height >= 44, `Hero CTA is too small at ${width}px`);
    await heroCta.click();
    await expect(page).toHaveURL(/#booking$/);
    const sectionSurfaces = await page.evaluate(() => ({
      hero: getComputedStyle(document.querySelector('.consult-hero')).backgroundColor,
      booking: getComputedStyle(document.querySelector('.consult-booking')).backgroundColor,
      location: getComputedStyle(document.querySelector('.consult-location')).backgroundColor,
      bookingBorder: Number.parseFloat(getComputedStyle(document.querySelector('.consult-booking')).borderTopWidth),
    }));
    assert.equal(sectionSurfaces.bookingBorder, 0, `Unexpected booking divider at ${width}px`);
    assert.notEqual(sectionSurfaces.hero, sectionSurfaces.booking, `Hero and booking surfaces merge at ${width}px`);
    assert.equal(sectionSurfaces.location, 'rgb(255, 255, 255)', `Location section should be white at ${width}px`);
    await expect(page.locator('#consultation-booking-form')).toBeVisible();
    await expect(page.locator('#booking-name')).toBeVisible();
    await expect(page.locator('#booking-phone')).toHaveAttribute('type', 'tel');
    await expect(page.locator('#booking-city')).toBeVisible();
    await expect(page.locator('.consultation-meet__options button')).toHaveCount(2);
    await expect(page.locator('[data-meet-option="Khar West studio"]')).toHaveAttribute('aria-pressed', 'true');
    await expect(page.locator('[data-meet-note]')).toContainText('Khar West studio');
    assert.ok((await page.locator('.consult-booking__submit').boundingBox()).height >= 44, `Booking button is too small at ${width}px`);
    await expect(page.locator('.consult-location__map iframe')).toBeVisible();
    await expect(page.locator('.consult-location__map iframe')).toHaveAttribute('src', /google\.com\/maps\?q=Alchemane.*19\.0701981.*72\.8383453.*output=embed/);
    await expect(page.locator('.consult-location__copy a[href="https://maps.app.goo.gl/JnHWeEEPoYzHk7E36"]')).toBeVisible();
    await expect(page.locator('.consult-location__contact')).toHaveCount(4);
    await expect(page.locator('.consult-location__contact--address .consult-location__hours')).toContainText('Tuesday to Sunday · 11 AM–8 PM');
    await expect(page.locator('.consult-location__contact--address .consult-location__hours')).toContainText('Monday closed');
    for (const href of ['tel:+919967123333', 'https://wa.me/918591116455', 'mailto:info@alchemane.com']) {
      await expect(page.locator(`.consult-location__contacts a[href="${href}"]`)).toBeVisible();
    }
    for (const contact of await page.locator('.consult-location__contact').all()) {
      assert.ok((await contact.boundingBox()).height >= 44, `Contact target is too small at ${width}px`);
      await expect(contact.locator('svg')).toHaveAttribute('aria-hidden', 'true');
      const arrow = contact.locator('.consult-location__arrow');
      assert.ok(Number.parseFloat(await arrow.evaluate(node => getComputedStyle(node).fontSize)) >= 23, `Arrow is too small at ${width}px`);
    }
    if (width === 390) {
      await page.locator('.consult-booking__submit').click();
      await expect(page.locator('#booking-name-error')).toContainText('Enter your name.');
      await page.locator('#booking-name').fill('Preview Test');
      await page.locator('#booking-phone').fill('123');
      await page.locator('.consult-booking__submit').click();
      await expect(page.locator('#booking-phone-error')).toContainText('valid phone number');
      await page.locator('#booking-phone').fill('+91 98765 43210');
      await page.locator('#booking-city').fill('Pune');
      await page.locator('[data-meet-option="Online"]').click();
      await expect(page.locator('[name="meeting"]')).toHaveValue('Online');
      await expect(page.locator('[data-meet-note]')).toHaveText('Meet from anywhere.');
      await page.locator('.consult-booking__submit').click();
      await expect(page.locator('.consult-booking__status')).toBeVisible();
      const bookingUrl = new URL(await page.locator('#booking-whatsapp-link').getAttribute('href'));
      assert.equal(bookingUrl.origin, 'https://wa.me');
      assert.equal(bookingUrl.pathname, '/918591116455');
      assert.match(bookingUrl.searchParams.get('text'), /Preview Test[\s\S]*\+91 98765 43210[\s\S]*Pune[\s\S]*Online video call[\s\S]*₹299/);
      await page.locator('[data-meet-option="Khar West studio"]').click();
      await expect(page.locator('.consult-booking__status')).toBeHidden();
      await page.locator('.consult-location__map').scrollIntoViewIfNeeded();
      await expect.poll(() => page.frames().some(frame => frame.url().includes('google.com/maps/embed')), { timeout: 15000 }).toBe(true);
    }
    assert.equal(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), true, `Consultation page overflows at ${width}px`);
    if (width <= 1024) {
      await page.locator('.consult-menu').click();
      await expect(page.locator('.consult-menu')).toHaveAttribute('aria-expanded', 'true');
      await expect(page.locator('.consult-nav a[href="/consultation.html"]')).toBeVisible();
    } else {
      await expect(page.locator('.consult-nav a[href="/consultation.html"]')).toBeVisible();
    }
    assert.deepEqual(errors, [], `Page errors at ${width}px`);
    await page.close();
    console.log(`Consultation page passed at ${width}px`);
  }

  for (const route of routes) {
    const page = await browser.newPage({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true });
    const response = await page.goto(`${base}${route}`, { waitUntil: 'domcontentloaded' });
    assert.equal(response.status(), 200, `${route} should load`);
    const menu = page.locator('.menu-toggle, .pe-menu, .pd-menu, .policy-header__menu').first();
    await menu.click();
    await expect(page.locator('nav a[href="/consultation.html"]').first()).toBeVisible();
    assert.equal(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), true, `${route} overflows at 390px`);
    await page.close();
    console.log(`Mobile header passed on ${route}`);
  }
  {
    const page = await browser.newPage({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true });
    await page.goto(`${base}/extensions.html`, { waitUntil: 'domcontentloaded' });
    await page.locator('.shopnav__mobile-trigger').click();
    await expect(page.locator('#shop-navigation')).toBeVisible();
    await expect(page.locator('#shop-navigation a[href="/consultation.html"]')).toHaveCount(0);
    await page.close();
    console.log('Mobile shop menu passed on /extensions.html');
  }
  for (const width of [1024, 1280, 1440]) {
    for (const route of routes) {
      const page = await browser.newPage({ viewport: { width, height: 900 } });
      await page.goto(`${base}${route}`, { waitUntil: 'domcontentloaded' });
      const menu = page.locator('.menu-toggle, .pe-menu, .pd-menu, .policy-header__menu').first();
      if (await menu.isVisible()) await menu.click();
      // Desktop headers offer consultation once: the nav link, or the header button that replaces it.
      await expect(page.locator('header').getByRole('link', { name: /consultation/i }).filter({ visible: true })).toHaveCount(1);
      assert.equal(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), true, `${route} overflows at ${width}px`);
      await page.close();
    }
    console.log(`Desktop headers passed at ${width}px`);
  }
} finally {
  await browser.close();
}
