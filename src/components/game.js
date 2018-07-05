import React from 'react'
import Board from './board'
import util from './util'

const KEY = {
    LEFT:  37,
    RIGHT: 39,
    UP: 38,
    DOWN: 40,
    W: 87,
    S: 83,
    A: 65,
    D: 68,
    SPACE: 32
};

class Game extends React.Component {
    constructor(props) {
        super(props)

        this.board_size = props.board_size || 4
        this.tokens = [2, 4, 8, 16, 32, 64, 128, 256, 512, 1024, 2048]
        this.transitions = [4, 8, 16, 32, 64, 128, 256, 512, 1024, 2048]
        this.board_transitions = {
            up: {type: 'columns', reverse: false},
            down: {type: 'columns', reverse: true},
            left: {type: 'rows', reverse: false},
            right: {type: 'rows', reverse: true}
        }

        this.state = {
            board_size: this.board_size,
            score: 0,
            history: [{
                // tiles: util.createBoard(board_size, Array.from(Array(16).keys()))
                tiles: util.createBoard(this.board_size, [2,2,2,2,0,0,0,4])

            }]
        }
    }


    handleClickShuffle(i) {
        console.dir(i)
        let current = this.state.history[this.state.history.length - 1]
        let new_tiles = util.shuffle(current.tiles)
        this.state.history.push({tiles: new_tiles})
        this.setState({
            board_size: this.state.board_size,
            history: this.state.history
        })
    }

    handleClick(i) {
        console.dir(i)
        let current = this.state.history[this.state.history.length - 1]
        let transition = this.board_transitions.left
        let {new_tiles, new_points} = util.transitionBoard(this.tokens, this.transitions, current.tiles, transition, 700)
        this.state.history.push({tiles: new_tiles})
        this.setState({
            board_size: this.state.board_size,
            history: this.state.history,
            score: this.state.score + new_points
        })
    }

    handleKeys(value, e){
        let current = this.state.history[this.state.history.length - 1]
        let transition = ''
        if(e.keyCode === KEY.LEFT   || e.keyCode === KEY.A) transition = this.board_transitions.left;
        if(e.keyCode === KEY.RIGHT  || e.keyCode === KEY.D) transition = this.board_transitions.right;
        if(e.keyCode === KEY.UP     || e.keyCode === KEY.W) transition = this.board_transitions.up;
        if(e.keyCode === KEY.DOWN   || e.keyCode === KEY.S) transition = this.board_transitions.down;
        if(transition === '') return
        let {new_tiles, new_points} = util.transitionBoard(this.tokens, this.transitions, current.tiles, transition, 700)
        this.state.history.push({tiles: new_tiles})
        this.setState({
            board_size: this.state.board_size,
            history: this.state.history,
            score: this.state.score + new_points
        })
    }

    componentDidMount() {
        window.addEventListener('keyup',   this.handleKeys.bind(this, false));
        window.addEventListener('keydown', this.handleKeys.bind(this, true));
    }


    render() {
        const history = this.state.history
        const current = history[history.length - 1]
        // setTimeout(() => this.handleClick('blah'), 800)

        return (
            <div>
                <Board
                    tiles={current.tiles}
                    board_size={this.state.board_size}
                    handleClick={(i)=>this.handleClick(i)}
                />
            </div>
        );
    }
}

export default Game