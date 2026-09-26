# Alchemane design system

## Current homepage revision

The September 26 mobile-first homepage overrides the historical motion and discovery descriptions below. Its opening restores the full-screen pinned cloud reveal, while the later campaign parallax remains archived. Category discovery and the catalogue form one section: six horizontal category tabs directly above the products, with Hairline Series selected by default. Full explainer slots are on their detail pages; the homepage keeps playable client videos. Help CTAs lead to the consultation form. See `docs/mobile-homepage.md` for the current behavior and checks. Typography, palette, product provenance and other foundations below continue to apply.

The homepage helps someone compare hair pieces and speak to the team. Photography and useful product information lead; copy is direct, warm and brief.

## Foundations

`src/design-tokens.css` is the source of truth. Use semantic tokens in components, rather than adding new colour or font values.

| Role | Value | Use |
| --- | --- | --- |
| Surface | White `#ffffff` | Main page and product backgrounds |
| Primary / text | Ink `#232928` | Logo, headings, buttons, focus and selected controls |
| Accent | Teal `#59B1A5` | Small filled highlights, offer details and status badges |
| Accent mid | `#83C5BC` | Secondary detail on the ink background |
| Accent soft | `#ADD9D3` | Quiet emphasis and selected decorative details |
| Soft surface | Mist `#D7ECE9` | Tinted editorial and product surfaces |
| Base | White `#FFFFFF` | Main page and card surfaces |

Secondary text, dividers, shadows and overlays are transparent or mixed derivatives of `#232928`; they do not introduce additional hues. Teal is used sparingly. Small text and focus indicators use the dark primary or the derived `--color-accent-ink`, not `#59B1A5` on white.

Source Serif 4 regular gives headings a grounded editorial voice. Source Sans 3 regular and semibold handle body, products, navigation and controls. Both are locally hosted, open-source Adobe families. The opening collection lockup is the one approved exception: its second line uses the system Georgia italic to match the supplied direction. Brand wordmarks remain separate from body typography.

Headings: fluid 36–60px; campaign display: 56–108px; body: 17px; utilities: 14px; smallest supporting captions: 12px. Heading line height 1.1; body 1.6. Use normal sentence case. Prefer one descriptive heading over a slogan plus repeated explanatory subheading.

### Type scale

Every section heading is a plain `h2` inside `.home-rest` and takes its style from the single rule `.home-rest h2` in `premium.css` — never restyle an individual section's `h2` (that's what put "Media Coverage" in Source Sans 3 bold, out of step with every other heading, until it was corrected). Adding a section-specific override is a sign that a new named step belongs here instead.

| Step | Token(s) | Family | Weight | Size | Used for |
| --- | --- | --- | --- | --- | --- |
| Eyebrow | `--text-small`, `--font-body` | Source Sans 3 | 400 | 14px | The label above a heading ("A closer look", "Client stories") |
| Section heading | `--text-title`, `--font-display` | Source Serif 4 | 400 | fluid 36–60px | Every `.home-rest h2` — the one rule in `premium.css:8`, inherited by default |
| Campaign display | `--text-display`, `--font-display` | Source Serif 4 | 400 | fluid 56–108px | The one full-bleed campaign moment ("Beautiful hair. Entirely you.") |
| Page hero | — (Times New Roman, not tokenised) | Times New Roman | 400 | ~64–96px | The pinned hero title above each page's content (`.collection-lockup h2`, `.ext-hero h1`). A deliberate second, larger serif reserved for the one hero moment per page — not used for in-page section headings |
| Body | `--text-body`, `--font-body` | Source Sans 3 | 400 | 17px | Paragraph copy |
| Utility | `--text-small`, `--font-body` | Source Sans 3 | 400 | 14px | Nav, buttons, form labels, filters |
| Caption | `--font-body` | Source Sans 3 | 400 | 12px | Smallest supporting text (image credits, fine print) |

