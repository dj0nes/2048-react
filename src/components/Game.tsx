import React, {useCallback, useEffect, useState, useRef} from 'react'
import {useReferredState} from '../utils'
import * as boardUtil from '../board_util'
import boardMap from '../board_map'
import Board from './Board'
import Board3D from './Board3D'
import Button from './Button'

const KEY = {
    LEFT:  37,
    RIGHT: 39,
    UP: 38,
    DOWN: 40,
    W: 87,
    S: 83,
    A: 65,
    D: 68,
    Q: 81,
    E: 69,
    SPACE: 32
}

const BOARD_TRANSITIONS = {
    up: {x: 0, y: -1, z: 0},
    down: {x: 0, y: 1, z: 0},
    left: {x: 1, y: 0, z: 0},
    right: {x: -1, y: 0, z: 0},
    in: {x: 0, y: 0, z: -1},
    out: {x: 0, y: 0, z: 1}
}

interface GameInterface {
    boardSize: number
    boardDimensions: {
        x: number,
        y: number,
        z: number
    }
}

interface GameState {
    boardSize: number,
    boardDimensions: BoardDimensions,
    tokens: object,
    history: GameHistory[]
}

interface BoardDimensions {
    x: number,
    y: number,
    z: number
}

interface GameHistory {
    board: boardMap,
    score: number,
    new_points: number
}

const newGameState = (boardSize = 3, boardDimensions = {x: 3, y: 3, z: 3}, tokens: {}) : GameState => ({ boardSize, boardDimensions, tokens, history: [{board: new boardMap(), score: 0, new_points: 0}]})



