import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";

const page=fs.readFileSync(new URL("../app/page.tsx",import.meta.url),"utf8");
const endgame=fs.readFileSync(new URL("../app/endgame.ts",import.meta.url),"utf8");

test("ASOC completes the run instead of entering the ordinary archive",()=>{
  assert.match(page,/artifact\.id===ASOC_TICKET_ID/);
  assert.match(page,/gameCompleted:true/);
  assert.match(page,/completionHistory:\[\.\.\.s\.completionHistory,record\]/);
  assert.match(page,/archiveArtifacts=trueArtifactPool\.filter\(a=>a\.id!==ASOC_TICKET_ID\)/);
});

test("the canonical ending and quiet Peon moment ship intact",()=>{
  assert.match(endgame,/Do you remember when the circus rolled into town\?/);
  assert.match(endgame,/Keelah se'lai\./);
  assert.match(page,/Boss\.\.\.\?/);
  assert.match(page,/Peon keep ticket\./);
});

test("New Game Plus retains permanent history and ASOC tickets",()=>{
  assert.match(page,/completionCount:s\.completionCount,asocTickets:s\.asocTickets/);
  assert.match(page,/completionHistory:s\.completionHistory/);
  assert.match(page,/newGamePlusLevel:s\.newGamePlusLevel\+1/);
});
