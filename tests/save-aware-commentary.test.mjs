import test from "node:test";
import assert from "node:assert/strict";
import {
  EMPTY_MEMORY_STATE,
  EMPTY_TUNNEL_HISTORY,
  sanitizeMemoryState,
  sanitizeTunnelHistory,
  selectSaveAwareCommentary,
} from "../app/save-aware-commentary.ts";

const context=(overrides={})=>({
  digs:600,emptyDigs:0,misses:0,strikes:1200,criticalStrikes:0,perfectStrikes:10,
  ores:{},completedBiomes:[],tunnelChoices:{...EMPTY_TUNNEL_HISTORY},trueArtifacts:{},
  excessAfterCompletion:0,...overrides,
});

test("high-priority personal history is selected and persisted once",()=>{
  const result=selectSaveAwareCommentary(context({ores:{copper:500}}),EMPTY_MEMORY_STATE,{event:"dig",random:0,now:10});
  assert.equal(result?.line.id,"memory-copper-medical");
  assert.equal(result?.line.speaker,"SHADEZ");
  assert.equal(result?.state.seen["copper-medical"],600);
  assert.equal(selectSaveAwareCommentary(context({digs:700,ores:{copper:600}}),result.state,{event:"dig",random:0,now:20}),null);
});

test("global dig cooldown and rarity gate prevent commentary spam",()=>{
  const state={seen:{},lastShownAtDig:580,lastShownAt:1};
  assert.equal(selectSaveAwareCommentary(context({ores:{copper:500}}),state,{event:"dig",random:0}),null);
  assert.equal(selectSaveAwareCommentary(context({digs:700,ores:{copper:500}}),EMPTY_MEMORY_STATE,{event:"dig",random:.9}),null);
});

test("repeated tunnel behavior is recognized without exposing counts",()=>{
  const result=selectSaveAwareCommentary(context({tunnelChoices:{left:7,middle:1,right:0}}),EMPTY_MEMORY_STATE,{event:"dig",random:0});
  assert.equal(result?.line.id,"memory-same-tunnel");
  assert.match(result?.line.dialogue||"",/Superstition/);
  assert.doesNotMatch(result?.line.dialogue||"",/7|8|75/);
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
