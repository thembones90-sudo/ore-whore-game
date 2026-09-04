import type { ArtifactSequenceStep } from "./types.ts";

export type ArtifactSetDefinition = {
  id: string;
  memberIds: readonly string[];
  achievementId: string;
  completionSequence: readonly ArtifactSequenceStep[];
};

export const ARTIFACT_SETS = [
  {
    id: "heed-the-call",
    memberIds: ["storm", "earth", "fire"],
    achievementId: "heed-the-call",
    completionSequence: [
      { type: "visual", visualId: "three-totems-activate" },
      { type: "visual", visualId: "tauren-war-drums" },
      { type: "pause", durationMs: 650 },
      { type: "dialogue", speaker: "PEON", text: "Me heed the call." },
      { type: "pause", durationMs: 650 },
      { type: "dialogue", speaker: "PEON", text: "Me answer." },
      { type: "achievement", achievementId: "heed-the-call" }
    ],
  },
  {
    id: "nephilim-lives",
    memberIds: [
      "broken-whip",
      "spent-cylinder",
      "shattered-greatsword",
      "chipped-scythe",
    ],
    achievementId: "nephilim-lives",
    completionSequence: [
      { type: "visual", visualId: "four-relics-appear" },
      { type: "dialogue", speaker: "PEON", text: "Me like three.", avatarState: "proud" },
      { type: "dialogue", speaker: "FOREMAN", text: "Why three?" },
      { type: "dialogue", speaker: "PEON", text: "Three angry. One scary." },
      { type: "dialogue", speaker: "FOREMAN", text: "Fair, I suppose." },
      { type: "dialogue", speaker: "SYSTEM", text: "And the number shall always be four." },
      { type: "pause", durationMs: 650 },
      { type: "dialogue", speaker: "PEON", text: "Me like undead horse.", avatarState: "proud" },
      { type: "achievement", achievementId: "nephilim-lives" }
    ],
  },
  {
    id: "choose-a-side",
    memberIds: ["m16", "ak-47"],
    achievementId: "choose-a-side",
    completionSequence: [
      { type: "dialogue", speaker: "PEON", text: "Boss… which better?" },
      { type: "dialogue", speaker: "SYSTEM", text: "Do not start this.", avatarState: "deadpan" },
      { type: "characterAction", character: "PEON", action: "Peon looks at M16." },
      { type: "characterAction", character: "PEON", action: "Peon looks at AK." },
      { type: "dialogue", speaker: "PEON", text: "But—" },
      { type: "dialogue", speaker: "SYSTEM", text: "NO.", avatarState: "panic" },
      { type: "achievement", achievementId: "choose-a-side" }
    ],
  },
  {
    id: "finish-him",
    memberIds: ["yellow-ninja-mask", "blue-ninja-mask"],
    achievementId: "finish-him",
    completionSequence: [
      { type: "visual", visualId: "yellow-and-blue-masks-appear" },
      { type: "dialogue", speaker: "PEON", text: "Boss… two rogue.", avatarState: "proud" },
      { type: "dialogue", speaker: "FOREMAN", text: "…", avatarState: "stunned" },
      { type: "dialogue", speaker: "SYSTEM", text: "Two rogues detected.", avatarState: "deadpan" },
      { type: "dialogue", speaker: "PEON", text: "Me told.", avatarState: "proud" },
      { type: "dialogue", speaker: "FOREMAN", text: "I hate you.", avatarState: "angry" },
      { type: "visual", visualId: "achievement-lands-finish-him" },
      { type: "achievement", achievementId: "finish-him" }
    ],
  },
  {
    id: "cross-reality-geology",
    memberIds: [
      "wrong-ore",
      "blue-mineral",
      "green-diamond",
      "pixel-pickaxe",
    ],
    achievementId: "simulator-simulator",
    completionSequence: [
      { type: "visual", visualId: "four-objects-appear" },
      { type: "dialogue", speaker: "PEON", text: "Ore!", avatarState: "proud" },
      { type: "dialogue", speaker: "SYSTEM", text: "Yes!", avatarState: "panic" },
      { type: "dialogue", speaker: "PEON", text: "HUH?!", avatarState: "scared" },
      { type: "dialogue", speaker: "SYSTEM", text: "Yes, wrong.", avatarState: "deadpan" },
      { type: "dialogue", speaker: "PEON", text: "Boss?!?!", avatarState: "scared" },
      { type: "dialogue", speaker: "FOREMAN", text: "No." },
      { type: "dialogue", speaker: "PEON", text: "TWO HANDS?", avatarState: "proud" },
      { type: "dialogue", speaker: "FOREMAN", text: "No." },
      { type: "dialogue", speaker: "PEON", text: "GREEN MINERAL?", avatarState: "proud" },
      { type: "dialogue", speaker: "SYSTEM", text: "No.", avatarState: "deadpan" },
      { type: "dialogue", speaker: "PEON", text: "MORE ORE?!", avatarState: "proud" },
      { type: "dialogue", speaker: "SYSTEM", text: "No.", avatarState: "deadpan" },
      { type: "pause", durationMs: 650 },
      { type: "dialogue", speaker: "PEON", text: "Me hate this place.", avatarState: "angry" },
      { type: "visual", visualId: "achievement-lands-simulator-simulator" },
      { type: "achievement", achievementId: "simulator-simulator" }
    ],
  },
] as const satisfies readonly ArtifactSetDefinition[];

export const pendingArtifactSetCompletionSequence = (
  triggeringArtifactId: string,
  owned: Readonly<Record<string, number | boolean | undefined>>,
  earnedAchievements: readonly string[],
): readonly ArtifactSequenceStep[] => ARTIFACT_SETS
  .filter(set =>
    set.memberIds.some(memberId => memberId === triggeringArtifactId)
    && set.memberIds.every(memberId => Boolean(owned[memberId]))
    && !earnedAchievements.includes(set.achievementId))
  .flatMap(set => [...set.completionSequence] as ArtifactSequenceStep[]);
