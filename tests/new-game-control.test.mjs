import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const page=readFileSync(new URL("../app/page.tsx",import.meta.url),"utf8");
const layout=readFileSync(new URL("../app/layout.tsx",import.meta.url),"utf8");
const css=readFileSync(new URL("../app/v099.css",import.meta.url),"utf8");

test("NEW GAME is always available from the application header",()=>{
  assert.match(page,/className="new-game-control" onClick=\{reset\}/);
  assert.match(page,/>↻<\/span> NEW GAME/);
});

test("NEW GAME requires explicit confirmation and describes complete data loss",()=>{
  assert.match(page,/START A NEW GAME\?/);
  assert.match(page,/ERASE SAVE &amp; START NEW GAME/);
  assert.match(page,/All TRUE Artefacts, tools, cosmetics and Specimen Dust/);
  assert.match(page,/onClick=\{\(\)=>setConfirmNewGame\(false\)\}>CANCEL/);
});

test("confirmed NEW GAME clears storage and reopens the employment contract",()=>{
  assert.match(page,/localStorage\.removeItem\("ore-whore-save-v1"\)/);
  assert.match(page,/setSave\(\{\.\.\.blank,runStartedAt:Date\.now\(\)\}\)/);
  assert.match(page,/setOnboarding\(true\)/);
  assert.match(page,/setFirstPeonMoment\(false\)/);
});

test("new game controls ship in the final stylesheet layer",()=>{
  assert.match(layout,/import "\.\/v099\.css";/);
  assert.match(css,/\.new-game-confirm\{position:fixed/);
  assert.match(css,/z-index:100000/);
});
