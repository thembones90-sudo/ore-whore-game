export type MemorySpeaker="PEON"|"SHADEZ"|"SYSTEM";
export type TunnelChoiceHistory={left:number;middle:number;right:number};
export type MemoryCommentaryState={seen:Record<string,number>;lastShownAtDig:number;lastShownAt:number};
export type MemoryContext={
  digs:number;emptyDigs:number;misses:number;strikes:number;criticalStrikes:number;perfectStrikes:number;
  ores:Record<string,number>;completedBiomes:string[];tunnelChoices:TunnelChoiceHistory;
  trueArtifacts:Record<string,number>;excessAfterCompletion:number;returnAfterMs?:number;
};
export type MemoryLine={id:string;speaker:MemorySpeaker;headline:string;dialogue:string};
type MemoryEvent="dig"|"return";
type MemoryTrigger={
  id:string;event:MemoryEvent;priority:number;oneTime:boolean;cooldownDigs?:number;cooldownMs?:number;
  speaker:MemorySpeaker;condition:(context:MemoryContext)=>boolean;
  copy:(context:MemoryContext)=>{headline:string;dialogue:string};
};

export const EMPTY_MEMORY_STATE:MemoryCommentaryState={seen:{},lastShownAtDig:-10000,lastShownAt:0};
export const EMPTY_TUNNEL_HISTORY:TunnelChoiceHistory={left:0,middle:0,right:0};
export const MEMORY_COMMENTARY_DIG_GAP=90;
export const MEMORY_COMMENTARY_TIME_GAP_MS=120_000;
export const MEMORY_COMMENTARY_ROLL_CHANCE=.10;
const DAY=86_400_000;
const sum=(values:Record<string,number>)=>Object.values(values).reduce((total,value)=>total+(Number(value)||0),0);

const triggers:MemoryTrigger[]=[
  {id:"return-long",event:"return",priority:100,oneTime:false,cooldownMs:30*DAY,speaker:"SHADEZ",condition:c=>(c.returnAfterMs||0)>=14*DAY,copy:()=>({headline:"ATTENDANCE RESTORED.",dialogue:"Your absence was recorded. Productivity improved."})},
  {id:"ronaldo-remains",event:"dig",priority:95,oneTime:true,speaker:"PEON",condition:c=>(c.trueArtifacts.ronaldo||0)>0&&c.digs>=50,copy:()=>({headline:"PEON REMEMBERS.",dialogue:"Peon still have hat off."})},
  {id:"artifact-file-growing",event:"dig",priority:80,oneTime:true,speaker:"SYSTEM",condition:c=>Object.values(c.trueArtifacts).filter(Boolean).length>=4,copy:()=>({headline:"ANOMALY FILE EXPANDING.",dialogue:"Multiple prohibited objects remain assigned to the same employee."})},
  {id:"copper-medical",event:"dig",priority:90,oneTime:true,speaker:"SHADEZ",condition:c=>(c.ores.copper||0)>=500,copy:()=>({headline:"COPPER EXPOSURE REVIEW.",dialogue:"Your commitment to copper is becoming medically relevant."})},
  {id:"ore-neglect",event:"dig",priority:65,oneTime:true,speaker:"SYSTEM",condition:c=>{const values=Object.values(c.ores).filter(v=>v>0);return c.digs>=750&&values.length>=8&&Math.max(...values)>=200&&Math.min(...values)<=2},copy:()=>({headline:"EXTRACTION BIAS CONFIRMED.",dialogue:"Several registered materials appear to have been avoided with remarkable consistency."})},
  {id:"empty-wall-hates",event:"dig",priority:75,oneTime:true,speaker:"PEON",condition:c=>c.emptyDigs>=150,copy:()=>({headline:"PEON HAS THEORY.",dialogue:"Wall know Peon. Wall hate Peon."})},
  {id:"misses-industrial",event:"dig",priority:70,oneTime:true,speaker:"SHADEZ",condition:c=>c.misses>=250&&c.misses/Math.max(1,c.strikes)>=.2,copy:()=>({headline:"ACCURACY REVIEW COMPLETE.",dialogue:"You have industrialized the act of missing."})},
  {id:"crit-history",event:"dig",priority:68,oneTime:true,speaker:"SYSTEM",condition:c=>c.criticalStrikes>=250&&c.criticalStrikes/Math.max(1,c.strikes)>=.12,copy:()=>({headline:"IMPACT PATTERN ABNORMAL.",dialogue:"Repeated structural overperformance has been added to your personnel file."})},
  {id:"same-tunnel",event:"dig",priority:85,oneTime:true,speaker:"SHADEZ",condition:c=>{const total=sum(c.tunnelChoices),largest=Math.max(...Object.values(c.tunnelChoices));return total>=8&&largest/total>=.75},copy:()=>({headline:"ROUTE SELECTION REVIEW.",dialogue:"Superstition has replaced geological judgment."})},
  {id:"post-completion-digging",event:"dig",priority:78,oneTime:true,speaker:"SHADEZ",condition:c=>c.completedBiomes.length>0&&c.excessAfterCompletion>=250,copy:()=>({headline:"CERTIFICATION WAS ALREADY ISSUED.",dialogue:"You continued digging anyway. Management is concerned by this enthusiasm."})},
  {id:"no-perfect-thousand",event:"dig",priority:60,oneTime:true,speaker:"SYSTEM",condition:c=>c.digs>=1000&&c.perfectStrikes===0,copy:()=>({headline:"PRECISION SAMPLE INCONCLUSIVE.",dialogue:"One thousand excavations have produced no evidence of deliberate accuracy."})},
];

