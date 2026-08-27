import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";

const game=fs.readFileSync(new URL("../app/page.tsx",import.meta.url),"utf8");
const layout=fs.readFileSync(new URL("../app/layout.tsx",import.meta.url),"utf8");
const style=fs.readFileSync(new URL("../app/v104.css",import.meta.url),"utf8");

test("landing intro preserves the logo and types the restrained intake copy",()=>{
  assert.match(game,/className="onboarding-logo" src="\/assets\/brand\/ore-whore-logo-primary\.webp"/);
  assert.match(game,/SYSTEM \/ EMPLOYMENT INTAKE · VOLUME I/);
  assert.match(game,/function IntroTypewriter/);
  assert.match(game,/character==="\."\?105:character===":"\?75:26/);
});

test("landing typography uses parchment and brass without acid green",()=>{
  assert.match(style,/\.onboarding-brief \{/);
  assert.match(style,/color: #d8d0b8/);
  assert.match(style,/color: #a88a4a/);
  assert.match(style,/Bahnschrift Condensed/);
  assert.doesNotMatch(style,/--acid|#cfff2e|neon|lime/i);
});

test("the scoped landing stylesheet loads last",()=>{
  assert.match(layout,/import "\.\/v103\.css";\s*import "\.\/v104\.css";/);
});
