import sharp from "sharp";
import {mkdir} from "node:fs/promises";
import path from "node:path";

const root=path.resolve(import.meta.dirname,"..");
const sheet=path.join(root,"art-source","mines","old-mine-degradation-sheet.png");
const baseline=path.join(root,"public","assets","mines","mine-old.webp");
const runtime=path.join(root,"public","assets","mines");
const masters=path.join(root,"art-source","mines","stages");
await mkdir(masters,{recursive:true});

const width=1536,height=1024;
const mask=await sharp(Buffer.from(`<svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg"><rect width="100%" height="100%" fill="black"/><path d="M275 72 L1260 72 L1305 700 Q1280 835 1170 900 L350 900 Q245 840 225 700 Z" fill="white"/></svg>`)).blur(22).png().toBuffer();
await sharp(baseline).webp({quality:88,smartSubsample:true}).toFile(path.join(runtime,"old-mine-stage-0.webp"));

for(let stage=1;stage<=4;stage++){
  const column=(stage-1)%2,row=Math.floor((stage-1)/2);
  const full=await sharp(sheet).extract({left:column*768,top:row*512,width:768,height:512}).resize(width,height,{kernel:sharp.kernel.lanczos3}).png().toBuffer();
  await sharp(full).png({compressionLevel:9}).toFile(path.join(masters,`old-mine-stage-${stage}.png`));
  const overlay=await sharp(full).removeAlpha().joinChannel(mask).png().toBuffer();
  await sharp(baseline).composite([{input:overlay,blend:"over"}]).webp({quality:88,smartSubsample:true,effort:6}).toFile(path.join(runtime,`old-mine-stage-${stage}.webp`));
}
console.log("Old Mine stages 0–4 exported.");
