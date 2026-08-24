import test from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";

const css=readFileSync(new URL("../app/v083.css",import.meta.url),"utf8");
const layout=readFileSync(new URL("../app/layout.tsx",import.meta.url),"utf8");

test("the shared interface constitution is the final visual layer",()=>{
  assert.match(layout,/import "\.\/v083\.css";/);
  assert.ok(layout.lastIndexOf("v083.css")>layout.lastIndexOf("v082.css"));
});

test("canonical tokens and control states cover the major UI surfaces",()=>{
  for(const token of ["--ui-surface","--ui-line-strong","--ui-space-4",".page-head",".topbar nav button","button:not(.rock):not(.true-card-inspect):focus-visible"]){
    assert.ok(css.includes(token),`${token} is missing`);
  }
});

test("the constitution includes deliberate tablet, phone, and reduced-motion behavior",()=>{
  for(const token of ["@media(max-width:980px)","@media(max-width:720px)","@media(max-width:480px)","@media(prefers-reduced-motion:reduce)"]){
    assert.ok(css.includes(token),`${token} is missing`);
  }
});

test("the visual layer cannot modify gameplay balance",()=>{
  assert.doesNotMatch(css,/trueArtifactChance|probability|oreWeights|damageMultiplier\s*:/);
});
