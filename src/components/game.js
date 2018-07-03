import React from 'react'
import Board from './board'

class Game extends React.Component {
    constructor(props) {
        super(props)
        this.state = {
            history: [{
                tiles: Array(16).fill(0)
            }],
            board_size: 4
        }
    }


    render() {
        const history = this.state.history
        const current = history[history.length - 1]

        return (
            <div>
                <Board
                    tiles={current.tiles}
                    board_size={this.state.board_size}
                />
            </div>
        );
    }
}

export default Game