"use client";

import { useEffect, useRef, useState } from "react";
import { track } from "./analytics";

type Rarity = "Common" | "Uncommon" | "Rare" | "Epic" | "Legendary" | "Mythic";
type Item = { id: string; name: string; rarity: Rarity; weight: number; color: string; note: string };
type Biome = "old" | "deep" | "outland" | "northrend";
type Settings = { master:number;sfx:number;reducedShake:boolean;reducedMotion:boolean;vibration:boolean;highContrast:boolean;helpSeen:boolean };
type Save = { digs: number; strikes: number; distance: number; combos: Record<string, number>; ores: Record<string, number>; minerals: Record<string, number>; first: Record<string, number>; achievements: string[]; streak: number; longestStreak:number;newStreak:number;longestNewStreak:number; dust: number; dustEarned:number;dustSpent:number; biome: Biome; unlockedBiomes:Biome[]; completedBiomes:Biome[]; milestones: Record<string, number>; lastDigAt: number; schema: number; settings:Settings;unlocks:string[];equipped:string;huntTarget:string|null;huntCounts:Record<string,number>;huntStartedAtDig:number;longestHunt:number };

const ores: Item[] = [
  { id: "copper", name: "Copper Ore", rarity: "Common", weight: 48, color: "#d88156", note: "Honest rock for dishonest amounts of time." },
  { id: "tin", name: "Tin Ore", rarity: "Common", weight: 35, color: "#a8aaa4", note: "Copper's less charismatic colleague." },
  { id: "silver", name: "Silver Ore", rarity: "Uncommon", weight: 20, color: "#d7e0df", note: "Shiny enough to briefly restore morale." },
  { id: "iron", name: "Iron Ore", rarity: "Uncommon", weight: 29, color: "#9da5a3", note: "Industrial. Dependable. Completely unimpressed by you." },
  { id: "gold", name: "Gold Ore", rarity: "Rare", weight: 15, color: "#e6bb43", note: "Worth less than the missing square, somehow." },
  { id: "mithril", name: "Mithril Ore", rarity: "Rare", weight: 15, color: "#63c7b2", note: "Light enough to carry your growing disappointment." },
  { id: "truesilver", name: "Truesilver Ore", rarity: "Rare", weight: 10, color: "#b9d8ef", note: "Silver, but with a superiority complex." },
  { id: "dark", name: "Dark Iron Ore", rarity: "Epic", weight: 6, color: "#9a5369", note: "Somehow, Blackrock Depths returned." },
  { id: "thorium", name: "Thorium Ore", rarity: "Epic", weight: 6, color: "#80a69d", note: "Dense, green, and responsible for several lost weekends." },
  { id: "feliron", name: "Fel Iron Ore", rarity: "Uncommon", weight: 18, color: "#83b85c", note: "Outland's most available bad decision." },
  { id: "adamantite", name: "Adamantite Ore", rarity: "Rare", weight: 10, color: "#679f86", note: "Harder than your stated commitment to stopping." },
  { id: "khorium", name: "Khorium Ore", rarity: "Legendary", weight: 3, color: "#db7fe7", note: "There it is. Remain calm. You cannot." },
  { id: "cobalt", name: "Cobalt Ore", rarity: "Uncommon", weight: 20, color: "#3b8ccb", note: "Cold blue competence." },
  { id: "saronite", name: "Saronite Ore", rarity: "Epic", weight: 8, color: "#476e55", note: "It whispers. Mostly insults." },
  { id: "titanium", name: "Titanium Ore", rarity: "Legendary", weight: 2, color: "#6dc6df", note: "The crown jewel. Try to act normal." },
];

const minerals: Item[] = [
  { id: "malachite", name: "Malachite", rarity: "Common", weight: 24, color: "#58b873", note: "Green and aggressively available." },
  { id: "tigerseye", name: "Tigerseye", rarity: "Common", weight: 18, color: "#c8954d", note: "It sees how long you have been here." },
  { id: "shadowgem", name: "Shadowgem", rarity: "Common", weight: 14, color: "#806595", note: "A gloomy pebble with branding." },
  { id: "mossagate", name: "Moss Agate", rarity: "Uncommon", weight: 11, color: "#7da66e", note: "A terrarium nobody requested." },
  { id: "jade", name: "Jade", rarity: "Uncommon", weight: 8, color: "#72c48b", note: "Green, glossy, and statistically inevitable." },
  { id: "moonstone", name: "Lesser Moonstone", rarity: "Uncommon", weight: 7, color: "#a9b5dc", note: "The moonstone they had in the back." },
  { id: "citrine", name: "Citrine", rarity: "Rare", weight: 5, color: "#f0ba52", note: "A tiny captive sunset." },
  { id: "aquamarine", name: "Aquamarine", rarity: "Rare", weight: 4, color: "#57c8d4", note: "Ocean-colored. Found underground. Fine." },
  { id: "starruby", name: "Star Ruby", rarity: "Rare", weight: 3, color: "#e05566", note: "Red enough to imply importance." },
  { id: "vitriol", name: "Black Vitriol", rarity: "Epic", weight: 2.2, color: "#66506f", note: "A mean little inclusion." },
  { id: "largeopal", name: "Large Opal", rarity: "Epic", weight: 1.5, color: "#d8b5eb", note: "Iridescent and annoyingly absent." },
  { id: "sapphire", name: "Blue Sapphire", rarity: "Epic", weight: 1, color: "#4d7ee7", note: "A blue flash in the dark." },
  { id: "diamond", name: "Azerothian Diamond", rarity: "Legendary", weight: .7, color: "#e6f4ff", note: "Naturally occurring smugness." },
  { id: "emerald", name: "Huge Emerald", rarity: "Legendary", weight: .4, color: "#2de18a", note: "Unreasonably green. Unreasonably missing." },
  { id: "arcane", name: "Arcane Crystal", rarity: "Mythic", weight: .2, color: "#ff75df", note: "A geological clerical error." },
];

const achievements = [
  { id: "first", name: "FIRST VEIN", text: "Discover your first ore." },
  { id: "prospector", name: "PROSPECTOR", text: "Discover 5 ore types." },
  { id: "master", name: "MASTER PROSPECTOR", text: "Discover all 15 ore types." },
  { id: "mineralogist", name: "MINERALOGIST", text: "Discover 10 minerals." },
  { id: "fullset", name: "FULL SET", text: "Discover all 15 minerals." },
  { id: "again", name: "THIS SHIT AGAIN?", text: "Mine your first Dark Iron Ore." },
  { id: "seriously", name: "SERIOUSLY?", text: "Mine 25 Dark Iron Ore." },
  { id: "brd", name: "I'M NOT GOING BACK TO BRD", text: "Mine 100 Dark Iron Ore." },
  { id: "darkwhore", name: "DARK IRON WHORE", text: "Complete the Dark Iron page. You did this to yourself." },
  { id: "problem", name: "I HAVE A PROBLEM", text: "Complete 25 digs." },
  { id: "vein", name: "FULL VEIN", text: "Complete all minerals for one ore." },
  { id: "unhinged", name: "GEOLOGICALLY UNHINGED", text: "Find a Mythic mineral." },
  { id: "half", name: "HALF THE MOUNTAIN", text: "Complete half of Volume I." },
  { id: "thousand", name: "ONE IN A THOUSAND", text: "Find a combination rarer than 1 in 1,000." },
  { id: "titanium", name: "TITANIUM FINALLY", text: "Discover Titanium Ore." },
  { id: "orewhore", name: "THE ORE WHORE", text: "Complete all 225 combinations." },
];

