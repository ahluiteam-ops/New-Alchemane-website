import './checkout.css';
import { getCountries, getCountryCallingCode, parsePhoneNumberFromString } from 'libphonenumber-js/min';
import { formatPrice } from '../products/product-content.js';
import { shopProducts } from '../products/shop-products.js';
import { readBag } from '../products/cart.js';

const sample = { handle: 'silk-hair-toppers', id: '41758814142523', texture: 'Straight', quantity: 1 };
const countryNames = new Intl.DisplayNames(['en'], { type: 'region' });
const countries = getCountries().map(code => ({ code, name: countryNames.of(code) || code, dial: getCountryCallingCode(code) }))
  .sort((a, b) => a.name.localeCompare(b.name));
const namesByCode = new Map(countries.map(({ code, name }) => [code, name]));
const regionRequired = new Set(['AU', 'BR', 'CA', 'IN', 'MX', 'US']);
const postalRequired = new Set(['AU', 'BR', 'CA', 'DE', 'FR', 'GB', 'IN', 'JP', 'MX', 'NZ', 'US']);
const escape = value => String(value).replace(/[&<>"']/g, character => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[character]));
const form = document.querySelector('#checkout-form');
const summary = document.querySelector('#order-summary');
const errorSummary = document.querySelector('#checkout-errors');
const reviewDialog = document.querySelector('#review-dialog');
const policyDialog = document.querySelector('#policy-dialog');
const dialSelect = document.querySelector('#checkout-phone-country');
const deliveryCountry = document.querySelector('#checkout-country');
const billingFields = document.querySelector('#billing-fields');
let dialChangedByShopper = false;

for (const select of document.querySelectorAll('#checkout-country, #billing-country')) {
  select.innerHTML = countries.map(({ code, name }) => `<option value="${code}">${escape(name)}</option>`).join('');
  select.value = 'IN';
}
dialSelect.innerHTML = countries.map(({ code, name, dial }) => `<option value="${code}">+${dial} ${escape(name)}</option>`).join('');
dialSelect.value = 'IN';

let bag = readBag();
if (!bag.length && new URLSearchParams(location.search).get('preview') === '1') {
  bag = [sample];
  document.querySelector('#intro-note').textContent = 'Sample order for layout review.';
  document.querySelector('#intro-note').hidden = false;
}
if (!bag.length) {
  form.hidden = true;
  document.querySelector('.co-aside').hidden = true;
  document.querySelector('#checkout-empty').hidden = false;
} else {
  let subtotal = 0;
  document.querySelector('#summary-items').innerHTML = bag.map(item => {
    const product = shopProducts[item.handle];
    const variant = product.variants.find(option => option.id === String(item.id));
    const price = variant.price * item.quantity;
    subtotal += price;
    return `<article class="co-item"><div class="co-item__image"><img src="${escape(product.image)}" width="64" height="76" alt=""><span class="co-item__quantity" aria-label="Quantity ${item.quantity}">${item.quantity}</span></div><div class="co-item__copy"><strong>${escape(product.name)}</strong><p>${escape(variant.title)}</p>${item.texture ? `<p>${escape(item.texture)}</p>` : ''}</div><span class="co-item__price">${formatPrice(price)}</span></article>`;
  }).join('');
  document.querySelector('#summary-toggle-total').textContent = formatPrice(subtotal);
  document.querySelector('#summary-subtotal').textContent = formatPrice(subtotal);
}

const wide = matchMedia('(min-width: 851px)');
const syncSummary = () => { summary.open = wide.matches; };
syncSummary();
wide.addEventListener('change', syncSummary);

const getValue = id => document.getElementById(id).value.trim();
const setError = (field, message) => {
  const note = document.getElementById(`${field.id}-error`);
  if (!note) return;
  note.textContent = message;
  note.hidden = !message;
  if (message) field.setAttribute('aria-invalid', 'true');
  else field.removeAttribute('aria-invalid');
};
const updateAddressLabels = prefix => {
  const code = getValue(`${prefix}-country`);
  const labels = { IN: ['State or union territory', 'PIN code'], US: ['State', 'ZIP code'], CA: ['Province or territory', 'Postal code'], AU: ['State or territory', 'Postcode'], BR: ['State', 'Postal code'], GB: ['County or region', 'Postcode'] };
  const [regionLabel, postalLabel] = labels[code] || ['State, province or region', 'Postal code'];
  const needsRegion = regionRequired.has(code);
  const needsPostal = postalRequired.has(code);
  document.getElementById(`${prefix}-region-label`).textContent = regionLabel;
  document.getElementById(`${prefix}-postal-label`).textContent = postalLabel;
  document.getElementById(`${prefix}-region-optional`).hidden = needsRegion;
  document.getElementById(`${prefix}-postal-optional`).hidden = needsPostal;
  document.getElementById(`${prefix}-region`).required = needsRegion;
  document.getElementById(`${prefix}-postal`).required = needsPostal;
  document.getElementById(`${prefix}-postal`).inputMode = code === 'IN' ? 'numeric' : 'text';
  if (prefix === 'checkout') {
    const isIndia = code === 'IN';
    document.querySelector('#shipping-status').textContent = isIndia
      ? 'Free shipping across India.'
      : 'International shipping needs a quote before payment. The final total is not available yet.';
    document.querySelector('#summary-shipping').textContent = isIndia ? 'Free in India' : 'Quote required';
    document.querySelector('#summary-tax-note').textContent = isIndia
      ? 'Includes 18% GST in item prices. No GST is added here.'
      : 'Item prices are shown in INR. International taxes and import charges may apply.';
    document.querySelector('#summary-tax-short').textContent = isIndia ? 'Includes 18% GST' : 'Items subtotal';
    if (!dialChangedByShopper) dialSelect.value = code;
  }
};
updateAddressLabels('checkout');
updateAddressLabels('billing');

const validEmail = value => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
const messageFor = field => {
  const value = field.value.trim();
  const id = field.id;
  if (id === 'checkout-email') return validEmail(value) ? '' : 'Enter a valid email address.';
  if (id === 'checkout-phone') return parsePhoneNumberFromString(value, dialSelect.value)?.isPossible() ? '' : 'Enter a valid mobile number for the selected calling code.';
  if (id.endsWith('-country')) return value ? '' : 'Choose a country or region.';
  if (id.endsWith('-name')) return value ? '' : 'Enter a full name.';
  if (id.endsWith('-address')) return value ? '' : 'Enter a street address.';
  if (id.endsWith('-city')) return value ? '' : 'Enter a city or locality.';
  if (id.endsWith('-region')) return field.required && !value ? 'Enter a state, province or region.' : '';
  if (id.endsWith('-postal')) {
    const code = getValue(`${id.split('-')[0]}-country`);
    if (code === 'IN' && !/^\d{6}$/.test(value)) return 'Enter a 6-digit PIN code.';
    return field.required && !value ? 'Enter a postal code.' : value.length > 20 ? 'Enter a shorter postal code.' : '';
  }
  return '';
};
const fieldsToValidate = ['checkout-email', 'checkout-phone', 'checkout-country', 'checkout-name', 'checkout-address', 'checkout-city', 'checkout-region', 'checkout-postal', 'billing-country', 'billing-name', 'billing-address', 'billing-city', 'billing-region', 'billing-postal'];
form.addEventListener('focusout', event => {
  if (fieldsToValidate.includes(event.target.id) && !event.target.disabled) setError(event.target, messageFor(event.target));
});
form.addEventListener('input', event => {
  if (fieldsToValidate.includes(event.target.id) && event.target.hasAttribute('aria-invalid')) setError(event.target, messageFor(event.target));
});
form.addEventListener('change', event => {
  if (event.target.id === 'checkout-country' || event.target.id === 'billing-country') {
    const prefix = event.target.id.split('-')[0];
    updateAddressLabels(prefix);
    for (const part of ['region', 'postal']) {
      const field = document.getElementById(`${prefix}-${part}`);
      if (field.hasAttribute('aria-invalid')) setError(field, messageFor(field));
    }
  }
  if (event.target === dialSelect) {
    dialChangedByShopper = true;
    const field = document.querySelector('#checkout-phone');
    if (field.hasAttribute('aria-invalid')) setError(field, messageFor(field));
  }
  if (event.target.id === 'billing-different') {
    billingFields.hidden = !event.target.checked;
    billingFields.disabled = !event.target.checked;
    if (!event.target.checked) billingFields.querySelectorAll('[aria-invalid]').forEach(field => setError(field, ''));
  }
});

const addReviewDetail = (label, value) => {
  const row = document.createElement('div');
  const term = document.createElement('dt');
  const description = document.createElement('dd');
  term.textContent = label;
  description.textContent = value;
  row.append(term, description);
  document.querySelector('#review-details').append(row);
};
const addressLine = prefix => [getValue(`${prefix}-name`), getValue(`${prefix}-address`), getValue(`${prefix}-apartment`), getValue(`${prefix}-city`), getValue(`${prefix}-region`), getValue(`${prefix}-postal`), namesByCode.get(getValue(`${prefix}-country`))].filter(Boolean).join(', ');
form.addEventListener('submit', event => {
  event.preventDefault();
  const errors = [];
  for (const id of fieldsToValidate) {
    const field = document.getElementById(id);
    if (field.matches(':disabled')) continue;
    const message = messageFor(field);
    setError(field, message);
    if (message) errors.push({ id, message });
  }
  if (errors.length) {
    errorSummary.querySelector('ul').innerHTML = errors.map(({ id, message }) => `<li><a href="#${id}">${escape(message)}</a></li>`).join('');
    errorSummary.hidden = false;
    errorSummary.focus({ preventScroll: true });
    errorSummary.scrollIntoView({ behavior: 'instant', block: 'start' });
    return;
  }
  errorSummary.hidden = true;
  document.querySelector('#review-details').replaceChildren();
  addReviewDetail('Email', getValue('checkout-email'));
  addReviewDetail('Mobile', parsePhoneNumberFromString(getValue('checkout-phone'), dialSelect.value).number);
  addReviewDetail('Delivery', addressLine('checkout'));
  addReviewDetail('Billing', document.querySelector('#billing-different').checked ? addressLine('billing') : 'Same as delivery address');
  addReviewDetail('Items subtotal (INR)', document.querySelector('#summary-subtotal').textContent);
  reviewDialog.showModal();
});

document.querySelector('#policy-open').addEventListener('click', () => policyDialog.showModal());
document.querySelectorAll('[data-close-dialog]').forEach(button => button.addEventListener('click', () => button.closest('dialog').close()));
for (const dialog of [reviewDialog, policyDialog]) dialog.addEventListener('click', event => {
  if (event.target === dialog) dialog.close();
});
