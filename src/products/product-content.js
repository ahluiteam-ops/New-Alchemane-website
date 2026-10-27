// One content record per product; the page renderer and interactions are shared.
// Prices are INR. Variant IDs are local catalogue identifiers for the bag.
export const productPages = {
  'silk-hair-toppers': {
    handle: 'silk-hair-toppers',
    name: 'Silk Topper 5×3',
    category: 'Hair Toppers',
    categoryUrl: '/toppers.html#shop',
    eyebrow: 'Silk base · Clip-in coverage',
    description: 'Natural-looking coverage for a widening parting or thinning crown. Clips secure the topper to your own hair.',
    base: '5×3 inches',
    lengths: ['14 inches', '16 inches'],
    colours: [
      { name: 'Natural Black', swatch: 'natural-black' },
      { name: 'Dark Brown', swatch: 'dark-brown' },
      { name: 'Highlights', swatch: 'highlights' },
    ],
    textures: ['Natural Wave', 'Straight'],
    variants: [
      { id: '41758814142523', length: '14 inches', colour: 'Natural Black', price: 28000, available: true },
      { id: '41758814175291', length: '14 inches', colour: 'Dark Brown', price: 28000, available: true },
      { id: '41758814208059', length: '14 inches', colour: 'Highlights', price: 30000, available: true },
      { id: '41758814240827', length: '16 inches', colour: 'Natural Black', price: 30000, available: true },
      { id: '41758814273595', length: '16 inches', colour: 'Dark Brown', price: 30000, available: true },
      { id: '41758814306363', length: '16 inches', colour: 'Highlights', price: 32000, available: true },
    ],
    gallery: [
      { file: 1, display: '/assets/range/silk-hair-toppers-a.webp', alt: 'Silk Topper 5×3 held beside the model, showing the silk base and attachment clips', caption: 'The topper, its silk base and clip attachment' },
      { file: 2, alt: 'Silk Topper 5×3 underside and a close-up of the scalp-like silk parting', caption: 'The silk parting and underside' },
      { file: 3, alt: 'Silk Topper 5×3 hair and a close-up of the three attachment clips', caption: 'A closer look at the base and clips' },
      { file: 4, alt: 'Model showing the finished parting with the Silk Topper 5×3', caption: 'The finished parting' },
      { file: 5, alt: 'Model wearing the Silk Topper 5×3, viewed from the back', caption: 'How the hair blends from the back' },
    ],
    highlights: ['Scalp-like silk parting', 'Removable clip-in fit', 'Help with size & shade'],
    differences: [
      { image: '/assets/stories/topper-5.webp', alt: 'Before and after client transformation with an Alchemane hair topper' },
      { image: '/assets/stories/topper-maharukh.webp', alt: 'Before and after Maharukh with an Alchemane hair topper' },
      { image: '/assets/stories/topper-zenith-pintu.webp', alt: 'Before and after Zenith Pintu with an Alchemane hair topper' },
    ],
    reviews: {
      shopId: '58311802939',
      productId: '7289853280315',
    },
    details: [
      { title: 'Description', html: '<p>This lightweight silk topper adds coverage and volume to a widening parting or thinning crown while blending with your own hair.</p><p>A soft net and individually knotted lace sit beneath the silk top. The silk conceals the knots to create a scalp-like parting.</p><dl class="pd-specs"><div><dt>Base</dt><dd>Silk, 5×3 inches</dd></div><div><dt>Hair length</dt><dd>14 or 16 inches</dd></div><div><dt>Textures</dt><dd>Natural Wave or Straight</dd></div><div><dt>Colours</dt><dd>Natural Black, Dark Brown, Highlights</dd></div><div><dt>Attachment</dt><dd>Clips that secure to your existing hair</dd></div><div><dt>Coverage</dt><dd>Parting and crown; suitability depends on your area of thinning</dd></div></dl>' },
      { title: 'Need Customization?', html: '<p>Need help with a different finish, shade or fit? Our team can guide you through the options before you order.</p><a href="tel:+919967123333">Call +91 99671 23333</a> · <a href="https://wa.me/919967123333?text=Hello%20Alchemane%2C%20I%20would%20like%20help%20customising%20the%20Silk%20Topper%205x3." target="_blank" rel="noopener noreferrer">Ask on WhatsApp</a>' },
      { title: 'Shipping & Return', html: '<p>Shipping is free across India. Orders ship from Mumbai; processing and delivery time depend on the selected topper and any customisation. Our team can confirm the timing before you order.</p><p>Customised orders cannot be returned. Please review the full policies for other return conditions and international shipping charges.</p><a href="/pages/shipping-delivery/">Shipping policy</a> · <a href="/pages/returns-and-exchanges/">Returns & exchanges</a>' },
      { title: 'Is this topper right for me?', html: '<p>A topper covers part of the scalp and blends with the hair you already have. The clips need enough surrounding hair for a comfortable hold.</p><p>If your thinning extends beyond the base, or your roots feel fragile, ask our team to assess the fit before ordering.</p><a href="#consultation">Get personalised guidance</a>' },
      { title: 'Care & storage', html: '<p>Gently detangle before and after wear. Close the clips before storing your topper, and keep it dry in its storage pouch.</p><p>Ask our team for washing, heat-styling and colour advice for your chosen finish.</p>' },
    ],
    faqs: [
      { question: 'What makes a silk base look natural?', answer: 'The knotted hair sits beneath a silk layer. That top layer conceals the knots and creates a scalp-like appearance along the parting.' },
      { question: 'How do I choose the right base size?', answer: 'Measure the area you want to cover from front to back and side to side. The clips should sit on surrounding hair with enough strength to hold comfortably. If you are unsure, our team can help assess the fit from photographs or during a consultation.' },
      { question: 'Can you help me match my colour?', answer: 'Yes. Send our team clear photographs of your hair in natural daylight on WhatsApp. They can guide you between Natural Black, Dark Brown and Highlights, and discuss any customisation.' },
      { question: 'Can I wear it if my hair is very fine?', answer: 'Fit depends on the hair around the area of thinning. If your hair or roots are fragile, speak with our team before choosing a clip-in topper so they can assess comfort and attachment options.' },
      { question: 'Can I try a topper before buying?', answer: 'You can arrange an in-person consultation at our Khar West studio in Mumbai. Online consultations are also available if you would like help with size and shade from home.' },
      { question: 'Can I take the topper to my stylist to have it cut?', answer: 'Yes, you can, but we cannot take responsibility after that, as we have no way of knowing the techniques your stylist uses to cut a silk topper.' },
      { question: 'Can it be coloured?', answer: 'Yes, all of our silk-based toppers can be coloured just like your own hair.' },
      { question: 'Can I iron or curl the topper?', answer: 'Yes. You can straighten or curl the topper with a heat-styling tool. Use a low-to-medium temperature and a heat protectant, and keep heat away from the silk base and clips.' },
    ],
    related: [
      'silk-hair-toppers-5x6',
      'skin-topper',
      'skin-topper-5x6',
      'hairline-toppers',
      'rose-topper',
      'classic-clip-topper',
      'mesh-topper',
    ],
    recommendations: [
      { handle: 'halo-hair-extensions', label: 'For clip-free volume' },
      { handle: 'pony-tail-hair-extensions', label: 'For an instant ponytail' },
      { handle: 'fringe-with-sides', label: 'For a new fringe' },
      { handle: 'premium-wigs', label: 'For full-head coverage' },
    ],
  },
};

export const formatPrice = value => `₹${new Intl.NumberFormat('en-IN').format(value)}`;
