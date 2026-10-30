import sharp from 'sharp';
import { writeFile } from 'node:fs/promises';

// This mask covers only the title's overlap band, not the whole photograph.
// Trace the dark hair against the bright architecture from the exact source
// used by both picture layers. Keep skin inside the resulting silhouette.
const { data, info } = await sharp('public/assets/hero-natural-hairline-desktop-1664.webp')
  .removeAlpha().raw().toBuffer({ resolveWithObject: true });
if (info.width !== 1664 || info.height !== 936) throw new Error('Hero source dimensions changed; review the overlap regions.');
const luminance = (x, y) => {
  const i = (y * info.width + x) * info.channels;
  return .2126 * data[i] + .7152 * data[i + 1] + .0722 * data[i + 2];
};
const regions = [[320, 590, 160, 270], [665, 970, 110, 270], [1080, 1295, 135, 270]];
const paths = regions.map(([left, right, top, bottom]) => {
  const edge = [];
  for (let x = left; x <= right; x++) {
    let boundary = bottom;
    for (let y = top; y < bottom - 4; y++) {
      if ([0, 1, 3].every(offset => luminance(x, y + offset) < 165)) {
        boundary = y;
        break;
      }
    }
    edge.push([x, boundary]);
  }
  return `<path d="M${left} ${bottom} ${edge.map(([x, y]) => `L${x} ${y}`).join(' ')} L${right} ${bottom}Z"/>`;
});
await writeFile('public/assets/hero-hair-mask.svg', `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1664 936"><g fill="white">${paths.join('')}</g></svg>\n`);
console.log('Prepared photo-aligned hair mask for the desktop title overlap.');
