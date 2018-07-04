import React from 'react'
function Tile(props) {

    let zero = props.value === 0 ? 'zero' : ''

    return (
        <div className={`tile
        row-${props.y}
        col-${props.x}
        ${zero}`}
        onClick={() => props.handleClick(props)}
        >
            <span>{props.value}</span>
        </div>
    )
}

export default Tile