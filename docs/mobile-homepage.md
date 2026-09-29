# Mobile homepage - September 26, 2026

## Accepted decisions

- Need Help, Need Guidance and Need Consultation lead to the consultation form.
- Full topper and extension explainers belong on their detail pages.
- Mobile is the priority; use plain English, short headings and visible actions.

## Page flow

Hero -> category tabs and matching products -> client videos -> before/after stories -> quality -> founder -> Featured In -> Celebrity Choice -> studio -> hair-transformation preview -> questions -> consultation.

The six category tabs and catalogue are one product section, with no explainer card or large gap between them. The tab order is Hairline Series, Hair Toppers, Permanent Extensions, Clip Extensions, Wigs and Fringes. Hairline Series is selected by default. On phones, the tabs scroll sideways within one row; the page itself does not overflow. Selecting a tab updates the matching products immediately without changing their existing order or forcing a page scroll. Up to four products appear initially; Show more reveals four at a time. All 44 products remain available through the existing footer link. The section has no Show all products or Sort and filter controls.

The original full-screen hero and three cloud layers are retained. On phones and tablets, the hero holds in place (CSS sticky, no GSAP pin) while the clouds rise, the screen turns fully white for a moment, and the hero fades to reveal the real category section already sitting at the top. A short finger swipe finishes the reveal on its own, in the direction of the swipe, so the hero is never left half-clouded; swiping up from the section returns to the hero the same way. The hero button runs the same reveal in about 0.65 seconds. Larger desktop screens retain the pinned scene swap. A category-tab selection clears any old `#collection` URL fragment; a page opened or refreshed without an intentional section link starts at the hero. Reduced-motion users get static normal flow. The homepage has no later parallax campaign or numbered arc. The campaign and old source are preserved in `archive/mobile-homepage-2026-09-26`.

The client-film heading is "Watch our clients’ stories" (plural possessive), with swipeable cards and no arrow controls on phones. In "See the difference," the two arrows sit at the right below the image on mobile and desktop. The mobile heading stays on one line; the caption and quote stay hidden on phones. Its Need Consultation button is inside the same section, followed by the original daylight quality photo and three claims. Later homepage sections use a more consistent vertical spacing rhythm.

Circular WhatsApp and call buttons replace the phone help bar. They appear after the product section and hide at the consultation form; both are labelled for assistive technology. The first-order offer popup is restored on both viewport sizes and appears after a delay, with a close button, Escape/backdrop dismissal and a `?offer=1` preview route. The form requires only name and phone; city is optional and "I'm not sure yet" is available. It prepares a WhatsApp request, then offers a button to review and send it. It does not claim that a booking has been submitted. Studio/online links select the right meeting type.

## Video placement

`/toppers.html` and `/extensions.html` contain the full explainer slots. `src/sections/reel-data.js` remains the single configuration for video and caption URLs. Both are currently empty; detail pages state "Full video coming soon" without fake playback controls. No placeholder explainer sections remain on the homepage.

The separate homepage hair-transformation section is a preview of the requested client collage film. It has a white background, the heading "See real hair transformations", and a generated colour group portrait inspired by the supplied composition reference. The thumbnail has no text and carries a centred decorative play icon. The matching film is not in the project yet, so the icon does not act as a control. Celebrity Choice similarly shows non-interactive coming-soon cards until approved celebrity footage is supplied.

When approved MP4s and matching captions are supplied, set `src` and `captions` for each reel. A future homepage preview should be a short, approved 15-30 second clip linking to the full guide. Do not crop or repurpose testimonial footage as an explainer.

## Verification

Run `npm run build`, `npm run check:homepage` and `npm run check:reels`.

The homepage suite checks 320, 390, 700, 768, 900 and 1440px widths plus 844x390 landscape. It covers responsive overflow, manual cloud movement and reduced-motion fallback, the hero-button landing, no mobile pin, refresh starting at the hero, story and film controls, quality imagery, floating contact links, popup dismissal, all six tabs and all 44 products, category synchronization, pagination, URL reload/back, touch and keyboard tabs, menu, consultation fields, studio/online selection, real local anchors, both detail destinations, request-only video playback and offscreen pause.

Screenshots and the report are in `preview/mobile-homepage-qa`. Tests prepare a sample request but never send it. Tests use local Chrome; they do not constitute testing on physical iOS or Android devices.

## Skill application

UI/UX Pro Max and Frontend Design guided the category hierarchy, one-row tabs, focus, touch targets and mobile spacing. Python was unavailable, so the skill's documented reference guidance was used instead of database search results. Caveman Compress needs a selected memory file; none was supplied, so no memory file was rewritten.
