/**
 * hero.js — Orchestrator for the 2048 dimensional progression hero
 *
 * Stages advance on a timer (or manual override via window.__heroNextStage()).
 * A single board state persists across stage transitions — tiles carry over as
 * new dimensions are revealed. Each stage restricts moves to its active axes.
 *
 * Stage sequence:
 *   0D (single cube, dramatic zoom out — static, no game)
 *   1D (line of 3 cubes, x-axis moves only)
 *   2D (flat 3×3 grid, x+y moves)
 *   3D (3×3×3 cube, camera orbits to reveal depth)
 *   4D×3 → 4D×4 → 4D×5  (loop forever)
 */

import * as THREE from 'three'
import { generate2048Tokens, setGlobalTileIdCounter, boardCleanup } from '../board_util.js'
import { HeroScene }     from './scene.js'
import { solveGame }     from './solver.js'
import { BoardRenderer, PANE_Z_GAP, frontPaneZ } from './tiles.js'

// ─── Stage definitions ───────────────────────────────────────────────────────

// entrance values:
//   'zoomOut'     — camera starts extremely close and pulls back dramatically
//   'headOn'      — camera locks to front face, no orbit
//   'revealOrbit' — camera starts head-on then begins orbiting to reveal depth
//   undefined     — normal orbit (1D, 4D stages)

// revealAxis: the world-space direction of the newly-unlocked dimension.
// New tiles during this transition slide in from off-screen along this axis.
const X = new THREE.Vector3(1, 0, 0)
const Y = new THREE.Vector3(0, 1, 0)
const Z = new THREE.Vector3(0, 0, 1)

const STAGES = [
    {
        dims:         { x: 1, y: 1, z: 1 },
        stageSeconds: 4,
        label:        '0D',
        entrance:     'zoomOut',
        static:       true,
    },
    {
        dims:         { x: 3, y: 1, z: 1 },
        stageSeconds: 4,
        label:        '1D',
        revealAxis:   X,  // x-axis opens up: new tiles slide in from the sides
    },
    {
        dims:         { x: 3, y: 3, z: 1 },
        stageSeconds: 5,
        label:        '2D',
        entrance:     'headOn',
        revealAxis:   Y,  // y-axis opens up: new rows slide in from top/bottom
    },
    {
        dims:         { x: 3, y: 3, z: 3 },
        stageSeconds: 7,
        label:        '3D',
        entrance:     'revealOrbit',
        revealAxis:   Z,  // z-axis opens up: new layers slide in from depth
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

        this._liveBoard   = null   // board state that carries across stage transitions
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

        // Static stages (0D) just show a single tile — no game loop
        if (stage.static) return

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
            this._liveBoard = boardCleanup(this._frames[this._frameIndex].board)
            this._renderer.applyFrame(this._frames[this._frameIndex])
            this._settling    = true
            this._settleTimer = PAUSE_AFTER_FRAME
        } else {
            // Game over within same stage: fresh start (no carry — board is stuck)
            this._startGame(stage.dims, null)
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

        // 2D uses ortho (flat projection) — the switch to perspective at 3D IS the reveal
        if (stage.entrance === 'headOn') {
            rig.toOrtho()
        } else {
            rig.toPerspective()
        }

        // Snapshot current tile world positions so carried tiles can slide smoothly
        const inheritPositions = new Map()
        if (this._renderer) {
            for (const [id, tr] of this._renderer._tiles) {
                inheritPositions.set(id, tr.mesh.position.clone())
            }
        }

        this._startGame(stage.dims, this._liveBoard, inheritPositions, stage.revealAxis ?? null)

        // Camera entrance
        const ext    = boardExtent(stage.dims)
        this.scene.cameraRig.reframe(ext)
        const maxExt = Math.max(ext.x, ext.y, ext.z)
        const radius = maxExt * 1.8

        switch (stage.entrance) {
            case 'zoomOut':
                // Start right on top of the cube, pull back dramatically over the full stage
                rig.animateZoomOut(0.2, radius * 3, stage.stageSeconds)
                break

            case 'headOn':
                // Ortho camera is already head-on; just reframe to fit the board
                rig.reframe(ext)
                break

            case 'revealOrbit':
                rig.setHeadOn(radius)
                rig.startRevealOrbit(1.5)
                break

            default:
                // Normal auto-orbit (1D, 4D stages)
                rig.startOrbit(radius, { autoRotate: index >= 4 })
                break
        }
    }

    _startGame(dims, fromBoard = null, inheritPositions = new Map(), revealAxis = null) {
        this._renderer?.dispose()

        // Preserve tile IDs when carrying; reset only on fresh start
        if (!fromBoard) setGlobalTileIdCounter(0)

        // For small boards (like 1D coming from 0D), pre-fill remaining cells so
        // the dimension leap is visually obvious ("the cube was already the leftmost block")
        let numSeed = null
        if (fromBoard) {
            const totalCells = Object.values(dims).reduce((a, b) => a * b, 1)
            const filledCells = fromBoard.getSortedKeys().length
            numSeed = totalCells <= 6 ? Math.max(1, totalCells - filledCells) : 1
        }

        this._frames      = solveGame(dims, this.tokens, MAX_FRAMES, fromBoard, numSeed)
        this._frameIndex  = 0
        this._settling    = false
        this._settleTimer = 0

        // Track live board state (used for stage transitions)
        this._liveBoard = boardCleanup(this._frames[0].board)

        const is4D = Object.keys(dims).length >= 4
        this._renderer = new BoardRenderer(this.scene.scene, dims, { allFaces: true })
        this._renderer.applyFrame(this._frames[0], inheritPositions, revealAxis)

        // 4D genie entrance only on fresh start — carried tiles slide to position naturally
        if (is4D && !fromBoard) {
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
