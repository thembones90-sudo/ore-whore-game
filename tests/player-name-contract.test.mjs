import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";

const page=fs.readFileSync(new URL("../app/page.tsx",import.meta.url),"utf8");

test("employment contract captures and validates a bounded employee name",()=>{
  assert.match(page,/playerName:string/);
  assert.match(page,/Employee Name<input value=\{employeeName\} maxLength=\{28\}/);
  assert.match(page,/const normalizedName=employeeName\.trim\(\)\.slice\(0,28\),canSign=normalizedName\.length>0/);
  assert.match(page,/<button disabled=\{!canSign\} onClick=\{signAgreement\}>I AGREE<\/button>/);
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
  assert.match(page,/Welcome to ORE WHORE, <strong>\{signedName\}<\/strong>/);
  assert.match(page,/EMPLOYEE <b>\{save\.playerName\}<\/b>/);
  assert.match(page,/Extraction quota satisfied, \$\{playerName\}/);
  assert.match(page,/className="termination-record"/);
  assert.match(page,/CONTRACT SUPERSEDED BY INVITATION/);
});

test("Peon identity and first mining line remain canonical",()=>{
  assert.match(page,/<small>PEON · EMPLOYEE<\/small>/);
  assert.match(page,/Boss say dig\.<br\/><strong>Me dig\.<\/strong>/);
});
