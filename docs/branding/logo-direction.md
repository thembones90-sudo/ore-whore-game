# ORE WHORE — Canonical Logo Direction

Status: **design direction locked; final production artwork pending**.

The supplied August 24 concept sheet is a visual reference only. It must not be
cropped, split, or shipped as a runtime logo. Its skull, crossed tools, frame,
chains, particles, and draft emblem are not mandatory canonical elements.

## Core device: the two ore O's

`ORE WHORE` contains two letter O's. Both remain letters inside the wordmark;
neither may become a detached icon.

- First O — **raw ore**: battered circular rock, dark geological mass, warm
  copper/orange veins, primitive and clearly breakable.
- Second O — **precious discovery**: the related rocky silhouette after
  discovery, with gold seams, exposed purple/arcane crystals, and richer inner
  illumination.

At normal UI distance the mark must read **ORE WHORE** immediately. The ore
construction of both O's is the close-inspection reward.

The narrative is:

`RAW ROCK → DIGGING → DISCOVERY → PRECIOUS SHIT`

## Typography and material language

All remaining letters use heavy angular forged-metal construction:

- thick and physically substantial;
- chipped, scratched, dirty, and slightly oxidized;
- industrial dark-fantasy rather than medieval ornament;
- highly readable at game-interface scale.

A restrained left-to-right progression is allowed: utilitarian iron near the
first O, then minor mineral contamination, gold seams, and purple fractures as
the wordmark approaches the second O.

Avoid giant skulls, shields, oversized crossed tools, heraldry, decorative fire,
filigree, and other generic fantasy-logo furniture.

## Department plate

`PROPERTY OF THE DEPARTMENT` is an optional secondary manufacturer plate. It
may accompany the primary hero logo, but never compete with or reduce the
readability of `ORE WHORE`. It is omitted from compact contexts.

## Required production assets

Final art must be delivered as three independent assets, not a contact sheet or
atlas.

### 1. Primary hero logo

- Runtime path: `/assets/brand/ore-whore-logo-primary.webp`
- Transparent master: `ore-whore-logo-primary.png`
- Master canvas: 2400 × 800 px or larger at the same 3:1 aspect ratio
- Transparent background and at least 4% clear padding on every edge
- Full two-O detail; optional restrained Department plate
- No skull or crossed-tool crest unless separately approved later

### 2. Compact wordmark

- Runtime path: `/assets/brand/ore-whore-wordmark-compact.webp`
- Transparent master: `ore-whore-wordmark-compact.png`
- Master canvas: 1600 × 400 px or larger at the same 4:1 aspect ratio
- Simplified cracks, particles, debris, and glow
- Both ore O's remain recognizable at approximately 220 × 55 CSS px
- No Department plate

### 3. Game emblem

- Runtime path reserved: `/assets/brand/ore-whore-emblem.webp`
- Transparent square master: `ore-whore-emblem.png`
- The emblem shown on the concept sheet is exploratory and not approved
- Do not replace the current `OW` interface mark until an emblem is approved

## Runtime integration contract

Until final assets arrive, the existing text brand and `OW` mark remain the
canonical safe fallback. When approved art is supplied:

- the compact wordmark replaces the top-navigation text lockup;
- the primary logo is used on onboarding/splash and major promotional surfaces;
- semantic accessible text remains `ORE WHORE` even when rendered as an image;
- assets use `object-fit: contain`, preserve aspect ratio, and are never cropped;
- no CSS recoloring, hue rotation, masks, or extra baked-looking glow is applied;
- responsive fallbacks must preserve title readability before decorative detail.

## Acceptance checks

1. The title reads `ORE WHORE` before the viewer notices the material trick.
2. Both special O's remain unmistakably letterforms.
3. The first O reads as raw material and the second as discovered value.
4. The compact mark survives small desktop and mobile navigation sizes.
5. The result belongs to ORE WHORE's bureaucratic industrial UI, not generic
   fantasy branding.
