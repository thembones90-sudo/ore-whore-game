import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";

const volatile=fs.readFileSync(new URL("../app/volatile-ores.ts",import.meta.url),"utf8");
const page=fs.readFileSync(new URL("../app/page.tsx",import.meta.url),"utf8");
const css=fs.readFileSync(new URL("../app/v106.css",import.meta.url),"utf8");

test("canonical mine trigger rates and explicit mineral pool are locked",()=>{
  assert.match(volatile,/old:\.0004,deep:\.0006,outland:\.0008,northrend:\.001,ghost:\.0015/);
  assert.match(volatile,/\["arcane","emerald","diamond","sapphire","largeopal"\]/);
  assert.match(volatile,/oreQuantity:integer\(random,10,20\)/);
  assert.match(volatile,/slice\(0,integer\(random,1,3\)\)/);
});

test("unresolved detonation balance is isolated and marked provisional",()=>{
  assert.match(volatile,/PROVISIONAL BALANCE ONLY/);
  assert.match(volatile,/PROVISIONAL_VOLATILE_BALANCE/);
  assert.match(volatile,/ordinaryOreIds\.filter/);
  assert.doesNotMatch(volatile,/trueArtifacts|ownedTools|cosmetics|achievements/);
});

test("volatile roll occurs in the ordinary ore path and blocks strike input",()=>{
  assert.match(page,/shouldTriggerVolatile\(save\.biome,rng\.current\)/);
  assert.match(page,/save\.volatileEncounter\|\|stage==="volatile"/);
  assert.match(page,/stage==="volatile"&&\(save\.volatileEncounter\|\|volatileResolution\)/);
  assert.match(page,/volatileEncounter:null/);
});

test("encounter presents canonical consent copy and binary actions",()=>{
  for(const copy of [
    "VOLATILE DEPOSIT DETECTED.",
    "Boss... rock shaking.",
    "Extraction may produce an abnormal yield.",
    "Failure may decimate current stock.",
    "More rock... or boom?",
    "LEAVE IT",
    "DIG IT",
  ]) assert.ok(page.includes(copy),`missing ${copy}`);
  assert.match(css,/\.volatile-overlay\{position:fixed/);
  assert.match(css,/pointer-events:auto/);
});

test("save migration sanitizes active encounters and volatile statistics",()=>{
  assert.match(page,/sanitizeVolatileEncounter\(old\.volatileEncounter/);
  assert.match(page,/sanitizeVolatileStats\(old\.volatileStats\)/);
  assert.match(page,/schema:22/);
});
