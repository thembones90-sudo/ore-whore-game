import test from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {forgeAtomic,forgeRecipes,forgedItems,forgeWithPrerequisitesAtomic,maxCraftable,metallurgyRecipes,planForgePrerequisites,processedMaterials,smeltAtomic,smeltBatchAtomic} from "../app/metallurgy.ts";

const game=readFileSync(new URL("../app/page.tsx",import.meta.url),"utf8");
const ores=["copper","tin","silver","iron","gold","mithril","truesilver","dark","thorium","feliron","adamantite","khorium","cobalt","saronite","titanium"];
const minerals=["malachite","tigerseye","shadowgem","mossagate","jade","moonstone","citrine","aquamarine","starruby","vitriol","largeopal","sapphire","diamond","emerald","arcane"];
const base=(overrides={})=>({oreResources:{},mineralResources:{},processedResources:{},ownedTools:["rusty-pickaxe"],toolTier:0,...overrides});

test("canonical processing table and raw costs are exact",()=>{
  const expected={
    "alloy-bronze":{copper:2,tin:1},"refine-iron":{iron:2},"alloy-mithrilsteel":{mithril:2,truesilver:1},
    "alloy-darksteel":{dark:1,thorium:1},"alloy-felsteel":{feliron:2,adamantite:1},"alloy-khorium":{cobalt:2,khorium:1},
    "assembly-saronite":{saronite:2,gold:1},"assembly-titanium":{titanium:1,silver:1,cobalt:1},
  };
  for(const recipe of metallurgyRecipes)assert.deepEqual(Object.fromEntries(recipe.inputs.map(x=>[x.id,x.quantity])),expected[recipe.id]);
  assert.deepEqual(processedMaterials.map(x=>x.id),["bronze","iron-ingot","mithrilsteel","darksteel","felsteel","khorium-alloy","saronite-assembly","titanium-assembly"]);
});

test("smelting is atomic, spends ore stock only, and persists processed stock",()=>{
  const state=base({oreResources:{copper:2,tin:1},processedResources:{bronze:2}}),recipe=metallurgyRecipes.find(r=>r.id==="alloy-bronze");
  const next=smeltAtomic(state,recipe);assert.deepEqual(next.oreResources,{copper:0,tin:0});assert.equal(next.processedResources.bronze,3);assert.deepEqual(next.mineralResources,{});
  assert.equal(smeltAtomic(base({oreResources:{copper:1,tin:1}}),recipe),null);
});

test("late-game assemblies support maximum affordable atomic batches",()=>{
  const saronite=metallurgyRecipes.find(r=>r.id==="assembly-saronite");
  const titanium=metallurgyRecipes.find(r=>r.id==="assembly-titanium");
  const state=base({oreResources:{saronite:38,gold:24,titanium:7,silver:11,cobalt:9}});
  assert.equal(maxCraftable(state.oreResources,saronite.inputs),19);
  const saroniteBatch=smeltBatchAtomic(state,saronite,19);
  assert.equal(saroniteBatch.processedResources["saronite-assembly"],19);
  assert.equal(saroniteBatch.oreResources.saronite,0);
  assert.equal(saroniteBatch.oreResources.gold,5);
  assert.equal(maxCraftable(state.oreResources,titanium.inputs),7);
  const titaniumBatch=smeltBatchAtomic(state,titanium,7);
  assert.equal(titaniumBatch.processedResources["titanium-assembly"],7);
  assert.deepEqual({titanium:titaniumBatch.oreResources.titanium,silver:titaniumBatch.oreResources.silver,cobalt:titaniumBatch.oreResources.cobalt},{titanium:0,silver:4,cobalt:2});
});

test("forging spends processed and mineral stock only and enforces sequence",()=>{
  const recipe=forgeRecipes[0],state=base({processedResources:{bronze:3},mineralResources:{malachite:2,tigerseye:1}}),next=forgeAtomic(state,recipe);
  assert.equal(next.toolTier,1);assert.ok(next.ownedTools.includes("bronze-pickaxe"));assert.equal(next.processedResources.bronze,0);assert.equal(next.mineralResources.malachite,0);
  assert.deepEqual(state.oreResources,{});assert.equal(forgeAtomic(state,recipe).ownedTools.length,2,"same immutable input remains independently valid");
  assert.equal(forgeAtomic(next,recipe),null,"an owned tool cannot be duplicated");
  const skip=forgeRecipes.find(r=>r.resultingItemId==="mithril-pickaxe");assert.equal(forgeAtomic(base({processedResources:{mithrilsteel:99,"iron-ingot":99},mineralResources:{mossagate:99,jade:99}}),skip),null);
});

