import './offer-popup.css';
import logoUrl from '../../icons/new logo.svg';
import whatsappUrl from '../../icons/logos_whatsapp-icon.svg';

// First-order offer popup, shared by the homepage and the extensions page.
//
// There is no backend behind this site, so the number is not stored anywhere
// on submit. Instead the visitor's WhatsApp opens with a message asking for
// the code, the same hand-off the consultation form uses. The copy says so —
// it promises the code on WhatsApp, not "instantly".
//
// Add ?offer=1 to any URL to open it immediately (for checking the design).

const OFFER = '5%';
const DELAY_MS = 8000;
const RETRY_MS = 10000;
const SNOOZE_DAYS = 14; // after a plain close, stay quiet this long
const STORE_KEY = 'alchemane-offer';
const WHATSAPP = '919967123333';
const PRIVACY_URL = 'https://alchemane.com/policies/privacy-policy';
const TERMS_URL = 'https://alchemane.com/policies/terms-of-service';

const wa = text => `https://wa.me/${WHATSAPP}?text=${encodeURIComponent(text)}`;

// Storage can throw (private mode, blocked site data); the popup must still work.
const read = () => { try { return JSON.parse(localStorage.getItem(STORE_KEY)) ?? {}; } catch { return {}; } };
const write = value => { try { localStorage.setItem(STORE_KEY, JSON.stringify(value)); } catch { /* ignore */ } };

// Client decision: show on every page load. Set to true to go back to
// remembering visitors (claimed = never again, closed = quiet for SNOOZE_DAYS).
const REMEMBER_VISITOR = false;

function shouldShow() {
  if (!REMEMBER_VISITOR) return true;
  if (new URLSearchParams(location.search).get('offer') === '1') return true;
  const state = read();
  if (state.claimed) return false;
  if (state.dismissedAt && Date.now() - state.dismissedAt < SNOOZE_DAYS * 864e5) return false;
  return true;
}

const icon = {
  sparkle: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 3.5 13.9 9 19.5 11 13.9 13 12 18.5 10.1 13 4.5 11 10.1 9Z"/><path d="M19 3v3M17.5 4.5h3M5 17.5v3M3.5 19h3"/></svg>',
  gem: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6.5 4h11L21 9l-9 11L3 9Z"/><path d="M3 9h18M9.5 4 8 9l4 11 4-11-1.5-5"/></svg>',
  guide: '<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="9" cy="8" r="3.5"/><path d="M3 19.5c.6-3.3 3-5.5 6-5.5 1.4 0 2.6.4 3.6 1.2M15 16.5l2 2 4-4"/></svg>',
  close: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="m6 6 12 12M18 6 6 18"/></svg>',
};

function markup() {
  return `<dialog class="offer-dialog" aria-labelledby="offer-title" aria-describedby="offer-intro">
    <button type="button" class="offer-close" data-offer-close aria-label="Close offer">${icon.close}</button>
    <div class="offer-panel offer-panel--brand">
      <img class="offer-logo" src="${logoUrl}" alt="Alchemane" width="160" height="40">
      <p class="offer-headline" aria-hidden="true">Get <span>${OFFER} off</span><br>your first online order</p>
      <ul class="offer-benefits" role="list">
        <li>${icon.sparkle}<span><strong>New products first</strong><span class="offer-benefit-detail">Hear about new products before they launch</span></span></li>
        <li>${icon.gem}<span><strong>100% human hair</strong><span class="offer-benefit-detail">Made for a natural look</span></span></li>
        <li>${icon.guide}<span><strong>Help choosing</strong><span class="offer-benefit-detail">We help you choose the right product and colour</span></span></li>
      </ul>
    </div>
    <div class="offer-panel offer-panel--form">
      <div class="offer-step" data-offer-step="form">
        <h2 id="offer-title" tabindex="-1">Get ${OFFER} off</h2>
        <p id="offer-intro" class="offer-intro">Enter your number and we’ll send your ${OFFER} code on WhatsApp.</p>
        <form class="offer-form" novalidate>
          <label class="offer-label" for="offer-phone">Mobile number</label>
          <div class="offer-phone">
            <span class="offer-prefix" aria-hidden="true">IN +91</span>
            <input id="offer-phone" name="phone" type="tel" inputmode="numeric" autocomplete="tel-national" maxlength="10" placeholder="10-digit mobile number" aria-describedby="offer-error" required>
          </div>
          <p class="offer-error" id="offer-error" role="alert" hidden>Enter a 10-digit mobile number starting with 6, 7, 8 or 9.</p>
          <label class="offer-consent"><input type="checkbox" name="updates"> Send me offers and updates</label>
          <button type="submit" class="solid-button offer-submit">Get my code</button>
        </form>
        <a class="offer-whatsapp" href="${wa(`Hello Alchemane, I’d like the ${OFFER} first-order offer.`)}" target="_blank" rel="noopener noreferrer"><img src="${whatsappUrl}" alt="" width="22" height="22">Prefer WhatsApp? Chat with us</a>
        <p class="offer-legal">By submitting, I accept the <a href="${PRIVACY_URL}" target="_blank" rel="noopener noreferrer">Privacy Policy</a> &amp; <a href="${TERMS_URL}" target="_blank" rel="noopener noreferrer">Terms &amp; Conditions</a>.</p>
      </div>
      <div class="offer-step" data-offer-step="done" hidden>
        <h2 id="offer-done-title" tabindex="-1">Almost there</h2>
        <p class="offer-intro">Send the message that just opened in WhatsApp, and our team will reply with your ${OFFER} code.</p>
        <a class="solid-button offer-submit" data-offer-send target="_blank" rel="noopener noreferrer">Open WhatsApp</a>
        <button type="button" class="offer-later" data-offer-close>Continue browsing</button>
      </div>
    </div>
  </dialog>`;
}

