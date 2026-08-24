import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const css = readFileSync(new URL("../app/v078.css", import.meta.url), "utf8");
const layout = readFileSync(new URL("../app/layout.tsx", import.meta.url), "utf8");

test("all mine states share one locked headline geometry", () => {
  assert.match(css, /--mine-header-lock:148px/);
  assert.match(css, /height:var\(--mine-header-lock\)!important/);
  assert.match(css, /grid-template-rows:16px 78px 54px!important/);
  assert.match(css, /\.stage-ore \.mine-copy h1/);
  assert.match(css, /\.stage-artifact \.mine-copy h1/);
});

test("stability layer loads after every earlier visual override", () => {
  assert.ok(layout.indexOf('import "./v078.css"') > layout.indexOf('import "./v077.css"'));
});
