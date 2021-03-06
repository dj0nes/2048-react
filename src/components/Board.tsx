import React from 'react'
import Tile from './Tile'
import PropTypes from 'prop-types'

function Board(props: any) {
    // dynamic css classes based on number of tiles
    let style = ''
    let box_size = 4
    let gutter = box_size / 8
    let z_layer = props.z_layer

    for(let x = 0; x < props.boardDimensions.x; x++) {
        for (let y = 0; y < props.boardDimensions.y; y++) {
            style += `.row-${y}-col-${x}` +
                `{transform: translate(${x * (box_size + gutter)}em,` +
                //  + (props.boardDimensions.x - 1) * (box_size + gutter)} allows us to have 0, 0 at bottom left
                `${-y * (box_size + gutter) + (props.boardDimensions.x - 1) * (box_size + gutter)}em)}\n`
        }
    }

    let board_map = props.board_map
    let placeholders = []

    // populate board with placeholder tiles
    for(let x = 0; x < props.boardDimensions.x; x++) {
        for (let y = 0; y < props.boardDimensions.y; y++) {
            placeholders.push(
                (
                    <div x-type="placeholder" key={`${x}${y}-placeholder`} className={`
                        tile
                        tile-placeholder
                        row-${y}-col-${x}`}
                    ><div className="tile-inner"> </div></div>
                ))
        }
    }


    let tilesList: any[] = []
    for(let coordinate_string of board_map.getSortedKeys()) {
        let tiles = board_map.get(coordinate_string)
        let coordinates = board_map.getCoordinatesFromKey(coordinate_string)

        if(coordinates.hasOwnProperty('z') && coordinates.z !== z_layer) {
            continue
        }

        // Declaring the per-tile creation function here is clearer than the alternative
        /*eslint no-loop-func: "off"*/
        tiles.map((tile: any) => tilesList.push(
            <Tile value={tile.value}
                key={tile.id}
                id={tile.id}
                coordinates={coordinates}
                remove={tile.remove}
                swept={tile.swept}
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
            <div className="placeholders2D">
                {placeholders}
            </div>
            <div className="tiles2D">
                {tilesList}
            </div>
        </div>
    )
}

Board.propTypes = {
    board_map: PropTypes.object,
    boardDimensions: PropTypes.object.isRequired,
    z_layer: PropTypes.number.isRequired,
}

export default Board
