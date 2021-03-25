import React from 'react'
import {getFontSizeClass} from '../board_util'
import PropTypes from 'prop-types'

function Tile3D(props: any) {
    const tokens = props.tokens // to refactor later, maybe use context

    let remove = props.remove !== undefined ? 'remove' : ''
    let swept = props.swept !== undefined ? 'swept' : ''
    if(swept === 'swept') {
        // deals with the idiosyncrasy of two CSS classes applying transforms, by applying only one of the classes
        // does not change underlying representation in board_map, will still be removed
        remove = ''
    }
    const value = props.merged_to ? props.merged_to : props.value

    let displayValue = tokens[value].display

    let new_tile = props.new_tile ? 'new_tile' : ''
    let tile_merged = props.merged_to ? 'tile_merged' : ''
    let depth_class = `col-${props.coordinates.x}-row-${props.coordinates.y}-depth-${props.coordinates.z}`

    // apply an additional css class with the same animation, but only on merged with an odd value index
    let tile_merged_again = ''
    if(tile_merged) {
        // important - only do this work if the tile was previously merged, otherwise the search is a waste
        let sorted_tokens = Object.keys(props.tokens).map(item => parseInt(item, 10))
        let found_index = sorted_tokens.findIndex(item => item === displayValue)

        if(found_index % 2 === 1) {
            // resolves issue when the pop animation remains on an element, instead of replaying
            tile_merged_again = 'tile_merged_again'  // the css class
        }
    }

    const key = `${props.coordinates.x}${props.coordinates.y}${props.coordinates.z}`

    return (
        <div className={`tile3D-wrapper ${depth_class} tile-key-${key}`}>
            <div key={key}
                className={`tile tile3D tile-${value} ${getFontSizeClass(value)} ${remove} ${swept}` +
                 `${new_tile} ${tile_merged} ${tile_merged_again}`}
            >
                {/*Front*/}
                <div className={'tile-inner'}><span>{displayValue}</span></div>
                {/*Back*/}
                <div className={'tile-inner'}><span>{displayValue}</span></div>
                {/*Left*/}
                <div className={'tile-inner'}><span>{displayValue}</span></div>
                {/*Right*/}
                <div className={'tile-inner'}><span>{displayValue}</span></div>
                {/*Top*/}
                <div className={'tile-inner'}><span>{displayValue}</span></div>
                {/*Bottom*/}
                <div className={'tile-inner'}><span>{displayValue}</span></div>
            </div>
        </div>
    )
}

Tile3D.propTypes = {
    id: PropTypes.number,
    swept: PropTypes.bool,
    remove: PropTypes.bool,
    merged_to: PropTypes.number,
    merged_from: PropTypes.number,
    new_tile: PropTypes.bool,
    value: PropTypes.number.isRequired,
    coordinates: PropTypes.object.isRequired,
    tokens: PropTypes.object,
    handleClick: PropTypes.func
}

export default Tile3D