export function initOfferPopup() {
  if (!shouldShow()) return () => {};
  document.body.insertAdjacentHTML('beforeend', markup());
  const dialog = document.querySelector('.offer-dialog');
  const form = dialog.querySelector('.offer-form');
  const phone = form.elements.phone;
  const error = dialog.querySelector('.offer-error');
  const abort = new AbortController();
  const on = (el, type, fn) => el.addEventListener(type, fn, { signal: abort.signal });
  let timer;

  const close = () => {
    if (REMEMBER_VISITOR && !read().claimed) write({ dismissedAt: Date.now() });
    dialog.close();
  };

  const open = () => {
    // Don't interrupt: wait while another dialog is open, a film is playing,
    // or the tab isn't visible.
    const busy = document.querySelector('dialog[open]:not(.offer-dialog)')
      || [...document.querySelectorAll('video')].some(v => !v.paused)
      || document.hidden;
    if (busy) { timer = setTimeout(open, RETRY_MS); return; }
    dialog.showModal();
    dialog.querySelector('#offer-title').focus({ preventScroll: true });
  };

  dialog.querySelectorAll('[data-offer-close]').forEach(el => on(el, 'click', close));
  on(dialog, 'cancel', event => { event.preventDefault(); close(); }); // Esc
  on(dialog, 'click', event => { if (event.target === dialog) close(); }); // backdrop

  on(phone, 'input', () => {
    phone.value = phone.value.replace(/\D/g, '').slice(0, 10);
    error.hidden = true;
    phone.removeAttribute('aria-invalid');
  });

  on(form, 'submit', event => {
    event.preventDefault();
    if (!/^[6-9]\d{9}$/.test(phone.value)) {
      error.hidden = false;
      phone.setAttribute('aria-invalid', 'true');
      phone.focus();
      return;
    }
    const updates = form.elements.updates.checked;
    const link = wa(`Hello Alchemane, I’d like my ${OFFER} first-order code.\nMy number: +91 ${phone.value}${updates ? '\nPlease also send me offers and updates.' : ''}`);
    if (REMEMBER_VISITOR) write({ claimed: true });
    window.open(link, '_blank', 'noopener');
    dialog.querySelector('[data-offer-send]').href = link; // fallback if the tab was blocked
    dialog.querySelector('[data-offer-step="form"]').hidden = true;
    dialog.querySelector('[data-offer-step="done"]').hidden = false;
    dialog.setAttribute('aria-labelledby', 'offer-done-title');
    dialog.querySelector('#offer-done-title').focus({ preventScroll: true });
  });

  const forced = new URLSearchParams(location.search).get('offer') === '1';
  timer = setTimeout(open, forced ? 300 : DELAY_MS);

  return () => { clearTimeout(timer); abort.abort(); dialog.remove(); };
}
