export type BerserkModeId = "agitated" | "berserk" | "feral";

export type BerserkMode = {
  id:BerserkModeId;name:string;cost:number;durationMs:number;
  damageMultiplier:number;intervalMultiplier:number;criticalBonus:number;audioIntensity:number;
  activationLine:string;endLine:string;
};
export type ActiveBerserk = {mode:BerserkModeId;startedAt:number;expiresAt:number};

export const BERSERK_MODES:readonly BerserkMode[] = Object.freeze([
  {id:"agitated",name:"I — RAGE",cost:150,durationMs:45_000,damageMultiplier:1.35,intervalMultiplier:.78,criticalBonus:.05,audioIntensity:1.04,activationLine:"Peon feel efficient. Peon hate it.",endLine:"Boss... Peon can hear colors."},
  {id:"berserk",name:"II — BLOODRAGE",cost:300,durationMs:30_000,damageMultiplier:1.9,intervalMultiplier:.52,criticalBonus:.16,audioIntensity:1.1,activationLine:"ROCK START RUNNING.",endLine:"Peon heart mining too."},
  {id:"feral",name:"III — BLOODFURY",cost:750,durationMs:18_000,damageMultiplier:3.5,intervalMultiplier:.24,criticalBonus:.4,audioIntensity:1.18,activationLine:"PEON IS THE PICKAXE NOW.",endLine:"Boss... walls still moving."},
]);
export const berserkMode=(id?:string|null)=>BERSERK_MODES.find(mode=>mode.id===id)||null;
export const activeBerserkMode=(active:ActiveBerserk|null|undefined,now=Date.now())=>active&&active.expiresAt>now?berserkMode(active.mode):null;
export const berserkRemainingMs=(active:ActiveBerserk|null|undefined,now=Date.now())=>Math.max(0,(active?.expiresAt||0)-now);
export const activateBerserk=(dust:number,id:BerserkModeId,now=Date.now())=>{const mode=berserkMode(id);if(!mode||dust<mode.cost)return null;return {dust:dust-mode.cost,dustSpent:mode.cost,active:{mode:id,startedAt:now,expiresAt:now+mode.durationMs} satisfies ActiveBerserk}};
export const sanitizeActiveBerserk=(value:unknown,now=Date.now()):ActiveBerserk|null=>{if(!value||typeof value!=="object")return null;const source=value as Partial<ActiveBerserk>,mode=berserkMode(source.mode);if(!mode||!Number.isFinite(source.startedAt)||!Number.isFinite(source.expiresAt)||Number(source.expiresAt)<=now)return null;return {mode:mode.id,startedAt:Number(source.startedAt),expiresAt:Number(source.expiresAt)}};
