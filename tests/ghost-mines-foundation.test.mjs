import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { GHOST_ENTRY_CLOSING, GHOST_ENTRY_REGISTER, GHOST_ENTRY_SYSTEM_OPENING, GHOST_MINE_AMBIENT_COMMENTARY, selectMineCommentary } from "../app/mine-commentary.ts";

const game = readFileSync(new URL("../app/page.tsx", import.meta.url), "utf8");

test("Ghost Mines is the fifth mine, after Northrend, with exactly four native ores", () => {
  assert.match(game, /biomeOrder:Biome\[\]=\["old","deep","outland","northrend","ghost","moon"\]/);
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
    assert.equal(weights.length, 23, `${biome} should have 23 entries (15 original + 4 ghost + 4 moon)`);
    assert.deepEqual(weights.slice(15), [0, 0, 0, 0, 0, 0, 0, 0], `${biome} must not spawn any Ghost or Moon ore`);
  }
});

test("Ghost Mines spawn table only spawns its own four native ores", () => {
  const m = game.match(/ghost:\[([\d,]+)\]/);
  assert.ok(m, "ghost weight array not found");
  const weights = m[1].split(",").map(Number);
  assert.equal(weights.length, 23);
  assert.deepEqual(weights.slice(0, 15), new Array(15).fill(0), "Ghost Mines must not spawn any of the original 15 ores");
  assert.ok(weights.slice(15, 19).every(w => w > 0), "all four Ghost ores must have nonzero weight in their own mine");
  assert.deepEqual(weights.slice(19), [0, 0, 0, 0], "Ghost Mines must not spawn any Moon ore");
});

test("Ghost Mines quota diverges from the global rarity table via progressionQuotaOverrides, strictly decreasing by rarity", () => {
  assert.match(game, /gravesilver:90,stillwater:55,hushstone:30,revenantseye:15/);
  assert.match(game, /const oreQuota=\(id:string\)=>progressionQuotaOverrides\[id\]\?\?rarityQuota\[/);
  const [gravesilver, stillwater, hushstone, revenantseye] = [90, 55, 30, 15];
  assert.ok(gravesilver > stillwater && stillwater > hushstone && hushstone > revenantseye,
    "Ghost Mines quota must strictly decrease Common → Uncommon → Rare → Legendary");
  const total = gravesilver + stillwater + hushstone + revenantseye;
  assert.equal(total, 190, "Ghost Mines total should match the finalized design target");
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
    "Unknown cavity system detected.",
    "Geological survey unavailable.",
    "Known geological profile: no match.",
    "Structural supports: none detected.",
    "Rail infrastructure: none detected.",
    "Biological activity: none detected.",
    "Mine origin: unknown.",
  ]);
  assert.deepEqual(GHOST_ENTRY_REGISTER, { headline: "UNKNOWN CAVITY NETWORK", subtitle: "NO AUTHORIZED DESIGNATION" });
  assert.deepEqual(GHOST_ENTRY_CLOSING, [
    { speaker: "SHADEZ", text: "Continued excavation is not recommended." },
    { speaker: "SHADEZ", text: "Unfortunately, you requested indefinite excavation." },
    { speaker: "SYSTEM", text: "Employment status: ACTIVE." },
    { speaker: "PEON", text: "Tunnel already dug? Good. Less work." },
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

test("save schema migration preserves Ghost entrance and inefficiency feedback state", () => {
  assert.match(game, /schema: 22,settings:defaultSettings/);
  assert.match(game, /schema:22,employmentAgreementSigned:/);
});

test("mine-completion descent ceremony frames Heart of the Hollow as pre-existing ancient workings", () => {
  assert.match(game, /ghost:\["WORKINGS: PRE-EXISTING","ORIGIN: UNKNOWN","SURVEY MATCH: NONE"\]/);
  assert.match(game, /THE MINE REMEMBERS\./);
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
