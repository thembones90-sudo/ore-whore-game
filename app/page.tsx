"use client";

import { useEffect, useRef, useState } from "react";
import { track } from "./analytics";
import { emitGameplayEvent } from "./gameplay-events";

type Rarity = "Common" | "Uncommon" | "Rare" | "Epic" | "Legendary" | "Mythic";
type Item = { id: string; name: string; rarity: Rarity; weight: number; color: string; note: string; toughness?: number };
type Biome = "old" | "deep" | "outland" | "northrend";
type Settings = { master:number;sfx:number;reducedShake:boolean;reducedMotion:boolean;vibration:boolean;highContrast:boolean;helpSeen:boolean };
type Save = { digs: number; emptyDigs:number; strikes: number; distance: number; combos: Record<string, number>; ores: Record<string, number>; minerals: Record<string, number>; first: Record<string, number>; achievements: string[]; streak: number; longestStreak:number;newStreak:number;longestNewStreak:number; dust: number; dustEarned:number;dustSpent:number; biome: Biome; unlockedBiomes:Biome[]; completedBiomes:Biome[]; milestones: Record<string, number>; lastDigAt: number; schema: number; settings:Settings;unlocks:string[];equipped:string;huntTarget:string|null;huntCounts:Record<string,number>;huntStartedAtDig:number;longestHunt:number;trueArtifacts:Record<string,number>;trueFirst:Record<string,number>;misses:number;veinOre:string|null;veinDigsRemaining:number;milestoneDigs:Record<string,number> };

