import React from 'react'
import Tile from './tile'
import * as BoardUtil from '../board_util'
import posed, { PoseGroup } from 'react-pose'

function Board(props) {
    // dynamic css classes based on number of tiles
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

    let board_map = props.board_map
    let tilesList = []
    for(let coordinate_string of board_map.getSortedKeys()) {
        let tiles = board_map.get(coordinate_string)
        let coordinates = board_map.getCoordinatesFromKey(coordinate_string)
        let sorted_tiles = BoardUtil.idSort(tiles)
        sorted_tiles.map((tile) => tilesList.push(
            <Tile value={tile.value}
                key={tile.id}
                id={tile.id}
                coordinates={coordinates}
                remove={tile.remove}
                merged_from={tile.merged_from}
                merged_to={tile.merged_to}
                handleClick={(i) => props.handleClick(i)}
            />)
        )
    }

    return (
        <div id="board">
            <style>{style}</style>
            <div className={'grid-container'}>{board_cells}</div>
            {/*<PoseGroup animateOnMount={true} className={'tiles'}>*/}
                {tilesList}
            {/*</PoseGroup>*/}
        </div>
    )
}

export default Board