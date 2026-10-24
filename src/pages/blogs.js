import '../design-tokens.css';
import '../sections/site-footer.css';
import './blogs.css';
import { blogArticles } from './blog-data.generated.js';
import { blogFooter, blogHeader, initBlogShell } from './blog-shell.js';

const pageSize = 10;
const params = new URLSearchParams(location.search);
const requestedPage = Number.parseInt(params.get('page') || '1', 10);
const pageCount = Math.max(1, Math.ceil(blogArticles.length / pageSize));
const currentPage = Math.min(Math.max(Number.isFinite(requestedPage) ? requestedPage : 1, 1), pageCount);
const pageArticles = blogArticles.slice((currentPage - 1) * pageSize, currentPage * pageSize);
const escape = value => String(value).replace(/[&<>"]/g, character => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[character]));
const articleHref = article => `/blogs/${encodeURIComponent(article.slug)}/`;
const pageHref = page => page === 1 ? '/blogs.html' : `/blogs.html?page=${page}`;

function card(article, featured = false) {
  const image = article.image ? `<img src="${escape(article.image)}" alt="${escape(article.alt || article.title)}" loading="${featured ? 'eager' : 'lazy'}" decoding="async">` : '<span class="blog-card__placeholder" aria-hidden="true"></span>';
  return `<article class="blog-card${featured ? ' blog-card--featured' : ''}"><a class="blog-card__image" href="${articleHref(article)}">${image}</a><div class="blog-card__body"><p class="blog-card__date">${escape(article.date)}</p><h2><a href="${articleHref(article)}">${escape(article.title)}</a></h2><p class="blog-card__summary">${escape(article.description)}</p><a class="blog-card__link" href="${articleHref(article)}">Read article <span aria-hidden="true">→</span></a></div></article>`;
}

function pagination() {
  let visiblePages;
  if (pageCount <= 7) {
    visiblePages = Array.from({ length: pageCount }, (_, index) => index + 1);
  } else if (currentPage <= 3) {
    visiblePages = [1, 2, 3, 'ellipsis', pageCount];
  } else if (currentPage >= pageCount - 2) {
    visiblePages = [1, 'ellipsis', pageCount - 2, pageCount - 1, pageCount];
  } else {
    visiblePages = [1, 'ellipsis', currentPage, 'ellipsis', pageCount];
  }

  const numbers = visiblePages.map((page, index) => page === 'ellipsis'
    ? `<span class="blog-pagination__ellipsis" aria-hidden="true" data-position="${index}">…</span>`
    : `<a href="${pageHref(page)}" aria-label="Page ${page}"${page === currentPage ? ' aria-current="page"' : ''}>${page}</a>`).join('');

  return `<nav class="blog-pagination" aria-label="Blog pages">${currentPage > 1 ? `<a class="blog-pagination__previous" href="${pageHref(currentPage - 1)}" rel="prev" aria-label="Previous page"><span aria-hidden="true">←</span><span class="blog-pagination__direction">Prev</span></a>` : ''}<div class="blog-pagination__numbers">${numbers}</div>${currentPage < pageCount ? `<a class="blog-pagination__next" href="${pageHref(currentPage + 1)}" rel="next" aria-label="Next page"><span class="blog-pagination__direction">Next</span><span aria-hidden="true">→</span></a>` : ''}</nav>`;
}

const root = document.querySelector('#blog-root');
if (!blogArticles.length) {
  root.innerHTML = `${blogHeader('blogs')}<main id="main" class="blog-empty"><h1>Stories and advice for your hair journey.</h1><p>The blog articles are being prepared. Please check back shortly.</p></main>${blogFooter()}`;
} else {
  const featured = currentPage === 1 ? pageArticles[0] : null;
  const cards = featured ? pageArticles.slice(1) : pageArticles;
  root.innerHTML = `${blogHeader('blogs')}<main id="main"><section class="blog-hero" aria-labelledby="blogs-title"><div class="blog-hero__inner"><nav class="blog-breadcrumb blog-breadcrumb--hero" aria-label="Breadcrumb"><ol><li><a href="/">Home</a></li><li aria-current="page">Blogs</li></ol></nav><h1 id="blogs-title">Blogs</h1><p>Explore practical guides on hair extensions, toppers, wigs, styling, and everyday hair care.</p><p class="blog-hero__meta">${blogArticles.length} articles to explore</p></div></section>${featured ? `<section class="blog-featured" aria-label="Latest article"><div class="blog-featured__label">Latest from Alchemane</div>${card(featured, true)}</section>` : ''}<section class="blog-index" aria-labelledby="all-articles-title"><div class="blog-index__heading"><h2 id="all-articles-title">${currentPage === 1 ? 'More to explore' : `Articles — page ${currentPage}`}</h2><p>${(currentPage - 1) * pageSize + 1}–${Math.min(currentPage * pageSize, blogArticles.length)} of ${blogArticles.length}</p></div><div class="blog-grid">${cards.map(article => card(article)).join('')}</div>${pagination()}</section></main>${blogFooter()}`;
}

initBlogShell();
