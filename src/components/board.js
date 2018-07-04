import React from 'react'
import Tile from './tile'

function Board(props) {
    let style = ''

    let box_size = 3.25
    let gutter = box_size / 8

    for(let i = 0; i < props.board_size; i++) {
        style += `.row-${i} {top: ${i * (box_size + gutter)}em}`
        style += `.col-${i} {left: ${i * (box_size + gutter)}em}`
    }

    let board_cells = []
    for(let i = 0; i < Math.pow(props.board_size, 2); i++) {
        board_cells.push(<div className={'cell'} key={i}/>)
    }

    let tiles = props.tiles
    let board_size = props.board_size
    let tilesList = tiles.map((tile) => <Tile value={tile.value}
                                                 key={tile.id}
                                                 id={tile.id}
                                                 x={tile.x}
                                                 y={tile.y}
                                                 board_size={board_size}
                                                 handleClick={(i) => props.handleClick(i)}
                                            />)
    return (
        <div id="board">
            <style>{style}</style>
            <div className={'grid-container'}>{board_cells}</div>
            <div className={'tiles'}>{tilesList}</div>
        </div>
    )
}

export default Board