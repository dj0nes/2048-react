import React from 'react'
import * as BoardUtil from '../board_util'
import Board_map from '../board_map'
import Board from './board'

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

        let tile0_coordinates = {x: 0, y: 0, z: 0}
        let tile1_coordinates = {x: 1, y: 0, z: 0}
        let tile2_coordinates = {x: 2, y: 0, z: 0}
        let tile0 = BoardUtil.createTile({value: 2, id: 0})
        let tile1 = BoardUtil.createTile({value: 2, id: 1})
        let tile2 = BoardUtil.createTile({value: 2, id: 2})
        let kv_pairs = [
            [tile0_coordinates, tile0],
            [tile1_coordinates, tile1],
            [tile2_coordinates, tile2]
        ]

        this.state = {
            board_size: this.board_size,
            score: 0,
            history: [new Board_map(kv_pairs)]
        }
    }


    handleClickShuffle(i) {
        console.dir(i)
        // let current = this.state.history[this.state.history.length - 1]
        // let new_tiles = util.shuffle(current.tiles)
        // this.state.history.push({tiles: new_tiles})
        // this.setState({
        //     board_size: this.state.board_size,
        //     history: this.state.history
        // })
    }

    handleClick(i) {
        // console.dir(i)
        // let current = this.state.history[this.state.history.length - 1]
        // let transition = this.board_transitions.left
        // let {new_tiles, new_points} = util.transitionBoard(this.tokens, this.transitions, current.tiles, transition, 700)
        // this.state.history.push({tiles: new_tiles})
        // this.setState({
        //     board_size: this.state.board_size,
        //     history: this.state.history,
        //     score: this.state.score + new_points
        // })
    }

    handleKeys(value, e){
        // let current = this.state.history[this.state.history.length - 1]
        // let transition = ''
        // if(e.keyCode === KEY.LEFT   || e.keyCode === KEY.A) transition = this.board_transitions.left;
        // if(e.keyCode === KEY.RIGHT  || e.keyCode === KEY.D) transition = this.board_transitions.right;
        // if(e.keyCode === KEY.UP     || e.keyCode === KEY.W) transition = this.board_transitions.up;
        // if(e.keyCode === KEY.DOWN   || e.keyCode === KEY.S) transition = this.board_transitions.down;
        // if(transition === '') return
        // let {new_tiles, new_points} = util.transitionBoard(this.tokens, this.transitions, current.tiles, transition, 700)
        //
        //
        // let next_board_map = current.board_map.mergeBoard(current, board_dimensions, direction, tokens, transitions)
        //
        //
        // this.state.history.push({board_map: next_board_map})
        // this.setState({
        //     board_size: this.state.board_size,
        //     history: this.state.history,
        //     score: this.state.score + new_points
        // })
    }

    componentDidMount() {
        window.addEventListener('keyup',   this.handleKeys.bind(this, false));
        window.addEventListener('keydown', this.handleKeys.bind(this, true));
    }


    render() {
        const history = this.state.history
        const current_board_map = history[history.length - 1]
        // setTimeout(() => this.handleClick('blah'), 800)

        return (
            <div>
                <Board
                    board_map={current_board_map}
                    board_size={this.state.board_size}
                    handleClick={(i)=>this.handleClick(i)}
                />
            </div>
        );
    }
}

export default Game