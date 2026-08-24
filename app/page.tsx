"use client";

import { useEffect, useRef, useState } from "react";
import { track } from "./analytics";
import { emitGameplayEvent } from "./gameplay-events";
import { CANONICAL_EXCAVATION_PROBABILITIES, canAfford, forgeAtomic, forgeRecipes, forgedItems, forgeWithPrerequisitesAtomic, maxCraftable, metallurgyRecipes, planForgePrerequisites, processedMaterials, smeltBatchAtomic, type RecipeUnlock, type ResourceState } from "./metallurgy";
import { DEFAULT_TOOL_SKIN_ID, isToolSkinUnlocked, toolSkin, toolSkins } from "./tool-skins";
import { artifactChanceForDig, canTriggerForbiddenTunnel, createForbiddenTunnel, FORBIDDEN_TUNNEL_TRIGGER_CHANCE, ORDINARY_TRUE_ARTIFACT_CHANCE, markModifierRolled, sanitizeArtifactModifier, sanitizeForbiddenTunnel, selectFirstPath, selectSecondPath, type ArtifactModifier, type FirstDirection, type ForbiddenTunnelState, type SecondDirection } from "./forbidden-tunnel";
import { ASOC_TICKET_CHANCE, ASOC_TICKET_ID, asocTicketChanceForDig } from "./asoc-ticket";
import { ALIJA_SHOVEL_ARTIFACT_ID, ALIJA_SHOVEL_SKIN_ID, artifactRewardUnlocks } from "./artifact-rewards";
import { eligibleOreCommentary, NORMAL_DIGGING_COMMENTARY, selectMineCommentary, TRUE_ARTIFACT_COMMENTARY, type MineCommentary } from "./mine-commentary";
import { activeBerserkMode, activateBerserk, berserkMode, berserkRemainingMs, BERSERK_MODES, sanitizeActiveBerserk, type ActiveBerserk, type BerserkModeId } from "./berserk";
import { CREDITS, LAST_FIND_PAGES, type CompletionRecord } from "./endgame";

type Rarity = "Common" | "Uncommon" | "Rare" | "Epic" | "Legendary" | "Mythic";
type Item = { id: string; name: string; rarity: Rarity; weight: number; color: string; note: string; toughness?: number };
type Biome = "old" | "deep" | "outland" | "northrend";
type Settings = { master:number;musicVolume:number;sfx:number;musicEnabled:boolean;pickaxeSfxEnabled:boolean;reducedShake:boolean;reducedMotion:boolean;vibration:boolean;highContrast:boolean;helpSeen:boolean };
type ActiveTrueEncounter={artifactId:string;trigger:"empty"|"ore";hp:number;maxHp:number;startedAtDig:number};
type Save = { digs: number; emptyDigs:number; strikes: number; distance: number; combos: Record<string, number>; ores: Record<string, number>; oreResources:Record<string,number>;mineralResources:Record<string,number>;processedResources:Record<string,number>;ownedTools:string[];equippedTool:string;toolTier:number;toolSkinId:string; minerals: Record<string, number>; first: Record<string, number>; achievements: string[]; streak: number; longestStreak:number;newStreak:number;longestNewStreak:number; dust: number; dustEarned:number;dustSpent:number;activeBerserk:ActiveBerserk|null; biome: Biome; unlockedBiomes:Biome[]; completedBiomes:Biome[]; milestones: Record<string, number>; lastDigAt: number; schema: number; settings:Settings;unlocks:string[];equipped:string;huntTarget:string|null;huntCounts:Record<string,number>;huntStartedAtDig:number;longestHunt:number;trueArtifacts:Record<string,number>;trueFirst:Record<string,number>;activeTrueEncounter:ActiveTrueEncounter|null;forbiddenTunnel:ForbiddenTunnelState|null;pendingArtifactModifier:ArtifactModifier|null;misses:number;perfectStrikes:number;criticalStrikes:number;veinsDiscovered:number;forbiddenTunnelsEntered:number;toolUse:Record<string,number>;runStartedAt:number;gameCompleted:boolean;endingSeen:boolean;completionCount:number;asocTickets:number;newGamePlusLevel:number;firstCompletionDate?:string;latestCompletionDate?:string;completionHistory:CompletionRecord[];veinOre:string|null;veinDigsRemaining:number;milestoneDigs:Record<string,number> };

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

const defaultSettings:Settings={master:.7,musicVolume:.65,sfx:.8,musicEnabled:true,pickaxeSfxEnabled:true,reducedShake:false,reducedMotion:false,vibration:true,highContrast:false,helpSeen:false};
const PICKAXE_HIT_SOUNDS=[1,2,3,4,5,6].map(n=>`/assets/audio/pickaxe-hits/pick${n}.wav`);
const blank: Save = { digs: 0, emptyDigs:0, strikes: 0, distance: 0, combos: {}, ores: {}, oreResources:{},mineralResources:{},processedResources:{},ownedTools:["rusty-pickaxe"],equippedTool:"rusty-pickaxe",toolTier:0,toolSkinId:DEFAULT_TOOL_SKIN_ID, minerals: {}, first: {}, achievements: [], streak: 0,longestStreak:0,newStreak:0,longestNewStreak:0, dust: 0,dustEarned:0,dustSpent:0,activeBerserk:null, biome: "old", unlockedBiomes:["old"], completedBiomes:[], milestones: {}, lastDigAt: 0, schema: 17,settings:defaultSettings,unlocks:[],equipped:"standard",huntTarget:null,huntCounts:{},huntStartedAtDig:0,longestHunt:0,trueArtifacts:{},trueFirst:{},activeTrueEncounter:null,forbiddenTunnel:null,pendingArtifactModifier:null,misses:0,perfectStrikes:0,criticalStrikes:0,veinsDiscovered:0,forbiddenTunnelsEntered:0,toolUse:{},runStartedAt:Date.now(),gameCompleted:false,endingSeen:false,completionCount:0,asocTickets:0,newGamePlusLevel:0,completionHistory:[],veinOre:null,veinDigsRemaining:0,milestoneDigs:{} };
const equippedMiningTool=(save:Save)=>forgedItems.find(t=>t.id===save.equippedTool)||forgedItems[0];
const cosmetics=[{id:"rust",name:"Rustbite Pick",cost:15,kind:"PICKAXE"},{id:"neon",name:"Toxic Impact",cost:30,kind:"IMPACT"},{id:"gilded",name:"Gilded Album",cost:45,kind:"ALBUM"},{id:"deepframe",name:"Deep-Mine Frame",cost:60,kind:"ALBUM"},{id:"menace",name:"Geological Menace",cost:75,kind:"TITLE"},{id:"void",name:"Void Pick",cost:100,kind:"PICKAXE"},{id:"fel",name:"Fel Dust",cost:35,kind:"IMPACT"},{id:"frost",name:"Frostbite Pick",cost:55,kind:"PICKAXE"},{id:"saroniteframe",name:"Saronite Whisper",cost:70,kind:"ALBUM"},{id:"prospector",name:"Master Prospector",cost:80,kind:"TITLE"},{id:"khoriumframe",name:"Khorium Prestige",cost:110,kind:"REVEAL"},{id:"titan",name:"Titanium Crown",cost:140,kind:"PICKAXE"},{id:"brdtitle",name:"Not Going Back",cost:95,kind:"TITLE"},{id:"arcaneimpact",name:"Arcane Fracture",cost:125,kind:"IMPACT"},{id:"volumeone",name:"Volume I Victor",cost:180,kind:"ALBUM"},{id:"orewhoretitle",name:"THE ORE WHORE",cost:999,kind:"TITLE"},{id:"orewhorepick",name:"The Final Pick",cost:999,kind:"PICKAXE"},{id:"orewhorealbum",name:"225 Stamp",cost:999,kind:"ALBUM"},{id:"centerpiece",name:"Mountain's Regret",cost:999,kind:"TROPHY"}];
const biomeWeights: Record<Biome, number[]> = {
 old:[28,20,12,18,10,0,0,0,0,0,0,0,0,0,0],
 deep:[0,0,0,0,0,22,18,15,18,0,0,0,0,0,0],
 outland:[0,0,0,0,0,0,0,0,0,34,34,18,0,0,0],
 northrend:[0,0,0,0,0,0,0,0,0,0,0,0,38,35,20]
};
const biomeNames:Record<Biome,string>={old:"OLD MINE",deep:"DEEP MINE",outland:"OUTLAND MINE",northrend:"NORTHREND MINE"};
const biomeVisuals:Record<Biome,{accent:string;secondary:string;canvas:string;cavity:string;debris:string;particle:string;card:string;texture:string;light:string;flavor:string}>={
 old:{accent:"#d88156",secondary:"#a77a50",canvas:"#18130f",cavity:"#120d09",debris:"#8d7b68",particle:"#b59a76",card:"#241a14",texture:"sediment",light:"#d49a63",flavor:"Still standing. Nobody knows why."},
 deep:{accent:"#9a5369",secondary:"#5d3544",canvas:"#0d080b",cavity:"#080507",debris:"#594650",particle:"#87505d",card:"#1b1016",texture:"compressed",light:"#8c455b",flavor:"This seemed like a better idea upstairs."},
 outland:{accent:"#83b85c",secondary:"#526c38",canvas:"#091008",cavity:"#050a04",debris:"#4d5b3f",particle:"#708f50",card:"#111b0e",texture:"corrupted",light:"#759c4c",flavor:"The geology has become medically concerning."},
 northrend:{accent:"#6dc6df",secondary:"#3d748d",canvas:"#071018",cavity:"#040b11",debris:"#687f8d",particle:"#98c8d5",card:"#0b1822",texture:"frozen",light:"#78cce2",flavor:"Frozen rock. Frozen fingers. Keep swinging."}
};
const oreAsset=(id:string)=>`/assets/ores/ore-${id}.webp`;
const discoveryOreName=(ore:Item)=>ore.id==="titanium"?"IDE TITTY":ore.name;
const mineralAsset=(id:string)=>`/assets/minerals/mineral-${id}.webp`;
const biomeOrder:Biome[]=["old","deep","outland","northrend"];
const biomePages:Record<Biome,string[]>={old:["copper","tin","silver","iron","gold"],deep:["mithril","truesilver","dark","thorium"],outland:["feliron","adamantite","khorium"],northrend:["cobalt","saronite","titanium"]};
const rarityQuota:Record<Item["rarity"],number>={Common:10,Uncommon:7,Rare:3,Epic:1,Legendary:1,Mythic:1};
const oreQuota=(id:string)=>rarityQuota[ores.find(o=>o.id===id)?.rarity||"Common"];
const biomeQuotaTotal=(biome:Biome)=>biomePages[biome].reduce((total,id)=>total+oreQuota(id),0);
const biomeQuotaProgress=(save:Save,biome:Biome)=>biomePages[biome].reduce((total,id)=>total+Math.min(save.ores[id]||0,oreQuota(id)),0);
const biomeQuotaComplete=(save:Save,biome:Biome)=>biomePages[biome].every(id=>(save.ores[id]||0)>=oreQuota(id));
const mineDepletionLevel=(save:Save,biome:Biome)=>{const pct=biomeQuotaProgress(save,biome)/biomeQuotaTotal(biome);return pct>=.9?4:pct>=.65?3:pct>=.4?2:pct>=.2?1:0};
const mineDepletionLabel=(level:number)=>["INTACT FACE","WORKINGS OPENED","HEAVY EXCAVATION","NEARLY STRIPPED","DEPLETED"][Math.max(0,Math.min(4,level))];
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
// no rarity, no biome, no album slot. Per-artifact selection weights are
// evaluated only after the equipped tool's per-excavation TRUE gate has hit;
// Changing the artifact pool, technology, cosmetic, or mine never changes the ordinary baseline.
type TrueArtifact = {id:string;name:string;announcement:string;lore:string;lockedClue:string;peonBark:string;peonBarkSequence?:{text:string;delayMs:number}[];image:string;selectionWeight:number|null;theme?:"gold"|"fel"|"biological"|"shadow"|"archive"|"glitch"|"frost"|"infernal";ultimate?:boolean;instruction?:string;systemResponse?:string;rewardSkinId?:string};
const trueArtifactPool: TrueArtifact[] = [
  {id:"ronaldo",name:"PANINI GOLDEN STICKER OF RONALDO NAZÁRIO",announcement:"THE PHENOMENON HAS BEEN DETECTED.",lore:"Some things are rarer than minerals. Some things are simply eternal.",lockedClue:"Some numbers are worn. One was worshipped.",peonBark:"Boss... this not man. This Ronaldo. Peon take hat off.",peonBarkSequence:[{text:"Boss... this not man.",delayMs:0},{text:"This Ronaldo.",delayMs:700},{text:"Peon take hat off.",delayMs:1700}],image:"/assets/true/ronaldo.webp",selectionWeight:1,theme:"gold"},
  {id:"warglaive",name:"WARGLAIVE OF ILLIDAN",announcement:"YOU ARE NOT PREPARED.",lore:"A crescent of fel-forged defiance. It remembers every hand unworthy of holding it.",lockedClue:"A small thing carrying a very large grudge.",peonBark:"Sharp rock.",image:"/assets/true/warglaive.webp",selectionWeight:1,theme:"fel"},
  {id:"blaizeballs",name:"BLAIZE'S BALLS",announcement:"BIOLOGICAL MATERIAL DETECTED. UNFORTUNATELY.",lore:"Two matching specimens. Classification was attempted and immediately abandoned.",lockedClue:"An image was preserved that should have died with the scanner.",peonBark:"...two rock?",image:"/assets/true/blaizeballs.webp",selectionWeight:1,theme:"biological"},
  {id:"shadow",name:"SHADOW THE PANTHER",announcement:"ANOMALOUS OBJECT DETECTED",lore:"He cannot see it. He knows exactly where it is.",lockedClue:"Something is watching from the dark.",peonBark:"Cat?",image:"/assets/true/shadow.webp",selectionWeight:1,theme:"shadow",systemResponse:"WUUUUUUUUUU"},
  {id:"whorearchives",name:"WHORE ARCHIVES",announcement:"RESTRICTED RECORDS HAVE SURFACED.",lore:"A sealed record of names, depths, and decisions the mountain denies preserving.",lockedClue:"There are records beneath the records.",peonBark:"Me can read?",image:"/assets/true/whorearchives.webp",selectionWeight:1,theme:"archive"},
  {id:"patike",name:"PATIKE",announcement:"DIRECTORY DETECTED. ACCESS SHOULD NOT EXIST.",lore:"The folder opened itself. The access log insists that you were never here.",lockedClue:"The folder exists. This is already too much information.",peonBark:"Me open folder.",image:"/assets/true/patike.webp",selectionWeight:1,theme:"glitch"},
  {id:"invincible",name:"INVINCIBLE'S REINS",announcement:"MOUNT EQUIPMENT DETECTED. MOUNT ABSENT.",lore:"The reins are immaculate. Their owner remains committed to being elsewhere.",lockedClue:"A loyal servant, both in life and death.",peonBark:"...where horse?",image:"/assets/true/invincible.webp",selectionWeight:1,theme:"frost"},
  {id:ALIJA_SHOVEL_ARTIFACT_ID,name:"ALIJA'S SHOVEL",announcement:"OVERSIZED EXCAVATION EQUIPMENT DETECTED.",lore:"A legendary shovel, preserved because ordinary geology was no longer sufficient.",lockedClue:"Something larger than the job description remains buried.",peonBark:"Boss, me need biggest shovel. This shovel best.",image:"/assets/true/alijas-shovel.webp",selectionWeight:1,theme:"gold",rewardSkinId:ALIJA_SHOVEL_SKIN_ID},
  {id:"asoc",name:"ASOC TICKET",announcement:"ANOMALOUS OBJECT DETECTED",lore:"The ultimate TRUE discovery. Entry to one game of ASOC.",lockedClue:"Someone is waiting for an invitation to be presented.",peonBark:"Me win?",image:"/assets/true/true-asoc-ticket.webp",selectionWeight:null,theme:"infernal",ultimate:true,instruction:"SHOW THIS TO SUMMON THE GAME MASTER",systemResponse:"NO. YOU HAVE BEEN INVITED."},
];
// Miss / Perfect / Critical pipeline constants — tunable after playtesting.
const MISS_CHANCE = CANONICAL_EXCAVATION_PROBABILITIES.miss;
const CRIT_CHANCE = CANONICAL_EXCAVATION_PROBABILITIES.critical;
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
const EMPTY_INSULTS_NORMAL:[string,string][]=[
  ["NOTHING","Exactly what you are."],["BARREN","Just like your thought process."],["EMPTY","Like your head."],["WORTHLESS","The excavation wasn't much better."],
  ["DUST","Your greatest contribution so far."],["VACANT","A familiar condition."],["USELESS","We meant the dig. Mostly."],["FAILURE","At least you're consistent."],
  ["NOTHING","You have a gift for finding it."],["BARREN","Your instincts remain undefeated."],["EMPTY","Another successful search for nothing."],["ZERO","Finally, a number you understand."],
  ["NOTHING","Even geology is avoiding you."],["BARREN","Excellent choice, Peon."],["EMPTY","Somehow you made the hole dumber."],["ARE YOU CLINICALLY BLIND","Well, are you?"]
];
const EMPTY_INSULTS_MILD:[string,string][]=[["NOTHING","Again. Interesting."],["EMPTY","Are you choosing these?"],["BARREN","Your pattern is emerging."]];
const EMPTY_INSULTS_HARSH:[string,string][]=[["BARREN","Stop helping."],["EMPTY","Competence remains theoretical."],["NOTHING","The SYSTEM has concerns."]];
const EMPTY_INSULTS_STRONG:[string,string][]=[["NOTHING","Please locate a smarter Peon."],["FAILURE","This now appears intentional."],["EMPTY","Stand aside and find an adult."]];
const pickTrue=(random:()=>number,owned:Record<string,number>)=>{const configured=trueArtifactPool.filter(a=>a.selectionWeight!==null&&a.selectionWeight>0&&!owned[a.id]);if(!configured.length)return null;const total=configured.reduce((sum,a)=>sum+a.selectionWeight!,0);let roll=random()*total;return configured.find(a=>(roll-=a.selectionWeight!)<=0)||configured[0]};
const asocTicket=trueArtifactPool.find(a=>a.id===ASOC_TICKET_ID)!;
const makeRng = (seed:number) => () => { seed |= 0; seed = seed + 0x6D2B79F5 | 0; let t=Math.imul(seed^seed>>>15,1|seed); t=t+Math.imul(t^t>>>7,61|t)^t; return ((t^t>>>14)>>>0)/4294967296; };
const pick = (items: Item[], random:()=>number, weights?:number[]) => { const ws=weights||items.map(i=>i.weight); let n=random()*ws.reduce((s,w)=>s+w,0); return items.find((_,i)=>(n-=ws[i])<=0)||items[0]; };
const odds = (ore:Item,mineral:Item,biome:Biome) => {const ow=biomeWeights[biome],oi=ores.indexOf(ore);if(!ow[oi])return Infinity;return Math.round((ow.reduce((a,b)=>a+b,0)*minerals.reduce((a,b)=>a+b.weight,0))/(ow[oi]*mineral.weight))};
const sumRecord=(record:Record<string,number>)=>Object.values(record).reduce((sum,value)=>sum+(Number(value)||0),0);
const completionRecord=(save:Save,completedAt=new Date().toISOString()):CompletionRecord=>{
  const mostOre=[...ores].sort((a,b)=>(save.ores[b.id]||0)-(save.ores[a.id]||0))[0];
  const mostTool=Object.entries(save.toolUse).sort((a,b)=>b[1]-a[1])[0]?.[0]||save.equippedTool;
  const unique=Object.keys(save.combos).length,totalCombos=sumRecord(save.combos);
  return {id:`shift-${save.completionCount+1}-${completedAt}`,completedAt,shift:save.newGamePlusLevel,digs:save.digs+1,strikes:save.strikes,playTimeMs:Math.max(0,Date.now()-save.runStartedAt),oresExcavated:sumRecord(save.ores),mineralsDiscovered:Object.keys(save.minerals).filter(id=>save.minerals[id]>0).length,uniqueSpecimens:unique,duplicateSpecimens:Math.max(0,totalCombos-unique),perfectStrikes:save.perfectStrikes,criticalStrikes:save.criticalStrikes,misses:save.misses,veinsDiscovered:save.veinsDiscovered,forbiddenTunnelsEntered:save.forbiddenTunnelsEntered,trueArtifactsDiscovered:Object.keys(save.trueArtifacts).filter(id=>id!==ASOC_TICKET_ID&&save.trueArtifacts[id]>0).length,dustEarned:save.dustEarned,dustSpent:save.dustSpent,mostMinedOre:mostOre?.name||"—",mostUsedPickaxe:forgedItems.find(tool=>tool.id===mostTool)?.name||mostTool,asocTickets:save.asocTickets+1,legacyAlbum:{combos:{...save.combos},ores:{...save.ores},minerals:{...save.minerals}}};
};
// `old` is whatever shape a prior save schema happened to be (parsed JSON from
// localStorage, potentially years old) — `any` is deliberate here, not an
// oversight. See HANDOFF_FOR_CLAUDE.md: "All save changes must go through
// migrate(old) and preserve old saves. Never reset or reinterpret existing
// collections." Narrowing this to `unknown` would require type guards on
// every legacy field access below, which risks altering migration behavior.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const migrate=(old:any):Save=>{
  const {trueArtifactChance:_obsoleteTrueArtifactChance,artifactChance:_obsoleteArtifactChance,...safeOld}=old||{};
  const map:Record<string,string>={quartz:"malachite",jade:"jade",citrine:"citrine",opal:"largeopal",star:"arcane"};
  const combos:Record<string,number>={},first:Record<string,number>={};
  for(const [k,v] of Object.entries(old.combos||{})){const p=k.lastIndexOf("-"),o=k.slice(0,p),m=k.slice(p+1);combos[`${o}-${map[m]||m}`]=Number(v)}
  for(const [k,v] of Object.entries(old.first||{})){const p=k.lastIndexOf("-"),o=k.slice(0,p),m=k.slice(p+1);first[`${o}-${map[m]||m}`]=Number(v)}
  const mineralCounts:Record<string,number>={};for(const [k,v] of Object.entries(old.minerals||{}))mineralCounts[map[k]||k]=(mineralCounts[map[k]||k]||0)+Number(v);
  const historicalOreCounts:Record<string,number>={};for(const [key,count] of Object.entries(combos)){const p=key.lastIndexOf("-"),id=key.slice(0,p);historicalOreCounts[id]=(historicalOreCounts[id]||0)+Number(count)}
  const oreCounts:Record<string,number>={};for(const ore of ores)oreCounts[ore.id]=Math.max(Number(old.ores?.[ore.id]||0),historicalOreCounts[ore.id]||0);
  // Schema 14 migration is idempotent: canonical stocks win; legacy stocks are read once; otherwise lifetime totals seed stock.
  const oreResources=old.oreResources&&typeof old.oreResources==="object"?old.oreResources:old.rawResources&&typeof old.rawResources==="object"?old.rawResources:{...oreCounts};
  const mineralResources=old.mineralResources&&typeof old.mineralResources==="object"?old.mineralResources:{...mineralCounts};
  const processedResources=old.processedResources&&typeof old.processedResources==="object"?old.processedResources:old.processedMaterials&&typeof old.processedMaterials==="object"?old.processedMaterials:{};
  const ownedTools=Array.isArray(old.ownedTools)&&old.ownedTools.length?old.ownedTools:["rusty-pickaxe"],equippedTool=ownedTools.includes(old.equippedTool)?old.equippedTool:"rusty-pickaxe";
  const legacyAsoc=Number(old.trueArtifacts?.[ASOC_TICKET_ID]||0)>0;
  const trueArtifacts:Record<string,number>={};for(const artifact of trueArtifactPool)if(artifact.id!==ASOC_TICKET_ID&&Number(old.trueArtifacts?.[artifact.id]||0)>0)trueArtifacts[artifact.id]=1;
  const unlocks=artifactRewardUnlocks(Array.isArray(old.unlocks)?old.unlocks:[],trueArtifacts);
  const toolTier=Math.max(0,...ownedTools.map((id:string)=>forgedItems.find(t=>t.id===id)?.tier||0)),toolSkinId=toolSkin(old.toolSkinId,unlocks).id;
  const encounter=old.activeTrueEncounter,validEncounter=encounter&&!trueArtifacts[encounter.artifactId]&&trueArtifactPool.some(a=>a.id===encounter.artifactId)&&["empty","ore"].includes(encounter.trigger)&&Number(encounter.maxHp)>0?{artifactId:String(encounter.artifactId),trigger:encounter.trigger as "empty"|"ore",hp:Math.max(1,Math.min(Number(encounter.hp)||1,Number(encounter.maxHp))),maxHp:Number(encounter.maxHp),startedAtDig:Number(encounter.startedAtDig)||Number(old.digs||0)+1}:null;
  const forbiddenTunnel=sanitizeForbiddenTunnel(old.forbiddenTunnel),pendingArtifactModifier=sanitizeArtifactModifier(old.pendingArtifactModifier);
  const activeBerserk=sanitizeActiveBerserk(old.activeBerserk);
  let provisional={...blank,...safeOld,combos,ores:oreCounts,oreResources,mineralResources,processedResources,ownedTools,equippedTool,toolTier,toolSkinId,unlocks,first,minerals:mineralCounts,trueArtifacts,activeTrueEncounter:validEncounter,forbiddenTunnel,pendingArtifactModifier,activeBerserk,settings:{...defaultSettings,...old.settings},schema:17,runStartedAt:Number(old.runStartedAt)||Date.now(),completionHistory:Array.isArray(old.completionHistory)?old.completionHistory:[]} as Save;
  if(legacyAsoc&&!provisional.gameCompleted){const completedAt=String(old.latestCompletionDate||new Date().toISOString()),record=completionRecord(provisional,completedAt);provisional={...provisional,gameCompleted:true,endingSeen:true,completionCount:Math.max(1,Number(old.completionCount)||1),asocTickets:Math.max(1,Number(old.asocTickets)||1),firstCompletionDate:String(old.firstCompletionDate||completedAt),latestCompletionDate:completedAt,completionHistory:provisional.completionHistory.length?provisional.completionHistory:[record],activeTrueEncounter:null};}
  const completedBiomes=biomeOrder.filter(b=>biomeQuotaComplete(provisional,b)),unlockedBiomes:Biome[]=["old"];for(let i=0;i<biomeOrder.length-1;i++){if(!completedBiomes.includes(biomeOrder[i]))break;unlockedBiomes.push(biomeOrder[i+1])}
  const requested:Biome=biomeOrder.includes(old.biome)?old.biome:"old",biome=unlockedBiomes.includes(requested)?requested:unlockedBiomes[unlockedBiomes.length-1];return {...provisional,biome,unlockedBiomes,completedBiomes};
}

