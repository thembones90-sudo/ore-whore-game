import assert from "node:assert/strict";
import fs from "node:fs";
import test from "node:test";
import { artifactRewardUnlocks, ALIJA_SHOVEL_ARTIFACT_ID, ALIJA_SHOVEL_SKIN_ID } from "../app/artifact-rewards.ts";

const page = fs.readFileSync(new URL("../app/page.tsx", import.meta.url), "utf8");
const artifacts = fs.readFileSync(new URL("../app/true-artifacts.ts", import.meta.url), "utf8");
const skins = fs.readFileSync(new URL("../app/tool-skins.ts", import.meta.url), "utf8");

test("existing Alija discoveries migrate into the permanent cosmetic unlock", () => {
  assert.deepEqual(artifactRewardUnlocks([], { [ALIJA_SHOVEL_ARTIFACT_ID]: 1 }), [ALIJA_SHOVEL_SKIN_ID]);
  assert.deepEqual(artifactRewardUnlocks([ALIJA_SHOVEL_SKIN_ID], { [ALIJA_SHOVEL_ARTIFACT_ID]: 1 }), [ALIJA_SHOVEL_SKIN_ID]);
});

test("Alija's Shovel is unique TRUE Artefact data with the canonical bark and reward", () => {
  assert.match(artifacts, /name:"ALIJA'S SHOVEL"/);
  assert.match(artifacts, /Boss, me need biggest shovel\. This shovel best\./);
  assert.match(artifacts, /rewardSkinId:ALIJA_SHOVEL_SKIN_ID/);
  assert.match(page, /PICKAXE SKIN UNLOCKED — ALIJA'S SHOVEL/);
  assert.match(page, /trueArtifacts:\{\.\.\.s\.trueArtifacts,\[artifact\.id\]:1\}/);
});

test("the shovel is a locked cosmetic model and never a gameplay technology", () => {
  assert.match(skins, /id: ALIJA_SHOVEL_SKIN_ID/);
  assert.match(skins, /unlockArtifactId: "alijas-shovel"/);
  assert.match(skins, /silhouette: "shovel"/);
  assert.match(skins, /unlocked: false/);
  assert.doesNotMatch(skins, /trueArtifactChance|damage|actionDurationMs/);
});
