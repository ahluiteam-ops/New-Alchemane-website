import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { chromium } from '@playwright/test';
import { blogArticles as previousArticles } from '../src/pages/blog-data.generated.js';
import { writeBlogData } from './write-blog-data.mjs';

const origin = 'https://alchemane.com';
const reader = 'https://r.jina.ai/http://https://alchemane.com';
const cacheDirectory = resolve('scratchpad/blog-source-cache');
const previousBySlug = new Map(previousArticles.map(article => [article.slug, article]));
const browser = await chromium.launch({ headless: true });
const context = await browser.newContext({ javaScriptEnabled: false });
const page = await context.newPage();
await page.route('**/*', route => route.abort());
await mkdir(cacheDirectory, { recursive: true });

async function fetchHtml(path) {
  for (let attempt = 0; attempt < 5; attempt += 1) {
    try {
      const response = await fetch(`${origin}${path}`, { signal: AbortSignal.timeout(30000) });
      if (response.ok) return response.text();
      if (response.status === 429) {
        const cached = await fetch(`${reader}${path}`, { headers: { 'X-Respond-With': 'html' }, signal: AbortSignal.timeout(45000) });
        if (cached.ok) return cached.text();
      }
      if (response.status !== 429 && response.status < 500) throw new Error(`${path}: HTTP ${response.status}`);
      console.warn(`${path}: HTTP ${response.status}; retrying`);
    } catch (error) {
      if (attempt === 4) throw error;
      console.warn(`${path}: ${error.message}; retrying`);
    }
    await new Promise(resolveDelay => setTimeout(resolveDelay, Math.min(60000, 2500 * 2 ** attempt)));
  }
  throw new Error(`${path}: failed after retries`);
}

async function readHtml(html) {
  await page.setContent(html, { waitUntil: 'domcontentloaded' });
}

async function sourceCards() {
  const cards = [];
  for (let number = 1; number <= 100; number += 1) {
    await readHtml(await fetchHtml(`/blogs/articles?page=${number}`));
    const listed = await page.evaluate(() => [...document.querySelectorAll('.blog-post-card')].map(card => {
      const link = card.querySelector('.blog-post-card__title');
      const image = card.querySelector('img');
      return {
        path: link?.getAttribute('href') || '',
        title: link?.textContent.trim() || '',
        description: card.querySelector('.blog-post-card__excerpt')?.textContent.trim() || '',
        image: image?.getAttribute('src') || '',
        alt: image?.getAttribute('alt') || '',
      };
    }).filter(card => card.path.startsWith('/blogs/articles/')));
    if (!listed.length) break;
    const known = new Set(cards.map(card => card.path));
    const fresh = listed.filter(card => !known.has(card.path));
    if (!fresh.length) break;
    cards.push(...fresh);
    console.log(`Index page ${number}: ${listed.length} articles`);
    if (listed.length < 10) break;
  }
  return [...new Map(cards.map(card => [card.path, card])).values()];
}

async function sourceArticle(card) {
  const slug = card.path.split('/').at(-1);
  const cacheFile = resolve(cacheDirectory, `${slug}.json`);
  try { return JSON.parse(await readFile(cacheFile, 'utf8')); } catch { /* Not yet cached. */ }
  await readHtml(await fetchHtml(card.path));
  const article = await page.evaluate(() => {
    const prose = [...document.querySelectorAll('.prose')].sort((a, b) => b.innerHTML.length - a.innerHTML.length)[0];
    return {
      bodyHtml: prose?.innerHTML || '',
      title: document.querySelector('h1')?.textContent.trim() || '',
      date: document.querySelector('time')?.textContent.trim() || '',
      commentsEnabled: Boolean(document.querySelector('#comment_form')),
    };
  });
  if (!article.bodyHtml || article.bodyHtml.length < 300) throw new Error(`${slug}: article body was not found`);
  await writeFile(cacheFile, JSON.stringify(article), 'utf8');
  return article;
}

