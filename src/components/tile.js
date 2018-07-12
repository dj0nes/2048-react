import React from 'react'
import posed from 'react-pose'

function Tile(props) {

    let remove = props.remove !== undefined ? 'remove' : ''
    let display_value = props.merged_to ? props.merged_to : props.value

    let PosedTile = posed.div({
        enter: { opacity: 1 },
        exit: { opacity: 0 }
    })

    return (
        <PosedTile className={`tile
        row-${props.coordinates.y}
        col-${props.coordinates.x}
        ${remove}`}
        onClick={() => props.handleClick(props)}
        >
            <span>{display_value}</span>
        </PosedTile>
    )
}

export default Tile