import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";

const game=fs.readFileSync(new URL("../app/page.tsx",import.meta.url),"utf8");
const metallurgy=fs.readFileSync(new URL("../app/metallurgy.ts",import.meta.url),"utf8");

test("canonical Old, Deep, and Outland extraction quotas are centralized",()=>{
  assert.match(game,/progressionQuotaOverrides:Partial<Record<string,number>>=\{copper:40,tin:30,silver:20,iron:25,gold:10,mithril:40,truesilver:35,dark:30,thorium:35,feliron:70,adamantite:60,khorium:20\}/);
  assert.equal(40+30+20+25+10,125);
  assert.equal(40+35+30+35,140);
  assert.equal(70+60+20,150);
});

test("Outland native weights are 50/40/10 and Northrend remains unchanged",()=>{
  assert.match(game,/outland:\[0,0,0,0,0,0,0,0,0,50,40,10,0,0,0,0,0,0,0\]/);
  assert.match(game,/northrend:\[0,0,0,0,0,0,0,0,0,0,0,0,38,35,20,0,0,0,0\]/);
});

test("mine descent requires both extraction and owned functional shaft rating",()=>{
  assert.match(game,/mineRequiredShaftRating:Record<Biome,1\|2\|3\|4>=\{old:1,deep:2,outland:3,northrend:4,ghost:4\}/);
  assert.match(game,/biomeQuotaComplete\(save,biome\)&&\(!next\|\|ownedShaftRating\(save\)>=mineRequiredShaftRating\[next\]\)/);
  assert.match(game,/save\.ownedTools\.map\(id=>forgedItems\.find\(tool=>tool\.id===id\)\?\.shaftRating\|\|1\)/);
  assert.doesNotMatch(game,/toolSkinId[^\n]{0,120}mineRequiredShaftRating/);
});

test("functional tool data carries a capped shaft rating independent of cosmetic models",()=>{
  assert.match(metallurgy,/shaftRating: 1\|2\|3\|4/);
  assert.match(metallurgy,/shaftRating:Math\.min\(4,tool\.tier\+1\)/);
});
