"use client";

import { useEffect, useRef, useState } from "react";
import { track } from "./analytics";

type Rarity = "Common" | "Uncommon" | "Rare" | "Epic" | "Legendary" | "Mythic";
type Item = { id: string; name: string; rarity: Rarity; weight: number; color: string; note: string };
type Biome = "old" | "deep";
type Settings = { master:number;sfx:number;reducedShake:boolean;reducedMotion:boolean;vibration:boolean;highContrast:boolean;helpSeen:boolean };
type Save = { digs: number; strikes: number; distance: number; combos: Record<string, number>; ores: Record<string, number>; minerals: Record<string, number>; first: Record<string, number>; achievements: string[]; streak: number; longestStreak:number; dust: number; dustEarned:number;dustSpent:number; biome: Biome; milestones: Record<string, number>; lastDigAt: number; schema: number; settings:Settings;unlocks:string[];equipped:string;huntTarget:string|null };

const ores: Item[] = [
  { id: "copper", name: "Copper Ore", rarity: "Common", weight: 48, color: "#d88156", note: "Honest rock for dishonest amounts of time." },
  { id: "iron", name: "Iron Ore", rarity: "Uncommon", weight: 29, color: "#9da5a3", note: "Industrial. Dependable. Completely unimpressed by you." },
  { id: "mithril", name: "Mithril Ore", rarity: "Rare", weight: 15, color: "#63c7b2", note: "Light enough to carry your growing disappointment." },
  { id: "dark", name: "Dark Iron Ore", rarity: "Epic", weight: 6, color: "#9a5369", note: "Somehow, Blackrock Depths returned." },
  { id: "titanium", name: "Titanium Ore", rarity: "Legendary", weight: 2, color: "#6dc6df", note: "The crown jewel. Try to act normal." },
];

const minerals: Item[] = [
  { id: "quartz", name: "Smoky Quartz", rarity: "Common", weight: 48, color: "#c9b9a9", note: "Nature's participation trophy." },
  { id: "jade", name: "Jade", rarity: "Uncommon", weight: 29, color: "#72c48b", note: "Green, glossy, and statistically inevitable." },
  { id: "citrine", name: "Citrine", rarity: "Rare", weight: 15, color: "#f0ba52", note: "A tiny captive sunset." },
  { id: "opal", name: "Black Opal", rarity: "Epic", weight: 6, color: "#b074d1", note: "Dark, iridescent, and annoyingly absent." },
  { id: "star", name: "Astral Geode", rarity: "Mythic", weight: 2, color: "#ff75bd", note: "A geological clerical error." },
];

const achievements = [
  { id: "prospector", name: "PROSPECTOR", text: "Discover 5 ore deposits." },
  { id: "again", name: "THIS SHIT AGAIN?", text: "Mine your first Dark Iron Ore." },
  { id: "problem", name: "I HAVE A PROBLEM", text: "Complete 25 digs." },
  { id: "vein", name: "FULL VEIN", text: "Complete all minerals for one ore." },
  { id: "unhinged", name: "GEOLOGICALLY UNHINGED", text: "Find a Mythic mineral." },
];

const defaultSettings:Settings={master:.7,sfx:.8,reducedShake:false,reducedMotion:false,vibration:true,highContrast:false,helpSeen:false};
const blank: Save = { digs: 0, strikes: 0, distance: 0, combos: {}, ores: {}, minerals: {}, first: {}, achievements: [], streak: 0,longestStreak:0, dust: 0,dustEarned:0,dustSpent:0, biome: "old", milestones: {}, lastDigAt: 0, schema: 3,settings:defaultSettings,unlocks:[],equipped:"standard",huntTarget:null };
const cosmetics=[{id:"rust",name:"Rustbite Pick",cost:15,kind:"PICKAXE"},{id:"neon",name:"Toxic Impact",cost:30,kind:"IMPACT"},{id:"gilded",name:"Gilded Album",cost:45,kind:"ALBUM"},{id:"deepframe",name:"Deep-Mine Frame",cost:60,kind:"ALBUM"},{id:"menace",name:"Geological Menace",cost:75,kind:"TITLE"},{id:"void",name:"Void Pick",cost:100,kind:"PICKAXE"}];
const biomeWeights: Record<Biome, number[]> = { old: [55,28,12,4,1], deep: [24,28,25,15,8] };
const dustByRarity: Record<Rarity,number> = { Common:1, Uncommon:2, Rare:3, Epic:5, Legendary:8, Mythic:12 };
const makeRng = (seed:number) => () => { seed |= 0; seed = seed + 0x6D2B79F5 | 0; let t=Math.imul(seed^seed>>>15,1|seed); t=t+Math.imul(t^t>>>7,61|t)^t; return ((t^t>>>14)>>>0)/4294967296; };
const pick = (items: Item[], random:()=>number, weights?:number[]) => { const ws=weights||items.map(i=>i.weight); let n=random()*ws.reduce((s,w)=>s+w,0); return items.find((_,i)=>(n-=ws[i])<=0)||items[0]; };
const odds = (ore:Item,mineral:Item,biome:Biome) => Math.round(10000/(biomeWeights[biome][ores.indexOf(ore)]*mineral.weight));

