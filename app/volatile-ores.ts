export type VolatileMine="old"|"deep"|"outland"|"northrend"|"ghost"|"moon";
export type VolatileEncounter={oreId:string;mine:VolatileMine;startedAtDig:number};
export type VolatileStats={encountered:number;left:number;attempted:number;succeeded:number;detonated:number};
export type VolatileDetonationLoss={oreId:string;quantity:number};

export const EMPTY_VOLATILE_STATS:VolatileStats={encountered:0,left:0,attempted:0,succeeded:0,detonated:0};
// Moon Base foundation only: 0 means Volatile Ore events simply don't fire
// there yet — this is not a real balancing decision, just keeping the type
// consistent with every other biome already having an entry. A later pass
// can pick a real rate if Volatile Ore is ever extended to the Moon at all.
export const VOLATILE_TRIGGER_RATES:Record<VolatileMine,number>={old:.0004,deep:.0006,outland:.0008,northrend:.001,ghost:.0015,moon:0};
export const VOLATILE_RARE_MINERAL_POOL=["arcane","emerald","diamond","sapphire","largeopal"] as const;

// PROVISIONAL BALANCE ONLY. These values are deliberately isolated because the
// canonical success probability and blast-radius punishment are not locked yet.
export const PROVISIONAL_VOLATILE_BALANCE={
  successChance:.5,
  affectedOreTypes:{min:2,max:4},
  lossFraction:{min:.1,max:.25},
  minimumLoss:1,
  maximumLossPerOre:25,
} as const;

const integer=(random:()=>number,min:number,max:number)=>min+Math.floor(random()*(max-min+1));
const shuffled=<T>(items:T[],random:()=>number)=>{const result=[...items];for(let i=result.length-1;i>0;i--){const j=Math.floor(random()*(i+1));[result[i],result[j]]=[result[j],result[i]]}return result};

export const shouldTriggerVolatile=(mine:VolatileMine,random:()=>number)=>random()<VOLATILE_TRIGGER_RATES[mine];
export const volatileExtractionSucceeds=(random:()=>number)=>random()<PROVISIONAL_VOLATILE_BALANCE.successChance;
export const createVolatileSuccessReward=(oreId:string,random:()=>number)=>({
  oreId,
  oreQuantity:integer(random,10,20),
  mineralIds:shuffled([...VOLATILE_RARE_MINERAL_POOL],random).slice(0,integer(random,1,3)),
});
export const createVolatileDetonationLosses=(stock:Record<string,number>,ordinaryOreIds:string[],random:()=>number):VolatileDetonationLoss[]=>{
  const eligible=ordinaryOreIds.filter(id=>(Number(stock[id])||0)>0);
  if(!eligible.length)return [];
  const wanted=integer(random,PROVISIONAL_VOLATILE_BALANCE.affectedOreTypes.min,PROVISIONAL_VOLATILE_BALANCE.affectedOreTypes.max);
  return shuffled(eligible,random).slice(0,Math.min(wanted,eligible.length)).map(oreId=>{
    const owned=Math.max(0,Math.floor(Number(stock[oreId])||0));
    const fraction=PROVISIONAL_VOLATILE_BALANCE.lossFraction.min+random()*(PROVISIONAL_VOLATILE_BALANCE.lossFraction.max-PROVISIONAL_VOLATILE_BALANCE.lossFraction.min);
    return {oreId,quantity:Math.min(owned,PROVISIONAL_VOLATILE_BALANCE.maximumLossPerOre,Math.max(PROVISIONAL_VOLATILE_BALANCE.minimumLoss,Math.ceil(owned*fraction)))};
  });
};
export const sanitizeVolatileEncounter=(value:unknown,ordinaryOreIds?:string[],mineIds?:readonly string[]):VolatileEncounter|null=>{
  if(!value||typeof value!=="object")return null;
  const candidate=value as Partial<VolatileEncounter>;
  const validMines=mineIds||["old","deep","outland","northrend","ghost"];
  if(typeof candidate.oreId!=="string"||!validMines.includes(String(candidate.mine))||(ordinaryOreIds&&!ordinaryOreIds.includes(candidate.oreId)))return null;
  return {oreId:candidate.oreId,mine:candidate.mine as VolatileMine,startedAtDig:Math.max(1,Number(candidate.startedAtDig)||1)};
};
export const sanitizeVolatileStats=(value:unknown):VolatileStats=>{
  const candidate=value&&typeof value==="object"?value as Partial<VolatileStats>:{};
  return Object.fromEntries(Object.keys(EMPTY_VOLATILE_STATS).map(key=>[key,Math.max(0,Math.floor(Number(candidate[key as keyof VolatileStats])||0))])) as VolatileStats;
};
