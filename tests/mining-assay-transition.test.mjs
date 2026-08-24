import test from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";

const page=readFileSync(new URL("../app/page.tsx",import.meta.url),"utf8");
const layout=readFileSync(new URL("../app/layout.tsx",import.meta.url),"utf8");
const css=readFileSync(new URL("../app/v085.css",import.meta.url),"utf8");

test("new finds pass through a locked physical assay transfer",()=>{
  assert.match(page,/assayTransfer\|\|trueFind/);
  assert.match(page,/setAssayTransfer\(\{ore,mineral\}\)/);
  assert.match(page,/setTimeout\(\(\)=>\{setAssayTransfer\(null\);setFound/);
  assert.match(page,/ROUTING TO DEPARTMENT ASSAY/);
});

test("impact feedback remains coordinate-local and biome-specific",()=>{
  assert.match(css,/left:var\(--hit-x\);top:var\(--hit-y\)/);
  for(const biome of ["old","deep","outland","northrend"])assert.match(css,new RegExp(`\\.biome-${biome} \\.material-impact`));
});

test("critical choreography is brief and accessibility-aware",()=>{
  assert.match(css,/critical-camera \.18s/);
  assert.match(css,/perfect-critical-camera \.22s/);
  assert.match(css,/\.reduced-shake/);
  assert.ok(layout.indexOf('import "./v085.css";')>layout.indexOf('import "./v084.css";'));
});
