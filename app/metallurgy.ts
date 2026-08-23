export type MetallurgyOperation = "REFINE" | "ALLOY";
export type RecipeUnlock = { mine?: "old" | "deep" | "outland" | "northrend"; tool?: string };
export type Ingredient = { id: string; quantity: number };

export type ProcessedMaterial = { id: string; name: string; description: string };
export type MetallurgyRecipe = {
  id: string; name: string; operation: MetallurgyOperation;
  inputs: Ingredient[]; outputId: string; outputQuantity: number; unlock?: RecipeUnlock;
};
export type ForgedItem = {
  id: string; name: string; technicalName:string; category: "MINING TOOL"; tier: number; planned?:boolean;
  mode: "manual" | "continuous"; inputMode:"click"|"hold"; holdToMine:boolean; continuousMining:boolean;
  damage: number; actionDurationMs:number; intervalMs?: number; recipeId?:string; icon:string;
  trueArtifactChance:number; description: string;
};
export type ForgeRecipe = {
  id: string; resultingItemId: string; inputs: Ingredient[];
  unlock?: RecipeUnlock; category: "MINING TOOL"; description?: string;
};

export const processedMaterials: ProcessedMaterial[] = [
  {id:"bronze",name:"Bronze",description:"Copper and tin persuaded to cooperate."},
  {id:"iron-ingot",name:"Iron Ingot",description:"Iron refined into something a forge can respect."},
  {id:"mithrilsteel",name:"Mithrilsteel",description:"Mithril reinforced with Truesilver."},
  {id:"darksteel",name:"Darksteel",description:"Dense, ancient, and unpleasantly warm."},
  {id:"felsteel",name:"Felsteel",description:"Industrial-grade corruption."},
  {id:"khorium-alloy",name:"Khorium Alloy",description:"Khorium stabilized with Cobalt."},
];

// Quantities are intentionally centralized and easy to rebalance.
export const metallurgyRecipes: MetallurgyRecipe[] = [
  {id:"alloy-bronze",name:"Smelt Bronze",operation:"ALLOY",inputs:[{id:"copper",quantity:2},{id:"tin",quantity:1}],outputId:"bronze",outputQuantity:1},
  {id:"refine-iron",name:"Refine Iron",operation:"REFINE",inputs:[{id:"iron",quantity:2}],outputId:"iron-ingot",outputQuantity:1},
  {id:"alloy-mithrilsteel",name:"Smelt Mithrilsteel",operation:"ALLOY",inputs:[{id:"mithril",quantity:2},{id:"truesilver",quantity:1}],outputId:"mithrilsteel",outputQuantity:1,unlock:{mine:"deep"}},
  {id:"alloy-darksteel",name:"Smelt Darksteel",operation:"ALLOY",inputs:[{id:"dark",quantity:1},{id:"thorium",quantity:1}],outputId:"darksteel",outputQuantity:1,unlock:{mine:"deep"}},
  {id:"alloy-felsteel",name:"Smelt Felsteel",operation:"ALLOY",inputs:[{id:"feliron",quantity:2},{id:"adamantite",quantity:1}],outputId:"felsteel",outputQuantity:1,unlock:{mine:"outland"}},
  {id:"alloy-khorium",name:"Smelt Khorium Alloy",operation:"ALLOY",inputs:[{id:"cobalt",quantity:2},{id:"khorium",quantity:1}],outputId:"khorium-alloy",outputQuantity:1,unlock:{mine:"northrend"}},
];

