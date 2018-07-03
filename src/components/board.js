import React from 'react'
import Tile from './tile'

function Board(props) {
    let tiles = props.tiles
    let board_size = props.board_size
    let tilesList = tiles.map((tile, i) => <Tile value={tile} key={i} position={i} board_size={board_size} />)
    return <dl>{tilesList}</dl>
}

export default Board