function CommentaryHeadline({text,accentFirst}:{text:string;accentFirst:boolean}){
  const words=text.split(" "),accentIndex=accentFirst?0:words.length-1;
  return <>{words.map((word,index)=><span key={`${word}-${index}`}>{index>0?" ":null}{index===accentIndex?<i>{word}</i>:word}</span>)}</>;
}

export default function Home() {
  const [save, setSave] = useState<Save>(blank);
  const [loaded, setLoaded] = useState(false);
  const [tab, setTab] = useState<"mine" | "forge" | "album" | "wanted" | "records" | "more" | "true">("mine");
  const [stage, setStage] = useState<"tunnel" | "ore" | "artifact">("tunnel");
  const [maxHp, setMaxHp] = useState(12);
  const [rockHp, setRockHp] = useState(12);
  const [pendingOre, setPendingOre] = useState<Item | null>(null);
  const [mineCommentary,setMineCommentary]=useState<MineCommentary>(NORMAL_DIGGING_COMMENTARY[0]);
  const commentaryHistory=useRef<string[]>([]);
  const [impact, setImpact] = useState<number | null>(null);
  const [miningEngaged,setMiningEngaged]=useState(false);
  const [quotaExpanded,setQuotaExpanded]=useState(false);
  const [hitPoint, setHitPoint] = useState({x:50,y:48});
  const [fractures,setFractures]=useState<{id:number;x:number;y:number;power:number}[]>([]);
  const [collapseBurst,setCollapseBurst]=useState<{id:number;x:number;y:number}|null>(null);
  const [found, setFound] = useState<{ ore: Item; mineral: Item; isNew: boolean; count: number } | null>(null);
  const [emptyNotice,setEmptyNotice]=useState<{id:number;result:string;insult:string}|null>(null);
  const [trueFind,setTrueFind]=useState<{artifact:TrueArtifact;digNumber:number}|null>(null);
  const [pendingTrue,setPendingTrue]=useState<{artifact:TrueArtifact;trigger:"empty"|"ore"}|null>(null);
  const [duplicateNotice,setDuplicateNotice]=useState<{id:number;ore:Item;mineral:Item;count:number;dust:number}|null>(null);
  const [toast, setToast] = useState<{ name: string; text: string } | null>(null);
  const [milestone, setMilestone] = useState<{ore:Item;level:number;missing?:Item;attempts:number} | null>(null);
  const [mineCompletion,setMineCompletion]=useState<{completed:Biome;next?:Biome}|null>(null);
  const [onboarding,setOnboarding]=useState(false);
  const [mineTransition,setMineTransition]=useState<Biome|null>(null);
  const [missFlash,setMissFlash]=useState<string|null>(null);
  const [deepWayFailure,setDeepWayFailure]=useState(false);
  const [endingActive,setEndingActive]=useState(false);
  const [completedBrowsing,setCompletedBrowsing]=useState(false);
  const [confirmNewGamePlus,setConfirmNewGamePlus]=useState(false);
  const [berserkNow,setBerserkNow]=useState(()=>Date.now());
  const [perfectReady,setPerfectReady]=useState(false);
  const [lastHitKind,setLastHitKind]=useState<"normal"|"perfect"|"crit"|"perfectCrit"|"miss"|null>(null);
  const previousBiome=useRef<Biome>("old");
  const seed = typeof window !== "undefined" ? Number(new URLSearchParams(location.search).get("seed")) : 0;
  const rng = useState<{current:()=>number}>(() => ({current: makeRng(seed || Date.now())}))[0];
  const rollMineCommentary=(pool:MineCommentary[])=>setMineCommentary(selectMineCommentary(pool,commentaryHistory.current,rng.current));
  // Perfect Strike phase reference — a fixed continuous metronome so the
  // timing window is learnable, not randomized per-strike. Lazy useState
  // initializer (not useRef(Date.now())) for the same render-purity reason
  // as `rng` above.
  const perfectPhase = useState<{current:number}>(() => ({current: Date.now()}))[0];
  const perfectIntervalRef = useRef<ReturnType<typeof setInterval> | undefined>(undefined);
  const hitFeedbackTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const collapseTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const fractureId = useRef(0);
  const duplicateNoticeId = useRef(0);
  const emptyNoticeId = useRef(0);
  const emptyDigStreak = useRef(0);
  const spaceHeld = useRef(false);
  const autoMineTimer = useRef<ReturnType<typeof setInterval> | undefined>(undefined);
  const strikeRef = useRef<(point?:{x:number;y:number})=>void>(()=>{});
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
  const tunnelInputLocked=useRef(false);
  const soundtrackRef=useRef<HTMLAudioElement|null>(null);
  const trueArtifactCueRef=useRef<HTMLAudioElement|null>(null);
  const tunnelCueRef=useRef<HTMLAudioElement|null>(null);
  const musicOverrideRef=useRef<{active:boolean;returning:boolean;token:number;kind:"artifact"|"tunnel"|null}>({active:false,returning:false,token:0,kind:null});
  const musicFadeFrameRef=useRef<number|undefined>(undefined);
  const berserkAudioFrameRef=useRef<number|undefined>(undefined);
  const pickaxeHitPoolRef=useRef<HTMLAudioElement[]>([]);
  const lastPickaxeHitRef=useRef(-1);
  const audioSettingsRef=useRef(save.settings);
  audioSettingsRef.current=save.settings;
  const currentBerserk=activeBerserkMode(save.activeBerserk,berserkNow);

  // eslint-disable-next-line react-hooks/set-state-in-effect, react-hooks/exhaustive-deps -- mount-time localStorage hydration (migrate save, set onboarding/loaded, fire session_start/return_visit); seed intentionally excluded from deps so this never re-fires post-mount. Moving this to a lazy state initializer would change save-bootstrap and analytics-event timing/ordering; save behavior is protected (see HANDOFF_FOR_CLAUDE.md).
  useEffect(() => { try { const last=Number(localStorage.getItem("ore-whore-last-session")||0);if(last)track("return_visit",{hours_since_previous_session:(Date.now()-last)/3600000}); const raw = localStorage.getItem("ore-whore-save-v1"); if (raw){const old=JSON.parse(raw),restored=migrate(old);setSave(restored);if(restored.activeTrueEncounter){const encounter=restored.activeTrueEncounter,artifact=trueArtifactPool.find(a=>a.id===encounter.artifactId);if(artifact){setMineCommentary(TRUE_ARTIFACT_COMMENTARY);setPendingTrue({artifact,trigger:encounter.trigger});setStage("artifact");setMaxHp(encounter.maxHp);setRockHp(encounter.hp);}}else rollMineCommentary(NORMAL_DIGGING_COMMENTARY);setOnboarding(!old.settings?.helpSeen&&!(old.digs>0));}else{rollMineCommentary(NORMAL_DIGGING_COMMENTARY);setOnboarding(true);} } catch {rollMineCommentary(NORMAL_DIGGING_COMMENTARY);setOnboarding(true)} setLoaded(true); track("session_start",{seed:seed||null,build:"v0.4",analytics_schema:2}); const end=()=>{localStorage.setItem("ore-whore-last-session",String(Date.now()));track("session_end",{session_digs:sessionDigs.current})}; addEventListener("pagehide",end); return()=>removeEventListener("pagehide",end); }, []);
  useEffect(() => { if (loaded) localStorage.setItem("ore-whore-save-v1", JSON.stringify(save)); }, [save, loaded]);
  const runCueCrossfade=(cue:HTMLAudioElement|null,normalWeight:number,cueWeight:number,durationMs:number,onComplete?:()=>void)=>{
    const normal=soundtrackRef.current;if(!normal||!cue)return;
    if(musicFadeFrameRef.current!==undefined)cancelAnimationFrame(musicFadeFrameRef.current);
    const token=++musicOverrideRef.current.token,start=performance.now(),normalStart=normal.volume,cueStart=cue.volume;
    const frame=(now:number)=>{if(token!==musicOverrideRef.current.token)return;const p=Math.min(1,(now-start)/durationMs),smooth=p*p*(3-2*p),settings=audioSettingsRef.current,level=settings.musicEnabled?Math.min(1,settings.master*settings.musicVolume):0;normal.volume=Math.min(1,normalStart+(level*normalWeight-normalStart)*smooth);cue.volume=Math.min(1,cueStart+(level*cueWeight-cueStart)*smooth);if(p<1)musicFadeFrameRef.current=requestAnimationFrame(frame);else{musicFadeFrameRef.current=undefined;onComplete?.()}};
    musicFadeFrameRef.current=requestAnimationFrame(frame);
  };
  const runMusicCrossfade=(normalWeight:number,cueWeight:number,durationMs:number,onComplete?:()=>void)=>runCueCrossfade(trueArtifactCueRef.current,normalWeight,cueWeight,durationMs,onComplete);
  const runTunnelCrossfade=(normalWeight:number,cueWeight:number,durationMs:number,onComplete?:()=>void)=>runCueCrossfade(tunnelCueRef.current,normalWeight,cueWeight,durationMs,onComplete);
  useEffect(()=>{const normal=soundtrackRef.current,artifact=trueArtifactCueRef.current,tunnel=tunnelCueRef.current;if(!normal||!artifact||!tunnel)return;const level=Math.min(1,Math.max(0,save.settings.master*save.settings.musicVolume)),override=musicOverrideRef.current,activeCue=override.kind==="tunnel"?tunnel:artifact;if(!loaded||!save.settings.musicEnabled){normal.pause();artifact.pause();tunnel.pause();normal.volume=0;artifact.volume=0;tunnel.volume=0;return}if(override.active){activeCue.volume=Math.min(activeCue.volume||level,level);if(!override.returning&&activeCue.paused&&!activeCue.ended)activeCue.play().catch(()=>{});return}normal.volume=level;artifact.volume=0;tunnel.volume=0;normal.play().catch(()=>{/* Browser will resume it on the next user gesture. */})},[loaded,save.settings.master,save.settings.musicVolume,save.settings.musicEnabled]);
  useEffect(()=>{const resume=()=>{if(!save.settings.musicEnabled)return;const override=musicOverrideRef.current,audio=override.active?(override.kind==="tunnel"?tunnelCueRef.current:trueArtifactCueRef.current):soundtrackRef.current;if(audio?.paused)audio.play().catch(()=>{})};window.addEventListener("pointerdown",resume,{passive:true});window.addEventListener("keydown",resume);return()=>{window.removeEventListener("pointerdown",resume);window.removeEventListener("keydown",resume)}},[save.settings.musicEnabled]);
  useEffect(()=>{
    if(!trueFind)return;
    const normal=soundtrackRef.current,cue=trueArtifactCueRef.current;if(!normal||!cue)return;
    musicOverrideRef.current.active=true;musicOverrideRef.current.returning=false;musicOverrideRef.current.kind="artifact";cue.loop=false;cue.currentTime=0;cue.volume=0;
    if(save.settings.musicEnabled){void normal.play().catch(()=>{});void cue.play().catch(()=>{});runMusicCrossfade(0,1,800,()=>normal.pause())}
    const restoreNormal=()=>{if(!musicOverrideRef.current.active||musicOverrideRef.current.kind!=="artifact"||musicOverrideRef.current.returning)return;musicOverrideRef.current.returning=true;if(save.settings.musicEnabled)void normal.play().catch(()=>{});runMusicCrossfade(1,0,2000,()=>{cue.pause();musicOverrideRef.current.active=false;musicOverrideRef.current.returning=false;musicOverrideRef.current.kind=null})};
    const approachEnding=()=>{if(Number.isFinite(cue.duration)&&cue.duration-cue.currentTime<=2.2)restoreNormal()};
    cue.addEventListener("timeupdate",approachEnding);cue.addEventListener("ended",restoreNormal);
    return()=>{cue.removeEventListener("timeupdate",approachEnding);cue.removeEventListener("ended",restoreNormal);restoreNormal()};
  // Deliberately keyed only to artifact identity: ordinary rerenders must never restart the one-shot cue.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  },[trueFind?.artifact.id]);
  useEffect(()=>{
    if(!save.forbiddenTunnel)return;
    const normal=soundtrackRef.current,cue=tunnelCueRef.current;if(!normal||!cue||musicOverrideRef.current.active)return;
    musicOverrideRef.current.active=true;musicOverrideRef.current.returning=false;musicOverrideRef.current.kind="tunnel";cue.loop=true;cue.currentTime=0;cue.volume=0;
    if(save.settings.musicEnabled){void normal.play().catch(()=>{});void cue.play().catch(()=>{});runTunnelCrossfade(0,1,900,()=>normal.pause())}
    return()=>{if(!musicOverrideRef.current.active||musicOverrideRef.current.kind!=="tunnel"||musicOverrideRef.current.returning)return;musicOverrideRef.current.returning=true;if(save.settings.musicEnabled)void normal.play().catch(()=>{});runTunnelCrossfade(1,0,1800,()=>{cue.pause();cue.currentTime=0;musicOverrideRef.current.active=false;musicOverrideRef.current.returning=false;musicOverrideRef.current.kind=null})};
  // Tunnel state mutates while choices resolve; identity-only dependency prevents cue restarts.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  },[save.forbiddenTunnel?.id]);
  useEffect(()=>{const pool=PICKAXE_HIT_SOUNDS.map(src=>{const audio=new Audio(src);audio.preload="auto";audio.load();return audio});pickaxeHitPoolRef.current=pool;return()=>{pool.forEach(audio=>{audio.pause();audio.removeAttribute("src");audio.load()});pickaxeHitPoolRef.current=[]}},[]);
  useEffect(()=>{if(!save.gameCompleted||save.endingSeen)return;const audio=soundtrackRef.current;if(!audio)return;const start=audio.volume,started=performance.now();let frame=0;const fade=(now:number)=>{const p=Math.min(1,(now-started)/1100);audio.volume=start*(1-p);if(p<1)frame=requestAnimationFrame(fade);else audio.pause()};frame=requestAnimationFrame(fade);return()=>cancelAnimationFrame(frame)},[save.gameCompleted,save.endingSeen]);
  // eslint-disable-next-line react-hooks/set-state-in-effect -- derives reward unlocks from save.combos count; moving this into the dig-mutation call site would touch protected progression logic (see HANDOFF_FOR_CLAUDE.md).
  useEffect(()=>{if(!loaded)return;const n=Object.keys(save.combos).length;const rewards:[number,string[]][]=[[23,["rust"]],[57,["gilded"]],[113,["menace"]],[169,["khoriumframe"]],[203,["titan"]],[225,["volumeone","orewhoretitle","orewhorepick","orewhorealbum","centerpiece"]]];const earned=rewards.filter(x=>n>=x[0]).flatMap(x=>x[1]).filter(id=>!save.unlocks.includes(id));if(earned.length)setSave(s=>({...s,unlocks:[...s.unlocks,...earned]}))},[loaded,save.combos,save.unlocks]);
  // eslint-disable-next-line react-hooks/set-state-in-effect, react-hooks/exhaustive-deps -- derives mine-completion/unlock strictly from persisted ore extraction counts; deps intentionally exclude album combinations and unrelated save fields.
  useEffect(()=>{if(!loaded||mineCompletion)return;const completed=biomeOrder.find(b=>save.unlockedBiomes.includes(b)&&biomeQuotaComplete(save,b)&&!save.completedBiomes.includes(b));if(!completed)return;const i=biomeOrder.indexOf(completed),next=i<biomeOrder.length-1?biomeOrder[i+1]:undefined;setSave(s=>({...s,completedBiomes:[...s.completedBiomes,completed],unlockedBiomes:next&&!s.unlockedBiomes.includes(next)?[...s.unlockedBiomes,next]:s.unlockedBiomes}));setMineCompletion({completed,next});track("biome_completed",{biome:completed,digs:save.digs,ore_extractions:biomeQuotaProgress(save,completed),quota:biomeQuotaTotal(completed)});emitGameplayEvent("MINE_COMPLETED",{biome:completed});if(next)track("biome_unlocked",{biome:next});},[loaded,save.ores,save.unlockedBiomes,save.completedBiomes,mineCompletion]);
  useEffect(()=>{if(!loaded){previousBiome.current=save.biome;return}if(previousBiome.current===save.biome)return;previousBiome.current=save.biome;setMineTransition(save.biome);const timer=setTimeout(()=>setMineTransition(null),720);return()=>clearTimeout(timer)},[loaded,save.biome]);
  useEffect(()=>{if(!duplicateNotice)return;const timer=setTimeout(()=>setDuplicateNotice(null),2800);return()=>clearTimeout(timer)},[duplicateNotice]);
  useEffect(()=>{if(!emptyNotice)return;const timer=setTimeout(()=>setEmptyNotice(null),1400);return()=>clearTimeout(timer)},[emptyNotice]);
  useEffect(()=>{if(!save.activeBerserk)return;const tick=()=>setBerserkNow(Date.now()),interval=setInterval(tick,250),remaining=berserkRemainingMs(save.activeBerserk),mode=berserkMode(save.activeBerserk.mode);const expiry=setTimeout(()=>{setSave(s=>s.activeBerserk&&s.activeBerserk.expiresAt<=Date.now()?{...s,activeBerserk:null}:s);if(mode)setToast({name:"SPECIMEN DUST EFFECTS SUBSIDING.",text:`PEON: “${mode.endLine}”`});track("berserk_ended",{mode:mode?.id||save.activeBerserk?.mode})},remaining+25);return()=>{clearInterval(interval);clearTimeout(expiry)}},[save.activeBerserk?.expiresAt]);
  useEffect(()=>{const target=currentBerserk?.audioIntensity||1,tracks=[soundtrackRef.current,tunnelCueRef.current].filter(Boolean) as HTMLAudioElement[];if(!tracks.length)return;if(berserkAudioFrameRef.current!==undefined)cancelAnimationFrame(berserkAudioFrameRef.current);const start=performance.now(),starts=tracks.map(track=>track.playbackRate),duration=700;const frame=(now:number)=>{const p=Math.min(1,(now-start)/duration),smooth=p*p*(3-2*p);tracks.forEach((track,index)=>{track.preservesPitch=false;track.playbackRate=starts[index]+(target-starts[index])*smooth});if(p<1)berserkAudioFrameRef.current=requestAnimationFrame(frame);else berserkAudioFrameRef.current=undefined};berserkAudioFrameRef.current=requestAnimationFrame(frame);return()=>{if(berserkAudioFrameRef.current!==undefined)cancelAnimationFrame(berserkAudioFrameRef.current)}},[currentBerserk?.id]);

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

  const continueMine = () => { const hp=10+Math.floor(rng.current()*6); rollMineCommentary(NORMAL_DIGGING_COMMENTARY); setFound(null); setPendingOre(null); setPendingTrue(null); setFractures([]); setStage("tunnel"); setMaxHp(hp); setRockHp(hp); track("mine_started",{attempt:save.digs+1,biome:save.biome}); };
  const snortDust=(id:BerserkModeId)=>{if(currentBerserk)return setToast({name:"PEON ALREADY CHEMICALLY MOTIVATED",text:"Wait for the current workplace incident to subside."});const result=activateBerserk(save.dust,id);if(!result)return setToast({name:"INSUFFICIENT SPECIMEN DUST",text:"Produce more duplicates. Grind them finer."});const mode=berserkMode(id)!;setSave(s=>{const live=activateBerserk(s.dust,id);return live?{...s,dust:live.dust,dustSpent:s.dustSpent+live.dustSpent,activeBerserk:live.active}:s});setBerserkNow(Date.now());setToast({name:`${mode.name} ENGAGED`,text:`PEON: “${mode.activationLine}”`});track("berserk_activated",{mode:id,cost:mode.cost,duration_ms:mode.durationMs,dust_before:save.dust})};

  const selectForbiddenFirst=(direction:FirstDirection)=>{if(tunnelInputLocked.current)return;tunnelInputLocked.current=true;const current=save.forbiddenTunnel;if(!current||current.chamber!=="first"){tunnelInputLocked.current=false;return}const result=selectFirstPath(current,direction,rng.current);setSave(s=>s.forbiddenTunnel?.id===current.id&&s.forbiddenTunnel.chamber==="first"?{...s,forbiddenTunnel:result.tunnel,pendingArtifactModifier:result.modifier||s.pendingArtifactModifier}:s);const outcome=current.firstAssignments[direction];track("forbidden_tunnel_first_path_selected",{biome:save.biome,direction,assigned_outcome:outcome,session_dig:sessionDigs.current,seeded_test:!!seed});track("forbidden_tunnel_first_outcome",{outcome});if(outcome==="x5")track("forbidden_tunnel_second_chamber_reached",{biome:save.biome});else if(result.modifier)track("artifact_modifier_activated",{modifier:result.modifier.chance,source:result.modifier.source});setTimeout(()=>{tunnelInputLocked.current=false},0)};
  const selectForbiddenSecond=(direction:SecondDirection)=>{if(tunnelInputLocked.current)return;tunnelInputLocked.current=true;const current=save.forbiddenTunnel;if(!current||current.chamber!=="second"){tunnelInputLocked.current=false;return}const result=selectSecondPath(current,direction);setSave(s=>s.forbiddenTunnel?.id===current.id&&s.forbiddenTunnel.chamber==="second"?{...s,forbiddenTunnel:result.tunnel,pendingArtifactModifier:result.modifier}:s);const outcome=current.secondAssignments?.[direction];track("forbidden_tunnel_second_path_selected",{biome:save.biome,direction,assigned_outcome:outcome,session_dig:sessionDigs.current,seeded_test:!!seed});track(outcome==="deep"?"forbidden_tunnel_deep_way":"forbidden_tunnel_sealed_passage",{modifier:result.modifier?.chance});if(result.modifier)track("artifact_modifier_activated",{modifier:result.modifier.chance,source:result.modifier.source});setTimeout(()=>{tunnelInputLocked.current=false},0)};

  const beginTrueEncounter=(artifact:TrueArtifact,trigger:"empty"|"ore")=>{const artifactHp=Math.max(60,Math.ceil(maxHp*20)),activeTrueEncounter:ActiveTrueEncounter={artifactId:artifact.id,trigger,hp:artifactHp,maxHp:artifactHp,startedAtDig:save.digs+1};emptyDigStreak.current=0;setMineCommentary(TRUE_ARTIFACT_COMMENTARY);setPendingOre(null);setPendingTrue({artifact,trigger});setFractures([]);setStage("artifact");setMaxHp(artifactHp);setRockHp(artifactHp);setSave(s=>({...s,activeTrueEncounter}));playImpact("clank");track("true_artifact_encounter_started",{artifact_id:artifact.id,attempt:save.digs+1,biome:save.biome,trigger,health_multiplier:20,artifact_hp:artifactHp,tool_id:save.equippedTool});emitGameplayEvent("TRUE_ARTIFACT_ENCOUNTER_STARTED",{artifact_id:artifact.id,trigger,health_multiplier:20,artifact_hp:artifactHp});};
  const completeTrueEncounter=()=>{if(!pendingTrue)return;const {artifact,trigger}=pendingTrue,modifier=save.pendingArtifactModifier,trueChance=artifactChanceForDig(modifier,equippedMiningTool(save).trueArtifactChance),firstDiscovery=!save.trueArtifacts[artifact.id];playImpact("crack");
    if(artifact.id===ASOC_TICKET_ID){setSave(s=>{const completedAt=new Date().toISOString(),record=completionRecord(s,completedAt);return {...s,digs:s.digs+1,gameCompleted:true,endingSeen:false,completionCount:s.completionCount+1,asocTickets:s.asocTickets+1,newGamePlusLevel:s.newGamePlusLevel,firstCompletionDate:s.firstCompletionDate||completedAt,latestCompletionDate:completedAt,completionHistory:[...s.completionHistory,record],activeTrueEncounter:null,pendingArtifactModifier:null,lastDigAt:Date.now()}});setPendingTrue(null);setFound(null);setTrueFind(null);setEmptyNotice(null);setDuplicateNotice(null);setToast(null);setMilestone(null);setMineCompletion(null);setEndingActive(true);track("true_artifact_found",{artifact_id:ASOC_TICKET_ID,attempt:save.digs+1,biome:save.biome,tool_id:save.equippedTool,true_artifact_chance:ASOC_TICKET_CHANCE,endgame:true});emitGameplayEvent("TRUE_ARTIFACT_FOUND",{artifact_id:artifact.id,trigger,tool_id:save.equippedTool,health_multiplier:20});return;}
    setSave(s=>{const digNumber=s.digs+1,isFirst=!s.trueArtifacts[artifact.id],veinDigsRemaining=Math.max(0,s.veinDigsRemaining-1),veinExpired=s.veinDigsRemaining>0&&veinDigsRemaining===0;if(veinExpired)emitGameplayEvent("VEIN_EXPIRED",{ore:s.veinOre});if(isFirst)setTrueFind({artifact,digNumber});const unlocks=isFirst&&artifact.rewardSkinId?[...new Set([...s.unlocks,artifact.rewardSkinId])]:s.unlocks;return {...s,digs:digNumber,unlocks,trueArtifacts:{...s.trueArtifacts,[artifact.id]:1},trueFirst:isFirst?{...s.trueFirst,[artifact.id]:digNumber}:s.trueFirst,activeTrueEncounter:null,pendingArtifactModifier:null,lastDigAt:Date.now(),veinDigsRemaining,veinOre:veinExpired?null:s.veinOre}});if(firstDiscovery&&artifact.rewardSkinId)setToast({name:"PICKAXE SKIN UNLOCKED — ALIJA'S SHOVEL",text:"Permanent cosmetic added to the Pickaxe Rack. Technology stats remain unchanged."});sessionDigs.current++;setSessionDigsCount(c=>c+1);setPendingTrue(null);if(modifier){track("artifact_modifier_consumed",{modifier:modifier.chance,source:modifier.source,success:true});track("artifact_won_from_modified_dig",{artifact_id:artifact.id,modifier:modifier.chance,source:modifier.source})}track("true_artifact_found",{artifact_id:artifact.id,attempt:save.digs+1,biome:save.biome,trigger,tool_id:save.equippedTool,true_artifact_chance:trueChance,health_multiplier:20});emitGameplayEvent("TRUE_ARTIFACT_FOUND",{artifact_id:artifact.id,trigger,tool_id:save.equippedTool,health_multiplier:20});};

  function playImpact(kind:"rock"|"clank"|"crack"|"miss"|"perfect"|"crit"){
    if(!save.settings.pickaxeSfxEnabled||save.settings.master<=0||save.settings.sfx<=0)return;
    try{
      if(kind!=="miss"){
        const count=PICKAXE_HIT_SOUNDS.length;
        let index=Math.floor(Math.random()*(lastPickaxeHitRef.current<0?count:count-1));
        if(lastPickaxeHitRef.current>=0&&index>=lastPickaxeHitRef.current)index++;
        lastPickaxeHitRef.current=index;
        const template=pickaxeHitPoolRef.current[index]||new Audio(PICKAXE_HIT_SOUNDS[index]);
        const hit=template.cloneNode(true) as HTMLAudioElement;
        hit.volume=Math.min(1,save.settings.master*save.settings.sfx*(currentBerserk?1.18:1));
        void hit.play().catch(()=>{/* Browser audio policy can reject playback before a user gesture. */});
        return;
      }
      const C=window.AudioContext,c=new C(),o=c.createOscillator(),g=c.createGain();
      o.connect(g);g.connect(c.destination);o.type="sine";o.frequency.setValueAtTime(60,c.currentTime);o.frequency.exponentialRampToValueAtTime(40,c.currentTime+.09);g.gain.setValueAtTime(.06*save.settings.master*save.settings.sfx,c.currentTime);g.gain.exponentialRampToValueAtTime(.001,c.currentTime+.12);o.start();o.stop(c.currentTime+.13);
    }catch{/* Audio unavailable or blocked; gameplay must continue. */}
  }

  const strike = (point?:{x:number;y:number}) => {
    if (found||trueFind||save.gameCompleted) return;
    const strikePoint=point||{x:50,y:48};
    setHitPoint(strikePoint);

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
      // A miss is still a visible swing: it glances off the selected point
      // instead of silently updating the counters.
      // eslint-disable-next-line react-hooks/purity -- strike() only runs from input handlers.
      setImpact(Date.now());
      setTimeout(() => setImpact(null), 430);
      if(hitFeedbackTimer.current)clearTimeout(hitFeedbackTimer.current);
      hitFeedbackTimer.current=setTimeout(() => { setMissFlash(null); setLastHitKind(null); }, 1700);
      playImpact("miss");
      emitGameplayEvent("MISS", { stage, consecutive: consecutiveMisses.current });
      if (consecutiveMisses.current === 2) emitGameplayEvent("DOUBLE_MISS", { stage });
      return;
    }
    consecutiveMisses.current = 0;

    // CRITICAL CHECK — rolled on every successfully-landing strike (Perfect
    // or normal), independent of Perfect. Seeded/mechanical RNG.
    const criticalChance=Math.min(.85,CRIT_CHANCE+(currentBerserk?.criticalBonus||0));
    const isCrit = rng.current() < criticalChance;
    const tool=equippedMiningTool(save);
    const damage = (isPerfect && isCrit ? 3 : (isPerfect || isCrit) ? 2 : 1)*tool.damage*(currentBerserk?.damageMultiplier||1);
    const hitKind = isPerfect && isCrit ? "perfectCrit" : isPerfect ? "perfect" : isCrit ? "crit" : "normal";
    const impactKind: "perfect" | "crit" | null = isPerfect ? "perfect" : isCrit ? "crit" : null;
    if (hitKind !== "normal") {
      if (hitKind === "perfectCrit") emitGameplayEvent("PERFECT_CRIT", { stage });
      else if (hitKind === "perfect") emitGameplayEvent("PERFECT_STRIKE", { stage });
      else emitGameplayEvent("CRITICAL_STRIKE", { stage });
      setLastHitKind(hitKind);
      if(hitFeedbackTimer.current)clearTimeout(hitFeedbackTimer.current);
      hitFeedbackTimer.current=setTimeout(() => setLastHitKind(null), 1500);
    } else {
      setLastHitKind("normal");
      if(hitFeedbackTimer.current)clearTimeout(hitFeedbackTimer.current);
      hitFeedbackTimer.current=setTimeout(() => setLastHitKind(null), 900);
    }

    const hit = rockHp - damage;
    setFractures(current=>[...current.slice(-11),{id:++fractureId.current,x:strikePoint.x,y:strikePoint.y,power:damage}]);
    if(hit<=0){setCollapseBurst({id:fractureId.current,x:strikePoint.x,y:strikePoint.y});if(collapseTimer.current)clearTimeout(collapseTimer.current);collapseTimer.current=setTimeout(()=>setCollapseBurst(null),460)}
    // eslint-disable-next-line react-hooks/purity -- strike() only runs from click/keydown handlers, never during render.
    setImpact(Date.now());
    setTimeout(() => setImpact(null), 430);
    if (save.settings.vibration&&navigator.vibrate) navigator.vibrate(currentBerserk?.id==="feral"?[28,18,48]:currentBerserk?[18,10,32]:hitKind!=="normal" ? 45 : stage === "ore" ? 35 : 12);
    setSave(s => ({ ...s, strikes: s.strikes + 1, perfectStrikes:s.perfectStrikes+(isPerfect?1:0),criticalStrikes:s.criticalStrikes+(isCrit?1:0),toolUse:{...s.toolUse,[s.equippedTool]:(s.toolUse[s.equippedTool]||0)+1}, distance: +(s.distance + (stage === "tunnel" ? 0.4 : 0)).toFixed(1) }));
    if (hit > 0) { playImpact(impactKind ?? (stage==="ore"?"crack":"rock"));setRockHp(hit);if(stage==="artifact")setSave(s=>({...s,activeTrueEncounter:s.activeTrueEncounter?{...s.activeTrueEncounter,hp:hit}:null}));return; }
    if(stage==="artifact"){completeTrueEncounter();return;}
    if (stage === "tunnel") {
      // TRUE roll happens once per completed dig, independent of and before
      // the ordinary empty/ore result — including on digs that would
      // otherwise be empty. It overrides that dig's normal outcome entirely.
      const modifier=save.pendingArtifactModifier,asocChance=asocTicketChanceForDig(save.equippedTool,save.gameCompleted),asocWon=asocChance>0&&rng.current()<asocChance,trueChance=artifactChanceForDig(modifier,equippedMiningTool(save).trueArtifactChance),artifactWon=!asocWon&&rng.current()<trueChance;
      if(modifier&&!modifier.consumed)setSave(s=>({...s,pendingArtifactModifier:markModifierRolled(s.pendingArtifactModifier)}));
      if(asocWon){track("asoc_ticket_triggered",{attempt:save.digs+1,biome:save.biome,tool_id:save.equippedTool,chance:asocChance});beginTrueEncounter(asocTicket,"empty");return;}
      if(artifactWon){const undiscovered=pickTrue(rng.current,save.trueArtifacts);if(undiscovered){beginTrueEncounter(undiscovered,"empty");return;}}
      if(rng.current()<CANONICAL_EXCAVATION_PROBABILITIES.emptyDig){playImpact(impactKind??"crack");const tunnelEligible=canTriggerForbiddenTunnel(save,true),tunnel=tunnelEligible&&rng.current()<FORBIDDEN_TUNNEL_TRIGGER_CHANCE?createForbiddenTunnel(rng.current,`${save.digs+1}-${Math.floor(rng.current()*1e9)}`):null;setSave(s=>{const streak=s.streak+1,veinDigsRemaining=Math.max(0,s.veinDigsRemaining-1),veinExpired=s.veinDigsRemaining>0&&veinDigsRemaining===0;if(veinExpired)emitGameplayEvent("VEIN_EXPIRED",{ore:s.veinOre});return {...s,digs:s.digs+1,emptyDigs:s.emptyDigs+1,streak,longestStreak:Math.max(s.longestStreak,streak),newStreak:0,lastDigAt:Date.now(),veinDigsRemaining,veinOre:veinExpired?null:s.veinOre,pendingArtifactModifier:null,forbiddenTunnel:tunnel||s.forbiddenTunnel}});if(modifier){track("artifact_modifier_consumed",{modifier:modifier.chance,source:modifier.source,success:false});track("artifact_modifier_roll_failed",{modifier:modifier.chance,source:modifier.source});if(modifier.chance===.15)setDeepWayFailure(true)}if(tunnel)track("forbidden_tunnel_triggered",{biome:save.biome,session_dig:sessionDigs.current+1,seeded_test:!!seed});sessionDigs.current++;setSessionDigsCount(c=>c+1);setSessionDrought(d=>{const next=d+1;setSessionLongestDrought(l=>Math.max(l,next));return next;});const emptyRun=++emptyDigStreak.current,pool=emptyRun===1?EMPTY_INSULTS_NORMAL:emptyRun===2?EMPTY_INSULTS_MILD:emptyRun===3?EMPTY_INSULTS_HARSH:EMPTY_INSULTS_STRONG;
        // eslint-disable-next-line react-hooks/purity -- cosmetic copy selection runs only from a completed-dig event handler.
        const [result,insult]=pool[Math.floor(Math.random()*pool.length)];setEmptyNotice({id:++emptyNoticeId.current,result,insult});track("dig_empty",{attempt:save.digs+1,biome:save.biome,empty_rate:.2,consecutive_empty:emptyRun});continueMine();return;}
      const band = depthBand(maxHp);
      const weights = applyVein(depthWeights(save.biome, band), save.veinOre);
      const ore = pick(ores,rng.current,weights);
      emptyDigStreak.current=0;
      playImpact(impactKind??"clank");
      setFractures([]);
      setPendingOre(ore);
      rollMineCommentary(eligibleOreCommentary(ore.rarity));
      setStage("ore");
      const oreHp = toughnessStrikes(ore.toughness ?? 1);
      setMaxHp(oreHp);
      setRockHp(oreHp);
      track("tunnel_broken",{attempt:save.digs+1,biome:save.biome,depth_band:band});
      track("ore_found",{ore_id:ore.id,rarity:ore.rarity,biome:save.biome});
      if ((ore.toughness ?? 1) > 1) emitGameplayEvent("TOUGH_ORE_EXPOSED", { ore_id: ore.id, toughness: ore.toughness });
      return;
    }
    const band = depthBand(maxHp);
    const fallbackWeights = applyVein(depthWeights(save.biome, band), save.veinOre);
    const ore = pendingOre || pick(ores,rng.current,fallbackWeights);
    const targetParts=save.huntTarget?.split("-")||[],boost=huntBoost(save),mineralWeights=minerals.map(m=>m.weight*(targetParts[0]===ore.id&&targetParts[1]===m.id?boost:1));
    const mineral = pick(minerals,rng.current,mineralWeights), key = `${ore.id}-${mineral.id}`;
    const isNewResult=!save.combos[key],duplicateCount=(save.combos[key]||0)+1,modifier=save.pendingArtifactModifier;
    const veinRoll=rng.current()<VEIN_CHANCE,quotaWouldComplete=!biomeQuotaComplete(save,save.biome)&&biomePages[save.biome].every(id=>(save.ores[id]||0)+(id===ore.id?1:0)>=oreQuota(id));
    const tunnelEligible=canTriggerForbiddenTunnel(save,!isNewResult&&!veinRoll&&!quotaWouldComplete),tunnel=tunnelEligible&&rng.current()<FORBIDDEN_TUNNEL_TRIGGER_CHANCE?createForbiddenTunnel(rng.current,`${save.digs+1}-${Math.floor(rng.current()*1e9)}`):null;
    playImpact(impactKind??"crack");
    setSave(s => {
      const isNew = !s.combos[key];
      const dustGain=isNew?0:dustByRarity[mineral.rarity];
      const before=minerals.filter(m=>s.combos[`${ore.id}-${m.id}`]).length;
      const after=isNew?before+1:before;
      const newStreak=isNew?0:s.streak+1,newDiscoveryStreak=isNew?s.newStreak+1:0,targetHit=s.huntTarget===key;
      const veinDigsRemaining=Math.max(0,s.veinDigsRemaining-1),veinExpiredOld=s.veinDigsRemaining>0&&veinDigsRemaining===0;
      const veinTriggered=veinRoll;
      if(veinExpiredOld&&!veinTriggered)emitGameplayEvent("VEIN_EXPIRED",{ore:s.veinOre});
      if(veinTriggered){setSessionVeins(v=>v+1);emitGameplayEvent("VEIN_EXPOSED",{ore:ore.id});}
      const milestoneDigs=(after===14&&s.milestoneDigs[ore.id]===undefined)?{...s.milestoneDigs,[ore.id]:s.digs+1}:s.milestoneDigs;
      const next: Save = { ...s, digs: s.digs + 1, dust:s.dust+dustGain,dustEarned:s.dustEarned+dustGain, combos: { ...s.combos, [key]: (s.combos[key] || 0) + 1 }, ores: { ...s.ores, [ore.id]: (s.ores[ore.id] || 0) + 1 }, oreResources:{...s.oreResources,[ore.id]:(s.oreResources[ore.id]||0)+1}, minerals: { ...s.minerals, [mineral.id]: (s.minerals[mineral.id] || 0) + 1 }, mineralResources:{...s.mineralResources,[mineral.id]:(s.mineralResources[mineral.id]||0)+1}, first: isNew ? { ...s.first, [key]: s.digs + 1 } : s.first, streak:newStreak,longestStreak:Math.max(s.longestStreak,newStreak),newStreak:newDiscoveryStreak,longestNewStreak:Math.max(s.longestNewStreak,newDiscoveryStreak), lastDigAt:Date.now(),huntTarget:targetHit?null:s.huntTarget,longestHunt:targetHit?Math.max(s.longestHunt,s.digs+1-s.huntStartedAtDig):s.longestHunt, milestones:{...s.milestones,...(after>=5?{[ore.id]:Math.max(s.milestones[ore.id]||0,after)}:{})}, milestoneDigs, veinDigsRemaining:veinTriggered?VEIN_DURATION:veinDigsRemaining, veinOre:veinTriggered?ore.id:(veinExpiredOld?null:s.veinOre),pendingArtifactModifier:null,forbiddenTunnel:tunnel||s.forbiddenTunnel };
      track("resource_earned",{resource_kind:"ore",resource_id:ore.id,quantity:1,stock:next.oreResources[ore.id]});track("resource_earned",{resource_kind:"mineral",resource_id:mineral.id,quantity:1,stock:next.mineralResources[mineral.id]});
      if(isNew)setSessionNew(n=>n+1);
      setSessionDrought(0);
      // Last-One escalation: purely presentational — scan every ore
      // currently sitting at 14/15 and emit once per exact-threshold crossing.
      for(const o of ores){const found15=minerals.filter(m=>next.combos[`${o.id}-${m.id}`]).length;if(found15!==14)continue;const since=next.milestoneDigs[o.id];if(since===undefined)continue;const elapsed=next.digs-since;if(elapsed===25)emitGameplayEvent("LAST_SPECIMEN_25",{ore_id:o.id});else if(elapsed===60)emitGameplayEvent("LAST_SPECIMEN_60",{ore_id:o.id});else if(elapsed===100)emitGameplayEvent("LAST_SPECIMEN_100",{ore_id:o.id});else if(elapsed===175)emitGameplayEvent("LAST_SPECIMEN_175",{ore_id:o.id});}
      const fresh = unlocked(next, ore, mineral);
      next.achievements = [...s.achievements, ...fresh];
      if (fresh[0]) { const a = achievements.find(x => x.id === fresh[0])!; setTimeout(() => setToast(a), 650); }
      if(isNew)setFound({ ore, mineral, isNew, count: next.combos[key] });
      sessionDigs.current++;setSessionDigsCount(c=>c+1);
      const context={attempt:next.digs,session_dig:sessionDigs.current,ore_id:ore.id,mineral_id:mineral.id,combination_id:key,rarity:mineral.rarity,biome:s.biome,duplicate_count:next.combos[key],album_completion:Object.keys(next.combos).length/225,time_since_previous_dig_ms:s.lastDigAt?Date.now()-s.lastDigAt:null,hunt_boost:boost};
      track("mineral_found",context); track(isNew?"combination_new":"combination_duplicate",context);
      if(isNew&&[5,10,12,14,15].includes(after)){track(after===15?"page_completed":after===14?"page_milestone_4":"page_milestone_3",{...context,page:ore.id,level:after}); setTimeout(()=>setMilestone({ore,level:after,attempts:next.ores[ore.id],missing:after===14?minerals.find(m=>!next.combos[`${ore.id}-${m.id}`]):undefined}),400);}
      fresh.forEach(id=>track("achievement_unlocked",{achievement_id:id}));
      if(s.huntTarget===key)setTimeout(()=>setToast({name:"TARGET ACQUIRED",text:`${discoveryOreName(ore)} + ${mineral.name}. The hunt is over. Find a worse one.`}),250);
      return next;
    });
    if(modifier){track("artifact_modifier_consumed",{modifier:modifier.chance,source:modifier.source,success:false});track("artifact_modifier_roll_failed",{modifier:modifier.chance,source:modifier.source});if(modifier.chance===.15)setDeepWayFailure(true)}
    if(tunnel)track("forbidden_tunnel_triggered",{biome:save.biome,session_dig:sessionDigs.current,seeded_test:!!seed});
    if(!isNewResult){
      setDuplicateNotice({id:++duplicateNoticeId.current,ore,mineral,count:duplicateCount,dust:dustByRarity[mineral.rarity]});
      continueMine();
    }
  };
  useEffect(()=>{strikeRef.current=strike});

  const strikeAtPointer=(event:React.MouseEvent<HTMLButtonElement>)=>{const rect=event.currentTarget.getBoundingClientRect();strike({x:Math.max(1,Math.min(99,(event.clientX-rect.left)/rect.width*100)),y:Math.max(2,Math.min(98,(event.clientY-rect.top)/rect.height*100))})};
  const followPointer=(event:React.PointerEvent<HTMLButtonElement>)=>{if(event.pointerType!=="mouse")return;const rock=event.currentTarget,rect=rock.getBoundingClientRect(),x=Math.max(1,Math.min(99,(event.clientX-rect.left)/rect.width*100)),y=Math.max(2,Math.min(98,(event.clientY-rect.top)/rect.height*100));rock.style.setProperty("--pick-x",`${x}%`);rock.style.setProperty("--pick-y",`${y}%`);rock.classList.add("pick-following")};
  const stopFollowing=(event:React.PointerEvent<HTMLButtonElement>)=>{event.currentTarget.classList.remove("pick-following");event.currentTarget.style.removeProperty("--pick-x");event.currentTarget.style.removeProperty("--pick-y")};


  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if(event.code!=="Space")return;
      if(tab==="mine")event.preventDefault();
      if(event.repeat||spaceHeld.current)return;
      spaceHeld.current=true;
      if(tab === "mine" && !found && !trueFind){
        strikeRef.current();
        const tool=forgedItems.find(t=>t.id===save.equippedTool);
        if(tool?.holdToMine&&tool.continuousMining){const frenzy=activeBerserkMode(save.activeBerserk);setMiningEngaged(true);autoMineTimer.current=setInterval(()=>strikeRef.current(),Math.max(36,Math.round((tool.intervalMs||tool.actionDurationMs)*(frenzy?.intervalMultiplier||1))));}
      }
    };
    const releaseSpace=()=>{spaceHeld.current=false;setMiningEngaged(false);if(autoMineTimer.current){clearInterval(autoMineTimer.current);autoMineTimer.current=undefined}};
    const onKeyUp=(event:KeyboardEvent)=>{if(event.code==="Space")releaseSpace()};
    window.addEventListener("keydown", onKey);
    window.addEventListener("keyup",onKeyUp);
    window.addEventListener("blur",releaseSpace);
    return () => {window.removeEventListener("keydown", onKey);window.removeEventListener("keyup",onKeyUp);window.removeEventListener("blur",releaseSpace);if(autoMineTimer.current)clearInterval(autoMineTimer.current)};
  },[tab,save.equippedTool,save.activeBerserk?.expiresAt,found,trueFind]);

  const unique = Object.keys(save.combos).length;
  const activeSkin=toolSkin(save.toolSkinId,save.unlocks);
  const activeTechnology=equippedMiningTool(save);
  const hasSuccessfulExtraction=Object.values(save.ores).some(count=>count>0);
  const showStrikeInstruction=stage==="artifact"||(stage==="tunnel"&&!hasSuccessfulExtraction);
  const reset = () => { if (confirm("Erase every discovery and return to the cold, uncaring rock?")) { setSave(blank); rollMineCommentary(NORMAL_DIGGING_COMMENTARY); setFound(null); setPendingOre(null); setEmptyNotice(null); setFractures([]); setCollapseBurst(null); setStage("tunnel"); setMaxHp(12); setRockHp(12); sessionDigs.current=0; setSessionDigsCount(0); setSessionMisses(0); setSessionVeins(0); setSessionNew(0); setSessionDrought(0); setSessionLongestDrought(0); consecutiveMisses.current=0; emptyDigStreak.current=0; } };
  const startNewGamePlus=()=>{setSave(s=>({...blank,settings:s.settings,unlocks:s.unlocks,equipped:s.equipped,toolSkinId:s.toolSkinId,achievements:s.achievements,trueArtifacts:s.trueArtifacts,trueFirst:s.trueFirst,completionCount:s.completionCount,asocTickets:s.asocTickets,newGamePlusLevel:s.newGamePlusLevel+1,firstCompletionDate:s.firstCompletionDate,latestCompletionDate:s.latestCompletionDate,completionHistory:s.completionHistory,runStartedAt:Date.now()}));setConfirmNewGamePlus(false);setCompletedBrowsing(false);setEndingActive(false);setTab("mine");setStage("tunnel");setMaxHp(12);setRockHp(12);setPendingOre(null);rollMineCommentary(NORMAL_DIGGING_COMMENTARY);};

  return <main className={`tab-${tab} ${save.settings.reducedMotion?"reduced-motion":""} ${save.settings.reducedShake?"reduced-shake":""} ${save.settings.highContrast?"high-contrast":""} cosmetic-${save.equipped} ${currentBerserk?`berserk-active berserk-${currentBerserk.id}`:""}`} style={{"--berserk-speed":currentBerserk?.intervalMultiplier||1,"--berserk-power":currentBerserk?.damageMultiplier||1} as React.CSSProperties}>
    <audio ref={soundtrackRef} src="/assets/audio/echoes-of-the-forgotten-crypt.wav" loop preload="metadata" aria-hidden="true"/>
    <audio ref={trueArtifactCueRef} src="/assets/audio/true-artefact.wav" preload="auto" aria-hidden="true"/>
    <audio ref={tunnelCueRef} src="/assets/audio/tunnels.wav" preload="auto" aria-hidden="true"/>
    {save.gameCompleted&&!completedBrowsing&&<EndgameExperience save={save} startAtCompletion={save.endingSeen&&!endingActive} onFinished={()=>{setSave(s=>({...s,endingSeen:true}));setEndingActive(false)}} onView={()=>setCompletedBrowsing(true)} onNewGame={()=>setConfirmNewGamePlus(true)}/>}
    {confirmNewGamePlus&&<div className="ngplus-confirm" role="dialog" aria-modal="true"><section><small>VOLUNTARY LABOUR VIOLATION</small><h2>THE CIRCUS MAY YET RETURN</h2><p><b>SYSTEM</b> Management has reviewed your performance.<br/>Their conclusion was catastrophic.<br/>You have been rehired.</p><blockquote><b>PEON</b> “...Zug zug.”</blockquote><div><button onClick={()=>setConfirmNewGamePlus(false)}>KEEP COMPLETED SHIFT</button><button onClick={startNewGamePlus}>BEGIN NEW GAME+ →</button></div></section></div>}
    <header className="topbar">
      <button className="brand brand-logo-button" aria-label="ORE WHORE — return to mine" onClick={() => setTab("mine")}><img className="brand-wordmark" src="/assets/brand/ore-whore-wordmark-compact.webp" alt="ORE WHORE"/><span className="brand-subtitle">COMPULSIVE GEOLOGY</span></button>
      <nav aria-label="Primary">
        <button className={tab === "mine" ? "active" : ""} onClick={() => setTab("mine")}>MINE</button>
        <button className={tab === "forge" ? "active" : ""} onClick={() => setTab("forge")}>FORGE</button>
        <button className={tab === "album" ? "active" : ""} onClick={() => {setTab("album");track("album_opened",{completion:unique/225});}}>ALBUM <b>{unique}/225</b></button>
        <button className={tab === "wanted" ? "active" : ""} onClick={() => {setTab("wanted");track("missing_view_opened",{completion:unique/225});}}>WANTED</button>
        <button className={tab === "records" ? "active" : ""} onClick={() => setTab("records")}>RECORDS</button>
        <button className={tab === "more" ? "active" : ""} onClick={() => setTab("more")}>MORE</button>
        <button className={`true-nav-btn ${tab === "true" ? "active" : ""}`} onClick={() => setTab("true")}>TRUE ARTEFACTS</button>
      </nav>
      <div className="depth"><span>SPECIMEN DUST</span><strong>✦ {save.dust}</strong></div>
      <div className="audio-dock" aria-label="Audio controls">
        <button className={save.settings.musicEnabled?"enabled":""} aria-pressed={save.settings.musicEnabled} title="Toggle soundtrack" onClick={()=>setSave(s=>({...s,settings:{...s.settings,musicEnabled:!s.settings.musicEnabled}}))}>♫ <span>MUSIC</span> {save.settings.musicEnabled?"ON":"OFF"}</button>
        <label><span>MUSIC VOLUME</span><input aria-label="Music volume" type="range" min="0" max="1" step=".05" value={save.settings.musicVolume} disabled={!save.settings.musicEnabled} onChange={e=>setSave(s=>({...s,settings:{...s.settings,musicVolume:+e.target.value}}))}/><b>{Math.round(save.settings.musicVolume*100)}%</b></label>
        <button className={save.settings.pickaxeSfxEnabled?"enabled":""} aria-pressed={save.settings.pickaxeSfxEnabled} title="Toggle pickaxe effects" onClick={()=>setSave(s=>({...s,settings:{...s.settings,pickaxeSfxEnabled:!s.settings.pickaxeSfxEnabled}}))}>⛏ <span>PICKAXE FX</span> {save.settings.pickaxeSfxEnabled?"ON":"OFF"}</button>
      </div>
    </header>

    {tab === "mine" && <section className={`mine-screen biome-${save.biome} ${impact ? "screen-hit" : ""} stage-${stage}`} style={{"--biome-accent":biomeVisuals[save.biome].accent,"--biome-secondary":biomeVisuals[save.biome].secondary,"--biome-canvas":biomeVisuals[save.biome].canvas,"--biome-cavity":biomeVisuals[save.biome].cavity,"--biome-debris":biomeVisuals[save.biome].debris,"--biome-particle":biomeVisuals[save.biome].particle,"--biome-light":biomeVisuals[save.biome].light} as React.CSSProperties}>
      <div className="mine-copy"><p className="eyebrow">{save.gameCompleted?"SHIFT COMPLETE":stage === "artifact" ? "SYSTEM ALERT · IMPOSSIBLE DENSITY" : stage === "ore" ? "CLANK · DEPOSIT EXPOSED" : "SYSTEM / FOREMAN · ACTIVE DIRECTIVE"}</p><h1>{save.gameCompleted?<><span>YOU MAY </span><i>REST.</i></>:<CommentaryHeadline text={mineCommentary.headline} accentFirst={stage==="ore"}/>}</h1><p>{save.gameCompleted?"Or don't. New Game+ is right there.":mineCommentary.subtitle}</p></div>
      <div className="stats-row"><span><small>DEPOSITS</small>{save.digs}</span><span><small>UNIQUE</small>{unique}<em>/ 225</em></span><span><small>DRY STREAK</small>{save.streak}</span></div>
      {save.huntTarget&&<div className="hunt-banner"><span>HUNTING{huntBoost(save)>1?` · FOCUS +${Math.round((huntBoost(save)-1)*100)}%`:""}</span><strong>{(()=>{const p=save.huntTarget!.lastIndexOf("-");return `${ores.find(o=>o.id===save.huntTarget!.slice(0,p))?.name} + ${minerals.find(m=>m.id===save.huntTarget!.slice(p+1))?.name}`})()}</strong><button onClick={()=>setTab("wanted")}>VIEW TARGET</button></div>}
      {save.veinOre&&<div className="vein-banner"><span>VEIN EXPOSED</span><strong>{ores.find(o=>o.id===save.veinOre)?.name}</strong><small>{save.veinDigsRemaining} {save.veinDigsRemaining===1?"DIG":"DIGS"} REMAIN</small></div>}
      {save.pendingArtifactModifier&&!save.pendingArtifactModifier.consumed&&<div className={`artifact-modifier-hud ${save.pendingArtifactModifier.chance===.15?"deep-way":""}`}><small>{save.pendingArtifactModifier.chance===.15?"THE DEEP WAY AWAITS":"FORBIDDEN TUNNEL MODIFIER"}</small><strong>TRUE ARTIFACT CHANCE: {(save.pendingArtifactModifier.chance*100).toFixed(save.pendingArtifactModifier.chance<.01?2:0)}%</strong><span>NEXT COMPLETED DIG · NOT GUARANTEED</span></div>}
      <div className={`berserk-console ${currentBerserk?"running":""}`} aria-label="Specimen Dust Berserk control">
        <div className="berserk-console-copy"><small>QUESTIONABLE WORKPLACE STIMULANT</small><strong>{currentBerserk?currentBerserk.name:"SNORT THE DUST"}</strong><span>{currentBerserk?`PEON OPERATING OUTSIDE WARRANTY · ${Math.ceil(berserkRemainingMs(save.activeBerserk,berserkNow)/1000)}s`:`AVAILABLE DUST · ✦ ${save.dust}`}</span></div>
        {currentBerserk&&save.activeBerserk?<div className="berserk-clock"><i><b style={{width:`${Math.min(100,berserkRemainingMs(save.activeBerserk,berserkNow)/currentBerserk.durationMs*100)}%`}}/></i><em>DAMAGE ×{currentBerserk.damageMultiplier.toFixed(2)} · CRIT +{Math.round(currentBerserk.criticalBonus*100)}%</em></div>:<div className="berserk-options">{BERSERK_MODES.map(mode=><button key={mode.id} disabled={save.dust<mode.cost} onClick={()=>snortDust(mode.id)}><span>{mode.name}</span><b>✦ {mode.cost}</b><small>{Math.round(mode.durationMs/1000)}s · DMG ×{mode.damageMultiplier.toFixed(2)} · CRIT +{Math.round(mode.criticalBonus*100)}%</small></button>)}</div>}
      </div>
      {(()=>{const found=biomeQuotaProgress(save,save.biome),target=biomeQuotaTotal(save.biome),reached=biomeQuotaComplete(save,save.biome);if(reached&&!quotaExpanded)return <div className="mine-mastery extraction-quota quota-complete-compact"><div><span>{biomeNames[save.biome]} · SURVEY COMPLETE ✓</span><strong>{found}/{target}</strong></div><small>{save.biome==="northrend"?"VOLUME I COMPLETE":"PASSAGE OPEN"}</small><button onClick={()=>setQuotaExpanded(true)}>VIEW QUOTAS</button></div>;return <div className="mine-mastery extraction-quota"><div><span>{biomeNames[save.biome]} EXTRACTION QUOTA</span><strong>{found} / {target}</strong></div><i><b style={{width:`${Math.min(100,found/target*100)}%`}}/></i><div className="quota-list">{biomePages[save.biome].map(id=>{const ore=ores.find(o=>o.id===id)!,count=Math.min(save.ores[id]||0,oreQuota(id)),targetCount=oreQuota(id);return <span key={id} className={count>=targetCount?"met":""}><img src={oreAsset(id)} alt=""/><b>{ore.name.replace(" Ore","")}</b><em>{count}/{targetCount}</em>{count>=targetCount&&<strong>✓</strong>}</span>})}</div><small>{reached?(save.biome==="northrend"?"VOLUME I MINING PROGRESSION COMPLETE · Album mastery remains separate.":"PASSAGE OPEN · all native ore quotas satisfied."):"Complete every extraction quota to unlock the next mine."}</small>{reached&&<button className="quota-collapse" onClick={()=>setQuotaExpanded(false)}>HIDE QUOTAS</button>}</div>})()}
      <div className="biomes volume-biomes" aria-label="Mine location">{biomeOrder.map((b,i)=>{const open=save.unlockedBiomes.includes(b),done=biomeQuotaProgress(save,b),previous=i?biomeOrder[i-1]:b,v=biomeVisuals[b];return <button key={b} disabled={!open} style={{"--card-accent":v.accent,"--card-secondary":v.secondary,"--card-bg":v.card} as React.CSSProperties} className={`mine-card biome-card-${b} ${save.biome===b?"chosen":""} ${open?"":"locked"}`} onClick={()=>{setSave(s=>({...s,biome:b}));track("biome_selected",{biome:b})}}><span>{open?biomeNames[b]:`🔒 ${biomeNames[b]}`}</span><small>{open?`${done}/${biomeQuotaTotal(b)} EXTRACTED · ${distributionLabel(b)}`:`COMPLETE ALL ${biomeNames[previous]} EXTRACTION QUOTAS · ${biomeQuotaProgress(save,previous)}/${biomeQuotaTotal(previous)}`}</small></button>})}</div>
      <button className={`rock depletion-${mineDepletionLevel(save,save.biome)} technology-tier-${activeTechnology.tier} motion-${activeSkin.animation.id} ${miningEngaged&&activeSkin.animation.engagedLoop?"mining-engaged":""} ${impact ? "hit" : ""} ${stage === "ore" ? "ore-rock" : ""} ${stage === "artifact" ? "artifact-rock" : ""} damage-${Math.floor((1-rockHp/maxHp)*4)} ${rockHp===1?"final-hit":""} ${lastHitKind?`hit-${lastHitKind==="perfectCrit"?"perfect-crit":lastHitKind}`:""}`} style={{"--hit-x":`${hitPoint.x}%`,"--hit-y":`${hitPoint.y}%`,"--tool-tier":activeTechnology.tier,"--tool-power":activeTechnology.damage,"--impact-scale":.92+activeTechnology.tier*.035,"--impact-flash-size":`${92+activeTechnology.tier*6}px`,"--impact-glow":`${10+activeTechnology.tier*2}px`,"--ore-light":pendingOre?.color||biomeVisuals[save.biome].light} as React.CSSProperties} onPointerEnter={followPointer} onPointerMove={followPointer} onPointerLeave={stopFollowing} onClick={strikeAtPointer} aria-label={stage === "artifact" ? "Excavate the unidentified impossible object" : stage === "ore" ? "Crack the exposed ore deposit" : "Strike the rock wall"}>
        <span className="mine-atmosphere" aria-hidden="true"/>
        <span className={`mine-stage-art ${save.biome}-mine-stage-art`} aria-hidden="true">{Array.from({length:5},(_,i)=><i key={i} className={`mine-stage-${i}`}/>)}</span>
        <span className="mine-depletion" aria-hidden="true"/>
        <span className="depletion-structure" aria-hidden="true"><i/><i/><i/><i/></span>
        {stage==="tunnel"&&<span className="depletion-status" aria-hidden="true"><small>SURVEY STATE {mineDepletionLevel(save,save.biome)+1}/5</small><strong>{mineDepletionLabel(mineDepletionLevel(save,save.biome))}</strong></span>}
        <span className="ambient-fx" aria-hidden="true">
          {Array.from({length:12},(_,i)=><i key={i}/>) }
        </span>
        <span className="damage-reveal" style={{"--subsurface":stage==="ore"&&pendingOre?pendingOre.color:biomeVisuals[save.biome].accent} as React.CSSProperties} aria-hidden="true"/>
        <span className="fracture-field" aria-hidden="true">{fractures.map(f=><i key={f.id} className={`persistent-fracture fracture-power-${f.power}`} style={{"--fracture-x":`${f.x}%`,"--fracture-y":`${f.y}%`,"--fracture-turn":`${(f.id*47)%360}deg`,"--fracture-strength":Math.min(4,f.power),"--fracture-scale":.84+Math.min(4,f.power)*.13} as React.CSSProperties}/>)}</span>
        <span className="impact-scar" aria-hidden="true"/>
        <span className="crack c1"/><span className="crack c2"/><span className="crack c3"/>
        <span className={`perfect-ring ${perfectReady?"ready":""}`} aria-hidden="true"/>
        {stage === "ore" && pendingOre && <span className={`exposed-ore rarity-${pendingOre.rarity.toLowerCase()}`} style={{"--ore":pendingOre.color} as React.CSSProperties}><img className="ore-sprite ore-sprite-exposed" src={oreAsset(pendingOre.id)} alt=""/><strong>{pendingOre.name}</strong><small>{pendingOre.rarity.toUpperCase()}</small></span>}
        {stage === "artifact" && <span className="artifact-mass" aria-hidden="true"><i>?</i><strong>UNIDENTIFIED MASS</strong><small>CLASSIFICATION WITHHELD</small></span>}
        {impact && <span className="debris">{Array.from({length:8+Math.min(8,activeTechnology.tier)},(_,i)=><i key={i}/>)}</span>}
        <span className={`skin-impact-fx fx-${activeSkin.animation.impactFx}`} aria-hidden="true">{Array.from({length:6},(_,i)=><i key={i}/>)}</span>
        <span className={`pickaxe canonical-tool-skin skin-${activeSkin.silhouette}`} aria-hidden="true"><img src={activeSkin.artwork} alt=""/></span>
        {impact && <span className="impact-flash" aria-hidden="true"/>}
        {collapseBurst&&<span key={collapseBurst.id} className="collapse-rift" style={{"--collapse-x":`${collapseBurst.x}%`,"--collapse-y":`${collapseBurst.y}%`} as React.CSSProperties} aria-hidden="true"><i/><i/><i/><i/><i/><i/><i/><i/><i/><i/></span>}
        {lastHitKind&&lastHitKind!=="miss"&&<span className="hit-callout" aria-hidden="true">{lastHitKind==="perfectCrit"?"PERFECT CRIT":lastHitKind==="perfect"?"PERFECT":lastHitKind==="crit"?"CRITICAL":"SOLID HIT"}</span>}
        {missFlash && <span className="miss-bark" role="status">{missFlash}</span>}
      </button>
      <div className={`dig-panel ${stage==="artifact"?"artifact-dig-panel":""} ${showStrikeInstruction?"":"instruction-collapsed"}`}>{showStrikeInstruction&&<div className="strike-instruction"><span className="mouse-icon">↙</span><strong>{stage === "artifact" ? "KEEP HITTING IT" : "CLICK TO STRIKE"}</strong><small>or press SPACE</small></div>}<div className="integrity">{stage === "artifact" ? <div className="artifact-integrity-head"><span><small>ANOMALOUS INTEGRITY</small><strong>{Math.ceil(rockHp)} <em>/ {maxHp}</em></strong></span><b className="artifact-multiplier">20×<small>RESISTANCE</small></b></div> : <span>{stage === "ore" ? "ORE SHELL" : <>TUNNEL PROGRESS · {Math.round((1-rockHp/maxHp)*100)}% · <b className={`depth-band depth-${depthBand(maxHp)}`}>{depthBand(maxHp).toUpperCase()}</b></>}</span>}<i>{Array.from({length: 12},(_,i)=><b key={i} className={i < Math.ceil((rockHp/maxHp)*12) ? "full" : ""}/>)}</i></div></div>
      <button className="album-link" onClick={() => {setTab("album");track("album_opened",{completion:unique/225});}}>VIEW COMBINATION ALBUM <span>→</span></button>
      {mineTransition&&<div className="mine-transition" role="status" aria-live="polite"><small>DESCENDING...</small><strong>{biomeNames[mineTransition]}</strong><span>{biomeVisuals[mineTransition].flavor}</span></div>}
    </section>}

    {tab === "album" && <Album save={save} />}
    {tab === "forge" && <Forge save={save} setSave={setSave}/>}
    {tab === "wanted" && <Wanted save={save} onHunt={(biome,target)=>{setSave(s=>({...s,biome,huntTarget:target,huntStartedAtDig:s.digs,huntCounts:{...s.huntCounts,[target]:(s.huntCounts[target]||0)+1}}));track("hunt_started",{biome,combination_id:target});setTab("mine");continueMine();}} />}
    {tab === "records" && <><Records save={save} onReset={reset} session={{digs:sessionDigsCount,misses:sessionMisses,veins:sessionVeins,newSpecimens:sessionNew,drought:sessionDrought,longestDrought:sessionLongestDrought}} /><HuntRecords save={save}/></>}
    {tab === "more" && <><VolumeRewards save={save}/><More save={save} setSave={setSave} onHelp={()=>{setTab("mine");setOnboarding(true)}} /></>}
    {tab === "true" && <TrueArchive save={save} />}

    {trueFind && <TrueReveal data={trueFind} reducedMotion={save.settings.reducedMotion} onContinue={()=>{setTrueFind(null);continueMine();}} />}
    {save.forbiddenTunnel&&<ForbiddenTunnelEncounter state={save.forbiddenTunnel} reducedMotion={save.settings.reducedMotion} onFirst={selectForbiddenFirst} onSecond={selectForbiddenSecond} onContinue={()=>{setSave(s=>({...s,forbiddenTunnel:null}));setTab("mine");continueMine()}}/>}
    {deepWayFailure&&!found&&<div className="deep-way-failure" role="dialog" aria-modal="true"><section><small>SYSTEM / FOREMAN</small><h2>THE DEEP WAY HAS RETURNED NOTHING.</h2><p>Statistically survivable. Spiritually ruinous.</p><blockquote><b>PEON</b> “Peon saw fifteen percent. Peon trusted fifteen percent.”</blockquote><button onClick={()=>{setDeepWayFailure(false);continueMine()}}>KEEP DIGGING</button></section></div>}
    {found && <Reveal found={found} total={unique} attempt={save.digs} biome={save.biome} onContinue={continueMine} />}
      {duplicateNotice&&<div key={duplicateNotice.id} className="duplicate-float" role="status" aria-live="polite"><span>DUPLICATE ×{duplicateNotice.count}</span><strong>{discoveryOreName(duplicateNotice.ore)} + {duplicateNotice.mineral.name}</strong><small>+{duplicateNotice.dust} SPECIMEN DUST</small></div>}
    {emptyNotice&&<div key={emptyNotice.id} className="empty-insult" role="status" aria-live="polite"><small>SYSTEM</small><p><strong>{emptyNotice.result}</strong><span> — {emptyNotice.insult}</span></p></div>}
    {milestone && <Milestone data={milestone} onClose={()=>setMilestone(null)} onAlbum={()=>{if(milestone.level===14&&milestone.missing){const target=`${milestone.ore.id}-${milestone.missing.id}`,b=bestBiome(milestone.ore);setSave(s=>({...s,biome:b,huntTarget:target,huntStartedAtDig:s.digs,huntCounts:{...s.huntCounts,[target]:(s.huntCounts[target]||0)+1}}));track("hunt_started",{biome:b,combination_id:target});setTab("mine")}else setTab("album");setMilestone(null)}} />}
    {onboarding&&<Onboarding onDone={()=>{setOnboarding(false);setSave(s=>({...s,settings:{...s.settings,helpSeen:true}}));track("mine_started",{attempt:save.digs+1,biome:save.biome})}}/>}
    {mineCompletion&&<MineCompletion data={mineCompletion} digs={save.digs} onContinue={()=>{if(mineCompletion.next)setSave(s=>({...s,biome:mineCompletion.next!}));setMineCompletion(null);setTab("mine");continueMine();}}/>}
    {toast && <div className="achievement" role="button" tabIndex={0} onClick={() => setToast(null)} onKeyDown={(e)=>{if(e.key==="Enter"||e.key===" "){e.preventDefault();setToast(null)}}}><span>{toast.name.includes("MINE UNLOCKED")?"NEW MINE UNLOCKED":"ACHIEVEMENT UNLOCKED"}</span><strong>{toast.name}</strong><p>{toast.text}</p></div>}
  </main>;
}

