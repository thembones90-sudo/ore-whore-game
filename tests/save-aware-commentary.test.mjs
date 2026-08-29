import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import {
  EMPTY_MEMORY_STATE,
  EMPTY_TUNNEL_HISTORY,
  MEMORY_COMMENTARY_DIG_GAP,
  MEMORY_COMMENTARY_ROLL_CHANCE,
  MEMORY_COMMENTARY_TIME_GAP_MS,
  sanitizeMemoryState,
  sanitizeTunnelHistory,
  selectSaveAwareCommentary,
} from "../app/save-aware-commentary.ts";

const context=(overrides={})=>({
  digs:600,emptyDigs:0,misses:0,strikes:1200,criticalStrikes:0,perfectStrikes:10,
  ores:{},completedBiomes:[],tunnelChoices:{...EMPTY_TUNNEL_HISTORY},trueArtifacts:{},
  excessAfterCompletion:0,...overrides,
});

test("ore obsession requires a dominant SHARE of mining history, not just a raw quantity", () => {
  // High absolute count but NOT dominant (evenly split across many ores) must not fire.
  assert.equal(selectSaveAwareCommentary(context({ores:{copper:500,tin:500,silver:500,iron:500}}),EMPTY_MEMORY_STATE,{event:"dig",random:0}),null);
  // Dominant share but below the raw floor must not fire either — both conditions are required.
  assert.equal(selectSaveAwareCommentary(context({ores:{copper:10}}),EMPTY_MEMORY_STATE,{event:"dig",random:0}),null);
  // Meeting both the floor and the 60%+ share is what actually fires it.
  const result=selectSaveAwareCommentary(context({ores:{copper:500}}),EMPTY_MEMORY_STATE,{event:"dig",random:0,now:10});
  assert.equal(result?.line.id,"memory-copper-obsession-shadez");
  assert.equal(result?.line.speaker,"SHADEZ");
  assert.equal(result?.state.seen["copper-obsession-shadez"],600);
  assert.equal(selectSaveAwareCommentary(context({digs:700,ores:{copper:600}}),result.state,{event:"dig",random:0,now:20}),null);
});

test("ore obsession generalizes to any ore, proven with a second, unrelated ore id", () => {
  const result=selectSaveAwareCommentary(context({ores:{gravesilver:90}}),EMPTY_MEMORY_STATE,{event:"dig",random:0});
  assert.equal(result?.line.id,"memory-gravesilver-obsession-shadez");
});

test("PEON's ore-obsession line surfaces once SHADEZ's has already been shown and marked seen", () => {
  const shadezSeen={seen:{"copper-obsession-shadez":600},lastShownAtDig:600,lastShownAt:10};
  const result=selectSaveAwareCommentary(context({digs:700,ores:{copper:500}}),shadezSeen,{event:"dig",random:0,now:2_000_000});
  assert.equal(result?.line.id,"memory-copper-obsession-peon");
  assert.equal(result?.line.speaker,"PEON");
  assert.equal(result?.line.dialogue,"Boss... copper like Peon.");
});

test("global dig cooldown and rarity gate prevent commentary spam", () => {
  const now=500_000;
  const state={seen:{},lastShownAtDig:600-MEMORY_COMMENTARY_DIG_GAP+1,lastShownAt:now-MEMORY_COMMENTARY_TIME_GAP_MS-1};
  assert.equal(selectSaveAwareCommentary(context({ores:{copper:500}}),state,{event:"dig",random:0,now}),null);
  const recent={seen:{},lastShownAtDig:600-MEMORY_COMMENTARY_DIG_GAP,lastShownAt:now-MEMORY_COMMENTARY_TIME_GAP_MS+1};
  assert.equal(selectSaveAwareCommentary(context({ores:{copper:500}}),recent,{event:"dig",random:0,now}),null);
  assert.equal(selectSaveAwareCommentary(context({digs:700,ores:{copper:500}}),EMPTY_MEMORY_STATE,{event:"dig",random:MEMORY_COMMENTARY_ROLL_CHANCE+.01,now}),null);
});

