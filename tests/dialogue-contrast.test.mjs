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
  assert.match(css,/speaker-shadez \.dialogue-cloud small\s*\{\s*color:var\(--dialogue-shadez-hot\)/);
  assert.match(css,/\.dialogue-onboarding \.dialogue-cloud small\s*\{[\s\S]*?color:var\(--dialogue-peon-hot\)/);
});

test("dialogue copy is contained and scales by line density",()=>{
  assert.match(page,/copyDensity=copyLength>86\?"dialogue-copy-dense":copyLength>48\?"dialogue-copy-long":"dialogue-copy-short"/);
  assert.match(css,/overflow-wrap:anywhere/);
  assert.match(css,/\.dialogue-onboarding \.dialogue-copy-dense \.dialogue-cloud p/);
});
