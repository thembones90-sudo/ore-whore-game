import { ALIJA_SHOVEL_ARTIFACT_ID, ALIJA_SHOVEL_SKIN_ID } from "./artifact-rewards.ts";

export type TrueArtifactTheme = "gold" | "fel" | "biological" | "shadow" | "archive" | "glitch" | "frost" | "infernal";

export type TrueArtifact = {
  id: string;
  name: string;
  announcement: string;
  lore: string;
  lockedClue: string;
  peonBark: string;
  peonBarkSequence?: { text: string; delayMs: number }[];
  image: string;
  selectionWeight: number | null;
  theme?: TrueArtifactTheme;
  ultimate?: boolean;
  instruction?: string;
  systemResponse?: string;
  rewardSkinId?: string;
};

// Ordinary TRUE Artefacts exist outside the geological taxonomy. Selection
// weights choose among still-undiscovered entries only after the ordinary
// per-excavation gate has succeeded; they never alter that gate's chance.
export const ordinaryTrueArtifacts: readonly TrueArtifact[] = [
  {id:"ronaldo",name:"PANINI GOLDEN STICKER OF RONALDO NAZÁRIO",announcement:"THE PHENOMENON HAS BEEN DETECTED.",lore:"Some things are rarer than minerals. Some things are simply eternal.",lockedClue:"Some numbers are worn. One was worshipped.",peonBark:"Boss... this not man. This Ronaldo. Peon take hat off.",peonBarkSequence:[{text:"Boss... this not man.",delayMs:0},{text:"This Ronaldo.",delayMs:700},{text:"Peon take hat off.",delayMs:1700}],image:"/assets/true/ronaldo.webp",selectionWeight:1,theme:"gold"},
  {id:"warglaive",name:"WARGLAIVE OF ILLIDAN",announcement:"YOU ARE NOT PREPARED.",lore:"A crescent of fel-forged defiance. It remembers every hand unworthy of holding it.",lockedClue:"A small thing carrying a very large grudge.",peonBark:"Sharp rock.",image:"/assets/true/warglaive.webp",selectionWeight:1,theme:"fel"},
  {id:"blaizeballs",name:"BLAIZE'S BALLS",announcement:"BIOLOGICAL MATERIAL DETECTED. UNFORTUNATELY.",lore:"Two matching specimens. Classification was attempted and immediately abandoned.",lockedClue:"An image was preserved that should have died with the scanner.",peonBark:"...two rock?",image:"/assets/true/blaizeballs.webp",selectionWeight:1,theme:"biological"},
  {id:"shadow",name:"SHADOW THE PANTHER",announcement:"ANOMALOUS OBJECT DETECTED",lore:"He cannot see it. He knows exactly where it is.",lockedClue:"Something is watching from the dark.",peonBark:"Cat?",image:"/assets/true/shadow.webp",selectionWeight:1,theme:"shadow",systemResponse:"WUUUUUUUUUU"},
  {id:"whorearchives",name:"WHORE ARCHIVES",announcement:"RESTRICTED RECORDS HAVE SURFACED.",lore:"A sealed record of names, depths, and decisions the mountain denies preserving.",lockedClue:"There are records beneath the records.",peonBark:"Me can read?",image:"/assets/true/whorearchives.webp",selectionWeight:1,theme:"archive"},
  {id:"patike",name:"PATIKE",announcement:"DIRECTORY DETECTED. ACCESS SHOULD NOT EXIST.",lore:"The folder opened itself. The access log insists that you were never here.",lockedClue:"The folder exists. This is already too much information.",peonBark:"Me open folder.",image:"/assets/true/patike.webp",selectionWeight:1,theme:"glitch"},
  {id:"invincible",name:"INVINCIBLE'S REINS",announcement:"MOUNT EQUIPMENT DETECTED. MOUNT ABSENT.",lore:"The reins are immaculate. Their owner remains committed to being elsewhere.",lockedClue:"A loyal servant, both in life and death.",peonBark:"...where horse?",image:"/assets/true/invincible.webp",selectionWeight:1,theme:"frost"},
  {id:ALIJA_SHOVEL_ARTIFACT_ID,name:"ALIJA'S SHOVEL",announcement:"OVERSIZED EXCAVATION EQUIPMENT DETECTED.",lore:"A legendary shovel, preserved because ordinary geology was no longer sufficient.",lockedClue:"Something larger than the job description remains buried.",peonBark:"Boss, me need biggest shovel. This shovel best.",image:"/assets/true/alijas-shovel.webp",selectionWeight:1,theme:"gold",rewardSkinId:ALIJA_SHOVEL_SKIN_ID},
];

export const findOrdinaryTrueArtifact = (artifactId: string) =>
  ordinaryTrueArtifacts.find(artifact => artifact.id === artifactId) ?? null;

export const pickOrdinaryTrueArtifact = (
  random: () => number,
  owned: Readonly<Record<string, number>>,
) => {
  const configured = ordinaryTrueArtifacts.filter(
    artifact => artifact.selectionWeight !== null && artifact.selectionWeight > 0 && !owned[artifact.id],
  );
  if (!configured.length) return null;
  const total = configured.reduce((sum, artifact) => sum + artifact.selectionWeight!, 0);
  let roll = random() * total;
  return configured.find(artifact => (roll -= artifact.selectionWeight!) <= 0) ?? configured[0];
};
