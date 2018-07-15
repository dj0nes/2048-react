import React from 'react'
import posed from 'react-pose'

function Tile(props) {

    let remove = props.remove !== undefined ? 'remove' : ''
    let display_value = props.merged_to ? props.merged_to : props.value

    let PosedTile = posed.div({
        // enter: { opacity: 1 },
        // exit: { opacity: 0 }
    })

    return (
        <div className={`
            tile
            tile-${display_value}
            row-${props.coordinates.y}-col-${props.coordinates.x}
            ${remove}
            `}
            onClick={() => props.handleClick(props)}
        >
            <div className="tile-inner">
                <span>{display_value}</span>
            </div>
        </div>
    )
}

export default Tile