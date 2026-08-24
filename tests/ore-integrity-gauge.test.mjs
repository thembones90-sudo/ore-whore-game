import test from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";

const page=readFileSync(new URL("../app/page.tsx",import.meta.url),"utf8");
const css=readFileSync(new URL("../app/v086.css",import.meta.url),"utf8");
const layout=readFileSync(new URL("../app/layout.tsx",import.meta.url),"utf8");

test("ore health is presented as a named specimen casing gauge",()=>{
  for(const copy of ["DEPARTMENT SPECIMEN CASING","SHELL INTEGRITY","CASING RESISTING","CASING FRACTURED","BREACH IMMINENT"])assert.match(page,new RegExp(copy));
  assert.match(page,/ore-shell-segments/);
});

test("ore gauge derives only from existing shell health",()=>{
  assert.match(page,/Math\.ceil\(\(rockHp\/maxHp\)\*12\)/);
  assert.doesNotMatch(css,/probability|chance|damageMultiplier/);
});

test("gauge has ore-colored armor, warnings, responsive and reduced-motion states",()=>{
  assert.match(css,/var\(--ore-light\)/);
  assert.match(css,/\.shell-damage-3/);
  assert.match(css,/\.reduced-motion/);
  assert.match(css,/@media\(max-width:680px\)/);
  assert.ok(layout.indexOf('import "./v086.css";')>layout.indexOf('import "./v085.css";'));
});
