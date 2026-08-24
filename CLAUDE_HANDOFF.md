# ORE WHORE — COMPLETE CLAUDE HANDOFF

Generated: 2026-08-25 (Europe/Belgrade)

## TL;DR

ORE WHORE is a functional, public browser mining/collection game with four mines, 15 ores, 15 minerals, 225 combinations, metallurgy/tool progression, unique TRUE Artefacts, Forbidden Tunnels, Specimen Dust Berserk modes, authored mine-depletion artwork, audio, an ASOC Ticket endgame, and New Game+.

- Production: https://ore-whore-game.vercel.app/
- GitHub: https://github.com/thembones90-sudo/ore-whore-game
- Branch: `main`
- Local repository: `C:\Users\user\Documents\Codex\2026-08-22\files-mentioned-by-the-user-ore\work\verified_zip`
- Current application commit before this handoff: `9890661` (`Streamline forge resource creation`)
- Save key: `ore-whore-save-v1`
- Current save schema: `17`
- Runtime: Node `>=22.13.0`, React 19, vinext/Vite
- Deployment: linked Vercel project `ore-whore-game`

The repository is the sole source of truth. Do not reconstruct files from chat messages, screenshots, or pasted snippets.

## Immediate startup

```powershell
cd C:\Users\user\Documents\Codex\2026-08-22\files-mentioned-by-the-user-ore\work\verified_zip
npm ci
npm run dev
```

Verification used for the latest change:

```powershell
npx tsc --noEmit
npx vinext build
node --test tests/*.test.mjs
```

Latest result: production build passed; 135/135 tests passed.

Publish workflow:

```powershell
git add <intentional-files>
git commit -m "..."
git push origin main
npx vercel --prod --yes
```

Never report a feature as live until Vercel returns `readyState: READY` and confirms the alias `https://ore-whore-game.vercel.app`.

## Important repository notes

- `app/page.tsx` is currently a large client component containing the main game state, migration, mechanics, and most screens.
- Domain logic that must remain data-driven lives in focused modules including:
  - `app/metallurgy.ts`
  - `app/forbidden-tunnel.ts`
  - `app/asoc-ticket.ts`
  - `app/berserk.ts`
  - `app/tool-skins.ts`
  - `app/artifact-rewards.ts`
  - `app/endgame.ts`
  - `app/mine-commentary.ts`
  - `app/analytics.ts`
- CSS is layered chronologically. `app/layout.tsx` imports through `app/v089.css`; later layers intentionally override earlier ones. New fixes should normally be added as a new final layer unless safely consolidating the system.
- `README.md` is still generic starter text and is not reliable product documentation.
- `QA_NOTES.md` contains useful historical checks but some probability/save-schema language is obsolete. Code and current tests win conflicts.
- `tsconfig.tsbuildinfo` is an untracked generated file. Do not include it in commits or handoff archives.

## Canonical content

### Ores and mine ownership

- Old Mine: Copper, Tin, Silver, Iron, Gold
- Deep Mine: Mithril, Truesilver, Dark Iron, Thorium
- Outland Mine: Fel Iron, Adamantite, Khorium
- Northrend Mine: Cobalt, Saronite, Titanium

Biome spawn tables contain only their native ores. Do not reintroduce foreign ores into a mine through depth, veins, or UI assumptions.

### Mine progression quotas

Mine access is driven only by extraction counts for native ores:

- Common: 10
- Uncommon: 7
- Rare: 3
- Epic: 1
- Legendary: 1

Totals:

- Old Mine: 37 → unlock Deep Mine
- Deep Mine: 8 → unlock Outland
- Outland Mine: 11 → unlock Northrend
- Northrend Mine: 9 → Volume I mining progression complete

Album combinations and TRUE Artefacts never gate mine access.

Mine completion now uses an industrial shaft-authority descent ceremony (`MineCompletion` in `app/page.tsx`, styling in `app/v088.css`): mechanical clearance seal, sequential VERIFIED manifest, destination diagnostics, Peon/System exchange, and `DESCEND ANYWAY`.

### Mine depletion visuals

Each mine uses five authored visual states derived from quota completion:

- 0–19%: Stage 0
- 20–39%: Stage 1
- 40–64%: Stage 2
- 65–89%: Stage 3
- 90–100%: Stage 4

Assets are under `public/assets/mines/`. Progress changes visuals only; it must not change spawn odds.

### Empty digs and strikes

- Empty dig probability: 20%
- Miss probability: 5%
- Critical probability: 5%
- One Space keydown = one strike for manual tools; key repeat is rejected.
- Industrial tools explicitly support hold-to-mine.
- Empty digs are non-blocking floating SYSTEM insults, not modals.
- Duplicate combinations are non-blocking feedback; successful new combinations receive the assay reveal.
- TRUE Artefact encounters have a concealed 20×-health excavation before reveal.