export const forgedItems: ForgedItem[] = [
  {id:"rusty-pickaxe",name:"ROCK BONKER",technicalName:"Peon Pickaxe",category:"MINING TOOL",tier:0,mode:"manual",inputMode:"click",holdToMine:false,continuousMining:false,damage:1,actionDurationMs:430,icon:"/assets/tools/tool-rock-bonker.webp",trueArtifactChance:.0005,description:"Wood, leather, ugly iron, and violence. The absolute bottom of the ladder."},
  {id:"bronze-pickaxe",name:"BRONZE BONKER",technicalName:"Bronze Pickaxe",category:"MINING TOOL",tier:1,mode:"manual",inputMode:"click",holdToMine:false,continuousMining:false,damage:1.15,actionDurationMs:410,recipeId:"forge-bronze-pickaxe",icon:"/assets/tools/tool-bronze-pickaxe.webp",trueArtifactChance:.0006,description:"A modestly faster manual tool and your introduction to alloying."},
  {id:"iron-pickaxe",name:"BIG PICK",technicalName:"Iron Pickaxe",category:"MINING TOOL",tier:2,mode:"manual",inputMode:"click",holdToMine:false,continuousMining:false,damage:1.35,actionDurationMs:390,recipeId:"forge-iron-pickaxe",icon:"/assets/tools/tool-iron-pickaxe.webp",trueArtifactChance:.0008,description:"Reliable refined iron. The rock has begun to notice."},
  {id:"mithril-pickaxe",name:"SHINY BONKER",technicalName:"Mithrilsteel Pickaxe",category:"MINING TOOL",tier:3,mode:"manual",inputMode:"click",holdToMine:false,continuousMining:false,damage:1.6,actionDurationMs:365,recipeId:"forge-mithril-pickaxe",icon:"/assets/tools/tool-mithril-pickaxe.webp",trueArtifactChance:.001,description:"A lighter, faster traditional pickaxe."},
  {id:"dark-iron-pickaxe",name:"ANGRY PICK",technicalName:"Darksteel Pickaxe",category:"MINING TOOL",tier:4,mode:"manual",inputMode:"click",holdToMine:false,continuousMining:false,damage:2,actionDurationMs:340,recipeId:"forge-dark-iron-pickaxe",icon:"/assets/tools/tool-dark-iron-pickaxe.webp",trueArtifactChance:.0015,description:"The final major traditional mining tool."},
  {id:"felsteel-jackhammer",name:"LOUD BONKER",technicalName:"Felsteel Jackhammer",category:"MINING TOOL",tier:5,mode:"continuous",inputMode:"hold",holdToMine:true,continuousMining:true,damage:1,actionDurationMs:430,intervalMs:430,recipeId:"forge-felsteel-jackhammer",icon:"/assets/tools/tool-felsteel-jackhammer.webp",trueArtifactChance:.002,description:"Hold input to repeat normal strikes. Every excavation remains an independent roll."},
  {id:"khorium-drill",name:"SPINNY DIGGER",technicalName:"Khorium Rotary Drill",category:"MINING TOOL",tier:6,mode:"continuous",inputMode:"hold",holdToMine:true,continuousMining:true,damage:1.35,actionDurationMs:300,intervalMs:300,recipeId:"forge-khorium-drill",icon:"/assets/tools/tool-khorium-drill.webp",trueArtifactChance:.003,description:"The first serious continuous industrial drill."},
  {id:"advanced-drill",name:"BIGGER SPINNY DIGGER",technicalName:"Advanced Drill",category:"MINING TOOL",tier:7,mode:"continuous",inputMode:"hold",holdToMine:true,continuousMining:true,damage:1.5,actionDurationMs:260,intervalMs:260,recipeId:"forge-advanced-drill",icon:"/assets/tools/tool-advanced-drill.webp",trueArtifactChance:.004,description:"The Khorium drive reinforced with lighter Mithrilsteel internals."},
  {id:"advanced-excavator",name:"ROCK EATER",technicalName:"Advanced Excavator",category:"MINING TOOL",tier:8,mode:"continuous",inputMode:"hold",holdToMine:true,continuousMining:true,damage:1.75,actionDurationMs:220,intervalMs:220,recipeId:"forge-advanced-excavator",icon:"/assets/tools/tool-advanced-excavator.webp",trueArtifactChance:.005,description:"An industrial cutting head built to consume the wall continuously."},
  {id:"endgame-machine",name:"MOUNTAIN HURTER",technicalName:"Endgame Mining Machine",category:"MINING TOOL",tier:9,mode:"continuous",inputMode:"hold",holdToMine:true,continuousMining:true,damage:2,actionDurationMs:180,intervalMs:180,recipeId:"forge-endgame-machine",icon:"/assets/tools/tool-endgame-machine.webp",trueArtifactChance:.0075,description:"Every proven metal in the workshop, weaponized against geography."},
  {id:"ultimate-machine",name:"MOUNTAIN FUCKER",technicalName:"Ultimate Mining Machine",category:"MINING TOOL",tier:10,mode:"continuous",inputMode:"hold",holdToMine:true,continuousMining:true,damage:2.5,actionDurationMs:150,intervalMs:150,recipeId:"forge-ultimate-machine",icon:"/assets/tools/tool-ultimate-machine.webp",trueArtifactChance:.01,description:"Ultimate technology. The Peon has exhausted his engineering vocabulary."},
];

