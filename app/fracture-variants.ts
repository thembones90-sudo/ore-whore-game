// Randomized fracture-variant system. Replaces the old two-pseudo-element
// "always the same two branches, just rotated" crack (the "black ninja
// star") with a pool of genuinely different topologies, grouped by strike
// severity. Rotating a symmetrical shape only ever produces the same
// symmetrical shape at a different angle — these are asymmetric by
// construction, not by luck.
//
// Every path is drawn in a shared -50..50 viewBox with the true impact
// point fixed at local (0,0). Branches deliberately do NOT radiate evenly
// around that origin — real cracks don't — but every one of them still
// touches (0,0), so positioning the whole shape is exactly the existing
// translate(-50%,-50%) technique already used elsewhere in this file: no
// per-shape custom anchor math needed, asymmetry lives entirely in the
// path data.

export type FractureTier = "hit" | "perfect" | "crit" | "perfectCrit";

export type FractureVariant = {
  id: string;
  tier: FractureTier;
  // Each string is one jagged branch, as an SVG path "d" attribute,
  // starting at or near (0,0).
  branches: string[];
  // Small filled chips near the origin — only used by the crit tiers.
  chips?: { cx: number; cy: number; r: number }[];
};

export const FRACTURE_VARIANTS: FractureVariant[] = [
  // HIT — 2–4 short, restrained branches. Smallest tier.
  { id: "h1", tier: "hit", branches: [
    "M0,0 L-9,-14 L-13,-19",
    "M0,0 L11,-6 L17,-9",
    "M0,0 L4,13 L2,20",
  ]},
  { id: "h2", tier: "hit", branches: [
    "M0,0 L-14,4 L-21,3",
    "M0,0 L8,-11 L11,-18 L9,-24",
    "M0,0 L6,9 L12,12",
  ]},
  { id: "h3", tier: "hit", branches: [
    "M0,0 L-6,-15 L-4,-22",
    "M0,0 L13,3 L20,7 L24,4",
  ]},

  // PERFECT — sharper, slightly longer, cleaner than HIT. Precision, not violence.
  { id: "p1", tier: "perfect", branches: [
    "M0,0 L-16,-10 L-25,-11",
    "M0,0 L14,-16 L19,-24",
    "M0,0 L-3,17 L-1,25",
    "M0,0 L10,8 L16,9",
  ]},
  { id: "p2", tier: "perfect", branches: [
    "M0,0 L-10,-20 L-13,-29",
    "M0,0 L9,-19 L15,-25 L13,-31",
    "M0,0 L-15,6 L-23,8",
  ]},

  // CRITICAL — larger, more aggressive branching, occasional small chip.
  { id: "c1", tier: "crit", branches: [
    "M0,0 L-18,-13 L-27,-12 L-33,-16",
    "M0,0 L16,-19 L23,-27",
    "M0,0 L-8,19 L-13,28",
    "M0,0 L19,6 L28,4 L34,8",
    "M0,0 L2,-14 L8,-19",
  ], chips: [{ cx: -6, cy: 4, r: 2.4 }] },
  { id: "c2", tier: "crit", branches: [
    "M0,0 L-21,4 L-30,9",
    "M0,0 L13,-18 L11,-27 L16,-33",
    "M0,0 L-6,-20 L-11,-26",
    "M0,0 L17,12 L25,16 L30,13",
    "M0,0 L-16,-6 L-24,-4",
  ], chips: [{ cx: 5, cy: -3, r: 2 }, { cx: -3, cy: 6, r: 1.6 }] },

  // PERFECT CRITICAL — strongest treatment. Most branches, most chips,
  // still bounded — this is the rare, satisfying one, not screen clutter.
  { id: "pc1", tier: "perfectCrit", branches: [
    "M0,0 L-22,-16 L-31,-14 L-38,-19",
    "M0,0 L19,-22 L27,-31 L24,-38",
    "M0,0 L-10,22 L-16,32",
    "M0,0 L22,9 L32,7 L39,12",
    "M0,0 L3,-18 L10,-24 L8,-31",
    "M0,0 L-19,7 L-28,10",
  ], chips: [{ cx: -7, cy: 5, r: 3 }, { cx: 6, cy: -5, r: 2.4 }, { cx: -2, cy: -10, r: 2 }] },
  { id: "pc2", tier: "perfectCrit", branches: [
    "M0,0 L-24,6 L-34,10 L-40,7",
    "M0,0 L15,-21 L13,-31 L19,-38",
    "M0,0 L-8,-23 L-14,-30",
    "M0,0 L20,14 L29,19 L36,16",
    "M0,0 L-18,-9 L-27,-8",
    "M0,0 L6,17 L11,26",
  ], chips: [{ cx: 4, cy: 4, r: 2.8 }, { cx: -8, cy: -3, r: 2.2 }, { cx: 3, cy: -8, r: 1.8 }] },
];

export const fractureVariantsForTier = (tier: FractureTier) => FRACTURE_VARIANTS.filter(v => v.tier === tier);
