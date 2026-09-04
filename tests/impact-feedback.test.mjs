import assert from "node:assert/strict";
import {readFile} from "node:fs/promises";
import test from "node:test";
import {appendImpactFeedback,createImpactFeedback,IMPACT_FEEDBACK_MAX_LIFETIME_MS,IMPACT_FEEDBACK_MIN_LIFETIME_MS,removeImpactFeedback} from "../app/impact-feedback.ts";

const root=new URL("../",import.meta.url);
const read=path=>readFile(new URL(path,root),"utf8");

test("every canonical mining result produces an impact feedback event",()=>{
  const kinds=["normal","miss","crit","perfect","perfectCrit"];
  assert.deepEqual(kinds.map((kind,id)=>createImpactFeedback(id,kind,{x:31,y:67},()=>.5).kind),kinds);
});

test("impact feedback preserves the shared strike coordinate and constrained motion",()=>{
  const values=[0,1,.25,.75];let index=0;
  const event=createImpactFeedback(7,"crit",{x:23.5,y:61.25},()=>values[index++%values.length]);
  assert.equal(event.impactX,23.5);
  assert.equal(event.impactY,61.25);
  assert.ok(event.spawnOffsetX>=-18&&event.spawnOffsetX<=18);
  assert.ok(event.driftX>=-20&&event.driftX<=20);
  assert.ok(event.rise>=50&&event.rise<=70);
  assert.ok(event.lifetimeMs>=IMPACT_FEEDBACK_MIN_LIFETIME_MS&&event.lifetimeMs<=IMPACT_FEEDBACK_MAX_LIFETIME_MS);
});

test("simultaneous impact labels coexist and cleanup removes only the expired instance",()=>{
  const first=createImpactFeedback(1,"normal",{x:20,y:30},()=>.5);
  const second=createImpactFeedback(2,"perfect",{x:70,y:60},()=>.5);
  const concurrent=appendImpactFeedback(appendImpactFeedback([],first),second);
  assert.deepEqual(concurrent.map(item=>item.id),[1,2]);
  assert.deepEqual(removeImpactFeedback(concurrent,1).map(item=>item.id),[2]);
});

test("the Mine screen wires cleanup and all visuals to the same impact position",async()=>{
  const [page,css]=await Promise.all([read("app/page.tsx"),read("app/impact-feedback-v113.css")]);
  assert.match(page,/spawnImpactFeedback\("miss",strikePoint\)/);
  assert.match(page,/spawnImpactFeedback\(hitKind,strikePoint\)/);
  assert.match(page,/--impact-x[^\n]*feedback\.impactX/);
  assert.match(page,/setWallDamage[\s\S]{0,240}x:strikePoint\.x,y:strikePoint\.y/);
  assert.match(page,/--hit-x[^\n]*hitPoint\.x/);
  assert.match(page,/setTimeout\(\(\)=>\{[\s\S]{0,180}removeImpactFeedback/);
  assert.match(css,/pointer-events:none/);
  assert.match(css,/impact-feedback-perfectCrit[\s\S]*impact-perfect[\s\S]*impact-critical/);
  assert.doesNotMatch(css,/background:|border:/);
});
