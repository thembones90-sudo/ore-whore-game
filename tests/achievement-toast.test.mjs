import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";

const page = fs.readFileSync(new URL("../app/page.tsx", import.meta.url), "utf8");
const css = fs.readFileSync(new URL("../app/v103.css", import.meta.url), "utf8");

test("achievement definitions carry reusable tier and icon metadata", () => {
  assert.match(page, /type AchievementTier = "steel" \| "gold" \| "silver"/);
  assert.match(page, /id:"first"[^\n]+tier:"steel"[^\n]+icon:/);
  assert.match(page, /id:"master"[^\n]+tier:"gold"[^\n]+icon:/);
  assert.match(page, /id:"orewhore"[^\n]+tier:"silver"[^\n]+icon:/);
});

test("one reusable toast component renders all three ornamental tiers", () => {
  assert.match(page, /function AchievementToast/);
  assert.match(page, /achievement-\$\{tier\}/);
  assert.match(page, /achievement-medallion/);
  assert.match(css, /\.achievement-gold/);
  assert.match(css, /\.achievement-silver/);
  assert.match(css, /achievement-glint/);
});

test("achievement persistence remains id-based", () => {
  assert.match(page, /achievements: string\[\]/);
  assert.match(page, /save\.achievements\.includes\(a\.id\)/);
});
