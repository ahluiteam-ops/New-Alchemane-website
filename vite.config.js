import { defineConfig } from 'vite';
import tailwindcss from '@tailwindcss/vite';
import { readFileSync } from 'node:fs';
import { renderRangePlaceholders } from './src/sections/range-data.js';
import { renderReels } from './src/sections/reel-data.js';
import { renderCatalogue } from './src/sections/catalogue-data.js';
import { renderExtensions } from './src/sections/extensions-data.js';
import { renderTestimonials, renderCelebrityPicks } from './src/sections/testimonials-data.js';
import { renderSolutions } from './src/sections/solutions-data.js';

export default defineConfig({
  // The shop homepage plus one detail page per category with its own explainer: extensions, toppers, wigs.
  build: { rollupOptions: { input: { main: 'index.html', extensions: 'extensions.html', permanentExtensions: 'permanent-extensions.html', toppers: 'toppers.html', wigs: 'wigs.html' } } },
  plugins: [tailwindcss(), {
    name: 'page-sections',
    transformIndexHtml(html) {
      // Every product grid is rendered from the data modules at build time so it
      // ships as static, crawlable HTML rather than appearing after hydration.
      const sections = renderReels(renderRangePlaceholders(readFileSync(new URL('./src/homepage.html', import.meta.url), 'utf8')))
        .replace('<!-- testimonials -->', renderTestimonials())
        .replace('<!-- celebrity-picks -->', renderCelebrityPicks())
        .replace('<!-- hair-solutions -->', renderSolutions());
      return renderReels(html
        .replace('<!-- homepage-sections -->', sections)
        .replace('<!-- hair-solutions -->', renderSolutions())
        .replace('<!-- product-discovery -->', renderCatalogue())
        .replace('<!-- extensions-sections -->', renderExtensions()));
    },
    handleHotUpdate({ file, server }) {
      if (file.endsWith('homepage.html')) server.ws.send({ type: 'full-reload' });
    },
  }],
});
