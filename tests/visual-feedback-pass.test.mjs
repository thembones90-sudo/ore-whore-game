import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";

const css=fs.readFileSync(new URL("../app/v077.css",import.meta.url),"utf8");
const layout=fs.readFileSync(new URL("../app/layout.tsx",import.meta.url),"utf8");

test("the coordinated visual pass is loaded last",()=>{
  assert.match(layout,/import "\.\/v077\.css";/);
  assert.ok(layout.lastIndexOf("v077.css")>layout.lastIndexOf("v076.css"));
});

test("all four mine materials own distinct impact debris",()=>{
  for(const biome of ["old","deep","outland","northrend"])assert.match(css,new RegExp(`\\.biome-${biome} \\.debris i`));
});

test("tools receive biome light without changing gameplay data",()=>{
  assert.match(css,/\.canonical-tool-skin img/);
  assert.doesNotMatch(css,/probability|trueArtifactChance|damage\s*:/);
});

test("artifact escalation, physical specimens, active forge, trails, and intro are present",()=>{
  for(const token of ["artifact-rock.damage-3","slots article.found:hover","forge-steam","motion-slash-hook:before","brand-assembly","tunnel-threshold-entry"])assert.ok(css.includes(token),`${token} is missing`);
});
