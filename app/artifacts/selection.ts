import type { Artifact, ArtifactEligibilityContext } from "./types.ts";

export type OwnedArtifacts = Readonly<Record<string, number | boolean | undefined>>;

const isOwned = (owned: OwnedArtifacts, artifactId: string) => Boolean(owned[artifactId]);

const isEligible = (artifact: Artifact, context: ArtifactEligibilityContext) =>
  artifact.eligibility?.(context) ?? true;

export const getOrdinaryArtifactPool = (
  catalog: readonly Artifact[],
  owned: OwnedArtifacts = {},
  context: ArtifactEligibilityContext = {},
) => catalog.filter(artifact =>
  artifact.role === "ARTIFACT"
  && artifact.selectionWeight > 0
  && !isOwned(owned, artifact.id)
  && isEligible(artifact, context));

export const selectOrdinaryArtifact = (
  catalog: readonly Artifact[],
  random: () => number,
  owned: OwnedArtifacts = {},
  context: ArtifactEligibilityContext = {},
) => {
  const pool = getOrdinaryArtifactPool(catalog, owned, context);
  if (!pool.length) return null;

  const totalWeight = pool.reduce((sum, artifact) => sum + artifact.selectionWeight, 0);
  let roll = random() * totalWeight;
  return pool.find(artifact => (roll -= artifact.selectionWeight) <= 0) ?? pool[pool.length - 1];
};

export const getNormalArtifactTotal = (catalog: readonly Artifact[]) =>
  catalog.filter(artifact => artifact.role === "ARTIFACT").length;

export const getOwnedNormalArtifactCount = (
  catalog: readonly Artifact[],
  owned: OwnedArtifacts,
) => catalog.filter(artifact => artifact.role === "ARTIFACT" && isOwned(owned, artifact.id)).length;
