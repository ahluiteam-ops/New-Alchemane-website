# Alchemane creative direction — research edition 02

Researched 18 September 2026. Deliverable: `public/references/index.html`. This updates the reference board and adds original composition studies; it does not redesign the live homepage. The earlier board is retained at `public/references/first-study.html`.

## Recommendation

**The white atelier:** keep the approved photographic hero and extend its airy white canvas, fine serif typography and human warmth through the lower page. The clearest visual benchmark is Rino & Pelle’s historical design; combine that editorial confidence with MERIT’s portrait-to-product relationship and AKRIS’s catalogue discipline.

The user’s $50,000 comparison is a quality ambition. The references’ actual production costs were not established. What we can assess is visible art direction, useful interaction patterns, photographic consistency and the quality of the interface.

## Method and evidence

Three parallel research streams examined luxury commerce, Pinterest concepts, and motion/editorial work. The final ten selections were visually inspected. Primary agency case studies are preferred for claims about commissioned work. Historical screenshots and concept designs are labeled as such; a Pinterest concept is not represented as the current brand website. MERIT is a live-site screenshot captured during research. Motion descriptions come from creator accounts and award documentation, not a live performance audit.

The local browser connection was unavailable, so standalone Playwright was used for the local board’s visual and interaction checks. The local UI/UX search utility could not run because no Python executable was available; its general design guidance informed the review instead of fabricated database results.

## Curated library

| Reference | Evidence | Alchemane application |
| --- | --- | --- |
| [Rino & Pelle](https://www.awwwards.com/sites/rino-pelle) | Historical award archive and two inspected screenshots; SOTD 13 April 2020 | Fine serif statements, staggered portraits, portrait-and-detail craft layout |
| [MERIT](https://www.meritbeauty.com/) | Live page capture, cropped to its editorial/product section | A large result portrait with the relevant product choices nearby |
| [AKRIS / Build in Amsterdam](https://www.buildinamsterdam.com/case/akris) | Published agency imagery | Borderless product display, consistent crop and quiet metadata |
| [Typology / Numbered](https://numbered.com/project/typology) | Published agency imagery | A featured product story alongside smaller supporting choices |
| [VERSA Pinterest concept](https://in.pinterest.com/pin/versa-jewelry-website-behance--925630529664915156/) | Pin and image inspected; linked Behance unavailable | Founder statement, portrait, craft film and wordmark footer |
| [Emilia Wickstead / BAO](https://www.byassociationonly.com/case-studies/emilia-wickstead) | Agency case study and journal screenshot | One lead film plus two smaller chapters |
| [Paola Vilas redesign](https://www.behance.net/gallery/135937061/Paola-Vilas-Jewelry-Redesign) | Pinterest image and original Behance concept, January 2022 | Larger campaign portraits inserted into a disciplined product grid |
| [J.Hannah / Natasha Mead](https://www.behance.net/gallery/74183375/JHannah-Jewelry-Nailpolish) | Pinterest image and original historical project, December 2018 | Material close-up paired with a smaller worn portrait |
| [Exo Ape](https://www.awwwards.com/exo-ape-wins-site-of-the-month-may-2022.html) | Creator-written project article and gallery still | Changes in image scale and deliberately composed empty space |
| [Ottografie / Exo Ape](https://www.exoape.com/work/ottografie) | Agency case study and beauty-portrait interface still | Immersive client stories, user-controlled gallery and image detail inspection |

Source paths, observations, proposed interactions and image credits are stored together in `public/references/board-data.js`. The board links every reference back to its source and clearly separates evidence from proposals. Reference artwork is included for this local review, not proposed for reuse as Alchemane imagery.

## Why the first board was insufficient

The earlier skincare templates were useful for generic white-space and grid ideas, but did not establish a distinctive enough standard for Alchemane. Some mixed beige, green, script lettering and stock template patterns. The new selection is more precise: three luxury shopping references, three new Pinterest projects, one editorial film reference and three closely related motion/editorial benchmarks.

The selected references also have elements we should not adopt wholesale: unusual portfolio navigation, tiny editorial captions, heavy beige casts and dense catalogue sidebars. Adapt the composition and hierarchy to Alchemane’s customers and approved hero.

## Proposed homepage rhythm

1. **Arrive:** approved hero, cloud whiteout, collection discovery.
2. **Find your match:** customer goal choices and a relevant large portrait.
3. **The edit:** a curated product story leading into the full range.
4. **See the change:** honest paired transformation imagery and a unified film library.
5. **Understand the craft:** portrait, material detail, movement, and founder perspective.
6. **Meet the women:** real customer portraits and verified quotations.
7. **Feel at home:** actual studio photography, a concise guide and useful FAQs.
8. **Begin a conversation:** a generous invitation, concise form and clear next step.

This is a content regrouping proposal, not an instruction to delete useful catalogue information. The existing functions can remain while their hierarchy and presentation improve.

## Original studies on the board

- Collection: a large serif introduction beside two generously scaled product portraits.
- Craft: a portrait and a smaller detail image at contrasting scales.
- Appointment: oversized editorial invitation, one primary action and understated practical details.
- Motion: an interactive timing sketch of the rising-cloud whiteout, with play/pause and a manual range control. Reduced motion uses a direct final-state action.

The composition studies are clearly labeled; navigation and booking labels within those mockups do not imply that a new commerce or booking flow has been implemented.

## Visual system and production priorities

- White canvas, near-black text and very light grey supporting surfaces. Colour comes primarily from photographs.
- Reuse the hero’s serif family with one quiet sans serif. Define consistent display, section, body and caption roles.
- Replace repeated numbered section labels, brown italics and heavy coloured panels with purposeful composition and spacing.
- Commission or select a coherent set of campaign portraits, product views, parting/base macro details, matched transformations, founder portraits and genuine studio images. The available photographs support exploration but do not yet form a consistent full campaign.
- Keep mobile crops deliberate; show controls on touch; preserve keyboard navigation and reduced-motion behavior.
- Retain the cloud wipe as the signature moment. Use smaller, quieter transitions below. A 3D scene only earns its place if it helps inspect the actual hair product.

## Implementation boundary

Files for the research board live under `public/references/`. No homepage sections or hero animation were changed for this research task. Public reference files are copied by Vite into a production build, so an eventual public deployment should explicitly decide whether this review-only board belongs in that deployment.

## Validation

Local HTTP returned 200. All ten reference cards rendered; Pinterest and motion filters each returned three matching references. Enlarged-image modal opening, Escape dismissal and focus restoration passed. Keyboard tab navigation, all three studies, cloud whiteout and final reveal, and reduced-motion final-state behavior passed. No horizontal overflow at 320, 390, 768 or 1440 pixels. All inspected image requests returned 200 and no page runtime errors were observed. Desktop and mobile screenshots were visually reviewed and saved under `preview/reference-board-v2/`.