test("upgrade path plans and atomically builds missing prerequisites before forging",()=>{
  const recipe=forgeRecipes.find(r=>r.id==="forge-bronze-pickaxe");
  const state=base({oreResources:{copper:6,tin:3},mineralResources:{malachite:2,tigerseye:1}});
  const plan=planForgePrerequisites(state,recipe);
  assert.deepEqual(plan.oreInputs,[{id:"copper",quantity:6},{id:"tin",quantity:3}]);
  assert.deepEqual(plan.crafts,[{recipeId:"alloy-bronze",count:3,outputId:"bronze",quantity:3}]);
  const next=forgeWithPrerequisitesAtomic(state,recipe);
  assert.deepEqual(next.oreResources,{copper:0,tin:0});assert.equal(next.processedResources.bronze,0);assert.equal(next.mineralResources.malachite,0);assert.ok(next.ownedTools.includes("bronze-pickaxe"));
  assert.equal(forgeWithPrerequisitesAtomic(base({oreResources:{copper:5,tin:3},mineralResources:{malachite:2,tigerseye:1}}),recipe),null,"partial raw stock cannot be consumed");
});

test("all canonical tools have merged processed and mineral recipes",()=>{
  assert.equal(forgeRecipes.length,10);
  for(const recipe of forgeRecipes){assert.ok(recipe.processedInputs.length);assert.ok(recipe.mineralInputs.length);const tool=forgedItems.find(t=>t.id===recipe.resultingItemId);assert.equal(recipe.unlock?.tool,forgedItems.find(t=>t.tier===tool.tier-1)?.id)}
});

test("all 15 ores and all 15 minerals have an economic purpose",()=>{
  const usedOres=new Set(metallurgyRecipes.flatMap(r=>r.inputs.map(i=>i.id))),usedMinerals=new Set(forgeRecipes.flatMap(r=>r.mineralInputs.map(i=>i.id)));
  assert.deepEqual([...usedOres].sort(),[...ores].sort());assert.deepEqual([...usedMinerals].sort(),[...minerals].sort());
});

test("recipe eras are obtainable and do not create mine-unlock circles",()=>{
  const tierEra=["old","old","old","deep","deep","outland","northrend","northrend","northrend","northrend","northrend"];
  for(const recipe of forgeRecipes){const tool=forgedItems.find(t=>t.id===recipe.resultingItemId);assert.equal(recipe.unlock?.mine||"old",tierEra[tool.tier]);}
});

test("UI separates lifetime history from stock, confirms transactions, and preserves cosmetics",()=>{
  assert.match(game,/combos: \{ \.\.\.s\.combos/);assert.match(game,/ores: \{ \.\.\.s\.ores/);assert.match(game,/minerals: \{ \.\.\.s\.minerals/);
  assert.match(game,/className="craft-confirm-overlay"/);assert.match(game,/CONFIRM & CONSUME/);assert.match(game,/BUILD ALL ×/);assert.match(game,/transactionBusy/);
  assert.match(game,/BUILD ALL PREREQUISITES \+ FORGE/);assert.match(game,/SELECTED TECHNOLOGY PATH/);
  assert.match(game,/EFFECTIVE TRUE ARTEFACT CHANCE/);assert.match(game,/artifactChanceForDig\(save\.pendingArtifactModifier\)/);
  assert.match(game,/Cosmetic model unchanged/);assert.doesNotMatch(game,/toolSkinId:tool\.id/);
});

test("migration is schema-versioned and idempotent by construction",()=>{
  assert.match(game,/old\.oreResources[\s\S]*?old\.rawResources/);assert.match(game,/old\.mineralResources[\s\S]*?mineralCounts/);assert.match(game,/old\.processedResources[\s\S]*?old\.processedMaterials/);
  assert.match(game,/toolTier=Math\.max/);assert.match(game,/schema:15/);
});
