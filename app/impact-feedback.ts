export type ImpactResult="normal"|"miss"|"crit"|"perfect"|"perfectCrit";
export type ImpactPoint={x:number;y:number};
export type ImpactFeedback={id:number;kind:ImpactResult;impactX:number;impactY:number;spawnOffsetX:number;driftX:number;rise:number;lifetimeMs:number};

export const IMPACT_FEEDBACK_MIN_LIFETIME_MS=700;
export const IMPACT_FEEDBACK_MAX_LIFETIME_MS=950;

const between=(random:()=>number,min:number,max:number)=>min+(max-min)*random();

export function createImpactFeedback(id:number,kind:ImpactResult,point:ImpactPoint,random:()=>number=Math.random):ImpactFeedback{
  return {
    id,
    kind,
    impactX:point.x,
    impactY:point.y,
    spawnOffsetX:between(random,-18,18),
    driftX:between(random,-20,20),
    rise:between(random,50,70),
    lifetimeMs:between(random,IMPACT_FEEDBACK_MIN_LIFETIME_MS,IMPACT_FEEDBACK_MAX_LIFETIME_MS),
  };
}

export const appendImpactFeedback=(current:ImpactFeedback[],next:ImpactFeedback)=>[...current,next];
export const removeImpactFeedback=(current:ImpactFeedback[],id:number)=>current.filter(item=>item.id!==id);

