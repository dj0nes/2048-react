import React from 'react'
import * as BoardUtil from '../board_util'
import BoardMap from '../board_map'
import Board from './board'
import Board3D from './board-3d'
import {randomTileInsert} from '../board_util'
import Hammer from 'react-hammerjs'
import PropTypes from 'prop-types'


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

class Game extends React.Component {
    constructor(props) {
        super(props)
        let board_size = props.board_size || 3
        let board_dimensions = props.board_dimensions || {x: board_size, y: board_size, z: board_size}
        let tokens = BoardUtil.generate2048Tokens.bind(BoardUtil)()
        this.board_transitions = {
            up: {x: 0, y: -1, z: 0},
            down: {x: 0, y: 1, z: 0},
            left: {x: 1, y: 0, z: 0},
            right: {x: -1, y: 0, z: 0},
            in: {x: 0, y: 0, z: -1},
            out: {x: 0, y: 0, z: 1}
        }
        this.touch_delay_ms = 100
        this.debouncing = false

        let saved_game = localStorage.getItem('game')
        if(saved_game !== null && true) {
            this.state = this.loadGame(saved_game)
        }
        else {
            this.state = this.newGame(board_size, board_dimensions, tokens)
        }
    }

    newGame(board_size = 3, board_dimensions = {x: 3, y: 3, z: 3}, tokens = BoardUtil.generate2048Tokens.bind(BoardUtil)()) {
        // start with two random tiles
        let board = new BoardMap()
        BoardUtil.randomTileInsert(board, board_dimensions, tokens)
        BoardUtil.randomTileInsert(board, board_dimensions, tokens)
        return {
            board_size,
            board_dimensions,
            tokens,
            history: [{
                board: board,
                score: 0,
                new_points: 0
            }]
        }
    }

    saveGame() {
        // saves only the current board, not entire history
        let current = this.state.history[this.state.history.length - 1]
        let state_copy = {
            ...this.state,
            global_tile_id: BoardUtil.getGlobalTileIdCounter.bind(BoardUtil)()
        }
        state_copy.history = [current]
        let serialized_game = JSON.stringify(state_copy)
        localStorage.setItem('game', serialized_game)
    }

    loadGame(saved_game) {
        let deserialized = JSON.parse(saved_game)
        let board = new BoardMap([], deserialized.history[0].board.coordinates)
        deserialized.history[0].board = BoardUtil.boardCleanup(board)  // eliminates new tile popping on reload
        deserialized.history[0].new_points = 0
        BoardUtil.setGlobalTileIdCounter.bind(BoardUtil)(deserialized.global_tile_id)
        return {...deserialized}
    }

    handleClick() {
        // noop, maybe I'll need this in the future?
    }

    shuffle() {
        let current = this.state.history[this.state.history.length - 1]
        let new_board = BoardUtil.shuffle(current.board, this.state.board_dimensions)
        this.setState({
            history: this.state.history.concat({
                board: new_board,
                score: current.score,
                new_points: 0
            })
        })
    }

    undo() {
        // set state back by one
        let history = this.state.history.slice(0, this.state.history.length - 1)
        this.setState({
            history: history
        })
    }

    handleKeys(value, event) {
        let current = this.state.history[this.state.history.length - 1]
        let direction = ''
        if(event.keyCode === KEY.SPACE) return this.shuffle()
        if(event.keyCode === 90 && (event.ctrlKey || event.metaKey) && this.state.history.length > 1) return this.undo()
        if(event.keyCode === KEY.LEFT   || event.keyCode === KEY.A) direction = this.board_transitions.left
        if(event.keyCode === KEY.RIGHT  || event.keyCode === KEY.D) direction = this.board_transitions.right
        if(event.keyCode === KEY.UP     || event.keyCode === KEY.W) direction = this.board_transitions.up
        if(event.keyCode === KEY.DOWN   || event.keyCode === KEY.S) direction = this.board_transitions.down
        if(event.keyCode === KEY.Q) direction = this.board_transitions.out
        if(event.keyCode === KEY.E) direction = this.board_transitions.in
        if(direction === '') return

        // cut the direction object down to dimensions we're dealing with, eg. x, y for a 2D board, not x, y, z
        let intersection = Object.entries(direction).filter(([k, /* v */]) => k in this.state.board_dimensions)
        let final_direction = {}
        for(const [key, value] of intersection) {
            final_direction[key] = value
        }
        let {merged_board, new_points} = BoardUtil.mergeBoard(current.board, this.state.board_dimensions, final_direction, this.state.tokens)
        if(!current.board.equals(merged_board, ['id', 'value'], ['remove'])) {
            randomTileInsert(merged_board, this.state.board_dimensions, this.state.tokens, 1)

            this.setState({
                history: this.state.history.concat({
                    board: merged_board,
                    score: current.score + new_points,
                    new_points
                })
            })

            this.saveGame()
        }
    }

