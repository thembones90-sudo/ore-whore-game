import test from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";

const page=readFileSync(new URL("../app/page.tsx",import.meta.url),"utf8");
const css=readFileSync(new URL("../app/v096.css",import.meta.url),"utf8");

test("completion destination card is keyboard and pointer actionable",()=>{
  assert.match(page,/next-mine-reveal actionable/);
  assert.match(page,/onClick=\{descend\}/);
  assert.match(page,/e\.key==="Enter"\|\|e\.key===" "/);
});

test("completion overlay has a viewport-pinned descent control",()=>{
  assert.match(page,/completion-descent-dock/);
  assert.match(css,/\.completion-descent-dock\s*\{[^}]*position:fixed/s);
  assert.match(css,/\.mine-completion\s*\{[^}]*overflow-y:auto/s);
});
