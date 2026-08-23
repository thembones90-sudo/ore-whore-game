import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const page = await readFile(new URL("../app/page.tsx", import.meta.url), "utf8");

test("TRUE Artefacts require a concealed twenty-times-health excavation before reveal", () => {
  assert.match(page, /Math\.ceil\(maxHp\*20\)/);
  assert.match(page, /setStage\("artifact"\)/);
  assert.match(page, /if\(stage==="artifact"\)\{completeTrueEncounter\(\);return;\}/);
  assert.match(page, /CLASSIFICATION WITHHELD/);
  assert.match(page, /20×<small>RESISTANCE/);
});

test("active TRUE Artefact encounters persist and restore without granting ownership early", () => {
  assert.match(page, /activeTrueEncounter:ActiveTrueEncounter\|null/);
  assert.match(page, /setSave\(s=>\(\{\.\.\.s,activeTrueEncounter\}\)\)/);
  assert.match(page, /activeTrueEncounter:s\.activeTrueEncounter\?\{\.\.\.s\.activeTrueEncounter,hp:hit\}:null/);
  assert.match(page, /if\(restored\.activeTrueEncounter\)/);
  assert.match(page, /activeTrueEncounter:null,lastDigAt/);
});

test("R9 receives the canonical Peon tribute", () => {
  assert.match(page, /peonBark:"Boss\.\.\. this not man\. This Ronaldo\. Peon take hat off\."/);
  assert.match(page, /\{text:"Boss\.\.\. this not man\.",delayMs:0\}/);
  assert.match(page, /\{text:"This Ronaldo\.",delayMs:700\}/);
  assert.match(page, /\{text:"Peon take hat off\.",delayMs:1700\}/);
  assert.match(page, /data\.artifact\.peonBarkSequence\?5700:2700/);
});
