import test from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";

const page=readFileSync(new URL("../app/page.tsx",import.meta.url),"utf8");
const css=readFileSync(new URL("../app/v087.css",import.meta.url),"utf8");
const layout=readFileSync(new URL("../app/layout.tsx",import.meta.url),"utf8");

test("Specimen Dust is a compact expandable combat skill",()=>{
  assert.match(page,/className="berserk-skill"/);
  assert.match(page,/aria-expanded=\{berserkOpen\|\|!!currentBerserk\}/);
  assert.match(page,/className="berserk-flyout"/);
  assert.match(css,/\.mine-screen>\.berserk-console\{position:fixed!important/);
});

test("the playable wall is taller while the skill rail safely redocks responsively",()=>{
  assert.match(css,/\.mine-screen>\.rock\{height:clamp\(640px,58vw,820px\)/);
  assert.match(css,/@media\(max-width:1180px\)[\s\S]*?position:relative!important/);
  assert.match(css,/@media\(max-width:680px\)[\s\S]*?height:clamp\(430px,105vw,590px\)/);
  assert.match(css,/@media\(prefers-reduced-motion:reduce\)/);
});

test("combat HUD visual layer loads last",()=>{
  assert.ok(layout.lastIndexOf('import "./v087.css"')>layout.lastIndexOf('import "./v086.css"'));
});
