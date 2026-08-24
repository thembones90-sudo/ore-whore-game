import test from "node:test";
import assert from "node:assert/strict";
import { eligibleOreCommentary, NORMAL_DIGGING_COMMENTARY, ORE_EXPOSED_COMMENTARY, RARITY_COMMENTARY, selectMineCommentary, TRUE_ARTIFACT_COMMENTARY } from "../app/mine-commentary.ts";

test("all canonical System commentary pairs ship intact",()=>{
  assert.equal(NORMAL_DIGGING_COMMENTARY.length,16);
  assert.equal(ORE_EXPOSED_COMMENTARY.length,12);
  assert.equal(NORMAL_DIGGING_COMMENTARY.filter(p=>p.headline==="ONWARDS, MY STEED.").length,4);
  assert.deepEqual(TRUE_ARTIFACT_COMMENTARY,{id:"true-stop",headline:"...STOP.",subtitle:"That is not ore."});
});

test("rarity commentary supplements rather than replaces the ore pool",()=>{
  for(const rarity of ["Common","Rare","Epic","Legendary"]){
    const pool=eligibleOreCommentary(rarity);
    assert.equal(pool.length,13);
    assert.equal(pool.at(-1),RARITY_COMMENTARY[rarity]);
  }
  assert.equal(eligibleOreCommentary("Uncommon").length,12);
});

test("selection keeps pairs intact and excludes the five most recent IDs",()=>{
  const history=[];
  const selected=[];
  for(let i=0;i<8;i++)selected.push(selectMineCommentary(NORMAL_DIGGING_COMMENTARY,history,()=>0).id);
  assert.equal(new Set(selected.slice(0,6)).size,6);
  assert.equal(history.length,5);
});
