import {
  ArtifactSequenceRuntime,
  type ArtifactPresentationCommand,
  type ArtifactSequenceState,
} from "./sequence.ts";

export type ArtifactPresentationState =
  | ArtifactPresentationCommand
  | { type: "complete" };

const COMPLETE_STATE = { type: "complete" } as const;

export class ArtifactPresentationBridge {
  readonly #runtime: ArtifactSequenceRuntime;

  constructor(runtime: ArtifactSequenceRuntime) {
    this.#runtime = runtime;
  }

  current(): ArtifactPresentationState {
    while (!this.#runtime.complete && !this.#runtime.currentCommand) {
      this.#runtime.advance();
    }
    return this.#runtime.currentCommand ?? COMPLETE_STATE;
  }

  advance(): ArtifactPresentationState {
    const current = this.current();
    if (current.type === "complete") return current;

    this.#runtime.advance();
    return this.current();
  }

  get isComplete() {
    return this.current().type === "complete";
  }

  getSerializableState(): ArtifactSequenceState {
    return this.#runtime.serialize();
  }
}
