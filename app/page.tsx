"use client";

import { useEffect, useMemo, useState } from "react";

type Rarity = "Common" | "Uncommon" | "Rare" | "Epic" | "Legendary" | "Mythic";
type Item = { id: string; name: string; rarity: Rarity; weight: number; color: string; note: string };
type Save = { digs: number; strikes: number; distance: number; combos: Record<string, number>; ores: Record<string, number>; minerals: Record<string, number>; first: Record<string, number>; achievements: string[]; streak: number };

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

const blank: Save = { digs: 0, strikes: 0, distance: 0, combos: {}, ores: {}, minerals: {}, first: {}, achievements: [], streak: 0 };
const pick = (items: Item[]) => { let n = Math.random() * items.reduce((s, i) => s + i.weight, 0); return items.find(i => (n -= i.weight) <= 0) || items[0]; };

export default function Home() {
  const [save, setSave] = useState<Save>(blank);
  const [loaded, setLoaded] = useState(false);
  const [tab, setTab] = useState<"mine" | "album" | "records">("mine");
  const [stage, setStage] = useState<"tunnel" | "ore">("tunnel");
  const [maxHp, setMaxHp] = useState(21);
  const [rockHp, setRockHp] = useState(21);
  const [pendingOre, setPendingOre] = useState<Item | null>(null);
  const [impact, setImpact] = useState<number | null>(null);
  const [found, setFound] = useState<{ ore: Item; mineral: Item; isNew: boolean; count: number } | null>(null);
  const [toast, setToast] = useState<{ name: string; text: string } | null>(null);

  useEffect(() => { try { const raw = localStorage.getItem("ore-whore-save-v1"); if (raw) setSave(JSON.parse(raw)); } catch {} setLoaded(true); }, []);
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
    if (navigator.vibrate) navigator.vibrate(stage === "ore" ? 35 : 12);
    setSave(s => ({ ...s, strikes: s.strikes + 1, distance: +(s.distance + (stage === "tunnel" ? 0.4 : 0)).toFixed(1) }));
    if (hit > 0) return setRockHp(hit);
    if (stage === "tunnel") {
      const ore = pick(ores);
      setPendingOre(ore);
      setStage("ore");
      setMaxHp(3);
      setRockHp(3);
      return;
    }
    const ore = pendingOre || pick(ores), mineral = pick(minerals), key = `${ore.id}-${mineral.id}`;
    setSave(s => {
      const isNew = !s.combos[key];
      const next: Save = { ...s, digs: s.digs + 1, combos: { ...s.combos, [key]: (s.combos[key] || 0) + 1 }, ores: { ...s.ores, [ore.id]: (s.ores[ore.id] || 0) + 1 }, minerals: { ...s.minerals, [mineral.id]: (s.minerals[mineral.id] || 0) + 1 }, first: isNew ? { ...s.first, [key]: s.digs + 1 } : s.first, streak: isNew ? 0 : s.streak + 1 };
      const fresh = unlocked(next, ore, mineral);
      next.achievements = [...s.achievements, ...fresh];
      if (fresh[0]) { const a = achievements.find(x => x.id === fresh[0])!; setTimeout(() => setToast(a), 650); }
      setFound({ ore, mineral, isNew, count: next.combos[key] });
      return next;
    });
  };

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.code === "Space" && tab === "mine" && !found) { event.preventDefault(); strike(); }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  });

  const continueMine = () => { const hp=18+Math.floor(Math.random()*7); setFound(null); setPendingOre(null); setStage("tunnel"); setMaxHp(hp); setRockHp(hp); };
  const unique = Object.keys(save.combos).length;
  const reset = () => { if (confirm("Erase every discovery and return to the cold, uncaring rock?")) { setSave(blank); setFound(null); setPendingOre(null); setStage("tunnel"); setMaxHp(21); setRockHp(21); } };

  return <main>
    <header className="topbar">
      <button className="brand" onClick={() => setTab("mine")}><span className="brand-mark">OW</span><span>ORE WHORE<small>COMPULSIVE GEOLOGY</small></span></button>
      <nav aria-label="Primary">
        <button className={tab === "mine" ? "active" : ""} onClick={() => setTab("mine")}>MINE</button>
        <button className={tab === "album" ? "active" : ""} onClick={() => setTab("album")}>ALBUM <b>{unique}/25</b></button>
        <button className={tab === "records" ? "active" : ""} onClick={() => setTab("records")}>RECORDS</button>
      </nav>
      <div className="depth"><span>DEPTH</span><strong>{save.distance.toFixed(1)}m</strong></div>
    </header>

    {tab === "mine" && <section className={`mine-screen ${impact ? "screen-hit" : ""} stage-${stage}`}>
      <div className="mine-copy"><p className="eyebrow">{stage === "ore" ? "CLANK · DEPOSIT EXPOSED" : "SHIFT 01 · THE LONG WALL"}</p><h1>{stage === "ore" ? <><i>ORE</i> FOUND.</> : <>KEEP <i>DIGGING.</i></>}</h1><p>{stage === "ore" ? `${pendingOre?.name}. Crack it open and see what ruined your evening.` : <>The rock does not care about your album.<br/>Unfortunately, you do.</>}</p></div>
      <div className="stats-row"><span><small>DEPOSITS</small>{save.digs}</span><span><small>UNIQUE</small>{unique}<em>/ 25</em></span><span><small>DRY STREAK</small>{save.streak}</span></div>
      <button className={`rock ${impact ? "hit" : ""} ${stage === "ore" ? "ore-rock" : ""}`} onClick={strike} aria-label={stage === "ore" ? "Crack the exposed ore deposit" : "Strike the rock wall"}>
        {Array.from({ length: 18 }, (_, i) => <span key={i} className={`stone s${i}`} />)}
        <span className="crack c1"/><span className="crack c2"/><span className="crack c3"/>
        {stage === "ore" && pendingOre && <span className="exposed-ore" style={{"--ore":pendingOre.color} as React.CSSProperties}><i>◆</i><strong>{pendingOre.name}</strong><small>{pendingOre.rarity.toUpperCase()}</small></span>}
        {impact && <span className="debris">{Array.from({length:8},(_,i)=><i key={i}/>)}</span>}
        <span className="pickaxe">⛏</span>
      </button>
      <div className="dig-panel"><div><span className="mouse-icon">↙</span><strong>{stage === "ore" ? "CRACK DEPOSIT" : "CLICK TO STRIKE"}</strong><small>or press SPACE</small></div><div className="integrity"><span>{stage === "ore" ? "ORE SHELL" : `TUNNEL PROGRESS · ${Math.round((1-rockHp/maxHp)*100)}%`}</span><i>{Array.from({length: 12},(_,i)=><b key={i} className={i < Math.ceil((rockHp/maxHp)*12) ? "full" : ""}/>)}</i></div></div>
      <button className="album-link" onClick={() => setTab("album")}>VIEW COMBINATION ALBUM <span>→</span></button>
    </section>}

    {tab === "album" && <Album save={save} />}
    {tab === "records" && <Records save={save} onReset={reset} />}

    {found && <Reveal found={found} total={unique} onContinue={continueMine} />}
    {toast && <div className="achievement" onClick={() => setToast(null)}><span>ACHIEVEMENT UNLOCKED</span><strong>{toast.name}</strong><p>{toast.text}</p></div>}
  </main>;
}

