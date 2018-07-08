import React from 'react'
import Tile from './tile'

let global_id = 0

class Board extends React.Component {
    constructor(props) {
        super(props)
        this.state = {
            board_dimensions: props.board_dimensions,  // {x, y, z}
            board: this.createBoard(props.kv_pairs)
        }
    }

    static createTile({id, value, ...rest}) {
        if(id === undefined) id = global_id++
        return Object.assign({id, value}, rest)
    }

    createBoard(kv_pairs = []) {
        let pairs = []

        kv_pairs.map(pair => {
            const [location, tile] = pair
            pairs.push([location, [tile]])
        })

        return new Map(kv_pairs)
    }

    getSequence(board, board_dimensions, direction) {

    }

    getAllCoordinates(dimensions) {
        let all_locations = []
        for (const [dimension, length] of Object.entries(dimensions)) {
            let dimension_locations = []
            for(let i of [...Array(length).keys()]) {
                let dim_obj = {}
                dim_obj[dimension] = i
                dimension_locations.push(dim_obj)
            }
            all_locations.push(dimension_locations)
        }

        let all_locations_copy = JSON.parse(JSON.stringify(all_locations))

        function helper(remaining_dimensions, pairs) {
            if(remaining_dimensions.length === 0) {
                return pairs
            }

            let dimension = remaining_dimensions.pop()

            if(pairs.length === 0) {
                return helper(remaining_dimensions, dimension)
            }

            let extended_pairs = []
            for(let location of dimension) {
                for(let pair of pairs) {
                    let location_copy = Object.assign({}, location)
                    let extended_pair = Object.assign(location_copy, pair)
                    extended_pairs.push(extended_pair)
                }
            }

            return helper(remaining_dimensions, extended_pairs)
        }

        let all_coordinates = helper(all_locations_copy, [])
        return {all_locations, all_coordinates}
    }

    render() {
        // let style = ''
        //
        // let box_size = 3.25
        // let gutter = box_size / 8
        //
        // for (let i = 0; i < this.props.board_size; i++) {
        //     style += `.row-${i} {top: ${i * (box_size + gutter)}em}`
        //     style += `.col-${i} {left: ${i * (box_size + gutter)}em}`
        // }
        //
        // let board_cells = []
        // for (let i = 0; i < Math.pow(this.props.board_size, 2); i++) {
        //     board_cells.push(<div className={'cell'} key={i}/>)
        // }
        //
        // let tiles = this.props.tiles
        // let board_size = this.props.board_size
        // let tilesList = tiles.map((tile) => <Tile value={tile.value}
        //                                           key={tile.id}
        //                                           id={tile.id}
        //                                           x={tile.x}
        //                                           y={tile.y}
        //                                           board_size={board_size}
        //                                           handleClick={(i) => this.props.handleClick(i)}
        // />)

        return (
            <div id="board">
                {/*<style>{style}</style>*/}
                {/*<div className={'grid-container'}>{board_cells}</div>*/}
                {/*<div className={'tiles'}>{tilesList}</div>*/}
            </div>
        )
    }
}

export default Board