export default function Home() {
  const [save, setSave] = useState<Save>(blank);
  const [loaded, setLoaded] = useState(false);
  const [tab, setTab] = useState<"mine" | "album" | "wanted" | "records" | "more">("mine");
  const [stage, setStage] = useState<"tunnel" | "ore">("tunnel");
  const [maxHp, setMaxHp] = useState(12);
  const [rockHp, setRockHp] = useState(12);
  const [pendingOre, setPendingOre] = useState<Item | null>(null);
  const [impact, setImpact] = useState<number | null>(null);
  const [found, setFound] = useState<{ ore: Item; mineral: Item; isNew: boolean; count: number } | null>(null);
  const [toast, setToast] = useState<{ name: string; text: string } | null>(null);
  const [milestone, setMilestone] = useState<{ore:Item;level:number;missing?:Item;attempts:number} | null>(null);
  const [onboarding,setOnboarding]=useState(false);
  const [share,setShare]=useState<{ore:Item;mineral:Item;attempt:number;total:number}|null>(null);
  const seed = typeof window !== "undefined" ? Number(new URLSearchParams(location.search).get("seed")) : 0;
  const rng = useRef<()=>number>(makeRng(seed || Date.now()));
  const sessionDigs = useRef(0);

  useEffect(() => { try { const last=Number(localStorage.getItem("ore-whore-last-session")||0);if(last)track("return_visit",{hours_since_previous_session:(Date.now()-last)/3600000}); const raw = localStorage.getItem("ore-whore-save-v1"); if (raw){const old=JSON.parse(raw);setSave({...blank,...old,settings:{...defaultSettings,...old.settings},schema:3});setOnboarding(!old.settings?.helpSeen&&!(old.digs>0));}else setOnboarding(true); } catch {setOnboarding(true)} setLoaded(true); track("session_start",{seed:seed||null}); const end=()=>{localStorage.setItem("ore-whore-last-session",String(Date.now()));track("session_end",{session_digs:sessionDigs.current})}; addEventListener("pagehide",end); return()=>removeEventListener("pagehide",end); }, []);
  useEffect(() => { if (loaded) localStorage.setItem("ore-whore-save-v1", JSON.stringify(save)); }, [save, loaded]);

  const unlocked = (next: Save, ore: Item, mineral: Item) => {
    const ids: string[] = [];
    if (next.digs >= 5) ids.push("prospector");
    if (ore.id === "dark") ids.push("again");
    if (next.digs >= 25) ids.push("problem");
    if (mineral.rarity === "Mythic") ids.push("unhinged");
    if (ores.some(o => minerals.every(m => next.combos[`${o.id}-${m.id}`]))) ids.push("vein");
    return ids.filter(id => !next.achievements.includes(id));
  };

  const strike = () => {
    if (found) return;
    const hit = rockHp - 1;
    setImpact(Date.now());
    setTimeout(() => setImpact(null), 180);
    if (save.settings.vibration&&navigator.vibrate) navigator.vibrate(stage === "ore" ? 35 : 12);
    setSave(s => ({ ...s, strikes: s.strikes + 1, distance: +(s.distance + (stage === "tunnel" ? 0.4 : 0)).toFixed(1) }));
    if (hit > 0) { playImpact(stage==="ore"?"crack":"rock"); return setRockHp(hit); }
    if (stage === "tunnel") {
      const ore = pick(ores,rng.current,biomeWeights[save.biome]);
      playImpact("clank");
      setPendingOre(ore);
      setStage("ore");
      setMaxHp(3);
      setRockHp(3);
      track("tunnel_broken",{attempt:save.digs+1,biome:save.biome});
      track("ore_found",{ore_id:ore.id,rarity:ore.rarity,biome:save.biome});
      return;
    }
    const ore = pendingOre || pick(ores,rng.current,biomeWeights[save.biome]), mineral = pick(minerals,rng.current), key = `${ore.id}-${mineral.id}`;
    playImpact("crack");
    setSave(s => {
      const isNew = !s.combos[key];
      const dustGain=isNew?0:dustByRarity[mineral.rarity];
      const before=minerals.filter(m=>s.combos[`${ore.id}-${m.id}`]).length;
      const after=isNew?before+1:before;
      const newStreak=isNew?0:s.streak+1;
      const next: Save = { ...s, digs: s.digs + 1, dust:s.dust+dustGain,dustEarned:s.dustEarned+dustGain, combos: { ...s.combos, [key]: (s.combos[key] || 0) + 1 }, ores: { ...s.ores, [ore.id]: (s.ores[ore.id] || 0) + 1 }, minerals: { ...s.minerals, [mineral.id]: (s.minerals[mineral.id] || 0) + 1 }, first: isNew ? { ...s.first, [key]: s.digs + 1 } : s.first, streak:newStreak,longestStreak:Math.max(s.longestStreak,newStreak), lastDigAt:Date.now(), milestones:{...s.milestones,...(after>=3?{[ore.id]:Math.max(s.milestones[ore.id]||0,after)}:{})} };
      const fresh = unlocked(next, ore, mineral);
      next.achievements = [...s.achievements, ...fresh];
      if (fresh[0]) { const a = achievements.find(x => x.id === fresh[0])!; setTimeout(() => setToast(a), 650); }
      setFound({ ore, mineral, isNew, count: next.combos[key] });
      sessionDigs.current++;
      const context={attempt:next.digs,session_dig:sessionDigs.current,ore_id:ore.id,mineral_id:mineral.id,combination_id:key,rarity:mineral.rarity,biome:s.biome,duplicate_count:next.combos[key],album_completion:Object.keys(next.combos).length/25,time_since_previous_dig_ms:s.lastDigAt?Date.now()-s.lastDigAt:null};
      track("mineral_found",context); track(isNew?"combination_new":"combination_duplicate",context);
      if(isNew&&after>=3&&after<=5){track(after===3?"page_milestone_3":after===4?"page_milestone_4":"page_completed",{...context,page:ore.id}); setTimeout(()=>setMilestone({ore,level:after,attempts:next.ores[ore.id],missing:after===4?minerals.find(m=>!next.combos[`${ore.id}-${m.id}`]):undefined}),400);}
      fresh.forEach(id=>track("achievement_unlocked",{achievement_id:id}));
      if(isNew&&(ore.rarity==="Legendary"||mineral.rarity==="Mythic"||odds(ore,mineral,s.biome)>=500))setTimeout(()=>setShare({ore,mineral,attempt:next.digs,total:Object.keys(next.combos).length}),700);
      return next;
    });
  };

  const playImpact=(kind:"rock"|"clank"|"crack")=>{if(save.settings.master<=0||save.settings.sfx<=0)return;try{const C=window.AudioContext;const c=new C(),o=c.createOscillator(),g=c.createGain();o.connect(g);g.connect(c.destination);const base=kind==="clank"?720:kind==="crack"?145:82+Math.random()*36;o.type=kind==="clank"?"triangle":"square";o.frequency.setValueAtTime(base,c.currentTime);o.frequency.exponentialRampToValueAtTime(kind==="clank"?340:45,c.currentTime+.09);g.gain.setValueAtTime((kind==="clank"?.18:.08)*save.settings.master*save.settings.sfx,c.currentTime);g.gain.exponentialRampToValueAtTime(.001,c.currentTime+.12);o.start();o.stop(c.currentTime+.13);}catch{}};

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.code === "Space" && tab === "mine" && !found) { event.preventDefault(); strike(); }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  });

  const continueMine = () => { const hp=10+Math.floor(rng.current()*6); setFound(null); setPendingOre(null); setStage("tunnel"); setMaxHp(hp); setRockHp(hp); track("mine_started",{attempt:save.digs+1,biome:save.biome}); };
  const unique = Object.keys(save.combos).length;
  const reset = () => { if (confirm("Erase every discovery and return to the cold, uncaring rock?")) { setSave(blank); setFound(null); setPendingOre(null); setStage("tunnel"); setMaxHp(12); setRockHp(12); } };

  return <main className={`${save.settings.reducedMotion?"reduced-motion":""} ${save.settings.reducedShake?"reduced-shake":""} ${save.settings.highContrast?"high-contrast":""} cosmetic-${save.equipped}`}>
    <header className="topbar">
      <button className="brand" onClick={() => setTab("mine")}><span className="brand-mark">OW</span><span>ORE WHORE<small>COMPULSIVE GEOLOGY</small></span></button>
      <nav aria-label="Primary">
        <button className={tab === "mine" ? "active" : ""} onClick={() => setTab("mine")}>MINE</button>
        <button className={tab === "album" ? "active" : ""} onClick={() => {setTab("album");track("album_opened",{completion:unique/25});}}>ALBUM <b>{unique}/25</b></button>
        <button className={tab === "wanted" ? "active" : ""} onClick={() => {setTab("wanted");track("missing_view_opened",{completion:unique/25});}}>WANTED</button>
        <button className={tab === "records" ? "active" : ""} onClick={() => setTab("records")}>RECORDS</button>
        <button className={tab === "more" ? "active" : ""} onClick={() => setTab("more")}>MORE</button>
      </nav>
      <div className="depth"><span>SPECIMEN DUST</span><strong>✦ {save.dust}</strong></div>
    </header>

    {tab === "mine" && <section className={`mine-screen ${impact ? "screen-hit" : ""} stage-${stage}`}>
      <div className="mine-copy"><p className="eyebrow">{stage === "ore" ? "CLANK · DEPOSIT EXPOSED" : "SHIFT 01 · THE LONG WALL"}</p><h1>{stage === "ore" ? <><i>ORE</i> FOUND.</> : <>KEEP <i>DIGGING.</i></>}</h1><p>{stage === "ore" ? `${pendingOre?.name}. Crack it open and see what ruined your evening.` : <>The rock does not care about your album.<br/>Unfortunately, you do.</>}</p></div>
      <div className="stats-row"><span><small>DEPOSITS</small>{save.digs}</span><span><small>UNIQUE</small>{unique}<em>/ 25</em></span><span><small>DRY STREAK</small>{save.streak}</span></div>
      {save.huntTarget&&<div className="hunt-banner"><span>ACTIVE HUNT</span><strong>{ores.find(o=>o.id===save.huntTarget)?.name} — {minerals.filter(m=>!save.combos[`${save.huntTarget}-${m.id}`]).map(m=>m.name).join(", ")||"PAGE COMPLETE"}</strong><button onClick={()=>setTab("wanted")}>VIEW TARGET</button></div>}
      <div className="biomes" aria-label="Mine location"><button className={save.biome==="old"?"chosen":""} onClick={()=>{setSave(s=>({...s,biome:"old"}));track("biome_selected",{biome:"old"})}}><span>OLD MINE</span><small>55% Copper · 1% Titanium</small></button><button className={save.biome==="deep"?"chosen":""} onClick={()=>{setSave(s=>({...s,biome:"deep"}));track("biome_selected",{biome:"deep"})}}><span>DEEP MINE</span><small>24% Copper · 8% Titanium</small></button></div>
      <button className={`rock ${impact ? "hit" : ""} ${stage === "ore" ? "ore-rock" : ""} damage-${Math.floor((1-rockHp/maxHp)*4)} ${rockHp===1?"final-hit":""}`} onClick={strike} aria-label={stage === "ore" ? "Crack the exposed ore deposit" : "Strike the rock wall"}>
        {Array.from({ length: 18 }, (_, i) => <span key={i} className={`stone s${i}`} />)}
        <span className="crack c1"/><span className="crack c2"/><span className="crack c3"/>
        {stage === "ore" && pendingOre && <span className="exposed-ore" style={{"--ore":pendingOre.color} as React.CSSProperties}><i>◆</i><strong>{pendingOre.name}</strong><small>{pendingOre.rarity.toUpperCase()}</small></span>}
        {impact && <span className="debris">{Array.from({length:8},(_,i)=><i key={i}/>)}</span>}
        <span className="pickaxe">⛏</span>
      </button>
      <div className="dig-panel"><div><span className="mouse-icon">↙</span><strong>{stage === "ore" ? "CRACK DEPOSIT" : "CLICK TO STRIKE"}</strong><small>or press SPACE</small></div><div className="integrity"><span>{stage === "ore" ? "ORE SHELL" : `TUNNEL PROGRESS · ${Math.round((1-rockHp/maxHp)*100)}%`}</span><i>{Array.from({length: 12},(_,i)=><b key={i} className={i < Math.ceil((rockHp/maxHp)*12) ? "full" : ""}/>)}</i></div></div>
      <button className="album-link" onClick={() => {setTab("album");track("album_opened",{completion:unique/25});}}>VIEW COMBINATION ALBUM <span>→</span></button>
    </section>}

    {tab === "album" && <Album save={save} />}
    {tab === "wanted" && <Wanted save={save} onHunt={(biome,ore)=>{setSave(s=>({...s,biome,huntTarget:ore}));track("hunt_started",{biome,ore_id:ore});setTab("mine");continueMine();}} />}
    {tab === "records" && <Records save={save} onReset={reset} />}
    {tab === "more" && <More save={save} setSave={setSave} onHelp={()=>{setTab("mine");setOnboarding(true)}} />}

    {found && <Reveal found={found} total={unique} biome={save.biome} onContinue={continueMine} />}
    {milestone && <Milestone data={milestone} biome={save.biome} onClose={()=>setMilestone(null)} onAlbum={()=>{setMilestone(null);setTab("album")}} />}
    {onboarding&&<Onboarding onDone={()=>{setOnboarding(false);setSave(s=>({...s,settings:{...s.settings,helpSeen:true}}));track("mine_started",{attempt:save.digs+1,biome:save.biome})}}/>}
    {share&&<ShareCard data={share} biome={save.biome} onClose={()=>setShare(null)}/>} 
    {toast && <div className="achievement" onClick={() => setToast(null)}><span>ACHIEVEMENT UNLOCKED</span><strong>{toast.name}</strong><p>{toast.text}</p></div>}
  </main>;
}

