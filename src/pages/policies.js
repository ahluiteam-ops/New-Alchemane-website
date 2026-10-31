import '../design-tokens.css';
import '../sections/site-footer.css';
import './policies.css';

const links = [
  ['privacy-policy', 'Privacy Policy'],
  ['returns-and-exchanges', 'Returns and Exchanges'],
  ['shipping-delivery', 'Shipping and Delivery'],
  ['terms-of-service', 'Terms of Service'],
];

// Text follows the corresponding policy pages on alchemane.com, including their
// differing figures and timelines. Policy changes should be reviewed at source.
const policies = {
  'privacy-policy': {
    title: 'Privacy Policy',
    content: `
      <h2>Privacy Policy Overview</h2>
      <p>“This Privacy Policy details the methods by which alchemane.com handles your Personal Data upon your visit or during a transaction on our website.”</p>
      <h2>Contact Information</h2>
      <p>“For inquiries or concerns regarding our privacy practices, or to make a complaint, please reach us via google form at <a href="http://tinyurl.com/Customer-Support-alchemane">http://tinyurl.com/Customer-Support-alchemane</a> or through the provided mailing address: Alchemane Hair Extensions Private Limited – 4th floor Empressa Building, 2nd Rd, Khar, Ram Krishna Nagar, Khar West, Mumbai, Maharashtra 400052.”</p>
      <h2>Collecting Personal Information</h2>
      <p>“We collect details about your device and interaction with the Site, which includes necessary information for processing your purchases. If you contact us for support, we may gather additional data. All such information is treated as ‘Personal Information’ as detailed below.”</p>
      <h2>Device Information</h2>
      <p>– Purpose: To optimize Site functionality and perform analytics.<br>– Source: Automatically collected via cookies, log files, etc.<br>– Disclosure: Shared with processors like Shopify, Meta, &amp; Google.<br>– Collected Data: Browser version, IP address, cookie information, Site usage details.</p>
      <h2>Order Information</h2>
      <p>– Purpose: To process and fulfill your orders, communicate with you, screen for fraud, and provide relevant product or service information.<br>– Source: Directly collected from you.<br>– Disclosure: Shared with processors like Delivery Partners, and Payment Portals.<br>– Collected Data: Name, billing and shipping addresses, payment details, email, phone number.</p>
      <h2>Minors</h2>
      <p>“The Site is not for individuals under 18. We do not knowingly collect data from children. If you believe your child has provided us with Personal Information, please contact us to request its removal.”</p>
      <h2>Sharing Personal Information</h2>
      <p>“We share your information with service providers to help us offer our services. We also share information to comply with laws or protect our rights.”</p>
      <h2>Behavioral Advertising</h2>
      <p>“We use your Personal Information for targeted advertising. This includes using services like Google Analytics and sharing data with advertising partners. You can opt out of targeted advertising through specific platforms.”</p>
      <h2>Using Personal Information</h2>
      <p>“Your data helps us to provide our services, like completing your orders and letting you know about new products and deals.”</p>
      <h2>Lawful Bases for Processing (GDPR)</h2>
      <p>“For EEA residents, we process Personal Information based on consent, contractual necessity, legal obligations, vital interests, public interest, or legitimate interests.”</p>
      <h2>Retention</h2>
      <p>“Your Personal Information is retained until you request its deletion. EEA residents have additional rights detailed in the ‘Your rights’ section.”</p>
      <h2>Automatic Decision-Making</h2>
      <p>“We don’t use customer data for major automatic decision-making. WordPress uses limited automation for fraud prevention.”</p>
      <h2>Your Rights (GDPR)</h2>
      <p>“EEA residents have rights to access, transfer, correct, erase, or object to the processing of their Personal Information. Contact us for these requests. Data transfers comply with GDPR standards.”</p>
      <h2>Cookies</h2>
      <p>“We use different cookies to make our site work better and improve it. Cookie management is possible through browser settings, and opting out of certain uses of your information is detailed under ‘Behavioural Advertising’.”</p>
      <h2>Do Not Track</h2>
      <p>“Our methods remain unchanged when we receive ‘Do Not Track’ signals from web browsers.”</p>
      <h2>Policy Changes</h2>
      <p>“We may update this policy to reflect changes in practices or legal requirements.”</p>
      <h2>Complaints</h2>
      <p>“For complaints, contact us via the provided details. If unsatisfied, you have the right to approach the relevant data protection authority. Legal complaints and appeals are under the jurisdiction of the Bombay High Court and Mumbai District authorities.”</p>
      <p>This revision aims to make the policy more succinct and user-friendly. If you have any specific requirements or need further adjustments, please let me know!</p>`,
  },
  'returns-and-exchanges': {
    title: 'Returns and Exchanges',
    content: `
      <p>Please read our Return &amp; Exchange Policy carefully if you wish to return a product. If your request falls within our policy, we will be happy to assist you.</p>
      <h2>General Conditions</h2>
      <ul><li>Returns or exchanges are only accepted within 7 days of receiving the product.</li><li>Sale or discounted orders are not eligible for return or exchange.</li><li>To cancel your order, please email us at <a href="mailto:Info@alchemane.com">Info@alchemane.com</a> within 24hrs of placing the order.</li><li>A valid reason must be provided for the return or exchange.</li><li>After 7 days of delivery, no returns or exchanges will be processed.</li></ul>
      <h2>Products Not Eligible for Return or Exchange</h2>
      <ul><li>Sale Orders / Discounted Products</li><li>Products that have been coloured, chemically treated, or damaged due to styling post-purchase</li></ul>
      <h2>Return Process</h2>
      <ol><li>The product you want to return. Provide your reason and attach a picture.</li><li>Approval: Our team will review your request. If eligible, we will approve the Return or Exchange.</li><li>Quality Check (QC): Once the product reaches us, it will undergo a QC process. If it passes, a store credit will be issued.</li></ol>
      <p>Please note: store credit will be given after a deduction of INR 200/-</p>
      <h2>Important Instructions</h2>
      <ul><li>Ensure the product is in the same condition as when received. Used or altered products (washed, cut, colored, chemically treated, or brushed for curly or wavy hair) will not be accepted.</li><li>Record an unboxing video of the package before opening the courier seal to claim any physical damage or missing products. Returns/exchanges for damaged or defective products require valid video proof.</li><li>Clearly mention your order number and contact number on the package when returning it.</li><li>INR 200 will be deducted for all returns/exchanges for logistics, prepping and packaging purposes.</li></ul>
      <h2>Refund and Store Credit</h2>
      <ul><li>WE DO NOT OFFER BANK REFUNDS. All refunds are provided as store credit.</li><li>Store credit will be issued after deducting Rs500 and can be used for future purchases or gifting.</li><li>Store credit will be sent directly to you via email or whatsapp.</li></ul>
      <p>Please Note: During festivals, Sale, adverse weather conditions like rains, natural calamities or political crises and curfews, your shipment may take upto 20 days to deliver. We assure you that we will try our best to deliver your product. However this not be considered as a valid reason for cancellation or refund.</p>
      <h2>Contact Us</h2><p>For any issues or assistance, please call us at <a href="tel:+919967123333">+91 9967123333</a></p>`,
  },
  'shipping-delivery': {
    title: 'Shipping and Delivery',
    content: `
      <p>Alchemane provides free shipping across India for all the hair pieces. Our manufacturing unit is in Chennai, India. However, all our packages are shipped from our main office in Mumbai, India. Prior to packaging and shipping, all the hair pieces are checked thoroughly to ensure there won’t be any returns. (Note: No returns are accepted on customized orders).</p>
      <p>It takes approximately 1 to 5 working days to process each order. In case of clip- in extensions/ volumizers it takes 3 to 4 weeks (except customized hair pieces which take longer).</p>
      <p>All orders are shipped between Monday to Saturday, with the exception of Sundays and public holidays. Kindly note, there can be a further delay of 1 to 2 working days in processing orders in case there’s any unverified information with your order, or if inaccurate addresses are provided. We request you to check all shipping and billing information before placing your order, to avoid any delays in processing.</p>
      <h2>Shipping policy</h2>
      <p>We use express shipping to ship all our orders. Your order may take up to 3 to 5 working days to be delivered to you (African countries take 7 to 15 working days). As soon as the order is shipped, shipping confirmation and tracking details will be provided to you via whatsApp/ email. If any shipments do return to us for reasons such as wrong address, customer unavailable or customer rejected the parcel, you will be charged a penalty of 200 INR.</p>
      <h2>International orders</h2>
      <p>We are not responsible for any customs duties or taxes on your order upon delivery. We are not liable for any shipments rejected by the customer and don’t accept any returns on them.</p>
      <h2>Wrong address disclaimer</h2>
      <p>Make sure the address you entered is accurate and provide all the information required for it to be delivered to the correct address. We begin processing the order as soon as it’s placed so it becomes difficult for us to make any changes or cancel orders, especially customized hair pieces. We do not accept cancellations on customized hair pieces.</p>
      <p>In case the address you provided was incorrect, you could get in touch with us at <a href="mailto:info@alchemane.com">info@alchemane.com</a> or call/ whatsApp on <a href="tel:+919967123333">+91 9967123333</a>, and we will do our best to make the changes.</p>
      <h2>Delivered but not delivered</h2>
      <p>We provide a tracking number for all the shipments. If the order shows delivered but is not delivered, we suggest you contact your local courier service to investigate the issue. We are not responsible for such issues.</p>
      <h2>When will you receive the order?</h2>
      <h3>For Domestic Orders (within India):</h3>
      <p>We take 1 business day to process and dispatch your order. And it takes 5-7 business days for the order to be delivered across India.</p>
      <p>However, if the address/pin code/phone no. is incorrect, the pin code is unserviceable, or if the color match is taking time, then it could take some extra days to dispatch your order based on the time taken to communicate and match the product to your hair.</p>
      <p>Please note: During festivals, adverse weather conditions, natural calamities or political crises and curfews, your shipment may get further delayed. We assure you that we will try our best to deliver your product as quickly as possible and truly appreciate your patience during these times.</p>
      <h3>For International Orders (outside India):</h3>
      <p>Please note that the total amount charged does not include international shipping fees. After we receive your order, one of our representatives will reach out to you with the exact shipping costs. Once you've confirmed and paid these additional charges, we'll proceed with dispatching your order.</p>
      <p>Hope this helps you! If you have any questions please reach out to us on <a href="mailto:info@alchemane.com">info@alchemane.com</a></p>`,
  },
  'terms-of-service': {
    title: 'Terms of Service',
    content: `
      <p>“Before utilizing the services of (https://alchemane.com/) users are required to accept the terms and conditions stated herein. By accessing the website through any device, such as mobile phones or computer systems, users acknowledge and consent to these terms. They also agree that Alchemane Hair Extensions Private Limited reserves the right to alter these terms at any given time without prior notification.</p>
      <p>It is the responsibility of the users to periodically review this page for any updates and comply with any changes to the terms.”</p>
      <h2>DESCRIPTION OF SERVICE</h2>
      <p>“Alchemane Hair Extensions Private Limited specializes in a range of hair extensions and hair care products. With a focus on originality, all our products are uniquely designed in-house. We offer these exclusive hair solutions primarily through our online platform, ensuring a specialized and accessible shopping experience for our customers.”</p>
      <h2>Usage Restrictions</h2>
      <p>“The content on the Alchemane Hair Extensions website, including images, text, audio, and video material, is protected under copyright and intellectual property laws. This content is intended solely for personal, non-commercial use.”</p>
      <h2>Notice</h2>
      <p>“Alchemane Hair Extensions Private Limited may communicate with customers regarding service-related and promotional information. These communications can be made through various channels such as postal mail, email, and general site notifications, based on the contact details provided by the user.”</p>
      <h2>Pricing Policy</h2>
      <p>“Alchemane Hair Extensions Private Limited offers its products exclusively online, focusing on providing high-quality items at competitive prices. Although we strive for accuracy in product representation, variations in patterns and colors are possible.”</p>
      <h2>Site Use</h2>
      <p>“The Alchemane Hair Extensions website is not to be used for any illegal or unauthorized purposes. Users must ensure that their comments and submissions do not infringe on any third party’s rights, including copyright and privacy. Users are solely responsible for their comments on the site.”</p>
      <h2>Indemnity</h2>
      <p>“Customers agree to indemnify Alchemane Hair Extensions Private Limited against any claims, losses, damages, and costs arising from any violation of these terms or any activities related to their account.”</p>
      <h2>Third Party Links</h2>
      <p>“The website may include third-party links to enhance user experience. While we may promote third-party services, we do not control them and are not responsible for their content or services.”</p>
      <h2>Privacy and Personal Information</h2>
      <p>“We prioritize the protection of your personal information. Your personal data is not shared or sold to third parties, and we do not store credit card information on our servers. All transactions are conducted through a secure payment gateway.”</p>
      <h2>Information Collection and Use:</h2>
      <p>Email Address: “Your email is used for order processing and communication. We respect your privacy and do not sell your email to third parties. Newsletter subscriptions are voluntary and can be opted out of at any time.”</p>
      <p>Personal Information: “We collect personal information for order processing and customer support. Rest assured; your credit card details are never stored on our servers. We do not share your personal information with third parties.”</p>
      <p>Cookies: “Cookies are used for a personalized shopping experience and do not store personal information. They are essential for maintaining items in your cart and may assist in analytics.”</p>
      <p>Security: “We adhere to high security standards, including 128-bit SSL technology, to protect your information during transactions.”</p>
      <p>Payment: “Credit card information is encrypted and processed according to PCI-DSS standards. Your transaction information is used only for the purchase and is not stored post-transaction.”</p>
      <p>Disclosure: “Your personal information may be disclosed if required by law or in the event of a breach of our Terms of Service.”</p>
      <h2>Changes to Privacy Policy</h2>
      <p>“Alchemane Hair Extensions Private Limited reserves the right to modify this privacy policy. We recommend reviewing it regularly for updates. Significant changes will be communicated on this platform.”</p>`,
  },
};

