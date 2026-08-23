import test from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";

const data=readFileSync(new URL("../app/metallurgy.ts",import.meta.url),"utf8");
const game=readFileSync(new URL("../app/page.tsx",import.meta.url),"utf8");
const tunnel=readFileSync(new URL("../app/forbidden-tunnel.ts",import.meta.url),"utf8");

test("metallurgy foundation contains the canonical initial pipeline without coal or steel pickaxe",()=>{
  for(const id of ["bronze","iron-ingot","mithrilsteel","darksteel","felsteel","khorium-alloy"])assert.ok(data.includes(`id:"${id}"`));
  for(const tool of ["rusty-pickaxe","bronze-pickaxe","iron-pickaxe","mithril-pickaxe","dark-iron-pickaxe","felsteel-jackhammer","khorium-drill"])assert.ok(data.includes(`id:"${tool}"`));
  assert.doesNotMatch(data,/coal/i);
  assert.doesNotMatch(data,/steel-pickaxe/);
});

test("every technology shares one ordinary TRUE Artifact baseline",()=>{
  assert.match(tunnel,/ORDINARY_TRUE_ARTIFACT_CHANCE=0\.0005/);
  assert.doesNotMatch(data,/trueArtifactChance|MAX_TRUE_ARTIFACT_CHANCE|equippedTrueArtifactChance/);
  assert.match(game,/artifactChanceForDig\(modifier\)/);
  assert.match(game,/CANONICAL_EXCAVATION_PROBABILITIES\.emptyDig/);
  assert.doesNotMatch(game,/equippedTrueArtifactChance|TRUE chance .*tool/);
});

test("Peon Technology Tree uses canonical display names without changing stable early IDs",()=>{
  for(const name of ["ROCK BONKER","BRONZE BONKER","BIG PICK","SHINY BONKER","ANGRY PICK","LOUD BONKER","SPINNY DIGGER","BIGGER SPINNY DIGGER","ROCK EATER","MOUNTAIN HURTER","MOUNTAIN FUCKER"])assert.ok(data.includes(`name:"${name}"`));
  for(const technical of ["Peon Pickaxe","Mithrilsteel Pickaxe","Darksteel Pickaxe","Felsteel Jackhammer","Khorium Rotary Drill","Ultimate Mining Machine"])assert.ok(data.includes(`technicalName:"${technical}"`));
  assert.match(data,/id:"rusty-pickaxe"[\s\S]*?icon:"\/assets\/tools\/tool-rock-bonker\.webp"/);
  assert.match(game,/canonical-rock-bonker/);
  assert.match(data,/id:"ultimate-machine"[\s\S]*?recipeId:"forge-ultimate-machine"/);
  assert.doesNotMatch(data,/id:"ultimate-machine"[^\n]*trueArtifactChance/);
  assert.doesNotMatch(data,/planned:true/);
  for(const id of ["forge-advanced-drill","forge-advanced-excavator","forge-endgame-machine","forge-ultimate-machine"])assert.ok(data.includes(`id:"${id}"`));
});

test("migration strips obsolete top-level probability while preserving pending tunnel modifiers",()=>{
  assert.match(game,/trueArtifactChance:_obsoleteTrueArtifactChance/);
  assert.match(game,/artifactChance:_obsoleteArtifactChance/);
  assert.match(game,/pendingArtifactModifier=sanitizeArtifactModifier\(old\.pendingArtifactModifier\)/);
  assert.match(game,/\.\.\.safeOld/);
});

test("schema 15 migration preserves lifetime records and reconstructs separate spendable inventories",()=>{
  assert.match(game,/oreResources=old\.oreResources/);
  assert.match(game,/mineralResources=old\.mineralResources/);
  assert.match(game,/processedResources=old\.processedResources/);
  assert.match(game,/ownedTools=Array\.isArray\(old\.ownedTools\)/);
  assert.match(game,/toolTier=Math\.max/);
  assert.match(game,/schema:15/);
  assert.match(game,/oreResources:\{\.\.\.s\.oreResources/);
  assert.match(game,/mineralResources:\{\.\.\.s\.mineralResources/);
});
