// Semantic gameplay events, separate from analytics (./analytics.ts).
// Analytics is for telemetry; this is a presentation/audio hook so a future
// voiced Peon system can subscribe via `window.addEventListener` without
// entangling bark/audio logic into strike()'s RNG and state-transition code.
export type GameplayEvent =
  | "MISS" | "DOUBLE_MISS"
  | "PERFECT_STRIKE" | "CRITICAL_STRIKE" | "PERFECT_CRIT"
  | "VEIN_EXPOSED" | "VEIN_EXPIRED"
  | "TOUGH_ORE_EXPOSED"
  | "LAST_SPECIMEN_25" | "LAST_SPECIMEN_60" | "LAST_SPECIMEN_100" | "LAST_SPECIMEN_175"
  | "TRUE_ARTIFACT_ENCOUNTER_STARTED" | "TRUE_ARTIFACT_FOUND" | "MINE_COMPLETED";

export function emitGameplayEvent(event: GameplayEvent, context: Record<string, unknown> = {}) {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new CustomEvent("ore-whore:gameplay", { detail: { event, ...context, timestamp: Date.now() } }));
}