const slug = location.pathname.split('/').filter(Boolean).at(-1);
const policy = policies[slug];
if (!policy) throw new Error('Unknown policy page');
const policyLinks = links.map(([key, label]) => `<a href="/pages/${key}/"${key === slug ? ' aria-current="page"' : ''}>${label}</a>`).join('');
document.querySelector('#app').innerHTML = `
  <a class="policy-skip" href="#policy-content">Skip to policy</a>
  <header class="policy-header" id="top"><div class="policy-header__inner">
    <a class="policy-brand" href="/" aria-label="Alchemane home"><img src="/icons/new%20logo.svg" alt="" width="160" height="40"></a>
    <nav class="policy-header__nav" id="policy-navigation" aria-label="Main navigation"><a href="/">Home</a><a href="/permanent-extensions.html">Permanent Extensions</a><a href="/toppers.html">Hair Toppers</a><a href="/wigs.html">Wigs</a><a href="/consultation.html">Book A Consultation</a></nav>
    <button class="policy-header__menu" type="button" aria-label="Open navigation menu" aria-controls="policy-navigation" aria-expanded="false"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 7h16M4 12h16M4 17h16"/></svg></button>
  </div></header>
  <main id="policy-content" class="policy-main"><div class="policy-wrap">
    <nav class="policy-breadcrumb" aria-label="Breadcrumb"><a href="/">Home</a><span aria-hidden="true">/</span><span aria-current="page">${policy.title}</span></nav>
    <div class="policy-layout"><div class="policy-intro"><h1>${policy.title}</h1></div>
    <div class="policy-body">${policy.content}</div></div>
  </div></main>
  <footer class="site-footer" aria-label="Footer"><div class="footer-main">
    <div class="footer-brand-column"><a class="footer-brand" href="/" aria-label="Alchemane home"><img class="footer-logo" src="/icons/new%20logo.svg" alt="" width="160" height="40"></a><address class="footer-address"><strong>Address</strong> – 4th floor Empressa Building, 2nd Rd, Khar, Ram Krishna Nagar, Khar West, Mumbai, Maharashtra 400052.</address></div>
    <nav class="footer-nav-column" aria-label="Solutions"><p class="footer-title">Solutions</p><a href="/permanent-extensions.html">Permanent Extensions</a><a href="/wigs.html">Hair Wigs</a><a href="/toppers.html">Hair Toppers</a></nav>
    <nav class="footer-nav-column" aria-label="Information"><p class="footer-title">Information</p><a href="/blogs.html">Blogs</a>${policyLinks}</nav>
    <div class="footer-contact-column"><p class="footer-title">Contact Us</p><a class="footer-contact-link" href="tel:+919967123333"><img src="/icons/footer/call.svg" alt="" width="24" height="24"><span>+91 9967123333</span></a><a class="footer-contact-link" href="mailto:info@alchemane.com"><img src="/icons/footer/mail.svg" alt="" width="24" height="24"><span>info@alchemane.com</span></a><a class="footer-contact-link footer-community-link" href="https://chat.whatsapp.com/DsyNmbYXLsG8Pg26z1QgxW" target="_blank" rel="noopener noreferrer"><img src="/icons/footer/whatsapp.svg" alt="" width="24" height="24"><span>Join our WhatsApp community</span></a></div>
  </div><div class="footer-bottom"><span class="footer-copyright">© ${new Date().getFullYear()} - Alchemane Hair Extensions</span><a class="footer-back-to-top" href="#top">Back to top <span aria-hidden="true">↑</span></a></div></footer>`;

const header = document.querySelector('.policy-header');
const menu = document.querySelector('.policy-header__menu');
const closeMenu = () => {
  header.classList.remove('is-open');
  menu.setAttribute('aria-expanded', 'false');
  menu.setAttribute('aria-label', 'Open navigation menu');
};
menu.addEventListener('click', () => {
  const isOpen = header.classList.toggle('is-open');
  menu.setAttribute('aria-expanded', String(isOpen));
  menu.setAttribute('aria-label', isOpen ? 'Close navigation menu' : 'Open navigation menu');
});
header.querySelector('nav').addEventListener('click', event => { if (event.target.closest('a')) closeMenu(); });
document.addEventListener('keydown', event => { if (event.key === 'Escape') closeMenu(); });