    componentDidMount() {
        window.addEventListener('keyup',   () => {})
        window.addEventListener('keydown', this.handleKeys.bind(this, true))
    }

    generateTestBoard(board, board_size) {
        let value = 1
        for(let x = 0; x < board_size; x++) {
            for (let y = 0; y < board_size; y++) {
                for (let z = 0; z < board_size; z++) {
                    value *= 2
                    board.set({x, y, z}, [BoardUtil.createTile({value: value})])
                }
            }
        }
    }

    touchDebounce(fn, args) {
        if(this.debouncing !== true) {
            this.debouncing = true
            fn.apply(this, args)
            setTimeout(() => {
                this.debouncing = false
            }, this.touch_delay_ms)
        }

    }

    handleSwipeUp(event) {
        event.keyCode = KEY.W
        this.touchDebounce(this.handleKeys, [{}, event])
    }

    handleSwipeDown(event) {
        event.keyCode = KEY.S
        this.touchDebounce(this.handleKeys, [{}, event])
    }

    handleSwipeRight(event) {
        event.keyCode = KEY.D
        this.touchDebounce(this.handleKeys, [{}, event])
    }

    handleSwipeLeft(event) {
        event.keyCode = KEY.A
        this.touchDebounce(this.handleKeys, [{}, event])
    }

    handlePinchIn(event) {
        event.keyCode = KEY.E
        this.touchDebounce(this.handleKeys, [{}, event])
    }

    handlePinchOut(event) {
        event.keyCode = KEY.Q
        this.touchDebounce(this.handleKeys, [{}, event])
    }

    handleNewGame(board_size, board_dimensions) {
        this.setState(this.newGame(board_size, board_dimensions))
    }

    render() {
        const history = this.state.history
        let current = history[history.length - 1]
        const current_board_map = current.board

        let boards3D = []
        let board3D_count = Object.keys(this.state.board_dimensions).length - 3 // not entirely correct, but I haven't implemented 4D yet
        for(let i = 0; i <= board3D_count; i++) {
            boards3D.push(<Board3D
                board_map={current_board_map}
                board_size={this.state.board_size}
                tokens={this.state.tokens}
                key={i}
                handleClick={(i)=>this.handleClick(i)}
            />)
        }

        let boards2D = []
        let board2D_count = this.state.board_dimensions.z - 1 || 0
        for(let i = 0; i <= board2D_count; i++) {
            boards2D.push(<Board
                board_map={current_board_map}
                board_size={this.state.board_size}
                z_layer={i}
                key={i}
                handleClick={(i)=>this.handleClick(i)}
            />)
        }

        let board_style = `
        :root {
            --box-size: 4em;
            --gutter: calc(var(--box-size) / 8);
            --boxes: ${this.state.board_size};
        }`

        let scored = this.state.new_points === 0 ? '' : 'scored'

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
        let new_score_id = this.state.history.length % 2 === 1

        return (
            <Hammer className={'grid'}
                options={options}
                direction='DIRECTION_ALL'
                onSwipeUp={this.handleSwipeUp.bind(this)}
                onSwipeDown={this.handleSwipeDown.bind(this)}
                onSwipeRight={this.handleSwipeRight.bind(this)}
                onSwipeLeft={this.handleSwipeLeft.bind(this)}
                onPinchIn={this.handlePinchIn.bind(this)}
                onPinchOut={this.handlePinchOut.bind(this)}
            >
                <div>
                    <div className={'header'}>
                        <h1 className={'title'}>2048-react</h1>
                        <div className={'score-container'}>
                            <h2>Score: {current.score}</h2>
                            <span key={new_score_id} className={`new-points ${scored}`}
                                style={{display: current.new_points === 0 ? 'none' : 'inline-block'}}>
                                + {current.new_points}
                            </span>
                            <button onClick={function() {this.handleNewGame.apply(this, [3, {x: 3, y: 3, z: 3}])}.bind(this)}>New Game</button>
                            <button onClick={function() {this.handleNewGame.apply(this, [4, {x: 4, y: 4}])}.bind(this)}>New 2D Game</button>
                        </div>
                    </div>


                    <style>{board_style}</style>
                    <div id="board3D-container">
                        {boards3D}
                    </div>
                    <div id="board2D-container">
                        {boards2D}
                    </div>
                    <div className="footer">Made with <span role={'img'} aria-label={'love'}>💙</span> by Dillon Jones</div>
                </div>
            </Hammer>
        )
    }
}

Game.propTypes = {
    board_size: PropTypes.number,
    board_dimensions: PropTypes.number
}

export default Game