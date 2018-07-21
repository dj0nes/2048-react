import React from 'react'

function Tile3D(props) {
    let remove = props.remove !== undefined ? 'remove' : ''
    let display_value = props.merged_to ? props.merged_to : props.value

    function base3Dtile(value, new_tile, tile_merged) {
        return (
            <div key={`${props.coordinates.x}${props.coordinates.y}${props.coordinates.z}`}
                 className={`tile tile3D tile-${value} ${remove} ${new_tile} ${tile_merged}`}>
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
    let tile_merged = ''
    if(props.merged_to) {
        tile_merged = 'tile_merged'
    }

    let depth_class = `row-${props.coordinates.y}-col-${props.coordinates.x}-depth-${props.coordinates.z}`
    let content = [
        base3Dtile(display_value, new_tile, tile_merged)
    ]


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