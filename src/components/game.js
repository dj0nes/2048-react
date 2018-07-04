import React from 'react'
import Board from './board'
import util from './util'

class Game extends React.Component {
    constructor(props) {
        super(props)
        let board_size = props.board_size || 4
        this.state = {
            board_size: board_size,
            history: [{
                tiles: util.createBoard(board_size, Array.from(Array(16).keys()))
            }],
        }
    }


    handleClick(i) {
        console.dir(i)
        let current = this.state.history[this.state.history.length - 1]
        let new_tiles = util.shuffle(current.tiles)
        this.state.history.push({tiles: new_tiles})
        this.setState({
            board_size: this.state.board_size,
            history: this.state.history
        })
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