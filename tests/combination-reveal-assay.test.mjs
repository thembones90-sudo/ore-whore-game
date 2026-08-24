import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const page = readFileSync(new URL("../app/page.tsx", import.meta.url), "utf8");
const layout = readFileSync(new URL("../app/layout.tsx", import.meta.url), "utf8");
const css = readFileSync(new URL("../app/v084.css", import.meta.url), "utf8");

test("new combinations use Department assay narrative copy", () => {
  assert.match(page, /DEPARTMENT ASSAY · SPECIMEN VERIFIED/);
  assert.match(page, /NEW COMBINATION LOGGED/);
  assert.match(page, /FILE SPECIMEN & CONTINUE/);
});

test("assay reveal layer is imported after the previous visual layer", () => {
  assert.ok(layout.indexOf('import "./v084.css";') > layout.indexOf('import "./v083.css";'));
});

test("assay reveal replaces acid green with brass and iron", () => {
  assert.match(css, /--assay-brass:#c89a4b/);
  assert.match(css, /PROPERTY OF THE DEPARTMENT/);
  assert.doesNotMatch(css, /var\(--acid\)|#d9ff45/i);
});
