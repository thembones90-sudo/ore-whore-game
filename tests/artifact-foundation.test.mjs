import test from "node:test";
import assert from "node:assert/strict";
import { ARTIFACT_CATALOG } from "../app/artifacts/catalog.ts";
import {
  getNormalArtifactTotal,
  getOrdinaryArtifactPool,
  getOwnedNormalArtifactCount,
  selectOrdinaryArtifact,
} from "../app/artifacts/selection.ts";

const canonicalIds = [
  "blessed-chainsword",
  "hair-gel",
  "green-diamond",
  "pixel-pickaxe",
];

const fixture = (overrides) => ({
  id: "fixture",
  role: "ARTIFACT",
  name: "FIXTURE",
  image: "/fixture.webp",
  cabinetText: "Fixture.",
  achievementId: "fixture",
  selectionWeight: 1,
  discoverySequence: [],
  ...overrides,
});

test("catalog contains each of the first four canonical artifacts exactly once", () => {
  assert.equal(ARTIFACT_CATALOG.length, 4);
  for (const id of canonicalIds) {
    assert.equal(ARTIFACT_CATALOG.filter(artifact => artifact.id === id).length, 1);
  }
  assert.equal(new Set(ARTIFACT_CATALOG.map(artifact => artifact.id)).size, ARTIFACT_CATALOG.length);
  assert.ok(ARTIFACT_CATALOG.every(artifact => artifact.role === "ARTIFACT"));
});

test("cross-reality geology artifacts share their locked set", () => {
  const greenDiamond = ARTIFACT_CATALOG.find(artifact => artifact.id === "green-diamond");
  const pixelPickaxe = ARTIFACT_CATALOG.find(artifact => artifact.id === "pixel-pickaxe");
  assert.equal(greenDiamond?.setId, "cross-reality-geology");
  assert.equal(pixelPickaxe?.setId, "cross-reality-geology");
});

test("ordinary selection structurally excludes GUEST and FINAL roles", () => {
  const catalog = [
    fixture({ id: "ordinary" }),
    fixture({ id: "guest", role: "GUEST" }),
    fixture({ id: "final", role: "FINAL" }),
  ];
  assert.deepEqual(getOrdinaryArtifactPool(catalog).map(artifact => artifact.id), ["ordinary"]);
  assert.equal(selectOrdinaryArtifact(catalog, () => 0)?.id, "ordinary");
});

test("ordinary selection excludes owned and ineligible ARTIFACT entries", () => {
  const catalog = [
    fixture({ id: "owned" }),
    fixture({ id: "ineligible", eligibility: () => false }),
    fixture({ id: "eligible", eligibility: context => context.unlocked === true }),
  ];
  assert.deepEqual(
    getOrdinaryArtifactPool(catalog, { owned: 1 }, { unlocked: true }).map(artifact => artifact.id),
    ["eligible"],
  );
});

test("normal totals and owned counts derive from catalog roles", () => {
  const catalog = [
    ...ARTIFACT_CATALOG,
    fixture({ id: "extra-normal" }),
    fixture({ id: "guest", role: "GUEST" }),
    fixture({ id: "final", role: "FINAL" }),
  ];
  assert.equal(getNormalArtifactTotal(catalog), 5);
  assert.equal(getOwnedNormalArtifactCount(catalog, {
    "blessed-chainsword": 1,
    "extra-normal": true,
    guest: 1,
    final: 1,
  }), 2);
});
