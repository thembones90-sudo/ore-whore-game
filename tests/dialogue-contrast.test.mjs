import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";

const css=fs.readFileSync(new URL("../app/v100.css",import.meta.url),"utf8");
const layout=fs.readFileSync(new URL("../app/layout.tsx",import.meta.url),"utf8");

test("dialogue contrast layer loads after legacy onboarding styles",()=>{
  assert.match(layout,/import "\.\/v099\.css";\s*import "\.\/v100\.css";/);
  assert.match(css,/\.dialogue-onboarding \.dialogue-cloud\s*\{[\s\S]*?color:var\(--dialogue-ink\)/);
});

test("both speakers receive explicit readable dialogue colors",()=>{
  assert.match(css,/\.dialogue-onboarding \.dialogue-cloud p,[\s\S]*?color:var\(--dialogue-ink\)/);
  assert.match(css,/speaker-shadez \.dialogue-cloud small\{color:var\(--dialogue-shadez-hot\)/);
  assert.match(css,/\.dialogue-onboarding \.dialogue-cloud small\{[\s\S]*?color:var\(--dialogue-peon\)/);
});
