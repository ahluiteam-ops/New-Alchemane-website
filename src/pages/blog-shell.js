export function blogHeader(active = '') {
  return `<a class="blog-skip" href="#main">Skip to content</a>
    <header class="blog-header"><div class="blog-header__inner">
      <a class="blog-brand" href="/" aria-label="Alchemane home"><img src="/icons/new%20logo.svg" alt="" width="160" height="40"></a>
      <nav class="blog-nav" id="blog-nav" aria-label="Main navigation">
        <a href="/">Home</a><a href="/permanent-extensions.html">Permanent Extensions</a><a href="/toppers.html">Hair Toppers</a><a href="/wigs.html">Wigs</a><a href="/blogs.html"${active === 'blogs' ? ' aria-current="page"' : ''}>Blogs</a><a href="/consultation.html">Book A Consultation</a>
      </nav>
      <button class="blog-menu" type="button" aria-label="Open navigation menu" aria-controls="blog-nav" aria-expanded="false"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 7h16M4 12h16M4 17h16"/></svg></button>
    </div></header>`;
}

export function blogFooter() {
  return `<footer class="site-footer" aria-label="Footer"><div class="footer-main"><div class="footer-brand-column"><a class="footer-brand" href="/" aria-label="Alchemane home"><img class="footer-logo" src="/icons/new%20logo.svg" alt="" width="160" height="40"></a><address class="footer-address"><strong>Address</strong> – 4th floor Empressa Building, 2nd Rd, Khar, Ram Krishna Nagar, Khar West, Mumbai, Maharashtra 400052.</address></div><nav class="footer-nav-column" aria-label="Solutions"><p class="footer-title">Solutions</p><a href="/extensions.html">Hair Extensions</a><a href="/wigs.html">Hair Wigs</a><a href="/toppers.html">Hair Toppers</a></nav><nav class="footer-nav-column" aria-label="Shopping information"><p class="footer-title">Shopping information</p><a href="/blogs.html">Blogs</a><a href="/pages/privacy-policy/">Privacy Policy</a><a href="/pages/returns-and-exchanges/">Returns and Exchanges</a><a href="/pages/shipping-delivery/">Shipping and Delivery</a><a href="/pages/terms-of-service/">Terms of Service</a></nav><div class="footer-contact-column"><p class="footer-title">Contact Us</p><a class="footer-contact-link" href="tel:+919967123333">+91 99671 23333</a><a class="footer-contact-link" href="mailto:info@alchemane.com">info@alchemane.com</a></div></div><div class="footer-bottom"><span class="footer-copyright">© <span data-year></span> Alchemane Hair Extensions</span><a class="footer-back-to-top" href="#top">Back to top <span aria-hidden="true">↑</span></a></div></footer>`;
}

export function initBlogShell() {
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
