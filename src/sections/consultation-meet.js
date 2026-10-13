import './consultation-meet.css';

export function initConsultationMeet(form) {
  const group = form.querySelector('[data-consultation-meet]');
  const input = group.querySelector('input[type="hidden"]');
  const note = group.querySelector('[data-meet-note]');
  const options = [...group.querySelectorAll('[data-meet-option]')];

  const select = value => {
    if (!options.some(option => option.dataset.meetOption === value)) return;
    const changed = input.value !== value;
    input.value = value;
    options.forEach(option => option.setAttribute('aria-pressed', String(option.dataset.meetOption === value)));
    note.textContent = value === 'Online' ? 'Meet from anywhere.' : 'In-person at our Khar West studio, Mumbai.';
    if (changed) input.dispatchEvent(new Event('input', { bubbles: true }));
  };

  options.forEach(option => option.addEventListener('click', () => select(option.dataset.meetOption)));
  select(input.value);
  return select;
}
