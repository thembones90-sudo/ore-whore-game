import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";

const root=new URL("../public/assets/characters/ORE_WHORE_CORE_AVATARS/",import.meta.url);
const page=fs.readFileSync(new URL("../app/page.tsx",import.meta.url),"utf8");
const states=fs.readFileSync(new URL("../app/avatar-states.ts",import.meta.url),"utf8");
const catalog=fs.readFileSync(new URL("../app/artifacts/catalog.ts",import.meta.url),"utf8");
const sets=fs.readFileSync(new URL("../app/artifacts/sets.ts",import.meta.url),"utf8");

const expected=[
  "peon-default.png","peon-proud.png","peon-scared.png","peon-angry.png",
  "shadez-default.png","shadez-angry.png","shadez-stunned.png","shadez-somber.png",
  "system-default.png","system-panic.png","system-deadpan.png","system-glitch.png",
];

test("the canonical basic dialogue-avatar library contains all twelve locked states",()=>{
  for(const file of expected)assert.ok(fs.statSync(new URL(file,root)).size>0,`missing ${file}`);
});

test("speaker helpers use the typed canonical map and preserve default fallback",()=>{
  assert.match(states,/CORE_AVATAR_PATHS/);
  assert.match(states,/\?\? CORE_AVATAR_PATHS\[speaker\]\.default/);
  assert.match(page,/function PeonAvatar\(\{state="default"\}/);
  assert.match(page,/function ShadezAvatar\(\{state="default"\}/);
  assert.match(page,/function SystemAvatar\(\{state="default"\}/);
});

test("authored beats opt into meaningful alternate states without changing dialogue text",()=>{
  assert.match(catalog,/text: "AAAAAAAAAAAAAAAA!", avatarState: "scared"/);
  assert.match(catalog,/speaker: "SYSTEM", text: "AAAAAAAAAAAAAAAA!", avatarState: "panic"/);
  assert.match(catalog,/speaker: "FOREMAN", text: "AAAAAAAAAAAAAAAA!", avatarState: "stunned"/);
  assert.match(catalog,/action: "FOREMAN BOWS\.", avatarState: "somber"/);
  assert.match(catalog,/speaker: "VOICE", text: "Look at you, hacker\."/);
  assert.match(catalog,/action: "SYSTEM interface briefly glitches\.", avatarState: "glitch"/);
  assert.match(catalog,/text: "Only my heart\.", avatarState: "deadpan"/);
  assert.match(catalog,/text: "EVOLVE SOMEWHERE ELSE\.", avatarState: "panic"/);
});

test("canonical restraint beats retain the implicit default portrait",()=>{
  assert.match(catalog,/text: "Burn it\." \}/);
  assert.match(catalog,/text: "Don’t turn around\." \}/);
  assert.match(catalog,/text: "For the Horde\." \}/);
  assert.match(sets,/text: "Me heed the call\." \}/);
  assert.doesNotMatch(catalog,/text: "Burn it\.", avatarState:/);
  assert.doesNotMatch(catalog,/text: "Don’t turn around\.", avatarState:/);
  assert.doesNotMatch(catalog,/speaker: "PEON", text: "For the Horde\.", avatarState:/);
  assert.doesNotMatch(sets,/text: "Me heed the call\.", avatarState:/);
});

test("Space Peon remains outside the basic core avatar map",()=>{
  assert.doesNotMatch(states,/space[-_ ]peon/i);
});