test("repeated tunnel behavior is recognized and correctly names the dominant direction, without exposing raw counts", () => {
  const result=selectSaveAwareCommentary(context({tunnelChoices:{left:7,middle:1,right:0}}),EMPTY_MEMORY_STATE,{event:"dig",random:0});
  assert.equal(result?.line.id,"memory-same-tunnel");
  assert.match(result?.line.dialogue||"",/"left\./);
  assert.doesNotMatch(result?.line.dialogue||"",/7|8|75/);
  // A different dominant direction produces a correspondingly different line, proving this is
  // computed from the actual save data rather than a single hardcoded direction.
  const rightHeavy=selectSaveAwareCommentary(context({tunnelChoices:{left:0,middle:1,right:9}}),EMPTY_MEMORY_STATE,{event:"dig",random:0});
  assert.match(rightHeavy?.line.dialogue||"",/"right\./);
});

test("continuing to overmine a completed biome is recognized, with distinct SHADEZ and PEON lines", () => {
  assert.equal(selectSaveAwareCommentary(context({completedBiomes:["old"],excessAfterCompletion:100}),EMPTY_MEMORY_STATE,{event:"dig",random:0}),null);
  const shadezResult=selectSaveAwareCommentary(context({completedBiomes:["old"],excessAfterCompletion:250}),EMPTY_MEMORY_STATE,{event:"dig",random:0,now:10});
  assert.equal(shadezResult?.line.id,"memory-post-completion-digging");
  assert.equal(shadezResult?.line.speaker,"SHADEZ");
  const peonResult=selectSaveAwareCommentary(context({digs:700,completedBiomes:["old"],excessAfterCompletion:250}),shadezResult.state,{event:"dig",random:0,now:2_000_000});
  assert.equal(peonResult?.line.id,"memory-post-completion-digging-peon");
  assert.equal(peonResult?.line.speaker,"PEON");
  assert.equal(peonResult?.line.dialogue,"Boss... why we still here? Mine done.");
});

test("artifact memory only references an artifact already present in the save",()=>{
  assert.equal(selectSaveAwareCommentary(context({digs:100,trueArtifacts:{}}),EMPTY_MEMORY_STATE,{event:"dig",random:0}),null);
  const result=selectSaveAwareCommentary(context({digs:100,trueArtifacts:{ronaldo:1}}),EMPTY_MEMORY_STATE,{event:"dig",random:0});
  assert.equal(result?.line.id,"memory-ronaldo-remains");
  assert.equal(result?.line.speaker,"PEON");
});

test("return commentary uses a real-time cooldown",()=>{
  const now=50_000_000_000;
  const first=selectSaveAwareCommentary(context({returnAfterMs:15*86_400_000}),EMPTY_MEMORY_STATE,{event:"return",now});
  assert.equal(first?.line.id,"memory-return-long");
  assert.equal(selectSaveAwareCommentary(context({returnAfterMs:40*86_400_000}),first.state,{event:"return",now:now+20*86_400_000}),null);
  assert.equal(selectSaveAwareCommentary(context({returnAfterMs:40*86_400_000}),first.state,{event:"return",now:now+31*86_400_000})?.line.id,"memory-return-long");
});

test("migration sanitizers safely default malformed legacy data",()=>{
  assert.deepEqual(sanitizeTunnelHistory({left:"4",middle:-2,right:"nope"}),{left:4,middle:0,right:0});
  assert.deepEqual(sanitizeMemoryState(null),EMPTY_MEMORY_STATE);
});

test("memory commentary is wired to yield to every major blocking presentation, never competing with them",()=>{
  const game=fs.readFileSync(new URL("../app/page.tsx",import.meta.url),"utf8");
  const digEffect=game.slice(game.indexOf("lastMemoryEvaluationDig.current=save.digs"),game.indexOf("lastMemoryEvaluationDig.current=save.digs")+400);
  for(const guard of ["tab!==\"mine\"","stage!==\"tunnel\"","found","trueFind","pendingTrue","save.forbiddenTunnel","mineCompletion","onboarding","firstPeonMoment"]){
    assert.ok(digEffect.includes(guard),`dig-triggered memory evaluation must bail out on ${guard}`);
  }
  // On the return-event path, TRUE Artifact and Volatile Ore encounters are handled in
  // dedicated branches that come before the memory-commentary branch, so restoring into
  // either state structurally skips memory evaluation entirely rather than relying on
  // one more condition to remember.
  const loadBlock=game.slice(game.indexOf("if(restored.activeTrueEncounter)"),game.indexOf("selectSaveAwareCommentary(memoryContextFor(restored"));
  assert.match(loadBlock,/if\(restored\.activeTrueEncounter\)/);
  assert.match(loadBlock,/else if\(restored\.volatileEncounter\)/);
});
