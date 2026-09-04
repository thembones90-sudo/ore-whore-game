import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const game = readFileSync(new URL("../app/page.tsx", import.meta.url), "utf8");

test("Moon Base is the sixth mine, immediately after Ghost Mines, with exactly four native ores in the locked canonical order", () => {
  assert.match(game, /biomeOrder:Biome\[\]=\["old","deep","outland","northrend","ghost","moon"\]/);
  assert.match(game, /moon:\["chromite","helion","heartofiron","zyn"\]/, "ore order is canon: Chromite → Helion → Heart of Iron → Zyn, not reordered by rarity");
});

test("exactly four Moon ores exist, no fifth invented", () => {
  const start = game.indexOf("// Moon Base — Chapter III");
  const end = game.indexOf("];", game.indexOf('id: "zyn"'));
  assert.ok(start > 0 && end > start, "expected the four-ore Moon block to exist");
  const block = game.slice(start, end);
  assert.equal((block.match(/id: "(chromite|helion|heartofiron|zyn)"/g) || []).length, 4);
});

test("Moon Base and Heart of the Hollow have their canonical display names", () => {
  assert.match(game, /moon:"MOON BASE"/);
  assert.match(game, /ghost:"HEART OF THE HOLLOW"/);
});

test("Moon's own spawn table only spawns its own four native ores, and no other biome spawns a Moon ore", () => {
  const m = game.match(/moon:\[([\d,]+)\]/);
  assert.ok(m, "moon weight array not found");
  const weights = m[1].split(",").map(Number);
  assert.equal(weights.length, 23, "15 original + 4 ghost + 4 moon");
  assert.deepEqual(weights.slice(0, 19), new Array(19).fill(0), "Moon must not spawn any of the original 15 ores or any Ghost ore");
  assert.ok(weights.slice(19).every(w => w > 0), "all four Moon ores must have nonzero weight in their own biome");
});

test("Moon ore rarities mirror Ghost's Common\u2192Legendary shape (a provisional, documented choice, not final balancing)", () => {
  assert.match(game, /id: "chromite", name: "Chromite", rarity: "Common"/);
  assert.match(game, /id: "helion", name: "Helion", rarity: "Uncommon"/);
  assert.match(game, /id: "heartofiron", name: "Heart of Iron", rarity: "Rare"/);
  assert.match(game, /id: "zyn", name: "Zyn", rarity: "Legendary"/);
});

test("Moon has no final extraction quota or shaft-tier gate yet \u2014 falls through to existing generic defaults, same as Ghost did before its own quota was finalized", () => {
  const start = game.indexOf("const progressionQuotaOverrides:");
  const end = game.indexOf(";\n", start);
  const overrides = game.slice(start, end);
  for (const oreId of ["chromite", "helion", "heartofiron", "zyn"]) {
    assert.doesNotMatch(overrides, new RegExp(`${oreId}:`), `${oreId} must not have a final quota override yet`);
  }
  assert.doesNotMatch(game, /mineRequiredShaftRating:Partial<Record<Biome,1\|2\|3\|4>>=\{[^}]*moon/, "Moon must not have a shaft-tier gate invented yet");
});

test("Moon save state exists, defaults safely, and is distinct from the NG+ wormhole state", () => {
  assert.match(game, /moonStranded:boolean;moonStage:number \};/, "both fields must exist on the Save type");
  assert.match(game, /moonStranded:false,moonStage:0 \};/, "blank must default both safely");
  // Distinctness from the NG+ time-loop wormhole is a hard requirement from
  // the design brief: different identifiers, different code path entirely.
  assert.doesNotMatch(game, /moonWormhole/, "explicit Moon-specific wormhole naming does not exist yet \u2014 nothing to implement this phase, but must never silently reuse the generic name either");
  const moonTrigger = game.slice(game.indexOf("Moon Base foundation only: the persisted flag"), game.indexOf("Moon Base foundation only: the persisted flag") + 700);
  assert.doesNotMatch(moonTrigger, /wormholeArrival|wormholeTransition/, "Moon's arrival trigger must not read or write any NG+ wormhole state");
});

test("existing saves migrate safely: a save with no moonStranded/moonStage falls through to blank's defaults, not a crash or undefined", () => {
  const start = game.indexOf("let provisional={...blank,...safeOld,");
  assert.ok(start > 0, "migration must still spread blank first, so any field an old save lacks \u2014 including the two new Moon fields \u2014 defaults safely");
});

test("Ghost Mines progression, quota, and concealment are untouched by the Moon addition", () => {
  assert.match(game, /gravesilver:90,stillwater:55,hushstone:30,revenantseye:15/, "Ghost's quota must be exactly what was approved, unchanged");
  assert.match(game, /const ghostOreConcealed=\(save:Save,id:string\)=>biomePages\.ghost\.includes\(id\)&&\(save\.ores\[id\]\|\|0\)===0;/);
});

test("Volatile Ore's independent mine-type union was extended consistently, with Moon's rate left inert (0) rather than a fabricated real balancing number", () => {
  const volatile = readFileSync(new URL("../app/volatile-ores.ts", import.meta.url), "utf8");
  assert.match(volatile, /export type VolatileMine="old"\|"deep"\|"outland"\|"northrend"\|"ghost"\|"moon";/);
  assert.match(volatile, /moon:0\}/, "Moon's Volatile Ore trigger rate must be exactly 0 \u2014 inert, not a real tuning decision");
});
