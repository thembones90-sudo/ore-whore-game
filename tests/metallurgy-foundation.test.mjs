import test from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";

const data=readFileSync(new URL("../app/metallurgy.ts",import.meta.url),"utf8");
const game=readFileSync(new URL("../app/page.tsx",import.meta.url),"utf8");

test("metallurgy foundation contains the canonical initial pipeline without coal or steel pickaxe",()=>{
  for(const id of ["bronze","iron-ingot","mithrilsteel","darksteel","felsteel","khorium-alloy"])assert.ok(data.includes(`id:"${id}"`));
  for(const tool of ["rusty-pickaxe","bronze-pickaxe","iron-pickaxe","mithril-pickaxe","dark-iron-pickaxe","felsteel-jackhammer","khorium-drill"])assert.ok(data.includes(`id:"${tool}"`));
  assert.doesNotMatch(data,/coal/i);
  assert.doesNotMatch(data,/steel-pickaxe/);
});

test("tools reuse immutable canonical excavation probabilities",()=>{
  assert.match(data,/emptyDig:0\.20,trueArtifact:0\.0005,miss:0\.05,critical:0\.05/);
  assert.match(game,/CANONICAL_EXCAVATION_PROBABILITIES\.trueArtifact/);
  assert.match(game,/CANONICAL_EXCAVATION_PROBABILITIES\.emptyDig/);
  assert.doesNotMatch(data,/artifact.*(?:bonus|boost|modifier)/i);
});

test("save migration preserves cumulative ores while adding spendable inventories and tool ownership",()=>{
  assert.match(game,/rawResources=old\.rawResources/);
  assert.match(game,/processedMaterials:old\.processedMaterials\|\|\{\}/);
  assert.match(game,/ownedTools=Array\.isArray\(old\.ownedTools\)/);
  assert.match(game,/rawResources:\{\.\.\.s\.rawResources/);
});
