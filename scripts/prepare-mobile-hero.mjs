import sharp from 'sharp';

// Run independently to leave every desktop asset untouched.
for (const width of [780, 1024]) {
  await sharp('Images/hero-mobile-portrait.png')
    .resize({ width, withoutEnlargement: true })
    .webp({ quality: 86, effort: 6, smartSubsample: true })
    .toFile(`public/assets/hero-mobile-portrait-${width}.webp`);
}
console.log('Prepared the mobile-only portrait hero.');