async function prepareContent(bodyHtml) {
  await readHtml(`<!doctype html><html><body>${bodyHtml}</body></html>`);
  return page.evaluate(() => {
    const root = document.body;
    const headings = [...root.querySelectorAll('h2,h3,h4')];
    const findHeading = (label, index) => {
      const normalized = value => value.toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim();
      return headings.find(heading => normalized(heading.textContent) === normalized(label))
        || headings.find(heading => normalized(heading.textContent).includes(normalized(label)))
        || headings[index];
    };
    for (const table of [...root.querySelectorAll('table')]) {
      if (!/^table of contents?$/i.test(table.textContent.replace(/\s+/g, ' ').trim())) continue;
      let linksTable = table.nextElementSibling;
      while (linksTable && linksTable.tagName !== 'TABLE' && !linksTable.textContent.trim()) linksTable = linksTable.nextElementSibling;
      const links = linksTable?.tagName === 'TABLE' ? [...linksTable.querySelectorAll('a[href^="#"]')] : [];
      if (!links.length) continue;
      const nav = document.createElement('nav');
      nav.className = 'article-toc';
      nav.setAttribute('aria-label', 'Table of contents');
      const title = document.createElement('p');
      title.className = 'article-toc__title';
      title.textContent = 'Table of contents';
      const list = document.createElement('ol');
      links.forEach((link, index) => {
        let target = link.getAttribute('href').slice(1);
        try { target = decodeURIComponent(target); } catch { /* Keep the original fragment. */ }
        if (!document.getElementById(target)) {
          const heading = findHeading(link.textContent, index);
          if (!heading) return;
          heading.id = heading.id || target;
          target = heading.id;
        }
        const item = document.createElement('li');
        const anchor = document.createElement('a');
        anchor.href = `#${encodeURIComponent(target)}`;
        anchor.textContent = link.textContent.trim();
        item.append(anchor);
        list.append(item);
      });
      nav.append(title, list);
      table.replaceWith(nav);
      linksTable.remove();
    }
    for (const element of [...root.querySelectorAll('script,style,form,input,button,noscript')]) element.remove();
    for (const iframe of [...root.querySelectorAll('iframe')]) {
      const src = iframe.getAttribute('src') || '';
      if (!/^https:\/\/(www\.)?(youtube\.com\/embed\/|youtube-nocookie\.com\/embed\/|player\.vimeo\.com\/video\/)/i.test(src)) {
        iframe.remove();
        continue;
      }
      iframe.setAttribute('loading', 'lazy');
      iframe.setAttribute('title', iframe.getAttribute('title') || 'Article video');
      iframe.setAttribute('allow', 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share');
      iframe.setAttribute('allowfullscreen', '');
      iframe.setAttribute('referrerpolicy', 'strict-origin-when-cross-origin');
    }
    for (const table of [...root.querySelectorAll('table')]) {
      const wrapper = document.createElement('div');
      wrapper.className = 'article-table-scroll';
      table.replaceWith(wrapper);
      wrapper.append(table);
    }
    for (const image of root.querySelectorAll('img')) {
      const src = image.getAttribute('src') || '';
      if (src.startsWith('//')) image.setAttribute('src', `https:${src}`);
      image.setAttribute('loading', 'lazy');
      image.setAttribute('decoding', 'async');
    }
    for (const link of root.querySelectorAll('a')) {
      const href = link.getAttribute('href') || '';
      if (/^javascript:/i.test(href)) link.removeAttribute('href');
      if (/^https?:\/\//i.test(href)) link.setAttribute('rel', 'noopener noreferrer');
    }
    for (const element of root.querySelectorAll('*')) {
      for (const attribute of [...element.attributes]) {
        if (/^on/i.test(attribute.name) || attribute.name === 'style') element.removeAttribute(attribute.name);
        if (attribute.name === 'class' && !['article-toc', 'article-toc__title', 'article-table-scroll'].includes(attribute.value)) element.removeAttribute('class');
      }
    }
    return root.innerHTML;
  });
}

try {
  const cards = process.argv.includes('--cached')
    ? previousArticles.map(article => ({ path: `/blogs/articles/${article.slug}`, title: article.title, description: article.description, image: article.image, alt: article.alt }))
    : await sourceCards();
  if (cards.length < previousArticles.length) throw new Error(`Live listing only returned ${cards.length} articles; refusing to overwrite ${previousArticles.length} local articles.`);
  console.log(`Live article count: ${cards.length}; new: ${cards.filter(card => !previousBySlug.has(card.path.split('/').at(-1))).map(card => card.path).join(', ') || 'none'}`);
  const articles = [];
  for (const [index, card] of cards.entries()) {
    const slug = card.path.split('/').at(-1);
    const source = await sourceArticle(card);
    const previous = previousBySlug.get(slug);
    articles.push({
      slug,
      title: source.title || card.title,
      date: source.date || previous?.date || '',
      description: card.description,
      image: card.image.startsWith('//') ? `https:${card.image}` : card.image,
      alt: card.alt,
      commentsEnabled: source.commentsEnabled,
      content: await prepareContent(source.bodyHtml),
      previous: cards[index - 1]?.path.split('/').at(-1) ?? null,
      next: cards[index + 1]?.path.split('/').at(-1) ?? null,
    });
    if ((index + 1) % 10 === 0 || index + 1 === cards.length) console.log(`Prepared ${index + 1}/${cards.length} articles`);
  }
  await writeBlogData(articles);
} finally {
  await browser.close();
}
