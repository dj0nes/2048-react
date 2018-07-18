import React from 'react'

function Tile3D(props) {
    let remove = props.remove !== undefined ? 'remove' : ''
    let display_value = props.merged_to ? props.merged_to : props.value

    function base3Dtile(value) {
        return (
            <div className={`tile tile-${value} tile3D`}>
                {/*Front*/}
                <div className={'tile-inner'}>{value}</div>
                {/*Back*/}
                <div className={'tile-inner'}>{value}</div>
                {/*Left*/}
                <div className={'tile-inner'}>{value}</div>
                {/*Right*/}
                <div className={'tile-inner'}>{value}</div>
                {/*Top*/}
                <div className={'tile-inner'}>{value}</div>
                {/*Bottom*/}
                <div className={'tile-inner'}>{value}</div>
            </div>
        )
    }

    let new_tile = ''
    if(props.new_tile) {
        new_tile = 'new_tile'
    }

    let depth_class = `row-${props.coordinates.y}-col-${props.coordinates.x}-depth-${props.coordinates.z}`
    let content = [
        base3Dtile(display_value)
    ]

    if(props.merged_to) {
        content.push(
            <div className="tile-inner tile-merged" key={1}>
                <span>{props.merged_to}</span>
            </div>
        )
    }

    let tile3D_wrapper_style = {
        // position: 'absolute',
        // width: '100px',
        // height: '100px',
        // perspective: '700px',
        // margin:'100 px auto'
    }

    return (
        <div className={`tile3D-wrapper ${depth_class}`}
             style={tile3D_wrapper_style}
        >
            {content}
        </div>
    )
}

export default Tile3D