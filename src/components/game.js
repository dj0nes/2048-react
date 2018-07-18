import React from 'react'
import * as BoardUtil from '../board_util'
import BoardMap from '../board_map'
import Board from './board'
import Board3D from './board-3d'
import {randomTileInsert} from "../board_util";

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
};

class Game extends React.Component {
    constructor(props) {
        super(props)

        this.board_size = props.board_size || 4
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

        let board = new BoardMap()
        // start with two random tiles
        BoardUtil.randomTileInsert(board, this.board_dimensions, this.tokens)
        BoardUtil.randomTileInsert(board, this.board_dimensions, this.tokens)



        // let tile0_coordinates = {x: 0, y: 0, z: 0}
        // let tile1_coordinates = {x: 0, y: 0, z: 1}
        // let tile2_coordinates = {x: 0, y: 0, z: 2}
        // let tile3_coordinates = {x: 1, y: 0, z: 0}
        // let tile4_coordinates = {x: 2, y: 0, z: 1}
        // let tile5_coordinates = {x: 3, y: 0, z: 2}
        // let tile6_coordinates = {x: 0, y: 0, z: 0}
        // let tile7_coordinates = {x: 0, y: 1, z: 1}
        // let tile8_coordinates = {x: 0, y: 2, z: 2}
        // let tile0 = BoardUtil.createTile({value: 2, id: 0})
        // let tile1 = BoardUtil.createTile({value: 2, id: 1})
        // let tile2 = BoardUtil.createTile({value: 8, id: 2})
        // let kv_pairs = [
        //     [tile0_coordinates, tile0],
        //     [tile1_coordinates, tile1],
        //     [tile2_coordinates, tile2],
        //     [tile3_coordinates, tile1],
        //     [tile4_coordinates, tile2],
        //     [tile5_coordinates, tile1],
        //     [tile6_coordinates, tile2],
        //     [tile7_coordinates, tile1],
        //     [tile8_coordinates, tile2]
        // ]
        // let board_dimensions = {x: this.board_size, y: this.board_size, z: this.board_size}
        // let board = new BoardMap(kv_pairs)


        this.state = {
            score: 0,
            history: [board]
        }
    }

    handleClick(i) {
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
        if(event.keyCode === KEY.SPACE) return this.handleClick()
        if(event.keyCode === KEY.LEFT   || event.keyCode === KEY.A) direction = this.board_transitions.left;
        if(event.keyCode === KEY.RIGHT  || event.keyCode === KEY.D) direction = this.board_transitions.right;
        if(event.keyCode === KEY.UP     || event.keyCode === KEY.W) direction = this.board_transitions.up;
        if(event.keyCode === KEY.DOWN   || event.keyCode === KEY.S) direction = this.board_transitions.down;
        if(event.keyCode === KEY.Q) direction = this.board_transitions.out;
        if(event.keyCode === KEY.E) direction = this.board_transitions.in;
        if(direction === '') return

        let {merged_board, new_points} = BoardUtil.mergeBoard(current, this.board_dimensions, direction, this.tokens)
        if(!current.equals(merged_board, ['id', 'value'], ['remove'])) {
            randomTileInsert(merged_board, this.board_dimensions, this.tokens)  // will insert max(board_dimensions) - 1 tiles

            this.setState({
                board_size: this.state.board_size,
                history: this.state.history.concat(merged_board),
                score: this.state.score + new_points
            })
        }
    }

    componentDidMount() {
        window.addEventListener('keyup',   () => {});
        window.addEventListener('keydown', this.handleKeys.bind(this, true));
    }


    render() {
        const history = this.state.history
        const current_board_map = history[history.length - 1]
        // setTimeout(() => this.handleClick('blah'), 800)

        return (
            <div>
                <h2>Score: {this.state.score}</h2>
                <Board3D
                    board_map={current_board_map}
                    board_size={this.board_size}
                    handleClick={(i)=>this.handleClick(i)}
                />
                <br/>
                <br/>
                <br/>
                <Board
                    board_map={current_board_map}
                    board_size={this.board_size}
                    handleClick={(i)=>this.handleClick(i)}
                />
            </div>
        );
    }
}

export default Game