export function sanitizeMemoryState(value:unknown):MemoryCommentaryState{
  const source=value&&typeof value==="object"?value as Partial<MemoryCommentaryState>:{};
  const seen=source.seen&&typeof source.seen==="object"?Object.fromEntries(Object.entries(source.seen).filter(([,v])=>Number.isFinite(Number(v))).map(([k,v])=>[k,Number(v)])):{};
  return {seen,lastShownAtDig:Number(source.lastShownAtDig)||EMPTY_MEMORY_STATE.lastShownAtDig,lastShownAt:Number(source.lastShownAt)||0};
}

export function sanitizeTunnelHistory(value:unknown):TunnelChoiceHistory{
  const source=value&&typeof value==="object"?value as Partial<TunnelChoiceHistory>:{};
  return {left:Math.max(0,Number(source.left)||0),middle:Math.max(0,Number(source.middle)||0),right:Math.max(0,Number(source.right)||0)};
}

export function selectSaveAwareCommentary(context:MemoryContext,state:MemoryCommentaryState,options:{event?:MemoryEvent;now?:number;random?:number}={}):{line:MemoryLine;state:MemoryCommentaryState}|null{
  const event=options.event||"dig",now=options.now||Date.now(),random=options.random??Math.random();
  if(event==="dig"&&(context.digs-state.lastShownAtDig<MEMORY_COMMENTARY_DIG_GAP||(state.lastShownAt>0&&now-state.lastShownAt<MEMORY_COMMENTARY_TIME_GAP_MS)||random>MEMORY_COMMENTARY_ROLL_CHANCE))return null;
  const eligible=triggers.filter(trigger=>trigger.event===event&&trigger.condition(context)&&(!trigger.oneTime||!state.seen[trigger.id])&&(!trigger.cooldownDigs||context.digs-(state.seen[trigger.id]||-10000)>=trigger.cooldownDigs)&&(!trigger.cooldownMs||now-(state.seen[trigger.id]||0)>=trigger.cooldownMs)).sort((a,b)=>b.priority-a.priority);
  const trigger=eligible[0];if(!trigger)return null;
  const copy=trigger.copy(context);
  return {line:{id:`memory-${trigger.id}`,speaker:trigger.speaker,...copy},state:{seen:{...state.seen,[trigger.id]:trigger.cooldownMs?now:context.digs},lastShownAtDig:context.digs,lastShownAt:now}};
}