function EndgameExperience({save,startAtCompletion,onFinished,onView,onNewGame}:{save:Save;startAtCompletion:boolean;onFinished:()=>void;onView:()=>void;onNewGame:()=>void}){
  const [phase,setPhase]=useState<"ticket"|"story"|"peon"|"credits"|"complete">(startAtCompletion?"complete":"ticket"),[beat,setBeat]=useState(0),[page,setPage]=useState(0);
  const record=save.completionHistory[save.completionHistory.length-1];
  useEffect(()=>{if(phase!=="ticket")return;const timer=setTimeout(()=>setBeat(value=>value<2?value+1:value),beat===0?1100:1300);return()=>clearTimeout(timer)},[phase,beat]);
  const nextStory=()=>{if(page<LAST_FIND_PAGES.length-1)setPage(page+1);else setPhase("peon")};
  return <div className={`endgame-overlay endgame-${phase}`} role="dialog" aria-modal="true" aria-label="ORE WHORE ending">
    {phase==="ticket"&&<section className="endgame-ticket"><small>{beat===0?"TRUE ARTEFACT?":beat===1?"No.":"Something older."}</small><img src="/assets/true/true-asoc-ticket.webp" alt="ASOC golden entry ticket"/><button disabled={beat<2} onClick={()=>setPhase("story")}>THE LAST FIND →</button></section>}
    {phase==="story"&&<section className="endgame-story"><small>THE LAST FIND · {String(page+1).padStart(2,"0")}</small><div>{LAST_FIND_PAGES[page].map((line,index)=><p key={index} className={line==="ASOC TICKET ACQUIRED"||line==="Keelah se'lai."?"story-emphasis":""}>{line}</p>)}</div><button onClick={nextStory}>{page===LAST_FIND_PAGES.length-1?"CONTINUE":"TURN THE PAGE →"}</button></section>}
    {phase==="peon"&&<section className="endgame-peon"><small>PEON</small><p>Boss...?</p><p>Peon keep ticket.</p><button onClick={()=>setPhase("credits")}>CONTINUE</button></section>}
    {phase==="credits"&&<section className="endgame-credits"><div>{CREDITS.map(([role,name],index)=><p key={index}><small>{role}</small><strong>{name}</strong></p>)}</div><button onClick={()=>{setPhase("complete");onFinished()}}>END SHIFT</button></section>}
    {phase==="complete"&&<section className="completion-screen"><small>SHIFT COMPLETE</small><h2>ASOC TICKET <i>SECURED</i></h2><div className="completion-stats">{record&&[["TOTAL DIGS",record.digs],["TOTAL STRIKES",record.strikes],["PLAYTIME",`${Math.floor(record.playTimeMs/3600000)}h ${Math.floor(record.playTimeMs/60000)%60}m`],["ORES EXCAVATED",record.oresExcavated],["MINERALS DISCOVERED",record.mineralsDiscovered],["UNIQUE SPECIMENS",record.uniqueSpecimens],["DUPLICATES",record.duplicateSpecimens],["PERFECT STRIKES",record.perfectStrikes],["CRITICAL STRIKES",record.criticalStrikes],["MISSES",record.misses],["VEINS",record.veinsDiscovered],["FORBIDDEN TUNNELS",record.forbiddenTunnelsEntered],["TRUE ARTEFACTS",record.trueArtifactsDiscovered],["DUST EARNED / SPENT",`${record.dustEarned} / ${record.dustSpent}`],["MOST MINED ORE",record.mostMinedOre],["MOST-USED PICKAXE",record.mostUsedPickaxe],["COMPLETION DATE",new Date(record.completedAt).toLocaleDateString()],["ASOC TICKETS OWNED",save.asocTickets]].map(([label,value])=><span key={label}><small>{label}</small><strong>{value}</strong></span>)}</div><div className="completion-actions"><button onClick={onView}>VIEW COMPLETED MINE</button><button onClick={onNewGame}>NEW GAME+ →</button></div></section>}
  </div>;
}

