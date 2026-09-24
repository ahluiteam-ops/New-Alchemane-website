import sharp from 'sharp';
import { mkdir } from 'node:fs/promises';

// Built-in image generation output. Originals remain untouched.
const source = 'C:/Users/ADMIN/.codex/generated_images/01a0d272-5b33-7fe0-9854-667af5abca83';
const files = {
  toppers: 'exec-db45c943-7e43-496c-957e-07a1e0c47373.png',
  extensions: 'exec-8edc2d3d-60f5-4c74-8028-0ad73ef23a0e.png',
  wigs: 'exec-01ff0ab0-ca21-438c-8fcf-70be10274fec.png',
};
await mkdir('public/assets/solutions', { recursive: true });
for (const [name, file] of Object.entries(files)) {
  for (const width of [480, 960]) {
    const output = `public/assets/solutions/${name}-${width}.webp`;
    await sharp(`${source}/${file}`).resize({ width, withoutEnlargement: true }).webp({ quality: 86 }).toFile(output);
    console.log(output);
  }
}
