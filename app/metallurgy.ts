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
  description: string;
};
export type ForgeRecipe = {
  id: string; resultingItemId: string; processedInputs: Ingredient[]; mineralInputs: Ingredient[];
  unlock?: RecipeUnlock; category: "MINING TOOL"; description?: string;
};

export const processedMaterials: ProcessedMaterial[] = [
  {id:"bronze",name:"Bronze",description:"Copper and tin persuaded to cooperate."},
  {id:"iron-ingot",name:"Iron Ingot",description:"Iron refined into something a forge can respect."},
  {id:"mithrilsteel",name:"Mithrilsteel",description:"Mithril reinforced with Truesilver."},
  {id:"darksteel",name:"Darksteel",description:"Dense, ancient, and unpleasantly warm."},
  {id:"felsteel",name:"Felsteel",description:"Industrial-grade corruption."},
  {id:"khorium-alloy",name:"Khorium Alloy",description:"Khorium stabilized with Cobalt."},
  {id:"saronite-assembly",name:"Saronite Assembly",description:"Saronite chassis with conductive Gold controls."},
  {id:"titanium-assembly",name:"Titanium Assembly",description:"Titanium structure with Silver precision plating and Cobalt bracing."},
];

// Quantities are intentionally centralized and easy to rebalance.
export const metallurgyRecipes: MetallurgyRecipe[] = [
  {id:"alloy-bronze",name:"Smelt Bronze",operation:"ALLOY",inputs:[{id:"copper",quantity:2},{id:"tin",quantity:1}],outputId:"bronze",outputQuantity:1},
  {id:"refine-iron",name:"Refine Iron",operation:"REFINE",inputs:[{id:"iron",quantity:2}],outputId:"iron-ingot",outputQuantity:1},
  {id:"alloy-mithrilsteel",name:"Smelt Mithrilsteel",operation:"ALLOY",inputs:[{id:"mithril",quantity:2},{id:"truesilver",quantity:1}],outputId:"mithrilsteel",outputQuantity:1,unlock:{mine:"deep"}},
  {id:"alloy-darksteel",name:"Smelt Darksteel",operation:"ALLOY",inputs:[{id:"dark",quantity:1},{id:"thorium",quantity:1}],outputId:"darksteel",outputQuantity:1,unlock:{mine:"deep"}},
  {id:"alloy-felsteel",name:"Smelt Felsteel",operation:"ALLOY",inputs:[{id:"feliron",quantity:2},{id:"adamantite",quantity:1}],outputId:"felsteel",outputQuantity:1,unlock:{mine:"outland"}},
  {id:"alloy-khorium",name:"Smelt Khorium Alloy",operation:"ALLOY",inputs:[{id:"cobalt",quantity:2},{id:"khorium",quantity:1}],outputId:"khorium-alloy",outputQuantity:1,unlock:{mine:"northrend"}},
  {id:"assembly-saronite",name:"Build Saronite Assembly",operation:"ALLOY",inputs:[{id:"saronite",quantity:2},{id:"gold",quantity:1}],outputId:"saronite-assembly",outputQuantity:1,unlock:{mine:"northrend"}},
  {id:"assembly-titanium",name:"Build Titanium Assembly",operation:"ALLOY",inputs:[{id:"titanium",quantity:1},{id:"silver",quantity:1},{id:"cobalt",quantity:1}],outputId:"titanium-assembly",outputQuantity:1,unlock:{mine:"northrend"}},
];

