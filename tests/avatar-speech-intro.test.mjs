import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";

const page=fs.readFileSync(new URL("../app/page.tsx",import.meta.url),"utf8");
const css=fs.readFileSync(new URL("../app/v097.css",import.meta.url),"utf8");

test("opening uses the canonical Peon-left Shadez-right reusable dialogue system",()=>{
  assert.match(page,/function AvatarDialogue/);
  assert.match(page,/dialogue-avatar peon/);
  assert.match(page,/dialogue-avatar shadez/);
  assert.match(page,/event\.code!=="Space"\|\|event\.repeat/);
  assert.match(css,/grid-template-columns:minmax\(180px,30%\).*minmax\(180px,30%\)/);
});

test("canonical recruitment and paperwork exchange is complete and ordered",()=>{
  const lines=["Boss?","You are here to work.","Me good at work.","That remains to be seen.","What me do?","Dig.","Me good at dig.","Excellent.","There is, regrettably, paperwork.","Me hit paperwork?","Bad job.","Children yearn for the mines.","Name. Signature. Then we begin."];
  let cursor=-1;
  for(const line of lines){const next=page.indexOf(line,cursor+1);assert.ok(next>cursor,`missing or out of order: ${line}`);cursor=next}
});

test("signed exchange uses the saved employee name and ends with Shadez",()=>{
  assert.match(page,/Welcome to ORE WHORE, \$\{signedName\}/);
  assert.match(page,/text:"Me have job now\?"/);
  assert.match(page,/text:"Regrettably\."/);
  assert.match(page,/onComplete=\{\(\)=>onDone\(true,signedName\)\}/);
});
