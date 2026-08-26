import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";

const page=fs.readFileSync(new URL("../app/page.tsx",import.meta.url),"utf8");
const endgame=fs.readFileSync(new URL("../app/endgame.ts",import.meta.url),"utf8");
const archiveCss=fs.readFileSync(new URL("../app/v092.css",import.meta.url),"utf8");

test("ASOC completes the run instead of entering the ordinary archive",()=>{
  assert.match(page,/artifact\.id===ASOC_TICKET_ID/);
  assert.match(page,/gameCompleted:true/);
  assert.match(page,/completionHistory:\[\.\.\.s\.completionHistory,record\]/);
  assert.match(page,/archiveArtifacts=trueArtifactPool\.filter\(a=>a\.id!==ASOC_TICKET_ID\)/);
});

test("the archive visibly dossiers ASOC while keeping it outside the ordinary eight",()=>{
  assert.match(page,/aria-label="Golden ASOC Ticket endgame status"/);
  assert.match(page,/renderArchiveCard\(asocTicket,save\.asocTickets,undefined,true\)/);
  assert.match(page,/GOLDEN ASOC TICKET/);
});

test("TRUE Artefact artwork is contained above a separate copy region",()=>{
  assert.match(page,/className="true-card-media"/);
  assert.match(page,/className="true-card-copy"/);
  assert.match(archiveCss,/\.true-card-media\{[\s\S]*?overflow:hidden/);
  assert.match(archiveCss,/\.true-card-copy\{[\s\S]*?z-index:2/);
  assert.match(archiveCss,/\.asoc-dossier::before\{[\s\S]*?position:absolute/);
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
