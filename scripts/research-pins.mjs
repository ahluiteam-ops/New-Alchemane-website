import fs from 'node:fs/promises';
import path from 'node:path';
import sharp from 'sharp';
const dir = path.resolve('public/references/research-pins');
await fs.mkdir(dir, { recursive:true });
const pins = [
['aloee', 'https://in.pinterest.com/pin/947937421557563455/'],
['verso', 'https://uk.pinterest.com/pin/281543704035307/'],
['silveria', 'https://kr.pinterest.com/pin/703335666839072407/'],
['indian-concept', 'https://in.pinterest.com/pin/859765385160804573/'],
['paola', 'https://in.pinterest.com/pin/paola-vilas-jewelry-redesign-behance-in-2025--415808978116590026/'],
['jhannah', 'https://www.pinterest.com/pin/jhannah-jewelry-nailpolish-on-behance--515662226085200863/'],
['qariqris', 'https://in.pinterest.com/pin/808466570633440695/'],
['versa', 'https://in.pinterest.com/pin/versa-jewelry-website-behance--925630529664915156/'],
];
const records = await Promise.all(pins.map(async ([id, url]) => {
  try {
    const response = await fetch(url); const html = await response.text();
    const meta = html.match(/<meta[^>]+property="og:image"[^>]+content="([^"]+)"/i)?.[1] || html.match(/<meta[^>]+content="([^"]+)"[^>]+property="og:image"/i)?.[1];
    if (!meta) return {id,url,error:'no-image',status:response.status};
    const sourceImage = meta.replaceAll('&amp;', '&');
    const imageResponse = await fetch(sourceImage);
    const image = Buffer.from(await imageResponse.arrayBuffer());
    await fs.writeFile(path.join(dir, `${id}.jpg`), image);
    return {id,url,sourceImage,status:response.status};
  } catch(error) {return {id,url,error:String(error)}}
}));
await fs.writeFile(path.join(dir, 'candidates2.json'), JSON.stringify(records,null,2));
const good = records.filter(r => !r.error);
const width=360,height=460, cols=4;
const tiles = await Promise.all(good.map(async (p,i) => ({input:await sharp(path.join(dir, `${p.id}.jpg`)).resize(width,height-40,{fit:'contain',background:'#eeeeee'}).extend({top:40,bottom:0,left:0,right:0,background:'#ffffff'}).composite([{input:Buffer.from(`<svg width="360" height="40"><text x="12" y="26" font-size="20" font-family="Arial">${p.id}</text></svg>`),top:0,left:0}]).toBuffer(),left:(i%cols)*width,top:Math.floor(i/cols)*height})));
await sharp({create:{width:width*cols,height:height*Math.ceil(good.length/cols),channels:3,background:'#cccccc'}}).composite(tiles).jpeg().toFile(path.join(dir, 'contact.jpg'));
console.log(JSON.stringify(records,null,2));
