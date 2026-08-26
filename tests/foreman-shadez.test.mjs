import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";

const page=fs.readFileSync(new URL("../app/page.tsx",import.meta.url),"utf8");
const layout=fs.readFileSync(new URL("../app/layout.tsx",import.meta.url),"utf8");
const commentary=fs.readFileSync(new URL("../app/mine-commentary.ts",import.meta.url),"utf8");

test("Foreman Shadez portrait and canonical recruitment copy are wired",()=>{
  assert.ok(fs.existsSync(new URL("../public/assets/characters/foreman-shadez.png",import.meta.url)));
  assert.match(page,/foreman-shadez\.png/);
  for(const line of ["Children yearn for the mines.","Unfortunately, we are out of children.","So you will do.","Agreement accepted.","Your employment has commenced."]) assert.ok(page.includes(line));
});

test("Shadez owns narrative management moments while SYSTEM remains mechanical",()=>{
  assert.match(page,/FOREMAN SHADEZ/);
  assert.match(page,/Excavation has intersected an unregistered passage/);
  assert.match(page,/Your contract is no longer mine to enforce/);
  assert.match(commentary,/speaker:"SHADEZ",text:"Continued excavation is not recommended\."/);
  assert.match(commentary,/speaker:"SYSTEM",text:"Employment status: ACTIVE\."/);
});

test("Shadez visual layer loads last",()=>{
  const v93=layout.indexOf('import "./v093.css"');
  const v94=layout.indexOf('import "./v094.css"');
  assert.ok(v93>=0&&v94>v93);
});
