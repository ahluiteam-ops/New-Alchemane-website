import { shopProducts } from './shop-products.js';

export const bagKey = 'alchemane-product-bag-v2';
let memoryBag = [];
const validItem = item => {
  const product = shopProducts[item?.handle];
  return product?.variants.some(variant => variant.id === String(item.id))
    && (product.textures.length ? product.textures.includes(item.texture) : item.texture === '')
    && Number.isInteger(item.quantity) && item.quantity > 0 && item.quantity <= 10;
};
export function readBag() {
  try {
    const stored = JSON.parse(localStorage.getItem(bagKey) || '[]');
    memoryBag = Array.isArray(stored) ? stored.filter(validItem).map(item => ({ ...item, id: String(item.id) })) : [];
  } catch { /* Keep the current bag in memory when storage is unavailable. */ }
  return memoryBag.map(item => ({ ...item }));
}
export function writeBag(items) {
  memoryBag = items.filter(validItem).map(item => ({ ...item }));
  try { localStorage.setItem(bagKey, JSON.stringify(memoryBag)); } catch { /* Keep the active bag in memory. */ }
}
export function addToBag(selection) {
  if (!validItem(selection)) return { error: 'Choose your product options first.' };
  const product = shopProducts[selection.handle];
  if (!product.variants.find(variant => variant.id === selection.id)?.available) return { error: 'This option is currently unavailable.' };
  const items = readBag();
  const existing = items.find(item => item.handle === selection.handle && item.id === selection.id && item.texture === selection.texture);
  if ((existing?.quantity || 0) + selection.quantity > 10) return { error: 'You can add up to 10 of each option.' };
  if (existing) existing.quantity += selection.quantity;
  else items.push({ ...selection });
  writeBag(items);
  return { quantity: existing?.quantity ?? selection.quantity };
}
