import React from 'react'
import * as BoardUtil from '../board_util'
import BoardMap from '../board_map'
import Board from './board'
import Board3D from './board-3d'
import {randomTileInsert} from '../board_util'
import Hammer from 'react-hammerjs'

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

        this.board_size = props.board_size || 3
        this.board_dimensions = props.board_dimensions || {x: this.board_size, y: this.board_size, z: this.board_size}
        this.tokens = BoardUtil.generate2048Tokens.bind(BoardUtil)()
        this.board_transitions = {
            up: {x: 0, y: 1, z: 0},
            down: {x: 0, y: -1, z: 0},
            left: {x: 1, y: 0, z: 0},
            right: {x: -1, y: 0, z: 0},
            in: {x: 0, y: 0, z: -1},
            out: {x: 0, y: 0, z: 1}
        }
        this.touch_delay_ms = 100
        this.debouncing = false

        let board = new BoardMap()

        // this.generateTestBoard(board, this.board_size)

        // start with two random tiles
        BoardUtil.randomTileInsert(board, this.board_dimensions, this.tokens)
        BoardUtil.randomTileInsert(board, this.board_dimensions, this.tokens)

        this.state = {
            score: 0,
            history: [board]
        }
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

    handleClick(i) {
        // noop, maybe I'll need this in the future?
    }

    shuffle() {
        let current = this.state.history[this.state.history.length - 1]
        let new_board = BoardUtil.shuffle(current, this.board_dimensions)
        this.setState({
            board_size: this.state.board_size,
            history: this.state.history.concat(new_board),
            score: this.state.score
        })
    }

    handleKeys(value, event) {
        let current = this.state.history[this.state.history.length - 1]
        let direction = ''
        if (event.keyCode === 90 && (event.ctrlKey || event.metaKey) && this.state.history.length > 1) {
            // undo! set state back by one
            let history = this.state.history.slice(0, this.state.history.length - 1)
            this.setState({
                history: history,
                score: this.state.score
            })

            return
        }

        if(event.keyCode === KEY.SPACE) return this.shuffle()
        if(event.keyCode === KEY.LEFT   || event.keyCode === KEY.A) direction = this.board_transitions.left
        if(event.keyCode === KEY.RIGHT  || event.keyCode === KEY.D) direction = this.board_transitions.right
        if(event.keyCode === KEY.UP     || event.keyCode === KEY.W) direction = this.board_transitions.up
        if(event.keyCode === KEY.DOWN   || event.keyCode === KEY.S) direction = this.board_transitions.down
        if(event.keyCode === KEY.Q) direction = this.board_transitions.out
        if(event.keyCode === KEY.E) direction = this.board_transitions.in
        if(direction === '') return

        let {merged_board, new_points} = BoardUtil.mergeBoard(current, this.board_dimensions, direction, this.tokens)
        if(!current.equals(merged_board, ['id', 'value'], ['remove'])) {
            randomTileInsert(merged_board, this.board_dimensions, this.tokens, 1)  // will insert max(board_dimensions) - 1 tiles

            this.setState({
                history: this.state.history.concat(merged_board),
                score: this.state.score + new_points
            })
        }
    }

    componentDidMount() {
        window.addEventListener('keyup',   () => {})
        window.addEventListener('keydown', this.handleKeys.bind(this, true))
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

    render() {
        const history = this.state.history
        const current_board_map = history[history.length - 1]
        // setTimeout(() => this.handleClick('blah'), 800)

        let boards2D = []
        for(let i = 0; i < this.board_dimensions.x; i++) {
            boards2D.push(<Board
                board_map={current_board_map}
                board_size={this.board_size}
                z_layer={i}
                key={i}
                handleClick={(i)=>this.handleClick(i)}
            />)
        }

        let board_style = `
        :root {
            --box-size: 4em;
            --gutter: calc(var(--box-size) / 8);
            --boxes: ${this.board_size};
        }`

        let options = {
            recognizers: {
                pinch: {
                    enable: true,
                    threshold: .05
                },
                swipe: {
                    threshold: 1,
                    velocity: .1
                }
            }
        }

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
                        <h1>2048-react</h1>
                        <h2>Score: {this.state.score}</h2>
                    </div>

                    <div id="board3D-container">
                        <Board3D
                            board_map={current_board_map}
                            board_size={this.board_size}
                            tokens={this.tokens}
                            handleClick={(i)=>this.handleClick(i)}
                        />
                    </div>
                    <div id="board2D-container">
                        <style>{board_style}</style>
                        {boards2D}
                    </div>
                    <div className="footer">Footer</div>
                </div>
            </Hammer>
        )
    }
}

export default Game