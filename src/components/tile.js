import React from 'react'

function Tile(props) {
    let remove = props.remove !== undefined ? 'remove' : ''
    let display_value = props.merged_to ? props.merged_to : props.value

    let new_tile = ''
    if(props.new_tile) {
        new_tile = 'new_tile'
    }
    let content = [

    ]

    if(props.merged_to) {
        content.push(
            <div className="tile-inner tile-merged" key={1}>
                <span>{props.merged_to}</span>
            </div>
        )

    }
    else {
        content.push(
            <div className={`tile-inner ${new_tile}`} key={0}>
                <span>{props.value}</span>
            </div>
        )
    }

    return (
        <div
            onClick={() => props.handleClick(props)}
            className={`
                tile
                tile-${display_value}
                row-${props.coordinates.y}-col-${props.coordinates.x}
                ${remove}
            `}

        >
            {content}
        </div>
    )
}

export default Tile