import { defineConfig } from 'vite';
import tailwindcss from '@tailwindcss/vite';
import { readFileSync } from 'node:fs';
import { renderRangePlaceholders } from './src/sections/range-data.js';
import { renderReels } from './src/sections/reel-data.js';
import { renderCatalogue, renderDiscovery } from './src/sections/catalogue-data.js';
import { renderExtensions } from './src/sections/extensions-data.js';
import { renderTestimonials } from './src/sections/testimonials-data.js';

export default defineConfig({
  // Two pages: the shop homepage and the Hair Extensions page.
  build: { rollupOptions: { input: { main: 'index.html', extensions: 'extensions.html' } } },
  plugins: [tailwindcss(), {
    name: 'page-sections',
    transformIndexHtml(html) {
      // Every product grid is rendered from the data modules at build time so it
      // ships as static, crawlable HTML rather than appearing after hydration.
      const sections = renderReels(renderRangePlaceholders(readFileSync(new URL('./src/homepage.html', import.meta.url), 'utf8'))).replace('<!-- testimonials -->', renderTestimonials());
      return html
        .replace('<!-- homepage-sections -->', sections)
        .replace('<!-- collection-discovery -->', renderDiscovery())
        .replace('<!-- product-discovery -->', renderCatalogue())
        .replace('<!-- extensions-sections -->', renderExtensions());
    },
    handleHotUpdate({ file, server }) {
      if (file.endsWith('homepage.html')) server.ws.send({ type: 'full-reload' });
    },
  }],
});
