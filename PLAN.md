# 2048 Hero Plan

## Goal

Repurpose this project as the hero experience on dillonjones.com — replacing the 3D face bust with a visual metaphor for orchestrating AI agents.

## Concept: The Orchestrator

The hero communicates a single idea: **one person sets many intelligent agents in motion simultaneously, and extraordinary things happen.**

Mechanically: a grid of 2048 boards, each being solved by its own AI agent in parallel. Boards that succeed seed more boards. The screen fills with autonomous activity — all of it initiated by a single action.

This works because:
- 2048 is immediately legible to any developer
- Multiple AI solvers running in parallel = multiple agents working autonomously
- The human (visitor) did nothing — it's already happening
- Visually alive without requiring interaction or explanation

## Animation Sequence

1. **One board** — a single 4×4 board, AI solver starts playing
2. **Split** — on win (or after a few seconds), it seeds 2 boards
3. **Cascade** — those seed more, exponential growth, until the viewport is filled with boards all running simultaneously
4. **Steady state** — ambient grid of boards, each autonomous, wins and losses happening continuously, new boards replacing finished ones

No dimension-sequence intro needed. The parallel swarm is the story.

## Stretch: 3D boards in the mix

Once the 2D version works, swap some boards in the grid for the existing 3D CSS renderer. Makes the visual richer and shows off more of what the project does.

## Technical Findings (from codebase exploration)

### What already works
- **1D boards** — trivially supported. `board_util.js:368-371` has explicit 1D handling. Just pass `{x: N}` as dimensions.
- **2D boards** — fully working
- **3D boards** — fully working, CSS 3D transforms, renders at `{x:3, y:3, z:3}`
- **4D logic** — works, tested in `board_util.test.js:434-456`. No renderer built yet.
- **CSS 3D** — `perspective: 1700px`, `rotate3d(1, 2, 0, -20deg)` for isometric view, 6-face cube tiles

### AI solver hooks (all in `board_util.js`)
- `getAllDirections(boardDimensions)` — enumerate all valid moves
- `mergeBoard(board, dims, direction, tokens)` — apply a move, returns new board + points
- `isGameOver(board, dims, tokens)` — terminal state check
- `randomTileInsert(...)` — simulate opponent (for expectimax)
- All synchronous, all work on copies — can call rapidly in a loop

### Embed approach
- `yarn build` produces standard CRA output: `index.html` + `static/js/*.js` + `static/css/*.css`
- Drop `build/` contents into `static/web-doodles/2048/` in the site repo
- Embed: `<object data="web-doodles/2048/index.html">` — same as bust, works today
- Bundle ~200-250KB gzipped including Emotion

### Running many boards simultaneously
- React can render many independent `<Game>` instances
- Each needs its own state + solver loop (requestAnimationFrame or setInterval)
- Performance concern: 20+ boards with CSS 3D animations could be heavy — may need to cap at 2D boards for the grid, reserve 3D for a featured few

## What Already Exists

- `Board.tsx` / `Tile.tsx` — 2D game, working
- `Board3D.tsx` / `Tile3d.tsx` — 3D CSS renderer, working
- `board_util.js` — core game logic (moves, merges, win/lose detection)
- `board_map.js` — n-dimensional board abstraction (interesting — check if 1D is trivially supported)
- No AI solver yet
- No 4D renderer yet

## Constraints

- Must work as a self-contained static embed (no backend)
- Should not be jarring or distracting — ambient, not interactive-first
- Performance matters: CSS 3D can be janky at high frame rates, especially on mobile

## Out of Scope for Now

- 4D renderer (aspirational, future post)
- User interaction during the hero sequence
- Sound

## Related

- Current bust embed: `static/web-doodles/bust/index.html`
- Site repo: `~/code/dillonjones.com`
- Hero template: `themes/dj/layouts/index.html`
