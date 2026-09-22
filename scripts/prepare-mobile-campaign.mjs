import sharp from 'sharp';

for (const width of [780, 940]) {
  await sharp('Images/campaign-mobile-portrait.png')
    .resize({ width, withoutEnlargement: true })
    .webp({ quality: 86, effort: 6, smartSubsample: true })
    .toFile(`public/assets/editorial/campaign-mobile-${width}.webp`);
}
console.log('Prepared mobile campaign artwork; desktop assets unchanged.');
