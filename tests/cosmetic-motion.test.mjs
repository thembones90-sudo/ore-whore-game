import test from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";

const page=readFileSync(new URL("../app/page.tsx",import.meta.url),"utf8");
const skins=readFileSync(new URL("../app/tool-skins.ts",import.meta.url),"utf8");
const css=readFileSync(new URL("../app/v066.css",import.meta.url),"utf8");

test("every cosmetic selects a data-driven motion profile",()=>{
  assert.match(skins,/id:"bonk"/);
  assert.match(skins,/id:"slash-hook"/);
  assert.match(skins,/id:"pneumatic"/);
  assert.match(skins,/id:"graceful-arc"/);
  assert.equal((skins.match(/animation: \{/g)||[]).length,4);
  assert.match(page,/motion-\$\{activeSkin\.animation\.id\}/);
});

test("cosmetic effects are inert and do not create strikes",()=>{
  assert.match(page,/skin-impact-fx/);
  assert.doesNotMatch(page,/skin-impact-fx[^>]+onClick/);
  assert.match(css,/pointer-events:none/);
  assert.match(page,/if\(event\.repeat\|\|spaceHeld\.current\)return/);
  assert.match(page,/tool\?\.holdToMine&&tool\.continuousMining/);
});

test("technology and model are shown as separate loadout concepts",()=>{
  assert.match(page,/TECHNOLOGY · GAMEPLAY/);
  assert.match(page,/MODEL · APPEARANCE/);
  assert.doesNotMatch(page,/equippedTrueArtifactChance/);
  assert.doesNotMatch(skins,/trueArtifactChance|damage|actionDurationMs/);
});

test("Pretty Bonker is a distinct cosmetic-only Roseheart model",()=>{
  assert.match(skins,/id: "pretty-bonker"/);
  assert.match(skins,/technicalName: "Roseheart Pickaxe"/);
  assert.match(skins,/impactFx:"rose-petals"/);
  assert.match(skins,/\{text:"Pretty\.",delayMs:0\}/);
  assert.match(skins,/\{text:"Still bonk\.",delayMs:650\}/);
  assert.match(css,/roseheartStrike/);
});

test("completed quotas collapse without hiding their audit view",()=>{
  assert.match(page,/quota-complete-compact/);
  assert.match(page,/VIEW QUOTAS/);
  assert.match(page,/HIDE QUOTAS/);
});
