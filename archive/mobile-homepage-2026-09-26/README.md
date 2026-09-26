# Homepage before mobile simplification

These snapshots preserve the working files, including existing uncommitted edits, immediately before the September 26 homepage changes.

## Archived features

- The cloud opening and its pinned mobile/desktop scroll timelines: `index.html`, `main.js`.
- Separate category discovery and product catalogue: `catalogue-data.js`, `catalogue.js`.
- “Natural-looking hair. Made for you.” parallax: the first section of `homepage.html`, `overture.js`, `overture.css`.
- Numbered arc and scroll-driven solution panels: `solutions-data.js`, `solutions.js`, `solutions.css`.
- The automatic offer popup implementation: `offer-popup.js`. It remains available in the source tree and on the extensions page, but the homepage no longer initializes it.
- The pending client-film placeholder and old hidden promise: `homepage.html`.

All original images and videos remain in place. Nothing was permanently deleted. To restore a feature, selectively port its section, imports, styles and initialization from these snapshots into the current files. Do not overwrite entire current files: the new homepage structure and current work would be lost.

The full topper and extension explainer slots now live on `/toppers.html` and `/extensions.html`. They share `src/sections/reel-data.js`; approved film URLs are still empty.
