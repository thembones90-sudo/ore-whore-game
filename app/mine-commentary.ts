export type MineCommentary = { id:string; headline:string; subtitle:string };

export const NORMAL_DIGGING_COMMENTARY:MineCommentary[]=[
  {id:"dig-hit-again",headline:"HIT IT AGAIN.",subtitle:"Previous attempts have established that persistence can substitute for thought."},
  {id:"dig-rock-remains",headline:"THE ROCK REMAINS.",subtitle:"An embarrassing development for everyone involved."},
  {id:"dig-continue-genius",headline:"CONTINUE, GENIUS.",subtitle:"Perhaps the next identical swing will reveal your hidden potential."},
  {id:"dig-still-wall",headline:"STILL A WALL.",subtitle:"Excellent observational work. Resume violence."},
  {id:"dig-progress-allegedly",headline:"PROGRESS. ALLEGEDLY.",subtitle:"Several rocks have expressed concern. None were important."},
  {id:"dig-more-force",headline:"APPLY MORE FORCE.",subtitle:"Thinking remains unnecessary and therefore safely beyond scope."},
  {id:"dig-back-work",headline:"BACK TO WORK.",subtitle:"The mountain was beginning to enjoy the silence."},
  {id:"dig-swing-peon",headline:"SWING, PEON.",subtitle:"History will remember none of this."},
  {id:"dig-impressive",headline:"VERY IMPRESSIVE.",subtitle:"You have successfully made the wall slightly worse."},
  {id:"dig-keep-hitting",headline:"KEEP HITTING IT.",subtitle:"Eventually either the rock or your employment will end."},
  {id:"dig-professional",headline:"DIG, PROFESSIONAL.",subtitle:"Your qualifications remain under active investigation."},
  {id:"dig-more-violence",headline:"MORE VIOLENCE.",subtitle:"At last, a task suited to your training."},
  {id:"dig-steed-intellectual",headline:"ONWARDS, MY STEED.",subtitle:"The resemblance to a horse is primarily intellectual."},
  {id:"dig-steed-finesse",headline:"ONWARDS, MY STEED.",subtitle:"There are rocks ahead requiring your particular lack of finesse."},
  {id:"dig-steed-gallop",headline:"ONWARDS, MY STEED.",subtitle:"Gallop bravely toward another wall and hit it."},
  {id:"dig-steed-management",headline:"ONWARDS, MY STEED.",subtitle:"Management regrets discovering that encouragement works on you."},
];

export const ORE_EXPOSED_COMMENTARY:MineCommentary[]=[
  {id:"ore-found-something",headline:"YOU FOUND SOMETHING.",subtitle:"Statistically, this had to happen eventually."},
  {id:"ore-miraculous",headline:"MIRACULOUS.",subtitle:"Your random violence has produced a measurable result."},
  {id:"ore-actual",headline:"ACTUAL ORE.",subtitle:"Try not to look surprised."},
  {id:"ore-there",headline:"THERE IT IS.",subtitle:"Even you were bound to hit something eventually."},
  {id:"ore-deposit-somehow",headline:"A DEPOSIT. SOMEHOW.",subtitle:"Management has reviewed the footage and remains confused."},
  {id:"ore-productivity",headline:"PRODUCTIVITY DETECTED.",subtitle:"Please remain calm. This may be temporary."},
  {id:"ore-contact",headline:"CONTACT.",subtitle:"Against considerable odds, you struck the correct rock."},
  {id:"ore-not-useless",headline:"NOT COMPLETELY USELESS.",subtitle:"A temporary classification. Do not become attached to it."},
  {id:"ore-well-shit",headline:"WELL, SHIT.",subtitle:"The methodology was appalling. The result is nevertheless valid."},
  {id:"ore-rock-had",headline:"THE ROCK HAD ORE.",subtitle:"Your contribution was mostly being nearby with a pickaxe."},
  {id:"ore-success-technically",headline:"SUCCESS. TECHNICALLY.",subtitle:"Standards have been adjusted accordingly."},
  {id:"ore-look",headline:"LOOK WHAT YOU DID.",subtitle:"Nobody is more surprised than Quality Assurance."},
];

