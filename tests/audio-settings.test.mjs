import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync, statSync } from "node:fs";

const page = readFileSync(new URL("../app/page.tsx", import.meta.url), "utf8");
const soundtrack = new URL("../public/assets/audio/echoes-of-the-forgotten-crypt.wav", import.meta.url);

test("canonical soundtrack is bundled and loops through the game audio element", () => {
  assert.ok(statSync(soundtrack).size > 1_000_000);
  assert.match(page, /echoes-of-the-forgotten-crypt\.wav/);
  assert.match(page, /<audio ref=\{soundtrackRef\}[^>]*loop/);
});

test("music and pickaxe effects have independent persisted toggles", () => {
  assert.match(page, /musicEnabled:boolean;pickaxeSfxEnabled:boolean/);
  assert.match(page, /musicEnabled:true,pickaxeSfxEnabled:true/);
  assert.match(page, /MUSIC · \{save\.settings\.musicEnabled\?"ON":"OFF"\}/);
  assert.match(page, /PICKAXE EFFECTS · \{save\.settings\.pickaxeSfxEnabled\?"ON":"OFF"\}/);
  assert.match(page, /if\(!save\.settings\.pickaxeSfxEnabled\|\|save\.settings\.master<=0/);
});

test("soundtrack obeys master volume and browser gesture playback policy", () => {
  assert.match(page, /audio\.volume=Math\.min\(1,Math\.max\(0,save\.settings\.master\*\.42\)\)/);
  assert.match(page, /window\.addEventListener\("pointerdown",resume/);
  assert.match(page, /if\(!loaded\|\|!save\.settings\.musicEnabled\)\{audio\.pause\(\)/);
});
