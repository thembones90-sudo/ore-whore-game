import test from "node:test";
import assert from "node:assert/strict";
import { ArtifactSequenceRuntime } from "../app/artifacts/sequence.ts";

const artifactId = "sequence-fixture";

const presentationSequence = [
  { type: "dialogue", speaker: "PEON", text: "Boss?", avatarState: "scared" },
  { type: "pause", durationMs: 725 },
  { type: "sound", soundId: "metal-impact" },
  { type: "visual", visualId: "cabinet-flare" },
  { type: "characterAction", character: "FOREMAN", action: "turns-away" },
];

test("runtime starts at zero and advances through authored order without seeking", () => {
  const runtime = new ArtifactSequenceRuntime({ artifactId, sequence: presentationSequence });
  assert.equal(runtime.stepIndex, 0);
  assert.deepEqual(runtime.currentStep, presentationSequence[0]);
  assert.deepEqual(presentationSequence.map(() => runtime.advance()), presentationSequence);
  assert.equal(runtime.complete, true);
  assert.equal(runtime.currentStep, null);
  assert.equal(runtime.currentCommand, null);
  assert.equal(runtime.advance(), null);
});

test("presentation commands retain their typed authored shapes", () => {
  const runtime = new ArtifactSequenceRuntime({ artifactId, sequence: presentationSequence });

  assert.deepEqual(runtime.currentCommand, {
    type: "dialogue",
    speaker: "PEON",
    text: "Boss?",
    avatarState: "scared",
  });
  runtime.advance();
  assert.deepEqual(runtime.currentCommand, { type: "pause", durationMs: 725 });
  runtime.advance();
  assert.deepEqual(runtime.currentCommand, { type: "sound", soundId: "metal-impact" });
  runtime.advance();
  assert.deepEqual(runtime.currentCommand, { type: "visual", visualId: "cabinet-flare" });
  runtime.advance();
  assert.deepEqual(runtime.currentCommand, {
    type: "characterAction",
    character: "FOREMAN",
    action: "turns-away",
  });
});

test("state mutations and achievements execute exactly once", () => {
  const effects = [];
  const sequence = [
    { type: "stateMutation", key: "artifactFound", value: true },
    { type: "achievement", achievementId: "fixture-achievement" },
  ];
  const runtime = new ArtifactSequenceRuntime({
    artifactId,
    sequence,
    permanentEffects: {
      stateMutation: (step, index) => effects.push([index, step.type, step.key]),
      achievement: (step, index) => effects.push([index, step.type, step.achievementId]),
    },
  });

  assert.equal(runtime.currentCommand, null);
  runtime.advance();
  runtime.advance();
  runtime.advance();
  assert.deepEqual(effects, [
    [0, "stateMutation", "artifactFound"],
    [1, "achievement", "fixture-achievement"],
  ]);
  assert.deepEqual(runtime.serialize().completedPermanentSteps, [0, 1]);
});

test("serialized state resumes at the next authored step with permanent effects retained", () => {
  const sequence = [
    { type: "stateMutation", key: "opened", value: true },
    { type: "dialogue", speaker: "SYSTEM", text: "RESUMED." },
    { type: "achievement", achievementId: "resumed-achievement" },
  ];
  let mutations = 0;
  const firstRuntime = new ArtifactSequenceRuntime({
    artifactId,
    sequence,
    permanentEffects: { stateMutation: () => { mutations += 1; } },
  });
  firstRuntime.advance();
  const saved = firstRuntime.serialize();

  let resumedMutations = 0;
  const resumedRuntime = new ArtifactSequenceRuntime({
    artifactId,
    sequence,
    state: saved,
    permanentEffects: { stateMutation: () => { resumedMutations += 1; } },
  });
  assert.equal(resumedRuntime.stepIndex, 1);
  assert.deepEqual(resumedRuntime.currentCommand, sequence[1]);
  assert.deepEqual(resumedRuntime.serialize().completedPermanentSteps, [0]);
  assert.equal(mutations, 1);
  assert.equal(resumedMutations, 0);
});

test("an already-completed permanent authored index is never applied again", () => {
  let achievements = 0;
  const runtime = new ArtifactSequenceRuntime({
    artifactId,
    sequence: [{ type: "achievement", achievementId: "once" }],
    state: { artifactId, stepIndex: 0, completedPermanentSteps: [0] },
    permanentEffects: { achievement: () => { achievements += 1; } },
  });
  runtime.advance();
  assert.equal(achievements, 0);
  assert.equal(runtime.complete, true);
});

test("state from a different artifact safely starts a fresh sequence", () => {
  const runtime = new ArtifactSequenceRuntime({
    artifactId,
    sequence: presentationSequence,
    state: {
      artifactId: "different-artifact",
      stepIndex: 4,
      completedPermanentSteps: [0, 2],
    },
  });
  assert.equal(runtime.stepIndex, 0);
  assert.deepEqual(runtime.currentStep, presentationSequence[0]);
  assert.deepEqual(runtime.serialize().completedPermanentSteps, []);
});

test("serialization returns defensive copies of permanent-step state", () => {
  const runtime = new ArtifactSequenceRuntime({
    artifactId,
    sequence: [{ type: "stateMutation", key: "stable", value: true }],
  });
  runtime.advance();
  const first = runtime.serialize();
  first.completedPermanentSteps.push(99);
  const second = runtime.serialize();
  assert.deepEqual(second.completedPermanentSteps, [0]);
  assert.notEqual(first.completedPermanentSteps, second.completedPermanentSteps);
});
