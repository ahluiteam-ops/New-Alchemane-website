import { mkdir, writeFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';

const indexFile = resolve('src/pages/blog-data.generated.js');
const contentDirectory = resolve('public/blog-content');
const routeDirectory = resolve('blogs');

export function articleBody(article) {
  let content = article.content;
  // The source reader includes the full shop chrome on older article pages.
  // Keep the original article, ending before its comment form and recommendations.
  if (content.includes('<h2>Read more</h2>')) {
    const heading = content.match(/<p># [^<]+<\/p>/);
    if (heading) content = content.slice(heading.index + heading[0].length);
    const byline = content.indexOf('<p>Written by Alchemane Hair Extensions</p>');
    const comments = content.indexOf('<h3>Leave a comment</h3>');
    const end = [byline, comments].filter(position => position >= 0).sort((a, b) => a - b)[0];
    if (end !== undefined) content = content.slice(0, end);
  }
  return content
    .replace(/\[\[([^\]]+)\]\]\((https?:\/\/[^)]+)\)/g, '<a href="$2">$1</a>')
    .replace(/\[([^\]]+)\]\((tel:|mailto:)([^)]+)\)/g, '<a href="$2$3">$1</a>');
}

export function repairArticleLinks(content, articles) {
  const slugs = articles.map(article => article.slug);
  content = content.replace(/href="(?:https:\/\/alchemane\.com)?\/blogs\/articles\/([^"/?#]+)\/?(?:[?#][^"]*)?"/g, (link, encoded) => slugs.includes(encoded) ? `href="/blogs/${encoded}/"` : link);
  return content.replace(/href="\/blogs\/([^/]+)\/"/g, (link, encoded) => {
    if (slugs.includes(encoded)) return link;
    let decoded;
    try { decoded = decodeURIComponent(encoded); } catch { decoded = encoded; }
    if (decoded.trim().startsWith('https:')) return 'href="/wigs.html"';
    const normalized = decoded.toLowerCase().normalize('NFKD').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
    const matching = slugs.find(slug => slug === normalized || slug.startsWith(`${normalized}-`) || normalized.startsWith(`${slug}-`));
    if (matching) return `href="/blogs/${matching}/"`;
    if (normalized.startsWith('wig-comfort-during-chemotherapy')) return 'href="/blogs/what-women-with-alopecia-should-know-about-wig-comfort/"';
    return `href="https://alchemane.com/blogs/articles/${encoded}"`;
  });
}

export async function writeBlogData(articles) {
  const metadata = articles.map(({ content, ...article }) => article);
  await mkdir(dirname(indexFile), { recursive: true });
  await mkdir(contentDirectory, { recursive: true });
  await mkdir(routeDirectory, { recursive: true });
  await writeFile(indexFile, `// Generated from alchemane.com by scripts/sync-blogs.mjs.\nexport const blogArticles = ${JSON.stringify(metadata)};\n`, 'utf8');
  for (const article of articles) {
    await writeFile(resolve(contentDirectory, `${article.slug}.json`), JSON.stringify({ content: repairArticleLinks(articleBody(article), articles) }), 'utf8');
    const file = resolve(routeDirectory, article.slug, 'index.html');
    await mkdir(dirname(file), { recursive: true });
    await writeFile(file, `<!doctype html><html lang="en" data-blog-slug="${article.slug}"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover"><meta name="theme-color" content="#ffffff"><meta name="description" content="${article.description.replaceAll('&', '&amp;').replaceAll('"', '&quot;').replaceAll('<', '&lt;')}"><link rel="icon" href="/favicon.svg" type="image/svg+xml"><title>${article.title.replaceAll('&', '&amp;').replaceAll('<', '&lt;')}</title></head><body id="top"><div id="blog-article-root"></div><script type="module" src="/src/pages/blog-detail.js"></script></body></html>`, 'utf8');
  }
  console.log(`Created ${articles.length} local article routes across ${Math.ceil(articles.length / 10)} index pages.`);
}
