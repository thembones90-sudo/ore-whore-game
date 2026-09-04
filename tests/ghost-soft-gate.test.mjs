import test from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {effectiveOreHp,rescaleRemainingHp,GHOST_OBSOLETE_TOOL_HP_MULTIPLIER} from "../app/ghost-progression.ts";
import {forgeAtomic,forgeRecipes,forgedItems,forgeWithPrerequisitesAtomic} from "../app/metallurgy.ts";

const game=readFileSync(new URL("../app/page.tsx",import.meta.url),"utf8");
const ghostRecipe=forgeRecipes.find(recipe=>recipe.id==="forge-ghostforged-pick");
const stocked=()=>({oreResources:{gravesilver:5,stillwater:2,hushstone:1,thorium:10,titanium:5},mineralResources:{},processedResources:{},ownedTools:["rusty-pickaxe","ultimate-machine"],toolTier:10,dust:500,dustSpent:20});

test("Ghost ore alone receives the obsolete-tool ten-times toughness penalty",()=>{
  assert.equal(GHOST_OBSOLETE_TOOL_HP_MULTIPLIER,10);
  assert.equal(effectiveOreHp("ghost",3,false),30);
  assert.equal(effectiveOreHp("ghost",5,false),50);
  assert.equal(effectiveOreHp("ghost",5,true),5);
  for(const biome of ["old","deep","outland","northrend"])assert.equal(effectiveOreHp(biome,5,false),5);
});

test("active ore remaining HP rescales proportionally in both directions",()=>{
  assert.equal(rescaleRemainingHp(20,50,5),2);
  assert.equal(rescaleRemainingHp(2,5,50),20);
  assert.equal(rescaleRemainingHp(1,50,5),1,"switching tools never grants a free completion");
});

test("Ghost capability is explicit and exclusive to GHOST OF THE FORGE",()=>{
  const ghost=forgedItems.find(tool=>tool.id==="ghostforged-pick");
  assert.equal(ghost.ghostCapable,true);
  assert.ok(forgedItems.filter(tool=>tool.id!==ghost.id).every(tool=>tool.ghostCapable===false));
  assert.equal(ghost.damage,forgedItems.find(tool=>tool.id==="ultimate-machine").damage);
  assert.equal(ghost.trueArtifactChance,forgedItems.find(tool=>tool.id==="ultimate-machine").trueArtifactChance);
});

test("Ghost recipe is exact and direct forging consumes everything atomically",()=>{
  assert.deepEqual(ghostRecipe.oreInputs,[{id:"gravesilver",quantity:5},{id:"stillwater",quantity:2},{id:"hushstone",quantity:1},{id:"thorium",quantity:10},{id:"titanium",quantity:5}]);
  assert.equal(ghostRecipe.dustCost,500);assert.equal(ghostRecipe.unlock.mine,"ghost");assert.equal(ghostRecipe.unlock.tool,"ultimate-machine");
  const before=stocked(),next=forgeAtomic(before,ghostRecipe);
  assert.ok(next.ownedTools.includes("ghostforged-pick"));assert.ok(next.ownedTools.includes("ultimate-machine"),"the prerequisite is not consumed");
  assert.deepEqual(next.oreResources,{gravesilver:0,stillwater:0,hushstone:0,thorium:0,titanium:0});assert.equal(next.dust,0);assert.equal(next.dustSpent,520);
  assert.deepEqual(before,stocked(),"input state is immutable");
});

test("direct and auto forge reject every missing requirement without partial consumption",()=>{
  for(const [label,mutate] of [
    ["ghost ore",s=>{s.oreResources.gravesilver=4}],
    ["standard ore",s=>{s.oreResources.titanium=4}],
    ["dust",s=>{s.dust=499}],
    ["prerequisite",s=>{s.ownedTools=["rusty-pickaxe"]}],
  ])for(const operation of [forgeAtomic,forgeWithPrerequisitesAtomic]){const state=stocked();mutate(state);const snapshot=structuredClone(state);assert.equal(operation(state,ghostRecipe),null,`${label} must block ${operation.name}`);assert.deepEqual(state,snapshot)}
  const auto=forgeWithPrerequisitesAtomic(stocked(),ghostRecipe);assert.ok(auto.ownedTools.includes("ghostforged-pick"));assert.equal(auto.dust,0);
});

test("runtime wiring keeps the soft gate isolated from tunnels, artifacts, and strike math",()=>{
  assert.match(game,/const tool=equippedMiningTool\(save\),oreHp=oreHpFor\(save,ore,tool\)/);
  assert.match(game,/stage!=="ore"\|\|!pendingOre/);assert.match(game,/rescaleRemainingHp\(current,maxHp,nextMax\)/);
  assert.match(game,/Math\.max\(60,Math\.ceil\(maxHp\*20\)\)/,"TRUE Artifact encounter HP remains its own system");
  assert.match(game,/10\+Math\.floor\(rng\.current\(\)\*6\)/,"tunnel HP remains unchanged");
  assert.match(game,/const damage = \(isPerfect && isCrit \? 3 : \(isPerfect \|\| isCrit\) \? 2 : 1\)\*tool\.damage\*\(currentBerserk\?\.damageMultiplier\|\|1\)/,"normal strike modifiers remain unchanged");
  assert.match(game,/ghostInefficiencySeen:old\.ghostInefficiencySeen===true/);assert.match(game,/EXTRACTION EFFICIENCY · 10\.0%/);
});
