/**
 * solver.js — AI solver for n-dimensional 2048
 *
 * Greedy heuristic: at each step, try all valid directions and pick the one
 * that yields the most merge points. Tiebreak: most tiles freed (occupancy drop).
 *
 * solveGame(dims, tokens) → BoardFrame[]
 *   BoardFrame: { board: boardMap, score: number, gameOver: boolean }
 *
 * The returned frames include merge state (merged_to / remove flags) so the
 * renderer can animate slides and pops. boardCleanup() was applied to produce
 * the board used for the *next* step — the frame itself is pre-cleanup.
 *
 * Worker-compatible: no DOM, no globals beyond the shared global_id counter
 * from board_util (fine for single-threaded use; reset before calling if needed).
 */

import boardMap from '../board_map.js'
import {
    getAllDirections,
    mergeBoard,
    boardCleanup,
    randomTileInsert,
    isGameOver,
} from '../board_util.js'

/**
 * @param {Object} dims - e.g. { x: 4, y: 4 } or { x: 4, y: 4, z: 4 }
 * @param {Object} tokens - from generate2048Tokens()
 * @param {number} maxFrames - safety cap (default 600)
 * @returns {BoardFrame[]}
 */
export function solveGame(dims, tokens, maxFrames = 600, fromBoard = null) {
    const frames = []
    let board = fromBoard ? boardCleanup(fromBoard) : new boardMap()
    let score = 0

    // Seed: fresh start gets normal seeding; carry-over gets 1 transition tile
    randomTileInsert(board, dims, tokens, fromBoard ? 1 : undefined)
    frames.push({ board: snapshot(board), score, gameOver: false })
    board = boardCleanup(board)  // strip new_tile for game logic

    for (let i = 0; i < maxFrames; i++) {
        if (isGameOver(board, dims, tokens)) {
            frames[frames.length - 1].gameOver = true
            break
        }

        const result = pickBestMove(board, dims, tokens)

        if (!result) {
            frames[frames.length - 1].gameOver = true
            break
        }

        score += result.points

        // Merge frame: has merged_to and remove annotations for the renderer to animate
        frames.push({ board: snapshot(result.mergedBoard), score, gameOver: false })

        const cleanBoard = boardCleanup(result.mergedBoard)
        const inserted = randomTileInsert(cleanBoard, dims, tokens)

        if (!inserted) {
            frames.push({ board: snapshot(cleanBoard), score, gameOver: true })
            break
        }

        // Spawn frame: has new_tile annotations for the renderer to animate
        frames.push({ board: snapshot(cleanBoard), score, gameOver: false })
        board = boardCleanup(cleanBoard)  // strip new_tile for next move
    }

    return frames
}

// ---------------------------------------------------------------------------
// Internals
// ---------------------------------------------------------------------------

function pickBestMove(board, dims, tokens) {
    const directions = getAllDirections(dims)
    let best = null

    for (const dir of directions) {
        const { merged_board, new_points } = mergeBoard(board, dims, dir, tokens)
        const cleaned = boardCleanup(merged_board)

        // Skip if the move changes nothing
        if (cleaned.equals(board)) continue

        // Heuristic: maximize points earned. Tiebreak: most tiles freed.
        const occupancyDrop = board.getSortedKeys().length - cleaned.getSortedKeys().length
        const heuristic = new_points * 10 + occupancyDrop

        if (best === null || heuristic > best.heuristic) {
            best = { mergedBoard: merged_board, points: new_points, heuristic }
        }
    }

    return best
}

function snapshot(board) {
    const pairs = []
    for (const [key, tiles] of Object.entries(board.getContents())) {
        pairs.push({ coordinates: key, tiles: tiles.map(t => ({ ...t })) })
    }
    return new boardMap(pairs)
}
