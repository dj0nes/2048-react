import React from 'react'
import {getFontSizeClass} from '../board_util'

function Tile3D(props) {
    let remove = props.remove !== undefined ? 'remove' : ''
    let display_value = props.merged_to ? props.merged_to : props.value

    function base3Dtile(value, new_tile, tile_merged, tokens) {
        // resolves issue when the pop animation remains on an element, instead of replaying
        let sorted_tokens = Object.keys(tokens).map(item => parseInt(item, 10))
        let found_index = sorted_tokens.findIndex(item => item === value)
        let tile_merged_again = ''
        // apply an additional css class with the same animation, but only on merged with an odd value index
        if(tile_merged && found_index % 2 === 1) {
            tile_merged_again = 'tile_merged_again'  // the css class
        }

        return (
            <div key={`${props.coordinates.x}${props.coordinates.y}${props.coordinates.z}`}
                className={`tile tile3D tile-${value} ${getFontSizeClass(display_value)} ${remove} ${new_tile}` +
                    `${tile_merged} ${tile_merged_again}`}
            >
                {/*Front*/}
                <div className={'tile-inner'}><span>{value}</span></div>
                {/*Back*/}
                <div className={'tile-inner'}><span>{value}</span></div>
                {/*Left*/}
                <div className={'tile-inner'}><span>{value}</span></div>
                {/*Right*/}
                <div className={'tile-inner'}><span>{value}</span></div>
                {/*Top*/}
                <div className={'tile-inner'}><span>{value}</span></div>
                {/*Bottom*/}
                <div className={'tile-inner'}><span>{value}</span></div>
            </div>
        )
    }

    let new_tile = ''
    if(props.new_tile) {
        new_tile = 'new_tile'
    }
    let tile_merged = ''
    if(props.merged_to) {
        tile_merged = 'tile_merged'
    }

    let depth_class = `row-${props.coordinates.y}-col-${props.coordinates.x}-depth-${props.coordinates.z}`
    let content = [
        base3Dtile(display_value, new_tile, tile_merged, props.tokens)
    ]

    return (
        <div className={`tile3D-wrapper ${depth_class}`}>
            {content}
        </div>
    )
}

export default Tile3D