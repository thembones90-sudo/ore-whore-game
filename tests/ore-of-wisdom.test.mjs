import assert from "node:assert/strict";
import fs from "node:fs";
import test from "node:test";

const rules=fs.readFileSync(new URL("../app/ore-of-wisdom.ts",import.meta.url),"utf8");
const page=fs.readFileSync(new URL("../app/page.tsx",import.meta.url),"utf8");
const layout=fs.readFileSync(new URL("../app/layout.tsx",import.meta.url),"utf8");

test("Ore of Wisdom uses the locked encounter constants and exactly fifty sayings",()=>{
  assert.match(rules,/ORE_OF_WISDOM_CHANCE = 0\.004/);
  assert.match(rules,/ORE_OF_WISDOM_AFTERTHOUGHT_CHANCE = 0\.125/);
  assert.match(rules,/OH GREAT ORE OF THE SOIL, WHAT IS YOUR WISDOM\?/);
  assert.match(rules,/Me ask rock\. Rock know stuff\./);
  const quoteBlock=rules.match(/ORE_OF_WISDOM_QUOTES = \[([\s\S]*?)\] as const/)?.[1]??"";
  assert.equal((quoteBlock.match(/^\s*".*",\s*$/gm)||[]).length,50);
});

test("Ore of Wisdom is rolled once only for an otherwise ordinary ore result",()=>{
  assert.match(page,/const wisdomRoll=!veinRoll&&!quotaWouldComplete&&!tunnel\?rollOreOfWisdom\(rng\.current\):null/);
  assert.equal((page.match(/rollOreOfWisdom\(rng\.current\)/g)||[]).length,1);
  assert.match(page,/setPendingWisdomEncounter\(wisdomRoll\)/);
});

test("encounter uses the dedicated optimized artwork and stylesheet",()=>{
  assert.match(page,/\/assets\/encounters\/ore-of-wisdom\.webp/);
  assert.match(page,/ORE_OF_WISDOM_INVOCATION/);
  assert.match(page,/ORE_OF_WISDOM_AFTERTHOUGHT/);
  assert.match(layout,/\.\/wisdom-v109\.css/);
});

test("encounter blocks mining input until it is dismissed",()=>{
  assert.match(page,/found\|\|assayTransfer\|\|trueFind\|\|wisdomEncounter\|\|pendingWisdomEncounter/);
  assert.match(page,/!wisdomEncounter && !pendingWisdomEncounter/);
});