const passageCosmetics=(id:string)=>{const variants=["crooked","rails","collapsed","bend","reinforced","wide"];let seed=0;for(const char of id)seed=(Math.imul(seed,31)+char.charCodeAt(0))>>>0;for(let i=variants.length-1;i>0;i--){seed=(Math.imul(seed,1664525)+1013904223)>>>0;const j=seed%(i+1);[variants[i],variants[j]]=[variants[j],variants[i]]}return variants.slice(0,3)};
function ForbiddenTunnelEncounter({state,reducedMotion,onFirst,onSecond,onContinue}:{state:ForbiddenTunnelState;reducedMotion:boolean;onFirst:(direction:FirstDirection)=>void;onSecond:(direction:SecondDirection)=>void;onContinue:()=>void}){
  const firstLabel=(value:string)=>value==="x1"?"×1 · 0.05%":value==="x2"?"×2 · 0.10%":"×5 · SECOND CHAMBER";
  const secondLabel=(value:string)=>value==="deep"?"THE DEEP WAY · 15%":"SEALED PASSAGE · 0.25%";
  const resolved=state.chamber==="resolved",secondResolved=resolved&&!!state.secondSelection;
  const [entering,setEntering]=useState<FirstDirection|null>(null),cosmetics=passageCosmetics(state.id),directions=["left","middle","right"] as FirstDirection[];
  const enter=(direction:FirstDirection)=>{if(entering)return;setEntering(direction);window.setTimeout(()=>onFirst(direction),reducedMotion?20:360)};
  return <div className={`forbidden-tunnel-overlay chamber-${state.chamber} ${entering?`passage-entering entering-${entering}`:""} ${state.resolution==="deep"?"deep-victory":""} ${state.resolution==="sealed"?"sealed-result":""} ${reducedMotion?"reduced-motion":""}`} role="dialog" aria-modal="true" aria-label="Forbidden Tunnel encounter"><section className="forbidden-tunnel-card">
    <header><small>SYSTEM / FOREMAN</small><h2>{state.chamber==="first"?"UNLICENSED EXCAVATION DETECTED":state.chamber==="second"?"THE TUNNEL CONTINUES":state.resolution==="deep"?"THE DEEP WAY HAS OPENED":"FORBIDDEN ROUTE RESOLVED"}</h2><p>{state.chamber==="first"?<>Three passages. No geological recommendation available.<br/>Choose incorrectly with confidence.</>:state.chamber==="second"?<>This is statistically inadvisable.<br/>Naturally, you will proceed.</>:state.resolution==="sealed"?"The passage collapses. Your ×5 reward survives.":state.resolution==="deep"?"The mountain has made a statistically reckless offer.":"The mountain has recorded your choice."}</p></header>
    {state.chamber!=="first"&&<div className="tunnel-reveal first-reveal">{(["left","middle","right"] as FirstDirection[]).map(d=><span key={d} className={state.firstSelection===d?"selected":""}><small>{d}</small><strong>{firstLabel(state.firstAssignments[d])}</strong></span>)}</div>}
    {state.chamber==="first"&&<div className="tunnel-passages first-passages">{directions.map((d,index)=><button key={d} disabled={!!entering} className={`passage-${cosmetics[index]} ${entering===d?"selected-entry":entering?"receding-entry":""}`} onClick={()=>enter(d)}><i aria-hidden="true"><b/><b/><b/><b/></i><strong>{d.toUpperCase()}</strong><small><span>ENTER PASSAGE</span><em>ENTER {d.toUpperCase()} PASSAGE →</em></small></button>)}</div>}
    {state.chamber==="second"&&<><div className="tunnel-passages second-passages">{(["left","right"] as SecondDirection[]).map(d=><button key={d} onClick={()=>onSecond(d)}><i aria-hidden="true"/><strong>{d.toUpperCase()}</strong><small>PROCEED</small></button>)}</div><blockquote>PEON: “Two holes now. Mine getting serious.”</blockquote></>}
    {secondResolved&&state.secondAssignments&&<div className="tunnel-reveal second-reveal">{(["left","right"] as SecondDirection[]).map(d=><span key={d} className={state.secondSelection===d?"selected":""}><small>{d}</small><strong>{secondLabel(state.secondAssignments![d])}</strong></span>)}</div>}
    {state.chamber==="first"&&<blockquote>PEON: “Three holes. Peon choose best hole.”</blockquote>}
    {resolved&&<footer><div><small>NEXT COMPLETED DIG</small><strong>TRUE ARTIFACT CHANCE: {state.resolution==="x1"?"0.05%":state.resolution==="x2"?"0.10%":state.resolution==="sealed"?"0.25%":"15%"}</strong></div><button onClick={onContinue}>RETURN TO MINE →</button></footer>}
  </section></div>;
}

