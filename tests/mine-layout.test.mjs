import test from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";

const page=readFileSync(new URL("../app/page.tsx",import.meta.url),"utf8");
const layout=readFileSync(new URL("../app/v067.css",import.meta.url),"utf8");

test("first-extraction strike onboarding derives from persisted lifetime ore counts",()=>{
  assert.match(page,/const hasSuccessfulExtraction=Object\.values\(save\.ores\)\.some\(count=>count>0\)/);
  assert.match(page,/const showStrikeInstruction=stage!=="tunnel"\|\|!hasSuccessfulExtraction/);
  assert.match(page,/\{showStrikeInstruction&&<div className="strike-instruction">/);
  assert.match(page,/showStrikeInstruction\?"":"instruction-collapsed"/);
});

test("mine hierarchy is compact and completed surveys collapse to one row",()=>{
  assert.match(layout,/\.mine-copy h1\{[\s\S]*?font-size:clamp\(42px,4\.6vw,70px\)/);
  assert.match(layout,/\.mine-screen\{[\s\S]*?padding:22px 0 56px/);
  assert.match(layout,/\.quota-complete-compact\{[\s\S]*?min-height:42px!important/);
  assert.match(layout,/\.dig-panel\.instruction-collapsed\{[\s\S]*?min-height:56px/);
  assert.match(page,/>VIEW QUOTAS<\/button>/);
});

test("responsive mine hierarchy remains explicit at tablet and phone widths",()=>{
  assert.match(layout,/@media\(max-width:760px\)/);
  assert.match(layout,/\.rock\{order:4\}[\s\S]*?\.dig-panel\{order:5\}[\s\S]*?\.volume-biomes\{order:6\}/);
  assert.match(layout,/font-size:clamp\(36px,10vw,54px\)/);
  assert.match(layout,/@media\(max-width:480px\)/);
});
