/**
 * hero.js — Orchestrator for the 2048 dimensional progression hero
 *
 * Stages advance on a timer (or manual override via window.__heroNextStage()).
 * Each stage runs a live AI game; on game over it restarts the same stage
 * until the stage timer fires, then it steps to the next stage.
 *
 * Stage sequence (loops):
 *   1D  →  2D  →  3D (perspective + orbit)  →  loop
 */

import { generate2048Tokens, setGlobalTileIdCounter } from '../board_util.js'
import { HeroScene }     from './scene.js'
import { solveGame }     from './solver.js'
import { BoardRenderer } from './tiles.js'

// ─── Stage definitions ───────────────────────────────────────────────────────

const STAGES = [
    {
        dims:        { x: 4 },
        stageSeconds: 12,
        perspective:  false,
        label:        '1D',
    },
    {
        dims:        { x: 4, y: 4 },
        stageSeconds: 25,
        perspective:  false,
        label:        '2D',
    },
    {
        dims:        { x: 3, y: 3, z: 3 },
        stageSeconds: Infinity,   // last stage: loop forever
        perspective:  true,
        label:        '3D',
    },
]

const PAUSE_AFTER_FRAME = 0.08   // seconds after animations settle before next frame
const MAX_FRAMES        = 400    // solver cap per game

// ─── Helpers ─────────────────────────────────────────────────────────────────

// World-space extent of a board (used to size the camera frustum)
function boardExtent(dims) {
    const SPACING = 1.1
    return {
        x: (dims.x ?? 1) * SPACING,
        y: (dims.y ?? 1) * SPACING,
        z: (dims.z ?? 1) * SPACING,
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

        // Advance frame, or restart game on game over
        if (this._frameIndex < this._frames.length - 1) {
            this._frameIndex++
            this._renderer.applyFrame(this._frames[this._frameIndex])
            this._settling    = true
            this._settleTimer = PAUSE_AFTER_FRAME
        } else {
            this._startGame(stage.dims)   // same stage, new game
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

        // Camera mode
        if (stage.perspective) {
            this.scene.cameraRig.toPerspective()
        }

        this._startGame(stage.dims)
    }

    _startGame(dims) {
        this._renderer?.dispose()

        setGlobalTileIdCounter(0)
        this._frames      = solveGame(dims, this.tokens, MAX_FRAMES)
        this._frameIndex  = 0
        this._settling    = false
        this._settleTimer = 0

        const is3D = Object.keys(dims).length >= 3
        this._renderer = new BoardRenderer(this.scene.scene, dims, { allFaces: is3D })

        // Reframe camera
        const ext = boardExtent(dims)
        this.scene.cameraRig.reframe(ext)

        // Start orbit for 3D stages
        if (is3D) {
            const maxExt = Math.max(ext.x, ext.y, ext.z)
            this.scene.cameraRig.startOrbit(maxExt * 1.8)
        } else {
            this.scene.cameraRig.stopOrbit()
        }

        this._renderer.applyFrame(this._frames[0])
    }
}

// ─── Entry point ─────────────────────────────────────────────────────────────

export function initHero(canvas) {
    const hero        = new HeroScene(canvas)
    const tokens      = generate2048Tokens()
    const orchestrator = new Orchestrator(hero, tokens)

    hero._update = (dt) => orchestrator.update(dt)

    // Manual override: call window.__heroNextStage() from console
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
