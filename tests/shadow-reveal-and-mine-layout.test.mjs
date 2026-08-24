import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";

const page=fs.readFileSync(new URL("../app/page.tsx",import.meta.url),"utf8");
const css=fs.readFileSync(new URL("../app/v068.css",import.meta.url),"utf8");

test("Shadow uses the canonical reveal copy and dedicated silhouette beat",()=>{
  assert.match(page,/id:"shadow"[\s\S]*announcement:"ANOMALOUS OBJECT DETECTED"[\s\S]*lore:"He cannot see it\. He knows exactly where it is\."[\s\S]*peonBark:"Cat\?"[\s\S]*systemResponse:"WUUUUUUUUUU"/);
  assert.match(page,/setStage\("shadow-form"\)/);
  assert.match(page,/stage==="shadow-form"[\s\S]*<TrueArtifactArt artifact=\{data\.artifact\} locked\/>/);
});

test("mine selector is flow-owned and cannot overlap the playable wall",()=>{
  assert.match(css,/\.mine-screen>\.volume-biomes\{[\s\S]*position:relative!important;[\s\S]*inset:auto!important/);
  assert.match(css,/\.mine-screen>\.volume-biomes[\s\S]*grid-template-columns:repeat\(4/);
  assert.match(css,/@media\(max-width:1100px\)[\s\S]*\.mine-screen>\.volume-biomes\{order:4!important[\s\S]*\.mine-screen>\.rock\{order:5!important/);
});