function Album({ save }: { save: Save }) {
  const [selected, setSelected] = useState(ores[0]);
  const total = minerals.filter(m => save.combos[`${selected.id}-${m.id}`]).length;
  return <section className="page album-page"><div className="page-head"><div><p className="eyebrow">FIELD CATALOGUE · VOLUME I</p><h2>COMBINATION <i>ALBUM</i></h2></div><div className="completion"><span>VOLUME COMPLETION</span><strong>{Object.keys(save.combos).length} <small>/ 25</small></strong></div></div>
    <div className="ore-tabs">{ores.map(o => {const n=minerals.filter(m=>save.combos[`${o.id}-${m.id}`]).length;return <button key={o.id} className={`${selected.id === o.id ? "selected" : ""} ${n===5?"complete":""}`} onClick={() => {setSelected(o);track("ore_page_opened",{ore_id:o.id,completion:n/5})}}><i style={{background:o.color}}/><span>{o.name.replace(" Ore","")}<small>{n}/5 {n===5?"✓":""}</small></span></button>})}</div>
    <div className={`album-title milestone-${total}`}><div><span className="ore-gem" style={{"--gem":selected.color} as React.CSSProperties}>◆</span><div><p>{selected.rarity.toUpperCase()} ORE</p><h3>{selected.name} {total===5&&<b className="complete-stamp">PAGE COMPLETE</b>}</h3><small>{total===4?`ONE LEFT: ${minerals.find(m=>!save.combos[`${selected.id}-${m.id}`])?.name}. WHERE IS IT?`:selected.note}</small></div></div><strong>{total}<small>/5 FOUND</small></strong></div>
    <div className="slots">{minerals.map((m, i) => { const key=`${selected.id}-${m.id}`, count=save.combos[key]||0; return <article key={m.id} className={count ? "found" : "locked"}><div className="slot-top"><span>0{i+1}</span><b className={`rarity ${m.rarity.toLowerCase()}`}>{count ? m.rarity.toUpperCase() : "UNKNOWN"}</b></div><div className="mineral-gem" style={{"--gem": count ? m.color : "#2b2d2e"} as React.CSSProperties}>◆</div><h4>{count ? m.name : "UNDISCOVERED"}</h4><p>{count ? m.note : "Keep digging. It is definitely in there. Probably."}</p><footer>{count ? <><span>FOUND ×{count}</span><small>FIRST: DIG #{save.first[key]}</small></> : <span>???</span>}</footer></article>})}</div>
  </section>;
}

function Wanted({save,onHunt}:{save:Save;onHunt:(b:Biome,ore:string)=>void}){
  const [sort,setSort]=useState("closest");
  const rows=ores.map(o=>({ore:o,missing:minerals.filter(m=>!save.combos[`${o.id}-${m.id}`]),found:minerals.filter(m=>save.combos[`${o.id}-${m.id}`]).length})).filter(r=>r.missing.length).sort((a,b)=>sort==="ore"?a.ore.name.localeCompare(b.ore.name):sort==="rarest"?Math.max(...b.missing.map(m=>odds(b.ore,m,save.biome)))-Math.max(...a.missing.map(m=>odds(a.ore,m,save.biome))):sort==="easiest"?Math.min(...a.missing.map(m=>odds(a.ore,m,save.biome)))-Math.min(...b.missing.map(m=>odds(b.ore,m,save.biome))):b.found-a.found);
  return <section className="page wanted-page"><div className="page-head"><div><p className="eyebrow">SPECIFIC REASONS TO KEEP SUFFERING</p><h2>MISSING <i>SPECIMENS</i></h2></div><div className="completion"><span>STILL HIDING</span><strong>{25-Object.keys(save.combos).length}</strong></div></div><div className="wanted-sort"><span>SORT HUNTS</span>{[["closest","CLOSEST"],["rarest","RAREST"],["easiest","EASIEST"],["ore","ORE"]].map(x=><button className={sort===x[0]?"active":""} key={x[0]} onClick={()=>setSort(x[0])}>{x[1]}</button>)}</div><div className="wanted-list">{rows.map(r=><article className={r.found===4?"last-one":""} key={r.ore.id}><header><span className="ore-gem" style={{"--gem":r.ore.color} as React.CSSProperties}>◆</span><div><small>{r.found===4?"FINAL TARGET":"INCOMPLETE PAGE"}</small><h3>{r.ore.name} — {r.found}/5</h3></div></header><div className="missing-grid">{r.missing.map(m=><div key={m.id}><span style={{color:m.color}}>◆</span><strong>{m.name}</strong><small>OLD 1/{odds(r.ore,m,"old")} · DEEP 1/{odds(r.ore,m,"deep")}</small></div>)}</div><footer><span>BEST LOCATION: {biomeWeights.deep[ores.indexOf(r.ore)]>biomeWeights.old[ores.indexOf(r.ore)]?"DEEP MINE":"OLD MINE"}</span><button onClick={()=>onHunt(biomeWeights.deep[ores.indexOf(r.ore)]>biomeWeights.old[ores.indexOf(r.ore)]?"deep":"old",r.ore.id)}>HUNT THIS PAGE →</button></footer></article>)}</div></section>
}

function Milestone({data,biome,onClose,onAlbum}:{data:{ore:Item;level:number;missing?:Item;attempts:number};biome:Biome;onClose:()=>void;onAlbum:()=>void}){
 return <div className={`milestone-modal level-${data.level}`}><div><p className="eyebrow">{data.level===5?"ALBUM PAGE COMPLETE":data.level===4?"ONE SPECIMEN REMAINS":"PAGE MILESTONE"}</p><span className="big-gem" style={{"--gem":data.ore.color} as React.CSSProperties}>◆</span><h2>{data.ore.name} — {data.level}/5</h2>{data.level===5&&<div className="completion-row">{minerals.map(m=><span key={m.id} style={{color:m.color}}>◆</span>)}</div>}{data.missing?<><p>Your final missing specimen is <strong>{data.missing.name}</strong>.</p><small>Current location odds: approximately 1 in {odds(data.ore,data.missing,biome)} · Recommended: {biomeWeights.deep[ores.indexOf(data.ore)]>biomeWeights.old[ores.indexOf(data.ore)]?"DEEP MINE":"OLD MINE"}</small></>:<p>{data.level===5?`Completed after ${data.attempts} ${data.ore.name} deposits. Reward: permanent page stamp.`:"The page is beginning to look dangerously achievable."}</p>}<div><button onClick={onAlbum}>{data.level===4?"HUNT THIS PAGE":"INSPECT PAGE"}</button><button onClick={onClose}>KEEP MINING</button></div></div></div>
}

function Records({ save, onReset }: { save: Save; onReset: () => void }) {
  const dupes = Object.values(save.combos).reduce((s,n)=>s+Math.max(0,n-1),0);
  const most=Object.entries(save.combos).sort((a,b)=>b[1]-a[1])[0];const mostOre=Object.entries(save.ores).sort((a,b)=>b[1]-a[1])[0];const complete=ores.filter(o=>minerals.every(m=>save.combos[`${o.id}-${m.id}`])).length;
  return <section className="page records-page"><div className="page-head"><div><p className="eyebrow">HARD EVIDENCE OF POOR PRIORITIES</p><h2>YOUR <i>RECORDS</i></h2></div></div><div className="record-grid"><article><span>TOTAL STRIKES</span><strong>{save.strikes}</strong><p>{save.distance.toFixed(1)}m of entirely necessary depth.</p></article><article><span>DEPOSITS / UNIQUE</span><strong>{save.digs} / {Object.keys(save.combos).length}</strong><p>Each one felt like the one.</p></article><article><span>DUPLICATES / WORST DROUGHT</span><strong>{dupes} / {save.longestStreak}</strong><p>Character-building, allegedly.</p></article><article><span>DARK IRON MINED</span><strong>{save.ores.dark||0}</strong><p>BRD remains a personal failure.</p></article><article><span>COMPLETED PAGES</span><strong>{complete} / 5</strong><p>Actual evidence of progress.</p></article><article><span>DUST EARNED / SPENT</span><strong>{save.dustEarned} / {save.dustSpent}</strong><p>Duplicates, ground into fashion.</p></article><article><span>MOST DUPLICATED</span><strong>{most?most[1]:0}×</strong><p>{most?most[0].replace("-"," + "):"Nothing yet"}</p></article><article><span>MOST MINED ORE</span><strong>{mostOre?mostOre[1]:0}×</strong><p>{mostOre?ores.find(o=>o.id===mostOre[0])?.name:"Nothing yet"}</p></article></div><h3 className="ach-title">ACHIEVEMENTS <span>{save.achievements.length}/{achievements.length}</span></h3><div className="ach-list">{achievements.map(a=><article className={save.achievements.includes(a.id)?"earned":""} key={a.id}><span>◆</span><div><strong>{save.achievements.includes(a.id)?a.name:"LOCKED"}</strong><p>{a.text}</p></div></article>)}</div><button className="reset" onClick={onReset}>ERASE SAVE DATA</button></section>;
}

function Onboarding({onDone}:{onDone:()=>void}){return <div className="onboarding"><div><span className="brand-mark">OW</span><p className="eyebrow">WELCOME TO YOUR NEW PROBLEM</p><h1>DIG. CLANK. CRACK. <i>COLLECT.</i></h1><p>Break the wall. Crack the ore. Fill all 25 album squares.</p><button onClick={onDone}>START MINING <span>→</span></button><small>Click the rock or press Space. That is genuinely it.</small></div></div>}

function ShareCard({data,biome,onClose}:{data:{ore:Item;mineral:Item;attempt:number;total:number};biome:Biome;onClose:()=>void}){return <div className="share-wrap"><div className="share-card"><p>ORE WHORE</p><div><span style={{color:data.ore.color}}>◆</span><b>+</b><span style={{color:data.mineral.color}}>◆</span></div><small>{data.ore.rarity.toUpperCase()} + {data.mineral.rarity.toUpperCase()}</small><h2>{data.ore.name}<br/>+ {data.mineral.name}</h2><strong>RARE DISCOVERY</strong><footer><span>NATURAL ODDS · 1 / {odds(data.ore,data.mineral,biome)}</span><span>ATTEMPT #{data.attempt} · ALBUM {data.total}/25</span></footer></div><p>Screenshot this. Nobody will believe you, but try.</p><button onClick={onClose}>CONTINUE</button></div>}

function More({save,setSave,onHelp}:{save:Save;setSave:React.Dispatch<React.SetStateAction<Save>>;onHelp:()=>void}){
 const download=(name:string,data:unknown)=>{const a=document.createElement("a");a.href=URL.createObjectURL(new Blob([JSON.stringify(data,null,2)],{type:"application/json"}));a.download=name;a.click();URL.revokeObjectURL(a.href)};
 const buy=(id:string,cost:number)=>setSave(s=>s.unlocks.includes(id)||s.dust<cost?s:{...s,dust:s.dust-cost,dustSpent:s.dustSpent+cost,unlocks:[...s.unlocks,id],equipped:id});
 const importSave=(f:File)=>{const reader=new FileReader();reader.onload=()=>{try{const x=JSON.parse(String(reader.result));if(!x||typeof x.digs!=="number"||typeof x.combos!=="object")throw 0;setSave({...blank,...x,settings:{...defaultSettings,...x.settings},schema:3});alert("Save imported.")}catch{alert("That save is malformed or incompatible. Your current save is untouched.")}};reader.readAsText(f)};
 return <section className="page more-page"><div className="page-head"><div><p className="eyebrow">COSMETICS, CONTROLS, DAMAGE CONTROL</p><h2>MINER <i>QUARTERS</i></h2></div><div className="completion"><span>SPECIMEN DUST</span><strong>✦ {save.dust}</strong></div></div><h3 className="section-label">DUST TROPHIES · COSMETIC ONLY</h3><div className="shop-grid">{cosmetics.map(c=>{const owned=save.unlocks.includes(c.id);return <article key={c.id} className={save.equipped===c.id?"equipped":""}><span>{c.kind}</span><strong>{c.name}</strong><small>No power. Just evidence.</small><button disabled={!owned&&save.dust<c.cost} onClick={()=>owned?setSave(s=>({...s,equipped:c.id})):buy(c.id,c.cost)}>{save.equipped===c.id?"EQUIPPED":owned?"EQUIP":`✦ ${c.cost}`}</button></article>})}</div><h3 className="section-label">SETTINGS</h3><div className="settings-grid"><label>MASTER VOLUME<input type="range" min="0" max="1" step=".1" value={save.settings.master} onChange={e=>setSave(s=>({...s,settings:{...s.settings,master:+e.target.value}}))}/></label><label>SFX VOLUME<input type="range" min="0" max="1" step=".1" value={save.settings.sfx} onChange={e=>setSave(s=>({...s,settings:{...s.settings,sfx:+e.target.value}}))}/></label>{(["reducedShake","reducedMotion","vibration","highContrast"] as const).map(k=><label className="toggle" key={k}><input type="checkbox" checked={save.settings[k]} onChange={e=>setSave(s=>({...s,settings:{...s.settings,[k]:e.target.checked}}))}/>{k.replace(/([A-Z])/g," $1").toUpperCase()}</label>)}</div><div className="utility-buttons"><button onClick={onHelp}>HOW TO PLAY</button><button onClick={()=>download("ore-whore-save-v03.json",save)}>EXPORT SAVE</button><label>IMPORT SAVE<input type="file" accept="application/json" onChange={e=>e.target.files?.[0]&&importSave(e.target.files[0])}/></label><button onClick={()=>download("ore-whore-analytics.json",JSON.parse(localStorage.getItem("ore-whore-analytics-v1")||"[]"))}>EXPORT PLAYTEST DATA</button></div></section>
}

function Reveal({ found, total, biome, onContinue }: { found: {ore:Item;mineral:Item;isNew:boolean;count:number}; total:number;biome:Biome; onContinue:()=>void }) {
  const comboOdds = odds(found.ore,found.mineral,biome);
  const huge = found.mineral.rarity === "Mythic" || (found.ore.rarity === "Legendary" && found.mineral.rarity === "Epic");
  return <div className={`reveal ${huge?"mythic":""} ${!found.isNew&&!huge?"quick":""}`}><div className="reveal-card"><button className="close" onClick={onContinue}>×</button><p className="eyebrow">DEPOSIT CRACKED</p><div className="combo-art"><span className="big-gem ore" style={{"--gem":found.ore.color} as React.CSSProperties}>◆</span><b>+</b><span className="big-gem mineral" style={{"--gem":found.mineral.color} as React.CSSProperties}>◆</span></div><div className="names"><div><small>{found.ore.rarity}</small><strong>{found.ore.name}</strong></div><b>CONTAINING</b><div><small>{found.mineral.rarity}</small><strong>{found.mineral.name}</strong></div></div><div className={`verdict ${found.isNew?"new":"duplicate"}`}><span>{found.isNew ? (huge?"MYTHIC DISCOVERY":"NEW COMBINATION") : `DUPLICATE ×${found.count}`}</span><strong>{found.isNew ? `${total} / 25` : `+${dustByRarity[found.mineral.rarity]} SPECIMEN DUST`}</strong><small>NATURAL ODDS · APPROX. 1 IN {comboOdds.toLocaleString()}</small></div><button className="continue" onClick={onContinue}>{found.isNew?"CONTINUE MINING":"AGAIN. NOW."} <span>→</span></button></div></div>;
}
