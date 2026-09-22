# Homepage archive — 19 September 2026

The original files were copied here before the homepage refinement. This directory is outside `public` and is not imported into the Vite build.

## Removed sections

| Fragment | Original heading | Restore position |
| --- | --- | --- |
| `solutions.html` | Your hair. Your story. Your kind of beautiful. | After `.editorial-overture` |
| `in-motion.html` | Same you. A new feeling. | Between the original film sections, or after `.films-pair` |
| `hair-guide.html` | Good hair decisions start here. | Before `#questions` |

To restore one section, copy its fragment into `src/homepage.html` at the indicated position. `src/homepage.css` still contains its structural styles. The archived `premium.css` has its former visual treatment; adapt that treatment to the new design tokens.

For the interactive hair goals, also restore the `solutions` data, `[data-solution]` tab binding and `.solution-link` handler from the archived `homepage.js`.

For the before/after section, restore `.film-dialog` from archived `homepage.html`, plus the slider and film-dialog handlers from archived `homepage.js`.

For the guide, restore `.guide-dialog` from archived `homepage.html`, plus its open, close, backdrop and consultation handlers from archived `homepage.js`. Guard optional dialogs if restoring only one of the two. Re-add footer links only for sections that have been restored.

The original chaptered film markup and its JavaScript/CSS are preserved in `homepage.html` and `sections/`. The new reels are configured separately in the live `src/sections/reel-data.js`.

## Complete prior layout

Snapshots include `index.html`, `homepage.html`, `homepage.js`, `homepage.css`, `premium.css`, `main.js`, the entire `sections/` directory, and the former browser checks. Original image and video assets remain in `public/assets`. Restoring these complete files is a rollback, so first preserve any newer work. Remove the new font preloads if using the archived entrypoint. No original media was deleted.
