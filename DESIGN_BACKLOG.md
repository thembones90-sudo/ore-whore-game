# ORE WHORE — Canonical Design Direction and Backlog

This file records approved future direction. Items marked **Backlog** are not permission to implement them immediately. Shipped mechanics and later explicit specifications remain authoritative when older concepts conflict.

## Design north star

The core loop remains:

**Hit rock → reveal thing → collect thing → hit another rock.**

Mine Events should occasionally create the feeling, “I’ll do one more dig because something weird might happen.” They decorate and briefly disrupt mining; they do not replace it with paperwork, optimization builds, or a conventional skill tree.

At its purest: **DIG. Maybe Ronaldo.**

## Canon reconciliation: TRUE Artefact probability

The attachment that established this backlog repeated an older fixed `0.05%` rule. That portion is obsolete.

Current canonical behavior is:

- `0.05%` is the STONEBREAKER starting chance per completed excavation.
- The currently equipped Peon Technology supplies the ordinary chance.
- The data-driven technology curve rises through the existing tiers to the `1.00%` hard cap.
- Owned technologies do not stack.
- Cosmetic models never change probability, damage, speed, input behavior, or rewards.
- Explicit one-use Mine Event modifiers may replace the ordinary chance for one upcoming completed excavation, as the Forbidden Tunnel currently does.
- There is no general pity system.
- TRUE Artefacts are unique and previously discovered entries are excluded from future selection.

## Unified Mine Event system — Backlog

Build future events as data-driven definitions rather than bespoke branches in the mining handler. The architecture should eventually support:

- event ID
- category
- eligible mines or global eligibility
- minimum and maximum depth
- base probability or weight
- telegraph duration
- choices and disclosed risks
- temporary modifiers and duration
- cooldown
- mutually exclusive conditions
- Peon and SYSTEM dialogue hooks
- visual and audio hooks

Required event categories:

- **Immediate:** named veins, rare deposits, forgotten equipment, strange chambers.
- **Blind choice:** the existing Forbidden Tunnel model.
- **Greed / informed choice:** the player sees the possible reward and danger before choosing.
- **Telegraphed:** a short sequence of cues culminates in an event.
- **Depth-gated:** eligibility changes with environmental depth.
- **Mine-specific:** Derelict Mine, The Forbidden Mine, The Sunder, or The Rime exclusives.

Events must be rare enough to remain special and must return the player to mining quickly.

## Depth as environmental progression — Backlog

Depth should become mechanically meaningful without becoming XP or a talent tree. Deeper mining may eventually change:

- eligible event pools
- special-event frequency
- unusual vein variants
- reward opportunities
- deposit toughness or strangeness
- environmental, text, particle, and audio cues

Conceptual bands for future balancing only:

- `0–50`: mostly normal mining
- `51–100`: slightly more vein and event activity
- `101–200`: rarer event pool becomes eligible
- `200+`: genuinely strange deep events become possible

Thresholds and probabilities are not locked.

## Named and variant veins — Backlog

A vein should feel like something the player found. Each variant needs a name, clear temporary duration, visible presentation, and optional visual/audio identity. It must not become resource-management busywork.

Illustrative, not locked:

- **Mithril Vein:** Mithril weight ×3 for four digs.
- **Rich Mithril Vein:** Mithril weight ×5 for three digs.
- **Contaminated Vein:** strongly biases an unusual ore, may increase toughness, and may carry a temporary reward modifier.

## Greed versus safety events — Backlog

These are informed gambles, deliberately distinct from the blind Forbidden Tunnel.

Illustrative concepts:

- **Unstable Shaft:** ENTER grants a major one-use TRUE Artefact opportunity with a disclosed meaningful downside; LEAVE returns safely to mining.
- **Glowing Fissure:** TOUCH IT improves mineral rarity for several digs while temporarily increasing toughness; IGNORE IT returns to mining.

Principle: **Blind choices test luck. Greed choices test self-control.**

## Short telegraphs — Backlog

Some events should announce themselves across roughly two or three digs: distant rumble, strange light, metallic echo, scratching, cracking, particles, a restrained Peon reaction, or a SYSTEM warning. Sequences must remain short and non-blocking.

Example cadence:

1. “Something rumbles deeper in the mine.”
2. Environmental cue intensifies; Peon: “Boss... mine making noise.”
3. Event triggers.

## Biome event identities — Backlog

- **Derelict Mine:** physical and abandoned-industry events—collapsed shafts, forgotten equipment, old tunnels, unstable supports.
- **The Forbidden Mine:** oppressive geological events—enormous veins, pressure cracks, deep chambers, strange echoes.
- **The Sunder:** unstable, alien geology inside a colossal rupture.
- **The Rime:** frozen, ancient, buried discoveries beneath impossible cold.

Do not design the full roster until implementation requires it. Preserve combinations such as `Northrend + depth 250+ + telegraphed + extremely rare` without special-case spaghetti.

## Cosmetic model personality — Canonical constraint

Technology determines gameplay. Cosmetic models determine presentation only.

Allowed cosmetic distinctions include particles, trails, impact sounds, Perfect/Critical treatments, occasional Peon dialogue, and reveal animation personality. Examples include toxic-green REVENANT'S PICK impacts, PRETTY BONKER’s restrained pink crystal/petal treatment, bespoke Peon-tool reactions, and an R9-themed Perfect Strike flourish.

Cosmetics must never alter mining probabilities, damage, action duration, TRUE Artefact chance, input mode, or rewards.

## Album mastery rewards — Backlog

Completing an ore’s `15/15` combination page should eventually provide light permanent prestige without mandatory mining power. Candidate rewards:

- extra Specimen Dust from future duplicates of that ore
- cosmetic badge or album ornament
- title
- visual prestige effect
- larger cosmetic/mastery reward for completing all pages associated with a mine

Avoid raw mining-power bonuses.

## Explicit non-goals

- No traditional skill tree.
- No depth XP or talent points.
- No mandatory stat builds.
- No proliferation of currencies.
- No event every few digs.
- No long modal sequence that damages the mining rhythm.
- No cosmetic pay-to-win or stat power.
- No global Mine Event inflation of TRUE Artefact acquisition outside explicitly designed temporary rolls.

## Suggested implementation order when authorized

1. Define the event data model and eligibility evaluator without changing live probabilities.
2. Convert the existing Vein and Forbidden Tunnel into adapters for that model while preserving exact behavior.
3. Add one named vein as the first low-risk proof of the presentation layer.
4. Add one short telegraphed biome event.
5. Add one informed greed-versus-safety event with telemetry.
6. Balance depth gates and event frequency from playtest data before expanding the roster.
