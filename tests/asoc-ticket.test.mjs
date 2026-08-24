import test from "node:test";
import assert from "node:assert/strict";
import { ASOC_TICKET_CHANCE, asocTicketChanceForDig } from "../app/asoc-ticket.ts";

test("Golden ASOC Ticket chance is 0.1 percent with MOUNTAIN FUCKER",()=>{
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