function Album({ save }: { save: Save }) {
  const [selected, setSelected] = useState(ores[0]);
  const total = minerals.filter(m => save.combos[`${selected.id}-${m.id}`]).length;
  return <section className="page album-page"><div className="page-head"><div><p className="eyebrow">FIELD CATALOGUE · VOLUME I</p><h2>COMBINATION <i>ALBUM</i></h2></div><div className="completion"><span>VOLUME COMPLETION</span><strong>{Object.keys(save.combos).length} <small>/ 25</small></strong></div></div>
    <div className="ore-tabs">{ores.map(o => <button key={o.id} className={selected.id === o.id ? "selected" : ""} onClick={() => setSelected(o)}><i style={{background:o.color}}/><span>{o.name.replace(" Ore","")}<small>{minerals.filter(m=>save.combos[`${o.id}-${m.id}`]).length}/5</small></span></button>)}</div>
    <div className="album-title"><div><span className="ore-gem" style={{"--gem":selected.color} as React.CSSProperties}>◆</span><div><p>{selected.rarity.toUpperCase()} ORE</p><h3>{selected.name}</h3><small>{selected.note}</small></div></div><strong>{total}<small>/5 FOUND</small></strong></div>
    <div className="slots">{minerals.map((m, i) => { const key=`${selected.id}-${m.id}`, count=save.combos[key]||0; return <article key={m.id} className={count ? "found" : "locked"}><div className="slot-top"><span>0{i+1}</span><b className={`rarity ${m.rarity.toLowerCase()}`}>{count ? m.rarity.toUpperCase() : "UNKNOWN"}</b></div><div className="mineral-gem" style={{"--gem": count ? m.color : "#2b2d2e"} as React.CSSProperties}>◆</div><h4>{count ? m.name : "UNDISCOVERED"}</h4><p>{count ? m.note : "Keep digging. It is definitely in there. Probably."}</p><footer>{count ? <><span>FOUND ×{count}</span><small>FIRST: DIG #{save.first[key]}</small></> : <span>???</span>}</footer></article>})}</div>
  </section>;
}

function Records({ save, onReset }: { save: Save; onReset: () => void }) {
  const dupes = Object.values(save.combos).reduce((s,n)=>s+Math.max(0,n-1),0);
  return <section className="page records-page"><div className="page-head"><div><p className="eyebrow">HARD EVIDENCE OF POOR PRIORITIES</p><h2>YOUR <i>RECORDS</i></h2></div></div><div className="record-grid"><article><span>TOTAL STRIKES</span><strong>{save.strikes}</strong><p>Your wrist sends its regards.</p></article><article><span>DEPOSITS CRACKED</span><strong>{save.digs}</strong><p>Each one felt like the one.</p></article><article><span>DUPLICATES</span><strong>{dupes}</strong><p>Character-building, allegedly.</p></article><article><span>LONGEST CURRENT DROUGHT</span><strong>{save.streak}</strong><p>digs without a new square</p></article></div><h3 className="ach-title">ACHIEVEMENTS <span>{save.achievements.length}/{achievements.length}</span></h3><div className="ach-list">{achievements.map(a=><article className={save.achievements.includes(a.id)?"earned":""} key={a.id}><span>◆</span><div><strong>{save.achievements.includes(a.id)?a.name:"LOCKED"}</strong><p>{a.text}</p></div></article>)}</div><button className="reset" onClick={onReset}>ERASE SAVE DATA</button></section>;
}

function Reveal({ found, total, onContinue }: { found: {ore:Item;mineral:Item;isNew:boolean;count:number}; total:number; onContinue:()=>void }) {
  const comboOdds = Math.round(10000 / (found.ore.weight * found.mineral.weight));
  const huge = found.mineral.rarity === "Mythic" || (found.ore.rarity === "Legendary" && found.mineral.rarity === "Epic");
  return <div className={`reveal ${huge?"mythic":""}`}><div className="reveal-card"><button className="close" onClick={onContinue}>×</button><p className="eyebrow">DEPOSIT CRACKED</p><div className="combo-art"><span className="big-gem ore" style={{"--gem":found.ore.color} as React.CSSProperties}>◆</span><b>+</b><span className="big-gem mineral" style={{"--gem":found.mineral.color} as React.CSSProperties}>◆</span></div><div className="names"><div><small>{found.ore.rarity}</small><strong>{found.ore.name}</strong></div><b>CONTAINING</b><div><small>{found.mineral.rarity}</small><strong>{found.mineral.name}</strong></div></div><div className={`verdict ${found.isNew?"new":"duplicate"}`}><span>{found.isNew ? (huge?"MYTHIC DISCOVERY":"NEW COMBINATION") : `DUPLICATE ×${found.count}`}</span><strong>{found.isNew ? `${total} / 25` : "THE ROCK REMEMBERS"}</strong><small>NATURAL ODDS · APPROX. 1 IN {comboOdds.toLocaleString()}</small></div><button className="continue" onClick={onContinue}>CONTINUE MINING <span>→</span></button></div></div>;
}
