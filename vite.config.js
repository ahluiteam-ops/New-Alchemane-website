import { defineConfig } from 'vite';
import tailwindcss from '@tailwindcss/vite';
import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { renderRangePlaceholders } from './src/sections/range-data.js';
import { renderReels } from './src/sections/reel-data.js';
import { renderCatalogue } from './src/sections/catalogue-data.js';
import { renderExtensions } from './src/sections/extensions-data.js';
import { renderTestimonials, renderCelebrityPicks, renderFlagshipStore } from './src/sections/testimonials-data.js';
import { renderSolutions } from './src/sections/solutions-data.js';
import { renderProductVideos } from './src/sections/product-videos-data.js';
import { renderProductPage } from './src/products/render-product.js';
import { addShopNavigation } from './src/components/shop-navigation-data.js';

const findBlogEntries = directory => existsSync(directory)
  ? readdirSync(directory, { withFileTypes: true }).flatMap(entry => entry.isDirectory() ? findBlogEntries(join(directory, entry.name)) : entry.name === 'index.html' ? [join(directory, entry.name)] : [])
  : [];
const blogArticleInputs = Object.fromEntries(findBlogEntries('blogs').map(file => [`blog-${file.replaceAll('\\', '-').replaceAll('/', '-').replace('-index.html', '')}`, file]));

export default defineConfig({
  // Shop and category pages, plus the optional hair topper consultation flow.
  build: { rollupOptions: { input: { main: 'index.html', checkout: 'checkout.html', extensions: 'extensions.html', permanentExtensions: 'permanent-extensions.html', toppers: 'toppers.html', topperConsultation: 'topper-consultation.html', consultation: 'consultation.html', blogs: 'blogs.html', wigs: 'wigs.html', silkTopper: 'products/silk-hair-toppers/index.html', privacyPolicy: 'pages/privacy-policy/index.html', returnsAndExchanges: 'pages/returns-and-exchanges/index.html', shippingDelivery: 'pages/shipping-delivery/index.html', termsOfService: 'pages/terms-of-service/index.html', ...blogArticleInputs } } },
  plugins: [tailwindcss(), {
    name: 'page-sections',
    transformIndexHtml: { order: 'pre', handler(html) {
      // Every product grid is rendered from the data modules at build time so it
      // ships as static, crawlable HTML rather than appearing after hydration.
      const sections = renderReels(renderRangePlaceholders(readFileSync(new URL('./src/homepage.html', import.meta.url), 'utf8')))
        .replace('<!-- product-videos -->', renderProductVideos())
        .replace('<!-- testimonials -->', renderTestimonials())
        .replace('<!-- celebrity-picks -->', renderCelebrityPicks())
        .replace('<!-- flagship-store -->', renderFlagshipStore())
        .replace('<!-- hair-solutions -->', renderSolutions());
      return addShopNavigation(renderReels(html.replace(/<!-- product-page:([a-z0-9-]+) -->/g, (_, handle) => renderProductPage(handle))
        .replace('<!-- homepage-sections -->', sections)
        .replace('<!-- hero-wordmark-vector -->', readFileSync(new URL('./public/assets/hero-your-match.svg', import.meta.url), 'utf8')
          .replace('<svg ', '<svg class="hero-wordmark-vector hero-wordmark-vector--compact" aria-hidden="true" focusable="false" width="1488" height="212" shape-rendering="geometricPrecision" ')
          + readFileSync(new URL('./public/assets/hero-your-match-desktop.svg', import.meta.url), 'utf8')
            .replace('<svg ', '<svg class="hero-wordmark-vector hero-wordmark-vector--desktop" aria-hidden="true" focusable="false" width="1488" height="212" shape-rendering="geometricPrecision" '))
        .replace('<!-- hair-solutions -->', renderSolutions())
        .replace('<!-- product-discovery -->', renderCatalogue())
        .replace('<!-- extensions-sections -->', renderExtensions())));
    } },
    handleHotUpdate({ file, server }) {
      if (file.endsWith('homepage.html')) server.ws.send({ type: 'full-reload' });
    },
  }],
});
