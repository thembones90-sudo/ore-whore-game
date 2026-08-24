import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";

const variants=["crooked","rails","collapsed","bend","reinforced","wide"];
const css=fs.readFileSync(new URL("../app/v076.css",import.meta.url),"utf8");

test("all six Forbidden Tunnel cosmetic artworks ship and are wired",()=>{
  for(const variant of variants){
    const asset=new URL(`../public/assets/tunnels/forbidden-tunnel-${variant}.webp`,import.meta.url);
    assert.ok(fs.existsSync(asset),`${variant} artwork is missing`);
    assert.ok(fs.statSync(asset).size>20_000,`${variant} artwork is unexpectedly small`);
    assert.match(css,new RegExp(`\\.first-passages button\\.passage-${variant}\\{[^}]*forbidden-tunnel-${variant}\\.webp`));
  }
});

test("tunnel artwork keeps restrained hover depth and removes procedural geometry",()=>{
  assert.match(css,/background-size:auto 103%/);
  assert.match(css,/button:after,\.first-passages button i\{display:none!important\}/);
});
