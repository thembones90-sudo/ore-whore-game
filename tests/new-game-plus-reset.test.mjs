import test from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";

const page=readFileSync(new URL("../app/page.tsx",import.meta.url),"utf8");

test("New Game+ resets TRUE Artefact collection and encounter state",()=>{
  const start=page.indexOf("const startNewGamePlus=");
  const end=page.indexOf("return <main",start);
  const handler=page.slice(start,end);
  assert.ok(start>=0&&end>start);
  assert.doesNotMatch(handler,/trueArtifacts:s\.trueArtifacts/);
  assert.doesNotMatch(handler,/trueFirst:s\.trueFirst/);
  assert.match(handler,/setPendingTrue\(null\)/);
  assert.match(handler,/setTrueFind\(null\)/);
  assert.match(handler,/asocTickets:s\.asocTickets/);
  assert.match(handler,/unlocks:s\.unlocks/);
});
