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


function transitionArray(tokens, transitions, tiles) {
    let points = 0
    let transitioned = []

    let helper = (arr) => {
        if (arr.length === 1) {
            return arr
        }
        if (arr.length === 0) {
            return []
        }
        if (arr.every(el => el === 0)) {
            return arr
        }
    }

    helper(tiles)

    // perform zero padding if necessary
    if(transitioned.length < tiles.length) {
        while(transitioned.length < tiles.length) {
            transitioned.push(0)
        }
    }

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
