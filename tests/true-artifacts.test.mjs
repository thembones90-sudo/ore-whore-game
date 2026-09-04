import test from "node:test";
import assert from "node:assert/strict";
import {
  findOrdinaryTrueArtifact,
  ordinaryTrueArtifacts,
  pickOrdinaryTrueArtifact,
} from "../app/true-artifacts.ts";

test("ordinary TRUE Artefacts are the canonical unique eight and exclude ASOC", () => {
  assert.equal(ordinaryTrueArtifacts.length, 8);
  assert.equal(new Set(ordinaryTrueArtifacts.map(artifact => artifact.id)).size, 8);
  assert.equal(findOrdinaryTrueArtifact("asoc"), null);
  assert.equal(ordinaryTrueArtifacts.some(artifact => artifact.ultimate), false);
});

test("ordinary selection excludes owned entries without changing configured weights", () => {
  const first = ordinaryTrueArtifacts[0];
  const selected = pickOrdinaryTrueArtifact(() => 0, { [first.id]: 1 });
  assert.equal(selected?.id, ordinaryTrueArtifacts[1].id);
  assert.deepEqual(ordinaryTrueArtifacts.map(artifact => artifact.selectionWeight), Array(8).fill(1));
});

test("ordinary selection returns null after all eight are discovered", () => {
  const owned = Object.fromEntries(ordinaryTrueArtifacts.map(artifact => [artifact.id, 1]));
  assert.equal(pickOrdinaryTrueArtifact(() => 0.5, owned), null);
});
