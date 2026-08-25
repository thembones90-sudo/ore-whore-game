# ORE WHORE — Claude Handoff

Snapshot date: 2026-08-22  
Status: completed ore-sprite and biome-overhaul source, verified locally, not yet committed or deployed at snapshot time.  
Current live deployment at snapshot time: Version 13, before the final 15-sprite/biome patch.

## Product

ORE WHORE is a deliberately simple browser mining and collection game. The player repeatedly strikes a mine wall, exposes deposits, cracks them, and collects combinations of 15 ores × 15 minerals for a 225-slot Volume I album.

Preserve the game’s voice: industrial editorial design, near-black shell, off-white typography, clean acid-lime global UI, dry hostile humor, and simple compulsive interaction.

## Run locally

Requirements:

- Node.js 22.13+
- npm

Commands:

```bash
npm ci
npm run dev
npm run build
```

The production stack is React 19, Vinext, Vite 8, and Cloudflare Workers tooling.

## Important files

- `app/page.tsx` — game data, state, RNG, save migration, all main UI components.
- `app/layout.tsx` — metadata and layered stylesheet imports.
- `app/analytics.ts` — local analytics event recording.
- `app/globals.css` — original shell and core layouts.
- `app/v02.css` through `app/v047.css` — chronological visual/feature layers. Later files intentionally override earlier layers.
- `app/v047.css` — final biome environments, selector states, cavity/debris treatments, ore-sprite integration, transitions, responsive/accessibility refinements, and empty-dig styling.
- `art/ores/masters/` — 15 lossless 1024×1024 RGBA ore masters.
- `public/assets/ores/` — 15 optimized 256×256 transparent runtime WebPs.
- `public/mine-wall-v2.png` — shared hand-painted mine-wall base.
- `.openai/hosting.json` — Sites project metadata.

## Canonical data

Do not rename or reorder IDs.

Ores:

```text
copper, tin, silver, iron, gold,
mithril, truesilver, dark, thorium, feliron,
adamantite, khorium, cobalt, saronite, titanium
```

Minerals:

```text
malachite, tigerseye, shadowgem, mossagate, jade,
moonstone, citrine, aquamarine, starruby, vitriol,
largeopal, sapphire, diamond, emerald, arcane
```

Mine groups:

```text
Old:       copper, tin, silver, iron, gold
Deep:      mithril, truesilver, dark, thorium
Outland:   feliron, adamantite, khorium
Northrend: cobalt, saronite, titanium
```

## Final ore assets

Runtime lookup is centralized through `oreAsset(id)` in `app/page.tsx`.

Always render canonical ores with:

```tsx
<img className="ore-sprite ..." src={oreAsset(id)} alt="" />
```

The final patch replaces CSS/Unicode ore placeholders on:

- Mining exposure
- Album ore header
- Wanted ore header
- Discovery reveal
- Share card

Minerals still use CSS faceted `.gem-art` shapes because a mineral raster set does not yet exist.

Never add a CSS `filter` to a parent containing an ore sprite. It will repaint canonical ore colors. Environment grading must remain in background/blend layers.

## Biome architecture

`biomeVisuals` in `app/page.tsx` is the authoritative visual-token configuration. It supplies biome accent, secondary color, canvas, cavity, debris, particles, selector card, texture, lighting, and transition flavor.

Biome identities:

- Old Mine — warm brown stone, copper, dust, timber, rust, lantern warmth.
- Deep Mine — near-black compressed rock, burgundy, iron reinforcement, restrained fissures.
- Outland — black/dirty-green alien geology, contamination, corrupted fractures.
- Northrend — blue-black frozen stone, cyan light, frost and ice fractures.

The permanent application shell remains charcoal/off-white/acid-lime. Biome accent invades only the mine environment and local progression UI.

During ore exposure, the four-card selector collapses to the current location so the physical ore remains the visual hero.

Mine changes use a 720 ms accessible `role=status` transition. Reduced-motion mode disables/simplifies it.

