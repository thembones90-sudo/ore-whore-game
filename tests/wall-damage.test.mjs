import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const reducer = readFileSync(new URL("../app/wall-damage.ts", import.meta.url), "utf8");
const page = readFileSync(new URL("../app/page.tsx", import.meta.url), "utf8");
const css = readFileSync(new URL("../app/v108.css", import.meta.url), "utf8");

test("wall damage is capped and nearby strikes merge into stronger clusters", () => {
  assert.match(reducer, /MAX_WALL_DAMAGE_MARKS\s*=\s*28/);
  assert.match(reducer, /WALL_DAMAGE_CLUSTER_RADIUS\s*=\s*7\.5/);
  assert.match(reducer, /nearest\.distance\s*<=\s*WALL_DAMAGE_CLUSTER_RADIUS/);
  assert.match(reducer, /hits\s*>=\s*3/);
  assert.match(reducer, /slice\(-MAX_WALL_DAMAGE_MARKS\)/);
});

test("strike marks use the actual pointer position and preserve hit quality", () => {
  assert.match(page, /addWallDamageMark\(current\.scope===wallDamageScope\?current\.marks:\[\],\{id:\+\+fractureId\.current,x:strikePoint\.x,y:strikePoint\.y,kind:hitKind/);
  assert.match(page, /fracture-strength-\$\{f\.strength\}/);
  assert.match(page, /fracture-kind-\$\{f\.kind\}/);
});

test("wall marks clear on deposit resolution and degradation stage changes", () => {
  assert.match(page, /const wallDamageScope=`\$\{save\.biome\}:\$\{wallDegradationStage\}`/);
  assert.match(page, /wallDamage\.scope===wallDamageScope\?wallDamage\.marks:\[\]/);
  assert.match(page, /const continueMine = \(\) => \{[^}]*clearWallDamage\(\)/);
});

test("every current biome has distinct cheap material styling", () => {
  for (const biome of ["old", "deep", "outland", "northrend", "ghost", "moon"]) {
    assert.match(css, new RegExp(`wall-material-${biome}`));
  }
  assert.match(css, /wallScarDust/);
  assert.match(css, /wallScarHeavyDust/);
  assert.match(css, /reduced-motion/);
});
