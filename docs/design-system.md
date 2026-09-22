# Alchemane design system

The homepage helps someone compare hair pieces and speak to the team. Photography and useful product information lead; copy is direct, warm and brief.

## Foundations

`src/design-tokens.css` is the source of truth. Use semantic tokens in components, rather than adding new colour or font values.

| Role | Value | Use |
| --- | --- | --- |
| Surface | White `#ffffff` | Main page and product backgrounds |
| Soft surface | Fog `#f3f5f1` | Product range, reels and consultation |
| Text | Ink `#242923` | Headings and body |
| Secondary text | `#60655f` | Supporting copy and captions |
| Action | Forest `#304638` | Buttons, focus and selected controls |
| Border | `#d8ded6` | Quiet structural dividers |

Source Serif 4 regular gives headings a grounded editorial voice. Source Sans 3 regular and semibold handle body, products, navigation and controls. Both are locally hosted, open-source Adobe families. The opening collection lockup is the one approved exception: its second line uses the system Georgia italic to match the supplied direction. Brand wordmarks remain separate from body typography.

Headings: fluid 36–60px; campaign display: 56–108px; body: 17px; utilities: 14px; smallest supporting captions: 12px. Heading line height 1.1; body 1.6. Use normal sentence case. Prefer one descriptive heading over a slogan plus repeated explanatory subheading.

Spacing uses 8, 16, 24, 32, 48 and 64px steps. Section space scales from 64 to 112px. Maximum content width is 1320px. Mobile gutters never shrink below 20px. Keep related labels closer to their content than to the next component.

## Components

- Text links: 44px minimum target, underline, a single directional arrow. No widening gap on hover.
- Primary buttons: forest fill, white text, 48px minimum height, 2px corners. One primary action per local task.
- Product cards: aligned 3:4 images, same baseline, real product name, readable details. Product photos are not replaced with generated imagery.
- Reels: uncropped 9:16 frame, one heading, one short sentence and one category link. No phone shell, chapter lists or repeated summary. An unavailable film is a still photograph labelled “Film coming soon”, with no fake play button.
- Forms: persistent labels, 16px inputs, visible focus, plain next-step language. The consultation prepares a message; the visitor chooses whether to send it on WhatsApp.
- Accordions: native details/summary, one topic per row, visible keyboard focus.

## Motion and responsive behaviour

The opening uses the original cloud transition: the full-height hero recedes as layered clouds rise, a white interval hides the scene change, and one collection scene appears with the centered “Beautiful hair. New possibilities.” lockup above the four product categories. It omits a second category heading and introductory helper row so the path stays direct. Short viewports and reduced-motion preferences use normal document flow. The later “Beautiful hair. Entirely you.” campaign holds for one viewport-led scroll interval: its copy clears the frame while the clipped portrait drifts and gently scales, then the pin releases before the film section begins. Pin spacing prevents the campaign from appearing behind later sections. Reduced-motion preferences receive a static composition. Content entrances use short transform-and-opacity transitions; hover feedback uses 180–300ms. Avoid adding continuous movement or cursor effects.

Product discovery uses `src/sections/discovery.css`. Categories are Hair toppers, Hair extensions, Fringes & bangs, and Wigs. Explain each with a short everyday benefit. Keep search visibly labelled, show result counts, retain filters in the URL, and provide a recovery action for empty results. New product image areas use neutral grey `#e5e5e5`, without substitute photography. Price and fitting details remain unconfirmed until supplied.

At 1000px the reel pair stacks; each reel remains beside its short text. At 700px a reel's text sits above a portrait frame capped at 300px. Product grids use two columns on small screens. Verify 320, 390, 768 and 1440px widths, keyboard use and reduced motion.

## Adding the finished films

Edit `src/sections/reel-data.js`. Set each `src` to the approved portrait MP4 URL (for example `/assets/films/toppers-reel.mp4`) and `captions` to its English WebVTT file. Keep the corresponding poster. Restart Vite after configuration changes. The coming-soon label is automatically replaced by a native video player. No autoplay; only one film plays at a time; playback pauses offscreen or when the browser tab is hidden. Captions must match the approved film before launch.

The campaign portrait remains an existing design placeholder. The studio consultation photograph was restored at the user's request, retaining its “Concept imagery for design preview” label and the current layout and typography.

Client stories use the five supplied files from `Images/beforerafter`, optimized without cropping by `scripts/prepare-story-assets.mjs`. Previous/next controls update the name, photograph, quote and count together. Preserve the full before/after pairs. Meera and Ritika have single portraits, not comparison images. Meera has no supplied quote or product association; her fifth slide is a photograph feature without a testimonial. Do not auto-advance the carousel.

## Archived sections

See `archive/homepage-2026-09-19/README.md` for original section fragments, complete source snapshots, and restoration instructions.
