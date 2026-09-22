import { chromium } from '@playwright/test';
import assert from 'node:assert/strict';
import { reels, renderReels } from '../src/sections/reel-data.js';

// Test the ready state without changing the pending production configuration.
const BASE = process.env.BASE_URL ?? 'http://127.0.0.1:5173';
const browser = await chromium.launch({ channel: 'chrome', headless: true });
const page = await browser.newPage({ viewport: { width: 1200, height: 900 } });
const errors = [];
page.on('pageerror', error => errors.push(error.message));
try {
  for (const reel of Object.values(reels)) {
    reel.src = '/assets/topper-demo.mp4';
    reel.captions = '/assets/topper-demo.vtt';
  }
  const html = renderReels('<div class="films-pair section-wrap"><!-- reel-toppers --><!-- reel-extensions --></div>');
  await page.route('**/__reel-qa', route => route.fulfill({ contentType: 'text/html', body: `<!doctype html><html><head><meta charset="UTF-8"><link rel="stylesheet" href="/src/premium.css"><link rel="stylesheet" href="/src/design-tokens.css"></head><body><main class="home-rest">${html}<div style="height:2000px"></div></main><script type="module">import { initFilms } from '/src/sections/films.js'; initFilms();</script></body></html>` }));
  await page.goto(`${BASE}/__reel-qa`, { waitUntil: 'networkidle' });
  assert.equal(await page.locator('.reel-pending').count(), 0);
  assert.equal(await page.locator('video[controls][playsinline][preload="none"]').count(), 2);
  assert.equal(await page.locator('track[kind="captions"]').count(), 2);
  await page.locator('video').first().evaluate(video => video.play());
  await page.waitForFunction(() => !document.querySelector('video').paused);
  await page.locator('video').nth(1).evaluate(video => video.play());
  await page.waitForFunction(() => document.querySelectorAll('video')[0].paused && !document.querySelectorAll('video')[1].paused);
  await page.mouse.wheel(0, 1300);
  await page.waitForFunction(() => [...document.querySelectorAll('video')].every(video => video.paused));
  await page.locator('video').first().evaluate(video => video.dispatchEvent(new Event('error')));
  assert.equal(await page.locator('.reel-error').first().getAttribute('hidden'), null);
  assert.deepEqual(errors, []);
  console.log('Reel ready-state checks passed: native playback, captions, one film at a time, offscreen pause, failure fallback.');
} finally { await browser.close(); }
