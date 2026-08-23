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

test("equipped tools own a data-driven TRUE Artifact curve capped at one percent",()=>{
  assert.match(data,/MAX_TRUE_ARTIFACT_CHANCE = 0\.01/);
  for(const chance of [".0005",".0006",".0008",".001",".0015",".002",".003"])assert.ok(data.includes(`trueArtifactChance:${chance}`));
  assert.match(data,/equippedTrueArtifactChance=.*Math\.min\(MAX_TRUE_ARTIFACT_CHANCE/);
  assert.match(game,/equippedTrueArtifactChance\(equippedMiningTool\(save\)\)/);
  assert.match(game,/CANONICAL_EXCAVATION_PROBABILITIES\.emptyDig/);
  assert.doesNotMatch(game,/const TRUE_CHANCE/);
  assert.doesNotMatch(game,/ownedTools.*trueArtifactChance/);
});

test("Peon Technology Tree uses canonical display names without changing stable early IDs",()=>{
  for(const name of ["ROCK BONKER","BRONZE BONKER","BIG PICK","SHINY BONKER","ANGRY PICK","LOUD BONKER","SPINNY DIGGER","BIGGER SPINNY DIGGER","ROCK EATER","MOUNTAIN HURTER","MOUNTAIN FUCKER"])assert.ok(data.includes(`name:"${name}"`));
  for(const technical of ["Peon Pickaxe","Mithrilsteel Pickaxe","Darksteel Pickaxe","Felsteel Jackhammer","Khorium Rotary Drill","Ultimate Mining Machine"])assert.ok(data.includes(`technicalName:"${technical}"`));
  assert.match(data,/id:"rusty-pickaxe"[\s\S]*?icon:"\/assets\/tools\/tool-rock-bonker\.webp"/);
  assert.match(game,/canonical-rock-bonker/);
  assert.match(data,/id:"ultimate-machine"[\s\S]*?recipeId:"forge-ultimate-machine"[\s\S]*?trueArtifactChance:\.01/);
  assert.doesNotMatch(data,/planned:true/);
  for(const id of ["forge-advanced-drill","forge-advanced-excavator","forge-endgame-machine","forge-ultimate-machine"])assert.ok(data.includes(`id:"${id}"`));
});

test("save migration preserves cumulative ores while adding spendable inventories and tool ownership",()=>{
  assert.match(game,/rawResources=old\.rawResources/);
  assert.match(game,/processedMaterials:old\.processedMaterials\|\|\{\}/);
  assert.match(game,/ownedTools=Array\.isArray\(old\.ownedTools\)/);
  assert.match(game,/rawResources:\{\.\.\.s\.rawResources/);
});