export const forgedItems: ForgedItem[] = [
  {id:"rusty-pickaxe",name:"ROCK BONKER",technicalName:"Peon Pickaxe",category:"MINING TOOL",tier:0,mode:"manual",inputMode:"click",holdToMine:false,continuousMining:false,damage:1,actionDurationMs:430,icon:"/assets/tools/tool-rock-bonker.webp",description:"Wood, leather, ugly iron, and violence. The absolute bottom of the ladder."},
  {id:"bronze-pickaxe",name:"BRONZE BONKER",technicalName:"Bronze Pickaxe",category:"MINING TOOL",tier:1,mode:"manual",inputMode:"click",holdToMine:false,continuousMining:false,damage:1.15,actionDurationMs:410,recipeId:"forge-bronze-pickaxe",icon:"/assets/tools/tool-bronze-pickaxe.webp",description:"A modestly faster manual tool and your introduction to alloying."},
  {id:"iron-pickaxe",name:"BIG PICK",technicalName:"Iron Pickaxe",category:"MINING TOOL",tier:2,mode:"manual",inputMode:"click",holdToMine:false,continuousMining:false,damage:1.35,actionDurationMs:390,recipeId:"forge-iron-pickaxe",icon:"/assets/tools/tool-iron-pickaxe.webp",description:"Reliable refined iron. The rock has begun to notice."},
  {id:"mithril-pickaxe",name:"SHINY BONKER",technicalName:"Mithrilsteel Pickaxe",category:"MINING TOOL",tier:3,mode:"manual",inputMode:"click",holdToMine:false,continuousMining:false,damage:1.6,actionDurationMs:365,recipeId:"forge-mithril-pickaxe",icon:"/assets/tools/tool-mithril-pickaxe.webp",description:"A lighter, faster traditional pickaxe."},
  {id:"dark-iron-pickaxe",name:"ANGRY PICK",technicalName:"Darksteel Pickaxe",category:"MINING TOOL",tier:4,mode:"manual",inputMode:"click",holdToMine:false,continuousMining:false,damage:2,actionDurationMs:340,recipeId:"forge-dark-iron-pickaxe",icon:"/assets/tools/tool-dark-iron-pickaxe.webp",description:"The final major traditional mining tool."},
  {id:"felsteel-jackhammer",name:"LOUD BONKER",technicalName:"Felsteel Jackhammer",category:"MINING TOOL",tier:5,mode:"continuous",inputMode:"hold",holdToMine:true,continuousMining:true,damage:1,actionDurationMs:430,intervalMs:430,recipeId:"forge-felsteel-jackhammer",icon:"/assets/tools/tool-felsteel-jackhammer.webp",description:"Hold input to repeat normal strikes. Every excavation remains an independent roll."},
  {id:"khorium-drill",name:"SPINNY DIGGER",technicalName:"Khorium Rotary Drill",category:"MINING TOOL",tier:6,mode:"continuous",inputMode:"hold",holdToMine:true,continuousMining:true,damage:1.35,actionDurationMs:300,intervalMs:300,recipeId:"forge-khorium-drill",icon:"/assets/tools/tool-khorium-drill.webp",description:"The first serious continuous industrial drill."},
  {id:"advanced-drill",name:"BIGGER SPINNY DIGGER",technicalName:"Advanced Drill",category:"MINING TOOL",tier:7,mode:"continuous",inputMode:"hold",holdToMine:true,continuousMining:true,damage:1.5,actionDurationMs:260,intervalMs:260,recipeId:"forge-advanced-drill",icon:"/assets/tools/tool-advanced-drill.webp",description:"The Khorium drive reinforced with lighter Mithrilsteel internals."},
  {id:"advanced-excavator",name:"ROCK EATER",technicalName:"Advanced Excavator",category:"MINING TOOL",tier:8,mode:"continuous",inputMode:"hold",holdToMine:true,continuousMining:true,damage:1.75,actionDurationMs:220,intervalMs:220,recipeId:"forge-advanced-excavator",icon:"/assets/tools/tool-advanced-excavator.webp",description:"An industrial cutting head built to consume the wall continuously."},
  {id:"endgame-machine",name:"MOUNTAIN HURTER",technicalName:"Endgame Mining Machine",category:"MINING TOOL",tier:9,mode:"continuous",inputMode:"hold",holdToMine:true,continuousMining:true,damage:2,actionDurationMs:180,intervalMs:180,recipeId:"forge-endgame-machine",icon:"/assets/tools/tool-endgame-machine.webp",description:"Every proven metal in the workshop, weaponized against geography."},
  {id:"ultimate-machine",name:"MOUNTAIN FUCKER",technicalName:"Ultimate Mining Machine",category:"MINING TOOL",tier:10,mode:"continuous",inputMode:"hold",holdToMine:true,continuousMining:true,damage:2.5,actionDurationMs:150,intervalMs:150,recipeId:"forge-ultimate-machine",icon:"/assets/tools/tool-ultimate-machine.webp",description:"Ultimate technology. The Peon has exhausted his engineering vocabulary."},
];

