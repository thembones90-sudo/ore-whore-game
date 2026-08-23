export type AnalyticsEvent =
  | "session_start" | "session_end" | "mine_started" | "tunnel_broken"
  | "ore_found" | "mineral_found" | "combination_new" | "combination_duplicate"
  | "album_opened" | "ore_page_opened" | "missing_view_opened" | "biome_selected"
  | "page_milestone_3" | "page_milestone_4" | "page_completed" | "achievement_unlocked"
  | "hunt_started" | "return_visit"
  | "dig_empty" | "biome_completed" | "biome_unlocked" | "true_artifact_encounter_started" | "true_artifact_found"
  | "resource_earned" | "resource_processed" | "recipe_viewed" | "recipe_blocked" | "tool_forged";

const started = Date.now();
export function track(event: AnalyticsEvent, context: Record<string, unknown> = {}) {
  if (typeof window === "undefined") return;
  const payload = { event, ...context, time_since_session_start_ms: Date.now() - started, timestamp: new Date().toISOString() };
  window.dispatchEvent(new CustomEvent("ore-whore:analytics", { detail: payload }));
  const queue = JSON.parse(localStorage.getItem("ore-whore-analytics-v1") || "[]");
  queue.push(payload);
  localStorage.setItem("ore-whore-analytics-v1", JSON.stringify(queue.slice(-500)));
}
