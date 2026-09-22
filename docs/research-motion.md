# Alchemane — motion and editorial reference research

Researched 18 September 2026. Scope: reference board, not a homepage implementation. Reference images were visually inspected. Interaction descriptions below are sourced from creators or award archives; no live-motion performance audit was completed.

## 1. Rino & Pelle, 2020 — closest visual relative

- [Award archive](https://www.awwwards.com/sites/rino-pelle) — Awwwards Site of the Day, 13 April 2020; the archive identifies GSAP, parallax, photography and gallery treatments.
- [Archived creator-hosted website](https://rino-pelle.exoape.com/) — the historical site linked by the award entry, not necessarily the current brand shop.
- [Opening composition](https://assets.awwwards.com/awards/sites_of_the_day/2020/04/rino-pelle-1.jpg)
- [Editorial section](https://assets.awwwards.com/awards/sites_of_the_day/2020/04/rino-pelle-2.jpg)
- Downloaded inspection images: `preview/motion-research/rino-pelle.jpg` and `rino-pelle-details.jpg`.

Observed: a pale canvas, very large high-contrast serif statement, varied portrait heights and generous unoccupied space. The second image pairs one tall portrait with a smaller, overlapping detail crop. Its typography and image hierarchy are a particularly close fit to Alchemane's existing hero. The brown button and warm cast are not essential to the composition.

Application: make the first new chapter a staggered, borderless gallery of real hair results. Use the portrait/detail pairing once for craftsmanship, showing a finished result beside an actual lace-base or handwork close-up. Keep Alchemane's white, black and existing serif; photographs supply color. Proposed motion: gently reveal the two photographs on separate beats, with very slight opposing vertical movement. Do not label this as observed animation.

## 2. Exo Ape, 2022 — editorial rhythm and disciplined motion process

- [Creator-written case study on Awwwards](https://www.awwwards.com/exo-ape-wins-site-of-the-month-may-2022.html) — Site of the Month, May 2022.
- [Award entry](https://www.awwwards.com/sites/exo-ape) — Site of the Day, 23 May 2022.
- [White gallery layout](https://assets.awwwards.com/awards/sites_of_the_day/2022/06/exo-ape-SODT2.png)
- [Photographic opening](https://assets.awwwards.com/awards/sites_of_the_day/2022/06/Exo-ape-SODT1.png)
- Downloaded inspection images: `preview/motion-research/exo-ape-details.jpg` and `exo-ape.jpg`.

Observed still: large black type above an asymmetric photo arrangement on white, with a short paragraph occupying an intentionally empty part of the grid. Creator evidence: motion was explored early through low-fidelity concepts and storyboards; subtle transitions orient visitors; CSS and GSAP are combined; richer story sequences use video and Canvas. The creator also provides a second overview browsing mode.

Application: vary the homepage's scale and density rather than repeating ten split layouts. Use one very large client portrait, a quieter detail and a short statement for transformations and testimonials. Preserve normal section links and clear product access. Proposed motion: a still image expands into a film or details view with matching crop and reversible close behavior; animate opacity and image framing together, then stop. The existing cloud wipe remains the memorable signature transition.

## 3. Ottografie, 2025 — photography as the experience

- [Exo Ape's primary case study](https://www.exoape.com/work/ottografie) — creator reports Awwwards Site of the Day and Developer Award, alongside other recognitions.
- [Live portfolio](https://ottografie.nl/)
- [Beauty portrait interface](https://a.storyblok.com/f/133769/2000x1125/34200292de/ottografie-2025-split-02.jpg)
- [Biography composition](https://a.storyblok.com/f/133769/2500x3119/f13079420a/ottografie-2025-about-02.jpg)
- Downloaded inspection image: `preview/motion-research/ottografie.jpg`.

Observed still: a full-bleed beauty portrait carries the composition; a fine serif label and compact contextual control keep the interface subordinate. Creator evidence: transitions connect photographic states; the gallery supports zoom and background contrast; mobile navigation uses familiar tap-for-next behavior.

Application: a transformation film and a small selection of genuine client stories deserve this level of image space. Let users enlarge a hairline or parting to inspect results. Proposed motion: user-initiated next/previous crossfade, consistent portrait framing and explicit buttons. Keep Alchemane's shop navigation visible; the portfolio's unusually minimal navigation need not be copied.

## Proposed Alchemane motion direction

These are design proposals, not descriptions of the references' current behavior.

| Moment | Desktop proposal | Mobile and reduced-motion treatment |
| --- | --- | --- |
| Hero to collection | Preserve the existing rising-cloud white-out as the primary cinematic moment. | Retain the current reduced-motion document-flow fallback. Short screens should not become trapped in a long pinned sequence. |
| Results gallery | Borderless staggered photographs; one controlled reveal per image, then stable reading. | Stack the same story in a deliberate sequence; preserve captions and links. Reduced motion shows the final image state immediately. |
| Craftsmanship | One portrait plus one genuine construction close-up; optional mild independent image drift. | Static composition, readable labels; no pointer-only information. |
| Transformation evidence | User-controlled before/after comparison with matching crop and labels; optional film with visible controls. | Drag and keyboard-operable comparison or two labeled photos. No auto-morphing that could obscure the comparison. |
| Client stories | Three curated stories with explicit next/previous controls and a short crossfade. | Swipe as an enhancement; visible buttons always remain. Avoid endless autoplay. |
| Consultation | Clear invitation and a calm entrance of the supporting photo. | The form is immediately readable and operable. No decorative motion around inputs. |

Suggested motion language: settle quickly, use one consistent ease family, make image movement slower than text, and let long stretches of the page remain still. A small number of well-composed transitions will contribute more than repeated pinning, rotating cards or decorative particles. A 3D scene should only be considered later if it helps inspect the actual hair product; it is not required for this visual direction.

## Asset direction

The references depend heavily on photographic quality. Prioritize a coherent Alchemane shoot: matched white-light portraits, honest paired before/after photos, close-ups of parting/lace/clips, hands fitting a topper, and a real founder or studio portrait. Use the reference imagery only on this attributed research board, not as Alchemane product or client imagery.

For the board, lead with Rino & Pelle's white editorial composition, use Exo Ape's white gallery as the layout rhythm reference, and position Ottografie as the optional cinematic storytelling reference. The references establish craft and direction; their awards do not establish project budgets.