export const forgeRecipes: ForgeRecipe[] = [
  {id:"forge-bronze-pickaxe",resultingItemId:"bronze-pickaxe",processedInputs:[{id:"bronze",quantity:3}],mineralInputs:[{id:"malachite",quantity:2},{id:"tigerseye",quantity:1}],category:"MINING TOOL",unlock:{tool:"rusty-pickaxe"}},
  {id:"forge-iron-pickaxe",resultingItemId:"iron-pickaxe",processedInputs:[{id:"iron-ingot",quantity:4},{id:"bronze",quantity:1}],mineralInputs:[{id:"shadowgem",quantity:2}],category:"MINING TOOL",unlock:{tool:"bronze-pickaxe"}},
  {id:"forge-mithril-pickaxe",resultingItemId:"mithril-pickaxe",processedInputs:[{id:"mithrilsteel",quantity:3},{id:"iron-ingot",quantity:2}],mineralInputs:[{id:"mossagate",quantity:2},{id:"jade",quantity:1}],category:"MINING TOOL",unlock:{mine:"deep",tool:"iron-pickaxe"}},
  {id:"forge-dark-iron-pickaxe",resultingItemId:"dark-iron-pickaxe",processedInputs:[{id:"darksteel",quantity:3},{id:"mithrilsteel",quantity:1}],mineralInputs:[{id:"moonstone",quantity:2},{id:"citrine",quantity:1}],category:"MINING TOOL",unlock:{mine:"deep",tool:"mithril-pickaxe"}},
  {id:"forge-felsteel-jackhammer",resultingItemId:"felsteel-jackhammer",processedInputs:[{id:"felsteel",quantity:4},{id:"darksteel",quantity:2}],mineralInputs:[{id:"aquamarine",quantity:2},{id:"starruby",quantity:1}],category:"MINING TOOL",unlock:{mine:"outland",tool:"dark-iron-pickaxe"}},
  {id:"forge-khorium-drill",resultingItemId:"khorium-drill",processedInputs:[{id:"khorium-alloy",quantity:4},{id:"felsteel",quantity:2}],mineralInputs:[{id:"vitriol",quantity:1},{id:"largeopal",quantity:1}],category:"MINING TOOL",unlock:{mine:"northrend",tool:"felsteel-jackhammer"}},
  {id:"forge-advanced-drill",resultingItemId:"advanced-drill",processedInputs:[{id:"khorium-alloy",quantity:5},{id:"darksteel",quantity:2}],mineralInputs:[{id:"sapphire",quantity:1}],category:"MINING TOOL",unlock:{mine:"northrend",tool:"khorium-drill"}},
  {id:"forge-advanced-excavator",resultingItemId:"advanced-excavator",processedInputs:[{id:"khorium-alloy",quantity:6},{id:"felsteel",quantity:4}],mineralInputs:[{id:"diamond",quantity:1}],category:"MINING TOOL",unlock:{mine:"northrend",tool:"advanced-drill"}},
  {id:"forge-endgame-machine",resultingItemId:"endgame-machine",processedInputs:[{id:"titanium-assembly",quantity:5},{id:"saronite-assembly",quantity:3}],mineralInputs:[{id:"emerald",quantity:1},{id:"arcane",quantity:1}],category:"MINING TOOL",unlock:{mine:"northrend",tool:"advanced-excavator"}},
  {id:"forge-ultimate-machine",resultingItemId:"ultimate-machine",processedInputs:[{id:"titanium-assembly",quantity:8},{id:"saronite-assembly",quantity:5},{id:"khorium-alloy",quantity:5}],mineralInputs:[{id:"diamond",quantity:1},{id:"emerald",quantity:1},{id:"arcane",quantity:2}],category:"MINING TOOL",unlock:{mine:"northrend",tool:"endgame-machine"}},
];

export const CANONICAL_EXCAVATION_PROBABILITIES = Object.freeze({emptyDig:0.20,miss:0.05,critical:0.05});

export const canAfford=(inventory:Record<string,number>,inputs:Ingredient[])=>inputs.every(i=>(inventory[i.id]||0)>=i.quantity);
export const spend=(inventory:Record<string,number>,inputs:Ingredient[])=>inputs.reduce((next,i)=>({...next,[i.id]:(next[i.id]||0)-i.quantity}),{...inventory});
export const maxCraftable=(inventory:Record<string,number>,inputs:Ingredient[])=>inputs.length?Math.max(0,Math.min(...inputs.map(i=>Math.floor((inventory[i.id]||0)/i.quantity)))):0;
const scaledInputs=(inputs:Ingredient[],count:number)=>inputs.map(i=>({...i,quantity:i.quantity*count}));

