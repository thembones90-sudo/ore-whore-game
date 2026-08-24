import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";

const page=fs.readFileSync(new URL("../app/page.tsx",import.meta.url),"utf8");
const layout=fs.readFileSync(new URL("../app/layout.tsx",import.meta.url),"utf8");

test("canonical two-ore-O branding is used in navigation and onboarding",()=>{
  assert.match(page,/ore-whore-wordmark-compact\.webp/);
  assert.match(page,/ore-whore-logo-primary\.webp/);
  assert.match(page,/alt="ORE WHORE"/);
  assert.match(page,/alt="ORE WHORE — Property of the Department"/);
});

test("branding CSS is loaded last and both runtime assets exist",()=>{
  assert.match(layout,/import "\.\/v073\.css"/);
  for(const asset of ["ore-whore-wordmark-compact.webp","ore-whore-logo-primary.webp"]){
    assert.ok(fs.existsSync(new URL(`../public/assets/brand/${asset}`,import.meta.url)));
  }
});
