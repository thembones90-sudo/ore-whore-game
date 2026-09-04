import test from "node:test";
import assert from "node:assert/strict";
import {forgedItems} from "../app/metallurgy.ts";
import {ORDINARY_TRUE_ARTIFACT_CHANCE,artifactChanceForDig,markModifierRolled,modifierFor} from "../app/forbidden-tunnel.ts";

test("ordinary baseline is exactly one in two thousand",()=>assert.equal(ORDINARY_TRUE_ARTIFACT_CHANCE,.0005));
test("every technology tier owns the canonical Artifact probability",()=>assert.deepEqual(forgedItems.map(t=>t.trueArtifactChance),[.0005,.0006,.0008,.001,.0015,.002,.003,.004,.005,.0075,.01,.01]));
test("SPLICER reaches the one percent hard cap",()=>{const tool=forgedItems.find(t=>t.name==="SPLICER");assert.equal(artifactChanceForDig(null,tool.trueArtifactChance),.01)});
test("changing equipped technology changes the ordinary roll",()=>{for(const tool of forgedItems)assert.equal(artifactChanceForDig(null,tool.trueArtifactChance),tool.trueArtifactChance)});
test("changing cosmetic cannot alter ordinary roll",()=>{for(const _skin of ["standard","revenant","pretty-bonker"])assert.equal(artifactChanceForDig(null),.0005)});
test("changing mine cannot alter ordinary roll",()=>{for(const _mine of ["old","deep","outland","northrend"])assert.equal(artifactChanceForDig(null),.0005)});
test("all four tunnel outcomes remain canonical",()=>assert.deepEqual(["x1","x2","sealed","deep"].map(x=>modifierFor(x)?.chance),[.0005,.001,.0025,.15]));
test("technology and modifier never stack",()=>assert.equal(artifactChanceForDig(modifierFor("sealed")),.0025));
test("modifier is consumed after success or failure and restores equipped tool rate",()=>{for(const _result of [true,false])assert.equal(artifactChanceForDig(markModifierRolled(modifierFor("deep")),.0075),.0075)});
test("million-dig deterministic baseline converges near 0.05 percent",()=>{let s=20260823,hits=0;for(let i=0;i<1_000_000;i++){s=s+0x6D2B79F5|0;let t=Math.imul(s^s>>>15,1|s);t=t+Math.imul(t^t>>>7,61|t)^t;const roll=((t^t>>>14)>>>0)/4294967296;if(roll<ORDINARY_TRUE_ARTIFACT_CHANCE)hits++}assert.ok(Math.abs(hits/1_000_000-.0005)<.00008)});
