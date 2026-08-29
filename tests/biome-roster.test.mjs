import test from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";

const game=readFileSync(new URL("../app/page.tsx",import.meta.url),"utf8");

const expected={
  old:[28,20,12,18,10,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
  deep:[0,0,0,0,0,22,18,15,18,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
  outland:[0,0,0,0,0,0,0,0,0,50,40,10,0,0,0,0,0,0,0,0,0,0,0],
  northrend:[0,0,0,0,0,0,0,0,0,0,0,0,55,35,10,0,0,0,0,0,0,0,0],
};

test("mine spawn tables contain only their canonical native ores",()=>{
  for(const [biome,weights] of Object.entries(expected)){
    assert.ok(game.includes(`${biome}:[${weights.join(",")}]`),`${biome} spawn table drifted`);
  }
});

test("depth and vein modifiers cannot introduce zero-weight foreign ores",()=>{
  assert.match(game,/return base\.map\(\(w,i\)=> rarerIdx\.has\(i\) \? w\*boost : w\)/);
  assert.match(game,/return weights\.map\(\(w,i\)=> i===idx \? w\*VEIN_MULTIPLIER : w\)/);
});
