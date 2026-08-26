export const GHOST_OBSOLETE_TOOL_HP_MULTIPLIER=10;

export const effectiveOreHp=(biome:string,baseHp:number,ghostCapable:boolean)=>
  biome==="ghost"&&!ghostCapable?baseHp*GHOST_OBSOLETE_TOOL_HP_MULTIPLIER:baseHp;

export const rescaleRemainingHp=(remainingHp:number,oldMaxHp:number,newMaxHp:number)=>{
  if(remainingHp<=0)return 0;
  if(oldMaxHp<=0||newMaxHp<=0)return Math.max(1,newMaxHp);
  return Math.max(1,Math.min(newMaxHp,Math.ceil(remainingHp/oldMaxHp*newMaxHp)));
};
