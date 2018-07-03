import React from 'react'
import Tile from './tile'

function Board(props) {
    let tiles = props.tiles
    let board_size = props.board_size
    let tilesList = tiles.map((tile, i) => <Tile value={tile.value}
                                                 key={tile.id}
                                                 id={tile.id}
                                                 x={tile.x}
                                                 y={tile.y}
                                                 board_size={board_size}
                                                 handleClick={(i) => props.handleClick(i)}
                                            />)
    return <dl>{tilesList}</dl>
}

export default Board