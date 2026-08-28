import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const page = readFileSync(new URL("../app/page.tsx", import.meta.url), "utf8");
const layout = readFileSync(new URL("../app/layout.tsx", import.meta.url), "utf8");
const css = readFileSync(new URL("../app/v093.css", import.meta.url), "utf8");
const polish = readFileSync(new URL("../app/v105.css", import.meta.url), "utf8");

test("locked mine identities remain classified until unlocked", () => {
  assert.match(page, /unlocked\?biomeNames\[b\]:"🔒 \?\?\?\?\?"/);
  assert.match(page, /"CLASSIFIED · COMPLETE CURRENT SHAFT REQUIREMENTS"/);
  assert.match(page, /unlocked\?v\.accent:"#555"/);
  assert.match(page, /\$\{unlocked\?"identified":"classified"\}/);
});

test("mine selector follows the playable wall without overlapping it", () => {
  const rock = page.indexOf('<button className={`rock ');
  const selector = page.indexOf('<div className="biomes volume-biomes"', rock);
  const controls = page.indexOf('<div className={`dig-panel', selector);
  assert.ok(rock >= 0 && selector > rock && controls > selector, "wall, selector, and controls must remain in non-overlapping document order");
  assert.match(css, /\.mine-screen>\.rock[\s\S]*?order:6!important/);
  assert.match(css, /\.mine-screen>\.volume-biomes[\s\S]*?order:7!important/);
  assert.match(css, /\.mine-screen>\.dig-panel[\s\S]*?order:8!important/);
  assert.match(css, /position:relative!important/);
  assert.match(css, /grid-template-columns:repeat\(5,minmax\(0,1fr\)\)/);
});

test("latest selector overrides are loaded last", () => {
  assert.ok(layout.lastIndexOf('import "./v105.css";') > layout.lastIndexOf('import "./v104.css";'));
  assert.match(polish, /\.mine-screen>\.volume-biomes/);
});
