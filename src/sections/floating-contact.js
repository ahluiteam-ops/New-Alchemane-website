const WHATSAPP_NUMBER = '919967123333';

export function initFloatingContact() {
  const widget = document.querySelector('[data-contact-widget]');
  const trigger = widget?.querySelector('[data-contact-trigger]');
  const triggerLabel = widget?.querySelector('[data-contact-trigger-label]');
  const actions = widget?.querySelector('[data-contact-actions]');
  const callbackButton = widget?.querySelector('[data-contact-callback]');
  const dialog = document.querySelector('[data-callback-dialog]');
  const closeButton = dialog?.querySelector('[data-callback-close]');
  const form = dialog?.querySelector('[data-callback-form]');
  const submitButton = dialog?.querySelector('[data-callback-submit]');
  const status = dialog?.querySelector('[data-callback-status]');
  const whatsappLink = dialog?.querySelector('[data-callback-whatsapp-link]');
  if (!widget || !trigger || !actions || !callbackButton || !dialog || !form) return;

  let restoreFocusTo = null;

  const setMenu = open => {
    widget.classList.toggle('is-open', open);
    trigger.setAttribute('aria-expanded', String(open));
    actions.toggleAttribute('inert', !open);
    actions.setAttribute('aria-hidden', String(!open));
    if (triggerLabel) triggerLabel.textContent = open ? 'Close contact options' : 'Open contact options';
  };

  const clearFieldError = input => {
    input.removeAttribute('aria-invalid');
    const error = form.querySelector(`[data-error-for="${input.name}"]`);
    if (error) error.textContent = '';
  };

  const setFieldError = (input, message) => {
    input.setAttribute('aria-invalid', 'true');
    const error = form.querySelector(`[data-error-for="${input.name}"]`);
    if (error) error.textContent = message;
  };

  const resetFeedback = () => {
    form.querySelectorAll('input').forEach(clearFieldError);
    if (status) status.hidden = true;
  };

  trigger.addEventListener('click', () => setMenu(trigger.getAttribute('aria-expanded') !== 'true'));

  actions.addEventListener('click', event => {
    if (event.target.closest('a')) setMenu(false);
  });

  callbackButton.addEventListener('click', () => {
    restoreFocusTo = callbackButton;
    setMenu(false);
    resetFeedback();
    dialog.showModal();
    requestAnimationFrame(() => form.elements.name.focus());
  });

  closeButton?.addEventListener('click', () => dialog.close());

  dialog.addEventListener('click', event => {
    const bounds = dialog.getBoundingClientRect();
    const outside = event.clientX < bounds.left || event.clientX > bounds.right || event.clientY < bounds.top || event.clientY > bounds.bottom;
    if (outside) dialog.close();
  });

  dialog.addEventListener('close', () => {
    restoreFocusTo?.focus();
    restoreFocusTo = null;
  });

  document.addEventListener('click', event => {
    if (!widget.contains(event.target)) setMenu(false);
  });

  document.addEventListener('keydown', event => {
    if (event.key === 'Escape' && !dialog.open && trigger.getAttribute('aria-expanded') === 'true') {
      setMenu(false);
      trigger.focus();
    }
  });

  form.querySelectorAll('input').forEach(input => {
    input.addEventListener('input', () => clearFieldError(input));
    input.addEventListener('blur', () => {
      if (input.value.trim()) clearFieldError(input);
    });
  });

  form.addEventListener('submit', event => {
    event.preventDefault();
    resetFeedback();

    const name = form.elements.name;
    const mobile = form.elements.mobile;
    const email = form.elements.email;
    const trimmedName = name.value.trim();
    const trimmedMobile = mobile.value.trim();
    const trimmedEmail = email.value.trim();
    const mobileDigits = trimmedMobile.replace(/\D/g, '');
    const invalidFields = [];

    if (trimmedName.length < 2) {
      setFieldError(name, 'Enter your name using at least 2 characters.');
      invalidFields.push(name);
    }
    if (mobileDigits.length < 7 || mobileDigits.length > 15) {
      setFieldError(mobile, 'Enter a valid mobile number with 7 to 15 digits.');
      invalidFields.push(mobile);
    }
    if (trimmedEmail && email.validity.typeMismatch) {
      setFieldError(email, 'Enter a valid email address, such as you@example.com.');
      invalidFields.push(email);
    }

    if (invalidFields.length) {
      invalidFields[0].focus();
      return;
    }

    const message = [
      'Hello Alchemane, I would like to request a callback.',
      `Name: ${trimmedName}`,
      `Mobile: ${trimmedMobile}`,
      trimmedEmail ? `Email: ${trimmedEmail}` : null,
    ].filter(Boolean).join('\n');
    const url = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;

    if (whatsappLink) whatsappLink.href = url;
    if (status) status.hidden = false;
    if (submitButton) {
      submitButton.disabled = true;
      submitButton.firstChild.textContent = 'Opening WhatsApp ';
      window.setTimeout(() => {
        submitButton.disabled = false;
        submitButton.firstChild.textContent = 'Request my callback ';
      }, 700);
    }
    window.open(url, '_blank', 'noopener,noreferrer');
  });

  setMenu(false);
  return () => setMenu(false);
}
