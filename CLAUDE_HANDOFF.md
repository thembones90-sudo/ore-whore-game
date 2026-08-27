# ORE WHORE — CLAUDE COLD-START HANDOFF

Generated: 2026-08-27 (Europe/Belgrade)

## START HERE

Canonical PC project root:

```text
C:\Users\user\Documents\Codex\2026-08-22\files-mentioned-by-the-user-ore\work\verified_zip
```

Canonical source: `https://github.com/thembones90-sudo/ore-whore-game.git`, branch `main`.

Current public build: `https://ore-whore-game.shadezyel.chatgpt.site`

Sites project: `appgprj_6a88df7096e881918bc1a7a89b5c6216`. Latest known successful deployment: version 32, deployment `appgdep_6a8fcbdd2a648191acf8b552d9081a70`.

Verified application commit before this handoff refresh:

```text
153517883bfe5a67ad783e81778b4836232a98b8
Fix onboarding dialogue containment and speaker colors
```

The repository is the sole source of truth. Do not reconstruct code/assets from chat, screenshots, pasted snippets, old ZIPs, or root-level duplicate files.

## IMMEDIATE COMMANDS

```powershell
Set-Location 'C:\Users\user\Documents\Codex\2026-08-22\files-mentioned-by-the-user-ore\work\verified_zip'
npm ci
npm run dev
```

Full verification:

```powershell
node --test tests/*.test.mjs
npx tsc --noEmit
npm run build
```

Latest verified result before this documentation-only refresh: 197/197 tests passed; TypeScript passed; vinext production build passed.

Runtime/build stack: Node >=22.13.0, React 19, TypeScript 5.9, vinext/Vite, Cloudflare Vite plugin.

## REPOSITORY SOURCE OF TRUTH

- `app/page.tsx` — main client state, save migration, mining loop, screens and orchestration.
- `app/layout.tsx` — ordered CSS imports/global shell.
- `app/v001.css` through `app/v102.css` — chronological overrides. Import order is behavior; do not casually reorder/flatten.
- `app/metallurgy.ts` — materials, recipes, functional tools, shaft ratings and per-tool ordinary TRUE chance.
- `app/forbidden-tunnel.ts` — tunnel states, outcomes and modifiers.
- `app/asoc-ticket.ts` — separate Golden ASOC endgame roll.
- `app/true-artifacts.ts` — ordinary unique TRUE Artefact data.
- `app/tool-skins.ts`, `app/artifact-rewards.ts` — cosmetic models/rewards.
- `app/berserk.ts`, `app/endgame.ts`, `app/mine-commentary.ts` — focused systems.
- `public/assets/` — runtime art/audio.
- `tests/` — canonical regression suite.
- `.openai/hosting.json` — Sites binding.

Historical upload attempts left duplicate source/test files at repository root. Canonical code is under `app/`; canonical tests are under `tests/`. Do not edit root duplicates unless a cleanup task first proves they are used.

Untracked `.npm-cache*`, `ore-whore-site*.tar.gz`, and `tsconfig.tsbuildinfo` are local clutter, excluded from the clean handoff package. Do not commit them or delete them without permission.

## CURRENT GAME STATE

### Save and onboarding

- Storage key: `ore-whore-save-v1`; schema: `20`.
- `migrate()` in `app/page.tsx` preserves collection, ordinary TRUE Artefacts, ASOC history, resources, tools, cosmetics, achievements, settings, statistics, tunnel state and completion history.
- Existing pre-onboarding saves receive safe identity `PEON` and are treated as agreement-signed.
- New flow: intro dialogue → four-clause agreement → employee signature → Shadez welcome → Old Mine.
- Persisted onboarding fields include `playerName`, `employmentAgreementSigned`, `employmentGreetingSeen`, `forbiddenContractSeen`.

Latest onboarding fix at `1535178`:

- `AvatarDialogue` assigns copy-density classes.
- `app/v102.css` contains final containment/role colors.
- Peon is green; Shadez is blood red.
- Long lines scale and wrap inside widened panels; text must never escape.
- Regression: `tests/dialogue-contrast.test.mjs`.

### Mines, odds and quotas

Selector totals/progress derive from shared `biomePages`, `oreQuota()` and `biomeWeights` data in `app/page.tsx`.

| Mine | Native ores | Runtime weights | Quotas | Total |
|---|---|---|---|---:|
| Old | Copper, Tin, Silver, Iron, Gold | 28/20/12/18/10 (normalized) | 40/30/20/25/10 | 125 |
| Deep | Mithril, Truesilver, Dark Iron, Thorium | 22/18/15/18 (normalized) | 40/35/30/35 | 140 |
| Outland | Fel Iron, Adamantite, Khorium | 50/40/10 | 70/60/20 | 150 |
| Northrend | Cobalt, Saronite, Titanium | 55/35/10 | 80/65/20 | 165 |
| Ghost | Gravesilver, Stillwater, Hushstone, Revenant's Eye | 45/28/12/3 (normalized) | 30/20/8/3, provisional | 61 |

