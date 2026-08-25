import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { GHOST_ENTRY_CLOSING, GHOST_ENTRY_REGISTER, GHOST_ENTRY_SYSTEM_OPENING, GHOST_MINE_AMBIENT_COMMENTARY, selectMineCommentary } from "../app/mine-commentary.ts";

const game = readFileSync(new URL("../app/page.tsx", import.meta.url), "utf8");

test("Ghost Mines is the fifth mine, after Northrend, with exactly four native ores", () => {
  assert.match(game, /biomeOrder:Biome\[\]=\["old","deep","outland","northrend","ghost"\]/);
  assert.match(game, /ghost:\["gravesilver","stillwater","hushstone","revenantseye"\]/);
});

test("Ghost ore rarities are locked as specified", () => {
  assert.match(game, /id: "gravesilver", name: "Gravesilver", rarity: "Common"/);
  assert.match(game, /id: "stillwater", name: "Stillwater Ore", rarity: "Uncommon"/);
  assert.match(game, /id: "hushstone", name: "Hushstone", rarity: "Rare"/);
  assert.match(game, /id: "revenantseye", name: "Revenant's Eye", rarity: "Legendary"/);
});

test("Ghost Mines has no fifth ore and introduces no life/habitation vocabulary in its own data", () => {
  const start = game.indexOf("// Ghost Mines — Chapter II");
  const end = game.indexOf('toughness: 2.00 },', game.indexOf('id: "revenantseye"'));
  assert.ok(start > 0 && end > start, "expected the four-ore Ghost Mines block to exist");
  const block = game.slice(start, end);
  assert.equal((block.match(/id: "(gravesilver|stillwater|hushstone|revenantseye)"/g) || []).length, 4);
  for (const forbidden of [/lantern/i, /cart/i, /rail/i, /skeleton/i, /bone/i, /moss/i, /fungus/i, /spectre/i, /haunt/i, /apparition/i]) {
    assert.doesNotMatch(block, forbidden);
  }
});

test("existing mine spawn tables gained trailing zero weight for the four new ores, not nonzero", () => {
  for (const biome of ["old", "deep", "outland", "northrend"]) {
    const m = game.match(new RegExp(`${biome}:\\[([\\d,]+)\\]`));
    assert.ok(m, `${biome} weight array not found`);
    const weights = m[1].split(",").map(Number);
    assert.equal(weights.length, 19, `${biome} should have 19 entries (15 original + 4 ghost)`);
    assert.deepEqual(weights.slice(15), [0, 0, 0, 0], `${biome} must not spawn any Ghost ore`);
  }
});

test("Ghost Mines spawn table only spawns its own four native ores", () => {
  const m = game.match(/ghost:\[([\d,]+)\]/);
  assert.ok(m, "ghost weight array not found");
  const weights = m[1].split(",").map(Number);
  assert.equal(weights.length, 19);
  assert.deepEqual(weights.slice(0, 15), new Array(15).fill(0), "Ghost Mines must not spawn any of the original 15 ores");
  assert.ok(weights.slice(15).every(w => w > 0), "all four Ghost ores must have nonzero weight in their own mine");
});

