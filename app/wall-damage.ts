export type WallHitKind = "normal" | "perfect" | "crit" | "perfectCrit";

export type WallDamageMark = {
  id: number;
  x: number;
  y: number;
  strength: 1 | 2 | 3 | 4;
  hits: number;
  kind: WallHitKind;
  rotation: number;
};

export const MAX_WALL_DAMAGE_MARKS = 28;
export const WALL_DAMAGE_CLUSTER_RADIUS = 7.5;

const hitStrength: Record<WallHitKind, WallDamageMark["strength"]> = {
  normal: 1,
  perfect: 2,
  crit: 3,
  perfectCrit: 4,
};

const distanceBetween = (a: Pick<WallDamageMark, "x" | "y">, b: { x: number; y: number }) =>
  Math.hypot(a.x - b.x, a.y - b.y);

export function addWallDamageMark(
  current: WallDamageMark[],
  hit: { id: number; x: number; y: number; kind: WallHitKind },
): WallDamageMark[] {
  const nearest = current.reduce<{ index: number; distance: number } | null>((best, mark, index) => {
    const distance = distanceBetween(mark, hit);
    return !best || distance < best.distance ? { index, distance } : best;
  }, null);
  const incomingStrength = hitStrength[hit.kind];

  if (nearest && nearest.distance <= WALL_DAMAGE_CLUSTER_RADIUS) {
    const existing = current[nearest.index];
    const hits = existing.hits + 1;
    const merged: WallDamageMark = {
      id: hit.id,
      x: (existing.x * Math.min(existing.hits, 4) + hit.x) / (Math.min(existing.hits, 4) + 1),
      y: (existing.y * Math.min(existing.hits, 4) + hit.y) / (Math.min(existing.hits, 4) + 1),
      strength: Math.min(4, Math.max(existing.strength, incomingStrength) + (hits >= 3 ? 1 : 0)) as WallDamageMark["strength"],
      hits,
      kind: incomingStrength >= hitStrength[existing.kind] ? hit.kind : existing.kind,
      rotation: (existing.rotation + 31 + hit.id * 7) % 360,
    };
    return [...current.slice(0, nearest.index), ...current.slice(nearest.index + 1), merged].slice(-MAX_WALL_DAMAGE_MARKS);
  }

  return [
    ...current,
    {
      id: hit.id,
      x: hit.x,
      y: hit.y,
      strength: incomingStrength,
      hits: 1,
      kind: hit.kind,
      rotation: (hit.id * 47) % 360,
    } satisfies WallDamageMark,
  ].slice(-MAX_WALL_DAMAGE_MARKS);
}