Mine artwork stages: 0–19% stage 0; 20–39% stage 1; 40–64% stage 2; 65–89% stage 3; 90–100% stage 4.

### Access architecture

Separate concepts:

- `biomeQuotaComplete()` — extraction certification.
- `mineDescentAuthorized()` — quota plus **currently equipped functional tool** meeting the next mine shaft requirement.
- `completedBiomes` — extraction record, not authorization.
- `unlockedBiomes` — authorization event already occurred.
- `mineAccessible()` — unlocked and current equipped tool sufficient.

Shaft ratings: Old 1, Deep 2, Outland 3, Northrend 4. Cosmetic skins never affect access/stats/probability. Locked unidentified mines show `🔒 ?????` and hide names/odds.

Known ambiguity—do not silently redesign: Ghost has no `mineRequiredShaftRating`, yet follows Northrend in `biomeOrder`. Completing Northrend currently can unlock Ghost without a hard shaft requirement; Ghost then uses a soft gate where conventional tools face 10× integrity and `GHOSTFORGED PICK` restores normal extraction. Copy also says Ghost hard requirements are undefined. Change only with explicit approval/tests.

### Functional tools

Only equipped technology applies. `shaftRating = min(4, tier + 1)`.

| Tier | Name | Shaft | Ordinary TRUE chance |
|---:|---|---:|---:|
| 0 | ROCK BONKER | 1 | 0.05% |
| 1 | BRONZE BONKER | 2 | 0.06% |
| 2 | BIG PICK | 3 | 0.08% |
| 3 | SHINY BONKER | 4 | 0.10% |
| 4 | ANGRY PICK | 4 | 0.15% |
| 5 | LOUD BONKER | 4 | 0.20% |
| 6 | SPINNY DIGGER | 4 | 0.30% |
| 7 | BIGGER SPINNY DIGGER | 4 | 0.40% |
| 8 | ROCK EATER | 4 | 0.50% |
| 9 | MOUNTAIN HURTER | 4 | 0.75% |
| 10 | MOUNTAIN FUCKER | 4 | 1.00% |
| 11 | GHOSTFORGED PICK | 4 | 1.00% |

Manual tools reject held-Space repeat; industrial tools explicitly hold-to-mine. Technology supplies cadence/damage/shaft/probability; cosmetic model supplies art/animation only.

Metallurgy consumes spendable inventories distinct from lifetime discoveries. CREATE produces one processed unit per click without confirmation and exposes owned/missing next-tool requirements. Final forging remains atomic/confirmed.

### Ordinary TRUE Artefacts

Eight unique archive pieces: Panini Golden Sticker of Ronaldo Nazário, Warglaive of Illidan, Blaize's Balls, Shadow the Panther, Whore Archives, PATIKE, Invincible's Reins, Alija's Shovel.

Discovered artefacts leave future rolls; migration normalizes duplicates. Reveal uses a concealed 20×-integrity encounter. Transparent art must have no black backing square and must remain separate from readable lore/reaction copy.

R9 bark: `Boss... this not man.` → `This Ronaldo.` → `Peon take hat off.`

First Alija discovery permanently unlocks the actual shovel cosmetic; eligible old saves migrate it.

### Golden ASOC Ticket

ASOC is separate from the eight archive entries (`app/asoc-ticket.ts`): ID `asoc`; requires equipped `ultimate-machine`/MOUNTAIN FUCKER; chance `0.001` = 0.1% per completed excavation before run completion; unique per run; unaffected by Forbidden Tunnel ordinary modifiers; starts ending flow.

Before secured, UI must not reveal the ASOC name or artwork. New Game+ resets current-run ordinary TRUE Artefacts while preserving only explicitly permanent history/unlocks.

### Mining invariants

- Empty 20%; miss 5%; critical 5%.
- Empty/duplicate feedback is floating/non-blocking, never a modal.
- One manual click/Space keydown = one hit.
- Pickaxe follows pointer; impact occurs at click coordinate.
- Titanium ID stays `titanium`; discovery callout intentionally says `IDE TITTY`.
- Current five-mine data yields 19 ores × 15 minerals = 285 combinations; do not repeat stale 225-only assumptions.
- Specimen Dust powers temporary AGITATED/BERSERK/FERAL states, not TRUE probability.

