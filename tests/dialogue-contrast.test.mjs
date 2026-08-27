import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";

const css=fs.readFileSync(new URL("../app/v102.css",import.meta.url),"utf8");
const layout=fs.readFileSync(new URL("../app/layout.tsx",import.meta.url),"utf8");
const page=fs.readFileSync(new URL("../app/page.tsx",import.meta.url),"utf8");

test("dialogue contrast layer loads after legacy onboarding styles",()=>{
  assert.match(layout,/import "\.\/v100\.css";\s*import "\.\/v101\.css";\s*import "\.\/v102\.css";/);
  assert.match(css,/\.dialogue-onboarding \.dialogue-cloud\s*\{[\s\S]*?overflow:hidden/);
});

test("both speakers receive explicit readable dialogue colors",()=>{
  assert.match(css,/--dialogue-peon:#9fca38/);
  assert.match(css,/--dialogue-shadez:#8f1725/);
  assert.match(css,/\.dialogue-onboarding \.speaker-shadez \.dialogue-cloud small\s*\{\s*color:var\(--dialogue-shadez-hot\)/);
  assert.match(css,/\.dialogue-onboarding \.dialogue-cloud small\s*\{[\s\S]*?color:var\(--dialogue-peon-hot\)/);
});

test("dialogue copy is contained and scales by line density",()=>{
  assert.match(page,/copyDensity=copyLength>86\?"dialogue-copy-dense":copyLength>48\?"dialogue-copy-long":"dialogue-copy-short"/);
  assert.match(css,/overflow-wrap:anywhere/);
  assert.match(css,/\.dialogue-onboarding \.dialogue-copy-dense \.dialogue-cloud p/);
});

test("dialogue uses a character-by-character military transmission reveal",()=>{
  assert.match(page,/revealedCharacters/);
  assert.match(page,/TRANSMISSION \/\/ /);
  assert.match(page,/transmitted==="\\n"\?150:transmitted==="\."\?135:transmitted===":"\?95/);
  assert.match(page,/dialogue-copy-revealed/);
  assert.match(page,/dialogue-copy-pending/);
  assert.doesNotMatch(css,/@keyframes dialogue-word-decode/);
  assert.match(css,/font-size:clamp\(18px,1\.35vw,20px\)/);
  assert.match(css,/font-family:"Courier New",Consolas,monospace/);
  assert.match(css,/line-height:1\.55/);
});

test("dialogue uses restrained ornamental corners without an instruction prompt",()=>{
  assert.doesNotMatch(page,/CLICK · TAP · SPACE/);
  assert.doesNotMatch(page,/RECEIVING…/);
  assert.match(css,/\.dialogue-onboarding \.dialogue-cloud\{[\s\S]*?border:0;/);
  assert.match(css,/\.dialogue-onboarding \.dialogue-cloud:after\{[\s\S]*?linear-gradient\(90deg,var\(--dialogue-frame\)/);
  assert.match(css,/\.dialogue-onboarding \.dialogue-cloud \.dialogue-copy-revealed,[\s\S]*?padding:0;[\s\S]*?border:0;/);
});
