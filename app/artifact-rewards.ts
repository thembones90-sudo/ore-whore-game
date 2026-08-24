export const ALIJA_SHOVEL_ARTIFACT_ID = "alijas-shovel";
export const ALIJA_SHOVEL_SKIN_ID = "alijas-shovel";

export const artifactRewardUnlocks = (
  unlocks: string[] | undefined,
  trueArtifacts: Record<string, number> | undefined,
) => {
  const migrated = new Set(unlocks ?? []);
  if (Number(trueArtifacts?.[ALIJA_SHOVEL_ARTIFACT_ID] ?? 0) > 0) {
    migrated.add(ALIJA_SHOVEL_SKIN_ID);
  }
  return [...migrated];
};
