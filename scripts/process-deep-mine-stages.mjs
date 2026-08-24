import sharp from "sharp";
import {mkdir} from "node:fs/promises";
import path from "node:path";

const root=path.resolve(import.meta.dirname,"..");
const sheet=path.join(root,"art-source","mines","deep-mine-degradation-sheet.png");
const baseline=path.join(root,"public","assets","mines","mine-deep.webp");
const runtime=path.join(root,"public","assets","mines");
const masters=path.join(root,"art-source","mines","stages");
await mkdir(masters,{recursive:true});

const width=1536,height=1024;
// Keep the reinforced steel frame, chains, floor edges and volcanic side-light pixel-stable.
const mask=await sharp(Buffer.from(`<svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg"><rect width="100%" height="100%" fill="black"/><path d="M300 105 L1235 105 L1280 720 Q1260 870 1150 930 L375 930 Q270 870 250 720 Z" fill="white"/></svg>`)).blur(18).png().toBuffer();
await sharp(baseline).webp({quality:88,smartSubsample:true}).toFile(path.join(runtime,"deep-mine-stage-0.webp"));

for(let stage=1;stage<=4;stage++){
  const column=(stage-1)%2,row=Math.floor((stage-1)/2);
  const full=await sharp(sheet).extract({left:column*768,top:row*512,width:768,height:512}).resize(width,height,{kernel:sharp.kernel.lanczos3}).png().toBuffer();
  await sharp(full).png({compressionLevel:9}).toFile(path.join(masters,`deep-mine-stage-${stage}.png`));
  const overlay=await sharp(full).removeAlpha().joinChannel(mask).png().toBuffer();
  await sharp(baseline).composite([{input:overlay,blend:"over"}]).webp({quality:88,smartSubsample:true,effort:6}).toFile(path.join(runtime,`deep-mine-stage-${stage}.webp`));
}
console.log("Deep Mine stages 0–4 exported.");
