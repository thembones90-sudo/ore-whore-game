import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";

const page=fs.readFileSync(new URL("../app/page.tsx",import.meta.url),"utf8");

test("locked TRUE Artefact cards do not render a numeric zero from conditional content",()=>{
  assert.doesNotMatch(page,/\{count&&a\.instruction&&/);
  assert.match(page,/\{count>0&&a\.instruction&&/);
});
