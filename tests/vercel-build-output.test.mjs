import test from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";

const config=JSON.parse(readFileSync(new URL("../vercel.json",import.meta.url),"utf8"));
const vite=readFileSync(new URL("../vite.config.ts",import.meta.url),"utf8");
const pkg=JSON.parse(readFileSync(new URL("../package.json",import.meta.url),"utf8"));

test("Vercel Git builds use the canonical project build and Build Output API",()=>{
  assert.equal(config.buildCommand,"NITRO_PRESET=vercel npm run build");
  assert.equal(config.outputDirectory,".vercel/output");
  assert.equal(pkg.scripts.build.includes("vinext build"),true);
  assert.match(vite,/process\.env\.VERCEL/);
  assert.match(vite,/import\("nitro\/vite"\)/);
  assert.match(vite,/plugins: \[vinext\(\), nitro\(\)\]/);
});
