import React from 'react'
import {getFontSizeClass} from '../board_util'
import PropTypes from 'prop-types'

function Tile3D(props) {
    let remove = props.remove !== undefined ? 'remove' : ''
    let swept = props.swept !== undefined ? 'swept' : ''
    if(swept === 'swept') {
        // deals with the idiosyncrasy of two CSS classes applying transforms, by applying only one of the classes
        // does not change underlying representation in board_map, will still be removed
        remove = ''
    }
    let display_value = props.merged_to ? props.merged_to : props.value

    let new_tile = props.new_tile ? 'new_tile' : ''
    let tile_merged = props.merged_to ? 'tile_merged' : ''
    let depth_class = `col-${props.coordinates.x}-row-${props.coordinates.y}-depth-${props.coordinates.z}`

    // apply an additional css class with the same animation, but only on merged with an odd value index
    let tile_merged_again = ''
    if(tile_merged) {
        // important - only do this work if the tile was previously merged, otherwise the search is a waste
        let sorted_tokens = Object.keys(props.tokens).map(item => parseInt(item, 10))
        let found_index = sorted_tokens.findIndex(item => item === display_value)

        if(found_index % 2 === 1) {
            // resolves issue when the pop animation remains on an element, instead of replaying
            tile_merged_again = 'tile_merged_again'  // the css class
        }
    }

    return (
        <div className={`tile3D-wrapper ${depth_class}`}>
            <div key={`${props.coordinates.x}${props.coordinates.y}${props.coordinates.z}`}
                className={`tile tile3D tile-${display_value} ${getFontSizeClass(display_value)} ${remove} ${swept}` +
                 `${new_tile} ${tile_merged} ${tile_merged_again}`}
            >
                {/*Front*/}
                <div className={'tile-inner'}><span>{display_value}</span></div>
                {/*Back*/}
                <div className={'tile-inner'}><span>{display_value}</span></div>
                {/*Left*/}
                <div className={'tile-inner'}><span>{display_value}</span></div>
                {/*Right*/}
                <div className={'tile-inner'}><span>{display_value}</span></div>
                {/*Top*/}
                <div className={'tile-inner'}><span>{display_value}</span></div>
                {/*Bottom*/}
                <div className={'tile-inner'}><span>{display_value}</span></div>
            </div>
        </div>
    )
}

Tile3D.propTypes = {
    swept: PropTypes.bool,
    remove: PropTypes.bool,
    merged_to: PropTypes.number,
    new_tile: PropTypes.bool,
    value: PropTypes.number.isRequired,
    coordinates: PropTypes.object.isRequired,
    tokens: PropTypes.object
}

export default Tile3D