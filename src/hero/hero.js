/**
 * hero.js — entry point for the 2048 hero experience
 *
 * Usage (standalone embed):
 *   import { initHero } from './hero.js'
 *   initHero(document.querySelector('#hero-canvas'))
 *
 * Or via hero.html for dev.
 */

import { generate2048Tokens, boardCleanup, setGlobalTileIdCounter } from '../board_util.js'
import { HeroScene } from './scene.js'
import { solveGame }  from './solver.js'
import { BoardRenderer, coordToWorld } from './tiles.js'

// Seconds to pause after animations settle before advancing to the next frame
const PAUSE_AFTER_SETTLE = 0.10

export function initHero(canvas) {
    const hero   = new HeroScene(canvas)
    const tokens = generate2048Tokens()

    let boardRenderer = null
    let frames        = []
    let frameIndex    = 0
    let settling      = false   // waiting out the post-animation pause
    let settleTimer   = 0

    function startGame(dims) {
        if (boardRenderer) boardRenderer.dispose()

        setGlobalTileIdCounter(0)
        frames     = solveGame(dims, tokens, 400)
        frameIndex = 0
        settling   = false
        settleTimer = 0

        boardRenderer = new BoardRenderer(hero.scene, dims)

        // Reframe camera for this board size
        hero.cameraRig.reframe({
            x: (dims.x ?? 1) * 1.1,
            y: (dims.y ?? 1) * 1.1,
            z: (dims.z ?? 1) * 1.1,
        })

        boardRenderer.applyFrame(frames[0])
    }

    hero._update = (dt) => {
        if (!boardRenderer) return

        boardRenderer.update(dt)

        if (settling) {
            settleTimer -= dt
            if (settleTimer <= 0) settling = false
            return
        }

        // Wait for current animations to finish
        if (boardRenderer.isAnimating) return

        // Advance to next frame, or loop with a new game
        if (frameIndex < frames.length - 1) {
            frameIndex++
            boardRenderer.applyFrame(frames[frameIndex])
            settling    = true
            settleTimer = PAUSE_AFTER_SETTLE
        } else {
            // Game over — start a new one after a brief pause
            settling    = true
            settleTimer = 1.5
            const onDone = () => startGame({ x: 4, y: 4 })
            // Reuse settling to delay the new game
            const origUpdate = hero._update
            hero._update = (dt2) => {
                settleTimer -= dt2
                if (settleTimer <= 0) {
                    hero._update = origUpdate
                    onDone()
                }
            }
        }
    }

    startGame({ x: 4, y: 4 })
    hero.start()

    return hero
}

// Auto-mount if running as a standalone page
if (typeof document !== 'undefined') {
    const canvas = document.querySelector('#hero-canvas')
    if (canvas) initHero(canvas)
}
