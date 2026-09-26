import { categories } from './catalogue-data.js';

export function renderSolutions() {
  return `<div class="solutions-journey" id="hair-solutions" aria-labelledby="solutions-title">
    <h2 id="solutions-title">Find the right hair solution</h2>
    <div class="solutions-tabs" role="tablist" aria-label="Hair product categories">
      ${categories.map((category, index) => `<button type="button" class="solutions-tab" id="solution-tab-${category.id}" role="tab" aria-controls="range" aria-selected="${index === 0}" tabindex="${index === 0 ? '0' : '-1'}" data-solution="${category.id}">${category.name}</button>`).join('')}
    </div>
  </div>`;
}
