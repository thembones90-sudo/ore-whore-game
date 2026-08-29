import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const game = readFileSync(new URL("../app/page.tsx", import.meta.url), "utf8");
const css = readFileSync(new URL("../app/v108.css", import.meta.url), "utf8");
const layout = readFileSync(new URL("../app/layout.tsx", import.meta.url), "utf8");

test("v108.css is imported exactly once, after v107.css", () => {
  assert.match(layout, /import "\.\/v107\.css";\nimport "\.\/v108\.css";/);
});

test("impactTexts is an independent array, not a replacement for lastHitKind's own effect on the rock", () => {
  assert.match(game, /const \[impactTexts,setImpactTexts\]=useState<\{id:number;x:number;y:number;kind:"miss"\|"normal"\|"perfect"\|"crit"\|"perfectCrit";label:string;sublabel\?:string;rise:number;drift:number\}\[\]>\(\[\]\);/);
  // lastHitKind must still exist and still drive the rock's own hit-* class —
  // this redesign only replaces what renders as floating TEXT.
  assert.match(game, /const \[lastHitKind,setLastHitKind\]=useState<"normal"\|"perfect"\|"crit"\|"perfectCrit"\|"miss"\|null>\(null\);/);
  assert.match(game, /hit-\$\{lastHitKind===\"perfectCrit\"\?\"perfect-crit\":lastHitKind\}/);
});

test("every strike outcome spawns floating text at the real click point, not the hover-tracked pointer position", () => {
  const calls = game.match(/spawnImpactText\([^)]*\)/g) || [];
  assert.equal(calls.length, 3, "miss, the combined perfect/crit/perfectCrit branch (one call using hitKind), and the normal-hit branch");
  for (const call of calls) {
    assert.match(call, /strikePoint\.x,strikePoint\.y/, `expected ${call} to use strikePoint, not hitPoint`);
  }
});

test("spawnImpactText rolls rise (40\u201370px) and drift once per spawn, and caps the list instead of growing unbounded", () => {
  const start = game.indexOf("const spawnImpactText=");
  const end = game.indexOf("};", start);
  const body = game.slice(start, end);
  assert.match(body, /const rise=40\+Math\.random\(\)\*30/, "40 + up to 30 = 40\u201370px range");
  assert.match(body, /const drift=Math\.random\(\)\*40-20/);
  assert.match(body, /list\.slice\(-9\)/, "list must be capped, not allowed to grow without bound under rapid clicking");
  assert.match(body, /setTimeout\(\(\)=>setImpactTexts\(list=>list\.filter\(t=>t\.id!==id\)\),1500\)/, "each instance must clean itself up, not persist forever");
});

test("the old single-slot MISS presentation (missFlash) is fully removed, not left half-wired", () => {
  assert.doesNotMatch(game, /missFlash/, "missFlash and its setter must be gone entirely \u2014 the commentary line now travels as impactTexts' sublabel");
});

test("VEIN and TRUE ARTEFACT keep their original boxed hit-callout presentation \u2014 out of scope for this pass", () => {
  assert.match(game, /\{specialHitNotice&&<span className=\{`hit-callout hit-callout-\$\{specialHitNotice\}`\} role="status">\{specialHitNotice==="artifact"\?"TRUE ARTEFACT":"VEIN"\}<\/span>\}/);
});

test("PERFECT CRITICAL renders as two independently colored words, not one flat-colored phrase", () => {
  assert.match(game, /<b className="impact-text-perfect-word">PERFECT<\/b> <b className="impact-text-crit-word">CRITICAL<\/b>/);
  assert.match(css, /\.impact-text-perfectCrit \.impact-text-perfect-word\{color:#C8FF3D\}/);
  assert.match(css, /\.impact-text-perfectCrit \.impact-text-crit-word\{color:#FF8A32\}/);
});

test("locked color language is implemented exactly as specified", () => {
  assert.match(css, /\.impact-text-miss\{color:#D95C59/);
  assert.match(css, /\.impact-text-normal\{color:#E8E0D0/);
  assert.match(css, /\.impact-text-crit\{color:#FF8A32/);
  assert.match(css, /\.impact-text-perfect\{color:#C8FF3D/);
  assert.match(css, /#FFD45A/, "the gold glow color must appear somewhere in the Perfect Critical treatment");
});

test("the floating text container carries no frame, border, or background panel", () => {
  const start = css.indexOf(".impact-text{");
  const end = css.indexOf("}", start);
  const rule = css.slice(start, end);
  for (const forbidden of [/border:/, /background:/, /box-shadow:/, /padding:/]) {
    assert.doesNotMatch(rule, forbidden, `.impact-text base rule must not include ${forbidden}`);
  }
});

test("the animation moves via transform only, never top/left, so it cannot cause layout reflow", () => {
  const keyframeBlocks = css.match(/@keyframes impact-text-float[\s\S]*?\}\n\}/g) || [];
  assert.ok(keyframeBlocks.length >= 2, "expected both the base and the punch keyframes");
  for (const block of keyframeBlocks) {
    assert.doesNotMatch(block, /\btop:|:\s*left:/, "keyframes must animate transform, not top/left");
    assert.match(block, /transform:/);
  }
});

test("pointer-events:none on the floating text so it can never interfere with clicking/digging", () => {
  assert.match(css, /\.impact-text\{[^}]*pointer-events:none/);
});

test("reduced motion is respected independently of whether the effect exists at all", () => {
  assert.match(css, /@media\(prefers-reduced-motion:reduce\)\{\s*\.impact-text\{animation-duration:\.4s\}\s*\}/);
});

test("this redesign does not touch mining probabilities, timing, damage, or ore HP \u2014 presentation only", () => {
  const start = game.indexOf("const strike = (point");
  const end = game.indexOf("const hit = rockHp - damage;", start) + 40;
  const strikeLogic = game.slice(start, end);
  // Confirms the actual gameplay constants/formula referenced by strike() are
  // still the same named values this pass was never supposed to touch.
  assert.match(strikeLogic, /MISS_CHANCE/);
  assert.match(strikeLogic, /CRIT_CHANCE/);
  assert.match(strikeLogic, /isPerfect && isCrit \? 3 : \(isPerfect \|\| isCrit\) \? 2 : 1/, "damage formula must be byte-for-byte unchanged");
  assert.match(strikeLogic, /tool\.damage/);
});

test("TRUE Artifact and Volatile logic are not referenced anywhere in the new impact-text code", () => {
  const start = game.indexOf("const [impactTexts,setImpactTexts]");
  const end = game.indexOf("const spawnImpactText=") + game.slice(game.indexOf("const spawnImpactText=")).indexOf("};") + 2;
  const block = game.slice(start, end);
  assert.doesNotMatch(block, /trueArtifact|Volatile/i);
});
