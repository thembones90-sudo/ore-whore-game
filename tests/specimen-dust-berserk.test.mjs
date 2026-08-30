import assert from "node:assert/strict";
import {readFile} from "node:fs/promises";
import test from "node:test";
import {activateBerserk,activeBerserkMode,BERSERK_MODES,sanitizeActiveBerserk} from "../app/berserk.ts";

const root=new URL("../",import.meta.url);
const read=path=>readFile(new URL(path,root),"utf8");

test("the three canonical temporary modes escalate and spend exact Dust",()=>{
  assert.deepEqual(BERSERK_MODES.map(x=>[x.name,x.cost,x.durationMs]),[
    ["I — RAGE",150,45_000],["II — BLOODRAGE",300,30_000],["III — BLOODFURY",750,18_000],
  ]);
  for(let i=1;i<BERSERK_MODES.length;i++){
    assert.ok(BERSERK_MODES[i].damageMultiplier>BERSERK_MODES[i-1].damageMultiplier);
    assert.ok(BERSERK_MODES[i].criticalBonus>BERSERK_MODES[i-1].criticalBonus);
    assert.ok(BERSERK_MODES[i].intervalMultiplier<BERSERK_MODES[i-1].intervalMultiplier);
  }
  const result=activateBerserk(900,"feral",1_000);
  assert.deepEqual(result,{dust:150,dustSpent:750,active:{mode:"feral",startedAt:1_000,expiresAt:19_000}});
  assert.equal(activateBerserk(149,"agitated",1_000),null);
});

test("active frenzy persists by expiry and expired legacy state is discarded",()=>{
  const active={mode:"berserk",startedAt:1_000,expiresAt:31_000};
  assert.equal(activeBerserkMode(active,30_999)?.id,"berserk");
  assert.equal(activeBerserkMode(active,31_000),null);
  assert.deepEqual(sanitizeActiveBerserk(active,30_999),active);
  assert.equal(sanitizeActiveBerserk(active,31_000),null);
  assert.equal(sanitizeActiveBerserk({mode:"invented",startedAt:1,expiresAt:99},2),null);
});

test("Berserk modifies strikes and cadence but never geological or TRUE Artefact odds",async()=>{
  const [page,data]=await Promise.all([read("app/page.tsx"),read("app/berserk.ts")]);
  assert.match(page,/CRIT_CHANCE\+\(currentBerserk\?\.criticalBonus\|\|0\)/);
  assert.match(page,/tool\.damage\*\(currentBerserk\?\.damageMultiplier\|\|1\)/);
  assert.match(page,/tool\.actionDurationMs\)\*\(frenzy\?\.intervalMultiplier\|\|1\)/);
  assert.doesNotMatch(data,/trueArtifact|artifactChance|emptyDig|oreWeight|mineralWeight/i);
});

test("the mine exposes a consumable control, countdown, barks, audio ramp and accessible spectacle",async()=>{
  const [page,data,css,layout]=await Promise.all([read("app/page.tsx"),read("app/berserk.ts"),read("app/v080.css"),read("app/layout.tsx")]);
  assert.match(page,/SNORT THE DUST/);
  assert.match(page,/SPECIMEN DUST EFFECTS SUBSIDING\./);
  assert.match(data,/PEON IS THE PICKAXE NOW\./);
  assert.match(page,/playbackRate=starts\[index\]\+\(target-starts\[index\]\)\*smooth/);
  assert.match(css,/PEON OPERATING BEYOND SAFE BONK LIMITS/);
  assert.match(css,/width:min\(1060px,calc\(100vw - 440px\)\)/);
  assert.match(css,/@media\(max-width:1100px\)\{\.berserk-console\{order:2;width:min\(94vw,900px\)/);
  assert.match(css,/\.reduced-shake/);
  assert.match(css,/\.reduced-motion/);
  assert.ok(layout.lastIndexOf('import "./v080.css";')>layout.lastIndexOf('import "./v079.css";'));
});
