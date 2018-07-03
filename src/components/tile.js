import React from 'react'
function Tile(props) {
    return (
        <div className={`tile
        row-${props.y}
        col-${props.x}`}
        onClick={() => props.handleClick(props)}
        >
            <span>{props.id}</span>
        </div>
    )
}

export default Tile