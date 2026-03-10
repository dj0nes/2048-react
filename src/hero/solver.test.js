import { solveGame } from './solver.js'
import { generate2048Tokens, setGlobalTileIdCounter } from '../board_util.js'

beforeEach(() => {
    setGlobalTileIdCounter(0)
})

describe('solveGame', () => {
    test('returns at least one frame', () => {
        const tokens = generate2048Tokens()
        const frames = solveGame({ x: 4 }, tokens)
        expect(frames.length).toBeGreaterThan(0)
    })

    test('last frame is gameOver', () => {
        const tokens = generate2048Tokens()
        const frames = solveGame({ x: 4 }, tokens)
        expect(frames[frames.length - 1].gameOver).toBe(true)
    })

    test('score is non-decreasing', () => {
        const tokens = generate2048Tokens()
        const frames = solveGame({ x: 4 }, tokens)
        for (let i = 1; i < frames.length; i++) {
            expect(frames[i].score).toBeGreaterThanOrEqual(frames[i - 1].score)
        }
    })

    test('works for 2D board', () => {
        const tokens = generate2048Tokens()
        const frames = solveGame({ x: 4, y: 4 }, tokens)
        expect(frames.length).toBeGreaterThan(10)
        expect(frames[frames.length - 1].gameOver).toBe(true)
    })

    test('each frame has a board with tiles', () => {
        const tokens = generate2048Tokens()
        const frames = solveGame({ x: 4, y: 4 }, tokens, 20)
        for (const frame of frames) {
            expect(frame.board).toBeDefined()
            expect(typeof frame.score).toBe('number')
            expect(typeof frame.gameOver).toBe('boolean')
        }
    })

    test('works for 3D board', () => {
        const tokens = generate2048Tokens()
        const frames = solveGame({ x: 3, y: 3, z: 3 }, tokens)
        expect(frames.length).toBeGreaterThan(1)
        expect(frames[frames.length - 1].gameOver).toBe(true)
    })
})
