import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const page = await readFile(new URL("../app/page.tsx", import.meta.url), "utf8");
const css = await readFile(new URL("../app/polish-v111.css", import.meta.url), "utf8");
const shield = await readFile(new URL("../public/assets/true/white-shield-red-cross.png", import.meta.url));

test("sequenced artifact sound and visual commands execute without exposing debug copy", () => {
  assert.match(page, /presentation\?\.type!=="sound"/);
  assert.match(page, /presentation\?\.type!=="visual"/);
  assert.doesNotMatch(page, /<small>SOUND<\/small>/);
  assert.doesNotMatch(page, /<small>VISUAL<\/small>/);
  assert.match(page, /presentation\.type==="dialogue"\|\|presentation\.type==="characterAction"/);
});

test("the sequenced artifact artwork uses a bounded industrial specimen stage", () => {
  assert.match(css, /\.artifact-sequence-reveal \.true-artifact-art\{[\s\S]*?height:100%/);
  assert.match(css, /\.artifact-sequence-reveal \.true-artifact-art img\{[\s\S]*?object-fit:contain/);
  assert.match(css, /PROPERTY OF ORE WHORE  \/\/  ANOMALY CONTAINMENT/);
});

test("artifact banter is the primary reveal interaction", () => {
  assert.match(page, /className="artifact-banter-stage"/);
  assert.match(page, /className="artifact-line"/);
  assert.match(page, /artifact-cast-peon/);
  assert.match(page, /artifact-cast-system/);
  assert.match(page, /artifact-cast-foreman/);
  assert.match(css, /\.artifact-sequence-reveal \.artifact-line\{[^}]*font:700 clamp\(25px,3vw,43px\)/);
  assert.match(css, /\.artifact-sequence-reveal \.artifact-reveal-exhibit\{[^}]*height:clamp\(150px,23vh,235px\)/);
});

test("the Stronghold shield ships with real alpha instead of a baked checkerboard", () => {
  assert.equal(shield.subarray(1, 4).toString(), "PNG");
  assert.equal(shield[25], 6, "PNG must use RGBA color type");
});