export type ResourceState={oreResources:Record<string,number>;mineralResources:Record<string,number>;processedResources:Record<string,number>;ownedTools:string[];toolTier:number};
export const smeltAtomic=(state:ResourceState,recipe:MetallurgyRecipe):ResourceState|null=>canAfford(state.oreResources,recipe.inputs)?{...state,oreResources:spend(state.oreResources,recipe.inputs),processedResources:{...state.processedResources,[recipe.outputId]:(state.processedResources[recipe.outputId]||0)+recipe.outputQuantity}}:null;
export const smeltBatchAtomic=(state:ResourceState,recipe:MetallurgyRecipe,count:number):ResourceState|null=>{const quantity=Math.floor(count),inputs=scaledInputs(recipe.inputs,quantity);return quantity>0&&canAfford(state.oreResources,inputs)?{...state,oreResources:spend(state.oreResources,inputs),processedResources:{...state.processedResources,[recipe.outputId]:(state.processedResources[recipe.outputId]||0)+recipe.outputQuantity*quantity}}:null};
export type ForgePrerequisitePlan={oreInputs:Ingredient[];processedFromStock:Ingredient[];mineralInputs:Ingredient[];crafts:{recipeId:string;count:number;outputId:string;quantity:number}[]};
const combineInputs=(inputs:Ingredient[])=>Object.entries(inputs.reduce<Record<string,number>>((all,i)=>({...all,[i.id]:(all[i.id]||0)+i.quantity}),{})).map(([id,quantity])=>({id,quantity}));
export const planForgePrerequisites=(state:ResourceState,recipe:ForgeRecipe):ForgePrerequisitePlan|null=>{
  const crafts:ForgePrerequisitePlan["crafts"]=[],oreInputs:Ingredient[]=[],processedFromStock:Ingredient[]=[];
  for(const input of recipe.processedInputs){
    const stock=Math.min(state.processedResources[input.id]||0,input.quantity),deficit=input.quantity-stock;
    if(stock)processedFromStock.push({id:input.id,quantity:stock});
    if(!deficit)continue;
    const source=metallurgyRecipes.find(r=>r.outputId===input.id);
    if(!source)return null;
    const count=Math.ceil(deficit/source.outputQuantity);
    crafts.push({recipeId:source.id,count,outputId:source.outputId,quantity:source.outputQuantity*count});
    oreInputs.push(...scaledInputs(source.inputs,count));
  }
  const combinedOre=combineInputs(oreInputs);
  return {oreInputs:combinedOre,processedFromStock,mineralInputs:recipe.mineralInputs,crafts};
};
export const forgeWithPrerequisitesAtomic=(state:ResourceState,recipe:ForgeRecipe):ResourceState|null=>{
  const tool=forgedItems.find(t=>t.id===recipe.resultingItemId),previous=forgedItems.find(t=>t.tier===(tool?.tier||0)-1),plan=planForgePrerequisites(state,recipe);
  if(!tool||!plan||state.ownedTools.includes(tool.id)||(previous&&!state.ownedTools.includes(previous.id))||!canAfford(state.oreResources,plan.oreInputs)||!canAfford(state.mineralResources,recipe.mineralInputs))return null;
  const produced=plan.crafts.reduce((all,c)=>({...all,[c.outputId]:(all[c.outputId]||0)+c.quantity}),{...state.processedResources});
  return {...state,oreResources:spend(state.oreResources,plan.oreInputs),processedResources:spend(produced,recipe.processedInputs),mineralResources:spend(state.mineralResources,recipe.mineralInputs),ownedTools:[...state.ownedTools,tool.id],toolTier:tool.tier};
};
export const forgeAtomic=(state:ResourceState,recipe:ForgeRecipe):ResourceState|null=>{
  const tool=forgedItems.find(t=>t.id===recipe.resultingItemId),previous=forgedItems.find(t=>t.tier===(tool?.tier||0)-1);
  if(!tool||state.ownedTools.includes(tool.id)||(previous&&!state.ownedTools.includes(previous.id))||!canAfford(state.processedResources,recipe.processedInputs)||!canAfford(state.mineralResources,recipe.mineralInputs))return null;
  return {...state,processedResources:spend(state.processedResources,recipe.processedInputs),mineralResources:spend(state.mineralResources,recipe.mineralInputs),ownedTools:[...state.ownedTools,tool.id],toolTier:tool.tier};
};
