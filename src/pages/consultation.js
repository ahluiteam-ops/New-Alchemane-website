import '../design-tokens.css';
import '../sections/site-footer.css';
import './consultation.css';
import { initConsultationMeet } from '../sections/consultation-meet.js';

const header = document.querySelector('.consult-header');
const menu = document.querySelector('.consult-menu');
const nav = document.querySelector('.consult-nav');

function closeMenu() {
  header.classList.remove('is-open');
  menu.setAttribute('aria-expanded', 'false');
  menu.setAttribute('aria-label', 'Open navigation menu');
}

menu.addEventListener('click', () => {
  const isOpen = header.classList.toggle('is-open');
  menu.setAttribute('aria-expanded', String(isOpen));
  menu.setAttribute('aria-label', isOpen ? 'Close navigation menu' : 'Open navigation menu');
});
nav.addEventListener('click', (event) => { if (event.target.closest('a')) closeMenu(); });
document.addEventListener('keydown', (event) => { if (event.key === 'Escape') closeMenu(); });

const bookingForm = document.querySelector('#consultation-booking-form');
const bookingStatus = bookingForm.querySelector('.consult-booking__status');
const whatsappLink = bookingForm.querySelector('#booking-whatsapp-link');
const bookingFields = {
  name: bookingForm.elements.namedItem('name'),
  phone: bookingForm.elements.namedItem('phone'),
};

const selectConsultationMeeting = initConsultationMeet(bookingForm);
if (new URLSearchParams(location.search).get('meeting') === 'Online') selectConsultationMeeting('Online');

function validationMessage(fieldName) {
  const value = bookingFields[fieldName].value.trim();
  if (fieldName === 'name') return value ? '' : 'Enter your name.';
  const digits = value.replace(/\D/g, '');
  return /^\+?[\d\s().-]+$/.test(value) && digits.length >= 7 && digits.length <= 15
    ? ''
    : 'Enter a valid phone number with 7–15 digits.';
}

function showFieldError(fieldName) {
  const input = bookingFields[fieldName];
  const error = bookingForm.querySelector(`#booking-${fieldName}-error`);
  const message = validationMessage(fieldName);
  error.textContent = message;
  error.hidden = !message;
  if (message) input.setAttribute('aria-invalid', 'true');
  else input.removeAttribute('aria-invalid');
  return message;
}

Object.entries(bookingFields).forEach(([fieldName, input]) => {
  input.addEventListener('blur', () => showFieldError(fieldName));
  input.addEventListener('input', () => {
    if (input.hasAttribute('aria-invalid')) showFieldError(fieldName);
  });
});

bookingForm.addEventListener('input', () => {
  bookingStatus.hidden = true;
  whatsappLink.removeAttribute('href');
});

bookingForm.addEventListener('submit', event => {
  event.preventDefault();
  const errors = Object.fromEntries(Object.keys(bookingFields).map(fieldName => [fieldName, showFieldError(fieldName)]));
  const firstInvalid = Object.keys(errors).find(fieldName => errors[fieldName]);
  if (firstInvalid) {
    bookingFields[firstInvalid].focus();
    return;
  }

  const data = new FormData(bookingForm);
  const name = String(data.get('name')).trim();
  const phone = String(data.get('phone')).trim();
  const city = String(data.get('city')).trim();
  const meeting = data.get('meeting') === 'Online' ? 'Online video call' : 'In person at Khar West studio, Mumbai';
  const message = `Hello Alchemane, I’d like to request a consultation.\n\nName: ${name}\nPhone: ${phone}${city ? `\nCity: ${city}` : ''}\nMeeting: ${meeting}\nConsultation fee: ₹299\n\nPlease confirm an available slot and payment details.`;
  whatsappLink.href = `https://wa.me/918591116455?text=${encodeURIComponent(message)}`;
  bookingStatus.hidden = false;
  whatsappLink.focus();
});

document.querySelector('[data-year]').textContent = new Date().getFullYear();
