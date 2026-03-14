/**
 * hero.js — Orchestrator for the 2048 dimensional progression hero
 *
 * Stages advance on a timer (or manual override via window.__heroNextStage()).
 * Each stage runs a live AI game; on game over it generates a new one.
 *
 * Stage sequence:
 *   0D (zoom in → zoom out)
 *   1D (line of cubes)
 *   2D (flat grid, head-on, extra rows slide in from behind)
 *   3D (head-on, then orbit reveals depth)
 *   4D×3 → 4D×4 → 4D×5  (loop forever)
 */

import { generate2048Tokens, setGlobalTileIdCounter } from '../board_util.js'
import { HeroScene }     from './scene.js'
import { solveGame }     from './solver.js'
import { BoardRenderer, PANE_Z_GAP, frontPaneZ } from './tiles.js'

// ─── Stage definitions ───────────────────────────────────────────────────────

// entrance values:
//   'zoomOut'     — camera starts extremely close and pulls back dramatically
//   'headOn'      — camera locks to front face, no orbit; rows slide in from behind
//   'revealOrbit' — camera starts head-on then begins orbiting to reveal depth
//   undefined     — normal orbit (4D stages)

const STAGES = [
    {
        dims:         { x: 1, y: 1, z: 1 },
        stageSeconds: 3.5,
        label:        '0D',
        entrance:     'zoomOut',
    },
    {
        dims:         { x: 4, y: 1, z: 1 },
        stageSeconds: 4,
        label:        '1D',
    },
    {
        dims:         { x: 3, y: 3, z: 1 },
        stageSeconds: 5,
        label:        '2D',
        entrance:     'headOn',
    },
    {
        dims:         { x: 3, y: 3, z: 3 },
        stageSeconds: 7,
        label:        '3D',
        entrance:     'revealOrbit',
    },
    {
        dims:         { x: 3, y: 3, z: 3, w: 3 },
        stageSeconds: Infinity,
        label:        '4D',
    },
    {
        dims:         { x: 3, y: 3, z: 3, w: 4 },
        stageSeconds: Infinity,
        label:        '4D',
    },
    {
        dims:         { x: 3, y: 3, z: 3, w: 5 },
        stageSeconds: Infinity,
        label:        '4D',
    },
]

const PAUSE_AFTER_FRAME = 0.08   // seconds after animations settle before next frame
const MAX_FRAMES        = 400    // solver cap per game

// ─── Helpers ─────────────────────────────────────────────────────────────────

function boardExtent(dims) {
    const sp = dims.z ? 1.5 : 1.1   // must match tileSpacingFor() in tiles.js
    const nw = dims.w ?? 1
    const zDepth = (dims.z ?? 1) * sp
        + (nw > 1 ? (PANE_Z_GAP + (dims.z ?? 1) * sp) * (nw - 1) : 0)
    return {
        x: (dims.x ?? 1) * sp,
        y: (dims.y ?? 1) * sp,
        z: zDepth,
    }
}

// ─── Orchestrator ────────────────────────────────────────────────────────────

class Orchestrator {
    constructor(scene, tokens) {
        this.scene        = scene
        this.tokens       = tokens
        this.stageIndex   = 0
        this.stageTimer   = 0

        this._renderer    = null
        this._frames      = []
        this._frameIndex  = 0
        this._settling    = false
        this._settleTimer = 0
    }

    // ── Public ──────────────────────────────────────────────────────────────

    start() {
        this._enterStage(0)
    }

    nextStage() {
        this._enterStage((this.stageIndex + 1) % STAGES.length)
    }

    update(dt) {
        if (!this._renderer) return

        this._renderer.update(dt)
        this.stageTimer += dt

        // Stage-advance timer
        const stage = STAGES[this.stageIndex]
        if (this.stageTimer >= stage.stageSeconds) {
            this.nextStage()
            return
        }

        // Post-frame pause
        if (this._settling) {
            this._settleTimer -= dt
            if (this._settleTimer <= 0) this._settling = false
            return
        }

        // Wait for animations
        if (this._renderer.isAnimating) return

        // Advance frame, or start new game when this one ends
        if (this._frameIndex < this._frames.length - 1) {
            this._frameIndex++
            this._renderer.applyFrame(this._frames[this._frameIndex])
            this._settling    = true
            this._settleTimer = PAUSE_AFTER_FRAME
        } else {
            this._startGame(stage.dims)   // game over → new game, same stage
        }
    }

    dispose() {
        this._renderer?.dispose()
    }

    // ── Private ─────────────────────────────────────────────────────────────

    _enterStage(index) {
        this.stageIndex = index
        this.stageTimer = 0
        const stage     = STAGES[index]
        const rig       = this.scene.cameraRig

        // All stages use perspective + 3D cube tiles
        rig.toPerspective()

        this._startGame(stage.dims)

        // Stage-specific camera entrance
        const ext    = boardExtent(stage.dims)
        const maxExt = Math.max(ext.x, ext.y, ext.z)
        const radius = maxExt * 1.8

        switch (stage.entrance) {
            case 'zoomOut':
                // Start camera touching the cube, pull back dramatically to 3× normal distance
                rig.animateZoomOut(0.8, radius * 3, stage.stageSeconds * 0.9)
                break

            case 'headOn':
                // Camera locked front-on; new rows slide in from behind
                rig.setHeadOn(radius)
                this._renderer.slideInEntrance(this._frames[0], -8, 0.7)
                break

            case 'revealOrbit':
                // Start head-on, orbit begins after a beat — reveals hidden depth
                rig.setHeadOn(radius)
                rig.startRevealOrbit(1.5)
                break

            default:
                // Normal auto-orbit (1D, 4D stages)
                rig.startOrbit(radius, { autoRotate: index >= 4 })
                break
        }
    }

    _startGame(dims) {
        this._renderer?.dispose()

        setGlobalTileIdCounter(0)
        this._frames      = solveGame(dims, this.tokens, MAX_FRAMES)
        this._frameIndex  = 0
        this._settling    = false
        this._settleTimer = 0

        const ndims = Object.keys(dims).length
        const is4D  = ndims >= 4
        // Always render as 3D cubes (allFaces: true for any stage with z or more)
        this._renderer = new BoardRenderer(this.scene.scene, dims, { allFaces: true })

        // Reframe camera to fit the board
        const ext = boardExtent(dims)
        this.scene.cameraRig.reframe(ext)

        this._renderer.applyFrame(this._frames[0])

        // 4D: back panes scatter out from front pane
        if (is4D) {
            this._renderer.genieEntrance(this._frames[0], frontPaneZ(dims))
        }
    }
}

// ─── Entry point ─────────────────────────────────────────────────────────────

export function initHero(canvas) {
    const hero         = new HeroScene(canvas)
    const tokens       = generate2048Tokens()
    const orchestrator = new Orchestrator(hero, tokens)

    hero._update = (dt) => orchestrator.update(dt)

    if (typeof window !== 'undefined') {
        window.__heroNextStage = () => orchestrator.nextStage()
    }

    orchestrator.start()
    hero.start()

    return { hero, orchestrator }
}

// Auto-mount if running as a standalone page
if (typeof document !== 'undefined') {
    const canvas = document.querySelector('#hero-canvas')
    if (canvas) initHero(canvas)
}
