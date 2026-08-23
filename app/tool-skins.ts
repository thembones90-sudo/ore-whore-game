export type ToolSkin = {
  id: string;
  name: string;
  technicalName: string;
  artwork: string;
  flavor: string;
  unlocked: boolean;
  bark?: string;
  barkSequence?: {text:string;delayMs:number}[];
  silhouette: "pick" | "jackhammer" | "roseheart";
  animation: ToolAnimationProfile;
};

export type ToolAnimationProfile = {
  id: "bonk" | "slash-hook" | "pneumatic" | "graceful-arc";
  impactFx: "dust" | "toxic-sizzle" | "dust-pulses" | "rose-petals";
  sfxFamily: "iron-bonk" | "fel-slice" | "pneumatic-thump" | "crystal-chime";
  engagedLoop: boolean;
};

export const DEFAULT_TOOL_SKIN_ID = "rock-bonker";

export const toolSkins: ToolSkin[] = [
  {
    id: DEFAULT_TOOL_SKIN_ID,
    name: "ROCK BONKER",
    technicalName: "Peon Pickaxe",
    artwork: "/assets/tools/tool-rock-bonker.webp",
    flavor: "Wood, leather, ugly iron, and violence.",
    unlocked: true,
    bark: "Me bonk.",
    silhouette: "pick",
    animation: {id:"bonk",impactFx:"dust",sfxFamily:"iron-bonk",engagedLoop:false},
  },
  {
    id: "revenants-pick",
    name: "REVENANT'S PICK",
    technicalName: "Revenant Mining Pick",
    artwork: "/assets/tool-skins/revenants-pick.webp",
    flavor: "Applying poison to geology has produced no measurable benefit.",
    unlocked: true,
    bark: "Rock die faster.",
    silhouette: "pick",
    animation: {id:"slash-hook",impactFx:"toxic-sizzle",sfxFamily:"fel-slice",engagedLoop:false},
  },
  {
    id: "peoples-jackhammer",
    name: "THE PEOPLE'S JACKHAMMER",
    technicalName: "People's Pneumatic Excavator",
    artwork: "/assets/tool-skins/peoples-jackhammer.webp",
    flavor: "The means of excavation belong to the workers.",
    unlocked: true,
    bark: "Our rock.",
    silhouette: "jackhammer",
    animation: {id:"pneumatic",impactFx:"dust-pulses",sfxFamily:"pneumatic-thump",engagedLoop:true},
  },
  {
    id: "pretty-bonker",
    name: "PRETTY BONKER",
    technicalName: "Roseheart Pickaxe",
    artwork: "/assets/tool-skins/pretty-bonker.webp",
    flavor: "Polished rose-gold craftsmanship. Still intended for geological violence.",
    unlocked: true,
    bark: "Pretty. Still bonk.",
    barkSequence: [{text:"Pretty.",delayMs:0},{text:"Still bonk.",delayMs:650}],
    silhouette: "roseheart",
    animation: {id:"graceful-arc",impactFx:"rose-petals",sfxFamily:"crystal-chime",engagedLoop:false},
  },
];

export const toolSkin = (id: string | undefined) =>
  toolSkins.find((skin) => skin.id === id && skin.unlocked) ?? toolSkins[0];
