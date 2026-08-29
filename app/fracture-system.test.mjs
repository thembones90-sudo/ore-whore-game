import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { FRACTURE_VARIANTS, fractureVariantsForTier } from "../app/fracture-variants.ts";

const game = readFileSync(new URL("../app/page.tsx", import.meta.url), "utf8");
const v053 = readFileSync(new URL("../app/v053.css", import.meta.url), "utf8");
const v066 = readFileSync(new URL("../app/v066.css", import.meta.url), "utf8");
const v109 = readFileSync(new URL("../app/v109.css", import.meta.url), "utf8");
const v093 = readFileSync(new URL("../app/v093.css", import.meta.url), "utf8");
const layout = readFileSync(new URL("../app/layout.tsx", import.meta.url), "utf8");

test("v109.css is imported exactly once, after v108.css", () => {
  assert.match(layout, /import "\.\/v108\.css";\nimport "\.\/v109\.css";/);
});

test("nine fracture variants exist, distributed across all four severity tiers", () => {
  assert.equal(FRACTURE_VARIANTS.length, 9);
  assert.equal(fractureVariantsForTier("hit").length, 3);
  assert.equal(fractureVariantsForTier("perfect").length, 2);
  assert.equal(fractureVariantsForTier("crit").length, 2);
  assert.equal(fractureVariantsForTier("perfectCrit").length, 2);
});

test("variants within a tier are genuinely different shapes, not the same branches duplicated", () => {
  for (const tier of ["hit", "perfect", "crit", "perfectCrit"]) {
    const variants = fractureVariantsForTier(tier);
    const signatures = variants.map(v => v.branches.join("|"));
    assert.equal(new Set(signatures).size, signatures.length, `${tier} variants must not share identical branch data`);
  }
});

test("every branch is a genuinely asymmetric multi-point path anchored at the origin, not a simple radial line", () => {
  for (const variant of FRACTURE_VARIANTS) {
    for (const branch of variant.branches) {
      assert.match(branch, /^M0,0 L/, `${variant.id} branch must start at the impact origin (0,0)`);
      const points = branch.match(/L-?\d+,-?\d+/g) || [];
      assert.ok(points.length >= 2, `${variant.id} branch should have at least 2 segments to read as a jagged crack, not a straight line: ${branch}`);
    }
  }
});

test("higher severity tiers have progressively more branches on average than HIT", () => {
  const avgBranches = tier => {
    const variants = fractureVariantsForTier(tier);
    return variants.reduce((sum, v) => sum + v.branches.length, 0) / variants.length;
  };
  assert.ok(avgBranches("hit") < avgBranches("crit"), "CRITICAL should read as more damaged than a plain HIT");
  assert.ok(avgBranches("crit") <= avgBranches("perfectCrit"), "PERFECT CRITICAL should be at least as branchy as CRITICAL");
});

test("only CRITICAL and PERFECT CRITICAL variants carry chip debris \u2014 HIT and PERFECT stay clean", () => {
  for (const variant of fractureVariantsForTier("hit")) assert.equal(variant.chips, undefined, `${variant.id} (HIT) must not have chips`);
  for (const variant of fractureVariantsForTier("perfect")) assert.equal(variant.chips, undefined, `${variant.id} (PERFECT) must not have chips`);
  for (const variant of fractureVariantsForTier("crit")) assert.ok(variant.chips && variant.chips.length > 0, `${variant.id} (CRITICAL) should have chip debris`);
  for (const variant of fractureVariantsForTier("perfectCrit")) assert.ok(variant.chips && variant.chips.length > 0, `${variant.id} (PERFECT CRITICAL) should have chip debris`);
});

test("MISS produces no structural fracture \u2014 setFractures is never reachable from the miss branch", () => {
  const missStart = game.indexOf("if (isMiss) {");
  const missEnd = game.indexOf("consecutiveMisses.current = 0;", missStart);
  assert.ok(missStart > 0 && missEnd > missStart);
  const missBlock = game.slice(missStart, missEnd);
  assert.doesNotMatch(missBlock, /setFractures/, "a miss must never push a fracture \u2014 only a scrape/dust response, per the design brief");
});

test("fracture severity is derived directly from the strike's own hitKind, with no separate duplicated conditional tree", () => {
  const start = game.indexOf("const fractureTier:FractureTier=");
  const end = game.indexOf(";", start) + 1;
  assert.match(game.slice(start, end), /hitKind==="normal"\?"hit":hitKind/, "normal maps to hit, every other hitKind value is already a valid FractureTier by construction \u2014 no separate if/else chain needed");
});