export const RARITY_COMMENTARY:Record<string,MineCommentary|undefined>={
  Common:{id:"rarity-common",headline:"ANOTHER ONE.",subtitle:"Please contain your excitement. Or don't. Nobody is listening."},
  Rare:{id:"rarity-rare",headline:"INTERESTING.",subtitle:"You appear to have accidentally justified your continued employment."},
  Epic:{id:"rarity-epic",headline:"UNEXPECTED COMPETENCE.",subtitle:"Management requests that you refrain from making this a habit."},
  Legendary:{id:"rarity-legendary",headline:"THIS IS CONCERNING.",subtitle:"Repeated success may force us to revise your personnel file."},
};

export const TRUE_ARTIFACT_COMMENTARY:MineCommentary={id:"true-stop",headline:"...STOP.",subtitle:"That is not ore."};

// Ghost Mines (Chapter II) ambient pool — SYSTEM has incomplete information
// here and stays clinical about it: measurements, observations, failed
// classifications, confirmations without explanations. Never frightened,
// never mystical. Peon is quieter and less frequent than elsewhere, so this
// stays a small, restrained pool (existing anti-repeat logic in
// selectMineCommentary already keeps it from feeling too repetitive).
export const GHOST_MINE_AMBIENT_COMMENTARY:MineCommentary[]=[
  {id:"ghost-acoustic",headline:"ACOUSTIC RETURN INCONSISTENT.",subtitle:"PEON: “...what?”"},
  {id:"ghost-bio-none",headline:"BIOLOGICAL ACTIVITY: NONE DETECTED.",subtitle:"Confirmed."},
  {id:"ghost-bio-still",headline:"BIOLOGICAL ACTIVITY: STILL NONE.",subtitle:"Noted for the record."},
  {id:"ghost-no-match",headline:"NO SURVEY MATCH.",subtitle:"Checked twice."},
  {id:"ghost-classification-failed",headline:"CLASSIFICATION UNSUCCESSFUL.",subtitle:"Sample matches no known stratum."},
  {id:"ghost-measurement-unchanged",headline:"MEASUREMENT UNCHANGED.",subtitle:"Repeating it does not make it different."},
  {id:"ghost-quiet-here",headline:"IT IS VERY QUIET HERE.",subtitle:"PEON: “...zug zug.”"},
];

// Ghost Mines one-time entrance sequence — shown once, on first entry, per
// the design brief's exact script. Not the ambient pool above.
export const GHOST_ENTRY_SYSTEM_OPENING:string[]=[
  "Unknown cavity system detected.",
  "Geological survey unavailable.",
  "Known geological profile: no match.",
  "Structural supports: none detected.",
  "Rail infrastructure: none detected.",
  "Biological activity: none detected.",
  "Mine origin: unknown.",
];
export const GHOST_ENTRY_REGISTER={headline:"UNKNOWN CAVITY NETWORK",subtitle:"NO AUTHORIZED DESIGNATION"};
export const GHOST_ENTRY_CLOSING:{speaker:"SYSTEM"|"SHADEZ"|"PEON";text:string}[]=[
  {speaker:"SHADEZ",text:"Continued excavation is not recommended."},
  {speaker:"SHADEZ",text:"Unfortunately, you requested indefinite excavation."},
  {speaker:"SYSTEM",text:"Employment status: ACTIVE."},
  {speaker:"PEON",text:"Tunnel already dug? Good. Less work."},
];

export function eligibleOreCommentary(rarity:string):MineCommentary[]{
  const override=RARITY_COMMENTARY[rarity];
  return override?[...ORE_EXPOSED_COMMENTARY,override]:ORE_EXPOSED_COMMENTARY;
}

export function selectMineCommentary(pool:MineCommentary[],recent:string[],random:()=>number=Math.random,historySize=5):MineCommentary{
  const blocked=new Set(recent.slice(-historySize));
  const eligible=pool.filter(pair=>!blocked.has(pair.id));
  const choices=eligible.length?eligible:pool;
  const selected=choices[Math.min(choices.length-1,Math.floor(random()*choices.length))];
  recent.push(selected.id);
  if(recent.length>historySize)recent.splice(0,recent.length-historySize);
  return selected;
}
