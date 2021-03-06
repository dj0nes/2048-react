import React, {useCallback, useEffect} from 'react'
import styled from '@emotion/styled'

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

export interface Token {
    transition_to: number
    points: number
    displayType?: string
    display?: string
}

interface GameInterface {
    tokens: Token[]
    boardDimensions: {
        x: number,
        y: number,
        z: number
    }
}

interface GameState {
    boardDimensions: BoardDimensions
    tokens: object
    history: GameHistory[]
}

interface BoardDimensions {
    x: number
    y: number
    z: number
}

interface GameHistory {
    board: boardMap
    score: number
    new_points: number
    gameOver: boolean
}

const newGameState = (boardDimensions = {x: 3, y: 3, z: 3}, tokens: {}) : GameState => ({ boardDimensions, tokens, history: [{board: new boardMap(), score: 0, new_points: 0, gameOver: false}]})



const Game = ({boardDimensions, tokens}: GameInterface) => {
    // let touch_delay_ms = 100
    // let debouncing = false
    // let saved_game = localStorage.getItem('game')
    // if(saved_game !== null && true) {
    //     // gameState = this.loadGame(saved_game)
    // }
    // else {
    //     gameState = this.newGame(boardDimensions, tokens)
    // }


    // this goofy gameStateRef setup is needed for the keydownHandler to have access to the current state
    // otherwise it will bind to the game state at initialization, which will never change
    // bound functions like the keydownHandler need to use the ref, everything else can use state as usual
    const [gameState, gameStateRef, setGameState] = useReferredState<GameState>(newGameState(boardDimensions, tokens))

    const handleKeys = useCallback((event, gameState) => {
        let current = gameState.history[gameState.history.length - 1]
        let direction: { x: number; y: number; z: number } | null = null
        if(event.keyCode === KEY.SPACE) return shuffle(gameState)
        if(event.ctrlKey && event.shiftKey) return sweep(gameState)
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
                new_points,
                gameOver: boardUtil.isGameOver(merged_board, boardDimensions, gameState.tokens)
            })
        }
    }, []) // eslint-disable-line react-hooks/exhaustive-deps

    const keydownHandler = useCallback(event =>  {
        const newState = handleKeys(event, gameStateRef.current)
        const res = {...gameStateRef.current, ...newState}
        setGameState(res)
    }, [gameStateRef, handleKeys, setGameState])

    // initial game setup
    useEffect(() => {
        // standard board
        const board = new boardMap()
        boardUtil.randomTileInsert(board, boardDimensions, tokens, 4)

        // board with all possible tokens
        // const board = boardUtil.generateAlmostFullBoard(boardDimensions, tokens)

        // board with x axis completely filled for testing merging behavior
        // const board = boardUtil.generateXMerge(boardDimensions, tokens, 4)

        newGame(board)

        window.addEventListener('keydown', keydownHandler)

        return () => {
            window.addEventListener('keydown', keydownHandler)
        }
    }, []) /* eslint-disable-line react-hooks/exhaustive-deps */

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

    function newGame(board) {
        const boardToUse = board || new boardMap()
        if(!board) {
            boardUtil.randomTileInsert(boardToUse, boardDimensions, tokens, 4)
        }
        setGameState({
            boardDimensions,
            tokens: gameState.tokens,
            history: [{
                board: boardToUse,
                score: 0,
                new_points: 0,
                // silly, but a 0 dimensional board is immediately game over
                gameOver: boardUtil.isGameOver(boardToUse, boardDimensions, gameState.tokens)
            }]
        })
    }

    function shuffle(gameState) {
        let current = gameState.history[gameState.history.length - 1]
        let new_board = boardUtil.shuffle(current.board, gameState.boardDimensions)
        return {
            history: gameState.history.concat({
                board: new_board,
                score: current.score,
                new_points: 0,
                gameOver: boardUtil.isGameOver(new_board, boardDimensions, gameState.tokens)
            })
        }
    }

    function sweep(gameState) {
        let current = gameState.history[gameState.history.length - 1]
        let new_board = boardUtil.sweep(current.board, 64)
        return {
            ...gameState,
            history: gameState.history.concat({
                board: new_board,
                score: current.score,
                new_points: 0,
                gameOver: boardUtil.isGameOver(new_board, boardDimensions, gameState.tokens)
            })
        }
    }

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
    // handleNewGame(boardDimensions) {
    //     this.setState(this.newGame(boardDimensions))
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
                boardDimensions={gameState.boardDimensions}
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
                boardDimensions={gameState.boardDimensions}
                z_layer={i}
                key={i}
                // handleClick={(i)=>this.handleClick(i)}
            />
        )
    }

    // this overrides styles in 2D.css, right now it doesn't change anything
    let board_style = `
        :root {
            --box-size: 4em;
            --gutter: calc(var(--box-size) / 8);
        }`

    let scored = current.new_points === 0 ? '' : 'scored'

    // let options = {
    //     recognizers: {
    //         pinch: {
    //             enable: true,
    //             threshold: .25
    //         },
    //         swipe: {
    //             threshold: 1,
    //             velocity: .1
    //         }
    //     }
    // }

    // css animations don't "restart" unless a reflow is triggered
    // we'll just alternate between two different keys, so react renders a new element each turn
    let new_score_id = gameState.history.length % 2 === 1

    // let overlay = {
    //     title: 'test opening overlay',
    //     contents: 'test opening overlay',
    //     button_text: 'close',
    //     // button_action: this.closeOverlay
    // }

    function makeSpecialMove(moveFn) {
        setGameState({...gameState, ...moveFn(gameState)})
    }

    const Overlay = styled.div`
      height: 100vh;
      width: 100%;
      background: #757575;
      padding: 0;
      margin: 0;
      position: absolute;
      z-index: 1000;
      opacity: .9;
      text-align: center;
      font-size: 3em;
      
      > h1 {
        margin-top: 1.25em;
      }
      
    `
    const GameOver = ({score, newGame, undo, shuffle, sweep})=> (
        <Overlay>
            <h1>Game Over</h1>
            <h3>Score:</h3>
            <h2>{score}</h2>
            <button onClick={() => {newGame()}}>New Game</button>
            <button onClick={() => {undo()}}>Undo</button>
            <button onClick={() => {shuffle()}}>Shuffle</button>
            <button onClick={() => {sweep()}}>Sweep</button>
        </Overlay>
    )

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
                {current.gameOver && <GameOver score={current.score} newGame={newGame} undo={() => makeSpecialMove(undo)} shuffle={() => makeSpecialMove(shuffle)} sweep={() => makeSpecialMove(sweep)}/>}
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
                        <Button action={() => makeSpecialMove(sweep)} text={'Sweep'}></Button>
                        <Button action={() => makeSpecialMove(shuffle)} text={'Shuffle'}></Button>
                        <Button action={() => makeSpecialMove(undo)} text={'Undo'}></Button>
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
