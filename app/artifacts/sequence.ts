import type { ArtifactSequenceStep } from "./types.ts";

export type ArtifactPresentationCommand = Extract<
  ArtifactSequenceStep,
  { type: "dialogue" | "pause" | "sound" | "visual" | "characterAction" }
>;

export type ArtifactSequenceState = {
  artifactId: string;
  stepIndex: number;
  completedPermanentSteps: number[];
};

type StateMutationStep = Extract<ArtifactSequenceStep, { type: "stateMutation" }>;
type AchievementStep = Extract<ArtifactSequenceStep, { type: "achievement" }>;

export type ArtifactPermanentEffectHandlers = {
  stateMutation?: (step: StateMutationStep, stepIndex: number) => void;
  achievement?: (step: AchievementStep, stepIndex: number) => void;
};

export type ArtifactSequenceRuntimeOptions = {
  artifactId: string;
  sequence: readonly ArtifactSequenceStep[];
  state?: ArtifactSequenceState | null;
  permanentEffects?: ArtifactPermanentEffectHandlers;
};

const isPermanentStep = (
  step: ArtifactSequenceStep,
): step is StateMutationStep | AchievementStep =>
  step.type === "stateMutation" || step.type === "achievement";

const restoredState = (
  artifactId: string,
  sequenceLength: number,
  state?: ArtifactSequenceState | null,
) => {
  if (
    !state
    || state.artifactId !== artifactId
    || !Number.isInteger(state.stepIndex)
    || state.stepIndex < 0
    || state.stepIndex > sequenceLength
  ) {
    return { stepIndex: 0, completedPermanentSteps: [] as number[] };
  }

  return {
    stepIndex: state.stepIndex,
    completedPermanentSteps: [...new Set(state.completedPermanentSteps.filter(index =>
      Number.isInteger(index) && index >= 0 && index < sequenceLength))],
  };
};

export class ArtifactSequenceRuntime {
  readonly artifactId: string;
  readonly #sequence: readonly ArtifactSequenceStep[];
  readonly #permanentEffects: ArtifactPermanentEffectHandlers;
  readonly #completedPermanentSteps: Set<number>;
  #stepIndex: number;

  constructor({
    artifactId,
    sequence,
    state,
    permanentEffects = {},
  }: ArtifactSequenceRuntimeOptions) {
    this.artifactId = artifactId;
    this.#sequence = [...sequence];
    this.#permanentEffects = permanentEffects;
    const restored = restoredState(artifactId, sequence.length, state);
    this.#stepIndex = restored.stepIndex;
    this.#completedPermanentSteps = new Set(restored.completedPermanentSteps);
  }

  get stepIndex() {
    return this.#stepIndex;
  }

  get currentStep(): ArtifactSequenceStep | null {
    return this.#sequence[this.#stepIndex] ?? null;
  }

  get currentCommand(): ArtifactPresentationCommand | null {
    const step = this.currentStep;
    return step && !isPermanentStep(step) ? step : null;
  }

  get complete() {
    return this.#stepIndex >= this.#sequence.length;
  }

  advance(): ArtifactSequenceStep | null {
    const step = this.currentStep;
    if (!step) return null;

    const authoredIndex = this.#stepIndex;
    if (isPermanentStep(step) && !this.#completedPermanentSteps.has(authoredIndex)) {
      // Persist the deterministic authored index before invoking external code so
      // a handler cannot re-enter this runtime and apply the same effect twice.
      this.#completedPermanentSteps.add(authoredIndex);
      if (step.type === "stateMutation") {
        this.#permanentEffects.stateMutation?.(step, authoredIndex);
      } else {
        this.#permanentEffects.achievement?.(step, authoredIndex);
      }
    }

    this.#stepIndex += 1;
    return step;
  }

  serialize(): ArtifactSequenceState {
    return {
      artifactId: this.artifactId,
      stepIndex: this.#stepIndex,
      completedPermanentSteps: [...this.#completedPermanentSteps].sort((a, b) => a - b),
    };
  }
}
