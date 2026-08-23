export const FORBIDDEN_TUNNEL_TRIGGER_CHANCE=0.01;
export const ORDINARY_TRUE_ARTIFACT_CHANCE=0.0005;
export const FIRST_DIRECTIONS=["left","middle","right"] as const;
export const SECOND_DIRECTIONS=["left","right"] as const;
export type FirstDirection=typeof FIRST_DIRECTIONS[number];
export type SecondDirection=typeof SECOND_DIRECTIONS[number];
export type FirstOutcome="x1"|"x2"|"x5";
export type SecondOutcome="sealed"|"deep";
export type TunnelModifierSource="forbidden-x1"|"forbidden-x2"|"forbidden-x5-sealed"|"forbidden-deep-way";
export type ArtifactModifier={chance:number;source:TunnelModifierSource;consumed:boolean};
export type ForbiddenTunnelState={
  id:string;chamber:"first"|"second"|"resolved";
  firstAssignments:Record<FirstDirection,FirstOutcome>;firstSelection?:FirstDirection;
  secondAssignments?:Record<SecondDirection,SecondOutcome>;secondSelection?:SecondDirection;
  resolution?:"x1"|"x2"|"sealed"|"deep";
};

const shuffled=<T,>(values:T[],rng:()=>number)=>{const result=[...values];for(let i=result.length-1;i>0;i--){const j=Math.floor(rng()*(i+1));[result[i],result[j]]=[result[j],result[i]]}return result};
export const createForbiddenTunnel=(rng:()=>number,id:string):ForbiddenTunnelState=>{
  const outcomes=shuffled<FirstOutcome>(["x1","x2","x5"],rng);
  return {id,chamber:"first",firstAssignments:{left:outcomes[0],middle:outcomes[1],right:outcomes[2]}};
};
export const modifierFor=(resolution:ForbiddenTunnelState["resolution"]):ArtifactModifier|null=>resolution==="x1"?{chance:ORDINARY_TRUE_ARTIFACT_CHANCE,source:"forbidden-x1",consumed:false}:resolution==="x2"?{chance:.001,source:"forbidden-x2",consumed:false}:resolution==="sealed"?{chance:.0025,source:"forbidden-x5-sealed",consumed:false}:resolution==="deep"?{chance:.15,source:"forbidden-deep-way",consumed:false}:null;
export const selectFirstPath=(state:ForbiddenTunnelState,direction:FirstDirection,rng:()=>number):{tunnel:ForbiddenTunnelState;modifier:ArtifactModifier|null}=>{
  if(state.chamber!=="first"||state.firstSelection)return {tunnel:state,modifier:null};
  const outcome=state.firstAssignments[direction];
  if(outcome!=="x5"){const resolution=outcome;return {tunnel:{...state,chamber:"resolved",firstSelection:direction,resolution},modifier:modifierFor(resolution)}}
  const outcomes=shuffled<SecondOutcome>(["sealed","deep"],rng);
  return {tunnel:{...state,chamber:"second",firstSelection:direction,secondAssignments:{left:outcomes[0],right:outcomes[1]}},modifier:null};
};
export const selectSecondPath=(state:ForbiddenTunnelState,direction:SecondDirection):{tunnel:ForbiddenTunnelState;modifier:ArtifactModifier|null}=>{
  if(state.chamber!=="second"||state.secondSelection||!state.secondAssignments)return {tunnel:state,modifier:null};
  const resolution=state.secondAssignments[direction];
  return {tunnel:{...state,chamber:"resolved",secondSelection:direction,resolution},modifier:modifierFor(resolution)};
};
export const artifactChanceForDig=(modifier:ArtifactModifier|null,equippedToolChance=ORDINARY_TRUE_ARTIFACT_CHANCE)=>modifier&&!modifier.consumed?modifier.chance:Math.min(.01,Math.max(ORDINARY_TRUE_ARTIFACT_CHANCE,equippedToolChance));
export const markModifierRolled=(modifier:ArtifactModifier|null)=>modifier&&!modifier.consumed?{...modifier,consumed:true}:modifier;
export const canTriggerForbiddenTunnel=(state:{forbiddenTunnel:ForbiddenTunnelState|null;pendingArtifactModifier:ArtifactModifier|null;activeTrueEncounter:unknown;veinDigsRemaining:number},cleanTransition:boolean)=>cleanTransition&&!state.forbiddenTunnel&&!state.pendingArtifactModifier&&!state.activeTrueEncounter&&state.veinDigsRemaining<=0;
export const sanitizeForbiddenTunnel=(value:unknown):ForbiddenTunnelState|null=>{
  if(!value||typeof value!=="object")return null;const state=value as ForbiddenTunnelState;
  const first=state.firstAssignments,firstValues=first&&FIRST_DIRECTIONS.map(d=>first[d]);
  if(typeof state.id!=="string"||!first||["x1","x2","x5"].some(x=>!firstValues.includes(x as FirstOutcome))||new Set(firstValues).size!==3)return null;
  if(state.chamber==="first"&&!state.firstSelection)return state;
  const secondValues=state.secondAssignments&&SECOND_DIRECTIONS.map(d=>state.secondAssignments![d]);
  if(state.chamber==="second"&&state.firstSelection&&state.firstAssignments[state.firstSelection]==="x5"&&secondValues&&secondValues.includes("sealed")&&secondValues.includes("deep")&&new Set(secondValues).size===2)return state;
  if(state.chamber==="resolved"&&state.resolution&&modifierFor(state.resolution))return state;
  return null;
};
export const sanitizeArtifactModifier=(value:unknown):ArtifactModifier|null=>{if(!value||typeof value!=="object")return null;const m=value as ArtifactModifier;return [ORDINARY_TRUE_ARTIFACT_CHANCE,0.001,0.0025,0.15].includes(m.chance)&&["forbidden-x1","forbidden-x2","forbidden-x5-sealed","forbidden-deep-way"].includes(m.source)&&typeof m.consumed==="boolean"?m:null};

export function simulateForbiddenTunnels(iterations:number,seed=20260823){let s=seed|0;const rng=()=>{s=s+0x6D2B79F5|0;let t=Math.imul(s^s>>>15,1|s);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296};const first={x1:0,x2:0,x5:0},second={sealed:0,deep:0};let chance=0;for(let i=0;i<iterations;i++){let state=createForbiddenTunnel(rng,String(i)),result=selectFirstPath(state,FIRST_DIRECTIONS[Math.floor(rng()*3)],rng);const firstOutcome=state.firstAssignments[result.tunnel.firstSelection!];first[firstOutcome]++;if(firstOutcome==="x5"){result=selectSecondPath(result.tunnel,SECOND_DIRECTIONS[Math.floor(rng()*2)]);second[result.tunnel.resolution as SecondOutcome]++}chance+=result.modifier!.chance}const average=chance/iterations;return {iterations,first,second,averageTunnelChance:average,overallBaselineRate:.99*ORDINARY_TRUE_ARTIFACT_CHANCE+.01*average};}
