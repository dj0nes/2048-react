import React from 'react'
import {getFontSizeClass} from '../board_util'
import PropTypes from 'prop-types'

function Tile(props: any) {
    let remove = props.remove !== undefined ? 'remove' : ''
    let swept = props.swept !== undefined ? 'swept' : ''
    let display_value = props.merged_to ? props.merged_to : props.value

    let new_tile = ''
    if(props.new_tile) {
        new_tile = 'new_tile'
    }

    let content: JSX.Element = <></>
    if(props.merged_to) {
        content =
            <div className={'tile-inner tile-merged'} key={1}>
                <span>{props.merged_to}</span>
            </div>
    }
    else {
        content =
            <div className={`tile-inner ${new_tile}`} key={0}>
                <span>{props.value}</span>
            </div>
    }

    return (
        <div
            onClick={() => props.handleClick(props)}
            className={`tile tile-${display_value} ${getFontSizeClass(display_value)} ` +
                `row-${props.coordinates.y}-col-${props.coordinates.x} ${remove} ${swept}`}
        >
            {content}
        </div>
    )
}

Tile.propTypes = {
    id: PropTypes.number,
    swept: PropTypes.bool,
    remove: PropTypes.bool,
    merged_to: PropTypes.number,
    merged_from: PropTypes.number,
    new_tile: PropTypes.bool,
    handleClick: PropTypes.func,
    value: PropTypes.number.isRequired,
    coordinates: PropTypes.object.isRequired,
    tokens: PropTypes.object
}

export default Tile
