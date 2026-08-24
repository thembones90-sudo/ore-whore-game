import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync, statSync } from "node:fs";

const page = readFileSync(new URL("../app/page.tsx", import.meta.url), "utf8");
const soundtrack = new URL("../public/assets/audio/echoes-of-the-forgotten-crypt.wav", import.meta.url);
const trueArtifactCue = new URL("../public/assets/audio/true-artefact.wav", import.meta.url);
const tunnelCue = new URL("../public/assets/audio/tunnels.wav", import.meta.url);
const pickaxeHits = Array.from({length:6},(_,index)=>new URL(`../public/assets/audio/pickaxe-hits/pick${index+1}.wav`,import.meta.url));

test("canonical soundtrack is bundled and loops through the game audio element", () => {
  assert.ok(statSync(soundtrack).size > 1_000_000);
  assert.match(page, /echoes-of-the-forgotten-crypt\.wav/);
  assert.match(page, /<audio ref=\{soundtrackRef\}[^>]*loop/);
});

test("TRUE Artefact music is a one-shot priority override with bidirectional crossfades",()=>{
  assert.ok(statSync(trueArtifactCue).size>10_000_000);
  assert.match(page,/<audio ref=\{trueArtifactCueRef\}[^>]*true-artefact\.wav[^>]*preload="auto"/);
  assert.match(page,/cue\.loop=false;cue\.currentTime=0;cue\.volume=0/);
  assert.match(page,/runMusicCrossfade\(0,1,800,\(\)=>normal\.pause\(\)\)/);
  assert.match(page,/cue\.duration-cue\.currentTime<=2\.2/);
  assert.match(page,/runMusicCrossfade\(1,0,2000/);
  assert.match(page,/\},\[trueFind\?\.artifact\.id\]\)/);
});

test("Forbidden Tunnel owns a stable looping music override with smooth entry and exit",()=>{
  assert.ok(statSync(tunnelCue).size>6_000_000);
  assert.match(page,/<audio ref=\{tunnelCueRef\}[^>]*tunnels\.wav[^>]*preload="auto"/);
  assert.match(page,/kind="tunnel";cue\.loop=true;cue\.currentTime=0;cue\.volume=0/);
  assert.match(page,/runTunnelCrossfade\(0,1,900,\(\)=>normal\.pause\(\)\)/);
  assert.match(page,/runTunnelCrossfade\(1,0,1800/);
  assert.match(page,/\},\[save\.forbiddenTunnel\?\.id\]\)/);
});

test("music and pickaxe effects have independent persisted toggles", () => {
  assert.match(page, /musicVolume:number;sfx:number;musicEnabled:boolean;pickaxeSfxEnabled:boolean/);
  assert.match(page, /musicVolume:\.65,sfx:\.8,musicEnabled:true,pickaxeSfxEnabled:true/);
  assert.match(page, /MUSIC · \{save\.settings\.musicEnabled\?"ON":"OFF"\}/);
  assert.match(page, /PICKAXE EFFECTS · \{save\.settings\.pickaxeSfxEnabled\?"ON":"OFF"\}/);
  assert.match(page, /if\(!save\.settings\.pickaxeSfxEnabled\|\|save\.settings\.master<=0/);
});

test("all six canonical pickaxe hits are bundled and randomized without immediate repeats",()=>{
  for(const hit of pickaxeHits)assert.ok(statSync(hit).size>90_000);
  assert.match(page,/const PICKAXE_HIT_SOUNDS=\[1,2,3,4,5,6\]/);
  assert.match(page,/pickaxeHitPoolRef=useRef<HTMLAudioElement\[\]>/);
  assert.match(page,/if\(lastPickaxeHitRef\.current>=0&&index>=lastPickaxeHitRef\.current\)index\+\+/);
  assert.match(page,/const hit=template\.cloneNode\(true\) as HTMLAudioElement/);
  assert.match(page,/hit\.volume=Math\.min\(1,save\.settings\.master\*save\.settings\.sfx\*\(currentBerserk\?1\.18:1\)\)/);
});

test("soundtrack obeys master volume and browser gesture playback policy", () => {
  assert.match(page, /const level=Math\.min\(1,Math\.max\(0,save\.settings\.master\*save\.settings\.musicVolume\)\)/);
  assert.match(page, /window\.addEventListener\("pointerdown",resume/);
  assert.match(page, /if\(!loaded\|\|!save\.settings\.musicEnabled\)\{normal\.pause\(\);artifact\.pause\(\);tunnel\.pause\(\)/);
});

test("the top bar exposes always-visible synchronized audio controls", () => {
  assert.match(page, /className="audio-dock" aria-label="Audio controls"/);
  assert.match(page, /aria-label="Music volume"/);
  assert.match(page, /Math\.round\(save\.settings\.musicVolume\*100\)/);
  assert.match(page, /title="Toggle pickaxe effects"/);
});
