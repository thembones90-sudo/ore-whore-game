import test from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
const page=readFileSync(new URL("../app/page.tsx",import.meta.url),"utf8");
const css=readFileSync(new URL("../app/v088.css",import.meta.url),"utf8");
const layout=readFileSync(new URL("../app/layout.tsx",import.meta.url),"utf8");

test("mine completion is an industrial shaft authorization ritual",()=>{
  assert.doesNotMatch(page,/SURVEY <i>SATISFIED/);
  assert.match(page,/EXTRACTION <i>QUOTA MET/);
  assert.match(page,/CLEARED/);
  assert.match(page,/DESCENT AUTHORIZED/);
  assert.match(page,/Continued employment has been deemed economically preferable to replacement/);
  assert.match(page,/Boss\.\.\. down\?/);
  assert.match(page,/Unfortunately/);
});
test("manifest stamps sequence before the lower shaft opens",()=>{
  assert.match(page,/--stamp-delay/);
  assert.match(page,/>VERIFIED<\/b>/);
  assert.match(css,/@keyframes manifest-stamp/);
  assert.match(css,/lower-shaft-open \.7s 1\.7s/);
});
test("destination contamination and physical descent are visual-only",()=>{
  assert.match(page,/--destination-art/);
  assert.match(page,/DESCEND ANYWAY/);
  assert.match(css,/@keyframes interface-descend/);
  assert.doesNotMatch(css,/probability|chance|oreWeight|damageMultiplier/);
  assert.ok(layout.lastIndexOf('import "./v088.css"')>layout.lastIndexOf('import "./v087.css"'));
});