### Album

- 15 ores × 15 minerals = 225 unique combinations.
- Album completion is separate mastery content.
- Duplicate specimens award Specimen Dust according to mineral rarity.
- Titanium remains canonical ID `titanium`; its discovery callout intentionally says `IDE TITTY`.

### Tool technology

Gameplay statistics come only from equipped technology; cosmetics never change mechanics.

Canonical player-facing tiers and ordinary TRUE Artefact chance:

| Tier | Tool | Chance |
|---:|---|---:|
| 0 | ROCK BONKER | 0.05% |
| 1 | BRONZE BONKER | 0.06% |
| 2 | BIG PICK | 0.08% |
| 3 | SHINY BONKER | 0.10% |
| 4 | ANGRY PICK | 0.15% |
| 5 | LOUD BONKER | 0.20% |
| 6 | SPINNY DIGGER | 0.30% |
| 7 | BIGGER SPINNY DIGGER | 0.40% |
| 8 | ROCK EATER | 0.50% |
| 9 | MOUNTAIN HURTER | 0.75% |
| 10 | MOUNTAIN FUCKER | 1.00% |

Only the equipped technology's rate applies. Rates never stack across owned tools.

### Metallurgy and the latest forge change

Ores and minerals are spendable resources separate from lifetime discovery counts. Tool recipes require processed metal/alloy plus minerals.

Latest behavior at commit `9890661`:

- Normal refine/alloy/assembly buttons now say `CREATE`.
- One press immediately creates exactly one processed unit.
- No confirmation modal for resource production.
- Players may repeatedly press CREATE.
- Every recipe card displays:
  - `YOU OWN`
  - `NEXT TOOL NEEDS`
  - `MISSING`, `READY`, or `NOT REQUIRED`
- Final tool forging still retains confirmation.
- The selected upgrade path still provides a full dependency view and atomic build/forge option.

Relevant implementation: `Forge`/`RecipeCard` in `app/page.tsx`, `app/metallurgy.ts`, `app/v089.css`, and `tests/forge-create-loop.test.mjs`.

### Tool cosmetics

Technology controls gameplay; model controls art/animation only.

Canonical personal cosmetics include:

- REVENANT'S PICK
- THE PEOPLE'S JACKHAMMER
- PRETTY BONKER / Roseheart Pickaxe
- ALIJA'S SHOVEL (unlocked permanently by first Alija artefact discovery; migration grants it to older eligible saves)

Do not couple cosmetic IDs or visuals to damage, cadence, input mode, ore odds, or TRUE Artefact odds.

### Specimen Dust Berserk

Dust is consumable frenzy fuel, not a passive upgrade tree:

- AGITATED: 150 Dust
- BERSERK: 300 Dust
- ABSOLUTELY FUCKING FERAL: 750 Dust

Modes temporarily alter speed/damage/critical presentation. They never alter geology, mine progression, or TRUE Artefact probability. The control is a compact side combat skill so the mine can breathe.

### TRUE Artefacts

Ordinary TRUE Artefacts are unique. Once discovered, that artefact cannot roll again. They have individual announcement, lore, Peon bark, artwork, and optional theme/reward fields in the data model.

Current archive artefacts include:

- Panini Golden Sticker of Ronaldo Nazário
- Warglaive of Illidan
- Blaize's Balls
- Shadow the Panther
- Whore Archives
- PATIKE
- Invincible's Reins
- Alija's Shovel

R9 canonical bark timing:

1. `Boss... this not man.`
2. `This Ronaldo.`
3. `Peon take hat off.`

Alija discovery permanently unlocks the shovel cosmetic. Existing eligible saves migrate automatically.

TRUE artwork is transparent and must never sit on an opaque black square. In reveal/inspection views, artwork must remain fully above a separate readable copy panel; no lore text may be hidden behind artwork.

### Golden ASOC Ticket and ending

The ASOC Ticket is not one of the ordinary archive collectibles. It is the unique endgame roll:

- Available only with MOUNTAIN FUCKER equipped
- Chance: 0.1% per completed excavation
- Unique within a run
- Discovery starts the canonical ending and completion record
- New Game+ retains permanent history/tickets as defined in `app/endgame.ts`

Do not merge ASOC probability with the ordinary TRUE Artefact roll.

### Forbidden Tunnel

