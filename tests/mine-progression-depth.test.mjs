import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";

const game=fs.readFileSync(new URL("../app/page.tsx",import.meta.url),"utf8");

test("canonical player-facing mine names map onto stable internal biome IDs",()=>{
  assert.match(game,/old:"DERELICT MINE",deep:"THE FORBIDDEN MINE",outland:"THE SUNDER",northrend:"THE RIME",ghost:"HEART OF THE HOLLOW"/);
  assert.match(game,/biomeOrder:Biome\[\]=\["old","deep","outland","northrend","ghost","moon"\]/);
});

test("mine transitions carry the canonical environmental progression",()=>{
  assert.match(game,/A barred metal door sealed the lower workings\./);
  assert.match(game,/colossal rupture/);
  assert.match(game,/temperature falls with every meter/);
  assert.match(game,/Ancient mine workings wait below any recorded depth\. THE MINE REMEMBERS\./);
});
const metallurgy=fs.readFileSync(new URL("../app/metallurgy.ts",import.meta.url),"utf8");

test("canonical mine extraction quotas — all five mines, including Ghost — are centralized in one map",()=>{
  assert.match(game,/progressionQuotaOverrides:Partial<Record<string,number>>=\{copper:40,tin:30,silver:20,iron:25,gold:10,mithril:40,truesilver:35,dark:30,thorium:35,feliron:70,adamantite:60,khorium:20,cobalt:80,saronite:65,titanium:20,gravesilver:90,stillwater:55,hushstone:30,revenantseye:15\}/);
  assert.equal(40+30+20+25+10,125);
  assert.equal(40+35+30+35,140);
  assert.equal(70+60+20,150);
  assert.equal(80+65+20,165);
  const [gravesilver,stillwater,hushstone,revenantseye]=[90,55,30,15];
  assert.equal(gravesilver+stillwater+hushstone+revenantseye,190,"Ghost Mines total should match the finalized design target");
  assert.ok(gravesilver>stillwater&&stillwater>hushstone&&hushstone>revenantseye,"Ghost Mines quota must strictly decrease Common → Uncommon → Rare → Legendary");
});

test("Outland and Northrend native weights preserve their canonical 50/40/10 and 55/35/10 splits",()=>{
  assert.match(game,/outland:\[0,0,0,0,0,0,0,0,0,50,40,10,0,0,0,0,0,0,0,0,0,0,0\]/);
  assert.match(game,/northrend:\[0,0,0,0,0,0,0,0,0,0,0,0,55,35,10,0,0,0,0,0,0,0,0\]/);
});

test("mine descent requires extraction and the equipped functional shaft rating",()=>{
  assert.match(game,/mineRequiredShaftRating:Partial<Record<Biome,1\|2\|3\|4>>=\{old:1,deep:2,outland:3,northrend:4\}/);
  assert.doesNotMatch(game,/mineRequiredShaftRating:Partial<Record<Biome,1\|2\|3\|4>>=\{[^\n}]*ghost/);
  assert.match(game,/equippedShaftRating=.*save\.equippedTool/);
  assert.match(game,/biomeQuotaComplete\(save,biome\)&&\(!required\|\|equippedShaftRating\(save\)>=required\)/);
  assert.doesNotMatch(game,/ownedShaftRating/);
  assert.doesNotMatch(game,/toolSkinId[^\n]{0,120}mineRequiredShaftRating/);
});

test("extraction completion is stored independently from descent authorization",()=>{
  assert.match(game,/completedBiomes=biomeOrder\.filter\(b=>biomeQuotaComplete\(provisional,b\)\)/);
  assert.doesNotMatch(game,/completedBiomes=biomeOrder\.filter\(b=>mineDescentAuthorized/);
});

test("functional tool data carries a capped shaft rating independent of cosmetic models",()=>{
  assert.match(metallurgy,/shaftRating: 1\|2\|3\|4/);
  assert.match(metallurgy,/shaftRating:Math\.min\(4,tool\.tier\+1\)/);
});