function Album({ save }: { save: Save }) {
  const [selected, setSelected] = useState(ores[0]);
  const total = minerals.filter(m => save.combos[`${selected.id}-${m.id}`]).length;
  const unique=Object.keys(save.combos).length,completed=ores.filter(o=>minerals.every(m=>save.combos[`${o.id}-${m.id}`])).length,oreFound=Object.keys(save.ores).filter(k=>save.ores[k]>0).length,mineralFound=Object.keys(save.minerals).filter(k=>save.minerals[k]>0).length;
  const pagePairs=minerals.map(m=>({m,count:save.combos[`${selected.id}-${m.id}`]||0})).filter(x=>x.count),most=pagePairs.sort((a,b)=>b.count-a.count)[0],rarest=[...pagePairs].sort((a,b)=>a.m.weight-b.m.weight)[0];
  const discovered=Object.keys(save.combos).map(k=>{const p=k.lastIndexOf("-"),o=ores.find(x=>x.id===k.slice(0,p)),m=minerals.find(x=>x.id===k.slice(p+1));return o&&m?{o,m,odd:Math.max(...(Object.keys(biomeNames) as Biome[]).map(b=>Number.isFinite(odds(o,m,b))?odds(o,m,b):0))}:null}).filter(Boolean) as {o:Item;m:Item;odd:number}[];const globalRare=[...discovered].sort((a,b)=>b.odd-a.odd)[0];const wanted=save.huntTarget?(()=>{const p=save.huntTarget!.lastIndexOf("-");return `${ores.find(o=>o.id===save.huntTarget!.slice(0,p))?.name} + ${minerals.find(m=>m.id===save.huntTarget!.slice(p+1))?.name}`})():"No target pinned. Cowardice remains available.";
  return <section className="page album-page"><div className="page-head"><div><p className="eyebrow">CLASSIC → TBC → WOTLK</p><h2>VOLUME I <i>ALBUM</i></h2></div><div className="completion"><span>VOLUME COMPLETION</span><strong>{unique} <small>/ 225 · {(unique/225*100).toFixed(1)}%</small></strong></div></div><div className="volume-overview"><span><small>ORES</small>{oreFound}/15</span><span><small>MINERALS</small>{mineralFound}/15</span><span><small>COMPLETED PAGES</small>{completed}/15</span><span><small>MISSING</small>{225-unique}</span></div><div className="overview-highlights"><span><small>RAREST DISCOVERY</small>{globalRare?`${globalRare.o.name} + ${globalRare.m.name} · 1/${globalRare.odd}`:"Nothing worth mentioning yet."}</span><span><small>MOST WANTED</small>{wanted}</span></div>
    <div className="ore-tabs volume-tabs">{ores.map(o => {const n=minerals.filter(m=>save.combos[`${o.id}-${m.id}`]).length;return <button key={o.id} className={`${selected.id === o.id ? "selected" : ""} ${n===15?"complete":""}`} onClick={() => {setSelected(o);track("ore_page_opened",{ore_id:o.id,completion:n/15})}}><img className="ore-tab-art" src={oreAsset(o.id)} alt=""/><span>{o.name.replace(" Ore","")}<small>{n}/15 {n===15?"✓":""}</small></span></button>})}</div>
    <div className={`album-title milestone-${total} ${total===14?`last-one-${lastOneTier(save,selected.id)}`:""}`}><div><img className="ore-gem ore-sprite ore-sprite-album" src={oreAsset(selected.id)} alt=""/><div><p>{selected.rarity.toUpperCase()} ORE · {save.ores[selected.id]||0} MINED</p><h3>{selected.name} {total===15&&<b className="complete-stamp">PAGE COMPLETE</b>}</h3><small>{total===14?`${lastOneCopy(save,selected.id)} MISSING: ${minerals.find(m=>!save.combos[`${selected.id}-${m.id}`])?.name}.`:selected.note}</small><div className="page-stats">RAREST: {rarest?.m.name||"—"} · MOST DUPLICATED: {most?`${most.m.name} ×${most.count}`:"—"} · MISSING: {15-total}</div></div></div><strong>{total}<small>/15 · {Math.round(total/15*100)}%</small></strong></div>
    <div className="slots">{minerals.map((m, i) => { const key=`${selected.id}-${m.id}`, count=save.combos[key]||0; return <article key={m.id} className={count ? "found" : "locked"}><div className="slot-top"><span>0{i+1}</span><b className={`rarity ${m.rarity.toLowerCase()}`}>{count ? m.rarity.toUpperCase() : "UNKNOWN"}</b></div>{count?<img className="mineral-gem mineral-sprite mineral-sprite-album" src={mineralAsset(m.id)} alt=""/>:<div className="mineral-gem gem-art" style={{"--gem":"#2b2d2e"} as React.CSSProperties}/>}<h4>{count ? m.name : "UNDISCOVERED"}</h4><p>{count ? m.note : "Keep digging. It is definitely in there. Probably."}</p><footer>{count ? <><span>FOUND ×{count}</span><small>FIRST: DIG #{save.first[key]}</small></> : <span>???</span>}</footer></article>})}</div>
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
    <div className="wanted-list">{shown.map(r=><article className={r.found===14?`last-one last-one-${lastOneTier(save,r.ore.id)}`:""} key={r.ore.id}><header><img className="ore-gem ore-sprite ore-sprite-wanted" src={oreAsset(r.ore.id)} alt=""/><div><small>{r.found===14?lastOneCopy(save,r.ore.id):"INCOMPLETE PAGE"}</small><h3>{r.ore.name} <b>{r.found}/15 COLLECTED</b></h3></div><strong>{r.missing.length}<small>MISSING</small></strong></header><div className="missing-grid volume-missing">{r.missing.map(m=>{const target=`${r.ore.id}-${m.id}`,b=best(r.ore);return <div className={save.huntTarget===target?"pinned":""} key={m.id}><img className="wanted-gem mineral-sprite mineral-sprite-wanted" src={mineralAsset(m.id)} alt=""/><div className="wanted-specimen-copy"><em className={`rarity ${m.rarity.toLowerCase()}`}>{m.rarity.toUpperCase()}</em><strong>{m.name}</strong><small><b>{biomeNames[b]}</b><span>NATURAL ODDS · 1 IN {odds(r.ore,m,b)}</span></small></div><button aria-pressed={save.huntTarget===target} onClick={()=>onHunt(b,target)}>{save.huntTarget===target?"✓ TARGET PINNED":"PIN THIS SPECIMEN"}</button></div>})}</div><footer><span>BEST LOCATION <strong>{biomeNames[best(r.ore)]}</strong></span><button onClick={()=>{const m=[...r.missing].sort((a,b)=>a.weight-b.weight)[0];onHunt(best(r.ore),`${r.ore.id}-${m.id}`)}}>HUNT RAREST ON PAGE →</button></footer></article>)}</div>
  </section>
}

function Milestone({data,onClose,onAlbum}:{data:{ore:Item;level:number;missing?:Item;attempts:number};onClose:()=>void;onAlbum:()=>void}){
 return <div className={`milestone-modal level-${data.level}`}><div><p className="eyebrow">{data.level===15?"ALBUM PAGE COMPLETE":data.level===14?"ONE SPECIMEN REMAINS":data.level===12?"THE HUNT BEGINS":"PAGE MILESTONE"}</p><span className="big-gem" style={{"--gem":data.ore.color} as React.CSSProperties}>◆</span><h2>{data.ore.name} — {data.level}/15</h2>{data.level===15&&<div className="completion-row">{minerals.map(m=><img className="mineral-sprite mineral-sprite-completion" key={m.id} src={mineralAsset(m.id)} alt=""/>)}</div>}{data.missing?<><p>Your final missing specimen is <strong>{data.missing.name}</strong>.</p><small>Natural pairing odds: 1 in {odds(data.ore,data.missing,bestBiome(data.ore))} · Recommended: {biomeNames[bestBiome(data.ore)]}</small></>:<p>{data.level===15?`Completed after ${data.attempts} ${data.ore.name} deposits. Reward: permanent Volume I page stamp.`:data.level===12?"Three remain. Generic mining has now become personal.":data.level===10?"Double digits. You may be in too deep.":"Five found. Ten more opportunities for disappointment."}</p>}<div><button onClick={onAlbum}>{data.level===14?"HUNT THIS PAGE":"INSPECT PAGE"}</button><button onClick={onClose}>KEEP MINING</button></div></div></div>
}

function MineCompletion({data,digs,onContinue}:{data:{completed:Biome;next?:Biome};digs:number;onContinue:()=>void}){
 const destination=data.next||data.completed,v=biomeVisuals[destination],shaft=String(biomeOrder.indexOf(destination)+1).padStart(2,"0");
 return <div className={`mine-completion unlock-${destination}`} style={{"--completion-accent":v.accent,"--completion-secondary":v.secondary,"--completion-canvas":v.canvas,"--completion-card":v.card} as React.CSSProperties}>
   <div className="completion-strata" aria-hidden="true"/><section className="completion-certificate">
     <header><div className="completion-status"><span className="status-pulse"/>SYSTEM SURVEY AUTHORITY</div><p>EXTRACTION QUOTA COMPLETE · SHAFT {String(biomeOrder.indexOf(data.completed)+1).padStart(2,"0")}</p></header>
     <div className="completion-hero"><div className="completion-seal" aria-hidden="true"><span>◆</span><i>✓</i></div><div><small>{biomeNames[data.completed]}</small><h2>SURVEY <i>SATISFIED</i></h2><p>Native extraction requirements verified after <strong>{digs.toLocaleString()}</strong> total deposits.</p></div></div>
     <div className="completed-quota-strip" aria-label={`${biomeNames[data.completed]} completed extraction quotas`}>{biomePages[data.completed].map(id=>{const ore=ores.find(o=>o.id===id)!;return <div key={id}><img src={oreAsset(id)} alt=""/><span><strong>{ore.name.replace(" Ore","")}</strong><small>{oreQuota(id)} / {oreQuota(id)} EXTRACTED</small></span><b>✓</b></div>})}</div>
     <div className="completion-divider"><span>DESCENT AUTHORIZATION</span></div>
     <div className="next-mine-reveal"><div className="shaft-number"><small>SHAFT</small><strong>{shaft}</strong></div><div className="next-mine-copy"><small>{data.next?"NEW MINE ACCESS GRANTED":"VOLUME I SURVEY STATUS"}</small><h3>{data.next?biomeNames[data.next]:"PROGRESSION COMPLETE"}</h3><p>{data.next?v.flavor:"The mountain is out of excuses. The Album is not."}</p>{data.next&&<em>{distributionLabel(data.next)}</em>}</div><span className="descent-arrow" aria-hidden="true">↓</span></div>
     <footer><p>ALBUM COMBINATIONS AND TRUE ARTIFACTS REMAIN INDEPENDENT.</p><button onClick={onContinue}><small>{data.next?"BEGIN NEXT SHIFT":"SURVEY CLOSED"}</small>{data.next?`ENTER ${biomeNames[data.next]}`:"RETURN TO THE MOUNTAIN"}<span>→</span></button></footer>
   </section>
 </div>
}

function TrueArtifactArt({artifact,locked=false}:{artifact:TrueArtifact;locked?:boolean}){
  const [missing,setMissing]=useState(false);
  return <span className={`true-art-slot${locked?" locked-art":""}${artifact.id==="asoc"?" asoc-art":""}`} role={locked?"img":undefined} aria-label={locked?"Undiscovered TRUE Artifact silhouette":undefined}>
    <span className="true-art-crop">
      {locked&&!missing&&<span className="true-art-silhouette" style={{"--artifact-mask":`url(${artifact.image})`} as React.CSSProperties}/>}
      {!locked&&!missing&&<img className="true-art-img" src={artifact.image} alt="" onError={()=>setMissing(true)}/>}
      {missing && <span className={`true-art-placeholder${locked?" locked-placeholder":""}`} aria-hidden="true">◆{!locked&&<small>ARTWORK PENDING</small>}</span>}
      {locked&&<img className="true-mask-probe" src={artifact.image} alt="" onError={()=>setMissing(true)}/>}
    </span>
  </span>;
}

function TimedPeonBark({artifact,reducedMotion}:{artifact:TrueArtifact;reducedMotion:boolean}){
  const sequence=artifact.peonBarkSequence;
  const [visible,setVisible]=useState(1);
  useEffect(()=>{if(!sequence||reducedMotion)return;const timers=sequence.slice(1).map((beat,index)=>setTimeout(()=>setVisible(index+2),beat.delayMs));return()=>timers.forEach(clearTimeout)},[artifact.id,reducedMotion,sequence]);
  if(!sequence)return <div className="true-peon"><small>PEON</small><p>&ldquo;{artifact.peonBark}&rdquo;</p></div>;
  const shown=reducedMotion?sequence.length:visible;
  return <div className="true-peon true-peon-sequence"><small>PEON</small><div>{sequence.slice(0,shown).map((beat,index)=><p key={beat.text} className={index===shown-1?"current":"spoken"}>&ldquo;{beat.text}&rdquo;</p>)}</div></div>;
}

function TrueReveal({data,reducedMotion,onContinue}:{data:{artifact:TrueArtifact;digNumber:number};reducedMotion:boolean;onContinue:()=>void}){
  const [stage,setStage]=useState<"announcement"|"pause"|"shadow-form"|"ground"|"deep-pause"|"impossible"|"reveal">("announcement");
  const [canClose,setCanClose]=useState(false);
  useEffect(()=>{
    const timers:ReturnType<typeof setTimeout>[]=[];
    const after=(delay:number,next:()=>void)=>timers.push(setTimeout(next,delay));
    if(data.artifact.ultimate){
      after(reducedMotion?180:1400,()=>setStage("pause"));
      after(reducedMotion?340:2400,()=>setStage("ground"));
      after(reducedMotion?520:3900,()=>setStage("deep-pause"));
      after(reducedMotion?700:5400,()=>setStage("impossible"));
      after(reducedMotion?900:6900,()=>setStage("reveal"));
      after(reducedMotion?1100:7900,()=>setCanClose(true));
    }else if(data.artifact.id==="shadow"){
      after(reducedMotion?160:950,()=>setStage("pause"));
      after(reducedMotion?300:1750,()=>setStage("shadow-form"));
      after(reducedMotion?460:2900,()=>setStage("reveal"));
      after(reducedMotion?620:4100,()=>setCanClose(true));
    }else{
      after(reducedMotion?200:1150,()=>setStage("pause"));
      after(reducedMotion?400:2200,()=>setStage("reveal"));
      after(reducedMotion?500:data.artifact.peonBarkSequence?5700:2700,()=>setCanClose(true));
    }
    return ()=>timers.forEach(clearTimeout);
  },[data.artifact.ultimate,data.artifact.peonBarkSequence,reducedMotion]);
  const stageAnnouncement=stage==="announcement"?data.artifact.announcement:stage==="ground"?"GROUND INSTABILITY DETECTED":stage==="impossible"?"...IMPOSSIBLE.":null;
  return <div className={`true-reveal stage-${stage} theme-${data.artifact.theme||"shadow"}`} role="status" aria-live="assertive">
    <div className="true-reveal-card">
      {stageAnnouncement && <p className="true-alert">{stageAnnouncement}</p>}
      {(stage==="pause"||stage==="deep-pause") && <div className="true-pause-mark" aria-hidden="true">◆</div>}
      {stage==="shadow-form" && <div className="shadow-pre-reveal" aria-label="An unidentified quadrupedal silhouette"><TrueArtifactArt artifact={data.artifact} locked/></div>}
      {stage==="reveal" && <>
        <p className="true-classification">TRUE ARTIFACT</p>
        <h2>{data.artifact.name}</h2>
        <TrueArtifactArt artifact={data.artifact}/>
        <div className="true-reveal-copy">
          {data.artifact.instruction&&<p className="true-instruction">{data.artifact.instruction}</p>}
          <p className="true-lore">{data.artifact.lore}</p>
          <TimedPeonBark artifact={data.artifact} reducedMotion={reducedMotion}/>
          {data.artifact.rewardSkinId&&<div className="true-cosmetic-unlock"><small>PERMANENT COSMETIC REWARD</small><strong>PICKAXE SKIN UNLOCKED — ALIJA&apos;S SHOVEL</strong></div>}
          {data.artifact.systemResponse&&<div className="true-system"><small>SYSTEM</small><p>{data.artifact.systemResponse}</p></div>}
          <p className="true-meta">FOUND AFTER {data.digNumber.toLocaleString()} DIGS</p>
          <button className="continue" disabled={!canClose} onClick={onContinue}>ARCHIVE IT <span>→</span></button>
        </div>
      </>}
    </div>
  </div>;
}

function TrueArtifactInspection({artifact,count,first,onClose}:{artifact:TrueArtifact;count:number;first?:number;onClose:()=>void}){
  useEffect(()=>{const close=(event:KeyboardEvent)=>{if(event.key==="Escape")onClose()};addEventListener("keydown",close);return()=>removeEventListener("keydown",close)},[onClose]);
  return <div className={`true-inspection theme-${artifact.theme||"shadow"}`} role="dialog" aria-modal="true" aria-label={`${artifact.name} archive entry`}>
    <section className="true-inspection-card">
      <button className="true-inspection-close" onClick={onClose} aria-label="Close artefact inspection">×</button>
      <p className="true-inspection-kicker">TRUE ARTEFACT · VERIFIED ARCHIVE ENTRY</p>
      <h2>{artifact.name}</h2>
      <TrueArtifactArt artifact={artifact}/>
      <div className="true-inspection-copy">
        {artifact.instruction&&<p className="true-inspection-instruction">{artifact.instruction}</p>}
        <p className="true-inspection-lore">{artifact.lore}</p>
        <div className="true-inspection-peon"><small>PEON</small><p>&ldquo;{artifact.peonBark}&rdquo;</p></div>
        <footer><span>ARCHIVED ×{count}</span>{first!==undefined&&<small>FIRST DISCOVERED AFTER {first.toLocaleString()} DIGS</small>}</footer>
      </div>
    </section>
  </div>;
}

function TrueArchive({save}:{save:Save}){
  const [selected,setSelected]=useState<TrueArtifact|null>(null);
  const archiveArtifacts=trueArtifactPool.filter(a=>a.id!==ASOC_TICKET_ID);
  const owned=archiveArtifacts.filter(a=>save.trueArtifacts[a.id]);
  const totalFound=Object.values(save.trueArtifacts).reduce((s,n)=>s+n,0);
  const equipped=equippedMiningTool(save),effectiveChance=artifactChanceForDig(save.pendingArtifactModifier,equipped.trueArtifactChance),asocChance=asocTicketChanceForDig(save.equippedTool,save.gameCompleted);
  return <><section className="page true-archive-page">
    <div className="page-head"><div><p className="eyebrow">NOT GEOLOGY. SOMETHING ELSE.</p><h2>TRUE <i>ARTEFACTS</i></h2></div><div className="completion"><span>ARTEFACTS FOUND</span><strong>{owned.length}<small> / {archiveArtifacts.length}</small></strong></div></div>
    <p className="true-archive-intro">Common through Legendary belongs to the mountain. These do not. Equipped tool: <strong>{equipped.name}</strong>. Current ordinary TRUE Artifact chance: <strong>{(effectiveChance*100).toFixed(2)}%</strong> · approximately 1 in {Math.round(1/effectiveChance).toLocaleString()}. Forbidden Tunnel modifiers apply only to the ordinary roll on the next completed dig. ASOC Tickets secured: <strong>{save.asocTickets}</strong>. The Ticket is an endgame condition, not an archive collectible. Current run: <strong>{save.gameCompleted?"SHIFT COMPLETE":asocChance?`${(ASOC_TICKET_CHANCE*100).toFixed(1)}% · MOUNTAIN FUCKER ACTIVE`:"INVITATION UNAVAILABLE"}</strong>. No pity system.{totalFound?` Total anomalies logged: ${totalFound}.`:""}</p>
    <div className="true-grid">{archiveArtifacts.map(a=>{const count=save.trueArtifacts[a.id]||0,first=save.trueFirst[a.id];return <article key={a.id} className={`${count?"found inspectable":"locked"}${a.ultimate?" ultimate":""}`}>
      <TrueArtifactArt artifact={a} locked={!count}/>
      {count&&a.ultimate&&<strong className="true-ultimate-label">ULTIMATE TRUE ARTIFACT</strong>}
      <h3>{count?a.name:"???"}</h3>
      <p>{count?a.lore:<em>&ldquo;{a.lockedClue}&rdquo;</em>}</p>
      {count&&a.ultimate&&<div className="true-issued"><span>STATUS: ISSUED</span><strong>HOLDER: YOU</strong></div>}
      {count&&a.instruction&&<p className="true-archive-instruction">{a.instruction}</p>}
      <footer>{count?<><span>FOUND ×{count}</span>{first!==undefined&&<small>FOUND AFTER {first.toLocaleString()} DIGS</small>}</>:<span>{a.ultimate?"STATUS: NOT ISSUED":"NOT DISCOVERED"}</span>}</footer>
      {count>0&&<button className="true-card-inspect" onClick={()=>setSelected(a)} aria-label={`View ${a.name}`}/>}
    </article>})}</div>
  </section>{selected&&<TrueArtifactInspection artifact={selected} count={save.trueArtifacts[selected.id]||0} first={save.trueFirst[selected.id]} onClose={()=>setSelected(null)}/>}</>;
}

function Records({ save, onReset, session }: { save: Save; onReset: () => void; session: {digs:number;misses:number;veins:number;newSpecimens:number;drought:number;longestDrought:number} }) {
  const dupes = Object.values(save.combos).reduce((s,n)=>s+Math.max(0,n-1),0);
  const most=Object.entries(save.combos).sort((a,b)=>b[1]-a[1])[0];const mostOre=Object.entries(save.ores).sort((a,b)=>b[1]-a[1])[0];const complete=ores.filter(o=>minerals.every(m=>save.combos[`${o.id}-${m.id}`])).length;
  const leastOre=Object.entries(save.ores).filter(x=>x[1]>0).sort((a,b)=>a[1]-b[1])[0];
  return <section className="page records-page"><div className="page-head"><div><p className="eyebrow">VOLUME I · HARD EVIDENCE OF POOR PRIORITIES</p><h2>YOUR <i>RECORDS</i></h2></div></div>
    <div className="today-summary"><span>TODAY</span><strong>{session.digs} DIGS · {session.newSpecimens} NEW · {session.veins} VEIN{session.veins===1?"":"S"} · {session.misses} MISS{session.misses===1?"":"ES"} · LONGEST DROUGHT {session.longestDrought}{session.drought>0?` · CURRENT DROUGHT ${session.drought}`:""}</strong></div>
    <div className="record-grid"><article><span>TOTAL STRIKES</span><strong>{save.strikes}</strong><p>{save.distance.toFixed(1)}m of entirely necessary depth.</p></article><article><span>DEPOSITS / UNIQUE</span><strong>{save.digs} / {Object.keys(save.combos).length}</strong><p>{(Object.keys(save.combos).length/225*100).toFixed(1)}% of Volume I.</p></article><article><span>DUPLICATES / WORST DROUGHT</span><strong>{dupes} / {save.longestStreak}</strong><p>Character-building, allegedly.</p></article><article><span>TOTAL ROCKS ASSAULTED</span><strong>{save.strikes.toLocaleString()}</strong><p>{save.misses} whiffed entirely. Geology remembers.</p></article><article><span>TOTAL DARK IRON SUFFERED</span><strong>{save.ores.dark||0}</strong><p>Dignity already left.</p></article><article><span>TITANIUM MINED</span><strong>{save.ores.titanium||0}</strong><p>Try to act normal.</p></article><article><span>COMPLETED PAGES</span><strong>{complete} / 15</strong><p>Actual evidence of progress.</p></article><article><span>DUST EARNED / SPENT</span><strong>{save.dustEarned} / {save.dustSpent}</strong><p>Duplicates, ground into fashion.</p></article><article><span>MOST DUPLICATED</span><strong>{most?most[1]:0}×</strong><p>{most?most[0].replace("-"," + "):"Nothing yet"}</p></article><article><span>MOST MINED ORE</span><strong>{mostOre?mostOre[1]:0}×</strong><p>{mostOre?ores.find(o=>o.id===mostOre[0])?.name:"Nothing yet"}</p></article><article><span>LEAST MINED DISCOVERED ORE</span><strong>{leastOre?leastOre[1]:0}×</strong><p>{leastOre?ores.find(o=>o.id===leastOre[0])?.name:"Nothing yet"}</p></article></div><h3 className="ach-title">ACHIEVEMENTS <span>{save.achievements.length}/{achievements.length}</span></h3><div className="ach-list">{achievements.map(a=><article className={save.achievements.includes(a.id)?"earned":""} key={a.id}><span>◆</span><div><strong>{save.achievements.includes(a.id)?a.name:"LOCKED"}</strong><p>{a.text}</p></div></article>)}</div><button className="reset" onClick={onReset}>ERASE SAVE DATA</button></section>;
}

function Onboarding({onDone}:{onDone:()=>void}){return <div className="onboarding"><div><img className="onboarding-logo" src="/assets/brand/ore-whore-logo-primary.webp" alt="ORE WHORE — Property of the Department"/><p className="eyebrow">VOLUME I · CLASSIC → TBC → WOTLK</p><h1>DIG. CLANK. CRACK. <i>COLLECT.</i></h1><p>Fifteen ores. Fifteen minerals. 225 reasons not to stop.</p><button onClick={onDone}>START MINING <span>→</span></button><small>Click the rock or press Space. That is genuinely it.</small></div></div>}

function HuntRecords({save}:{save:Save}){const top=Object.entries(save.huntCounts).sort((a,b)=>b[1]-a[1])[0];const label=top?(()=>{const p=top[0].lastIndexOf("-");return `${ores.find(o=>o.id===top[0].slice(0,p))?.name} + ${minerals.find(m=>m.id===top[0].slice(p+1))?.name}`})():"No target repeatedly hunted";return <div className="hunt-records"><article><small>LONGEST NEW STREAK</small><strong>{save.longestNewStreak}</strong><span>fresh combinations in a row</span></article><article><small>MOST HUNTED TARGET</small><strong>{top?`${top[1]}×`:"—"}</strong><span>{label}</span></article><article><small>LONGEST TARGET HUNT</small><strong>{save.longestHunt}</strong><span>digs from pin to acquisition</span></article><article><small>EMPTY DIGS</small><strong>{save.emptyDigs}</strong><span>{save.digs?`${(save.emptyDigs/save.digs*100).toFixed(1)}% of all attempts`:"the mountain is saving them up"}</span></article></div>}

function VolumeRewards({save}:{save:Save}){const pct=Object.keys(save.combos).length/225*100;return <div className="volume-rewards"><b>VOLUME I REWARDS</b>{[[10,"RUSTBITE"],[25,"GILDED"],[50,"MENACE"],[75,"KHORIUM"],[90,"TITANIUM"],[100,"ORE WHORE"]].map(x=><span className={pct>=Number(x[0])?"earned":""} key={x[0]}><strong>{x[0]}%</strong><small>{x[1]}</small></span>)}</div>}

const craftingName=(id:string)=>ores.find(o=>o.id===id)?.name||minerals.find(m=>m.id===id)?.name||processedMaterials.find(m=>m.id===id)?.name||id;
const recipeUnlocked=(save:Save,unlock?:RecipeUnlock)=>!unlock||(!unlock.mine||save.unlockedBiomes.includes(unlock.mine))&&(!unlock.tool||save.ownedTools.includes(unlock.tool));
function Forge({save,setSave}:{save:Save;setSave:React.Dispatch<React.SetStateAction<Save>>}){
  const [notice,setNotice]=useState<{id:number;kind:"success"|"error"|"info";title:string;detail:string}|null>(null);
  const [confirmation,setConfirmation]=useState<{kind:"smelt"|"forge"|"auto-forge";id:string}|null>(null);
  const [selectedTool,setSelectedTool]=useState(()=>forgedItems.find(t=>!save.ownedTools.includes(t.id))?.id||save.equippedTool);
  const transactionBusy=useRef(false);
  useEffect(()=>{if(!notice)return;const timer=setTimeout(()=>setNotice(null),2600);return()=>clearTimeout(timer)},[notice]);
  const notify=(kind:"success"|"error"|"info",title:string,detail:string)=>setNotice(current=>({id:(current?.id||0)+1,kind,title,detail}));
  const missing=(inventory:Record<string,number>,inputs:{id:string;quantity:number}[])=>inputs.filter(i=>(inventory[i.id]||0)<i.quantity).map(i=>`${craftingName(i.id)} ${inventory[i.id]||0}/${i.quantity}`).join(" · ");
  const resourceState=(s:Save):ResourceState=>({oreResources:s.oreResources,mineralResources:s.mineralResources,processedResources:s.processedResources,ownedTools:s.ownedTools,toolTier:s.toolTier});
  const runMetallurgy=(id:string)=>{if(transactionBusy.current)return;const recipe=metallurgyRecipes.find(r=>r.id===id)!,bulk=["assembly-saronite","assembly-titanium"].includes(id),count=bulk?maxCraftable(save.oreResources,recipe.inputs):1;if(!smeltBatchAtomic(resourceState(save),recipe,count))return notify("error","TRANSACTION CANCELLED","Resources changed before confirmation. Nothing was consumed.");transactionBusy.current=true;setSave(s=>{const liveCount=bulk?maxCraftable(s.oreResources,recipe.inputs):1,next=smeltBatchAtomic(resourceState(s),recipe,liveCount);return next?{...s,oreResources:next.oreResources,processedResources:next.processedResources}:s});setConfirmation(null);track("resource_processed",{recipe_id:id,inputs:recipe.inputs,output_id:recipe.outputId,quantity:recipe.outputQuantity*count,batch_count:count});notify("success",`${recipe.operation} COMPLETE`,`+${recipe.outputQuantity*count} ${craftingName(recipe.outputId)} moved to the Alloy Stash in one batch.`);setTimeout(()=>{transactionBusy.current=false},0)};
  const runForge=(id:string)=>{if(transactionBusy.current)return;const recipe=forgeRecipes.find(r=>r.id===id)!,tool=forgedItems.find(t=>t.id===recipe.resultingItemId)!;if(!forgeAtomic(resourceState(save),recipe))return notify("error","TRANSACTION CANCELLED","Sequence or inventory changed. Nothing was consumed.");transactionBusy.current=true;setSave(s=>{const next=forgeAtomic(resourceState(s),recipe);return next?{...s,processedResources:next.processedResources,mineralResources:next.mineralResources,ownedTools:next.ownedTools,toolTier:next.toolTier,equippedTool:tool.id}:s});setConfirmation(null);track("tool_forged",{tool_id:tool.id,tier:tool.tier,biome:save.biome,processed_spent:recipe.processedInputs,minerals_spent:recipe.mineralInputs,digs:save.digs});notify("success",`${tool.name} FORGED`,`${tool.technicalName} is now equipped. Cosmetic model unchanged. Mining impact ${tool.damage.toFixed(2)}× at ${tool.actionDurationMs}ms.`);setTimeout(()=>{transactionBusy.current=false},0)};
  const runAutoForge=(id:string)=>{if(transactionBusy.current)return;const recipe=forgeRecipes.find(r=>r.id===id)!,tool=forgedItems.find(t=>t.id===recipe.resultingItemId)!;if(!forgeWithPrerequisitesAtomic(resourceState(save),recipe))return notify("error","TRANSACTION CANCELLED","The dependency chain or inventory changed. Nothing was consumed.");transactionBusy.current=true;setSave(s=>{const next=forgeWithPrerequisitesAtomic(resourceState(s),recipe);return next?{...s,oreResources:next.oreResources,processedResources:next.processedResources,mineralResources:next.mineralResources,ownedTools:next.ownedTools,toolTier:next.toolTier,equippedTool:tool.id}:s});setConfirmation(null);track("tool_auto_forged",{tool_id:tool.id,tier:tool.tier,digs:save.digs});notify("success",`${tool.name} BUILT`,"All required refining and alloying completed in one atomic workshop order. Tool equipped.");setTimeout(()=>{transactionBusy.current=false},0)};
  const current=equippedMiningTool(save);
  const selectedSkin=toolSkin(save.toolSkinId,save.unlocks);
  const pathTool=forgedItems.find(t=>t.id===selectedTool)||current,pathRecipe=forgeRecipes.find(r=>r.resultingItemId===pathTool.id),pathOpen=!pathRecipe||recipeUnlocked(save,pathRecipe.unlock),pathPlan=pathRecipe&&pathOpen?planForgePrerequisites(resourceState(save),pathRecipe):null,pathReady=!!pathPlan&&canAfford(save.oreResources,pathPlan.oreInputs)&&canAfford(save.mineralResources,pathRecipe!.mineralInputs);
  const RecipeCard=({id}:{id:string})=>{const r=metallurgyRecipes.find(x=>x.id===id)!,open=recipeUnlocked(save,r.unlock),ready=open&&canAfford(save.oreResources,r.inputs);const act=()=>{track("recipe_viewed",{recipe_id:r.id,ready,missing:missing(save.oreResources,r.inputs)});if(!open)return notify("error","MACHINE LOCKED",`Reach the ${r.unlock?.mine?.toUpperCase()} MINE to use this station.`);if(!ready)return notify("error","NOT ENOUGH ROCK",`Missing: ${missing(save.oreResources,r.inputs)}.`);setConfirmation({kind:"smelt",id:r.id})};return <article className={`machine-recipe ${!open?"locked":""}`}><header><span>{r.operation}</span><strong>{r.name}</strong></header><div className="recipe-equation">{r.inputs.map(i=><b key={i.id}>{craftingName(i.id)} ×{i.quantity}</b>)}<i>→</i><em>{craftingName(r.outputId)} ×{r.outputQuantity}</em></div><button className={!ready?"unavailable":""} aria-disabled={!ready} onClick={act}>{open?(ready?r.operation:"INSUFFICIENT ORE"):`LOCKED · ${r.unlock?.mine?.toUpperCase()} MINE`}</button></article>};
  return <section className="forge-page"><div className="workshop-smoke" aria-hidden="true"/><div className="workshop-header"><aside className="goblin-corner" aria-hidden="true"><span className="goblin-head">⌁</span><p>PEON SMART.<br/>PEON BUILD.<br/>PEON DIG DEEP.<br/><b>ZUG ZUG!</b></p></aside><div className="workshop-sign"><span>PEON TECHNOLOGY</span><small>IF IT BONKS, IT WORKS.</small></div><div className="equipped-board equipped-loadout"><div className="loadout-technology"><span>TECHNOLOGY · GAMEPLAY</span><strong>{current.name}</strong><small>{current.technicalName}</small><ToolArt tool={current}/></div><div className="loadout-model"><span>MODEL · APPEARANCE</span><strong>{selectedSkin.name}</strong><small>{selectedSkin.technicalName}</small><img src={selectedSkin.artwork} alt=""/></div><footer><b>MODE <em>{current.inputMode.toUpperCase()}</em></b><b>ACTION <em>{current.actionDurationMs}ms</em></b><b>IMPACT <em>{current.damage.toFixed(2)}×</em></b></footer></div></div>
    <div className="equipped-artifact-readout"><small>EFFECTIVE TRUE ARTEFACT CHANCE</small><strong>{(artifactChanceForDig(save.pendingArtifactModifier,current.trueArtifactChance)*100).toFixed(2)}%</strong><span>{save.pendingArtifactModifier&&!save.pendingArtifactModifier.consumed?"FORBIDDEN TUNNEL MODIFIER · NEXT COMPLETED DIG":`${current.name} · EQUIPPED TOOL RATE`}</span></div>
    <section className="stock-rack"><h3>SPENDABLE ORE STOCK</h3><div className="material-ledger raw-ledger">{ores.map(o=><article key={o.id}><img src={oreAsset(o.id)} alt=""/><span>{o.name.replace(" Ore","")}</span><strong>{save.oreResources[o.id]||0}</strong></article>)}</div></section>
    <section className="stock-rack mineral-stock-rack"><h3>SPENDABLE MINERAL COMPONENTS</h3><div className="material-ledger raw-ledger">{minerals.map(m=><article key={m.id}><img src={mineralAsset(m.id)} alt=""/><span>{m.name}</span><strong>{save.mineralResources[m.id]||0}</strong></article>)}</div></section>
    <div className="metallurgy-workbench"><section className="machine-station refine-station"><h3>REFINE <small>ONE ORE → METAL</small></h3><div className="recipe-grid">{metallurgyRecipes.filter(r=>r.operation==="REFINE").map(r=><RecipeCard id={r.id} key={r.id}/>)}</div></section><span className="bench-arrow" aria-hidden="true">➜</span><section className="machine-station alloy-station"><h3>ALLOY <small>COMBINE METALS → ALLOY</small></h3><div className="recipe-grid">{metallurgyRecipes.filter(r=>r.operation==="ALLOY").map(r=><RecipeCard id={r.id} key={r.id}/>)}</div></section><aside className="forge-blueprint"><h3>FORGE</h3><strong>USE ALLOYS TO MAKE STUFF</strong><div className="blueprint-doodle">◆ → ⚒ → ⛏</div><ol><li>Smelt metals in furnace.</li><li>Mix &apos;em up, make fancy alloys.</li><li>Smash &apos;em good. Make tool.</li><li>Go dig. Repeat.</li></ol><b>DON&apos;T OVERTHINK IT.</b></aside></div>
    <section className="alloy-stash"><h3>PROCESSED RESOURCE STASH</h3><div className="material-ledger processed-ledger">{processedMaterials.map(m=><article key={m.id}><span>{m.name}<small>{m.description}</small></span><strong>{save.processedResources[m.id]||0}</strong></article>)}</div></section>
    {pathRecipe&&<section className="upgrade-path"><header><div><small>SELECTED TECHNOLOGY PATH · TIER {pathTool.tier}</small><h3>{pathTool.name}</h3><p>{pathTool.technicalName}</p></div><strong className={pathReady?"ready":"blocked"}>{save.ownedTools.includes(pathTool.id)?"OWNED":pathReady?"WORKSHOP READY":pathOpen?"MATERIALS MISSING":"BLUEPRINT LOCKED"}</strong></header><div className="upgrade-path-grid"><div><span>PROCESSED PARTS</span>{pathRecipe.processedInputs.map(i=>{const have=save.processedResources[i.id]||0;return <b className={have>=i.quantity?"complete":""} key={i.id}>{craftingName(i.id)} <em>{Math.min(have,i.quantity)}/{i.quantity}</em></b>})}</div><div><span>MINERAL COMPONENTS</span>{pathRecipe.mineralInputs.map(i=>{const have=save.mineralResources[i.id]||0;return <b className={have>=i.quantity?"complete":""} key={i.id}>{craftingName(i.id)} <em>{Math.min(have,i.quantity)}/{i.quantity}</em></b>})}</div><div><span>RAW ORE FOR MISSING PARTS</span>{pathPlan?(pathPlan.oreInputs.length?pathPlan.oreInputs.map(i=>{const have=save.oreResources[i.id]||0;return <b className={have>=i.quantity?"complete":""} key={i.id}>{craftingName(i.id)} <em>{have}/{i.quantity}</em></b>}):<b className="complete">NO SMELTING REQUIRED <em>✓</em></b>):<b>PREVIOUS TECHNOLOGY REQUIRED</b>}</div></div><footer><p>{pathPlan?.crafts.length?`Workshop will run ${pathPlan.crafts.map(c=>`${craftingName(c.outputId)} ×${c.quantity}`).join(" · ")} and forge the tool in one transaction.`:"Existing processed stock will be used before any raw ore."}</p><button disabled={!pathReady||save.ownedTools.includes(pathTool.id)} onClick={()=>setConfirmation({kind:"auto-forge",id:pathRecipe.id})}>{save.ownedTools.includes(pathTool.id)?"ALREADY OWNED":pathReady?"BUILD ALL PREREQUISITES + FORGE":"COLLECT MISSING MATERIALS"}</button></footer></section>}
    <section className="skin-locker"><h3>PICKAXE RACK <small>MODEL ONLY · TECHNOLOGY STATS STAY EQUIPPED</small></h3><div className="skin-rack">{toolSkins.filter(skin=>isToolSkinUnlocked(skin,save.unlocks)).map(skin=><article key={skin.id} className={`${save.toolSkinId===skin.id?"selected":""} skin-card-${skin.silhouette}`}><div className="skin-preview"><img src={skin.artwork} alt=""/></div><span>{skin.unlockArtifactId?"TRUE ARTEFACT REWARD":"COSMETIC MODEL"}</span><strong>{skin.name}</strong><small className="skin-technical">{skin.technicalName}</small><p>{skin.flavor}</p>{skin.barkSequence?<blockquote>{skin.barkSequence.map((beat,index)=><span key={beat.text}>PEON: “{beat.text}”{index<skin.barkSequence!.length-1&&<i>…</i>}</span>)}</blockquote>:skin.bark&&<blockquote>PEON: “{skin.bark}”</blockquote>}<button onClick={()=>{setSave(s=>({...s,toolSkinId:skin.id}));notify("success",`${skin.name} SELECTED`,`Appearance changed. ${current.name} technology and all gameplay stats remain equipped.`)}}>{save.toolSkinId===skin.id?"ON THE RACK":"USE THIS MODEL"}</button></article>)}</div></section>
    <section className="arsenal"><h3>FORGED MINING TOOLS <small>BIGGER = BETTER</small></h3><div className="tool-progression">{forgedItems.map(tool=>{
      const owned=save.ownedTools.includes(tool.id),recipe=forgeRecipes.find(r=>r.resultingItemId===tool.id),open=!recipe||recipeUnlocked(save,recipe.unlock);
      const ready=!!recipe&&open&&canAfford(save.processedResources,recipe.processedInputs)&&canAfford(save.mineralResources,recipe.mineralInputs);
      const act=()=>{setSelectedTool(tool.id);if(owned){setSave(s=>({...s,equippedTool:tool.id}));return notify("success",tool.name,save.equippedTool===tool.id?"Already equipped. Peon confirms bonking readiness.":`${tool.technicalName} equipped. Cosmetic unchanged. ${tool.damage.toFixed(2)}× impact at ${tool.actionDurationMs}ms.`)}if(!open)return notify("error","BLUEPRINT LOCKED","Forge the previous tool and reach the required mine first.");if(!ready&&recipe){track("recipe_blocked",{recipe_id:recipe.id,processed_missing:missing(save.processedResources,recipe.processedInputs),mineral_missing:missing(save.mineralResources,recipe.mineralInputs)});return notify("info","UPGRADE PATH SELECTED","Exact shortages and forgeable prerequisites are shown above the technology rack.")}if(recipe){track("recipe_viewed",{recipe_id:recipe.id,ready:true});setConfirmation({kind:"forge",id:recipe.id})}};
      return <article className={`${owned?"owned":""} ${save.equippedTool===tool.id?"equipped":""} ${selectedTool===tool.id?"path-selected":""} ${!open?"planned":""}`} key={tool.id}><span>TIER {tool.tier} · {tool.inputMode.toUpperCase()}</span><h3>{tool.name}</h3><h4>{tool.technicalName}</h4><ToolArt tool={tool}/><div className="tool-stats"><b>{tool.inputMode.toUpperCase()}</b><b>{tool.actionDurationMs}ms</b><b>{tool.damage.toFixed(2)}×</b><b className="tool-artifact-chance">TRUE {(tool.trueArtifactChance*100).toFixed(2)}%</b></div>{recipe&&open?<div className="tool-cost">{recipe.processedInputs.map(i=><b key={i.id}>{craftingName(i.id)} ×{i.quantity}</b>)}{recipe.mineralInputs.map(i=><b className="mineral-cost" key={i.id}>{craftingName(i.id)} ×{i.quantity}</b>)}</div>:<div className="tool-cost"><b>{tool.tier===0?"STARTING TOOL":"RECIPE REVEALS AFTER PREVIOUS TIER"}</b></div>}<button className={!owned&&!ready?"unavailable":""} aria-disabled={!owned&&!ready} onClick={act}>{save.equippedTool===tool.id?"EQUIPPED":owned?"EQUIP":open?(ready?"CRAFT":"VIEW UPGRADE PATH"):"🔒 BLUEPRINT LOCKED"}</button></article>
    })}</div></section>
    <div className="workshop-clutter" aria-hidden="true"><span>SCRAP</span><b>⚙</b><i>WRENCH GOBLIN</i><em>BOOM!</em></div>{notice&&<div key={notice.id} className={`forge-notice ${notice.kind}`} role="status" aria-live="assertive"><span>{notice.kind==="success"?"✓":notice.kind==="error"?"!":"?"}</span><div><strong>{notice.title}</strong><small>{notice.detail}</small></div></div>}
    {confirmation&&<CraftConfirmation save={save} action={confirmation} onCancel={()=>setConfirmation(null)} onConfirm={()=>confirmation.kind==="smelt"?runMetallurgy(confirmation.id):confirmation.kind==="auto-forge"?runAutoForge(confirmation.id):runForge(confirmation.id)}/>} 
  </section>
}

function CraftConfirmation({save,action,onCancel,onConfirm}:{save:Save;action:{kind:"smelt"|"forge"|"auto-forge";id:string};onCancel:()=>void;onConfirm:()=>void}){
  const smelt=action.kind==="smelt"?metallurgyRecipes.find(r=>r.id===action.id):undefined,forge=action.kind==="forge"?forgeRecipes.find(r=>r.id===action.id):undefined,tool=forge?forgedItems.find(t=>t.id===forge.resultingItemId):undefined;
  const batch=smelt&&["assembly-saronite","assembly-titanium"].includes(smelt.id)?maxCraftable(save.oreResources,smelt.inputs):1;
  const autoPlan=action.kind==="auto-forge"&&forge?planForgePrerequisites({oreResources:save.oreResources,mineralResources:save.mineralResources,processedResources:save.processedResources,ownedTools:save.ownedTools,toolTier:save.toolTier},forge):null;
  const rows=smelt?smelt.inputs.map(i=>({i:{...i,quantity:i.quantity*batch},stock:save.oreResources[i.id]})):action.kind==="auto-forge"&&autoPlan?[...autoPlan.oreInputs.map(i=>({i,stock:save.oreResources[i.id]})),...forge!.mineralInputs.map(i=>({i,stock:save.mineralResources[i.id]})),...autoPlan.processedFromStock.map(i=>({i,stock:save.processedResources[i.id]}))]:[...(forge?.processedInputs||[]).map(i=>({i,stock:save.processedResources[i.id]})),...(forge?.mineralInputs||[]).map(i=>({i,stock:save.mineralResources[i.id]}))];
  return <div className="craft-confirm-overlay" role="dialog" aria-modal="true" aria-label="Confirm resource transaction"><section className="craft-confirm"><p>GOBLIN TRANSACTION CONTROL</p><h2>{smelt?smelt.name:`FORGE ${tool?.name}`}</h2>{batch>1&&<div className="craft-batch-notice"><small>INDUSTRIAL BATCH</small><strong>MAXIMUM AFFORDABLE RUN ×{batch}</strong></div>}{autoPlan&&<div className="craft-batch-notice"><small>COMPLETE DEPENDENCY CHAIN</small><strong>{autoPlan.crafts.length} WORKSHOP RUN{autoPlan.crafts.length===1?"":"S"} + FINAL FORGE</strong></div>}<div className="craft-consumption"><header><span>MATERIAL</span><span>CURRENT</span><span>AFTER</span></header>{rows.map(({i,stock})=><div key={i.id}><strong>{craftingName(i.id)}</strong><span>{stock||0}</span><b>{(stock||0)-i.quantity}</b></div>)}</div><div className="craft-product"><small>PRODUCT CREATED</small><strong>{smelt?`${craftingName(smelt.outputId)} ×${smelt.outputQuantity*batch}`:`TIER ${tool?.tier} · ${tool?.name}`}</strong></div><footer><button onClick={onCancel}>CANCEL</button><button className="confirm" onClick={onConfirm}>{batch>1?`BUILD ALL ×${batch}`:autoPlan?"RUN CHAIN & FORGE":"CONFIRM & CONSUME"}</button></footer></section></div>;
}

// The rusty technology card uses the canonical-rock-bonker artwork via its stable icon path.
function ToolArt({tool}:{tool:(typeof forgedItems)[number]}){return <span className={`tool-art tool-art-${tool.tier} ${tool.mode} ${tool.id==="rusty-pickaxe"?"canonical-tool-art":""}`} aria-label={`${tool.name} artwork`} role="img">{tool.id==="rusty-pickaxe"?<img src={tool.icon} alt=""/>:<><i/><b/><em/></>}</span>}

function More({save,setSave,onHelp}:{save:Save;setSave:React.Dispatch<React.SetStateAction<Save>>;onHelp:()=>void}){
 const download=(name:string,data:unknown)=>{const a=document.createElement("a");a.href=URL.createObjectURL(new Blob([JSON.stringify(data,null,2)],{type:"application/json"}));a.download=name;a.click();URL.revokeObjectURL(a.href)};
 const buy=(id:string,cost:number)=>setSave(s=>s.unlocks.includes(id)||s.dust<cost?s:{...s,dust:s.dust-cost,dustSpent:s.dustSpent+cost,unlocks:[...s.unlocks,id],equipped:id});
 const importSave=(f:File)=>{const reader=new FileReader();reader.onload=()=>{try{const x=JSON.parse(String(reader.result));if(!x||typeof x.digs!=="number"||typeof x.combos!=="object")throw 0;setSave(migrate(x));alert("Save imported and migrated to Volume I.")}catch{alert("That save is malformed or incompatible. Your current save is untouched.")}};reader.readAsText(f)};
 return <section className="page more-page"><div className="page-head"><div><p className="eyebrow">COSMETICS, CONTROLS, DAMAGE CONTROL</p><h2>MINER <i>QUARTERS</i></h2></div><div className="completion"><span>SPECIMEN DUST</span><strong>✦ {save.dust}</strong></div></div><h3 className="section-label">DUST TROPHIES · COSMETIC ONLY</h3><div className="shop-grid">{cosmetics.map(c=>{const owned=save.unlocks.includes(c.id);return <article key={c.id} className={save.equipped===c.id?"equipped":""}><span>{c.kind}</span><strong>{c.name}</strong><small>No power. Just evidence.</small><button disabled={!owned&&save.dust<c.cost} onClick={()=>owned?setSave(s=>({...s,equipped:c.id})):buy(c.id,c.cost)}>{save.equipped===c.id?"EQUIPPED":owned?"EQUIP":`✦ ${c.cost}`}</button></article>})}</div><h3 className="section-label">SETTINGS</h3><div className="settings-grid"><label>MASTER VOLUME<input type="range" min="0" max="1" step=".1" value={save.settings.master} onChange={e=>setSave(s=>({...s,settings:{...s.settings,master:+e.target.value}}))}/></label><label>MUSIC VOLUME<input type="range" min="0" max="1" step=".05" value={save.settings.musicVolume} disabled={!save.settings.musicEnabled} onChange={e=>setSave(s=>({...s,settings:{...s.settings,musicVolume:+e.target.value}}))}/></label><label>PICKAXE EFFECTS VOLUME<input type="range" min="0" max="1" step=".1" value={save.settings.sfx} disabled={!save.settings.pickaxeSfxEnabled} onChange={e=>setSave(s=>({...s,settings:{...s.settings,sfx:+e.target.value}}))}/></label><label className="toggle"><input type="checkbox" checked={save.settings.musicEnabled} onChange={e=>setSave(s=>({...s,settings:{...s.settings,musicEnabled:e.target.checked}}))}/>MUSIC · {save.settings.musicEnabled?"ON":"OFF"}</label><label className="toggle"><input type="checkbox" checked={save.settings.pickaxeSfxEnabled} onChange={e=>setSave(s=>({...s,settings:{...s.settings,pickaxeSfxEnabled:e.target.checked}}))}/>PICKAXE EFFECTS · {save.settings.pickaxeSfxEnabled?"ON":"OFF"}</label>{(["reducedShake","reducedMotion","vibration","highContrast"] as const).map(k=><label className="toggle" key={k}><input type="checkbox" checked={save.settings[k]} onChange={e=>setSave(s=>({...s,settings:{...s.settings,[k]:e.target.checked}}))}/>{k.replace(/([A-Z])/g," $1").toUpperCase()}</label>)}</div><div className="utility-buttons"><button onClick={onHelp}>HOW TO PLAY</button><button onClick={()=>download("ore-whore-save-v03.json",save)}>EXPORT SAVE</button><label>IMPORT SAVE<input type="file" accept="application/json" onChange={e=>e.target.files?.[0]&&importSave(e.target.files[0])}/></label><button onClick={()=>download("ore-whore-analytics.json",JSON.parse(localStorage.getItem("ore-whore-analytics-v1")||"[]"))}>EXPORT PLAYTEST DATA</button></div></section>
}

function Reveal({ found, total, attempt, biome, onContinue }: { found: {ore:Item;mineral:Item;isNew:boolean;count:number}; total:number;attempt:number;biome:Biome; onContinue:()=>void }) {
  const comboOdds = odds(found.ore,found.mineral,biome);
  const huge = found.mineral.rarity === "Mythic" || (found.ore.rarity === "Legendary" && found.mineral.rarity === "Epic");
  const rareDiscovery=found.isNew&&(found.ore.rarity==="Legendary"||found.mineral.rarity==="Mythic"||comboOdds>=500);
  const personality=found.ore.id==="dark"?"THIS SHIT AGAIN?":found.ore.id==="khorium"?"KHORIUM. DO NOT PANIC.":found.ore.id==="saronite"?"IT KNOWS YOUR NAME.":found.ore.id==="titanium"?"THE CROWN JEWEL":"DEPOSIT CRACKED";
  return <div className={`reveal ore-${found.ore.id} ${huge?"mythic":""} ${rareDiscovery?"rare-discovery":""} ${!found.isNew&&!huge?"quick":""}`}><div className="reveal-card"><button className="close" onClick={onContinue}>×</button>{rareDiscovery&&<div className="discovery-ribbon"><span>ORE WHORE · VOLUME I</span><strong>RARE DISCOVERY</strong></div>}<p className="eyebrow">{personality}</p><div className="combo-art"><img className="big-gem ore ore-sprite ore-sprite-reveal" src={oreAsset(found.ore.id)} alt=""/><b>+</b><img className="big-gem mineral mineral-sprite mineral-sprite-reveal" src={mineralAsset(found.mineral.id)} alt=""/></div><div className="names"><div><small>{found.ore.rarity}</small><strong>{discoveryOreName(found.ore)}</strong></div><b>CONTAINING</b><div><small>{found.mineral.rarity}</small><strong>{found.mineral.name}</strong></div></div><div className={`verdict ${found.isNew?"new":"duplicate"}`}><span>{found.isNew ? (huge?"MYTHIC DISCOVERY":rareDiscovery?"RARE DISCOVERY":"NEW COMBINATION") : `DUPLICATE ×${found.count}`}</span><strong>{found.isNew ? `${total} / 225` : `+${dustByRarity[found.mineral.rarity]} SPECIMEN DUST`}</strong><small>NATURAL ODDS · APPROX. 1 IN {comboOdds.toLocaleString()}</small></div>{rareDiscovery&&<div className="discovery-meta"><span>ATTEMPT #{attempt}</span><span>ALBUM {total}/225</span></div>}<button className="continue" onClick={onContinue}>{found.isNew?"CONTINUE MINING":"AGAIN. NOW."} <span>→</span></button></div></div>;
}
