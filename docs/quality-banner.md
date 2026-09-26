# Alchemane standard banner

Immediately below See the difference. Only the three reference claims are visible: centered in a desktop row, stacked on mobile. Two vertical dividers are tall on desktop and short on mobile.

## Photography and contrast

New daylight images use `public/assets/editorial/campaign-portrait.webp` as the lighting and color-grade reference: ivory surroundings, diffused window light, natural skin and brown hair. The photograph has no white overlay. All three claims and dividers use matching white, with a dark shadow to keep them visible across the hair and bright room. Photography is illustrative, not verified stock photography. No additional heading or numbering.

## Fixed-image parallax

GSAP counter-translates the picture at page scroll speed between top-bottom and bottom-top, keeping its viewport top at zero. Text scrolls normally. The absolute parent clips the image within the section; no fixed child escapes, no pin spacer is introduced. Immediate scrub prevents catch-up lag. Dimensions refresh on resize. Reduced motion uses a static section-sized image; matchMedia cleanup restores initial styles.

## Final assets

- `public/assets/quality/daylight-desktop-1000.webp`
- `public/assets/quality/daylight-desktop-1536.webp`
- `public/assets/quality/daylight-mobile-600.webp`
- `public/assets/quality/daylight-mobile-1000.webp`

Built-in image generation tool; responsive WebP encoding with Sharp. Earlier hand-held assets and generated PNG originals are preserved but not used in the section.

## Desktop prompt

Use case: photorealistic-natural. Create a new Alchemane hair-extension campaign photograph. Input image 1 is ONLY the lighting, color grading and photographic style reference, NOT the subject to reproduce. Match its luminous soft ivory-white interior, sheer white curtains, diffused window daylight, very subtle window shadows, natural warm skin and realistic rich brown hair texture. Subject: one woman's natural medium warm-brown hand and forearm in an ivory linen sleeve gently holding a folded bundle of long dark chocolate-brown wavy clip-in human hair extensions; realistic small pressure clips visible on the underside near her hand. The hand supports the folded top naturally with slender fingers together; hair drapes down with soft flowing waves and naturally tapered ends. No face, no torso. Authentic fine individual strands, subtle healthy luster, premium editorial photography, soft low-contrast highlights. No teal backdrop, no dark backdrop, no CGI, no gold props, no logos, no text, no borders, no divider lines. Clean quiet photo only, typography will be added in code. Landscape 3:2 composition for a full-width website banner: sleeve enters from left, hand at upper-left third, the bundle hangs through left-center taking up about 40 percent of image width, ample pale sunlit negative space on right. Frame wide enough to include hand and flowing ends, generous breathing room.

## Mobile prompt

Use case: photorealistic-natural. Create a new Alchemane hair-extension campaign photograph. Input image 1 is ONLY the lighting, color grading and photographic style reference, NOT the subject to reproduce. Match its luminous soft ivory-white interior, sheer white curtains, diffused window daylight, very subtle window shadows, natural warm skin and realistic rich brown hair texture. Subject: one woman's natural medium warm-brown hand and forearm in an ivory linen sleeve gently holding a folded bundle of long dark chocolate-brown wavy clip-in human hair extensions; realistic small pressure clips visible on the underside near her hand. The hand supports the folded top naturally with slender fingers together; hair drapes down with soft flowing waves and naturally tapered ends. No face, no torso. Authentic fine individual strands, subtle healthy luster, premium editorial photography, soft low-contrast highlights. No teal backdrop, no dark backdrop, no CGI, no gold props, no logos, no text, no borders, no divider lines. Clean quiet photo only, typography will be added in code. Portrait 2:3 composition for a mobile full-background banner: hand enters from left at upper-middle, hair drapes through center-right and lower part, entire folded weft and natural ends visible, pale ivory negative space at top and around the subject. Similar scale and lighting to the provided reference, not a product cutout.

## Verification

`node scripts/check-quality-banner.mjs` (Vite on port 5173): desktop, laptop, tablet, mobile, small mobile and reduced motion. Checks exact copy, layout, dividers, responsive imagery, clipping, viewport lock, fast forward/reverse scroll and overflow. Screenshots: `preview/quality-banner/`. Build: `npm.cmd run build`.
