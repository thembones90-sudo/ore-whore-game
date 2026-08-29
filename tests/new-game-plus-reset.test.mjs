import test from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";

const page=readFileSync(new URL("../app/page.tsx",import.meta.url),"utf8");

test("New Game+ resets TRUE Artefact collection and encounter state",()=>{
  const start=page.indexOf("const startNewGamePlus=");
  const end=page.indexOf("return <main",start);
  const handler=page.slice(start,end);
  assert.ok(start>=0&&end>start);
  assert.doesNotMatch(handler,/trueArtifacts:s\.trueArtifacts/);
  assert.doesNotMatch(handler,/trueFirst:s\.trueFirst/);
  assert.match(handler,/setPendingTrue\(null\)/);
  assert.match(handler,/setTrueFind\(null\)/);
  assert.match(handler,/asocTickets:s\.asocTickets/);
  assert.match(handler,/unlocks:s\.unlocks/);
});

// The wormhole is the in-world reason distance and every ordinary progression
// counter reset on NG+ — this test locks that as intentional, not accidental,
// by confirming the reset spreads `blank` (distance:0) first and only the
// curated preserved fields are explicitly re-applied afterward.
test("New Game+ resets distance (the current descent) to zero and correctly increments newGamePlusLevel",()=>{
  const start=page.indexOf("const startNewGamePlus=");
  const end=page.indexOf("return <main",start);
  const handler=page.slice(start,end);
  assert.match(handler,/setSave\(s=>\(\{\.\.\.blank,/,"must spread blank first, so distance:0 and every other unlisted field resets");
  assert.match(handler,/newGamePlusLevel:s\.newGamePlusLevel\+1/);
  assert.doesNotMatch(handler,/distance:s\.distance/,"distance must never be explicitly re-preserved — the reset is the whole point");
});

test("New Game+ preserves the existing curated permanent-state list, unchanged",()=>{
  const start=page.indexOf("const startNewGamePlus=");
  const end=page.indexOf("return <main",start);
  const handler=page.slice(start,end);
  for(const preserved of ["playerName:s.playerName","settings:s.settings","unlocks:s.unlocks","equipped:s.equipped","toolSkinId:s.toolSkinId","achievements:s.achievements","completionCount:s.completionCount","asocTickets:s.asocTickets","firstCompletionDate:s.firstCompletionDate","latestCompletionDate:s.latestCompletionDate","completionHistory:s.completionHistory"]){
    assert.ok(handler.includes(preserved),`expected ${preserved} to remain in the preserved-state list`);
  }
});

test("New Game+ does not touch TRUE Artifact chance, spawn weights, or any probability table",()=>{
  const start=page.indexOf("const startNewGamePlus=");
  const end=page.indexOf("return <main",start);
  const handler=page.slice(start,end);
  for(const forbidden of ["trueArtifactChance","depthWeights","biomeWeights","CANONICAL_EXCAVATION_PROBABILITIES","VOLATILE_TRIGGER_RATES"]){
    assert.doesNotMatch(handler,new RegExp(forbidden),`startNewGamePlus must never reference ${forbidden} — depth/loop presentation must stay isolated from probability`);
  }
});

test("New Game+ does not regress Ghost Mines progression state — unlockedBiomes and ghost flags reset with everything else, not specially preserved",()=>{
  const start=page.indexOf("const startNewGamePlus=");
  const end=page.indexOf("return <main",start);
  const handler=page.slice(start,end);
  assert.doesNotMatch(handler,/unlockedBiomes:s\.unlockedBiomes/);
  assert.doesNotMatch(handler,/ghostEntrySeen:s\.ghostEntrySeen/);
  assert.doesNotMatch(handler,/completedBiomes:s\.completedBiomes/);
});

test("the wormhole-arrival dialogue is a local, non-persisted UI flag — not a new save field",()=>{
  assert.match(page,/const \[wormholeArrival,setWormholeArrival\]=useState\(false\)/);
  assert.doesNotMatch(page,/wormholeArrival:/,"wormholeArrival must never appear as a Save field — newGamePlusLevel alone must drive the content");
  const start=page.indexOf("const startNewGamePlus=");
  const end=page.indexOf("return <main",start);
  assert.match(page.slice(start,end),/setWormholeArrival\(true\)/);
});

test("wormhole-arrival content varies by newGamePlusLevel: first loop gets the distortion beat and the exact canonical exchange, later loops do not",()=>{
  const start=page.indexOf("function WormholeArrival");
  const end=page.indexOf("\n}",start)+2;
  const component=page.slice(start,end);
  assert.match(component,/level<=1&&<small className="wormhole-distortion">/,"only the first loop shows the atmospheric distortion beat");
  assert.match(component,/Boss! Peon ready first day!/);
  assert.match(component,/level<=1\?"\.\.\."/,"first loop: SHADEZ says nothing more than an ellipsis");
  assert.match(component,/level===2\?"\.\.\.Again\."/,"second loop: a short escalation, still no explanation");
  assert.match(component,/"Sure you are\."/,"third loop and beyond: SHADEZ stops even pretending");
  assert.doesNotMatch(component,/>[^<]*wormhole[^<]*</i,"the word must never appear in rendered text content — the scene shows it, never names it (class names are implementation detail, not player-visible)");
  assert.doesNotMatch(component,/time loop|amnesia|reset your memory|previous loop/i,"SHADEZ must never explain the mechanism");
});

// startNewGamePlus itself is unchanged in shape (see the tests above — they
// already cover distance:0, newGamePlusLevel+1, and the full preserved-state
// list). These tests cover the NEW thing: the reset is no longer called
// directly from the confirm button, it's deferred behind a short local-only
// transition, and it must never be duplicated in the process.
test("confirming NG+ starts the wormhole transition, not the reset, directly",()=>{
  assert.match(page,/onClick=\{enterWormhole\}>BEGIN NEW GAME\+/,"the confirm button must call enterWormhole, not startNewGamePlus, directly");
  assert.doesNotMatch(page,/onClick=\{startNewGamePlus\}/,"startNewGamePlus must never be wired directly to a click handler");
});

test("the NG+ reset logic itself exists exactly once in the file — never duplicated into a second copy",()=>{
  const resetSignature=(page.match(/\{\.\.\.blank,playerName:s\.playerName,employmentAgreementSigned:true,employmentGreetingSeen:true/g)||[]).length;
  const definitions=(page.match(/const startNewGamePlus=/g)||[]).length;
  const setTimeoutCalls=(page.match(/window\.setTimeout\(startNewGamePlus,/g)||[]).length;
  assert.equal(resetSignature,1,"the reset's actual field-spread logic must exist in exactly one place");
  assert.equal(definitions,1);
  assert.equal(setTimeoutCalls,1,"exactly one deferred call site — the enterWormhole timeout — and no other invocation");
});

test("enterWormhole guards against a double-trigger and defers the actual reset behind a timeout, shorter under reduced motion",()=>{
  const start=page.indexOf("const enterWormhole=");
  const end=page.indexOf(";\n",start)+1;
  const handler=page.slice(start,end);
  assert.match(handler,/if\(wormholeTransition\)return/,"a second click while already transitioning must be a no-op, not a stacked transition");
  assert.match(handler,/setWormholeTransition\(true\)/);
  assert.match(handler,/playImpact\("wormhole"\)/);
  assert.match(handler,/window\.setTimeout\(startNewGamePlus,save\.settings\.reducedMotion\?260:1400\)/,"reduced motion must use a materially shorter defer than normal play");
});

test("the reset clears the transition and opens the arrival scene — transition, then reset, then arrival, in that order",()=>{
  const start=page.indexOf("const startNewGamePlus=");
  const end=page.indexOf(";\n",start)+1;
  const handler=page.slice(start,end);
  const transitionOff=handler.indexOf("setWormholeTransition(false)");
  const arrivalOn=handler.indexOf("setWormholeArrival(true)");
  assert.ok(transitionOff>=0&&arrivalOn>=0);
  assert.ok(transitionOff<arrivalOn,"the transition must be cleared before the arrival scene opens, not after");
});

test("wormholeTransition is local-only React state, never a Save field",()=>{
  assert.match(page,/const \[wormholeTransition,setWormholeTransition\]=useState\(false\)/);
  assert.doesNotMatch(page,/wormholeTransition:/,"wormholeTransition must never appear as a Save field");
});

test("the wormhole transition overlay renders once, keyed to the single wormholeTransition flag, with no persisted state or player-visible label",()=>{
  assert.match(page,/\{wormholeTransition&&<WormholeTransition\/>\}/);
  const start=page.indexOf("function WormholeTransition");
  const end=page.indexOf("\n\n",start);
  const component=page.slice(start,end);
  assert.match(component,/className="wormhole-transition"/);
  assert.match(component,/aria-hidden="true"/,"purely visual — must not be announced as meaningful content to assistive tech");
});

test("the wormhole transition CSS ships in the final stylesheet layer and provides a materially shorter duration for both the in-game and OS-level reduced-motion paths",()=>{
  const layout=readFileSync(new URL("../app/layout.tsx",import.meta.url),"utf8");
  const css=readFileSync(new URL("../app/v107.css",import.meta.url),"utf8");
  assert.match(layout,/import "\.\/v107\.css";/);
  assert.match(css,/\.wormhole-transition\{[^}]*animation:wormhole-collapse 1\.4s/);
  assert.match(css,/\.reduced-motion \.wormhole-transition\{animation-duration:\.26s\}/);
  assert.match(css,/@media\(prefers-reduced-motion:reduce\)\{\.wormhole-transition\{animation-duration:\.26s\}\}/);
});

