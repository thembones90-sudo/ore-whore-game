export type ToolSkin = {
  id: string;
  name: string;
  artwork: string;
  flavor: string;
  unlocked: boolean;
  bark?: string;
  silhouette: "pick" | "jackhammer";
};

export const DEFAULT_TOOL_SKIN_ID = "rock-bonker";

export const toolSkins: ToolSkin[] = [
  {
    id: DEFAULT_TOOL_SKIN_ID,
    name: "ROCK BONKER",
    artwork: "/assets/tools/tool-rock-bonker.webp",
    flavor: "Wood, leather, ugly iron, and violence.",
    unlocked: true,
    bark: "Me bonk.",
    silhouette: "pick",
  },
  {
    id: "revenants-pick",
    name: "REVENANT'S PICK",
    artwork: "/assets/tool-skins/revenants-pick.webp",
    flavor: "Applying poison to geology has produced no measurable benefit.",
    unlocked: true,
    bark: "Rock die faster.",
    silhouette: "pick",
  },
  {
    id: "peoples-jackhammer",
    name: "THE PEOPLE'S JACKHAMMER",
    artwork: "/assets/tool-skins/peoples-jackhammer.webp",
    flavor: "The means of excavation belong to the workers.",
    unlocked: true,
    bark: "Our rock.",
    silhouette: "jackhammer",
  },
];

export const toolSkin = (id: string | undefined) =>
  toolSkins.find((skin) => skin.id === id && skin.unlocked) ?? toolSkins[0];