const defaultSettings:Settings={master:.7,sfx:.8,reducedShake:false,reducedMotion:false,vibration:true,highContrast:false,helpSeen:false};
const blank: Save = { digs: 0, strikes: 0, distance: 0, combos: {}, ores: {}, minerals: {}, first: {}, achievements: [], streak: 0,longestStreak:0,newStreak:0,longestNewStreak:0, dust: 0,dustEarned:0,dustSpent:0, biome: "old", unlockedBiomes:["old"], completedBiomes:[], milestones: {}, lastDigAt: 0, schema: 6,settings:defaultSettings,unlocks:[],equipped:"standard",huntTarget:null,huntCounts:{},huntStartedAtDig:0,longestHunt:0 };
const cosmetics=[{id:"rust",name:"Rustbite Pick",cost:15,kind:"PICKAXE"},{id:"neon",name:"Toxic Impact",cost:30,kind:"IMPACT"},{id:"gilded",name:"Gilded Album",cost:45,kind:"ALBUM"},{id:"deepframe",name:"Deep-Mine Frame",cost:60,kind:"ALBUM"},{id:"menace",name:"Geological Menace",cost:75,kind:"TITLE"},{id:"void",name:"Void Pick",cost:100,kind:"PICKAXE"},{id:"fel",name:"Fel Dust",cost:35,kind:"IMPACT"},{id:"frost",name:"Frostbite Pick",cost:55,kind:"PICKAXE"},{id:"saroniteframe",name:"Saronite Whisper",cost:70,kind:"ALBUM"},{id:"prospector",name:"Master Prospector",cost:80,kind:"TITLE"},{id:"khoriumframe",name:"Khorium Prestige",cost:110,kind:"REVEAL"},{id:"titan",name:"Titanium Crown",cost:140,kind:"PICKAXE"},{id:"brdtitle",name:"Not Going Back",cost:95,kind:"TITLE"},{id:"arcaneimpact",name:"Arcane Fracture",cost:125,kind:"IMPACT"},{id:"volumeone",name:"Volume I Victor",cost:180,kind:"ALBUM"},{id:"orewhoretitle",name:"THE ORE WHORE",cost:999,kind:"TITLE"},{id:"orewhorepick",name:"The Final Pick",cost:999,kind:"PICKAXE"},{id:"orewhorealbum",name:"225 Stamp",cost:999,kind:"ALBUM"},{id:"centerpiece",name:"Mountain's Regret",cost:999,kind:"TROPHY"}];
const biomeWeights: Record<Biome, number[]> = {
 old:[28,20,12,18,10,8,2,1,1,0,0,0,0,0,0],
 deep:[1,2,4,10,5,22,18,15,18,1,1,1,1,1,0],
 outland:[0,0,0,0,0,2,2,1,2,34,34,18,3,2,2],
 northrend:[0,0,0,0,0,0,0,1,1,1,2,2,38,35,20]
};
const biomeNames:Record<Biome,string>={old:"OLD MINE",deep:"DEEP MINE",outland:"OUTLAND MINE",northrend:"NORTHREND MINE"};
const biomeOrder:Biome[]=["old","deep","outland","northrend"];
const biomePages:Record<Biome,string[]>={old:["copper","tin","silver","iron","gold"],deep:["mithril","truesilver","dark","thorium"],outland:["feliron","adamantite","khorium"],northrend:["cobalt","saronite","titanium"]};
const completedPages=(save:Save,biome:Biome)=>biomePages[biome].filter(id=>minerals.every(m=>save.combos[`${id}-${m.id}`])).length;
const biomeComplete=(save:Save,biome:Biome)=>completedPages(save,biome)===biomePages[biome].length;
const bestBiome=(ore:Item):Biome=>(Object.keys(biomeWeights) as Biome[]).sort((a,b)=>biomeWeights[b][ores.indexOf(ore)]-biomeWeights[a][ores.indexOf(ore)])[0];
const bestAvailableBiome=(ore:Item,available:Biome[]):Biome=>[...available].sort((a,b)=>biomeWeights[b][ores.indexOf(ore)]-biomeWeights[a][ores.indexOf(ore)])[0]||"old";
const huntBoost=(save:Save)=>save.huntTarget?Math.min(5,1+Math.max(0,save.digs-save.huntStartedAtDig-40)/20):1;
const distributionLabel=(b:Biome)=>{const ws=biomeWeights[b],sum=ws.reduce((a,x)=>a+x,0);return ores.map((o,i)=>({o,w:ws[i]})).filter(x=>x.w>0).map(x=>`${x.o.name.replace(" Ore","")} ${Math.round(x.w/sum*100)}%`).join(" · ")};
const dustByRarity: Record<Rarity,number> = { Common:1, Uncommon:2, Rare:3, Epic:5, Legendary:8, Mythic:12 };
const makeRng = (seed:number) => () => { seed |= 0; seed = seed + 0x6D2B79F5 | 0; let t=Math.imul(seed^seed>>>15,1|seed); t=t+Math.imul(t^t>>>7,61|t)^t; return ((t^t>>>14)>>>0)/4294967296; };
const pick = (items: Item[], random:()=>number, weights?:number[]) => { const ws=weights||items.map(i=>i.weight); let n=random()*ws.reduce((s,w)=>s+w,0); return items.find((_,i)=>(n-=ws[i])<=0)||items[0]; };
const odds = (ore:Item,mineral:Item,biome:Biome) => {const ow=biomeWeights[biome],oi=ores.indexOf(ore);if(!ow[oi])return Infinity;return Math.round((ow.reduce((a,b)=>a+b,0)*minerals.reduce((a,b)=>a+b.weight,0))/(ow[oi]*mineral.weight))};
const migrate=(old:any):Save=>{const map:Record<string,string>={quartz:"malachite",jade:"jade",citrine:"citrine",opal:"largeopal",star:"arcane"};const combos:Record<string,number>={},first:Record<string,number>={};for(const [k,v] of Object.entries(old.combos||{})){const p=k.lastIndexOf("-");const o=k.slice(0,p),m=k.slice(p+1);combos[`${o}-${map[m]||m}`]=Number(v)}for(const [k,v] of Object.entries(old.first||{})){const p=k.lastIndexOf("-");const o=k.slice(0,p),m=k.slice(p+1);first[`${o}-${map[m]||m}`]=Number(v)}const mineralCounts:Record<string,number>={};for(const [k,v] of Object.entries(old.minerals||{}))mineralCounts[map[k]||k]=(mineralCounts[map[k]||k]||0)+Number(v);const biome:Biome=biomeOrder.includes(old.biome)?old.biome:"old";const saved=Array.isArray(old.unlockedBiomes)?old.unlockedBiomes.filter((b:unknown):b is Biome=>biomeOrder.includes(b as Biome)):biomeOrder.slice(0,biomeOrder.indexOf(biome)+1);const unlockedBiomes=biomeOrder.filter(b=>b==="old"||saved.includes(b));const completedBiomes=Array.isArray(old.completedBiomes)?old.completedBiomes.filter((b:unknown):b is Biome=>biomeOrder.includes(b as Biome)):[];return {...blank,...old,combos,first,minerals:mineralCounts,settings:{...defaultSettings,...old.settings},schema:6,biome,unlockedBiomes,completedBiomes}}