- Trigger chance: 1% on eligible clean excavation transitions.
- Three first passages are visually shuffled independently from outcome.
- Tunnel artwork is cosmetic and must never hint at reward quality.
- The tunnel owns a temporary music state.
- Pending modifiers replace, not stack with, the equipped tool rate for the next completed excavation.
- Outcomes and chances are defined in `app/forbidden-tunnel.ts`; preserve its tests.

### Audio

- Normal loop: `public/assets/audio/echoes-of-the-forgotten-crypt.wav`
- TRUE reveal cue: `public/assets/audio/true-artefact.wav`
- Forbidden Tunnel loop: `public/assets/audio/tunnels.wav`
- Six randomized pickaxe hits: `public/assets/audio/pickaxe-hits/`

Music and pickaxe effects have independent toggles and volume controls. TRUE and Tunnel music use controlled crossfades; do not abruptly stop/restart normal music or allow rerenders to retrigger cues.

## Save and migration requirements

- Browser storage key: `ore-whore-save-v1`
- Schema: 17
- Migration occurs through `migrate()` in `app/page.tsx`.
- Save changes must preserve lifetime discoveries, spendable inventories, tools, cosmetics, artefacts, current encounter, tunnel modifier, completion history, audio/settings, and New Game+ history.
- Never require players to rediscover an ore/artefact or recraft an unlock merely because a new feature was added.
- TRUE Artefact ownership is normalized to uniqueness.
- Export/import controls exist in Miner Quarters.

Before changing the `Save` type, add an explicit migration and a regression test.

## Visual and interaction rules learned through playtesting

- Never overlay navigation, mine selection, Berserk controls, notifications, or quota UI on the playable wall.
- Keep the playable mine as the visual priority and preserve its height.
- Header geometry for `KEEP DIGGING` and `ORE FOUND` must remain identical to prevent layout jumping.
- Pickaxe follows pointer naturally in the playable region and hits at the click coordinate.
- No redundant `CRACK DEPOSIT` instruction bar.
- No blocking modal for empty digs or duplicates.
- No black squares behind transparent art.
- Artefact artwork never covers its text.
- Album ore icons use canonical ore artwork, not colored polygons.
- UI identity: near-black, industrial metal/brass, biome accents, pale typography; acid green is functional rather than the universal visual answer.
- Use restrained animation and honor reduced-motion/reduced-shake settings.

## Current test coverage

The `tests/` directory includes regression coverage for:

- canonical probabilities and tool scaling
- ASOC eligibility/uniqueness
- Forbidden Tunnel distribution, state, art, and modifier behavior
- metallurgy transactions, recipes, migration, and direct CREATE loop
- biome-native ore rosters
- Berserk balance separation
- unique TRUE Artefacts and 20× encounters
- audio assets/crossfades/toggles
- cosmetic/gameplay separation
- mine depletion stages and layout
- reveal readability and transparent artefact cards
- mine descent ceremony
- interface layers and responsive safety
- server-rendered game shell

Run all tests with:

```powershell
node --test tests/*.test.mjs
```

Do not rely only on `npm test`; the package script currently runs a narrower rendered-HTML test after build.

## High-value next engineering work

1. Split `app/page.tsx` into state/domain hooks and screen components without altering behavior.
2. Replace the stale generic README and update QA_NOTES to schema 17/current probabilities.
3. Add browser-level responsive/playthrough tests for Forge, mine unlock, TRUE reveal, and saved migration.
4. Add a visible build/version marker in Settings so screenshots can prove which production deployment is loaded.
5. Audit large WAV delivery and consider transparent, quality-preserving web audio optimization only after listening tests.
6. Consolidate chronological CSS layers carefully; do not flatten them casually because later imports encode fixes to earlier collisions.

## Working discipline

- Preserve unrelated user changes and assets.
- Use stable canonical IDs even when display copy changes.
- Keep balance numbers centralized and data-driven.
- Add tests for every gameplay invariant or previously reported visual regression.
- Build and run the full test glob before committing.
- Push only intentional files; generated caches/build artifacts stay untracked.
- Deploy and verify the production alias before saying `live`.

## Handoff acceptance checklist

- [ ] `git status --short` contains no unexpected tracked modifications.
- [ ] `npx tsc --noEmit` passes.
- [ ] `npx vinext build` passes.
- [ ] `node --test tests/*.test.mjs` passes.
- [ ] Existing browser save loads at schema 17.
- [ ] Forge CREATE produces one resource per click and updates owned/missing counts.
- [ ] Manual Space holding does not create key-repeat strikes.
- [ ] Mine selector/controls do not overlap the wall at desktop or mobile widths.
- [ ] TRUE artwork and copy remain separated.
- [ ] Production alias shows the intended build before reporting completion.

