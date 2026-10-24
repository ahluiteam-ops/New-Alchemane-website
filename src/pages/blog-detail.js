import '../design-tokens.css';
import '../sections/site-footer.css';
import './blogs.css';
import { blogArticles } from './blog-data.generated.js';
import { blogFooter, blogHeader, initBlogShell } from './blog-shell.js';

const slug = document.documentElement.dataset.blogSlug;
const article = blogArticles.find(item => item.slug === slug);
const root = document.querySelector('#blog-article-root');
const escape = value => String(value).replace(/[&<>"]/g, character => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[character]));
const articleHref = value => `/blogs/${encodeURIComponent(value)}/`;
const socialIcons = {
  facebook: '<svg viewBox="0 0 16 16" aria-hidden="true" focusable="false"><path d="M16 8.049C16 3.603 12.418 0 8 0S0 3.603 0 8.049c0 4.016 2.926 7.347 6.75 7.951v-5.625H4.719V8.049H6.75V6.274c0-2.017 1.194-3.13 3.022-3.13.876 0 1.792.157 1.792.157v1.98h-1.009c-.994 0-1.305.62-1.305 1.258v1.51h2.219l-.355 2.326H9.25V16C13.074 15.396 16 12.065 16 8.049Z"/></svg>',
  twitter: '<svg viewBox="0 0 16 16" aria-hidden="true" focusable="false"><path d="M5.026 15c6.038 0 9.341-5.003 9.341-9.334 0-.14 0-.282-.006-.422A6.7 6.7 0 0 0 16 3.542a6.7 6.7 0 0 1-1.889.518 3.3 3.3 0 0 0 1.447-1.817 6.5 6.5 0 0 1-2.084.8A3.286 3.286 0 0 0 7.875 6.03a9.32 9.32 0 0 1-6.767-3.429 3.29 3.29 0 0 0 1.018 4.382A3.3 3.3 0 0 1 .64 6.575v.045a3.29 3.29 0 0 0 2.632 3.218 3.2 3.2 0 0 1-.865.115 3 3 0 0 1-.618-.06 3.28 3.28 0 0 0 3.067 2.277A6.6 6.6 0 0 1 .78 13.58a6 6 0 0 1-.78-.045A9.34 9.34 0 0 0 5.026 15Z"/></svg>',
  pinterest: '<svg viewBox="0 0 16 16" aria-hidden="true" focusable="false"><path d="M8 0a8 8 0 0 0-2.915 15.452c-.07-.633-.134-1.606.027-2.297l1.029-4.363s-.262-.524-.262-1.3c0-1.219.707-2.129 1.588-2.129.748 0 1.11.562 1.11 1.235 0 .752-.478 1.876-.725 2.918-.206.871.437 1.581 1.295 1.581 1.554 0 2.75-1.64 2.75-4.006 0-2.093-1.504-3.558-3.65-3.558-2.486 0-3.945 1.864-3.945 3.79 0 .75.289 1.556.65 1.995.072.087.082.163.061.25-.066.275-.214.87-.243.992-.038.16-.127.194-.296.117-1.104-.514-1.795-2.128-1.795-3.427 0-2.79 2.028-5.354 5.85-5.354 3.07 0 5.456 2.188 5.456 5.109 0 3.05-1.923 5.504-4.59 5.504-.896 0-1.74-.466-2.03-1.017l-.552 2.1c-.2.769-.74 1.733-1.102 2.322A8 8 0 1 0 8 0Z"/></svg>',
  email: '<svg viewBox="0 0 16 16" aria-hidden="true" focusable="false"><path d="M0 4a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H2a2 2 0 0 1-2-2Zm2-1a1 1 0 0 0-1 1v.217l7 4.2 7-4.2V4a1 1 0 0 0-1-1Zm13 2.383-4.708 2.825L15 11.105Zm-.034 6.876-5.64-3.471L8 9.583l-1.326-.795-5.64 3.471A1 1 0 0 0 2 13h12a1 1 0 0 0 .966-.741ZM1 11.105l4.708-2.897L1 5.383Z"/></svg>',
};
const articleShareBar = item => {
  const shareUrl = encodeURIComponent(location.href);
  const shareTitle = encodeURIComponent(item.title);
  const shareImage = encodeURIComponent(item.image || '');
  return `<aside class="article-byline-share" aria-label="Article information and sharing"><p class="article-byline">Written by <strong>Alchemane Hair Extensions</strong></p><nav class="article-social" aria-label="Share this article"><a class="article-social__facebook" href="https://www.facebook.com/sharer/sharer.php?u=${shareUrl}" target="_blank" rel="noopener noreferrer" aria-label="Share on Facebook">${socialIcons.facebook}</a><a class="article-social__twitter" href="https://twitter.com/intent/tweet?text=${shareTitle}&url=${shareUrl}" target="_blank" rel="noopener noreferrer" aria-label="Share on Twitter">${socialIcons.twitter}</a><a class="article-social__pinterest" href="https://pinterest.com/pin/create/button/?url=${shareUrl}&media=${shareImage}&description=${shareTitle}" target="_blank" rel="noopener noreferrer" aria-label="Share on Pinterest">${socialIcons.pinterest}</a><a class="article-social__email" href="mailto:?subject=${shareTitle}&body=${shareUrl}" aria-label="Share by email">${socialIcons.email}</a></nav></aside>`;
};
const relatedCard = item => `<a href="${articleHref(item.slug)}"><span class="article-related__image"><img src="${escape(item.image)}" alt="${escape(item.alt || item.title)}" decoding="async"></span><span class="article-related__body"><span class="article-related__date">${escape(item.date)}</span><strong>${escape(item.title)}</strong><i aria-hidden="true">→</i></span></a>`;

function initTableOfContents(container) {
  container.querySelectorAll('.article-toc').forEach((toc, index) => {
    const list = toc.querySelector('ol, ul');
    if (!list) return;
    const items = [...list.children].filter(item => item.tagName === 'LI');
    if (items.length <= 7) return;

    list.id ||= `article-toc-list-${index + 1}`;
    items.slice(7).forEach(item => { item.hidden = true; });
    const toggle = document.createElement('button');
    toggle.className = 'article-toc__toggle';
    toggle.type = 'button';
    toggle.setAttribute('aria-controls', list.id);
    toggle.setAttribute('aria-expanded', 'false');
    toggle.textContent = 'Show more';
    toggle.addEventListener('click', () => {
      const expanded = toggle.getAttribute('aria-expanded') === 'true';
      items.slice(7).forEach(item => { item.hidden = expanded; });
      toggle.setAttribute('aria-expanded', String(!expanded));
      toggle.textContent = expanded ? 'Show more' : 'Show less';
    });
    toc.append(toggle);
  });
}

if (!article) {
  root.innerHTML = `${blogHeader('blogs')}<main id="main" class="blog-empty"><h1>Article unavailable</h1><p>We could not find this article.</p><a class="blog-back-link" href="/blogs.html">← Back to all articles</a></main>${blogFooter()}`;
} else {
  document.title = `${article.title} | Alchemane`;
  const image = article.image ? `<figure class="article-hero__image"><img src="${escape(article.image)}" alt="${escape(article.alt || article.title)}" fetchpriority="high"></figure>` : '';
  const articleIndex = blogArticles.indexOf(article);
  const related = [-1, 1, -2, 2]
    .map(offset => blogArticles[articleIndex + offset])
    .filter(Boolean)
    .slice(0, 2);
  root.innerHTML = `${blogHeader('blogs')}<main id="main"><article class="article-page"><nav class="blog-breadcrumb blog-breadcrumb--article" aria-label="Breadcrumb"><ol><li><a href="/">Home</a></li><li><a href="/blogs.html">Blogs</a></li><li aria-current="page"><span class="blog-breadcrumb__current" title="${escape(article.title)}">${escape(article.title)}</span></li></ol></nav><header class="article-hero"><p class="blog-kicker">Alchemane journal</p><p class="article-hero__date">${escape(article.date)}</p><h1>${escape(article.title)}</h1>${image}</header><div class="article-layout"><div class="article-content" aria-live="polite"><p>Loading article…</p></div></div>${articleShareBar(article)}</article>${related.length ? `<section class="article-related" aria-labelledby="related-title"><h2 id="related-title">Continue reading</h2><div class="article-related__grid${related.length === 1 ? ' article-related__grid--single' : ''}">${related.map(relatedCard).join('')}</div></section>` : ''}</main>${blogFooter()}`;
  if (article.commentsEnabled) {
    const comment = document.createElement('section');
    comment.className = 'article-comment';
    comment.id = 'comments';
    comment.setAttribute('aria-labelledby', 'article-comment-title');
    comment.innerHTML = `<h2 id="article-comment-title">Leave a comment</h2><p id="article-comment-note" class="article-comment__note">This site is protected by hCaptcha and the hCaptcha <a href="https://hcaptcha.com/privacy" target="_blank" rel="noopener noreferrer">Privacy Policy</a> and <a href="https://hcaptcha.com/terms" target="_blank" rel="noopener noreferrer">Terms of Service</a> apply.</p><form class="article-comment__form" aria-describedby="article-comment-note"><div class="article-comment__fields"><label for="comment-name">Name<input id="comment-name" type="text" autocomplete="name" placeholder="Your name"></label><label for="comment-email">E-mail<input id="comment-email" type="email" inputmode="email" autocomplete="email" placeholder="you@example.com"></label></div><label for="comment-message">Message<textarea id="comment-message" rows="5" placeholder="Write your comment"></textarea></label><button type="submit">Submit</button><p class="article-comment__status" role="status" aria-live="polite"></p></form>`;
    root.querySelector('.article-page').append(comment);
    comment.querySelector('form').addEventListener('submit', event => {
      event.preventDefault();
      comment.querySelector('.article-comment__status').textContent = 'Comment submission will be available when the new website launches.';
    });
  }
  fetch(`/blog-content/${encodeURIComponent(article.slug)}.json`)
    .then(response => { if (!response.ok) throw new Error(`Article content unavailable: ${response.status}`); return response.json(); })
    .then(({ content }) => {
      const container = document.querySelector('.article-content');
      container.innerHTML = content;
      initTableOfContents(container);
    })
    .catch(() => { document.querySelector('.article-content').innerHTML = '<p>This article could not be loaded. Please refresh the page and try again.</p>'; });
}

initBlogShell();
