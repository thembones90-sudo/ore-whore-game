import test from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";

const page=readFileSync(new URL("../app/page.tsx",import.meta.url),"utf8");
const css=readFileSync(new URL("../app/v098.css",import.meta.url),"utf8");
const layout=readFileSync(new URL("../app/layout.tsx",import.meta.url),"utf8");

test("Forbidden Tunnel uses an explicit 2.5 second discovery input phase",()=>{
  assert.match(page,/"mining"\|"discovery"\|"select"/);
  assert.match(page,/setTunnelInputPhase\("discovery"\)/);
  assert.match(page,/setTunnelInputPhase\("select"\)/);
  assert.match(page,/window\.setTimeout\(\(\)=>\{tunnelReadyAt\.current=Date\.now\(\);tunnelInputLocked\.current=false;setTunnelInputPhase\("select"\)\},2500\)/);
});

test("mining and both tunnel selectors reject input outside TUNNEL_SELECT",()=>{
  assert.match(page,/save\.forbiddenTunnel\|\|save\.volatileEncounter\|\|stage==="volatile"\|\|tunnelInputPhase!=="mining"/);
  assert.match(page,/!save\.forbiddenTunnel && !save\.volatileEncounter && stage!=="volatile" && tunnelInputPhase==="mining"/);
  assert.equal((page.match(/tunnelInputPhase!=="select"\|\|Date\.now\(\)<tunnelReadyAt\.current/g)||[]).length,2);
});

test("discovery phase renders no passage buttons and announces the transition",()=>{
  const discovery=page.slice(page.indexOf('if(inputPhase==="discovery")'),page.indexOf('return <div className={`forbidden-tunnel-overlay chamber-'));
  assert.match(discovery,/FORBIDDEN TUNNELS <em>DISCOVERED<\/em>/);
  assert.match(discovery,/Surveying unstable passages\.\.\./);
  assert.doesNotMatch(discovery,/<button/);
  assert.match(page,/CHOOSE YOUR TUNNEL/);
  assert.match(layout,/import "\.\/v098\.css"/);
  assert.match(css,/tunnelSurveyProgress 2\.5s/);
});