## Gameplay rules

- Four sequential mines: Old → Deep → Outland → Northrend.
- A mine completes when every mineral is collected for every ore page assigned to that mine.
- Completing a mine unlocks the next mine and triggers a completion ceremony.
- Existing saves retain previously reached mines.
- Every excavation has a fixed 20% chance to return nothing.
- Empty digs occur before ore exposure, count as attempts/drought, and grant no ore, mineral, dust, or album progress.
- Target hunting begins gentle bad-luck protection after 40 unsuccessful digs.
- Hunt focus increases gradually and caps at a 5× target-mineral weight multiplier (+400%).
- Duplicate minerals grant Specimen Dust based on rarity.
- Cosmetics are presentation-only.
- Pointer/touch strikes place effects at the exact pressed location. Spacebar strikes use the center.

Do not change probabilities, ore pools, progression, or save behavior as part of visual work.

## Save data

Storage key:

```text
ore-whore-save-v1
```

Current schema at snapshot:

```text
7
```

Important fields include:

- `digs`, `emptyDigs`, `strikes`, `distance`
- `combos`, `ores`, `minerals`, `first`
- `achievements`, `milestones`
- discovery and duplicate streak records
- `dust`, `dustEarned`, `dustSpent`
- `biome`, `unlockedBiomes`, `completedBiomes`
- settings and cosmetics
- hunt target/count/start/longest-hunt records

All save changes must go through `migrate(old)` and preserve old saves. Never reset or reinterpret existing collections.

## RNG and album

- The game supports a deterministic `?seed=` query parameter for reproducible testing.
- Ore weighting varies by mine.
- Mineral base weights are shared.
- Album identity is the combination key `${ore.id}-${mineral.id}`.
- Total completion is 225 combinations.

## Accessibility

Preserve:

- Keyboard Space strike.
- Pointer and touch coordinate strikes.
- Reduced motion.
- Reduced shake.
- High contrast.
- Vibration setting.
- Master and SFX volume controls.
- Text labels and non-color selected states.

## Verification state

Completed before this handoff:

- `npx vinext build` passes.
- `git diff --check` passes.
- Browser smoke: full tunnel cycle, raster ore exposure, collapsed selector, deposit cracking, raster reveal, and share card.
- All 15 masters are 1024×1024 RGBA.
- All 15 runtime WebPs are 256×256 lossless transparent images, approximately 48–68 KB each.
- Transparent corners and safe margins were validated.

Known unrelated legacy issues:

- `tests/rendered-html.test.mjs` expects removed starter-preview artifacts (`codex-preview` metadata and `app/_sites-preview/SkeletonPreview.tsx`).
- Standalone type checking surfaces pre-existing analytics-event union and Cloudflare ambient-type errors although the production build succeeds.

Do not “fix” these by restoring starter UI.

## Recommended next work

1. Review all four environments with an unlocked test save at desktop and mobile sizes.
2. Tune only environment intensity and hierarchy; do not filter ore sprites.
3. Produce a matching 15-mineral raster set to replace the remaining CSS mineral facets.
4. Update stale starter tests to assert actual ORE WHORE output.
5. Split the large `app/page.tsx` into data, save/RNG, mining, album, and records modules after visual stability.

## Ready-to-copy Claude continuation prompt

```text
Continue development of the attached ORE WHORE project. Read HANDOFF_FOR_CLAUDE.md completely before editing. Preserve canonical ore/mineral IDs, save migration, RNG behavior, sequential mine progression, 20% empty digs, target-hunt focus, exact-pointer strikes, accessibility settings, and the global charcoal/off-white/acid-lime identity. Treat biomeVisuals as the authoritative environment-token source and oreAsset(id) as the only canonical ore resolver. Never apply parent CSS filters that recolor ore sprites. First run npm ci and npm run build, inspect the current working tree, and report any conflict between the handoff and source before making changes. Do not restore removed starter-preview files. Keep visual changes performant and responsive.
```
