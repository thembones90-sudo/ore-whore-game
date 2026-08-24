import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const page=readFileSync(new URL("../app/page.tsx",import.meta.url),"utf8");
const css=readFileSync(new URL("../app/v079.css",import.meta.url),"utf8");
const layout=readFileSync(new URL("../app/layout.tsx",import.meta.url),"utf8");

test("ore breakthrough and physical feedback use the actual strike coordinate",()=>{
  assert.match(css,/\.stage-ore \.exposed-ore[\s\S]*left:var\(--hit-x\)!important/);
  assert.match(css,/top:var\(--hit-y\)!important/);
  assert.match(css,/ore-collapse-bloom/);
});

test("technology scales presentation without modifying mining calculations",()=>{
  assert.match(page,/"--tool-tier":activeTechnology\.tier/);
  assert.match(page,/8\+Math\.min\(8,activeTechnology\.tier\)/);
  assert.match(css,/var\(--impact-scale,1\)/);
  assert.doesNotMatch(css,/probability|trueArtifactChance|damage\s*:/);
});

test("physical feedback layer loads last and honors reduced motion",()=>{
  assert.ok(layout.indexOf('import "./v079.css"')>layout.indexOf('import "./v078.css"'));
  assert.match(css,/\.reduced-motion \.stage-ore \.exposed-ore/);
});
