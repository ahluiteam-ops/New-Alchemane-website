import { categories } from './catalogue-data.js';
import { collectionUrl, arrowIcon } from '../collections/collection-data.js';

export function renderSolutions() {
  return `<div class="solutions-journey" id="hair-solutions" aria-labelledby="solutions-title">
    <h2 id="solutions-title">Find the right hair solution</h2>
    <div class="solutions-tabs" role="tablist" aria-label="Hair product categories">
      ${categories.map((category, index) => `<button type="button" class="solutions-tab" id="solution-tab-${category.id}" role="tab" aria-controls="range" aria-selected="${index === 0}" tabindex="${index === 0 ? '0' : '-1'}" data-solution="${category.id}">
        <span class="solutions-tab-photo"><img src="/assets/category-tabs/${category.id}.webp" alt="" width="240" height="240" loading="lazy" decoding="async"></span>
        <span class="solutions-tab-label">${category.name}</span>
      </button>`).join('')}
    </div>
  </div>`;
}

export function renderSquareSolutions() {
  return `<section class="solution-discovery" id="explore-collections" aria-labelledby="explore-collections-title">
    <div class="solution-discovery__inner">
      <div class="solution-discovery__heading">
        <h2 id="explore-collections-title">Explore every collection</h2>
      </div>
      <nav class="solution-grid" aria-label="Explore product collections" data-solution-grid>
        ${categories.map(category => `<a class="solution-card" href="${collectionUrl(category.id)}">
          <span class="solution-card__photo"><img src="/assets/range/${category.image}-a.webp" alt="" width="1200" height="1200" loading="lazy" decoding="async"></span>
          <span class="solution-card__label">${category.name}${arrowIcon}</span>
        </a>`).join('')}
      </nav>
      <a class="solutions-all" href="${collectionUrl('all')}">Explore all products${arrowIcon}</a>
    </div>
  </section>`;
}
