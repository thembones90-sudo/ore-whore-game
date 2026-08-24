import assert from "node:assert/strict";
import fs from "node:fs";
import test from "node:test";

const layout = fs.readFileSync(new URL("../app/layout.tsx", import.meta.url), "utf8");
const css = fs.readFileSync(new URL("../app/v075.css", import.meta.url), "utf8");

test("discovered TRUE Artefacts never receive an opaque artwork square", () => {
  assert.match(layout, /import "\.\/v075\.css"/);
  assert.match(css, /\.true-art-slot:not\(\.locked-art\)/);
  assert.match(css, /background:transparent!important/);
  assert.match(css, /\.true-grid article\.found \.true-art-slot/);
  assert.match(css, /border-color:transparent!important/);
});

test("locked silhouettes retain their deliberate concealment treatment", () => {
  assert.doesNotMatch(css, /\.true-art-slot\{[^}]*background:transparent/);
  assert.match(css, /:not\(\.locked-art\)/);
});
