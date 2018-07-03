import React from 'react'
function Tile(props) {
    return (
        <div className={`tile row-${Math.floor(props.position / props.board_size)} col-${props.position % props.board_size}`}>
            <span>{props.value}</span>
        </div>
    )
}

export default Tile