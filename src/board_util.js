import BoardMap from './board_map'

let global_id = 0

export function range(start = 0, stop, step = 1) {
    if(stop === undefined) {
        // then this was passed only one parameter, which should be interpreted as the stop value
        stop = start
        start = 0
    }

    let result = []
    let i = start
    while(i < stop) {
        result.push(i)
        i += step
    }

    return result
}

export function generate2048Tokens() {
    let tokens = {}
    let range = this.range(1, 12)
    for(let exponent of range) {
        let value = Math.pow(2, exponent)
        let next_value = Math.pow(2, exponent + 1)
        tokens[value] = {
            transition_to: next_value,
            points:next_value
        }
    }

    return tokens
}

export function getFontSizeClass(value) {
    let zeroes = Math.floor(Math.log10(value))
    let result = Math.pow(10, zeroes)
    return `tile-${result}`
}

export function idSort(tiles) {
    return tiles.sort((t1, t2) => {
        if(t1.id < t2.id) return -1
        if(t1.id > t2.id) return 1
        return 0
    })
}

export function createTile({id, value, ...rest}) {
    if (id === undefined) id = global_id++
    return Object.assign({id, value}, rest)
}

export function* getSequence(board, board_dimensions, direction, location) {
    let [iteration_dimension, iteration_direction] = Object.entries(direction)
        .filter(([/* dim */, dir]) => dir !== 0)
        .pop()

    let index = 0
    if (iteration_direction < 0) {
        index = board_dimensions[iteration_dimension] - 1
    }

    while (index < board_dimensions[iteration_dimension] && index >= 0) {
        let location_copy = Object.assign({}, location)
        let coordinate = Object.assign(location_copy, {[iteration_dimension]: index})
        yield({coordinates: coordinate, tiles: board.get(coordinate)})
        index += iteration_direction
    }
}

export function getAllCoordinates(board_dimensions) {
    let all_locations = []
    for (const [dimension, length] of Object.entries(board_dimensions)) {
        let dimension_locations = []
        for (let i of [...Array(length).keys()]) {
            let dim_obj = {}
            dim_obj[dimension] = i
            dimension_locations.push(dim_obj)
        }
        all_locations.push(dimension_locations)
    }

    let all_locations_copy = JSON.parse(JSON.stringify(all_locations))

    function helper(remaining_dimensions, pairs) {
        if (remaining_dimensions.length === 0) {
            return pairs
        }

        let dimension = remaining_dimensions.pop()

        if (pairs.length === 0) {
            return helper(remaining_dimensions, dimension)
        }

        let extended_pairs = []
        for (let location of dimension) {
            for (let pair of pairs) {
                let location_copy = {...location}
                let extended_pair = Object.assign(location_copy, pair)
                extended_pairs.push(extended_pair)
            }
        }

        return helper(remaining_dimensions, extended_pairs)
    }

    let all_coordinates = helper(all_locations_copy, [])
    return {all_locations, all_coordinates}
}

export function mergeTiles(mergee, merger, tokens) {
    // mergee gets transitioned, merger marked for removal and moves to mergee's position
    let new_mergee = {...mergee}
    let new_merger = {...merger}

    new_mergee.merged_from = merger.value
    let {transitioned_token, transitioned_points} = this.transitionToken(tokens, new_mergee.value)
    new_mergee.merged_to = transitioned_token
    new_merger.remove = true
    return {new_mergee, new_merger, transitioned_points}
}

export function mergeSequence(sequence, tokens) {
    let merged_sequence = []
    let points = 0
    let all_coordinates = sequence.map(({coordinates}) => coordinates)
    let nonzero_locations = sequence.filter(({tiles}) => tiles.length > 0)
    let results = []

    while(nonzero_locations.length > 0) {
        let kv_pair = nonzero_locations.shift()
        let next_kv_pair = nonzero_locations[0]
        let tile = kv_pair.tiles[0]

        if(next_kv_pair === undefined) {  // end of array
            results.push([tile])
        }
        else {
            let next_tile = next_kv_pair.tiles[0]

            if(tile.value === next_tile.value) {
                let {new_mergee, new_merger, transitioned_points} = this.mergeTiles(tile, next_tile, tokens)
                points += transitioned_points
                nonzero_locations.shift()  // consume second tile
                results.push(this.idSort([new_mergee, new_merger]))
            }
            else {
                results.push([tile])
            }
        }
    }

    for(let i = 0; i < all_coordinates.length; i++) {
        let new_tiles = results[i] ? results[i] : []
        merged_sequence.push({coordinates: all_coordinates[i], tiles: new_tiles})
    }

    return {merged_sequence, points}
}

export function transitionToken(tokens, token) {
    // tokens structure is like:
    /*
    {
       2: {
            transition_to: 4,
            points: 4
        }
    }
     */
    if (tokens.hasOwnProperty(token) && tokens[token].hasOwnProperty('transition_to')) {
        return {
            transitioned_token: tokens[token].transition_to,
            transitioned_points: tokens[token].points}
    }
    else {
        // console.error('invalid token: ' + token)
        return {}
    }
}

export function tileCleanup(tile) {
    if (tile.remove) {
        return undefined
    }

    if(tile.merged_to) {
        tile.value = tile.merged_to
        delete tile.merged_to
        delete tile.merged_from
    }

    if(tile.new_tile) {
        delete tile.new_tile
    }

    return tile
}

