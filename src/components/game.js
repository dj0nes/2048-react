import React from 'react'
import Board from './board'

class Game extends React.Component {
    constructor(props) {
        super(props)
        let board_size = props.board_size || 4
        this.state = {
            board_size: board_size,
            history: [{
                tiles: this.createBoard(board_size)
            }],
        }
    }

    createBoard(board_size) {
        let arraySize = Math.pow(board_size, 2)
        let arr = []
        for(let i = 0; i < arraySize; i++) {
            arr.push({
                id: i,
                value: 0,
                x: i % board_size,
                y: Math.floor(i / board_size)
            })
        }
        return arr
    }

    handleClick(i) {
        console.dir(i)
        let current = this.state.history[this.state.history.length - 1]
        let new_tiles = this.shuffle(current.tiles)
        this.state.history.push({tiles: new_tiles})
        this.setState({
            board_size: this.state.board_size,
            history: this.state.history
        })
    }

    shuffle(tiles) {
        let tiles_to_shuffle = tiles.map(obj => Object.assign({}, obj))
        let used_indices = new Set()
        let all_indices = new Set()
        for(let i = 0; i < this.state.board_size; i++) {
            for(let j = 0; j < this.state.board_size; j++) {
                all_indices.add({x: i, y: j})
            }
        }

        let shuffled_tiles = tiles_to_shuffle.map(tile => {
            let unused_indices = [...all_indices].filter(x => !used_indices.has(x)) // all - used = unused
            let random_index = Math.floor(Math.random() * unused_indices.length)
            let index = unused_indices[random_index]
            used_indices.add(index)
            tile.x = index.x
            tile.y = index.y
            return tile
        })


        return shuffled_tiles
    }


    render() {
        const history = this.state.history
        const current = history[history.length - 1]
        setTimeout(() => this.handleClick('blah'), 800)

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