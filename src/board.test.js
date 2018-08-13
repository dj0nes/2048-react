import React from 'react'
import ReactDOM from 'react-dom'
import Board from './components/board'
import BoardMap from './board_map'
import * as BoardUtil from './board_util'

it('renders without crashing', () => {
    let tile0_coordinates = {x:0, y:0}
    let tile1_coordinates = {x:0, y:1}
    let tile0 = BoardUtil.createTile({value: 2, location: {x:0, y:0}, id: 0})
    let tile1 = BoardUtil.createTile({value: 2, location: {x:0, y:1}, id: 1})
    let kv_pairs = [
        {coordinates: tile0_coordinates, tiles: tile0},
        {coordinates: tile1_coordinates, tiles: tile1}
    ]
    let board_map = new BoardMap(kv_pairs)

    const div = document.createElement('div')
    ReactDOM.render(<Board board_map={board_map} z_layer={0} board_size={3} board_dimensions={{x:3, y:3, z:3}}/>, div)
    ReactDOM.unmountComponentAtNode(div)
})