export function sequenceCleanup(sequence) {
    let cleaned_sequence = []
    for(let i = 0; i < sequence.length; i++) {
        let {coordinates, tiles} = sequence[i]
        if (tiles === undefined) {
            tiles = []
        }

        tiles = tiles.filter(tile => !tile.remove)
        let cleaned_tiles = []
        for(let i = 0; i < tiles.length; i++) {
            let tile = this.tileCleanup(tiles[i])
            if(tile !== undefined) {
                cleaned_tiles.push(tile)
            }
        }

        cleaned_sequence.push({coordinates: coordinates, tiles: cleaned_tiles})
    }

    return cleaned_sequence
}

export function mergeLocation(board, board_dimensions, direction, location, tokens) {
    let getSequence = this.getSequence(board, board_dimensions, direction, location)
    let sequence = []
    let done = false
    while (!done) {
        let iteration = getSequence.next()
        if (iteration.value) {
            sequence.push(iteration.value)
        }
        done = iteration.done
    }

    sequence = this.sequenceCleanup(sequence)
    return this.mergeSequence(sequence, tokens)
}

// export function getMoveDimensionDirection(direction) {
//     let [move_dimension, move_direction] = Object.entries(direction)
//         .filter(([/* dim */, dir]) => dir !== 0)
//         .pop()
//     return {move_dimension, move_direction}
// }

export function getMoveSequences(board_dimensions, direction) {
    // in an n-dimensional space, returns all n-1 dimensional sequence coordinates for merge
    // ie for 3D board {x:3, y:3, z:3} with direction {x:0, y:1, z:0}, this returns
    // [{x:0, z:0}, {x:0, z:1}, {x:0, z:2}, {x:0, z:3}, {x:1, z:0},  ... {x:3, z:3}]
    let coordinate_dimensions = {}
    for (let dimension in direction) {
        if(direction.hasOwnProperty(dimension)) {
            let direction_value = direction[dimension]
            if (direction_value === 0) {
                coordinate_dimensions[dimension] = board_dimensions[dimension]
            }
        }
    }

    let {all_coordinates} = this.getAllCoordinates(coordinate_dimensions)
    return all_coordinates
}

export function mergeBoard(board, board_dimensions, direction, tokens) {
    let move_sequences = this.getMoveSequences(board_dimensions, direction)
    let merged_kv_pairs = []
    let new_points = 0
    for (let location of move_sequences) {
        let {merged_sequence, points} = this.mergeLocation(board, board_dimensions, direction, location, tokens)
        merged_kv_pairs = merged_kv_pairs.concat(merged_sequence)
        new_points += points
    }

    let merged_board = new BoardMap(merged_kv_pairs)

    return {merged_board, new_points}
}

export function randomTileInsert(board, board_dimensions, tokens, max_tiles_to_insert) {
    // inserts max(board_dimensions) - 1 tiles
    let {all_coordinates} = getAllCoordinates(board_dimensions)
    all_coordinates = all_coordinates.map(obj => board.stringify(obj))

    let tiles_to_insert = max_tiles_to_insert || Math.max(2, Object.keys(board_dimensions).length) - 1
    let i = 0
    while(i < tiles_to_insert) {
        let occupied_coordinates = board.getSortedKeys()
        let available_coordinates = all_coordinates.filter(coord => !occupied_coordinates.includes(coord))
        if(available_coordinates.length === 0) {
            // game over bub!
            return false
        }
        let rand1 = Math.random()
        let random_index = Math.floor(rand1 * available_coordinates.length)
        let random_coordinate = available_coordinates[random_index]
        let random_value = Math.random() < .9 ? 2 : 4
        board.set(random_coordinate, createTile({value: random_value, new_tile: true}))
        i++
    }

    return true

}

export function shuffle(board, board_dimensions) {
    let {all_coordinates} = getAllCoordinates(board_dimensions)
    let remaining_coordinates = all_coordinates.map(obj => board.stringify(obj))
    let occupied_coordinates = board.getSortedKeys()

    let kv_pairs = []

    for(let coordinates of occupied_coordinates) {
        let tiles = board.get(coordinates)

        let rand1 = Math.random()
        let random_index = Math.floor(rand1 * remaining_coordinates.length)
        let random_coordinate = remaining_coordinates[random_index]
        kv_pairs.push({coordinates: random_coordinate, tiles: tiles})

        // remove the coordinate we just used
        remaining_coordinates = remaining_coordinates.filter((coord, index) => index !== random_index)
    }

    return new BoardMap(kv_pairs)
}

// export function shuffle(tiles) {
//     let tiles_to_shuffle = tiles.map(obj => Object.assign({}, obj))
//     let used_indices = new Set()
//     let all_indices = new Set()
//     let board_size = Math.sqrt(tiles.length)
//     for(let i = 0; i < board_size; i++) {
//         for(let j = 0; j < board_size; j++) {
//             all_indices.add({x: i, y: j})
//         }
//     }
//
//     return tiles_to_shuffle.map(tile => {
//         let unused_indices = [...all_indices].filter(x => !used_indices.has(x)) // all - used = unused
//         let random_index = Math.floor(Math.random() * unused_indices.length)
//         let index = unused_indices[random_index]
//         used_indices.add(index)
//         tile.x = index.x
//         tile.y = index.y
//         return tile
//     })
// }
