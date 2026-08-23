export type MetallurgyOperation = "REFINE" | "ALLOY";
export type RecipeUnlock = { mine?: "old" | "deep" | "outland" | "northrend"; tool?: string };
export type Ingredient = { id: string; quantity: number };

export type ProcessedMaterial = { id: string; name: string; description: string };
export type MetallurgyRecipe = {
  id: string; name: string; operation: MetallurgyOperation;
  inputs: Ingredient[]; outputId: string; outputQuantity: number; unlock?: RecipeUnlock;
};
export type ForgedItem = {
  id: string; name: string; category: "MINING TOOL"; tier: number;
  mode: "manual" | "continuous"; damage: number; intervalMs?: number; description: string;
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
  {id:"rusty-pickaxe",name:"Rusty Pickaxe",category:"MINING TOOL",tier:0,mode:"manual",damage:1,description:"Starting equipment. Mostly rust, technically a pickaxe."},
  {id:"bronze-pickaxe",name:"Bronze Pickaxe",category:"MINING TOOL",tier:1,mode:"manual",damage:1.15,description:"A modestly faster manual tool and your introduction to alloying."},
  {id:"iron-pickaxe",name:"Iron Pickaxe",category:"MINING TOOL",tier:2,mode:"manual",damage:1.35,description:"Reliable refined iron. The rock has begun to notice."},
  {id:"mithril-pickaxe",name:"Mithril Pickaxe",category:"MINING TOOL",tier:3,mode:"manual",damage:1.6,description:"A lighter, faster traditional pickaxe."},
  {id:"dark-iron-pickaxe",name:"Dark Iron Pickaxe",category:"MINING TOOL",tier:4,mode:"manual",damage:2,description:"The final major traditional mining tool."},
  {id:"felsteel-jackhammer",name:"Felsteel Jackhammer",category:"MINING TOOL",tier:5,mode:"continuous",damage:1,intervalMs:430,description:"Hold input to repeat normal strikes. Every excavation remains an independent roll."},
  {id:"khorium-drill",name:"Khorium Drill",category:"MINING TOOL",tier:6,mode:"continuous",damage:1.35,intervalMs:300,description:"The first serious continuous industrial drill."},
];

export const forgeRecipes: ForgeRecipe[] = [
  {id:"forge-bronze-pickaxe",resultingItemId:"bronze-pickaxe",inputs:[{id:"bronze",quantity:4}],category:"MINING TOOL"},
  {id:"forge-iron-pickaxe",resultingItemId:"iron-pickaxe",inputs:[{id:"iron-ingot",quantity:5}],category:"MINING TOOL",unlock:{tool:"bronze-pickaxe"}},
  {id:"forge-mithril-pickaxe",resultingItemId:"mithril-pickaxe",inputs:[{id:"mithrilsteel",quantity:4}],category:"MINING TOOL",unlock:{mine:"deep",tool:"iron-pickaxe"}},
  {id:"forge-dark-iron-pickaxe",resultingItemId:"dark-iron-pickaxe",inputs:[{id:"darksteel",quantity:4}],category:"MINING TOOL",unlock:{mine:"deep",tool:"mithril-pickaxe"}},
  {id:"forge-felsteel-jackhammer",resultingItemId:"felsteel-jackhammer",inputs:[{id:"felsteel",quantity:6},{id:"iron-ingot",quantity:3}],category:"MINING TOOL",unlock:{mine:"outland",tool:"dark-iron-pickaxe"}},
  {id:"forge-khorium-drill",resultingItemId:"khorium-drill",inputs:[{id:"khorium-alloy",quantity:6},{id:"felsteel",quantity:2}],category:"MINING TOOL",unlock:{mine:"northrend",tool:"felsteel-jackhammer"}},
];

export const CANONICAL_EXCAVATION_PROBABILITIES = Object.freeze({emptyDig:0.20,trueArtifact:0.0005,miss:0.05,critical:0.05});

export const canAfford=(inventory:Record<string,number>,inputs:Ingredient[])=>inputs.every(i=>(inventory[i.id]||0)>=i.quantity);
export const spend=(inventory:Record<string,number>,inputs:Ingredient[])=>inputs.reduce((next,i)=>({...next,[i.id]:(next[i.id]||0)-i.quantity}),{...inventory});
