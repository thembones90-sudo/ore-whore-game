import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";

const page=fs.readFileSync(new URL("../app/page.tsx",import.meta.url),"utf8");

test("employment contract captures and validates a bounded employee name",()=>{
  assert.match(page,/playerName:string/);
  assert.match(page,/EMPLOYEE NAME<input value=\{employeeName\} maxLength=\{28\}/);
  assert.match(page,/placeholder="Write name here"/);
  assert.match(page,/const normalizedName=employeeName\.trim\(\)\.slice\(0,28\),canSign=normalizedName\.length>0/);
  assert.match(page,/<button disabled=\{!canSign\} onClick=\{signAgreement\}>ME AGREE<\/button>/);
});

test("employment contract is the canonical four-rule Peon agreement",()=>{
  const clauses=["1. YOUR JOB","2. THINGS YOU FIND","3. WHERE YOU WORK","4. HOW LONG"];
  for(const clause of clauses)assert.match(page,new RegExp(clause.replace(".","\\.")));
  assert.match(page,/You dig\.<br\/><strong>Then you dig more\.<\/strong>/);
  assert.match(page,/You find it, Boss owns it\.<br\/><strong>Even weird things\.<\/strong>/);
  assert.match(page,/Mine may be dark, deep, dangerous, or somewhere else\.<br\/><strong>You still dig\.<\/strong>/);
  assert.match(page,/You dig until Boss says stop\.<br\/><strong>Boss will not say stop\.<\/strong>/);
  assert.match(page,/EMPLOYEE PROMISE<\/small><strong>Me dig until end of time\.<\/strong>/);
  assert.doesNotMatch(page,/5\. UNREGISTERED PASSAGES|6\. DURATION|PRIMARY DUTIES/);
});

test("decline flow keeps the entered name and can become acceptance",()=>{
  assert.match(page,/DECLARATION REJECTED\./);
  assert.match(page,/declined\?"I HAVE RECONSIDERED":"I DECLINE"/);
  assert.match(page,/declined\?signAgreement\(\):setDeclined\(true\)/);
});

test("signed name persists, migrates, and survives New Game Plus",()=>{
  assert.match(page,/playerName:\"\"/);
  assert.match(page,/old\.playerName\.trim\(\)\.slice\(0,28\):"PEON"/);
  assert.match(page,/playerName:playerName\?\.trim\(\)\.slice\(0,28\)\|\|s\.playerName\|\|"PEON"/);
  assert.match(page,/\.\.\.blank,playerName:s\.playerName,employmentAgreementSigned:true/);
});

test("contract signature returns at welcome, records, progression, and termination",()=>{
  assert.match(page,/SIGNED: \{signedName\}/);
  assert.match(page,/Welcome to ORE WHORE, \$\{signedName\}/);
  assert.match(page,/EMPLOYEE <b>\{save\.playerName\}<\/b>/);
  assert.match(page,/Extraction quota satisfied, \$\{playerName\}/);
  assert.match(page,/className="termination-record"/);
  assert.match(page,/CONTRACT SUPERSEDED BY INVITATION/);
});

test("Peon identity and first mining line remain canonical",()=>{
  assert.match(page,/<small>PEON · EMPLOYEE<\/small>/);
  assert.match(page,/Boss say dig\.<br\/><strong>Me dig\.<\/strong>/);
});