### Forbidden Tunnels and audio

- Flow: mining → ~2.5s noninteractive discovery buffer → selectable tunnels; fresh click required.
- First/second chamber art is cosmetic and shuffled independently from outcomes.
- Pending modifiers affect next eligible ordinary roll only, never ASOC.
- Audio: normal `echoes-of-the-forgotten-crypt.wav`; TRUE `true-artefact.wav`; tunnel `tunnels.wav`; six randomized `pickaxe-hits/pick*.wav`.
- Music/FX toggles are independent; TRUE/Tunnel states crossfade rather than hard-cut.

## VISUAL/UX RULES FROM PLAYTESTING

- Nothing overlaps the playable wall: selector, quotas, Berserk HUD, toast, nav or results.
- `KEEP DIGGING` and `ORE FOUND` keep identical geometry.
- No redundant `CRACK DEPOSIT` bar.
- Locked mine/artefact/ASOC identities remain classified.
- No opaque square behind transparent art; artefact art never covers text/buttons.
- Canonical ore/mineral art aligns with labels.
- Near-black industrial metal/brass is the base palette; acid green is functional, not universal.
- Peon dialogue green; Shadez blood red.
- Long dialogue stays inside panels at desktop/mobile using copy-density classes.
- Honor reduced-motion, reduced-shake, high-contrast and audio settings.

## NEW GAME / NEW GAME+

- New Game/Restart is intentionally available for testing; destructive reset requires explicit confirmation and clears active local save.
- New Game+ starts from `blank`, resetting current-run ordinary TRUE Artefacts and active run state.
- It may preserve player name, agreement, settings, permanent cosmetics/unlocks, achievements, ticket/completion history and incremented NG+ only as current `startNewGamePlus` explicitly defines. Test before altering preservation.

## DEPLOYMENT

### Sites (primary public host)

Because `.openai/hosting.json` exists, use Sites for the canonical public URL. Package using existing `package-site.sh`, save a Sites version, deploy it, wait for success, and verify the public URL before saying `live`. A GitHub push alone does not update Sites.

Do not persist temporary deployment credentials in remotes, files, history or docs.

### GitHub

```powershell
git status --short
git add <intentional files only>
git commit -m "..."
git push origin main
```

### Vercel warning

Historical CLI deployments exist, but Git-integrated Vercel has failed because committed Vite config targets Cloudflare/Vinext and does not produce the declared `.vercel/output` Build Output API directory. Do not claim Vercel is healthy/canonical without fixing and testing that contract. Current public delivery target is Sites.

## SAFE CHANGE PROTOCOL

1. Inspect status; preserve unrelated/user files.
2. Edit canonical `app/`, `public/`, `tests/`, not root duplicates.
3. Keep canonical IDs stable; separate display copy.
4. Centralize balance; derive UI from canonical data.
5. Add migration/tests for save changes.
6. Run full tests, TypeScript and build.
7. Commit only intentional paths.
8. Deploy exact commit and verify live URL.

## KNOWN RISKS / DO NOT GUESS

- Ghost quotas are provisional; Northrend→Ghost hard gating is intentionally undefined.
- `app/page.tsx` is huge; refactor only with behavior-preserving tests.
- CSS import chronology encodes collision fixes.
- `README.md`/`QA_NOTES.md` may lag behind code.
- Root duplicates and local caches/archives require a separate cleanup request.
- Never expose ASOC early or restore duplicate ordinary TRUE drops.

## ACCEPTANCE CHECKLIST

- [ ] Root matches the exact path at top.
- [ ] No unexpected tracked edits.
- [ ] Changes use canonical paths.
- [ ] `node --test tests/*.test.mjs` passes.
- [ ] `npx tsc --noEmit` passes.
- [ ] `npm run build` passes.
- [ ] Schema 20 migration preserves player data.
- [ ] Access uses equipped functional tool, never cosmetic/highest-owned.
- [ ] Locked names/odds and ASOC remain classified.
- [ ] Dialogue is contained and Peon green/Shadez blood red.
- [ ] Nothing overlays playable wall.
- [ ] Actual public URL verified before reporting live.

## HANDOFF SUMMARY

ORE WHORE is a working five-mine browser mining/collection RPG-comedy with metallurgy, functional tools, cosmetic models, 285 combinations, eight unique ordinary TRUE Artefacts, separate ASOC endgame, Forbidden Tunnels, audio state transitions, Berserk consumables, contract/name onboarding and New Game+. The latest visual regression—dialogue escaping panels and illogical speaker colors—was fixed and verified at `1535178`.

Claude should start from the canonical root, run verification, read the focused module for the requested feature, and make no speculative progression/save changes.
