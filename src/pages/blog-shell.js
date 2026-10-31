import { desktopShopTrigger, renderShopPanel } from '../components/shop-navigation-data.js';
import { initShopNavigation } from '../components/shop-navigation.js';

export function blogHeader(active = '') {
  return `<a class="blog-skip" href="#main">Skip to content</a>
    <header class="blog-header"><div class="blog-header__inner">
      <a class="blog-brand" href="/" aria-label="Alchemane home"><img src="/icons/new%20logo.svg" alt="" width="160" height="40"></a>
      <nav class="blog-nav" id="blog-nav" aria-label="Main navigation">
        <a href="/">Home</a>${desktopShopTrigger()}<a href="/permanent-extensions.html">Permanent Extensions</a><a href="/toppers.html">Hair Toppers</a><a href="/wigs.html">Wigs</a><a href="/consultation.html">Book A Consultation</a>
      </nav>
      <a class="desktop-header-cta" href="/consultation.html">Book consultation</a>
      <button class="blog-menu" type="button" aria-label="Open navigation menu" aria-controls="blog-nav" aria-expanded="false"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 7h16M4 12h16M4 17h16"/></svg></button>
    </div>${renderShopPanel()}</header>`;
}

export function blogFooter() {
  return `<footer class="site-footer" aria-label="Footer"><div class="footer-main"><div class="footer-brand-column"><a class="footer-brand" href="/" aria-label="Alchemane home"><img class="footer-logo" src="/icons/new%20logo.svg" alt="" width="160" height="40"></a><address class="footer-address"><strong>Address</strong> – 4th floor Empressa Building, 2nd Rd, Khar, Ram Krishna Nagar, Khar West, Mumbai, Maharashtra 400052.</address></div><nav class="footer-nav-column" aria-label="Solutions"><p class="footer-title">Solutions</p><a href="/permanent-extensions.html">Permanent Extensions</a><a href="/wigs.html">Hair Wigs</a><a href="/toppers.html">Hair Toppers</a></nav><nav class="footer-nav-column" aria-label="Information"><p class="footer-title">Information</p><a href="/blogs.html" aria-current="page">Blogs</a><a href="/pages/privacy-policy/">Privacy Policy</a><a href="/pages/returns-and-exchanges/">Returns and Exchanges</a><a href="/pages/shipping-delivery/">Shipping and Delivery</a><a href="/pages/terms-of-service/">Terms of Service</a></nav><div class="footer-contact-column"><p class="footer-title">Contact Us</p><a class="footer-contact-link" href="tel:+919967123333"><img src="/icons/footer/call.svg" alt="" width="24" height="24"><span>+91 99671 23333</span></a><a class="footer-contact-link" href="mailto:info@alchemane.com"><img src="/icons/footer/mail.svg" alt="" width="24" height="24"><span>info@alchemane.com</span></a><a class="footer-contact-link footer-community-link" href="https://chat.whatsapp.com/DsyNmbYXLsG8Pg26z1QgxW" target="_blank" rel="noopener noreferrer"><img src="/icons/footer/whatsapp.svg" alt="" width="24" height="24"><span>Join our WhatsApp community</span></a></div></div><div class="footer-bottom"><span class="footer-copyright">© <span data-year></span> Alchemane Hair Extensions</span><a class="footer-back-to-top" href="#top">Back to top <span aria-hidden="true">↑</span></a></div></footer>`;
}

export function initBlogShell() {
  initShopNavigation();
  const header = document.querySelector('.blog-header');
  const menu = document.querySelector('.blog-menu');
  const nav = document.querySelector('.blog-nav');
  const closeMenu = () => {
    header.classList.remove('is-open');
    menu.setAttribute('aria-expanded', 'false');
    menu.setAttribute('aria-label', 'Open navigation menu');
  };
  menu.addEventListener('click', () => {
    const open = header.classList.toggle('is-open');
    menu.setAttribute('aria-expanded', String(open));
    menu.setAttribute('aria-label', open ? 'Close navigation menu' : 'Open navigation menu');
  });
  nav.addEventListener('click', event => { if (event.target.closest('a')) closeMenu(); });
  document.addEventListener('keydown', event => { if (event.key === 'Escape') closeMenu(); });
  document.querySelectorAll('[data-year]').forEach(node => { node.textContent = String(new Date().getFullYear()); });
}
