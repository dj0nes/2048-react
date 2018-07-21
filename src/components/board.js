import React from 'react'
import Tile from './tile'

function Board(props) {
    // dynamic css classes based on number of tiles
    let style = ''
    let box_size = 4
    let gutter = box_size / 8
    let z_layer = props.z_layer

    for(let x = 0; x < props.board_size; x++) {
        for (let y = 0; y < props.board_size; y++) {
            style += `.row-${y}-col-${x} {transform: translate(${x * (box_size + gutter)}em, ${y * (box_size + gutter)}em)}\n`
        }
    }

    let board_cells = []
    for(let i = 0; i < Math.pow(props.board_size, 2); i++) {
        board_cells.push(<div className={'cell'} key={i}/>)
    }

    let board_map = props.board_map
    let tilesList = []
    for(let coordinate_string of board_map.getSortedKeys()) {
        let tiles = board_map.get(coordinate_string)
        let coordinates = board_map.getCoordinatesFromKey(coordinate_string)

        if(coordinates.z !== z_layer) {
            continue
        }

        // Declaring the per-tile creation function here is clearer than the alternative
        /*eslint no-loop-func: "off"*/
        tiles.map((tile) => tilesList.push(
            <Tile value={tile.value}
                key={tile.id}
                id={tile.id}
                coordinates={coordinates}
                remove={tile.remove}
                merged_from={tile.merged_from}
                merged_to={tile.merged_to}
                new_tile={tile.new_tile}
                handleClick={(i) => props.handleClick(i)}
            />)
        )
    }

    tilesList = tilesList.sort((t1, t2) => {
        if(t1.key < t2.key) return -1
        if(t1.key > t2.key) return 1
        return 0
    })

    return (
        <div className="board2D">
            <style>{style}</style>
            <div className={'grid-container'}>
                {board_cells}
                <div style={{position: 'absolute'}}>
                    {tilesList}
                </div>
            </div>
        </div>
    )
}

export default Board