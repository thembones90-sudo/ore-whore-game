import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";

const page=fs.readFileSync(new URL("../app/page.tsx",import.meta.url),"utf8");
const css=fs.readFileSync(new URL("../app/v089.css",import.meta.url),"utf8");
const layout=fs.readFileSync(new URL("../app/layout.tsx",import.meta.url),"utf8");
const polish=fs.readFileSync(new URL("../app/v105.css",import.meta.url),"utf8");

test("resource cards create one unit immediately without opening confirmation",()=>{
  assert.match(page,/const runMetallurgy=.*?smeltAtomic/s);
  assert.match(page,/ready\?"CREATE"/);
  assert.match(page,/runMetallurgy\(r\.id\)/);
  assert.doesNotMatch(page,/setConfirmation\(\{kind:"smelt",id:r\.id\}\)/);
});

test("forge opens with a canonical next-functional-tool briefing",()=>{
  assert.match(page,/NEXT FUNCTIONAL TOOL/);
  assert.match(page,/DIRECT FORGE SHORTAGES/);
  assert.match(page,/SELECT THE TOOL CARD FOR THE COMPLETE DEPENDENCY PATH/);
  assert.match(polish,/\.next-tool-brief/);
  assert.match(layout,/import "\.\/v105\.css"/);
});

test("resource cards show owned, next-tool need, and missing counts",()=>{
  assert.match(page,/YOU OWN/);
  assert.match(page,/NEXT TOOL NEEDS/);
  assert.match(page,/MISSING/);
  assert.match(css,/\.recipe-stock/);
  assert.match(layout,/import "\.\/v089\.css"/);
});