Before adding a new heading style, check this table first — the fix is almost always to remove the override and let `.home-rest h2` apply, not to add a new one.

Spacing uses 8, 16, 24, 32, 48 and 64px steps. Section space scales from 64 to 112px. Maximum content width is 1320px. Mobile gutters never shrink below 20px. Keep related labels closer to their content than to the next component.

## Components

- Text links: 44px minimum target, underline, a single directional arrow. No widening gap on hover.
- Primary buttons: ink fill, white text, 48px minimum height, 2px corners. One primary action per local task.
- Product cards: aligned 4:5 images, same baseline, real product name, readable details. Product photos are not replaced with generated imagery.
- Reels: uncropped 9:16 frame, one heading, one short sentence and one category link. No phone shell, chapter lists or repeated summary. An unavailable film is a still photograph labelled “Film coming soon”, with no fake play button.
- Forms: persistent labels, 16px inputs, visible focus, plain next-step language. The consultation prepares a message; the visitor chooses whether to send it on WhatsApp.
- Accordions: native details/summary, one topic per row, visible keyboard focus.

## Motion and responsive behaviour

The opening uses the original cloud transition on every motion-capable viewport: the full-height hero stays pinned as layered clouds rise, a white interval hides the scene change, and the collection fades in only after the clouds clear. Desktop reveals the real one-row collection inside the pinned stage. Mobile uses an inert viewport clone for the identical scene-swap choreography, then aligns it with the taller real collection as the pin releases so every category remains reachable in normal flow. Travel distances are recalculated on every ScrollTrigger refresh so mobile browser chrome and orientation changes cannot break the reveal. Reduced-motion preferences use static normal flow. The later “Beautiful hair. Entirely you.” campaign holds for one viewport-led scroll interval: its copy clears the frame while the clipped portrait drifts and gently scales, then the pin releases before the film section begins. Pin spacing prevents the campaign from appearing behind later sections. Content entrances use short transform-and-opacity transitions; hover feedback uses 180–300ms. Avoid adding continuous movement or cursor effects.

Product discovery uses `src/sections/discovery.css`. Categories are Hair Toppers, Permanent Extensions, Clip Extensions, Wigs, Fringes, and Hairline Series. Explain each with a short everyday benefit. Products may belong to more than one relevant category; Hairline Toppers appears in both Hair Toppers and Hairline Series. Show result counts, retain filters in the URL, and provide a recovery action for empty results. New product image areas use neutral grey `#e5e5e5`, without substitute photography. Price and fitting details remain unconfirmed until supplied.

At 1000px the reel pair stacks; each reel remains beside its short text. At 700px a reel's text sits above a portrait frame capped at 300px. Product grids use two columns on small screens. Verify 320, 390, 768 and 1440px widths, keyboard use and reduced motion.

## Adding the finished films

Edit `src/sections/reel-data.js`. Set each `src` to the approved portrait MP4 URL (for example `/assets/films/toppers-reel.mp4`) and `captions` to its English WebVTT file. Keep the corresponding poster. Restart Vite after configuration changes. The coming-soon label is automatically replaced by a native video player. No autoplay; only one film plays at a time; playback pauses offscreen or when the browser tab is hidden. Captions must match the approved film before launch.

The campaign portrait remains an existing design placeholder. The studio consultation photograph was restored at the user's request, retaining its “Concept imagery for design preview” label and the current layout and typography.

Client stories use the five supplied files from `Images/beforerafter`, optimized without cropping by `scripts/prepare-story-assets.mjs`. Previous/next controls update the name, photograph, quote and count together. Preserve the full before/after pairs. Meera and Ritika have single portraits, not comparison images. Meera has no supplied quote or product association; her fifth slide is a photograph feature without a testimonial. Do not auto-advance the carousel.

## Archived sections

See `archive/homepage-2026-09-19/README.md` for original section fragments, complete source snapshots, and restoration instructions.
