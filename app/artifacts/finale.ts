import { ARTIFACT_CATALOG } from "./catalog.ts";
import type { ArtifactSequenceStep } from "./types.ts";

export const FINAL_ARTIFACT_ID = "scratched-disc";
export const UNRAVELLED_ACHIEVEMENT_ID = "unravelled";

const normalArtifacts = () => ARTIFACT_CATALOG.filter(artifact => artifact.role === "ARTIFACT");

export const normalArtifactTotal = () => normalArtifacts().length;

export const ownedNormalArtifactCount = (owned: Readonly<Record<string, number | boolean | undefined>>) =>
  normalArtifacts().filter(artifact => Boolean(owned[artifact.id])).length;

export const normalCollectionComplete = (owned: Readonly<Record<string, number | boolean | undefined>>) =>
  normalArtifactTotal() > 0 && ownedNormalArtifactCount(owned) === normalArtifactTotal();

export const finalDiscoveryArmed = (
  owned: Readonly<Record<string, number | boolean | undefined>>,
  achievements: readonly string[],
) => achievements.includes(UNRAVELLED_ACHIEVEMENT_ID) && !owned[FINAL_ARTIFACT_ID];

export const shouldDiscoverFinal = finalDiscoveryArmed;

export const ancientSlotAvailable = (
  owned: Readonly<Record<string, number | boolean | undefined>>,
  ancientSlotActivated: boolean,
) => Boolean(owned[FINAL_ARTIFACT_ID]) && !ancientSlotActivated;

export const moonTransitionAvailable = (ancientSlotActivated: boolean, moonStage: number) =>
  ancientSlotActivated && moonStage > 0 && moonStage < 3;

export const ANCIENT_SLOT_SEQUENCE: readonly ArtifactSequenceStep[] = [
  { type: "visual", visualId: "disc-enters-ancient-slot" },
  { type: "sound", soundId: "rrrrrr" },
  { type: "sound", soundId: "click" },
  { type: "pause", durationMs: 1200 },
  { type: "visual", visualId: "loading" },
];

export const MOON_WORMHOLE_SEQUENCE: readonly ArtifactSequenceStep[] = [
  { type: "visual", visualId: "ancient-mechanism-powers-up" },
  { type: "visual", visualId: "space-distorts" },
  { type: "visual", visualId: "wormhole-opens" },
  { type: "pause", durationMs: 1400 },
];
