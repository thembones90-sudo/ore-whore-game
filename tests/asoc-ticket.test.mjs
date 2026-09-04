import test from "node:test";
import assert from "node:assert/strict";
import { ASOC_TICKET_CHANCE, ASOC_TICKET_PRESENTATION, asocTicketChanceForDig } from "../app/asoc-ticket.ts";

test("Golden ASOC Ticket remains outside the weighted ordinary pool",()=>{
  assert.equal(ASOC_TICKET_PRESENTATION.id,"asoc");
  assert.equal(ASOC_TICKET_PRESENTATION.selectionWeight,null);
  assert.equal(ASOC_TICKET_PRESENTATION.ultimate,true);
});

test("Golden ASOC Ticket chance is 0.1 percent with SPLICER",()=>{
  assert.equal(ASOC_TICKET_CHANCE,.001);
  assert.equal(asocTicketChanceForDig("ultimate-machine",false),.001);
});

test("Golden ASOC Ticket cannot roll with earlier tools",()=>{
  for(const tool of ["rusty-pickaxe","khorium-drill","endgame-machine"]){
    assert.equal(asocTicketChanceForDig(tool,false),0);
  }
});

test("Golden ASOC Ticket remains unique after issuance",()=>{
  assert.equal(asocTicketChanceForDig("ultimate-machine",true),0);
});