export const forgeRecipes: ForgeRecipe[] = [
  {id:"forge-bronze-pickaxe",resultingItemId:"bronze-pickaxe",inputs:[{id:"bronze",quantity:4}],category:"MINING TOOL"},
  {id:"forge-iron-pickaxe",resultingItemId:"iron-pickaxe",inputs:[{id:"iron-ingot",quantity:5}],category:"MINING TOOL",unlock:{tool:"bronze-pickaxe"}},
  {id:"forge-mithril-pickaxe",resultingItemId:"mithril-pickaxe",inputs:[{id:"mithrilsteel",quantity:4}],category:"MINING TOOL",unlock:{mine:"deep",tool:"iron-pickaxe"}},
  {id:"forge-dark-iron-pickaxe",resultingItemId:"dark-iron-pickaxe",inputs:[{id:"darksteel",quantity:4}],category:"MINING TOOL",unlock:{mine:"deep",tool:"mithril-pickaxe"}},
  {id:"forge-felsteel-jackhammer",resultingItemId:"felsteel-jackhammer",inputs:[{id:"felsteel",quantity:6},{id:"iron-ingot",quantity:3}],category:"MINING TOOL",unlock:{mine:"outland",tool:"dark-iron-pickaxe"}},
  {id:"forge-khorium-drill",resultingItemId:"khorium-drill",inputs:[{id:"khorium-alloy",quantity:6},{id:"felsteel",quantity:2}],category:"MINING TOOL",unlock:{mine:"northrend",tool:"felsteel-jackhammer"}},
  {id:"forge-advanced-drill",resultingItemId:"advanced-drill",inputs:[{id:"khorium-alloy",quantity:8},{id:"mithrilsteel",quantity:4}],category:"MINING TOOL",unlock:{mine:"northrend",tool:"khorium-drill"}},
  {id:"forge-advanced-excavator",resultingItemId:"advanced-excavator",inputs:[{id:"khorium-alloy",quantity:10},{id:"darksteel",quantity:6}],category:"MINING TOOL",unlock:{mine:"northrend",tool:"advanced-drill"}},
  {id:"forge-endgame-machine",resultingItemId:"endgame-machine",inputs:[{id:"khorium-alloy",quantity:12},{id:"felsteel",quantity:8},{id:"iron-ingot",quantity:5}],category:"MINING TOOL",unlock:{mine:"northrend",tool:"advanced-excavator"}},
  {id:"forge-ultimate-machine",resultingItemId:"ultimate-machine",inputs:[{id:"khorium-alloy",quantity:16},{id:"felsteel",quantity:10},{id:"darksteel",quantity:8},{id:"mithrilsteel",quantity:6},{id:"bronze",quantity:10}],category:"MINING TOOL",unlock:{mine:"northrend",tool:"endgame-machine"}},
];

export const MAX_TRUE_ARTIFACT_CHANCE = 0.01;
export const CANONICAL_EXCAVATION_PROBABILITIES = Object.freeze({emptyDig:0.20,miss:0.05,critical:0.05});
export const equippedTrueArtifactChance=(tool:ForgedItem)=>Math.min(MAX_TRUE_ARTIFACT_CHANCE,Math.max(0,tool.trueArtifactChance));

export const canAfford=(inventory:Record<string,number>,inputs:Ingredient[])=>inputs.every(i=>(inventory[i.id]||0)>=i.quantity);
export const spend=(inventory:Record<string,number>,inputs:Ingredient[])=>inputs.reduce((next,i)=>({...next,[i.id]:(next[i.id]||0)-i.quantity}),{...inventory});