const ores: Item[] = [
  { id: "copper", name: "Copper Ore", rarity: "Common", weight: 48, color: "#d88156", note: "Honest rock for dishonest amounts of time.", toughness: 1.00 },
  { id: "tin", name: "Tin Ore", rarity: "Common", weight: 35, color: "#a8aaa4", note: "Copper's less charismatic colleague.", toughness: 1.00 },
  { id: "silver", name: "Silver Ore", rarity: "Uncommon", weight: 20, color: "#d7e0df", note: "Shiny enough to briefly restore morale.", toughness: 1.15 },
  { id: "iron", name: "Iron Ore", rarity: "Uncommon", weight: 29, color: "#9da5a3", note: "Industrial. Dependable. Completely unimpressed by you.", toughness: 1.15 },
  { id: "gold", name: "Gold Ore", rarity: "Rare", weight: 15, color: "#e6bb43", note: "Worth less than the missing square, somehow.", toughness: 1.40 },
  { id: "mithril", name: "Mithril Ore", rarity: "Rare", weight: 15, color: "#63c7b2", note: "Light enough to carry your growing disappointment.", toughness: 1.40 },
  { id: "truesilver", name: "Truesilver Ore", rarity: "Rare", weight: 10, color: "#b9d8ef", note: "Silver, but with a superiority complex.", toughness: 1.40 },
  { id: "dark", name: "Dark Iron Ore", rarity: "Epic", weight: 6, color: "#9a5369", note: "Somehow, Blackrock Depths returned.", toughness: 1.70 },
  { id: "thorium", name: "Thorium Ore", rarity: "Epic", weight: 6, color: "#80a69d", note: "Dense, green, and responsible for several lost weekends.", toughness: 1.70 },
  { id: "feliron", name: "Fel Iron Ore", rarity: "Uncommon", weight: 18, color: "#83b85c", note: "Outland's most available bad decision.", toughness: 1.15 },
  { id: "adamantite", name: "Adamantite Ore", rarity: "Rare", weight: 10, color: "#679f86", note: "Harder than your stated commitment to stopping.", toughness: 1.40 },
  { id: "khorium", name: "Khorium Ore", rarity: "Legendary", weight: 3, color: "#db7fe7", note: "There it is. Remain calm. You cannot.", toughness: 2.00 },
  { id: "cobalt", name: "Cobalt Ore", rarity: "Uncommon", weight: 20, color: "#3b8ccb", note: "Cold blue competence.", toughness: 1.15 },
  { id: "saronite", name: "Saronite Ore", rarity: "Epic", weight: 8, color: "#476e55", note: "It whispers. Mostly insults.", toughness: 1.70 },
  { id: "titanium", name: "Titanium Ore", rarity: "Legendary", weight: 2, color: "#6dc6df", note: "The crown jewel. Try to act normal.", toughness: 2.00 },
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
const blank: Save = { digs: 0, emptyDigs:0, strikes: 0, distance: 0, combos: {}, ores: {}, minerals: {}, first: {}, achievements: [], streak: 0,longestStreak:0,newStreak:0,longestNewStreak:0, dust: 0,dustEarned:0,dustSpent:0, biome: "old", unlockedBiomes:["old"], completedBiomes:[], milestones: {}, lastDigAt: 0, schema: 10,settings:defaultSettings,unlocks:[],equipped:"standard",huntTarget:null,huntCounts:{},huntStartedAtDig:0,longestHunt:0,trueArtifacts:{},trueFirst:{},misses:0,veinOre:null,veinDigsRemaining:0,milestoneDigs:{} };
const cosmetics=[{id:"rust",name:"Rustbite Pick",cost:15,kind:"PICKAXE"},{id:"neon",name:"Toxic Impact",cost:30,kind:"IMPACT"},{id:"gilded",name:"Gilded Album",cost:45,kind:"ALBUM"},{id:"deepframe",name:"Deep-Mine Frame",cost:60,kind:"ALBUM"},{id:"menace",name:"Geological Menace",cost:75,kind:"TITLE"},{id:"void",name:"Void Pick",cost:100,kind:"PICKAXE"},{id:"fel",name:"Fel Dust",cost:35,kind:"IMPACT"},{id:"frost",name:"Frostbite Pick",cost:55,kind:"PICKAXE"},{id:"saroniteframe",name:"Saronite Whisper",cost:70,kind:"ALBUM"},{id:"prospector",name:"Master Prospector",cost:80,kind:"TITLE"},{id:"khoriumframe",name:"Khorium Prestige",cost:110,kind:"REVEAL"},{id:"titan",name:"Titanium Crown",cost:140,kind:"PICKAXE"},{id:"brdtitle",name:"Not Going Back",cost:95,kind:"TITLE"},{id:"arcaneimpact",name:"Arcane Fracture",cost:125,kind:"IMPACT"},{id:"volumeone",name:"Volume I Victor",cost:180,kind:"ALBUM"},{id:"orewhoretitle",name:"THE ORE WHORE",cost:999,kind:"TITLE"},{id:"orewhorepick",name:"The Final Pick",cost:999,kind:"PICKAXE"},{id:"orewhorealbum",name:"225 Stamp",cost:999,kind:"ALBUM"},{id:"centerpiece",name:"Mountain's Regret",cost:999,kind:"TROPHY"}];
const biomeWeights: Record<Biome, number[]> = {
 old:[28,20,12,18,10,8,2,1,1,0,0,0,0,0,0],
 deep:[1,2,4,10,5,22,18,15,18,1,1,1,1,1,0],
 outland:[0,0,0,0,0,2,2,1,2,34,34,18,3,2,2],
 northrend:[0,0,0,0,0,0,0,1,1,1,2,2,38,35,20]
};
const biomeNames:Record<Biome,string>={old:"OLD MINE",deep:"DEEP MINE",outland:"OUTLAND MINE",northrend:"NORTHREND MINE"};
const biomeVisuals:Record<Biome,{accent:string;secondary:string;canvas:string;cavity:string;debris:string;particle:string;card:string;texture:string;light:string;flavor:string}>={
 old:{accent:"#d88156",secondary:"#a77a50",canvas:"#18130f",cavity:"#120d09",debris:"#8d7b68",particle:"#b59a76",card:"#241a14",texture:"sediment",light:"#d49a63",flavor:"Still standing. Nobody knows why."},
 deep:{accent:"#9a5369",secondary:"#5d3544",canvas:"#0d080b",cavity:"#080507",debris:"#594650",particle:"#87505d",card:"#1b1016",texture:"compressed",light:"#8c455b",flavor:"This seemed like a better idea upstairs."},
 outland:{accent:"#83b85c",secondary:"#526c38",canvas:"#091008",cavity:"#050a04",debris:"#4d5b3f",particle:"#708f50",card:"#111b0e",texture:"corrupted",light:"#759c4c",flavor:"The geology has become medically concerning."},
 northrend:{accent:"#6dc6df",secondary:"#3d748d",canvas:"#071018",cavity:"#040b11",debris:"#687f8d",particle:"#98c8d5",card:"#0b1822",texture:"frozen",light:"#78cce2",flavor:"Frozen rock. Frozen fingers. Keep swinging."}
};
const oreAsset=(id:string)=>`/assets/ores/ore-${id}.webp`;
const biomeOrder:Biome[]=["old","deep","outland","northrend"];
const biomePages:Record<Biome,string[]>={old:["copper","tin","silver","iron","gold"],deep:["mithril","truesilver","dark","thorium"],outland:["feliron","adamantite","khorium"],northrend:["cobalt","saronite","titanium"]};
const rarityQuota:Record<Item["rarity"],number>={Common:10,Uncommon:7,Rare:3,Epic:1,Legendary:1,Mythic:1};
const oreQuota=(id:string)=>rarityQuota[ores.find(o=>o.id===id)?.rarity||"Common"];
const biomeQuotaTotal=(biome:Biome)=>biomePages[biome].reduce((total,id)=>total+oreQuota(id),0);
const biomeQuotaProgress=(save:Save,biome:Biome)=>biomePages[biome].reduce((total,id)=>total+Math.min(save.ores[id]||0,oreQuota(id)),0);
const biomeQuotaComplete=(save:Save,biome:Biome)=>biomePages[biome].every(id=>(save.ores[id]||0)>=oreQuota(id));
const bestBiome=(ore:Item):Biome=>(Object.keys(biomeWeights) as Biome[]).sort((a,b)=>biomeWeights[b][ores.indexOf(ore)]-biomeWeights[a][ores.indexOf(ore)])[0];
const bestAvailableBiome=(ore:Item,available:Biome[]):Biome=>[...available].sort((a,b)=>biomeWeights[b][ores.indexOf(ore)]-biomeWeights[a][ores.indexOf(ore)])[0]||"old";
const huntBoost=(save:Save)=>save.huntTarget?Math.min(5,1+Math.max(0,save.digs-save.huntStartedAtDig-40)/20):1;
// Depth bands reuse the existing per-tunnel randomized maxHp (10-15,
// already the "Tunnel Progress" mechanic) as the depth signal: a longer
// required tunnel this run is treated as "deeper." SHALLOW is canonical
// (no change); DEEP/BEDROCK boost the rarer half of the current biome's
// nonzero-weight ores by a tunable relative percentage. Never adds an ore
// outside the biome's existing table, never touches the 20% empty chance
// (that roll happens before this), and pick()'s internal sum-normalization
// means no separate renormalization step is needed.
type DepthBand = "shallow" | "deep" | "bedrock";
const depthBand = (maxHp:number):DepthBand => maxHp<=11?"shallow":maxHp<=13?"deep":"bedrock";
const DEPTH_BOOST: Record<DepthBand, number> = { shallow: 1, deep: 1.10, bedrock: 1.20 };
const depthWeights = (biome:Biome, band:DepthBand):number[] => {
  const base = biomeWeights[biome];
  const boost = DEPTH_BOOST[band];
  if (boost === 1) return base;
  const nonzero = base.map((w,i)=>({i,w})).filter(x=>x.w>0).sort((a,b)=>a.w-b.w);
  const rarerIdx = new Set(nonzero.slice(0, Math.ceil(nonzero.length/2)).map(x=>x.i));
  return base.map((w,i)=> rarerIdx.has(i) ? w*boost : w);
};
// Vein: temporary 3x weight multiplier on one specific ore id, composed on
// top of depth weighting (both are independent per-index scalings of the
// same base array). Never guarantees the ore, never touches empty chance,
// never touches TRUE.
const VEIN_CHANCE = 0.03;
const VEIN_DURATION = 4;
const VEIN_MULTIPLIER = 3;
const applyVein = (weights:number[], veinOreId:string|null):number[] => {
  if (!veinOreId) return weights;
  const idx = ores.findIndex(o=>o.id===veinOreId);
  if (idx < 0) return weights;
  return weights.map((w,i)=> i===idx ? w*VEIN_MULTIPLIER : w);
};
const distributionLabel=(b:Biome)=>{const ws=biomeWeights[b],sum=ws.reduce((a,x)=>a+x,0);return ores.map((o,i)=>({o,w:ws[i]})).filter(x=>x.w>0).map(x=>`${x.o.name.replace(" Ore","")} ${Math.round(x.w/sum*100)}%`).join(" · ")};
const dustByRarity: Record<Rarity,number> = { Common:1, Uncommon:2, Rare:3, Epic:5, Legendary:8, Mythic:12 };
// Last-One escalation: purely presentational tension derived from
// (current total digs - the dig count when this ore first reached 14/15).
// Zero probability effect — the tiers below only change copy.
const LAST_ONE_TIERS: [number,string][] = [
  [175, "THIS HAS BECOME PERSONAL."],
  [100, "YOU WON'T."],
  [60, "YOU COULD LEAVE."],
  [25, "IT IS STILL IN HERE."],
  [0, "ONE REMAINS."],
];
const lastOneCopy = (save:Save, oreId:string):string => {
  const since = save.milestoneDigs[oreId];
  if (since === undefined) return "ONE REMAINS.";
  const elapsed = save.digs - since;
  return LAST_ONE_TIERS.find(([threshold]) => elapsed >= threshold)?.[1] ?? "ONE REMAINS.";
};
// Index into LAST_ONE_TIERS (0 = freshest "ONE REMAINS", highest = most
// escalated) purely for visual intensity — same zero-probability-effect
// rule as lastOneCopy, this only changes presentation.
const lastOneTier = (save:Save, oreId:string):number => {
  const since = save.milestoneDigs[oreId];
  if (since === undefined) return 0;
  const elapsed = save.digs - since;
  const idx = LAST_ONE_TIERS.findIndex(([threshold]) => elapsed >= threshold);
  return idx < 0 ? 0 : LAST_ONE_TIERS.length - 1 - idx;
};
// Strikes required to crack an exposed ore, derived from its individual
// `toughness` property. Baseline (100%, unset/1.00) stays the original 3
// strikes. Stepped rather than a single round()/ceil() formula because at
// this small baseline scale a naive linear formula collapses adjacent
// rarity tiers onto the same integer — Rare and Epic in particular must
// stay perceptibly different, so the hardest ores land at 7 strikes
// (~233%) rather than a literal 6 (200%), trading exactness for a fully
// distinct 3/4/5/6/7 progression across Common→Legendary.
const toughnessStrikes = (toughness: number) => {
  if (toughness <= 1.00) return 3;
  if (toughness <= 1.25) return 4;
  if (toughness <= 1.50) return 5;
  if (toughness <= 1.80) return 6;
  return 7;
};
// TRUE Artifacts exist outside the 15x15 geological taxonomy entirely —
// no rarity, no weight, no biome, no album slot. Uniform 1/7 selection
// within the pool once the outer 0.05% gate (TRUE_CHANCE) has already
// hit; adding artifacts later changes only the pool split, never the gate.
type TrueArtifact = { id: string; name: string; lore: string };
const trueArtifactPool: TrueArtifact[] = [
  { id: "ronaldo", name: "Panini Golden Sticker of Ronaldo Nazário", lore: "Sacred R9 relic. Non-negotiable." },
  { id: "warglaive", name: "Warglaive of Illidan", lore: "Requires little philosophical justification." },
  { id: "blaizeballs", name: "Blaize's Balls", lore: "A running joke, immortalized in mineral form." },
  { id: "shadow", name: "Shadow the Panther", lore: "A blind man. A toy panther. An unkillable legend." },
  { id: "whorearchives", name: "Whore Archives", lore: "A classified repository of hidden truths." },
  { id: "patike", name: "Patike", lore: "The forbidden folder. Extremely classified. You shouldn't have this." },
  { id: "invincible", name: "Invincible's Reins", lore: "Perhaps the drop rate was underground all along." },
];
const TRUE_CHANCE = 0.0005;
// Miss / Perfect / Critical pipeline constants — tunable after playtesting.
const MISS_CHANCE = 0.05;
const CRIT_CHANCE = 0.05;
const PERFECT_CYCLE_MS = 900; // fixed metronome period, learnable rhythm
const PERFECT_WINDOW_MS = 120; // total accepted window width, ±60ms around peak
// Miss flavor text is cosmetic selection only — Math.random(), never the
// seeded mechanical RNG, per the MISS decisions.
const MISS_LINES = [
  "MISS. IMPRESSIVE. IT WASN'T MOVING.",
  "THE ROCK REMAINS UNHARMED.",
  "EXCELLENT WORK.",
  "YOU MISSED A WALL.",
  "GEOLOGY: 1 · YOU: 0",
  "THE PICKAXE WOULD LIKE A WORD.",
  "GRAVITY ASSISTED. YOU DID NOT.",
  "GEOLOGICALLY UNBOTHERED.",
];
// Canonical artwork slot — mirrors oreAsset(id). No files exist at this
// path yet; TrueArtifactArt falls back to a placeholder sigil on load
// error so dropping in real art later requires zero component changes.
const trueAsset = (id: string) => `/assets/true/${id}.webp`;
const pickTrue = (random: () => number) => trueArtifactPool[Math.min(trueArtifactPool.length - 1, Math.floor(random() * trueArtifactPool.length))];
const makeRng = (seed:number) => () => { seed |= 0; seed = seed + 0x6D2B79F5 | 0; let t=Math.imul(seed^seed>>>15,1|seed); t=t+Math.imul(t^t>>>7,61|t)^t; return ((t^t>>>14)>>>0)/4294967296; };
const pick = (items: Item[], random:()=>number, weights?:number[]) => { const ws=weights||items.map(i=>i.weight); let n=random()*ws.reduce((s,w)=>s+w,0); return items.find((_,i)=>(n-=ws[i])<=0)||items[0]; };
const odds = (ore:Item,mineral:Item,biome:Biome) => {const ow=biomeWeights[biome],oi=ores.indexOf(ore);if(!ow[oi])return Infinity;return Math.round((ow.reduce((a,b)=>a+b,0)*minerals.reduce((a,b)=>a+b.weight,0))/(ow[oi]*mineral.weight))};
// `old` is whatever shape a prior save schema happened to be (parsed JSON from
// localStorage, potentially years old) — `any` is deliberate here, not an
// oversight. See HANDOFF_FOR_CLAUDE.md: "All save changes must go through
// migrate(old) and preserve old saves. Never reset or reinterpret existing
// collections." Narrowing this to `unknown` would require type guards on
// every legacy field access below, which risks altering migration behavior.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const migrate=(old:any):Save=>{const map:Record<string,string>={quartz:"malachite",jade:"jade",citrine:"citrine",opal:"largeopal",star:"arcane"};const combos:Record<string,number>={},first:Record<string,number>={};for(const [k,v] of Object.entries(old.combos||{})){const p=k.lastIndexOf("-");const o=k.slice(0,p),m=k.slice(p+1);combos[`${o}-${map[m]||m}`]=Number(v)}for(const [k,v] of Object.entries(old.first||{})){const p=k.lastIndexOf("-");const o=k.slice(0,p),m=k.slice(p+1);first[`${o}-${map[m]||m}`]=Number(v)}const mineralCounts:Record<string,number>={};for(const [k,v] of Object.entries(old.minerals||{}))mineralCounts[map[k]||k]=(mineralCounts[map[k]||k]||0)+Number(v);const historicalOreCounts:Record<string,number>={};for(const [key,count] of Object.entries(combos)){const p=key.lastIndexOf("-");const id=key.slice(0,p);historicalOreCounts[id]=(historicalOreCounts[id]||0)+Number(count)}const oreCounts:Record<string,number>={};for(const ore of ores)oreCounts[ore.id]=Math.max(Number(old.ores?.[ore.id]||0),historicalOreCounts[ore.id]||0);const provisional={...blank,...old,combos,ores:oreCounts,first,minerals:mineralCounts,settings:{...defaultSettings,...old.settings},schema:10} as Save;const completedBiomes=biomeOrder.filter(b=>biomeQuotaComplete(provisional,b));const unlockedBiomes:Biome[]=["old"];for(let i=0;i<biomeOrder.length-1;i++){if(!completedBiomes.includes(biomeOrder[i]))break;unlockedBiomes.push(biomeOrder[i+1])}const requested:Biome=biomeOrder.includes(old.biome)?old.biome:"old",biome=unlockedBiomes.includes(requested)?requested:unlockedBiomes[unlockedBiomes.length-1];return {...provisional,biome,unlockedBiomes,completedBiomes}}

export default function Home() {
  const [save, setSave] = useState<Save>(blank);
  const [loaded, setLoaded] = useState(false);
  const [tab, setTab] = useState<"mine" | "album" | "wanted" | "records" | "more" | "true">("mine");
  const [stage, setStage] = useState<"tunnel" | "ore">("tunnel");
  const [maxHp, setMaxHp] = useState(12);
  const [rockHp, setRockHp] = useState(12);
  const [pendingOre, setPendingOre] = useState<Item | null>(null);
  const [impact, setImpact] = useState<number | null>(null);
  const [hitPoint, setHitPoint] = useState({x:50,y:48});
  const [found, setFound] = useState<{ ore: Item; mineral: Item; isNew: boolean; count: number } | null>(null);
  const [emptyFind,setEmptyFind]=useState(false);
  const [trueFind,setTrueFind]=useState<{artifact:TrueArtifact;digNumber:number}|null>(null);
  const [toast, setToast] = useState<{ name: string; text: string } | null>(null);
  const [milestone, setMilestone] = useState<{ore:Item;level:number;missing?:Item;attempts:number} | null>(null);
  const [mineCompletion,setMineCompletion]=useState<{completed:Biome;next?:Biome}|null>(null);
  const [onboarding,setOnboarding]=useState(false);
  const [share,setShare]=useState<{ore:Item;mineral:Item;attempt:number;total:number}|null>(null);
  const [mineTransition,setMineTransition]=useState<Biome|null>(null);
  const [missFlash,setMissFlash]=useState<string|null>(null);
  const [perfectReady,setPerfectReady]=useState(false);
  const [lastHitKind,setLastHitKind]=useState<"normal"|"perfect"|"crit"|"perfectCrit"|"miss"|null>(null);
  const previousBiome=useRef<Biome>("old");
  const seed = typeof window !== "undefined" ? Number(new URLSearchParams(location.search).get("seed")) : 0;
  const rng = useState<{current:()=>number}>(() => ({current: makeRng(seed || Date.now())}))[0];
  // Perfect Strike phase reference — a fixed continuous metronome so the
  // timing window is learnable, not randomized per-strike. Lazy useState
  // initializer (not useRef(Date.now())) for the same render-purity reason
  // as `rng` above.
  const perfectPhase = useState<{current:number}>(() => ({current: Date.now()}))[0];
  const perfectIntervalRef = useRef<ReturnType<typeof setInterval> | undefined>(undefined);
  const sessionDigs = useRef(0);
  const [sessionDigsCount,setSessionDigsCount]=useState(0);
  const [sessionMisses,setSessionMisses]=useState(0);
  const [sessionVeins,setSessionVeins]=useState(0);
  const [sessionNew,setSessionNew]=useState(0);
  const [sessionDrought,setSessionDrought]=useState(0);
  const [sessionLongestDrought,setSessionLongestDrought]=useState(0);
  // Consecutive-miss protection is deliberately transient/session-local,
  // never persisted, never rendered — see MISS decisions.
  const consecutiveMisses = useRef(0);

  // eslint-disable-next-line react-hooks/set-state-in-effect, react-hooks/exhaustive-deps -- mount-time localStorage hydration (migrate save, set onboarding/loaded, fire session_start/return_visit); seed intentionally excluded from deps so this never re-fires post-mount. Moving this to a lazy state initializer would change save-bootstrap and analytics-event timing/ordering; save behavior is protected (see HANDOFF_FOR_CLAUDE.md).
  useEffect(() => { try { const last=Number(localStorage.getItem("ore-whore-last-session")||0);if(last)track("return_visit",{hours_since_previous_session:(Date.now()-last)/3600000}); const raw = localStorage.getItem("ore-whore-save-v1"); if (raw){const old=JSON.parse(raw);setSave(migrate(old));setOnboarding(!old.settings?.helpSeen&&!(old.digs>0));}else setOnboarding(true); } catch {setOnboarding(true)} setLoaded(true); track("session_start",{seed:seed||null,build:"v0.4",analytics_schema:2}); const end=()=>{localStorage.setItem("ore-whore-last-session",String(Date.now()));track("session_end",{session_digs:sessionDigs.current})}; addEventListener("pagehide",end); return()=>removeEventListener("pagehide",end); }, []);
  useEffect(() => { if (loaded) localStorage.setItem("ore-whore-save-v1", JSON.stringify(save)); }, [save, loaded]);
  // eslint-disable-next-line react-hooks/set-state-in-effect -- derives reward unlocks from save.combos count; moving this into the dig-mutation call site would touch protected progression logic (see HANDOFF_FOR_CLAUDE.md).
  useEffect(()=>{if(!loaded)return;const n=Object.keys(save.combos).length;const rewards:[number,string[]][]=[[23,["rust"]],[57,["gilded"]],[113,["menace"]],[169,["khoriumframe"]],[203,["titan"]],[225,["volumeone","orewhoretitle","orewhorepick","orewhorealbum","centerpiece"]]];const earned=rewards.filter(x=>n>=x[0]).flatMap(x=>x[1]).filter(id=>!save.unlocks.includes(id));if(earned.length)setSave(s=>({...s,unlocks:[...s.unlocks,...earned]}))},[loaded,save.combos,save.unlocks]);
  // eslint-disable-next-line react-hooks/set-state-in-effect, react-hooks/exhaustive-deps -- derives mine-completion/unlock strictly from persisted ore extraction counts; deps intentionally exclude album combinations and unrelated save fields.
  useEffect(()=>{if(!loaded||mineCompletion)return;const completed=biomeOrder.find(b=>save.unlockedBiomes.includes(b)&&biomeQuotaComplete(save,b)&&!save.completedBiomes.includes(b));if(!completed)return;const i=biomeOrder.indexOf(completed),next=i<biomeOrder.length-1?biomeOrder[i+1]:undefined;setSave(s=>({...s,completedBiomes:[...s.completedBiomes,completed],unlockedBiomes:next&&!s.unlockedBiomes.includes(next)?[...s.unlockedBiomes,next]:s.unlockedBiomes}));setMineCompletion({completed,next});track("biome_completed",{biome:completed,digs:save.digs,ore_extractions:biomeQuotaProgress(save,completed),quota:biomeQuotaTotal(completed)});emitGameplayEvent("MINE_COMPLETED",{biome:completed});if(next)track("biome_unlocked",{biome:next});},[loaded,save.ores,save.unlockedBiomes,save.completedBiomes,mineCompletion]);
  useEffect(()=>{if(!loaded){previousBiome.current=save.biome;return}if(previousBiome.current===save.biome)return;previousBiome.current=save.biome;setMineTransition(save.biome);const timer=setTimeout(()=>setMineTransition(null),720);return()=>clearTimeout(timer)},[loaded,save.biome]);

  // Perfect Strike metronome: a fixed-phase repeating window, so the timing
  // challenge is a learnable rhythm rather than randomized per strike.
  useEffect(() => {
    const start = perfectPhase.current;
    let readyTimeout: ReturnType<typeof setTimeout> | undefined;
    const showReady = () => { setPerfectReady(true); readyTimeout = setTimeout(() => setPerfectReady(false), PERFECT_WINDOW_MS); };
    const msIntoCycle = (Date.now() - start) % PERFECT_CYCLE_MS;
    const msUntilPeak = (PERFECT_CYCLE_MS - msIntoCycle) % PERFECT_CYCLE_MS;
    const msUntilWindowStart = Math.max(0, msUntilPeak - PERFECT_WINDOW_MS / 2);
    const kickoff = setTimeout(() => { showReady(); perfectIntervalRef.current = setInterval(showReady, PERFECT_CYCLE_MS); }, msUntilWindowStart);
    return () => { clearTimeout(kickoff); if (readyTimeout) clearTimeout(readyTimeout); if (perfectIntervalRef.current) clearInterval(perfectIntervalRef.current); };
  // eslint-disable-next-line react-hooks/exhaustive-deps -- mount-once metronome keyed to the fixed perfectPhase ref; not meant to re-schedule on unrelated re-renders.
  }, []);

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
    if (found||emptyFind||trueFind) return;
    setHitPoint(point||{x:50,y:48});

    // PERFECT CHECK — timing-skill, not RNG. Fixed metronome phase so the
    // window is a learnable rhythm. Never consumes a seeded RNG draw.
    // eslint-disable-next-line react-hooks/purity -- strike() only runs from click/keydown handlers, never during render.
    const cyclePos = (Date.now() - perfectPhase.current) % PERFECT_CYCLE_MS;
    const distFromPeak = Math.min(cyclePos, PERFECT_CYCLE_MS - cyclePos);
    const isPerfect = distFromPeak <= PERFECT_WINDOW_MS / 2;

    // MISS CHECK — only rolled if not Perfect (a Perfect Strike cannot
    // miss). Guaranteed hit after two consecutive misses — never a third
    // in a row. Seeded/mechanical RNG, per the MISS decisions.
    const isMiss = !isPerfect && consecutiveMisses.current < 2 && rng.current() < MISS_CHANCE;

    if (isMiss) {
      consecutiveMisses.current++;
      setSave(s => ({ ...s, strikes: s.strikes + 1, misses: s.misses + 1 }));
      setSessionMisses(m=>m+1);
      // eslint-disable-next-line react-hooks/purity -- strike() only runs from click/keydown handlers, never during render.
      const line = MISS_LINES[Math.floor(Math.random() * MISS_LINES.length)];
      setMissFlash(line);
      setLastHitKind("miss");
      setTimeout(() => { setMissFlash(null); setLastHitKind(null); }, 700);
      playImpact("miss");
      emitGameplayEvent("MISS", { stage, consecutive: consecutiveMisses.current });
      if (consecutiveMisses.current === 2) emitGameplayEvent("DOUBLE_MISS", { stage });
      return;
    }
    consecutiveMisses.current = 0;

    // CRITICAL CHECK — rolled on every successfully-landing strike (Perfect
    // or normal), independent of Perfect. Seeded/mechanical RNG.
    const isCrit = rng.current() < CRIT_CHANCE;
    const damage = isPerfect && isCrit ? 3 : (isPerfect || isCrit) ? 2 : 1;
    const hitKind = isPerfect && isCrit ? "perfectCrit" : isPerfect ? "perfect" : isCrit ? "crit" : "normal";
    const impactKind: "perfect" | "crit" | null = isPerfect ? "perfect" : isCrit ? "crit" : null;
    if (hitKind !== "normal") {
      if (hitKind === "perfectCrit") emitGameplayEvent("PERFECT_CRIT", { stage });
      else if (hitKind === "perfect") emitGameplayEvent("PERFECT_STRIKE", { stage });
      else emitGameplayEvent("CRITICAL_STRIKE", { stage });
      setLastHitKind(hitKind);
      setTimeout(() => setLastHitKind(null), 320);
    }

    const hit = rockHp - damage;
    // eslint-disable-next-line react-hooks/purity -- strike() only runs from click/keydown handlers, never during render.
    setImpact(Date.now());
    setTimeout(() => setImpact(null), 180);
    if (save.settings.vibration&&navigator.vibrate) navigator.vibrate(hitKind!=="normal" ? 45 : stage === "ore" ? 35 : 12);
    setSave(s => ({ ...s, strikes: s.strikes + 1, distance: +(s.distance + (stage === "tunnel" ? 0.4 : 0)).toFixed(1) }));
    if (hit > 0) { playImpact(impactKind ?? (stage==="ore"?"crack":"rock")); return setRockHp(hit); }
    if (stage === "tunnel") {
      // TRUE roll happens once per completed dig, independent of and before
      // the ordinary empty/ore result — including on digs that would
      // otherwise be empty. It overrides that dig's normal outcome entirely.
      if(rng.current()<TRUE_CHANCE){const artifact=pickTrue(rng.current);playImpact(impactKind??"crack");setSave(s=>{const digNumber=s.digs+1,isFirst=!s.trueArtifacts[artifact.id],veinDigsRemaining=Math.max(0,s.veinDigsRemaining-1),veinExpired=s.veinDigsRemaining>0&&veinDigsRemaining===0;if(veinExpired)emitGameplayEvent("VEIN_EXPIRED",{ore:s.veinOre});return {...s,digs:digNumber,trueArtifacts:{...s.trueArtifacts,[artifact.id]:(s.trueArtifacts[artifact.id]||0)+1},trueFirst:isFirst?{...s.trueFirst,[artifact.id]:digNumber}:s.trueFirst,lastDigAt:Date.now(),veinDigsRemaining,veinOre:veinExpired?null:s.veinOre}});sessionDigs.current++;setSessionDigsCount(c=>c+1);setTrueFind({artifact,digNumber:save.digs+1});track("true_artifact_found",{artifact_id:artifact.id,attempt:save.digs+1,biome:save.biome,trigger:"empty"});emitGameplayEvent("TRUE_ARTIFACT_FOUND",{artifact_id:artifact.id,trigger:"empty"});return;}
      if(rng.current()<.2){playImpact(impactKind??"crack");setSave(s=>{const streak=s.streak+1,veinDigsRemaining=Math.max(0,s.veinDigsRemaining-1),veinExpired=s.veinDigsRemaining>0&&veinDigsRemaining===0;if(veinExpired)emitGameplayEvent("VEIN_EXPIRED",{ore:s.veinOre});return {...s,digs:s.digs+1,emptyDigs:s.emptyDigs+1,streak,longestStreak:Math.max(s.longestStreak,streak),newStreak:0,lastDigAt:Date.now(),veinDigsRemaining,veinOre:veinExpired?null:s.veinOre}});sessionDigs.current++;setSessionDigsCount(c=>c+1);setSessionDrought(d=>{const next=d+1;setSessionLongestDrought(l=>Math.max(l,next));return next;});setEmptyFind(true);track("dig_empty",{attempt:save.digs+1,biome:save.biome,empty_rate:.2});return;}
      const band = depthBand(maxHp);
      const weights = applyVein(depthWeights(save.biome, band), save.veinOre);
      const ore = pick(ores,rng.current,weights);
      playImpact(impactKind??"clank");
      setPendingOre(ore);
      setStage("ore");
      const oreHp = toughnessStrikes(ore.toughness ?? 1);
      setMaxHp(oreHp);
      setRockHp(oreHp);
      track("tunnel_broken",{attempt:save.digs+1,biome:save.biome,depth_band:band});
      track("ore_found",{ore_id:ore.id,rarity:ore.rarity,biome:save.biome});
      if ((ore.toughness ?? 1) > 1) emitGameplayEvent("TOUGH_ORE_EXPOSED", { ore_id: ore.id, toughness: ore.toughness });
      return;
    }
    if(rng.current()<TRUE_CHANCE){const artifact=pickTrue(rng.current);playImpact(impactKind??"crack");setSave(s=>{const digNumber=s.digs+1,isFirst=!s.trueArtifacts[artifact.id],veinDigsRemaining=Math.max(0,s.veinDigsRemaining-1),veinExpired=s.veinDigsRemaining>0&&veinDigsRemaining===0;if(veinExpired)emitGameplayEvent("VEIN_EXPIRED",{ore:s.veinOre});return {...s,digs:digNumber,trueArtifacts:{...s.trueArtifacts,[artifact.id]:(s.trueArtifacts[artifact.id]||0)+1},trueFirst:isFirst?{...s.trueFirst,[artifact.id]:digNumber}:s.trueFirst,lastDigAt:Date.now(),veinDigsRemaining,veinOre:veinExpired?null:s.veinOre}});sessionDigs.current++;setSessionDigsCount(c=>c+1);setTrueFind({artifact,digNumber:save.digs+1});track("true_artifact_found",{artifact_id:artifact.id,attempt:save.digs+1,biome:save.biome,trigger:"ore"});emitGameplayEvent("TRUE_ARTIFACT_FOUND",{artifact_id:artifact.id,trigger:"ore"});return;}
    const band = depthBand(maxHp);
    const fallbackWeights = applyVein(depthWeights(save.biome, band), save.veinOre);
    const ore = pendingOre || pick(ores,rng.current,fallbackWeights);
    const targetParts=save.huntTarget?.split("-")||[],boost=huntBoost(save),mineralWeights=minerals.map(m=>m.weight*(targetParts[0]===ore.id&&targetParts[1]===m.id?boost:1));
    const mineral = pick(minerals,rng.current,mineralWeights), key = `${ore.id}-${mineral.id}`;
    playImpact(impactKind??"crack");
    setSave(s => {
      const isNew = !s.combos[key];
      const dustGain=isNew?0:dustByRarity[mineral.rarity];
      const before=minerals.filter(m=>s.combos[`${ore.id}-${m.id}`]).length;
      const after=isNew?before+1:before;
      const newStreak=isNew?0:s.streak+1,newDiscoveryStreak=isNew?s.newStreak+1:0,targetHit=s.huntTarget===key;
      const veinDigsRemaining=Math.max(0,s.veinDigsRemaining-1),veinExpiredOld=s.veinDigsRemaining>0&&veinDigsRemaining===0;
      const veinRoll=rng.current()<VEIN_CHANCE,veinTriggered=veinRoll;
      if(veinExpiredOld&&!veinTriggered)emitGameplayEvent("VEIN_EXPIRED",{ore:s.veinOre});
      if(veinTriggered){setSessionVeins(v=>v+1);emitGameplayEvent("VEIN_EXPOSED",{ore:ore.id});}
      const milestoneDigs=(after===14&&s.milestoneDigs[ore.id]===undefined)?{...s.milestoneDigs,[ore.id]:s.digs+1}:s.milestoneDigs;
      const next: Save = { ...s, digs: s.digs + 1, dust:s.dust+dustGain,dustEarned:s.dustEarned+dustGain, combos: { ...s.combos, [key]: (s.combos[key] || 0) + 1 }, ores: { ...s.ores, [ore.id]: (s.ores[ore.id] || 0) + 1 }, minerals: { ...s.minerals, [mineral.id]: (s.minerals[mineral.id] || 0) + 1 }, first: isNew ? { ...s.first, [key]: s.digs + 1 } : s.first, streak:newStreak,longestStreak:Math.max(s.longestStreak,newStreak),newStreak:newDiscoveryStreak,longestNewStreak:Math.max(s.longestNewStreak,newDiscoveryStreak), lastDigAt:Date.now(),huntTarget:targetHit?null:s.huntTarget,longestHunt:targetHit?Math.max(s.longestHunt,s.digs+1-s.huntStartedAtDig):s.longestHunt, milestones:{...s.milestones,...(after>=5?{[ore.id]:Math.max(s.milestones[ore.id]||0,after)}:{})}, milestoneDigs, veinDigsRemaining:veinTriggered?VEIN_DURATION:veinDigsRemaining, veinOre:veinTriggered?ore.id:(veinExpiredOld?null:s.veinOre) };
      if(isNew)setSessionNew(n=>n+1);
      setSessionDrought(0);
      // Last-One escalation: purely presentational — scan every ore
      // currently sitting at 14/15 and emit once per exact-threshold crossing.
      for(const o of ores){const found15=minerals.filter(m=>next.combos[`${o.id}-${m.id}`]).length;if(found15!==14)continue;const since=next.milestoneDigs[o.id];if(since===undefined)continue;const elapsed=next.digs-since;if(elapsed===25)emitGameplayEvent("LAST_SPECIMEN_25",{ore_id:o.id});else if(elapsed===60)emitGameplayEvent("LAST_SPECIMEN_60",{ore_id:o.id});else if(elapsed===100)emitGameplayEvent("LAST_SPECIMEN_100",{ore_id:o.id});else if(elapsed===175)emitGameplayEvent("LAST_SPECIMEN_175",{ore_id:o.id});}
      const fresh = unlocked(next, ore, mineral);
      next.achievements = [...s.achievements, ...fresh];
      if (fresh[0]) { const a = achievements.find(x => x.id === fresh[0])!; setTimeout(() => setToast(a), 650); }
      setFound({ ore, mineral, isNew, count: next.combos[key] });
      sessionDigs.current++;setSessionDigsCount(c=>c+1);
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

  const playImpact=(kind:"rock"|"clank"|"crack"|"miss"|"perfect"|"crit")=>{if(save.settings.master<=0||save.settings.sfx<=0)return;try{const C=window.AudioContext;const c=new C(),o=c.createOscillator(),g=c.createGain();o.connect(g);g.connect(c.destination);const base=kind==="clank"?720:kind==="crack"?145:kind==="perfect"?980:kind==="crit"?520:kind==="miss"?60:82+Math.random()*36;o.type=kind==="clank"?"triangle":kind==="perfect"||kind==="miss"?"sine":"square";o.frequency.setValueAtTime(base,c.currentTime);o.frequency.exponentialRampToValueAtTime(kind==="clank"?340:kind==="perfect"?1400:kind==="crit"?200:kind==="miss"?40:45,c.currentTime+.09);g.gain.setValueAtTime((kind==="clank"?.18:kind==="perfect"?.22:kind==="crit"?.16:kind==="miss"?.06:.08)*save.settings.master*save.settings.sfx,c.currentTime);g.gain.exponentialRampToValueAtTime(.001,c.currentTime+.12);o.start();o.stop(c.currentTime+.13);}catch{/* AudioContext unavailable or blocked; fail silently */}};

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.code === "Space" && tab === "mine" && !found && !emptyFind && !trueFind) { event.preventDefault(); strike(); }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  });

  const continueMine = () => { const hp=10+Math.floor(rng.current()*6); setFound(null); setEmptyFind(false); setPendingOre(null); setStage("tunnel"); setMaxHp(hp); setRockHp(hp); track("mine_started",{attempt:save.digs+1,biome:save.biome}); };
  const unique = Object.keys(save.combos).length;
  const reset = () => { if (confirm("Erase every discovery and return to the cold, uncaring rock?")) { setSave(blank); setFound(null); setPendingOre(null); setStage("tunnel"); setMaxHp(12); setRockHp(12); sessionDigs.current=0; setSessionDigsCount(0); setSessionMisses(0); setSessionVeins(0); setSessionNew(0); setSessionDrought(0); setSessionLongestDrought(0); consecutiveMisses.current=0; } };

  return <main className={`${save.settings.reducedMotion?"reduced-motion":""} ${save.settings.reducedShake?"reduced-shake":""} ${save.settings.highContrast?"high-contrast":""} cosmetic-${save.equipped}`}>
    <header className="topbar">
      <button className="brand" onClick={() => setTab("mine")}><span className="brand-mark">OW</span><span>ORE WHORE<small>COMPULSIVE GEOLOGY</small></span></button>
      <nav aria-label="Primary">
        <button className={tab === "mine" ? "active" : ""} onClick={() => setTab("mine")}>MINE</button>
        <button className={tab === "album" ? "active" : ""} onClick={() => {setTab("album");track("album_opened",{completion:unique/225});}}>ALBUM <b>{unique}/225</b></button>
        <button className={tab === "wanted" ? "active" : ""} onClick={() => {setTab("wanted");track("missing_view_opened",{completion:unique/225});}}>WANTED</button>
        <button className={tab === "records" ? "active" : ""} onClick={() => setTab("records")}>RECORDS</button>
        <button className={tab === "more" ? "active" : ""} onClick={() => setTab("more")}>MORE</button>
        <button className={`true-nav-btn ${tab === "true" ? "active" : ""}`} onClick={() => setTab("true")}>TRUE</button>
      </nav>
      <div className="depth"><span>SPECIMEN DUST</span><strong>✦ {save.dust}</strong></div>
    </header>

    {tab === "mine" && <section className={`mine-screen biome-${save.biome} ${impact ? "screen-hit" : ""} stage-${stage}`} style={{"--biome-accent":biomeVisuals[save.biome].accent,"--biome-secondary":biomeVisuals[save.biome].secondary,"--biome-canvas":biomeVisuals[save.biome].canvas,"--biome-cavity":biomeVisuals[save.biome].cavity,"--biome-debris":biomeVisuals[save.biome].debris,"--biome-particle":biomeVisuals[save.biome].particle,"--biome-light":biomeVisuals[save.biome].light} as React.CSSProperties}>
      <div className="mine-copy"><p className="eyebrow">{stage === "ore" ? "CLANK · DEPOSIT EXPOSED" : "SHIFT 01 · THE LONG WALL"}</p><h1>{stage === "ore" ? <><i>ORE</i> FOUND.</> : <>KEEP <i>DIGGING.</i></>}</h1><p>{stage === "ore" ? `${pendingOre?.name}. Crack it open and see what ruined your evening.` : <>The rock does not care about your album.<br/>Unfortunately, you do.</>}</p></div>
      <div className="stats-row"><span><small>DEPOSITS</small>{save.digs}</span><span><small>UNIQUE</small>{unique}<em>/ 225</em></span><span><small>DRY STREAK</small>{save.streak}</span></div>
      {save.huntTarget&&<div className="hunt-banner"><span>HUNTING{huntBoost(save)>1?` · FOCUS +${Math.round((huntBoost(save)-1)*100)}%`:""}</span><strong>{(()=>{const p=save.huntTarget!.lastIndexOf("-");return `${ores.find(o=>o.id===save.huntTarget!.slice(0,p))?.name} + ${minerals.find(m=>m.id===save.huntTarget!.slice(p+1))?.name}`})()}</strong><button onClick={()=>setTab("wanted")}>VIEW TARGET</button></div>}
      {save.veinOre&&<div className="vein-banner"><span>VEIN EXPOSED</span><strong>{ores.find(o=>o.id===save.veinOre)?.name}</strong><small>{save.veinDigsRemaining} {save.veinDigsRemaining===1?"DIG":"DIGS"} REMAIN</small></div>}
      {(()=>{const found=biomeQuotaProgress(save,save.biome),target=biomeQuotaTotal(save.biome),reached=biomeQuotaComplete(save,save.biome);return <div className="mine-mastery extraction-quota"><div><span>{biomeNames[save.biome]} EXTRACTION QUOTA</span><strong>{found} / {target}</strong></div><i><b style={{width:`${Math.min(100,found/target*100)}%`}}/></i><div className="quota-list">{biomePages[save.biome].map(id=>{const ore=ores.find(o=>o.id===id)!,count=Math.min(save.ores[id]||0,oreQuota(id)),targetCount=oreQuota(id);return <span key={id} className={count>=targetCount?"met":""}><img src={oreAsset(id)} alt=""/><b>{ore.name.replace(" Ore","")}</b><em>{count}/{targetCount}</em>{count>=targetCount&&<strong>✓</strong>}</span>})}</div><small>{reached?(save.biome==="northrend"?"VOLUME I MINING PROGRESSION COMPLETE · Album mastery remains separate.":"PASSAGE OPEN · all native ore quotas satisfied."):"Complete every extraction quota to unlock the next mine."}</small></div>})()}
      <div className="biomes volume-biomes" aria-label="Mine location">{biomeOrder.map((b,i)=>{const open=save.unlockedBiomes.includes(b),done=biomeQuotaProgress(save,b),previous=i?biomeOrder[i-1]:b,v=biomeVisuals[b];return <button key={b} disabled={!open} style={{"--card-accent":v.accent,"--card-secondary":v.secondary,"--card-bg":v.card} as React.CSSProperties} className={`mine-card biome-card-${b} ${save.biome===b?"chosen":""} ${open?"":"locked"}`} onClick={()=>{setSave(s=>({...s,biome:b}));track("biome_selected",{biome:b})}}><span>{open?biomeNames[b]:`🔒 ${biomeNames[b]}`}</span><small>{open?`${done}/${biomeQuotaTotal(b)} EXTRACTED · ${distributionLabel(b)}`:`COMPLETE ALL ${biomeNames[previous]} EXTRACTION QUOTAS · ${biomeQuotaProgress(save,previous)}/${biomeQuotaTotal(previous)}`}</small></button>})}</div>
      <button className={`rock ${impact ? "hit" : ""} ${stage === "ore" ? "ore-rock" : ""} damage-${Math.floor((1-rockHp/maxHp)*4)} ${rockHp===1?"final-hit":""} ${lastHitKind&&lastHitKind!=="normal"?`hit-${lastHitKind==="perfectCrit"?"perfect-crit":lastHitKind}`:""}`} style={{"--hit-x":`${hitPoint.x}%`,"--hit-y":`${hitPoint.y}%`} as React.CSSProperties} onClick={strikeAtPointer} aria-label={stage === "ore" ? "Crack the exposed ore deposit" : "Strike the rock wall"}>
        <span className="mine-atmosphere" aria-hidden="true"/>
        <span className="impact-scar" aria-hidden="true"/>
        <span className="crack c1"/><span className="crack c2"/><span className="crack c3"/>
        <span className={`perfect-ring ${perfectReady?"ready":""}`} aria-hidden="true"/>
        {stage === "ore" && pendingOre && <span className={`exposed-ore rarity-${pendingOre.rarity.toLowerCase()}`} style={{"--ore":pendingOre.color} as React.CSSProperties}><img className="ore-sprite ore-sprite-exposed" src={oreAsset(pendingOre.id)} alt=""/><strong>{pendingOre.name}</strong><small>{pendingOre.rarity.toUpperCase()}</small></span>}
        {impact && <span className="debris">{Array.from({length:8},(_,i)=><i key={i}/>)}</span>}
        <span className="pickaxe" aria-hidden="true"><i className="pick-head"/><i className="pick-handle"/><i className="pick-grip"/></span>
        {impact && <span className="impact-flash" aria-hidden="true"/>}
        {lastHitKind&&lastHitKind!=="normal"&&lastHitKind!=="miss"&&<span className="hit-callout" aria-hidden="true">{lastHitKind==="perfectCrit"?"PERFECT CRIT":lastHitKind==="perfect"?"PERFECT":"CRITICAL"}</span>}
        {missFlash && <span className="miss-bark" role="status">{missFlash}</span>}
      </button>
      <div className="dig-panel"><div><span className="mouse-icon">↙</span><strong>{stage === "ore" ? "CRACK DEPOSIT" : "CLICK TO STRIKE"}</strong><small>or press SPACE</small></div><div className="integrity"><span>{stage === "ore" ? "ORE SHELL" : <>TUNNEL PROGRESS · {Math.round((1-rockHp/maxHp)*100)}% · <b className={`depth-band depth-${depthBand(maxHp)}`}>{depthBand(maxHp).toUpperCase()}</b></>}</span><i>{Array.from({length: 12},(_,i)=><b key={i} className={i < Math.ceil((rockHp/maxHp)*12) ? "full" : ""}/>)}</i></div></div>
      <button className="album-link" onClick={() => {setTab("album");track("album_opened",{completion:unique/225});}}>VIEW COMBINATION ALBUM <span>→</span></button>
      {mineTransition&&<div className="mine-transition" role="status" aria-live="polite"><small>DESCENDING...</small><strong>{biomeNames[mineTransition]}</strong><span>{biomeVisuals[mineTransition].flavor}</span></div>}
    </section>}

    {tab === "album" && <Album save={save} />}
    {tab === "wanted" && <Wanted save={save} onHunt={(biome,target)=>{setSave(s=>({...s,biome,huntTarget:target,huntStartedAtDig:s.digs,huntCounts:{...s.huntCounts,[target]:(s.huntCounts[target]||0)+1}}));track("hunt_started",{biome,combination_id:target});setTab("mine");continueMine();}} />}
    {tab === "records" && <><Records save={save} onReset={reset} session={{digs:sessionDigsCount,misses:sessionMisses,veins:sessionVeins,newSpecimens:sessionNew,drought:sessionDrought,longestDrought:sessionLongestDrought}} /><HuntRecords save={save}/></>}
    {tab === "more" && <><VolumeRewards save={save}/><More save={save} setSave={setSave} onHelp={()=>{setTab("mine");setOnboarding(true)}} /></>}
    {tab === "true" && <TrueArchive save={save} />}

    {trueFind && <TrueReveal data={trueFind} reducedMotion={save.settings.reducedMotion} onContinue={()=>{setTrueFind(null);continueMine();}} />}
    {found && <Reveal found={found} total={unique} biome={save.biome} onContinue={continueMine} />}
    {emptyFind&&<EmptyReveal attempt={save.digs} onContinue={continueMine}/>}
    {milestone && <Milestone data={milestone} onClose={()=>setMilestone(null)} onAlbum={()=>{if(milestone.level===14&&milestone.missing){const target=`${milestone.ore.id}-${milestone.missing.id}`,b=bestBiome(milestone.ore);setSave(s=>({...s,biome:b,huntTarget:target,huntStartedAtDig:s.digs,huntCounts:{...s.huntCounts,[target]:(s.huntCounts[target]||0)+1}}));track("hunt_started",{biome:b,combination_id:target});setTab("mine")}else setTab("album");setMilestone(null)}} />}
    {onboarding&&<Onboarding onDone={()=>{setOnboarding(false);setSave(s=>({...s,settings:{...s.settings,helpSeen:true}}));track("mine_started",{attempt:save.digs+1,biome:save.biome})}}/>}
    {share&&<ShareCard data={share} biome={save.biome} onClose={()=>setShare(null)}/>} 
    {mineCompletion&&<MineCompletion data={mineCompletion} digs={save.digs} onContinue={()=>{if(mineCompletion.next)setSave(s=>({...s,biome:mineCompletion.next!}));setMineCompletion(null);setTab("mine");continueMine();}}/>}
    {toast && <div className="achievement" role="button" tabIndex={0} onClick={() => setToast(null)} onKeyDown={(e)=>{if(e.key==="Enter"||e.key===" "){e.preventDefault();setToast(null)}}}><span>{toast.name.includes("MINE UNLOCKED")?"NEW MINE UNLOCKED":"ACHIEVEMENT UNLOCKED"}</span><strong>{toast.name}</strong><p>{toast.text}</p></div>}
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
    <div className={`album-title milestone-${total} ${total===14?`last-one-${lastOneTier(save,selected.id)}`:""}`}><div><img className="ore-gem ore-sprite ore-sprite-album" src={oreAsset(selected.id)} alt=""/><div><p>{selected.rarity.toUpperCase()} ORE · {save.ores[selected.id]||0} MINED</p><h3>{selected.name} {total===15&&<b className="complete-stamp">PAGE COMPLETE</b>}</h3><small>{total===14?`${lastOneCopy(save,selected.id)} MISSING: ${minerals.find(m=>!save.combos[`${selected.id}-${m.id}`])?.name}.`:selected.note}</small><div className="page-stats">RAREST: {rarest?.m.name||"—"} · MOST DUPLICATED: {most?`${most.m.name} ×${most.count}`:"—"} · MISSING: {15-total}</div></div></div><strong>{total}<small>/15 · {Math.round(total/15*100)}%</small></strong></div>
    <div className="slots">{minerals.map((m, i) => { const key=`${selected.id}-${m.id}`, count=save.combos[key]||0; return <article key={m.id} className={count ? "found" : "locked"}><div className="slot-top"><span>0{i+1}</span><b className={`rarity ${m.rarity.toLowerCase()}`}>{count ? m.rarity.toUpperCase() : "UNKNOWN"}</b></div><div className="mineral-gem gem-art" style={{"--gem": count ? m.color : "#2b2d2e"} as React.CSSProperties}/><h4>{count ? m.name : "UNDISCOVERED"}</h4><p>{count ? m.note : "Keep digging. It is definitely in there. Probably."}</p><footer>{count ? <><span>FOUND ×{count}</span><small>FIRST: DIG #{save.first[key]}</small></> : <span>???</span>}</footer></article>})}</div>
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
    <div className="wanted-list">{shown.map(r=><article className={r.found===14?`last-one last-one-${lastOneTier(save,r.ore.id)}`:""} key={r.ore.id}><header><img className="ore-gem ore-sprite ore-sprite-wanted" src={oreAsset(r.ore.id)} alt=""/><div><small>{r.found===14?lastOneCopy(save,r.ore.id):"INCOMPLETE PAGE"}</small><h3>{r.ore.name} — {r.found}/15</h3></div></header><div className="missing-grid volume-missing">{r.missing.map(m=>{const target=`${r.ore.id}-${m.id}`,b=best(r.ore);return <div className={save.huntTarget===target?"pinned":""} key={m.id}><span className="wanted-gem gem-art" style={{"--gem":m.color} as React.CSSProperties}/><strong>{m.name}</strong><small>{biomeNames[b]} · 1/{odds(r.ore,m,b)}</small><button onClick={()=>onHunt(b,target)}>{save.huntTarget===target?"PINNED":"PIN TARGET"}</button></div>})}</div><footer><span>RECOMMENDED: {biomeNames[best(r.ore)]}</span><button onClick={()=>{const m=[...r.missing].sort((a,b)=>a.weight-b.weight)[0];onHunt(best(r.ore),`${r.ore.id}-${m.id}`)}}>HUNT THIS PAGE →</button></footer></article>)}</div>
  </section>
}

function Milestone({data,onClose,onAlbum}:{data:{ore:Item;level:number;missing?:Item;attempts:number};onClose:()=>void;onAlbum:()=>void}){
 return <div className={`milestone-modal level-${data.level}`}><div><p className="eyebrow">{data.level===15?"ALBUM PAGE COMPLETE":data.level===14?"ONE SPECIMEN REMAINS":data.level===12?"THE HUNT BEGINS":"PAGE MILESTONE"}</p><span className="big-gem" style={{"--gem":data.ore.color} as React.CSSProperties}>◆</span><h2>{data.ore.name} — {data.level}/15</h2>{data.level===15&&<div className="completion-row">{minerals.map(m=><span key={m.id} style={{color:m.color}}>◆</span>)}</div>}{data.missing?<><p>Your final missing specimen is <strong>{data.missing.name}</strong>.</p><small>Natural pairing odds: 1 in {odds(data.ore,data.missing,bestBiome(data.ore))} · Recommended: {biomeNames[bestBiome(data.ore)]}</small></>:<p>{data.level===15?`Completed after ${data.attempts} ${data.ore.name} deposits. Reward: permanent Volume I page stamp.`:data.level===12?"Three remain. Generic mining has now become personal.":data.level===10?"Double digits. You may be in too deep.":"Five found. Ten more opportunities for disappointment."}</p>}<div><button onClick={onAlbum}>{data.level===14?"HUNT THIS PAGE":"INSPECT PAGE"}</button><button onClick={onClose}>KEEP MINING</button></div></div></div>
}

function MineCompletion({data,digs,onContinue}:{data:{completed:Biome;next?:Biome};digs:number;onContinue:()=>void}){
 return <div className="mine-completion"><div><p className="eyebrow">EXTRACTION QUOTA COMPLETE</p><div className="completion-seal">◆</div><h2>{biomeNames[data.completed]} SURVEY<br/><i>SATISFIED.</i></h2><p>Every native ore quota has been fulfilled after {digs} total deposits. Album combinations and TRUE Artifacts remain independent.</p>{data.next?<div className="next-mine-reveal"><small>NEW DESCENT UNLOCKED</small><strong>{biomeNames[data.next]} UNLOCKED</strong></div>:<div className="next-mine-reveal"><small>VOLUME I MINING PROGRESSION</small><strong>COMPLETE</strong></div>}<button onClick={onContinue}>{data.next?`ENTER ${biomeNames[data.next]}`:"RETURN TO THE MOUNTAIN"} <span>→</span></button></div></div>
}

function EmptyReveal({attempt,onContinue}:{attempt:number;onContinue:()=>void}){
 return <div className="reveal empty-reveal"><div className="reveal-card"><button className="close" onClick={onContinue}>×</button><p className="eyebrow">THE MOUNTAIN HAS SPOKEN</p><div className="empty-mark">∅</div><h2>NOTHING.</h2><p>Absolutely nothing. Twenty percent of excavations produce only dust, regret, and a slightly wider tunnel.</p><div className="verdict duplicate"><span>EMPTY DIG</span><strong>ATTEMPT #{attempt}</strong><small>NO ORE · NO MINERAL · NO ALBUM PROGRESS</small></div><button className="continue" onClick={onContinue}>DIG SOMEWHERE ELSE <span>→</span></button></div></div>
}

function TrueArtifactArt({id}:{id:string}){
  const [missing,setMissing]=useState(false);
  return <span className="true-art-slot">
    {!missing && <img className="true-art-img" src={trueAsset(id)} alt="" onError={()=>setMissing(true)}/>}
    {missing && <span className="true-art-placeholder" aria-hidden="true">◆<small>ARTWORK PENDING</small></span>}
  </span>;
}

function TrueReveal({data,reducedMotion,onContinue}:{data:{artifact:TrueArtifact;digNumber:number};reducedMotion:boolean;onContinue:()=>void}){
  const [stage,setStage]=useState<"pause"|"message"|"reveal">("pause");
  const [canClose,setCanClose]=useState(false);
  useEffect(()=>{
    const t1=setTimeout(()=>setStage("message"), reducedMotion?150:900);
    const t2=setTimeout(()=>setStage("reveal"), reducedMotion?300:1900);
    const t3=setTimeout(()=>setCanClose(true), 2000);
    return ()=>{clearTimeout(t1);clearTimeout(t2);clearTimeout(t3)};
  },[reducedMotion]);
  return <div className={`true-reveal stage-${stage}`} role="status" aria-live="assertive">
    <div className="true-reveal-card">
      {stage==="pause" && <div className="true-pause-mark" aria-hidden="true">◆</div>}
      {stage!=="pause" && <p className="true-alert">ANOMALOUS OBJECT DETECTED</p>}
      {stage==="reveal" && <>
        <TrueArtifactArt id={data.artifact.id}/>
        <p className="true-classification">TRUE ARTIFACT</p>
        <h2>{data.artifact.name}</h2>
        <p className="true-lore">{data.artifact.lore}</p>
        <p className="true-meta">FOUND AFTER {data.digNumber.toLocaleString()} DIGS</p>
        <button className="continue" disabled={!canClose} onClick={onContinue}>ARCHIVE IT <span>→</span></button>
      </>}
    </div>
  </div>;
}

function TrueArchive({save}:{save:Save}){
  const owned=trueArtifactPool.filter(a=>save.trueArtifacts[a.id]);
  const totalFound=Object.values(save.trueArtifacts).reduce((s,n)=>s+n,0);
  return <section className="page true-archive-page">
    <div className="page-head"><div><p className="eyebrow">NOT GEOLOGY. SOMETHING ELSE.</p><h2>TRUE <i>ARCHIVE</i></h2></div><div className="completion"><span>ARTIFACTS FOUND</span><strong>{owned.length}<small> / {trueArtifactPool.length}</small></strong></div></div>
    <p className="true-archive-intro">Common through Legendary belongs to the mountain. These do not. Each is independently possible on any dig, at any depth, regardless of mine, biome, streak, or luck. Odds: 1 in 2,000. No protection. No pattern.{totalFound?` Total anomalies logged: ${totalFound}.`:""}</p>
    <div className="true-grid">{trueArtifactPool.map(a=>{const count=save.trueArtifacts[a.id]||0,first=save.trueFirst[a.id];return <article key={a.id} className={count?"found":"locked"}>
      <TrueArtifactArt id={a.id}/>
      <h3>{count?a.name:"UNKNOWN ANOMALY"}</h3>
      <p>{count?a.lore:"Its outline refuses to resolve."}</p>
      <footer>{count?<><span>FOUND ×{count}</span>{first!==undefined&&<small>FOUND AFTER {first.toLocaleString()} DIGS</small>}</>:<span>???</span>}</footer>
    </article>})}</div>
  </section>;
}

function Records({ save, onReset, session }: { save: Save; onReset: () => void; session: {digs:number;misses:number;veins:number;newSpecimens:number;drought:number;longestDrought:number} }) {
  const dupes = Object.values(save.combos).reduce((s,n)=>s+Math.max(0,n-1),0);
  const most=Object.entries(save.combos).sort((a,b)=>b[1]-a[1])[0];const mostOre=Object.entries(save.ores).sort((a,b)=>b[1]-a[1])[0];const complete=ores.filter(o=>minerals.every(m=>save.combos[`${o.id}-${m.id}`])).length;
  const leastOre=Object.entries(save.ores).filter(x=>x[1]>0).sort((a,b)=>a[1]-b[1])[0];
  return <section className="page records-page"><div className="page-head"><div><p className="eyebrow">VOLUME I · HARD EVIDENCE OF POOR PRIORITIES</p><h2>YOUR <i>RECORDS</i></h2></div></div>
    <div className="today-summary"><span>TODAY</span><strong>{session.digs} DIGS · {session.newSpecimens} NEW · {session.veins} VEIN{session.veins===1?"":"S"} · {session.misses} MISS{session.misses===1?"":"ES"} · LONGEST DROUGHT {session.longestDrought}{session.drought>0?` · CURRENT DROUGHT ${session.drought}`:""}</strong></div>
    <div className="record-grid"><article><span>TOTAL STRIKES</span><strong>{save.strikes}</strong><p>{save.distance.toFixed(1)}m of entirely necessary depth.</p></article><article><span>DEPOSITS / UNIQUE</span><strong>{save.digs} / {Object.keys(save.combos).length}</strong><p>{(Object.keys(save.combos).length/225*100).toFixed(1)}% of Volume I.</p></article><article><span>DUPLICATES / WORST DROUGHT</span><strong>{dupes} / {save.longestStreak}</strong><p>Character-building, allegedly.</p></article><article><span>TOTAL ROCKS ASSAULTED</span><strong>{save.strikes.toLocaleString()}</strong><p>{save.misses} whiffed entirely. Geology remembers.</p></article><article><span>TOTAL DARK IRON SUFFERED</span><strong>{save.ores.dark||0}</strong><p>Dignity already left.</p></article><article><span>TITANIUM MINED</span><strong>{save.ores.titanium||0}</strong><p>Try to act normal.</p></article><article><span>COMPLETED PAGES</span><strong>{complete} / 15</strong><p>Actual evidence of progress.</p></article><article><span>DUST EARNED / SPENT</span><strong>{save.dustEarned} / {save.dustSpent}</strong><p>Duplicates, ground into fashion.</p></article><article><span>MOST DUPLICATED</span><strong>{most?most[1]:0}×</strong><p>{most?most[0].replace("-"," + "):"Nothing yet"}</p></article><article><span>MOST MINED ORE</span><strong>{mostOre?mostOre[1]:0}×</strong><p>{mostOre?ores.find(o=>o.id===mostOre[0])?.name:"Nothing yet"}</p></article><article><span>LEAST MINED DISCOVERED ORE</span><strong>{leastOre?leastOre[1]:0}×</strong><p>{leastOre?ores.find(o=>o.id===leastOre[0])?.name:"Nothing yet"}</p></article></div><h3 className="ach-title">ACHIEVEMENTS <span>{save.achievements.length}/{achievements.length}</span></h3><div className="ach-list">{achievements.map(a=><article className={save.achievements.includes(a.id)?"earned":""} key={a.id}><span>◆</span><div><strong>{save.achievements.includes(a.id)?a.name:"LOCKED"}</strong><p>{a.text}</p></div></article>)}</div><button className="reset" onClick={onReset}>ERASE SAVE DATA</button></section>;
}

function Onboarding({onDone}:{onDone:()=>void}){return <div className="onboarding"><div><span className="brand-mark">OW</span><p className="eyebrow">VOLUME I · CLASSIC → TBC → WOTLK</p><h1>DIG. CLANK. CRACK. <i>COLLECT.</i></h1><p>Fifteen ores. Fifteen minerals. 225 reasons not to stop.</p><button onClick={onDone}>START MINING <span>→</span></button><small>Click the rock or press Space. That is genuinely it.</small></div></div>}

function HuntRecords({save}:{save:Save}){const top=Object.entries(save.huntCounts).sort((a,b)=>b[1]-a[1])[0];const label=top?(()=>{const p=top[0].lastIndexOf("-");return `${ores.find(o=>o.id===top[0].slice(0,p))?.name} + ${minerals.find(m=>m.id===top[0].slice(p+1))?.name}`})():"No target repeatedly hunted";return <div className="hunt-records"><article><small>LONGEST NEW STREAK</small><strong>{save.longestNewStreak}</strong><span>fresh combinations in a row</span></article><article><small>MOST HUNTED TARGET</small><strong>{top?`${top[1]}×`:"—"}</strong><span>{label}</span></article><article><small>LONGEST TARGET HUNT</small><strong>{save.longestHunt}</strong><span>digs from pin to acquisition</span></article><article><small>EMPTY DIGS</small><strong>{save.emptyDigs}</strong><span>{save.digs?`${(save.emptyDigs/save.digs*100).toFixed(1)}% of all attempts`:"the mountain is saving them up"}</span></article></div>}

function ShareCard({data,biome,onClose}:{data:{ore:Item;mineral:Item;attempt:number;total:number};biome:Biome;onClose:()=>void}){return <div className="share-wrap"><div className="share-card"><p>ORE WHORE · VOLUME I</p><div><img className="ore-sprite ore-sprite-share" src={oreAsset(data.ore.id)} alt=""/><b>+</b><span className="gem-art" style={{"--gem":data.mineral.color} as React.CSSProperties}/></div><small>{data.ore.rarity.toUpperCase()} + {data.mineral.rarity.toUpperCase()}</small><h2>{data.ore.name}<br/>+ {data.mineral.name}</h2><strong>RARE DISCOVERY</strong><footer><span>NATURAL ODDS · 1 / {odds(data.ore,data.mineral,biome)}</span><span>ATTEMPT #{data.attempt} · ALBUM {data.total}/225</span></footer></div><p>Screenshot this. Nobody will believe you, but try.</p><button onClick={onClose}>CONTINUE</button></div>}

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
  return <div className={`reveal ore-${found.ore.id} ${huge?"mythic":""} ${!found.isNew&&!huge?"quick":""}`}><div className="reveal-card"><button className="close" onClick={onContinue}>×</button><p className="eyebrow">{personality}</p><div className="combo-art"><img className="big-gem ore ore-sprite ore-sprite-reveal" src={oreAsset(found.ore.id)} alt=""/><b>+</b><span className="big-gem mineral gem-art" style={{"--gem":found.mineral.color} as React.CSSProperties}/></div><div className="names"><div><small>{found.ore.rarity}</small><strong>{found.ore.name}</strong></div><b>CONTAINING</b><div><small>{found.mineral.rarity}</small><strong>{found.mineral.name}</strong></div></div><div className={`verdict ${found.isNew?"new":"duplicate"}`}><span>{found.isNew ? (huge?"MYTHIC DISCOVERY":"NEW COMBINATION") : `DUPLICATE ×${found.count}`}</span><strong>{found.isNew ? `${total} / 225` : `+${dustByRarity[found.mineral.rarity]} SPECIMEN DUST`}</strong><small>NATURAL ODDS · APPROX. 1 IN {comboOdds.toLocaleString()}</small></div><button className="continue" onClick={onContinue}>{found.isNew?"CONTINUE MINING":"AGAIN. NOW."} <span>→</span></button></div></div>;
}
