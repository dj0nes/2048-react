import React from 'react'
import Tile3D from './tile-3d'
import PropTypes from 'prop-types'

function Board3D(props) {
    // dynamic css classes based on number of tiles
    let style = {
        // height: '20em',
        // fontSize: '10px'
    }
    let box_size = 8
    let gutter = box_size
    let tile3D_style = ''
    for(let x = 0; x < props.board_size; x++) {
        for (let y = 0; y < props.board_size; y++) {
            for (let z = 0; z < props.board_size; z++) {
                tile3D_style += `.col-${x}-row-${y}-depth-${z} {transform: translate3d(` +
                `${x * (box_size + gutter)}em,` +
                // (props.board_size + 1) * box_size allows us to have 0, 0, 0 at bottom left
                `${-y * (box_size + gutter) + (props.board_size + 1) * box_size}em,` +
                `${-z * (box_size + gutter)}em)}\n`
            }
        }
    }

    // cube face styles
    for(let i = 1; i <= 6; i++) {
        tile3D_style += ''
    }

    let board_cells = []
    for(let i = 0; i < Math.pow(props.board_size, 2); i++) {
        board_cells.push(<div className={'cell'} key={i}/>)
    }

    let board_map = props.board_map
    let placeholders = []

    // populate board with placeholder tiles
    for(let x = 0; x < props.board_size; x++) {
        for (let y = 0; y < props.board_size; y++) {
            for (let z = 0; z < props.board_size; z++) {
                placeholders.push(
                    (
                        <div key={`${x}${y}${z}-placeholder`} className={`tile3D-wrapper tile3D-placeholder col-${x}-row-${y}-depth-${z}`}>
                            <div className={'tile tile3D'}>
                                {/*Front*/}
                                <div className={'tile-inner tile-placeholder'}> </div>
                                {/*Back*/}
                                <div className={'tile-inner tile-placeholder'}> </div>
                                {/*Left*/}
                                <div className={'tile-inner tile-placeholder'}> </div>
                                {/*Right*/}
                                <div className={'tile-inner tile-placeholder'}> </div>
                                {/*Top*/}
                                <div className={'tile-inner tile-placeholder'}> </div>
                                {/*Bottom*/}
                                <div className={'tile-inner tile-placeholder'}> </div>
                            </div>
                        </div>
                    ))
            }
        }
    }


    let tilesList = []
    for(let coordinate_string of board_map.getSortedKeys()) {
        let tiles = board_map.get(coordinate_string)
        let coordinates = board_map.getCoordinatesFromKey(coordinate_string)
        // Declaring the per-tile creation function here is clearer than the alternative
        /*eslint no-loop-func: "off"*/
        tiles.map((tile) => tilesList.push(
            <Tile3D value={tile.value}
                key={tile.id}
                id={tile.id}
                coordinates={coordinates}
                remove={tile.remove}
                swept={tile.swept}
                merged_from={tile.merged_from}
                merged_to={tile.merged_to}
                new_tile={tile.new_tile}
                tokens={props.tokens}
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
        <div id={'board-3D-wrapper'}>
            <style>{tile3D_style}</style>
            <div className="board-3D" style={style}>
                <div className="placeholders3D">
                    {placeholders}
                </div>
                <div className="tiles3D">
                    {tilesList}
                </div>
            </div>
        </div>
    )
}

Board3D.propTypes = {
    board_map: PropTypes.object.isRequired,
    board_size: PropTypes.number.isRequired,
    tokens: PropTypes.object.isRequired
}

export default Board3D