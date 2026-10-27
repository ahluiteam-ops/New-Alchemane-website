# Local checkout implementation

The checkout uses the existing Alchemane two-column visual style. The order summary is collapsed on mobile and visible on desktop. It reads the product and selected options from the local bag (`alchemane-product-bag-v2`). `/checkout.html?preview=1` displays a sample order for layout review.

## Shopper flow

- Contact: email plus a mobile number with an independent country calling code.
- Delivery: selectable country, name, street, apartment, city, region, and postal code. Region and postal requirements change by country. A different billing address is optional.
- Review: validates the form and displays the entered details in a dialog. Personal details remain in the browser tab; they are not saved to local storage or transmitted.
- India: the local item prices already include 18% GST, and shipping is shown as free. International: item subtotal remains INR and shipping requires a quote before a final payable amount can be shown.
- Product page Buy now and the bag's Continue to checkout both open the local checkout. They do not call or redirect to the old Alchemane store. Products without a local detail page use a product-specific WhatsApp enquiry instead of an old-store purchase link.
- Policy links open local policy pages.

## Razorpay integration boundary

Payment is not enabled. The checkout does not collect card details, create an order, or charge a customer. “Pay now” is a preview CTA: it validates the form and shows a local review dialog, with an explicit notice that no order or charge is placed. Before enabling a real payment, provide merchant configuration plus a server that calculates authoritative product/shipping/tax totals, creates a Razorpay order, verifies the payment signature, records the order, and confirms the result. International shipping and import charges need a defined quote policy before charging.

## Verification

Run `node scripts/check-checkout.mjs` while the Vite server runs on port 5173. It covers five viewport sizes, India and international selections, validation, billing, review, no old-store checkout requests, and no local storage of contact or address details.