export default function Home() {
  const [save, setSave] = useState<Save>(blank);
  const [loaded, setLoaded] = useState(false);
  const [tab, setTab] = useState<"mine" | "album" | "wanted" | "records" | "more">("mine");
  const [stage, setStage] = useState<"tunnel" | "ore">("tunnel");
  const [maxHp, setMaxHp] = useState(12);
  const [rockHp, setRockHp] = useState(12);
  const [pendingOre, setPendingOre] = useState<Item | null>(null);
  const [impact, setImpact] = useState<number | null>(null);
  const [hitPoint, setHitPoint] = useState({x:50,y:48});
  const [found, setFound] = useState<{ ore: Item; mineral: Item; isNew: boolean; count: number } | null>(null);
  const [toast, setToast] = useState<{ name: string; text: string } | null>(null);
  const [milestone, setMilestone] = useState<{ore:Item;level:number;missing?:Item;attempts:number} | null>(null);
  const [mineCompletion,setMineCompletion]=useState<{completed:Biome;next?:Biome}|null>(null);
  const [onboarding,setOnboarding]=useState(false);
  const [share,setShare]=useState<{ore:Item;mineral:Item;attempt:number;total:number}|null>(null);
  const seed = typeof window !== "undefined" ? Number(new URLSearchParams(location.search).get("seed")) : 0;
  const rng = useRef<()=>number>(makeRng(seed || Date.now()));
  const sessionDigs = useRef(0);

  useEffect(() => { try { const last=Number(localStorage.getItem("ore-whore-last-session")||0);if(last)track("return_visit",{hours_since_previous_session:(Date.now()-last)/3600000}); const raw = localStorage.getItem("ore-whore-save-v1"); if (raw){const old=JSON.parse(raw);setSave(migrate(old));setOnboarding(!old.settings?.helpSeen&&!(old.digs>0));}else setOnboarding(true); } catch {setOnboarding(true)} setLoaded(true); track("session_start",{seed:seed||null,build:"v0.4",analytics_schema:2}); const end=()=>{localStorage.setItem("ore-whore-last-session",String(Date.now()));track("session_end",{session_digs:sessionDigs.current})}; addEventListener("pagehide",end); return()=>removeEventListener("pagehide",end); }, []);
  useEffect(() => { if (loaded) localStorage.setItem("ore-whore-save-v1", JSON.stringify(save)); }, [save, loaded]);
  useEffect(()=>{if(!loaded)return;const n=Object.keys(save.combos).length;const rewards:[number,string[]][]=[[23,["rust"]],[57,["gilded"]],[113,["menace"]],[169,["khoriumframe"]],[203,["titan"]],[225,["volumeone","orewhoretitle","orewhorepick","orewhorealbum","centerpiece"]]];const earned=rewards.filter(x=>n>=x[0]).flatMap(x=>x[1]).filter(id=>!save.unlocks.includes(id));if(earned.length)setSave(s=>({...s,unlocks:[...s.unlocks,...earned]}))},[loaded,save.combos,save.unlocks]);
  useEffect(()=>{if(!loaded||mineCompletion)return;const completed=biomeOrder.find(b=>save.unlockedBiomes.includes(b)&&biomeComplete(save,b)&&!save.completedBiomes.includes(b));if(!completed)return;const i=biomeOrder.indexOf(completed),next=i<biomeOrder.length-1?biomeOrder[i+1]:undefined;setSave(s=>({...s,completedBiomes:[...s.completedBiomes,completed],unlockedBiomes:next&&!s.unlockedBiomes.includes(next)?[...s.unlockedBiomes,next]:s.unlockedBiomes}));setMineCompletion({completed,next});track("biome_completed",{biome:completed,digs:save.digs,pages:biomePages[completed].length});if(next)track("biome_unlocked",{biome:next});},[loaded,save.combos,save.unlockedBiomes,save.completedBiomes,mineCompletion]);

  const unlocked = (next: Save, ore: Item, mineral: Item) => {
    const ids: string[] = [];
    if (next.digs >= 1) ids.push("first");
    if (Object.keys(next.ores).filter(k=>next.ores[k]>0).length>=5) ids.push("prospector");
    if (Object.keys(next.ores).filter(k=>next.ores[k]>0).length>=15) ids.push("master");
    if (Object.keys(next.minerals).filter(k=>next.minerals[k]>0).length>=10) ids.push("mineralogist");
    if (Object.keys(next.minerals).filter(k=>next.minerals[k]>0).length>=15) ids.push("fullset");
    if (ore.id === "dark") ids.push("again");
    if ((next.ores.dark||0)>=25) ids.push("seriously");
    if ((next.ores.dark||0)>=100) ids.push("brd");
    if (next.digs >= 25) ids.push("problem");
    if (mineral.rarity === "Mythic") ids.push("unhinged");
    if (ores.some(o => minerals.every(m => next.combos[`${o.id}-${m.id}`]))) ids.push("vein");
    if (minerals.every(m=>next.combos[`dark-${m.id}`])) ids.push("darkwhore");
    if (Object.keys(next.combos).length>=113) ids.push("half");
    if (odds(ore,mineral,next.biome)>=1000) ids.push("thousand");
    if (ore.id==="titanium") ids.push("titanium");
    if (Object.keys(next.combos).length>=225) ids.push("orewhore");
    return ids.filter(id => !next.achievements.includes(id));
  };

  const strike = (point?:{x:number;y:number}) => {
    if (found) return;
    setHitPoint(point||{x:50,y:48});
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
    const ore = pendingOre || pick(ores,rng.current,biomeWeights[save.biome]);
    const targetParts=save.huntTarget?.split("-")||[],boost=huntBoost(save),mineralWeights=minerals.map(m=>m.weight*(targetParts[0]===ore.id&&targetParts[1]===m.id?boost:1));
    const mineral = pick(minerals,rng.current,mineralWeights), key = `${ore.id}-${mineral.id}`;
    playImpact("crack");
    setSave(s => {
      const isNew = !s.combos[key];
      const dustGain=isNew?0:dustByRarity[mineral.rarity];
      const before=minerals.filter(m=>s.combos[`${ore.id}-${m.id}`]).length;
      const after=isNew?before+1:before;
      const newStreak=isNew?0:s.streak+1,newDiscoveryStreak=isNew?s.newStreak+1:0,targetHit=s.huntTarget===key;
      const next: Save = { ...s, digs: s.digs + 1, dust:s.dust+dustGain,dustEarned:s.dustEarned+dustGain, combos: { ...s.combos, [key]: (s.combos[key] || 0) + 1 }, ores: { ...s.ores, [ore.id]: (s.ores[ore.id] || 0) + 1 }, minerals: { ...s.minerals, [mineral.id]: (s.minerals[mineral.id] || 0) + 1 }, first: isNew ? { ...s.first, [key]: s.digs + 1 } : s.first, streak:newStreak,longestStreak:Math.max(s.longestStreak,newStreak),newStreak:newDiscoveryStreak,longestNewStreak:Math.max(s.longestNewStreak,newDiscoveryStreak), lastDigAt:Date.now(),huntTarget:targetHit?null:s.huntTarget,longestHunt:targetHit?Math.max(s.longestHunt,s.digs+1-s.huntStartedAtDig):s.longestHunt, milestones:{...s.milestones,...(after>=5?{[ore.id]:Math.max(s.milestones[ore.id]||0,after)}:{})} };
      const fresh = unlocked(next, ore, mineral);
      next.achievements = [...s.achievements, ...fresh];
      if (fresh[0]) { const a = achievements.find(x => x.id === fresh[0])!; setTimeout(() => setToast(a), 650); }
      setFound({ ore, mineral, isNew, count: next.combos[key] });
      sessionDigs.current++;
      const context={attempt:next.digs,session_dig:sessionDigs.current,ore_id:ore.id,mineral_id:mineral.id,combination_id:key,rarity:mineral.rarity,biome:s.biome,duplicate_count:next.combos[key],album_completion:Object.keys(next.combos).length/225,time_since_previous_dig_ms:s.lastDigAt?Date.now()-s.lastDigAt:null,hunt_boost:boost};
      track("mineral_found",context); track(isNew?"combination_new":"combination_duplicate",context);
      if(isNew&&[5,10,12,14,15].includes(after)){track(after===15?"page_completed":after===14?"page_milestone_4":"page_milestone_3",{...context,page:ore.id,level:after}); setTimeout(()=>setMilestone({ore,level:after,attempts:next.ores[ore.id],missing:after===14?minerals.find(m=>!next.combos[`${ore.id}-${m.id}`]):undefined}),400);}
      fresh.forEach(id=>track("achievement_unlocked",{achievement_id:id}));
      if(s.huntTarget===key)setTimeout(()=>setToast({name:"TARGET ACQUIRED",text:`${ore.name} + ${mineral.name}. The hunt is over. Find a worse one.`}),250);
      if(isNew&&(ore.rarity==="Legendary"||mineral.rarity==="Mythic"||odds(ore,mineral,s.biome)>=500))setTimeout(()=>setShare({ore,mineral,attempt:next.digs,total:Object.keys(next.combos).length}),700);
      return next;
    });
  };

  const strikeAtPointer=(event:React.MouseEvent<HTMLButtonElement>)=>{const rect=event.currentTarget.getBoundingClientRect();strike({x:Math.max(4,Math.min(96,(event.clientX-rect.left)/rect.width*100)),y:Math.max(5,Math.min(95,(event.clientY-rect.top)/rect.height*100))})};

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
        <button className={tab === "album" ? "active" : ""} onClick={() => {setTab("album");track("album_opened",{completion:unique/225});}}>ALBUM <b>{unique}/225</b></button>
        <button className={tab === "wanted" ? "active" : ""} onClick={() => {setTab("wanted");track("missing_view_opened",{completion:unique/225});}}>WANTED</button>
        <button className={tab === "records" ? "active" : ""} onClick={() => setTab("records")}>RECORDS</button>
        <button className={tab === "more" ? "active" : ""} onClick={() => setTab("more")}>MORE</button>
      </nav>
      <div className="depth"><span>SPECIMEN DUST</span><strong>✦ {save.dust}</strong></div>
    </header>

    {tab === "mine" && <section className={`mine-screen ${impact ? "screen-hit" : ""} stage-${stage}`}>
      <div className="mine-copy"><p className="eyebrow">{stage === "ore" ? "CLANK · DEPOSIT EXPOSED" : "SHIFT 01 · THE LONG WALL"}</p><h1>{stage === "ore" ? <><i>ORE</i> FOUND.</> : <>KEEP <i>DIGGING.</i></>}</h1><p>{stage === "ore" ? `${pendingOre?.name}. Crack it open and see what ruined your evening.` : <>The rock does not care about your album.<br/>Unfortunately, you do.</>}</p></div>
      <div className="stats-row"><span><small>DEPOSITS</small>{save.digs}</span><span><small>UNIQUE</small>{unique}<em>/ 225</em></span><span><small>DRY STREAK</small>{save.streak}</span></div>
      {save.huntTarget&&<div className="hunt-banner"><span>HUNTING{huntBoost(save)>1?` · FOCUS +${Math.round((huntBoost(save)-1)*100)}%`:""}</span><strong>{(()=>{const p=save.huntTarget!.lastIndexOf("-");return `${ores.find(o=>o.id===save.huntTarget!.slice(0,p))?.name} + ${minerals.find(m=>m.id===save.huntTarget!.slice(p+1))?.name}`})()}</strong><button onClick={()=>setTab("wanted")}>VIEW TARGET</button></div>}
      <div className="mine-mastery"><div><span>{biomeNames[save.biome]} MASTERY</span><strong>{completedPages(save,save.biome)} / {biomePages[save.biome].length} PAGES</strong></div><i><b style={{width:`${completedPages(save,save.biome)/biomePages[save.biome].length*100}%`}}/></i><small>{biomeComplete(save,save.biome)?"MINE COMPLETE":`${biomePages[save.biome].length-completedPages(save,save.biome)} pages remain before the next descent.`}</small></div>
      <div className="biomes volume-biomes" aria-label="Mine location">{biomeOrder.map((b,i)=>{const open=save.unlockedBiomes.includes(b),done=completedPages(save,b),previous=i?biomeOrder[i-1]:b;return <button key={b} disabled={!open} className={`${save.biome===b?"chosen":""} ${open?"":"locked"}`} onClick={()=>{setSave(s=>({...s,biome:b}));track("biome_selected",{biome:b})}}><span>{open?biomeNames[b]:`🔒 ${biomeNames[b]}`}</span><small>{open?`${done}/${biomePages[b].length} PAGES · ${distributionLabel(b)}`:`COMPLETE ${biomeNames[previous]} · ${completedPages(save,previous)}/${biomePages[previous].length} PAGES`}</small></button>})}</div>
      <button className={`rock ${impact ? "hit" : ""} ${stage === "ore" ? "ore-rock" : ""} damage-${Math.floor((1-rockHp/maxHp)*4)} ${rockHp===1?"final-hit":""}`} style={{"--hit-x":`${hitPoint.x}%`,"--hit-y":`${hitPoint.y}%`} as React.CSSProperties} onClick={strikeAtPointer} aria-label={stage === "ore" ? "Crack the exposed ore deposit" : "Strike the rock wall"}>
        {Array.from({ length: 18 }, (_, i) => <span key={i} className={`stone s${i}`} />)}
        <span className="crack c1"/><span className="crack c2"/><span className="crack c3"/>
        {stage === "ore" && pendingOre && <span className="exposed-ore" style={{"--ore":pendingOre.color} as React.CSSProperties}><i>◆</i><strong>{pendingOre.name}</strong><small>{pendingOre.rarity.toUpperCase()}</small></span>}
        {impact && <span className="debris">{Array.from({length:8},(_,i)=><i key={i}/>)}</span>}
        <span className="pickaxe">⛏</span>
      </button>
      <div className="dig-panel"><div><span className="mouse-icon">↙</span><strong>{stage === "ore" ? "CRACK DEPOSIT" : "CLICK TO STRIKE"}</strong><small>or press SPACE</small></div><div className="integrity"><span>{stage === "ore" ? "ORE SHELL" : `TUNNEL PROGRESS · ${Math.round((1-rockHp/maxHp)*100)}%`}</span><i>{Array.from({length: 12},(_,i)=><b key={i} className={i < Math.ceil((rockHp/maxHp)*12) ? "full" : ""}/>)}</i></div></div>
      <button className="album-link" onClick={() => {setTab("album");track("album_opened",{completion:unique/225});}}>VIEW COMBINATION ALBUM <span>→</span></button>
    </section>}

    {tab === "album" && <Album save={save} />}
    {tab === "wanted" && <Wanted save={save} onHunt={(biome,target)=>{setSave(s=>({...s,biome,huntTarget:target,huntStartedAtDig:s.digs,huntCounts:{...s.huntCounts,[target]:(s.huntCounts[target]||0)+1}}));track("hunt_started",{biome,combination_id:target});setTab("mine");continueMine();}} />}
    {tab === "records" && <><Records save={save} onReset={reset} /><HuntRecords save={save}/></>}
    {tab === "more" && <><VolumeRewards save={save}/><More save={save} setSave={setSave} onHelp={()=>{setTab("mine");setOnboarding(true)}} /></>}

    {found && <Reveal found={found} total={unique} biome={save.biome} onContinue={continueMine} />}
    {milestone && <Milestone data={milestone} biome={save.biome} onClose={()=>setMilestone(null)} onAlbum={()=>{if(milestone.level===14&&milestone.missing){const target=`${milestone.ore.id}-${milestone.missing.id}`,b=bestBiome(milestone.ore);setSave(s=>({...s,biome:b,huntTarget:target,huntStartedAtDig:s.digs,huntCounts:{...s.huntCounts,[target]:(s.huntCounts[target]||0)+1}}));track("hunt_started",{biome:b,combination_id:target});setTab("mine")}else setTab("album");setMilestone(null)}} />}
    {onboarding&&<Onboarding onDone={()=>{setOnboarding(false);setSave(s=>({...s,settings:{...s.settings,helpSeen:true}}));track("mine_started",{attempt:save.digs+1,biome:save.biome})}}/>}
    {share&&<ShareCard data={share} biome={save.biome} onClose={()=>setShare(null)}/>} 
    {mineCompletion&&<MineCompletion data={mineCompletion} digs={save.digs} onContinue={()=>{if(mineCompletion.next)setSave(s=>({...s,biome:mineCompletion.next!}));setMineCompletion(null);setTab("mine");continueMine();}}/>}
    {toast && <div className="achievement" onClick={() => setToast(null)}><span>{toast.name.includes("MINE UNLOCKED")?"NEW MINE UNLOCKED":"ACHIEVEMENT UNLOCKED"}</span><strong>{toast.name}</strong><p>{toast.text}</p></div>}
  </main>;
}

