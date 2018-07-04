function createTile(id, value, x, y) {
    return {id, value, x, y}
}


function createBoard(board_size, values) {
    let arraySize = Math.pow(board_size, 2)
    let arr = []
    let vals = values || []
    for(let i = 0; i < arraySize; i++) {
        arr.push(createTile(i, vals[i] || 0, i % board_size, Math.floor(i / board_size)))
    }
    return arr
}


function shuffle(tiles) {
    let tiles_to_shuffle = tiles.map(obj => Object.assign({}, obj))
    let used_indices = new Set()
    let all_indices = new Set()
    let board_size = Math.sqrt(tiles.length)
    for(let i = 0; i < board_size; i++) {
        for(let j = 0; j < board_size; j++) {
            all_indices.add({x: i, y: j})
        }
    }

    return tiles_to_shuffle.map(tile => {
        let unused_indices = [...all_indices].filter(x => !used_indices.has(x)) // all - used = unused
        let random_index = Math.floor(Math.random() * unused_indices.length)
        let index = unused_indices[random_index]
        used_indices.add(index)
        tile.x = index.x
        tile.y = index.y
        return tile
    })
}


function getColumn(board, index) {
    let col = []
    board.map(tile => tile.x === index ? col.push(tile) : true)
    return col
}


function getRow(board, index) {
    let row = []
    board.map(tile => tile.y === index ? row.push(tile) : true)
    return row
}


function transition(tokens, transitions, tile) {
    let index = tokens.indexOf(tile.value)
    let new_tile = Object.assign({}, tile)
    if(index >= 0) {
        new_tile.value = transitions[index]
        return new_tile
    }
    else {
        console.error('invalid token: ' + new_tile.value)
        return new_tile
    }
}


function transitionArray(tokens, transitions, tiles, axis, animation_duration) {
    let points = 0
    let transitioned = []

    let valued_tiles = []
    let zeroed_tiles = []
    tiles.map(tile => {
        if (tile.value !== 0) {
            valued_tiles.push(Object.assign({}, tile))
        }
        else {
            zeroed_tiles.push(Object.assign({}, tile))
        }
    })

    // merge valued_tiles if matching
    for(let i = 0; i < valued_tiles.length; i++) {
        if(i + 1 < valued_tiles.length) {
            let current = valued_tiles[i]
            let next = valued_tiles[i+1]
            if(current.value === next.value) {
                next.x = current.x
                next.y = current.y
                points += current.value
                next = transition(tokens, transitions, next)

                transitioned.push(current, next)
                i++;  // skip next because we just handled it
            }
            else {
                transitioned.push(current)
            }
        }
        else {
            transitioned.push(valued_tiles[i])
        }

    }

    transitioned = transitioned.concat(zeroed_tiles)

    // now set the coordinates
    transitioned = transitioned.map((tile, index) => {
        tile[axis] = index
        return tile
    })


    return {transitioned, points}
}


export default {
    createTile,
    createBoard,
    shuffle,
    getColumn,
    getRow,
    transition,
    transitionArray
}
