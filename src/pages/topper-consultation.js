const form = document.querySelector('#topper-consultation-form');
const errors = document.querySelector('#booking-errors');
const status = document.querySelector('#booking-status');
const whatsapp = document.querySelector('#booking-message');
const fields = { name: form.elements.name, phone: form.elements.phone, date: form.elements.date };
const fee = new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 })
  .format(Number(document.querySelector('[data-consultation-fee]').dataset.consultationFee));
const abort = new AbortController();
const on = (target, type, handler) => target.addEventListener(type, handler, { signal: abort.signal });
const clearDraft = () => { status.hidden = true; whatsapp.removeAttribute('href'); };
const todayInIndia = () => {
  const parts = new Intl.DateTimeFormat('en', { timeZone: 'Asia/Kolkata', year: 'numeric', month: '2-digit', day: '2-digit' }).formatToParts(new Date());
  return ['year', 'month', 'day'].map(type => parts.find(part => part.type === type).value).join('-');
};
const preferredDate = value => value
  ? new Intl.DateTimeFormat('en-IN', { timeZone: 'Asia/Kolkata', day: 'numeric', month: 'short', year: 'numeric' }).format(new Date(`${value}T12:00:00+05:30`))
  : 'No preference';

const updateMeeting = () => {
  document.querySelector('#studio-address').hidden = form.elements.meeting.value !== 'studio';
  clearDraft();
};
form.querySelectorAll('[name="meeting"]').forEach(input => on(input, 'change', updateMeeting));
if (new URLSearchParams(location.search).get('meeting') === 'studio') form.elements.meeting.value = 'studio';
updateMeeting();
fields.date.min = todayInIndia();
document.querySelector('[data-year]').textContent = todayInIndia().slice(0, 4);

const validationMessage = name => {
  const value = fields[name].value.trim();
  if (name === 'name' && !value) return 'Enter your name.';
  if (name === 'phone') {
    const digits = value.replace(/\D/g, '');
    if (!/^[+\d\s()-]+$/.test(value) || digits.length < 7 || digits.length > 15) return 'Enter a valid WhatsApp number, including your country code.';
  }
  if (name === 'date' && (fields.date.validity.badInput || (value && (!/^\d{4}-\d{2}-\d{2}$/.test(value) || value < todayInIndia())))) return 'Choose today or a later date.';
  return '';
};
const showFieldError = name => {
  const message = validationMessage(name);
  const output = document.querySelector(`#booking-${name}-error`);
  output.textContent = message;
  output.hidden = !message;
  if (message) fields[name].setAttribute('aria-invalid', 'true');
  else fields[name].removeAttribute('aria-invalid');
  return message;
};
const updateErrorSummary = () => {
  const list = errors.querySelector('ul');
  list.replaceChildren();
  Object.keys(fields).forEach(name => {
    const message = showFieldError(name);
    if (!message) return;
    const item = document.createElement('li');
    const link = document.createElement('a');
    link.href = `#booking-${name}`;
    link.textContent = message;
    item.append(link);
    list.append(item);
  });
  errors.hidden = !list.children.length;
  return !errors.hidden;
};
Object.entries(fields).forEach(([name, input]) => {
  on(input, 'blur', () => showFieldError(name));
  on(input, 'input', () => {
    clearDraft();
    if (input.hasAttribute('aria-invalid')) showFieldError(name);
    if (!errors.hidden) updateErrorSummary();
  });
});
const focusSection = (section, focusTarget) => {
  section.scrollIntoView({ block: 'start', behavior: 'instant' });
  focusTarget.focus({ preventScroll: true });
};

// The customer reviews the draft in WhatsApp and chooses whether to send it.
on(form, 'submit', event => {
  event.preventDefault();
  fields.date.min = todayInIndia();
  if (updateErrorSummary()) {
    focusSection(errors, errors);
    return;
  }
  const data = new FormData(form);
  const summary = {
    meeting: data.get('meeting') === 'studio' ? 'In person · Khar West, Mumbai' : 'Online · Video call',
    name: data.get('name').trim(),
    phone: data.get('phone').trim(),
    date: preferredDate(data.get('date')),
  };
  const productContext = data.get('product') ? `Product: ${data.get('product')}\nSelected options: ${data.get('selection')}\n` : '';
  const message = `Hello Alchemane, I’d like to request a hair topper consultation.\n\n${productContext}Consultation: ${summary.meeting}\nConsultation fee: ${fee}\nName: ${summary.name}\nWhatsApp number: ${summary.phone}\nPreferred date: ${summary.date}\n\nPlease confirm availability and payment details.`;
  whatsapp.href = `https://wa.me/919967123333?text=${encodeURIComponent(message)}`;
  status.hidden = false;
  window.open(whatsapp.href, '_blank', 'noopener,noreferrer');
});

form.noValidate = true;
form.hidden = false;

if (import.meta.hot) import.meta.hot.dispose(() => abort.abort());
