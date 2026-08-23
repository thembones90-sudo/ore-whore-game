# ORE WHORE — Local QA Guide

This zip is a direct archive of the exact working tree that passed the full
verification gate: lint clean, typecheck clean, production build successful,
tests passing, CSS-coverage audit clean. Nothing was reconstructed or
retyped to produce this package.

## Environment

- **Node version required:** 22.13+ (engines field in package.json;
  verified against Node 22.22.2)
- **Install:** `npm ci`
- **Dev server:** `npm run dev`
- **Production build:** `npm run build`
- **Test suite (build + tests):** `npm test`
- **Lint:** `npm run lint`
- **Typecheck:** `npx tsc --noEmit`

All five of the above should complete with no errors on this exact tree.

## Visual widths to check

- **Desktop:** ~1440px and ~1024px (breakpoints at 900px/760px change
  layout meaningfully — check both sides of each)
- **Mobile:** 760px, 450px, and ~390px (iPhone-class)

## Deterministic testing

Append `?seed=12345` (any integer) to the URL to seed the mechanical RNG,
making ore/mineral/empty/vein/TRUE rolls reproducible across reloads for a
given seed. Two intentional exceptions:

- **Perfect Strike timing** is a real wall-clock metronome, not seeded —
  it can't be deterministic without defeating the point of a skill mechanic.
- **Miss flavor-text selection** (which line displays) uses `Math.random()`,
  not the seeded RNG. The miss/hit determination itself *is* seeded.

TRUE Artifacts are 1-in-2,000 per completed dig — not practical to trigger
by chance in a short session. Not something to force for this pass; the
reveal sequence can be sanity-checked structurally even without a real
trigger (see checklist below).

## Mechanics checklist

- [ ] **Normal strike** — clicking/tapping the rock registers a hit, damage
      state visibly increments
- [ ] **5% Miss** — over enough strikes, some register as a miss: zero
      damage, `.miss-bark` shows rotating flavor text, distinct sound
- [ ] **Consecutive-miss protection** — after 2 misses in a row, the 3rd
      strike is guaranteed to land
- [ ] **Perfect Strike** — timing a click to the brightening ring shows a
      "PERFECT" callout and extra damage
- [ ] **Perfect Strike miss immunity** — a landed Perfect Strike should
      never register as a miss, even statistically over many attempts
- [ ] **Critical Strike** — some strikes land as "CRITICAL" independent of
      Perfect timing (5% on any landed hit)
- [ ] **Perfect + Critical = 3 damage** — timing a Perfect that also crits
      shows "PERFECT CRIT" and deals the largest damage step
- [ ] **Ore Toughness progression** — higher-rarity ores visibly take more
      strikes to crack (Common 3 → Uncommon 4 → Rare 5 → Epic 6 →
      Legendary 7)
- [ ] **Common ore retains 3-hit baseline** — Copper/Tin specifically
      still crack in exactly 3 hits, unchanged from before this batch
- [ ] **Vein trigger** — occasionally (3% per successful ore discovery) a
      vein exposes on a specific ore
- [ ] **Vein banner** — shows the targeted ore name clearly
- [ ] **4-dig vein countdown** — the banner's remaining-digs count starts
      at 4 and ticks down
- [ ] **3× target weighting** — the targeted ore should come up
      noticeably more often while the vein is active (not guaranteed)
- [ ] **Empty dig consumes vein duration** — with a vein active, let an
      empty dig happen; the countdown should still decrement (veins are
      not protected from empty results)
- [ ] **Depth: Shallow** — tunnel-progress label shows "SHALLOW" in
      neutral gray on short tunnels, canonical/unboosted odds
- [ ] **Depth: Deep** — label shows "DEEP" in amber on medium tunnels
- [ ] **Depth: Bedrock** — label shows "BEDROCK" in orange on long tunnels
- [ ] **20% empty rate stays independent of Depth** — empty-dig frequency
      shouldn't visibly shift regardless of which depth band you're in
- [ ] **Last-One escalation** — get an ore to 14/15, then keep digging
      without the last mineral; copy escalates through tiers and visual
      glow intensifies (check both Album header and Wanted card)
- [ ] **Session statistics** — Records page's "TODAY" line updates live:
      digs, new specimens, veins, misses, longest and current drought
- [ ] **Lifetime misses/statistics** — Records page shows lifetime totals
      (total strikes, total misses, etc.) that persist across reloads
- [ ] **TRUE Artifact trigger** — 1-in-2,000 per dig; not practical to
      force naturally in a short session (see note above)
- [ ] **TRUE Artifact colossal reveal sequence** — if triggered: pause →
      "ANOMALOUS OBJECT DETECTED" → full reveal with sigil art, name,
      lore, "FOUND AFTER N DIGS"
- [ ] **~2-second initial interaction lock** — the archive/continue button
      stays inert for roughly 2 seconds after the reveal begins
- [ ] **TRUE Archive** — dedicated "TRUE" nav tab, separate from
      Records/Album, shows found vs. unfound artifacts
- [ ] **Artifact placeholder slots** — unfound/no-art artifacts show a
      neutral sigil placeholder at the correct dimensions, not a broken
      image icon
- [ ] **Reduced Motion** (More tab → Settings) — animations collapse to
      near-instant globally when enabled
- [ ] **Reduced Shake** — Perfect-ring pulse/scale specifically stops
      under this toggle
- [ ] **Mouse/pointer strike** — clicking the rock at different positions
      strikes at that exact point
- [ ] **Touch behavior** — tapping on a touch device/emulated touch works
      the same as a click
- [ ] **Spacebar strike** — pressing Space strikes at the default center
      point when the Mine tab is active
- [ ] **Existing Album/Wanted/Hunt behavior** — these should look and
      behave exactly as before this batch; nothing here should have
      regressed
- [ ] **Save/reload** — progress persists across a page reload
      (localStorage)
- [ ] **Migration from an older save, if practical** — if you have a save
      from before this batch (schema 7 or 8), loading it should upgrade
      cleanly to schema 9 without losing existing progress
