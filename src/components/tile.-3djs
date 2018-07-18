import React from 'react'

function Tile(props) {
    let remove = props.remove !== undefined ? 'remove' : ''
    let display_value = props.merged_to ? props.merged_to : props.value

    let new_tile = ''
    if(props.new_tile) {
        new_tile = 'new_tile'
    }
    let content = [
        <div className={`tile-inner ${new_tile}`} key={0}>
            <span>{props.value}</span>
        </div>
    ]

    if(props.merged_to) {
        content.push(
            <div className="tile-inner tile-merged" key={1}>
                <span>{props.merged_to}</span>
            </div>
        )

    }

    return (
        <div className={`
            tile
            tile-${display_value}
            row-${props.coordinates.y}-col-${props.coordinates.x}
            ${remove}
            `}
            onClick={() => props.handleClick(props)}
        >
            {content}
        </div>
    )
}

export default Tile