function Album({ save }: { save: Save }) {
  const [selected, setSelected] = useState(ores[0]);
  const total = minerals.filter(m => save.combos[`${selected.id}-${m.id}`]).length;
  const unique=Object.keys(save.combos).length,completed=ores.filter(o=>minerals.every(m=>save.combos[`${o.id}-${m.id}`])).length,oreFound=Object.keys(save.ores).filter(k=>save.ores[k]>0).length,mineralFound=Object.keys(save.minerals).filter(k=>save.minerals[k]>0).length;
  const pagePairs=minerals.map(m=>({m,count:save.combos[`${selected.id}-${m.id}`]||0})).filter(x=>x.count),most=pagePairs.sort((a,b)=>b.count-a.count)[0],rarest=[...pagePairs].sort((a,b)=>a.m.weight-b.m.weight)[0];
  const discovered=Object.keys(save.combos).map(k=>{const p=k.lastIndexOf("-"),o=ores.find(x=>x.id===k.slice(0,p)),m=minerals.find(x=>x.id===k.slice(p+1));return o&&m?{o,m,odd:Math.max(...(Object.keys(biomeNames) as Biome[]).map(b=>Number.isFinite(odds(o,m,b))?odds(o,m,b):0))}:null}).filter(Boolean) as {o:Item;m:Item;odd:number}[];const globalRare=[...discovered].sort((a,b)=>b.odd-a.odd)[0];const wanted=save.huntTarget?(()=>{const p=save.huntTarget!.lastIndexOf("-");return `${ores.find(o=>o.id===save.huntTarget!.slice(0,p))?.name} + ${minerals.find(m=>m.id===save.huntTarget!.slice(p+1))?.name}`})():"No target pinned. Cowardice remains available.";
  return <section className="page album-page"><div className="page-head"><div><p className="eyebrow">CLASSIC → TBC → WOTLK</p><h2>VOLUME I <i>ALBUM</i></h2></div><div className="completion"><span>VOLUME COMPLETION</span><strong>{unique} <small>/ 225 · {(unique/225*100).toFixed(1)}%</small></strong></div></div><div className="volume-overview"><span><small>ORES</small>{oreFound}/15</span><span><small>MINERALS</small>{mineralFound}/15</span><span><small>COMPLETED PAGES</small>{completed}/15</span><span><small>MISSING</small>{225-unique}</span></div><div className="overview-highlights"><span><small>RAREST DISCOVERY</small>{globalRare?`${globalRare.o.name} + ${globalRare.m.name} · 1/${globalRare.odd}`:"Nothing worth mentioning yet."}</span><span><small>MOST WANTED</small>{wanted}</span></div>
    <div className="ore-tabs volume-tabs">{ores.map(o => {const n=minerals.filter(m=>save.combos[`${o.id}-${m.id}`]).length;return <button key={o.id} className={`${selected.id === o.id ? "selected" : ""} ${n===15?"complete":""}`} onClick={() => {setSelected(o);track("ore_page_opened",{ore_id:o.id,completion:n/15})}}><i style={{background:o.color}}/><span>{o.name.replace(" Ore","")}<small>{n}/15 {n===15?"✓":""}</small></span></button>})}</div>
    <div className={`album-title milestone-${total}`}><div><span className="ore-gem" style={{"--gem":selected.color} as React.CSSProperties}>◆</span><div><p>{selected.rarity.toUpperCase()} ORE · {save.ores[selected.id]||0} MINED</p><h3>{selected.name} {total===15&&<b className="complete-stamp">PAGE COMPLETE</b>}</h3><small>{total===14?`ONE SPECIMEN REMAINS: ${minerals.find(m=>!save.combos[`${selected.id}-${m.id}`])?.name}. WHERE IS IT?`:selected.note}</small><div className="page-stats">RAREST: {rarest?.m.name||"—"} · MOST DUPLICATED: {most?`${most.m.name} ×${most.count}`:"—"} · MISSING: {15-total}</div></div></div><strong>{total}<small>/15 · {Math.round(total/15*100)}%</small></strong></div>
    <div className="slots">{minerals.map((m, i) => { const key=`${selected.id}-${m.id}`, count=save.combos[key]||0; return <article key={m.id} className={count ? "found" : "locked"}><div className="slot-top"><span>0{i+1}</span><b className={`rarity ${m.rarity.toLowerCase()}`}>{count ? m.rarity.toUpperCase() : "UNKNOWN"}</b></div><div className="mineral-gem" style={{"--gem": count ? m.color : "#2b2d2e"} as React.CSSProperties}>◆</div><h4>{count ? m.name : "UNDISCOVERED"}</h4><p>{count ? m.note : "Keep digging. It is definitely in there. Probably."}</p><footer>{count ? <><span>FOUND ×{count}</span><small>FIRST: DIG #{save.first[key]}</small></> : <span>???</span>}</footer></article>})}</div>
  </section>;
}

function Wanted({save,onHunt}:{save:Save;onHunt:(b:Biome,ore:string)=>void}){
  const [sort,setSort]=useState("closest");
  const [mine,setMine]=useState<Biome|"all">("all");
  const [query,setQuery]=useState("");
  const [rareOnly,setRareOnly]=useState(false);
  const [currentOnly,setCurrentOnly]=useState(false);
  const rows=ores.map(o=>({ore:o,missing:minerals.filter(m=>!save.combos[`${o.id}-${m.id}`]),found:minerals.filter(m=>save.combos[`${o.id}-${m.id}`]).length})).filter(r=>r.missing.length).sort((a,b)=>sort==="ore"?a.ore.name.localeCompare(b.ore.name):sort==="rarest"?Math.max(...b.missing.map(m=>odds(b.ore,m,save.biome)))-Math.max(...a.missing.map(m=>odds(a.ore,m,save.biome))):sort==="easiest"?Math.min(...a.missing.map(m=>odds(a.ore,m,save.biome)))-Math.min(...b.missing.map(m=>odds(b.ore,m,save.biome))):b.found-a.found);
  const best=(ore:Item)=>bestAvailableBiome(ore,save.unlockedBiomes);
  const shown=rows.map(r=>({...r,missing:r.missing.filter(m=>(!query||`${r.ore.name} ${m.name}`.toLowerCase().includes(query.toLowerCase()))&&(!rareOnly||["Legendary","Mythic"].includes(m.rarity))&&(!currentOnly||save.huntTarget===`${r.ore.id}-${m.id}`))})).filter(r=>r.missing.length&&(mine==="all"||best(r.ore)===mine));
  return <section className="page wanted-page">
    <div className="page-head"><div><p className="eyebrow">SPECIFIC REASONS TO KEEP SUFFERING</p><h2>MISSING <i>SPECIMENS</i></h2></div><div className="completion"><span>STILL HIDING</span><strong>{225-Object.keys(save.combos).length}</strong></div></div>
    <div className="wanted-sort"><span>SORT</span>{[["closest","CLOSEST"],["rarest","RAREST"],["easiest","EASIEST"],["ore","ORE"]].map(x=><button className={sort===x[0]?"active":""} key={x[0]} onClick={()=>setSort(x[0])}>{x[1]}</button>)}<select value={mine} onChange={e=>setMine(e.target.value as Biome|"all")}><option value="all">ALL OPEN MINES</option>{save.unlockedBiomes.map(b=><option value={b} key={b}>{biomeNames[b]}</option>)}</select></div>
    <div className="wanted-filters"><input aria-label="Filter by ore or mineral" placeholder="FILTER ORE OR MINERAL" value={query} onChange={e=>setQuery(e.target.value)}/><button className={rareOnly?"active":""} onClick={()=>setRareOnly(x=>!x)}>LEGENDARY / MYTHIC</button><button className={currentOnly?"active":""} onClick={()=>setCurrentOnly(x=>!x)}>CURRENTLY HUNTED</button></div>
    <div className="wanted-list">{shown.map(r=><article className={r.found===14?"last-one":""} key={r.ore.id}><header><span className="ore-gem" style={{"--gem":r.ore.color} as React.CSSProperties}>◆</span><div><small>{r.found===14?"ONE SPECIMEN REMAINS":"INCOMPLETE PAGE"}</small><h3>{r.ore.name} — {r.found}/15</h3></div></header><div className="missing-grid volume-missing">{r.missing.map(m=>{const target=`${r.ore.id}-${m.id}`,b=best(r.ore);return <div className={save.huntTarget===target?"pinned":""} key={m.id}><span style={{color:m.color}}>◆</span><strong>{m.name}</strong><small>{biomeNames[b]} · 1/{odds(r.ore,m,b)}</small><button onClick={()=>onHunt(b,target)}>{save.huntTarget===target?"PINNED":"PIN TARGET"}</button></div>})}</div><footer><span>RECOMMENDED: {biomeNames[best(r.ore)]}</span><button onClick={()=>{const m=[...r.missing].sort((a,b)=>a.weight-b.weight)[0];onHunt(best(r.ore),`${r.ore.id}-${m.id}`)}}>HUNT THIS PAGE →</button></footer></article>)}</div>
  </section>
}

function Milestone({data,biome,onClose,onAlbum}:{data:{ore:Item;level:number;missing?:Item;attempts:number};biome:Biome;onClose:()=>void;onAlbum:()=>void}){
 return <div className={`milestone-modal level-${data.level}`}><div><p className="eyebrow">{data.level===15?"ALBUM PAGE COMPLETE":data.level===14?"ONE SPECIMEN REMAINS":data.level===12?"THE HUNT BEGINS":"PAGE MILESTONE"}</p><span className="big-gem" style={{"--gem":data.ore.color} as React.CSSProperties}>◆</span><h2>{data.ore.name} — {data.level}/15</h2>{data.level===15&&<div className="completion-row">{minerals.map(m=><span key={m.id} style={{color:m.color}}>◆</span>)}</div>}{data.missing?<><p>Your final missing specimen is <strong>{data.missing.name}</strong>.</p><small>Natural pairing odds: 1 in {odds(data.ore,data.missing,bestBiome(data.ore))} · Recommended: {biomeNames[bestBiome(data.ore)]}</small></>:<p>{data.level===15?`Completed after ${data.attempts} ${data.ore.name} deposits. Reward: permanent Volume I page stamp.`:data.level===12?"Three remain. Generic mining has now become personal.":data.level===10?"Double digits. You may be in too deep.":"Five found. Ten more opportunities for disappointment."}</p>}<div><button onClick={onAlbum}>{data.level===14?"HUNT THIS PAGE":"INSPECT PAGE"}</button><button onClick={onClose}>KEEP MINING</button></div></div></div>
}

function MineCompletion({data,digs,onContinue}:{data:{completed:Biome;next?:Biome};digs:number;onContinue:()=>void}){
 return <div className="mine-completion"><div><p className="eyebrow">ALL PAGES COMPLETE</p><div className="completion-seal">◆</div><h2>{biomeNames[data.completed]}<br/><i>MASTERED.</i></h2><p>{biomePages[data.completed].length} pages sealed after {digs} total deposits. The mountain has reluctantly acknowledged your paperwork.</p>{data.next?<div className="next-mine-reveal"><small>NEW DESCENT UNLOCKED</small><strong>{biomeNames[data.next]}</strong></div>:<div className="next-mine-reveal"><small>VOLUME I MINE NETWORK</small><strong>FULLY MASTERED</strong></div>}<button onClick={onContinue}>{data.next?`ENTER ${biomeNames[data.next]}`:"RETURN TO THE MOUNTAIN"} <span>→</span></button></div></div>
}

function Records({ save, onReset }: { save: Save; onReset: () => void }) {
  const dupes = Object.values(save.combos).reduce((s,n)=>s+Math.max(0,n-1),0);
  const most=Object.entries(save.combos).sort((a,b)=>b[1]-a[1])[0];const mostOre=Object.entries(save.ores).sort((a,b)=>b[1]-a[1])[0];const complete=ores.filter(o=>minerals.every(m=>save.combos[`${o.id}-${m.id}`])).length;
  const leastOre=Object.entries(save.ores).filter(x=>x[1]>0).sort((a,b)=>a[1]-b[1])[0];
  return <section className="page records-page"><div className="page-head"><div><p className="eyebrow">VOLUME I · HARD EVIDENCE OF POOR PRIORITIES</p><h2>YOUR <i>RECORDS</i></h2></div></div><div className="record-grid"><article><span>TOTAL STRIKES</span><strong>{save.strikes}</strong><p>{save.distance.toFixed(1)}m of entirely necessary depth.</p></article><article><span>DEPOSITS / UNIQUE</span><strong>{save.digs} / {Object.keys(save.combos).length}</strong><p>{(Object.keys(save.combos).length/225*100).toFixed(1)}% of Volume I.</p></article><article><span>DUPLICATES / WORST DROUGHT</span><strong>{dupes} / {save.longestStreak}</strong><p>Character-building, allegedly.</p></article><article><span>TOTAL DARK IRON SUFFERED</span><strong>{save.ores.dark||0}</strong><p>Dignity already left.</p></article><article><span>TITANIUM MINED</span><strong>{save.ores.titanium||0}</strong><p>Try to act normal.</p></article><article><span>COMPLETED PAGES</span><strong>{complete} / 15</strong><p>Actual evidence of progress.</p></article><article><span>DUST EARNED / SPENT</span><strong>{save.dustEarned} / {save.dustSpent}</strong><p>Duplicates, ground into fashion.</p></article><article><span>MOST DUPLICATED</span><strong>{most?most[1]:0}×</strong><p>{most?most[0].replace("-"," + "):"Nothing yet"}</p></article><article><span>MOST MINED ORE</span><strong>{mostOre?mostOre[1]:0}×</strong><p>{mostOre?ores.find(o=>o.id===mostOre[0])?.name:"Nothing yet"}</p></article><article><span>LEAST MINED DISCOVERED ORE</span><strong>{leastOre?leastOre[1]:0}×</strong><p>{leastOre?ores.find(o=>o.id===leastOre[0])?.name:"Nothing yet"}</p></article></div><h3 className="ach-title">ACHIEVEMENTS <span>{save.achievements.length}/{achievements.length}</span></h3><div className="ach-list">{achievements.map(a=><article className={save.achievements.includes(a.id)?"earned":""} key={a.id}><span>◆</span><div><strong>{save.achievements.includes(a.id)?a.name:"LOCKED"}</strong><p>{a.text}</p></div></article>)}</div><button className="reset" onClick={onReset}>ERASE SAVE DATA</button></section>;
}

function Onboarding({onDone}:{onDone:()=>void}){return <div className="onboarding"><div><span className="brand-mark">OW</span><p className="eyebrow">VOLUME I · CLASSIC → TBC → WOTLK</p><h1>DIG. CLANK. CRACK. <i>COLLECT.</i></h1><p>Fifteen ores. Fifteen minerals. 225 reasons not to stop.</p><button onClick={onDone}>START MINING <span>→</span></button><small>Click the rock or press Space. That is genuinely it.</small></div></div>}

function HuntRecords({save}:{save:Save}){const top=Object.entries(save.huntCounts).sort((a,b)=>b[1]-a[1])[0];const label=top?(()=>{const p=top[0].lastIndexOf("-");return `${ores.find(o=>o.id===top[0].slice(0,p))?.name} + ${minerals.find(m=>m.id===top[0].slice(p+1))?.name}`})():"No target repeatedly hunted";return <div className="hunt-records"><article><small>LONGEST NEW STREAK</small><strong>{save.longestNewStreak}</strong><span>fresh combinations in a row</span></article><article><small>MOST HUNTED TARGET</small><strong>{top?`${top[1]}×`:"—"}</strong><span>{label}</span></article><article><small>LONGEST TARGET HUNT</small><strong>{save.longestHunt}</strong><span>digs from pin to acquisition</span></article></div>}

function ShareCard({data,biome,onClose}:{data:{ore:Item;mineral:Item;attempt:number;total:number};biome:Biome;onClose:()=>void}){return <div className="share-wrap"><div className="share-card"><p>ORE WHORE · VOLUME I</p><div><span style={{color:data.ore.color}}>◆</span><b>+</b><span style={{color:data.mineral.color}}>◆</span></div><small>{data.ore.rarity.toUpperCase()} + {data.mineral.rarity.toUpperCase()}</small><h2>{data.ore.name}<br/>+ {data.mineral.name}</h2><strong>RARE DISCOVERY</strong><footer><span>NATURAL ODDS · 1 / {odds(data.ore,data.mineral,biome)}</span><span>ATTEMPT #{data.attempt} · ALBUM {data.total}/225</span></footer></div><p>Screenshot this. Nobody will believe you, but try.</p><button onClick={onClose}>CONTINUE</button></div>}

function VolumeRewards({save}:{save:Save}){const pct=Object.keys(save.combos).length/225*100;return <div className="volume-rewards"><b>VOLUME I REWARDS</b>{[[10,"RUSTBITE"],[25,"GILDED"],[50,"MENACE"],[75,"KHORIUM"],[90,"TITANIUM"],[100,"ORE WHORE"]].map(x=><span className={pct>=Number(x[0])?"earned":""} key={x[0]}><strong>{x[0]}%</strong><small>{x[1]}</small></span>)}</div>}

function More({save,setSave,onHelp}:{save:Save;setSave:React.Dispatch<React.SetStateAction<Save>>;onHelp:()=>void}){
 const download=(name:string,data:unknown)=>{const a=document.createElement("a");a.href=URL.createObjectURL(new Blob([JSON.stringify(data,null,2)],{type:"application/json"}));a.download=name;a.click();URL.revokeObjectURL(a.href)};
 const buy=(id:string,cost:number)=>setSave(s=>s.unlocks.includes(id)||s.dust<cost?s:{...s,dust:s.dust-cost,dustSpent:s.dustSpent+cost,unlocks:[...s.unlocks,id],equipped:id});
 const importSave=(f:File)=>{const reader=new FileReader();reader.onload=()=>{try{const x=JSON.parse(String(reader.result));if(!x||typeof x.digs!=="number"||typeof x.combos!=="object")throw 0;setSave(migrate(x));alert("Save imported and migrated to Volume I.")}catch{alert("That save is malformed or incompatible. Your current save is untouched.")}};reader.readAsText(f)};
 return <section className="page more-page"><div className="page-head"><div><p className="eyebrow">COSMETICS, CONTROLS, DAMAGE CONTROL</p><h2>MINER <i>QUARTERS</i></h2></div><div className="completion"><span>SPECIMEN DUST</span><strong>✦ {save.dust}</strong></div></div><h3 className="section-label">DUST TROPHIES · COSMETIC ONLY</h3><div className="shop-grid">{cosmetics.map(c=>{const owned=save.unlocks.includes(c.id);return <article key={c.id} className={save.equipped===c.id?"equipped":""}><span>{c.kind}</span><strong>{c.name}</strong><small>No power. Just evidence.</small><button disabled={!owned&&save.dust<c.cost} onClick={()=>owned?setSave(s=>({...s,equipped:c.id})):buy(c.id,c.cost)}>{save.equipped===c.id?"EQUIPPED":owned?"EQUIP":`✦ ${c.cost}`}</button></article>})}</div><h3 className="section-label">SETTINGS</h3><div className="settings-grid"><label>MASTER VOLUME<input type="range" min="0" max="1" step=".1" value={save.settings.master} onChange={e=>setSave(s=>({...s,settings:{...s.settings,master:+e.target.value}}))}/></label><label>SFX VOLUME<input type="range" min="0" max="1" step=".1" value={save.settings.sfx} onChange={e=>setSave(s=>({...s,settings:{...s.settings,sfx:+e.target.value}}))}/></label>{(["reducedShake","reducedMotion","vibration","highContrast"] as const).map(k=><label className="toggle" key={k}><input type="checkbox" checked={save.settings[k]} onChange={e=>setSave(s=>({...s,settings:{...s.settings,[k]:e.target.checked}}))}/>{k.replace(/([A-Z])/g," $1").toUpperCase()}</label>)}</div><div className="utility-buttons"><button onClick={onHelp}>HOW TO PLAY</button><button onClick={()=>download("ore-whore-save-v03.json",save)}>EXPORT SAVE</button><label>IMPORT SAVE<input type="file" accept="application/json" onChange={e=>e.target.files?.[0]&&importSave(e.target.files[0])}/></label><button onClick={()=>download("ore-whore-analytics.json",JSON.parse(localStorage.getItem("ore-whore-analytics-v1")||"[]"))}>EXPORT PLAYTEST DATA</button></div></section>
}

function Reveal({ found, total, biome, onContinue }: { found: {ore:Item;mineral:Item;isNew:boolean;count:number}; total:number;biome:Biome; onContinue:()=>void }) {
  const comboOdds = odds(found.ore,found.mineral,biome);
  const huge = found.mineral.rarity === "Mythic" || (found.ore.rarity === "Legendary" && found.mineral.rarity === "Epic");
  const personality=found.ore.id==="dark"?"THIS SHIT AGAIN?":found.ore.id==="khorium"?"KHORIUM. DO NOT PANIC.":found.ore.id==="saronite"?"IT KNOWS YOUR NAME.":found.ore.id==="titanium"?"THE CROWN JEWEL":"DEPOSIT CRACKED";
  return <div className={`reveal ore-${found.ore.id} ${huge?"mythic":""} ${!found.isNew&&!huge?"quick":""}`}><div className="reveal-card"><button className="close" onClick={onContinue}>×</button><p className="eyebrow">{personality}</p><div className="combo-art"><span className="big-gem ore" style={{"--gem":found.ore.color} as React.CSSProperties}>◆</span><b>+</b><span className="big-gem mineral" style={{"--gem":found.mineral.color} as React.CSSProperties}>◆</span></div><div className="names"><div><small>{found.ore.rarity}</small><strong>{found.ore.name}</strong></div><b>CONTAINING</b><div><small>{found.mineral.rarity}</small><strong>{found.mineral.name}</strong></div></div><div className={`verdict ${found.isNew?"new":"duplicate"}`}><span>{found.isNew ? (huge?"MYTHIC DISCOVERY":"NEW COMBINATION") : `DUPLICATE ×${found.count}`}</span><strong>{found.isNew ? `${total} / 225` : `+${dustByRarity[found.mineral.rarity]} SPECIMEN DUST`}</strong><small>NATURAL ODDS · APPROX. 1 IN {comboOdds.toLocaleString()}</small></div><button className="continue" onClick={onContinue}>{found.isNew?"CONTINUE MINING":"AGAIN. NOW."} <span>→</span></button></div></div>;
}