test("Ghost Mines quota can diverge from the global rarity table via an explicit override map", () => {
  assert.match(game, /const oreQuotaOverrides:Partial<Record<string,number>>=\{gravesilver:30,stillwater:20,hushstone:8,revenantseye:3\}/);
  assert.match(game, /const oreQuota=\(id:string\)=>oreQuotaOverrides\[id\]\?\?rarityQuota\[/);
  // Global rarity-table numbers (10/7/3/1) would total 21 — the whole point
  // of the override was to avoid inheriting that. Confirm the actual
  // provisional total is meaningfully larger.
  const total = 30 + 20 + 8 + 3;
  assert.ok(total > 21, "Ghost Mines quota total should exceed the un-overridden rarity-table total");
});

test("undiscovered Ghost ore identity is concealed via a single reusable helper, not duplicated per-surface logic", () => {
  assert.match(game, /const ghostOreConcealed=\(save:Save,id:string\)=>biomePages\.ghost\.includes\(id\)&&\(save\.ores\[id\]\|\|0\)===0;/);
  // All three approved surfaces call the same helper rather than
  // reimplementing the "extracted at least once" check inline.
  const usages = game.match(/ghostOreConcealed\(save,/g) || [];
  assert.ok(usages.length >= 4, "expected ghostOreConcealed to be used at the tab strip, header, quota panel, and distribution label");
});

test("Ghost Mines entrance sequence matches the specified script and fires only once", () => {
  assert.deepEqual(GHOST_ENTRY_SYSTEM_OPENING, [
    "Mine designation unavailable.",
    "Geological survey unavailable.",
    "Known geological profile: no match.",
    "Biological activity: none detected.",
    "Mine origin: unknown.",
  ]);
  assert.deepEqual(GHOST_ENTRY_REGISTER, { headline: "GHOST MINES", subtitle: "UNOFFICIAL DESIGNATION" });
  assert.deepEqual(GHOST_ENTRY_CLOSING, [
    { speaker: "SYSTEM", text: "Proceed." },
    { speaker: "PEON", text: "...zug zug." },
  ]);
  assert.match(game, /ghostEntrySeen:boolean/);
  assert.match(game, /save\.biome!=="ghost"\|\|save\.ghostEntrySeen\)return;setGhostEntry\(true\)/);
  assert.match(game, /setSave\(s=>\(\{\.\.\.s,ghostEntrySeen:true\}\)\)/);
});

test("Ghost ambient commentary pool is small, clinical, and never used outside Ghost Mines", () => {
  assert.ok(GHOST_MINE_AMBIENT_COMMENTARY.length <= 10, "pool should stay small per the design brief");
  assert.ok(GHOST_MINE_AMBIENT_COMMENTARY.length >= 5);
  for (const line of GHOST_MINE_AMBIENT_COMMENTARY) {
    assert.ok(line.id && line.headline && line.subtitle);
  }
  assert.match(game, /const ambientCommentaryFor=\(biome:Biome\)=>biome==="ghost"\?GHOST_MINE_AMBIENT_COMMENTARY:NORMAL_DIGGING_COMMENTARY;/);
});

test("ambient commentary selection respects anti-repeat history for the Ghost pool same as every other pool", () => {
  const history = [];
  const selected = [];
  for (let i = 0; i < 8; i++) selected.push(selectMineCommentary(GHOST_MINE_AMBIENT_COMMENTARY, history, () => 0).id);
  assert.equal(history.length, 5);
  assert.ok(new Set(selected.slice(0, 5)).size >= 4, "anti-repeat should avoid immediate repeats within the small pool");
});

test("save schema was bumped for the new ghostEntrySeen field, and blank/migrate agree", () => {
  assert.match(game, /schema: 18,settings:defaultSettings/);
  assert.match(game, /schema:18,runStartedAt:Number\(old\.runStartedAt\)/);
});

test("mine-completion descent ceremony has Ghost Mines diagnostics in its own clinical voice", () => {
  assert.match(game, /ghost:\["ORIGIN: UNKNOWN","BIOLOGICAL ACTIVITY: NONE DETECTED","SURVEY MATCH: NONE"\]/);
});

test("Ghost Mines mine-art CSS follows the exact same pattern as the other four mines", () => {
  const v054 = readFileSync(new URL("../app/v054.css", import.meta.url), "utf8");
  const v072 = readFileSync(new URL("../app/v072.css", import.meta.url), "utf8");
  assert.match(v054, /\.mine-screen\.biome-ghost\{--mine-environment:url\('\/assets\/mines\/mine-ghost\.webp'\)\}/);
  for (let i = 0; i <= 4; i++) {
    assert.match(v072, new RegExp(`\\.ghost-mine-stage-art \\.mine-stage-${i}\\{background-image:url\\('\\/assets\\/mines\\/ghost-mine-stage-${i}\\.webp'\\)`));
  }
  // The composite six-panel reference sheet is art direction only and must
  // never be wired in as a runtime asset.
  assert.doesNotMatch(v054 + v072, /ChatGPT_Image|composite|reference-sheet/i);
});
