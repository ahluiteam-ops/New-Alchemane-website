import assert from 'node:assert/strict';
import { mkdir, readFile, readdir } from 'node:fs/promises';
import { chromium } from '@playwright/test';
import { blogArticles } from '../src/pages/blog-data.generated.js';

const base = process.env.BLOG_BASE_URL || 'http://127.0.0.1:4173';
const browser = await chromium.launch({ headless: true });
const output = 'preview/blog-qa';
await mkdir(output, { recursive: true });

try {
  const blogCss = await readFile('src/pages/blogs.css', 'utf8');
  assert.ok(!blogCss.includes('object-fit: cover'), 'Blog images should never use a cropping cover fit');
  assert.equal(blogArticles.length, 253, 'All source articles should be present');
  assert.equal(new Set(blogArticles.map(article => article.slug)).size, 253, 'Article slugs should be unique');
  const routes = await readdir('blogs');
  assert.equal(routes.length, 253, 'Every article should have a local route');
  const slugs = new Set(blogArticles.map(article => article.slug));
  const brokenLinks = new Map();
  let embeddedVideos = 0;
  let tableOfContents = 0;
  let commentEnabledArticles = 0;
  for (const article of blogArticles) {
    const { content } = JSON.parse(await readFile(`public/blog-content/${article.slug}.json`, 'utf8'));
    assert.ok(content.replace(/<[^>]+>/g, '').length > 300, `${article.slug}: article body should not be empty`);
    assert.ok(!content.includes('NEED HELP DECIDING ON YOUR PURCHASE?'), `${article.slug}: source footer should be removed`);
    assert.ok(!content.includes('<h2>Read more</h2>'), `${article.slug}: source recommendations should be removed`);
    if (content.includes('<iframe')) embeddedVideos += 1;
    if (content.includes('class="article-toc"')) tableOfContents += 1;
    if (article.commentsEnabled) commentEnabledArticles += 1;
    for (const match of content.matchAll(/href="\/blogs\/([^/]+)\//g)) {
      if (!slugs.has(match[1])) brokenLinks.set(match[1], (brokenLinks.get(match[1]) || 0) + 1);
    }
  }
  assert.equal(brokenLinks.size, 0, `Internal article links should resolve: ${JSON.stringify([...brokenLinks])}`);
  assert.ok(embeddedVideos >= 200, `Embedded article videos should be preserved (found ${embeddedVideos})`);
  assert.ok(tableOfContents >= 180, `Source table-of-contents sections should be preserved (found ${tableOfContents})`);
  assert.ok(commentEnabledArticles >= 200, `Comment sections should be available where the source allows comments (found ${commentEnabledArticles})`);

  for (const { name, viewport } of [
    { name: 'desktop', viewport: { width: 1440, height: 900 } },
    { name: 'mobile', viewport: { width: 390, height: 844 } },
  ]) {
    const page = await browser.newPage({ viewport, deviceScaleFactor: 1 });
    await page.goto(`${base}/blogs.html`, { waitUntil: 'domcontentloaded' });
    await page.locator('.blog-grid .blog-card').first().waitFor();
    await page.waitForFunction(() => {
      const image = document.querySelector('.blog-card--featured img');
      return !image || (image.complete && image.naturalWidth > 0);
    });
    assert.equal(await page.locator('.blog-card').count(), 10, `${name}: 10 page-one articles`);
    const featuredImageRatio = await page.locator('.blog-card--featured img').evaluate(image => ({
      natural: image.naturalWidth / image.naturalHeight,
      rendered: image.getBoundingClientRect().width / image.getBoundingClientRect().height,
    }));
    assert.ok(Math.abs(featuredImageRatio.natural - featuredImageRatio.rendered) < 0.01, `${name}: featured image keeps its natural proportions`);
    assert.equal(await page.locator('.blog-card__image img').first().evaluate(image => getComputedStyle(image).objectFit), 'fill', `${name}: article cards do not crop images`);
    assert.equal(await page.locator('.blog-hero h1').textContent(), 'Blogs', `${name}: hero uses a familiar page title`);
    assert.equal(await page.locator('.blog-hero .blog-kicker').count(), 0, `${name}: journal eyebrow is removed from the hero`);
    assert.equal(await page.locator('.blog-breadcrumb--hero li').count(), 2, `${name}: blog listing breadcrumb is visible`);
    assert.equal(await page.locator('.blog-hero__meta').textContent().then(text => text.includes('253')), true, `${name}: article count remains visible`);
    assert.equal(await page.locator('.blog-pagination__numbers a').count(), 4, `${name}: pagination starts with four useful page links`);
    assert.equal(await page.locator('.blog-pagination__ellipsis').count(), 1, `${name}: pagination collapses skipped pages`);
    assert.equal(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), true, `${name}: no horizontal overflow`);
    if (name === 'desktop') {
      assert.equal(await page.locator('.blog-nav').isVisible(), true, 'Desktop blog navigation is visible');
    } else {
      assert.equal(await page.locator('.blog-nav').isVisible(), false, 'Mobile navigation starts collapsed');
      await page.getByRole('button', { name: 'Open navigation menu' }).click();
      assert.equal(await page.locator('.blog-nav').isVisible(), true, 'Mobile menu opens');
      assert.equal(await page.locator('.blog-nav a[href="/blogs.html"]').count(), 0, 'Mobile header omits the footer-level Blogs link');
      await page.getByRole('button', { name: 'Close navigation menu' }).click();
    }
    assert.equal(await page.locator('.site-footer a[href="/blogs.html"]').isVisible(), true, `${name}: footer includes Blogs`);
    assert.equal(await page.locator('.site-footer a[href="/blogs.html"]').getAttribute('aria-current'), 'page', `${name}: footer identifies Blogs as current`);
    await page.locator('.site-footer').scrollIntoViewIfNeeded();
    await page.locator('.site-footer').screenshot({ path: `${output}/${name}-footer.png` });
    await page.screenshot({ path: `${output}/${name}.png`, fullPage: false });
    await page.goto(`${base}/`, { waitUntil: 'domcontentloaded' });
    if (name === 'mobile') await page.getByRole('button', { name: 'Open navigation menu' }).click();
    assert.equal(await page.locator('.main-nav a[href="/blogs.html"]').count(), 0, `${name}: main header omits Blogs`);
    assert.equal(await page.locator('.site-footer a[href="/blogs.html"]').isVisible(), true, `${name}: homepage footer includes Blogs`);
    await page.goto(`${base}/extensions.html`, { waitUntil: 'domcontentloaded' });
    if (name === 'mobile') {
      await page.locator('.shopnav__mobile-trigger').click();
      assert.equal(await page.locator('#shop-navigation a[href="/blogs.html"]').count(), 0, 'Shop menu lists only product categories');
    } else {
      assert.equal(await page.locator('.shopnav__blog-link').count(), 0, 'Shop-style header omits Blogs');
      assert.equal(await page.locator('.site-footer a[href="/blogs.html"]').isVisible(), true, 'Shop-style footer includes Blogs');
    }
    await page.goto(`${base}/blogs.html?page=26`, { waitUntil: 'domcontentloaded' });
    assert.equal(await page.locator('.blog-grid .blog-card').count(), 3, `${name}: last index page has three articles`);
    assert.equal(await page.locator('.blog-pagination__numbers a').count(), 4, `${name}: last-page pagination remains compact`);
    assert.equal(await page.locator('.blog-pagination__numbers a[aria-current="page"]').textContent(), '26', `${name}: current page is identified`);
    await page.goto(`${base}/blogs.html?page=13`, { waitUntil: 'domcontentloaded' });
    assert.equal(await page.locator('.blog-pagination__numbers a').count(), 3, `${name}: middle pagination shows first, current and last pages`);
    assert.equal(await page.locator('.blog-pagination__ellipsis').count(), 2, `${name}: middle pagination uses two ellipses`);
    assert.equal(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), true, `${name}: middle pagination has no horizontal overflow`);
    await page.locator('.blog-pagination').screenshot({ path: `${output}/${name}-pagination.png` });
    const sample = name === 'desktop' ? blogArticles[0] : blogArticles.at(-1);
    await page.goto(`${base}/blogs/${sample.slug}/`, { waitUntil: 'domcontentloaded' });
    await page.locator('.article-content p').first().waitFor();
    await page.waitForFunction(() => !document.querySelector('.article-content')?.textContent.includes('Loading article'));
    assert.equal(await page.locator('.article-content').textContent().then(text => text.length > 500), true, `${name}: full article content loads`);
    assert.equal(await page.locator('.blog-breadcrumb--article li').count(), 3, `${name}: article breadcrumb is visible`);
    assert.equal(await page.locator('.blog-breadcrumb__current').textContent(), sample.title, `${name}: breadcrumb retains the complete article title`);
    if (name === 'mobile') {
      const breadcrumbState = await page.locator('.blog-breadcrumb__current').evaluate(element => ({
        clipped: element.scrollWidth > element.clientWidth,
        overflow: getComputedStyle(element).textOverflow,
      }));
      assert.equal(breadcrumbState.clipped, true, 'Mobile: long breadcrumb title is shortened visually');
      assert.equal(breadcrumbState.overflow, 'ellipsis', 'Mobile: shortened breadcrumb uses an ellipsis');
    }
    const relatedLinkCount = await page.locator('.article-related__grid > a').count();
    assert.equal(relatedLinkCount, 2, `${name}: two related articles are visible`);
    assert.equal(await page.locator('.article-related__image img').count(), relatedLinkCount, `${name}: every related article includes an image`);
    assert.equal(await page.locator('.article-hero__image img').evaluate(image => getComputedStyle(image).objectFit), 'fill', `${name}: article hero does not crop its image`);
    assert.equal(await page.locator('.article-related__image img').first().evaluate(image => getComputedStyle(image).objectFit), 'fill', `${name}: related cards do not crop images`);
    assert.equal(await page.locator('.article-share').count(), 0, `${name}: old Share, WhatsApp and Email rail is removed`);
    assert.equal(await page.locator('.article-byline').textContent(), 'Written by Alchemane Hair Extensions', `${name}: article byline is visible`);
    assert.equal(await page.locator('.article-social a').count(), 4, `${name}: four share actions are visible`);
    assert.equal(await page.locator('.article-social svg[viewBox="0 0 16 16"]').count(), 4, `${name}: all share actions use consistent platform icons`);
    assert.equal(await page.evaluate(() => document.querySelector('.article-comment')?.previousElementSibling?.matches('.article-byline-share')), true, `${name}: author and share bar sits directly above the comment form`);
    for (const shareAction of await page.locator('.article-social a').all()) {
      const box = await shareAction.boundingBox();
      assert.ok(box.width >= 44 && box.height >= 44, `${name}: share actions meet minimum target size`);
    }
    assert.equal(await page.locator('.article-comment input').count(), 2, `${name}: name and email fields are visible`);
    assert.equal(await page.locator('.article-comment textarea').isVisible(), true, `${name}: message field is visible`);
    assert.equal(await page.locator('.article-comment button').isEnabled(), true, `${name}: submit CTA is enabled`);
    assert.equal(await page.locator('.article-comment__note a').count(), 2, `${name}: hCaptcha policy links are present`);
    const nameBox = await page.locator('#comment-name').boundingBox();
    const emailBox = await page.locator('#comment-email').boundingBox();
    assert.ok(name === 'desktop' ? Math.abs(nameBox.y - emailBox.y) < 2 : emailBox.y > nameBox.y + nameBox.height, `${name}: comment fields use the intended layout`);
    const articleUrl = page.url();
    await page.locator('.article-comment button').click();
    assert.equal(page.url(), articleUrl, `${name}: display-only form does not navigate or submit`);
    assert.equal(await page.locator('.article-comment__status').textContent(), 'Comment submission will be available when the new website launches.', `${name}: display-only form gives clear feedback`);
    if (name === 'desktop') {
      assert.ok(await page.locator('.article-content iframe[src*="youtube.com/embed/"]').count() >= 1, 'Latest article videos are embedded');
      assert.equal(await page.locator('.article-toc').count(), 1, 'Latest article table of contents is present');
      const firstAnchor = await page.locator('.article-toc a').first().getAttribute('href');
      assert.ok(firstAnchor && firstAnchor.startsWith('#'), 'Table of contents links to article sections');
    }
    assert.equal(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), true, `${name}: article no horizontal overflow`);
    const relatedBoxes = await page.locator('.article-related__grid > a').evaluateAll(cards => cards.map(card => {
      const box = card.getBoundingClientRect();
      return { x: box.x, y: box.y, width: box.width, height: box.height };
    }));
    assert.ok(name === 'desktop'
      ? Math.abs(relatedBoxes[0].y - relatedBoxes[1].y) < 2 && relatedBoxes[1].x > relatedBoxes[0].x + relatedBoxes[0].width
      : relatedBoxes[1].y > relatedBoxes[0].y + relatedBoxes[0].height,
    `${name}: related articles use the intended responsive layout`);
    await page.screenshot({ path: `${output}/${name}-article.png`, fullPage: false });
    await page.locator('.article-byline-share').screenshot({ path: `${output}/${name}-byline-share.png` });
    await page.locator('.article-comment').screenshot({ path: `${output}/${name}-comment.png` });
    await page.locator('.article-related').screenshot({ path: `${output}/${name}-related.png` });
    if (name === 'desktop') {
      await page.goto(`${base}/blogs/10-reasons-permanent-extensions-are-perfect-for-busy-women/`, { waitUntil: 'domcontentloaded' });
      await page.waitForFunction(() => !document.querySelector('.article-content')?.textContent.includes('Loading article'));
      assert.equal(await page.locator('.article-toc li').count(), 10, 'Long table of contents keeps all ten entries in the DOM');
      assert.equal(await page.locator('.article-toc li:visible').count(), 7, 'Long table of contents initially shows seven entries');
      assert.equal(await page.locator('.article-toc__toggle').textContent(), 'Show more', 'Long table of contents has a Show more control');
      await page.locator('.article-toc__toggle').click();
      assert.equal(await page.locator('.article-toc li:visible').count(), 10, 'Show more reveals remaining table-of-contents entries');
      assert.equal(await page.locator('.article-toc__toggle').textContent(), 'Show less', 'Expanded table of contents offers Show less');
      await page.locator('.article-toc__toggle').click();
      assert.equal(await page.locator('.article-toc li:visible').count(), 7, 'Show less collapses the table of contents back to seven entries');
      await page.locator('.article-toc').screenshot({ path: `${output}/desktop-toc.png` });
    }
    await page.close();
  }

  const compactPage = await browser.newPage({ viewport: { width: 320, height: 760 }, deviceScaleFactor: 1 });
  await compactPage.goto(`${base}/blogs.html?page=13`, { waitUntil: 'domcontentloaded' });
  assert.equal(await compactPage.evaluate(() => document.documentElement.scrollWidth <= innerWidth), true, '320px: blog index and pagination have no horizontal overflow');
  await compactPage.goto(`${base}/blogs/${blogArticles.at(-1).slug}/`, { waitUntil: 'domcontentloaded' });
  await compactPage.waitForFunction(() => !document.querySelector('.article-content')?.textContent.includes('Loading article'));
  assert.equal(await compactPage.evaluate(() => document.documentElement.scrollWidth <= innerWidth), true, '320px: blog detail has no horizontal overflow');
  await compactPage.screenshot({ path: `${output}/compact-article.png`, fullPage: false });
  await compactPage.close();
  const navigationPage = await browser.newPage({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true });
  for (const route of ['/', '/permanent-extensions.html', '/toppers.html', '/wigs.html', '/extensions.html', '/consultation.html', '/blogs.html', '/products/silk-hair-toppers/', '/pages/privacy-policy/']) {
    await navigationPage.goto(base + route, { waitUntil: 'domcontentloaded' });
    await navigationPage.locator('footer').waitFor();
    assert.equal(await navigationPage.locator('header a[href="/blogs.html"]').count(), 0, `${route}: header omits Blogs`);
    assert.equal(await navigationPage.locator('footer a[href="/blogs.html"]').count(), 1, `${route}: footer includes Blogs once`);
  }
  await navigationPage.close();
  console.log(`PASS: 253 unique articles, 26 index pages, ${embeddedVideos} article videos, ${tableOfContents} tables of contents, comments, and responsive routes.`);
} finally {
  await browser.close();
}