test("each spawned fracture rolls rotation, scale, flip, and opacity independently, and the list is capped", () => {
  const start = game.indexOf("setFractures(current=>[...current.slice(-11)");
  const end = game.indexOf(";", start) + 1;
  const call = game.slice(start, end);
  assert.match(call, /rotation:Math\.random\(\)\*360/);
  assert.match(call, /scale:\.85\+Math\.random\(\)\*\.3/, "0.85\u20131.15 scale range, matching spec");
  assert.match(call, /flipX:Math\.random\(\)<\.5/);
  assert.match(call, /opacity:\.72\+Math\.random\(\)\*\.2/);
  assert.match(call, /current\.slice\(-11\)/, "the fracture list must stay capped under rapid clicking");
});

test("the fracture render picks the actual selected variant and renders its real branches/chips, not a fixed shape", () => {
  assert.match(game, /FRACTURE_VARIANTS\.find\(v=>v\.id===f\.variantId\)/);
  assert.match(game, /variant\.branches\.map\(\(d,i\)=><path key=\{i\} d=\{d\}/);
  assert.match(game, /variant\.chips\?\.map\(\(c,i\)=><circle key=\{i\} cx=\{c\.cx\} cy=\{c\.cy\} r=\{c\.r\}/);
});

test("the old rigid two-branch crack (persistent-fracture / fracture-power) is fully removed, not left as dead duplicate CSS", () => {
  for (const file of [v053, v066, v109]) {
    assert.doesNotMatch(file, /persistent-fracture/);
    assert.doesNotMatch(file, /fracture-power/);
  }
  assert.doesNotMatch(game, /persistent-fracture|fracture-power/);
});

test("every dead MISS/HIT/CRITICAL/PERFECT-specific rule and keyframe is gone \u2014 only the still-live VEIN/TRUE-ARTEFACT base and variant classes remain", () => {
  const v049 = readFileSync(new URL("../app/v049.css", import.meta.url), "utf8");
  const v057 = readFileSync(new URL("../app/v057.css", import.meta.url), "utf8");
  const v081 = readFileSync(new URL("../app/v081.css", import.meta.url), "utf8");
  const allFiles = [v049, v057, v081, v093];
  for (const file of allFiles) {
    assert.doesNotMatch(file, /\.miss-bark/, "miss-bark is fully dead \u2014 no JSX renders it anymore");
    assert.doesNotMatch(file, /hit-callout-normal|hit-callout-perfect\b|hit-callout-crit\b|hit-callout-perfectCrit/, "these variant classes are never rendered anymore");
    assert.doesNotMatch(file, /calloutPop|missIn\b|missOut\b|\bstrikeReadout\b/, "dead keyframes, superseded by strike-readout (hyphenated) which is still the live one");
  }
  // The base .hit-callout class and its still-live vein/artifact variants
  // must remain \u2014 those are not stale, they're the surviving feature.
  assert.match(v093, /\.hit-callout-vein/);
  assert.match(v093, /\.hit-callout-artifact/);
  assert.match(v093, /@keyframes strike-readout/, "the hyphenated keyframe is the one actually winning the cascade and must stay");
});

test("pickaxe tip-anchor: transform-origin and translate now target the metal tip (~5%,50%), not the sprite's geometric center", () => {
  assert.match(v066, /transform-origin:5% 50%!important/);
  assert.match(v066, /translate:-5% -50%!important/);
  assert.doesNotMatch(v066, /transform-origin:50% 50%!important/, "the old center-anchor value must be gone, not just superseded");
});

test("the pickaxe's own left/top still track the real strike coordinate \u2014 the tip-anchor fix did not touch that wiring", () => {
  const v046 = readFileSync(new URL("../app/v046.css", import.meta.url), "utf8");
  assert.match(v046, /\.pickaxe\{[^}]*left:var\(--hit-x\)!important;top:var\(--hit-y\)!important/);
});

test("this pass does not touch mining probabilities, timing, or damage \u2014 fracture selection reads hitKind, it does not compute it", () => {
  assert.match(game, /const hitKind = isPerfect && isCrit \? "perfectCrit" : isPerfect \? "perfect" : isCrit \? "crit" : "normal";/);
  assert.match(game, /const damage = \(isPerfect && isCrit \? 3 : \(isPerfect \|\| isCrit\) \? 2 : 1\)\*tool\.damage\*\(currentBerserk\?\.damageMultiplier\|\|1\);/);
});

test("no new runtime dependency was introduced \u2014 fracture-variants.ts has zero imports", () => {
  const variantsSrc = readFileSync(new URL("../app/fracture-variants.ts", import.meta.url), "utf8");
  assert.doesNotMatch(variantsSrc, /^import /m);
});