const Game = ({boardSize, boardDimensions }: GameInterface) => {
    // let touch_delay_ms = 100
    // let debouncing = false
    // let saved_game = localStorage.getItem('game')
    // if(saved_game !== null && true) {
    //     // gameState = this.loadGame(saved_game)
    // }
    // else {
    //     gameState = this.newGame(boardSize, boardDimensions, tokens)
    // }


    // this goofy gameStateRef setup is needed for the keydownHandler to have access to the current state
    // otherwise it will bind to the game state at initialization, which will never change
    // bound functions like the keydownHandler need to use the ref, everything else can use state as usual
    const [gameState, gameStateRef, setGameState] = useReferredState<GameState>(newGameState(boardSize, boardDimensions, boardUtil.generate2048Tokens()))

    const keydownHandler = useCallback(event =>  {
        const newState = handleKeys(event, gameStateRef.current)
        const res = {...gameStateRef.current, ...newState}
        setGameState(res)
    }, [])

    function handleKeys(event, gameState) {
        let current = gameState.history[gameState.history.length - 1]
        let direction: { x: number; y: number; z: number } | null = null
        if(event.keyCode === KEY.SPACE) return shuffle(gameState)
        if(event.keyCode === 90 && (event.ctrlKey || event.metaKey) && gameState.history.length > 1) return undo(gameState)
        if(event.keyCode === KEY.LEFT   || event.keyCode === KEY.A) direction = BOARD_TRANSITIONS.left
        if(event.keyCode === KEY.RIGHT  || event.keyCode === KEY.D) direction = BOARD_TRANSITIONS.right
        if(event.keyCode === KEY.UP     || event.keyCode === KEY.W) direction = BOARD_TRANSITIONS.up
        if(event.keyCode === KEY.DOWN   || event.keyCode === KEY.S) direction = BOARD_TRANSITIONS.down
        if(event.keyCode === KEY.Q) direction = BOARD_TRANSITIONS.out
        if(event.keyCode === KEY.E) direction = BOARD_TRANSITIONS.in
        if(!direction) return

        // cut the direction object down to dimensions we're dealing with, eg. x, y for a 2D board, not x, y, z
        let intersection = Object.entries(direction).filter(([k, /* v */]) => k in gameState.boardDimensions)
        let final_direction = {}
        for(const [key, value] of intersection) {
            final_direction[key] = value
        }
        let {merged_board, new_points} = boardUtil.mergeBoard(current.board, gameState.boardDimensions, final_direction, gameState.tokens)
        if(current.board.equals(merged_board)) {
            return current.board
        }

        boardUtil.randomTileInsert(merged_board, gameState.boardDimensions, gameState.tokens, 1)

        return {
            history: gameState.history.concat({
                board: merged_board,
                score: current.score + new_points,
                new_points
            })
        }
    }

    // game setup
    useEffect(() => {
        // start with two random tiles
        const board = new boardMap()
        boardUtil.randomTileInsert(board, boardDimensions, gameState.tokens)
        boardUtil.randomTileInsert(board, boardDimensions, gameState.tokens)
        setGameState({
            boardSize,
            boardDimensions,
            tokens: gameState.tokens,
            history: [{
                board,
                score: 0,
                new_points: 0
            }]
        })

        window.addEventListener('keydown', keydownHandler)

        return () => {
            window.addEventListener('keydown', keydownHandler)
        }
    }, [])

    // saveGame() {
    //     // // saves only the current board, not entire history
    //     // let current = gameState.history[gameState.history.length - 1]
    //     // let state_copy = {
    //     //     ...gameState,
    //     //     global_tile_id: boardUtil.getGlobalTileIdCounter.bind(boardUtil)()
    //     // }
    //     // state_copy.history = [current]
    //     // let serialized_game = JSON.stringify(state_copy)
    //     // localStorage.setItem('game', serialized_game)
    // }
    //
    // loadGame(saved_game: any) {
    //     // try {
    //     //     let deserialized = JSON.parse(saved_game)
    //     //     let board = new boardMap([], deserialized.history[0].board.coordinates)
    //     //     deserialized.history[0].board = boardUtil.boardCleanup(board)  // eliminates new tile popping on reload
    //     //     deserialized.history[0].new_points = 0
    //     //     boardUtil.setGlobalTileIdCounter.bind(boardUtil)(deserialized.global_tile_id)
    //     //     return {...deserialized}
    //     // }
    //     // catch(error) {
    //     //     return this.newGame()
    //     // }
    // }

    function shuffle(gameState) {
        let current = gameState.history[gameState.history.length - 1]
        let new_board = boardUtil.shuffle(current.board, gameState.boardDimensions)
        return {
            history: gameState.history.concat({
                board: new_board,
                score: current.score,
                new_points: 0
            })
        }
    }
    //
    // sweep() {
    //     // let current = gameState.history[gameState.history.length - 1]
    //     // let new_board = boardUtil.sweep(current.board, 64)
    //     // this.setState({
    //     //     history: gameState.history.concat({
    //     //         board: new_board,
    //     //         score: current.score,
    //     //         new_points: 0
    //     //     })
    //     // }, this.saveGame)
    // }
    //
    function undo(gameState) {
        // set state back by one
        if(gameState.history.length > 1) {
            let history = gameState.history.slice(0, gameState.history.length - 1)
            let current = history[history.length - 1]
            current.board = boardUtil.boardCleanup(current.board)  // eliminates special tile states when rewinding
            return {
                ...gameState,
                history: history
            }
        }
    }

    // generateTestBoard(board, boardSize) {
    //     let value = 1
    //     for(let x = 0; x < boardSize; x++) {
    //         for (let y = 0; y < boardSize; y++) {
    //             for (let z = 0; z < boardSize; z++) {
    //                 value *= 2
    //                 board.set({x, y, z}, [boardUtil.createTile({value: value})])
    //             }
    //         }
    //     }
    // }
    //
    // touchDebounce(fn, args) {
    //     if(this.debouncing !== true) {
    //         this.debouncing = true
    //         fn.apply(this, args)
    //         setTimeout(() => {
    //             this.debouncing = false
    //         }, this.touch_delay_ms)
    //     }
    //
    // }
    //
    // handleSwipeUp(event) {
    //     event.keyCode = KEY.W
    //     this.touchDebounce(this.handleKeys, [{}, event])
    // }
    //
    // handleSwipeDown(event) {
    //     event.keyCode = KEY.S
    //     this.touchDebounce(this.handleKeys, [{}, event])
    // }
    //
    // handleSwipeRight(event) {
    //     event.keyCode = KEY.D
    //     this.touchDebounce(this.handleKeys, [{}, event])
    // }
    //
    // handleSwipeLeft(event) {
    //     event.keyCode = KEY.A
    //     this.touchDebounce(this.handleKeys, [{}, event])
    // }
    //
    // handlePinchIn(event) {
    //     event.keyCode = KEY.E
    //     this.touchDebounce(this.handleKeys, [{}, event])
    // }
    //
    // handlePinchOut(event) {
    //     event.keyCode = KEY.Q
    //     this.touchDebounce(this.handleKeys, [{}, event])
    // }
    //
    // handleNewGame(boardSize, boardDimensions) {
    //     this.setState(this.newGame(boardSize, boardDimensions))
    // }
    //
    // openOverlay(props) {
    //     this.setState({
    //         overlay: {
    //             active: true,
    //             title: props.title || '',
    //             contents: props.contents || '',
    //             button_text: props.button_text || '',
    //             button_action: props.button_action.bind(this) || this.closeOverlay.bind(this)
    //         }
    //     })
    // }
    //
    // closeOverlay() {
    //     let overlay = {
    //         active: false,
    //         title: '',
    //         contents: '',
    //         button_text: '',
    //         button_action: () => {}
    //     }
    //     this.setState({overlay})
    //     return overlay
    // }

    const history = gameState.history
    let current = history[history.length - 1]
    const current_board_map = current.board

    let boards3D : any[] = []
    let board3D_count = Object.keys(gameState.boardDimensions).length - 3 // not entirely correct, but I haven't implemented 4D yet
    for(let i = 0; i <= board3D_count; i++) {
        boards3D.push(
            <Board3D
                board_map={current_board_map}
                boardSize={gameState.boardSize}
                tokens={gameState.tokens}
                key={i}
                // handleClick={(i)=>this.handleClick(i)}
            />
        )
    }

    let boards2D = []
    let board2D_count = gameState.boardDimensions.z - 1 || 0
    for(let i = 0; i <= board2D_count; i++) {
        boards2D.push(
            <Board
                board_map={current_board_map}
                boardSize={gameState.boardSize}
                z_layer={i}
                key={i}
                // handleClick={(i)=>this.handleClick(i)}
            />
        )
    }

    let board_style = `
        :root {
            --box-size: 4em;
            --gutter: calc(var(--box-size) / 8);
            --boxes: ${gameState.boardSize};
        }`

    let scored = current.new_points === 0 ? '' : 'scored'

    let options = {
        recognizers: {
            pinch: {
                enable: true,
                threshold: .25
            },
            swipe: {
                threshold: 1,
                velocity: .1
            }
        }
    }

    // css animations don't "restart" unless a reflow is triggered
    // we'll just alternate between two different keys, so react renders a new element each turn
    let new_score_id = gameState.history.length % 2 === 1
    let overlay = {
        title: 'test opening overlay',
        contents: 'test opening overlay',
        button_text: 'close',
        // button_action: this.closeOverlay
    }

    return (
        <div className={'grid'}
            // options={options}
            // direction='DIRECTION_ALL'
            // onSwipeUp={this.handleSwipeUp.bind(this)}
            // onSwipeDown={this.handleSwipeDown.bind(this)}
            // onSwipeRight={this.handleSwipeRight.bind(this)}
            // onSwipeLeft={this.handleSwipeLeft.bind(this)}
            // onPinchIn={this.handlePinchIn.bind(this)}
            // onPinchOut={this.handlePinchOut.bind(this)}
        >
            <div>

                <div className={'header'}>
                    <h1 className={'title'}>2048-react</h1>
                    <div className={'score-container'}>
                        <h2>Score: {current.score}</h2>
                        <span key={`${new_score_id}`} className={`new-points ${scored}`}
                            style={{display: current.new_points === 0 ? 'none' : 'inline-block'}}>
                                + {current.new_points}
                        </span>
                        {/*<Button action={function() {this.handleNewGame.apply(this, [3, {x: 3, y: 3, z: 3}])}.bind(this)} text={'New Game'}></Button>*/}
                        {/*<Button action={function() {this.handleNewGame.apply(this, [4, {x: 4, y: 4}])}.bind(this)}  text={'New 2D Game'}></Button>*/}
                        {/*<Button action={this.sweep.bind(this)} text={'Sweep'}></Button>*/}
                        {/*<Button action={this.shuffle.bind(this)} text={'Shuffle'}></Button>*/}
                        {/*<Button action={this.undo.bind(this)} text={'Undo'}></Button>*/}
                        {/*<Button action={() => this.openOverlay(overlay)} text={'Open Overlay'}></Button>*/}
                    </div>
                </div>


                <style>{board_style}</style>
                <div id="board3D-container">
                    <div className={'board3D-wrapper'}>
                        {/*<Overlay active={gameState.overlay.active} title={gameState.overlay.title} message={gameState.overlay.contents}*/}
                        {/*    action={gameState.overlay.button_action}*/}
                        {/*    button_text={gameState.overlay.button_text}>*/}
                        {/*</Overlay>*/}
                        {boards3D}
                    </div>
                </div>
                <div id="board2D-container">
                    {boards2D}
                </div>
                <div className="footer">Made with <span role={'img'} aria-label={'love'}>💙</span> by Dillon Jones</div>
            </div>
        </div>
    )
}

export default Game
