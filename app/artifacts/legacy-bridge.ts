import { ARTIFACT_CATALOG } from "./catalog.ts";
import { ArtifactPresentationBridge } from "./presentation.ts";
import {
  ArtifactSequenceRuntime,
  type ArtifactPermanentEffectHandlers,
} from "./sequence.ts";
import type { Artifact, ArtifactSequenceStep } from "./types.ts";
import { ordinaryTrueArtifacts, type TrueArtifact } from "../true-artifacts.ts";

export const catalogArtifactAsLegacyEncounter = (artifact: Artifact): TrueArtifact => ({
  id: artifact.id,
  name: artifact.displayName,
  announcement: artifact.displayName,
  lore: artifact.cabinetText,
  lockedClue: "CLASSIFIED",
  peonBark: "",
  image: artifact.image,
  selectionWeight: artifact.selectionWeight,
});

export const ordinaryArtifactEncounterPool: readonly TrueArtifact[] = [
  ...ordinaryTrueArtifacts,
  ...ARTIFACT_CATALOG
    .filter(artifact => artifact.role === "ARTIFACT")
    .map(catalogArtifactAsLegacyEncounter),
];

export const findOrdinaryArtifactEncounter = (artifactId: string) =>
  ordinaryArtifactEncounterPool.find(artifact => artifact.id === artifactId) ?? null;

export const pickOrdinaryArtifactEncounter = (
  random: () => number,
  owned: Readonly<Record<string, number>>,
) => {
  const available = ordinaryArtifactEncounterPool.filter(artifact =>
    artifact.selectionWeight !== null
    && artifact.selectionWeight > 0
    && !owned[artifact.id]);
  if (!available.length) return null;
  const totalWeight = available.reduce((sum, artifact) => sum + artifact.selectionWeight!, 0);
  let roll = random() * totalWeight;
  return available.find(artifact => (roll -= artifact.selectionWeight!) <= 0) ?? available[0];
};

// The legacy encounter still owns discovery and excavation. Stable IDs are the
// only compatibility seam: authored catalog entries opt into the new reveal,
// while every other encounter remains on TrueReveal.
export const findSequencedCatalogArtifact = (artifactId: string): Artifact | null => {
  const artifact = ARTIFACT_CATALOG.find(entry => entry.id === artifactId);
  return artifact && artifact.discoverySequence.length > 0 ? artifact : null;
};

export const createArtifactRevealBridge = (
  artifact: Artifact,
  permanentEffects: ArtifactPermanentEffectHandlers = {},
  completionSequence: readonly ArtifactSequenceStep[] = [],
) => new ArtifactPresentationBridge(new ArtifactSequenceRuntime({
  artifactId: artifact.id,
  sequence: [...artifact.discoverySequence, ...completionSequence],
  permanentEffects,
}));
