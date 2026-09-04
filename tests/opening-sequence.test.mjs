import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";

const game=fs.readFileSync(new URL("../app/page.tsx",import.meta.url),"utf8");
const layout=fs.readFileSync(new URL("../app/layout.tsx",import.meta.url),"utf8");
const avatar=new URL("../public/assets/characters/peon-avatar.png",import.meta.url);

test("fresh saves require the employment agreement while migrated saves are not interrupted",()=>{
  assert.match(game,/employmentAgreementSigned:false/);
  assert.match(game,/employmentGreetingSeen:false/);
  assert.match(game,/schema: 22/);
  assert.match(game,/employmentAgreementSigned:old\.employmentAgreementSigned===true\|\|old\.employmentAgreementSigned===undefined/);
});

test("employment agreement contains the canonical declaration and refusal joke",()=>{
  assert.match(game,/INDEFINITE EXCAVATION AGREEMENT/);
  assert.match(game,/EMPLOYEE PROMISE<\/small><strong>Me dig until end of time\.<\/strong>/);
  assert.match(game,/DECLARATION REJECTED\./);
  assert.match(game,/I HAVE RECONSIDERED/);
});

test("canonical Peon portrait and first line are wired",()=>{
  assert.ok(fs.statSync(avatar).size>100_000);
  assert.match(game,/\/assets\/characters\/peon-avatar\.png/);
  assert.match(game,/Boss say dig\.<br\/><strong>Me dig\.<\/strong>/);
});

test("contract callbacks cover canonical renaming, forbidden tunnels, indefinite excavation and termination",()=>{
  assert.match(game,/A barred metal door sealed the lower workings\./);
  assert.match(game,/Fortunately, you waived this objection\./);
  assert.match(game,/Your employment agreement remains in effect\./);
  assert.match(game,/EMPLOYMENT STATUS<br\/><strong>TERMINATED<\/strong>/);
  assert.match(game,/CONTRACT SUPERSEDED BY INVITATION/);
});

test("New Game Plus preserves the Peon designation without replaying an unapproved revised agreement",()=>{
  assert.match(game,/\.\.\.blank,playerName:"PEON",employmentAgreementSigned:true,employmentGreetingSeen:true/);
  assert.match(layout,/v091\.css/);
});
