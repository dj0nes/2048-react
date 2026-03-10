# 2048 Hero Plan

## Goal

Repurpose this project as the hero experience on dillonjones.com — replacing the 3D face bust with a visual metaphor for orchestrating AI agents.

## Concept: The Orchestrator

The hero communicates a single idea: **one person sets many intelligent agents in motion simultaneously, and extraordinary things happen.**

The game starts in zero dimensions and expands — one dimension at a time — until a full 3D board is alive with autonomous AI play. The act of adding a dimension *is* the story: complexity emerges from a single origin.

## Dimensional Progression

Each stage is a fully playable n-dimensional 2048 game, solved by an AI agent, rendered in Three.js:

| Stage | Dimensions | Board | Camera | Trigger |
|-------|-----------|-------|--------|---------|
| 0 | `{}` | Single cube | Orthographic | Start |
| 1 | `{x: N}` | Line of cubes | Orthographic | Timer or manual |
| 2 | `{x: N, y: N}` | Flat grid | Orthographic | Timer or manual |
| 3 | `{x: N, y: N, z: N}` | Cube stack | Switch to **perspective** | Timer or manual |
| 4 | `{x, y, z, w: 2}` | Two 3D boards side by side | Perspective, wider | Timer or manual |
| 5+ | TBD | Grid of 3D boards | TBD | TBD |

**Timing**: time-based by default (configurable delay per stage). Manual override mode disables the timer entirely — stage advance is triggered explicitly (keyboard, URL param, or function call).

Camera transitions (ortho → perspective, reframing as scene grows) are their own piece — to be figured out during implementation.

## Visual Style

**Preserve the animation character from the CSS version:**
- Tiles slide smoothly to their new position on merge
- Merged tile pops/scales briefly
- New tiles entrance animation
- These become manual tweens in Three.js (lerped positions/scales over frames in rAF), not CSS transitions

Tile design: rounded box geometry, flat text label on face, material with some depth (not flat shaded). No heavy post-processing — must be mobile-compatible.

## Architecture

### Stack
- **Vanilla JS + Three.js** (no React, no R3F, no Drei)
- Reuse `board_util.js` and `board_map.js` directly — they are already pure JS with zero framework dependencies
- Separate entry point: `hero.js` (existing React game untouched)
- Bundle target: ~160KB gzipped (Three.js cost is unavoidable; everything else is negligible)
- Tween: hand-rolled lerps or `tween.js` (~3KB) — no heavy animation library

### Solver / Simulation

**Pre-compute, then play back:**
```
solveGame(dims, tokens) → BoardFrame[]   // runs once, produces full history
HeroScene.playback(frames, fps)          // just indexes into array each tick
```

- Solver runs synchronously at startup (fast for single boards) or in a Web Worker for many boards
- `BoardFrame` = `{ board: boardMap, score: number, gameOver: boolean }`
- Random tile insertion results are captured at solve-time — playback is pure replay, no re-execution
- Solver must be **Worker-compatible**: pure functions, no DOM, no globals — already true for `board_util.js`

### AI Strategy
Greedy heuristic: at each step, try all valid directions, pick the one that results in the most merges / highest corner score. Simple, fast, produces visually interesting games. No expectimax needed — the game is for show, not for winning optimally.

### Component Model (vanilla JS classes or plain objects)
```
HeroScene
  ├── Three.js Canvas (single WebGL context)
  ├── DimensionStage[]     // one per active dimension level
  │     ├── BoardRenderer  // Three.js mesh group for one board
  │     │     └── TileRenderer[] // one mesh per tile, owns tween state
  │     └── SolverWorker (or inline for first board)
  └── CameraRig            // handles ortho/perspective transitions + reframing
```

### Entry Point
`hero.js` — standalone, imported by the site repo as a static embed. No build-time dependency on the React game. Both can coexist in the same repo.

## Constraints
- Self-contained static embed (no backend)
- Mobile-compatible WebGL (no heavy post-processing, no instancing overdraw)
- Ambient, not interactive-first — runs on its own, visitors just watch
- Must work as `<object>` or `<iframe>` embed in the Hugo site

## Out of Scope for Now
- 5D+ renderer (layout TBD)
- User interaction with the boards
- Sound

## Existing Code Worth Keeping
- `board_util.js` — core game logic (moves, merges, win/lose, random insert). Keep as-is.
- `board_map.js` — n-dimensional board abstraction. Keep as-is.
- CSS animations in `2D.css` / `3D.css` — reference for animation character to replicate in Three.js
- The React game (`App.tsx`, `Game.tsx`, etc.) — keep untouched, separate concern

## Related
- Current bust embed: `static/web-doodles/bust/index.html`
- Site repo: `~/code/dillonjones.com`
- Hero template: `themes/dj/layouts/index.html`
