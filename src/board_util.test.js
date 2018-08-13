import * as BoardUtil from './board_util'
import BoardMap from './board_map'
const tokens = BoardUtil.generate2048Tokens()


it('generates 2048 tokens', () => {
    let result = BoardUtil.generate2048Tokens()
    expect(result[1]).toEqual(undefined)
    expect(result[2]).toEqual({
        transition_to: 4,
        points: 4
    })
    expect(result[3]).toEqual(undefined)
    expect(result[4]).toEqual({
        transition_to: 8,
        points: 8
    })
    expect(result[1024]).toEqual({
        transition_to: 2048,
        points: 2048
    })
})
describe('getFontSizeClass', () => {
    it('returns a css class for values over 100', () => {
        let result = BoardUtil.getFontSizeClass(128)
        expect(result).toEqual('tile-100')
    })

    it('returns a css class for values over 1000', () => {
        let result = BoardUtil.getFontSizeClass(1024)
        expect(result).toEqual('tile-1000')
    })

    it('returns a css class for values over 10000', () => {
        let result = BoardUtil.getFontSizeClass(65536)
        expect(result).toEqual('tile-10000')
    })

    it('returns a css class for values over 100000', () => {
        let result = BoardUtil.getFontSizeClass(131072)
        expect(result).toEqual('tile-100000')
    })
})

describe('range function', () => {
    it('generates values given a stop value only', () => {
        let result = BoardUtil.range(3)
        expect(result).toEqual([0, 1, 2])
    })

    it('generates values given a start and stop value', () => {
        let result = BoardUtil.range(0, 3)
        expect(result).toEqual([0, 1, 2])
        result = BoardUtil.range(2, 3)
        expect(result).toEqual([2])
    })

    it('generates values given start, stop, and step values', () => {
        let result = BoardUtil.range(0, 3, 1)
        expect(result).toEqual([0, 1, 2])
        result = BoardUtil.range(0, 4, 2)
        expect(result).toEqual([0, 2])
        result = BoardUtil.range(0, 5, 2)
        expect(result).toEqual([0, 2, 4])
    })
})

it('creates tiles with generated ids and optional values', () => {
    let tile0 = BoardUtil.createTile({value: 0, location: {x:0, y:0}})
    let tile1 = BoardUtil.createTile({value: 0, location: {x:0, y:1}, new_tile: true})
    let tile2 = BoardUtil.createTile({value: 0, location: {x:1, y:1}, id: 99})
    expect(tile0.id).toBe(0)
    expect(tile1.id).toBe(1)
    expect(tile2.id).toBe(99)
    expect(tile1.new_tile).toBe(true)
    expect(tile0.location).toEqual({x:0, y:0})
    expect(tile1.location).toEqual({x:0, y:1})
    expect(tile2.location).toEqual({x:1, y:1})
})

it('creates a board_map with preset values', () => {
    let tile0_coordinates = {x:0, y:0}
    let tile1_coordinates = {x:0, y:1}
    let tile0 = BoardUtil.createTile({value: 2, location: {x:0, y:0}, id: 0})
    let tile1 = BoardUtil.createTile({value: 2, location: {x:0, y:1}, id: 1})
    let kv_pairs = [
        {coordinates: tile0_coordinates, tiles: [tile0]},
        {coordinates: tile1_coordinates, tiles: [tile1]}
    ]
    let board_map = new BoardMap(kv_pairs)
    expect(typeof board_map).toBe('object')
    expect(board_map instanceof BoardMap).toBe(true)
    expect(board_map.get(tile0_coordinates)).toEqual([tile0])
    expect(board_map.get(tile1_coordinates)).toEqual([tile1])
})

describe('tile and sequence cleaning', () => {
    it('cleans removable tokens and updates values from a single location', () => {
        let tile0_coordinates = {x: 0, y: 0}
        let tile1_coordinates = {x: 0, y: 1}
        let tile2_coordinates = {x: 0, y: 2}
        let tile0 = BoardUtil.createTile({value: 4, id: 0, merged_to: 4})
        let tile1 = BoardUtil.createTile({value: 2, id: 1, remove: true})
        let tile2 = BoardUtil.createTile({value: 16, id: 2, merged_to: 16, new_tile: true})
        let tile3 = BoardUtil.createTile({value: 8, id: 3, remove: true})
        let kv_pairs = [
            {coordinates: tile0_coordinates, tiles: [tile0]},
            {coordinates: tile1_coordinates, tiles: [tile1]},
            {coordinates: tile2_coordinates, tiles: [tile2, tile3]}
        ]

        let cleaned_sequence = kv_pairs.map(BoardUtil.locationCleanup.bind(BoardUtil))
        expect(cleaned_sequence).toEqual([
            {coordinates: tile0_coordinates, tiles: [{value: 4, id: 0}]},
            {coordinates: tile1_coordinates, tiles: []},
            {coordinates: tile2_coordinates, tiles: [{value: 16, id: 2}]}
        ])
    })

    it('cleans sequence of removable tokens and updates values', () => {
        let tile0_coordinates = {x: 0, y: 0}
        let tile1_coordinates = {x: 0, y: 1}
        let tile2_coordinates = {x: 0, y: 2}
        let tile3_coordinates = {x: 0, y: 3}
        let tile0 = BoardUtil.createTile({value: 4, id: 0, merged_to: 4})
        let tile1 = BoardUtil.createTile({value: 2, id: 1, remove: true})
        let tile2 = BoardUtil.createTile({value: 16, id: 2, merged_to: 16, new_tile: true})
        let tile3 = BoardUtil.createTile({value: 8, id: 3, remove: true})
        let kv_pairs = [
            {coordinates: tile0_coordinates, tiles: [tile0]},
            {coordinates: tile1_coordinates, tiles: [tile1]},
            {coordinates: tile2_coordinates, tiles: [tile2, tile3]}
        ]
        let board_map = new BoardMap(kv_pairs)
        let board_dimensions = {x: 4, y: 4}
        let direction = {x: 0, y: 1}
        let location = {x: 0}

        let getSequence = BoardUtil.getSequence(board_map, board_dimensions, direction, location)
        let sequence = []
        let done = false
        while (!done) {
            let iteration = getSequence.next()
            if (iteration.value) {
                sequence.push(iteration.value)
            }
            done = iteration.done
        }

        let cleaned_sequence = BoardUtil.sequenceCleanup(sequence)
        expect(cleaned_sequence).toEqual([
            {coordinates: tile0_coordinates, tiles: [{value: 4, id: 0}]},
            {coordinates: tile1_coordinates, tiles: []},
            {coordinates: tile2_coordinates, tiles: [{value: 16, id: 2}]},
            {coordinates: tile3_coordinates, tiles: []}
        ])
    })

    it('cleans an entire board of removable tokens and updates values', () => {
        let tile0_coordinates = {x: 0, y: 0}
        let tile1_coordinates = {x: 0, y: 1}
        let tile2_coordinates = {x: 0, y: 2}
        let tile3_coordinates = {x: 0, y: 3}
        let tile0 = BoardUtil.createTile({value: 4, id: 0, merged_to: 4})
        let tile1 = BoardUtil.createTile({value: 2, id: 1, remove: true})
        let tile2 = BoardUtil.createTile({value: 16, id: 2, merged_to: 16, new_tile: true})
        let tile3 = BoardUtil.createTile({value: 8, id: 3, remove: true})
        let kv_pairs = [
            {coordinates: tile0_coordinates, tiles: [tile0]},
            {coordinates: tile1_coordinates, tiles: [tile1]},
            {coordinates: tile2_coordinates, tiles: [tile2, tile3]}
        ]
        let board_map = new BoardMap(kv_pairs)
        let cleaned_board = BoardUtil.boardCleanup(board_map)
        let correctly_cleaned_board = new BoardMap([
            {coordinates: tile0_coordinates, tiles: [{value: 4, id: 0}]},
            {coordinates: tile1_coordinates, tiles: []},
            {coordinates: tile2_coordinates, tiles: [{value: 16, id: 2}]},
            {coordinates: tile3_coordinates, tiles: []}
        ])
        expect(cleaned_board.equals(correctly_cleaned_board)).toEqual(true)
    })

    it('cleans sequence of removable tokens', () => {
        let tile0_coordinates = {x: 0, y: 0}
        let tile1_coordinates = {x: 0, y: 1}
        let tile2_coordinates = {x: 0, y: 2}
        let tile3_coordinates = {x: 0, y: 3}
        let tile0_obj = {value: 16, id: 0, merged_to: 16}
        let tile1_obj = {value: 8, id: 1, remove: true}
        let tile0 = BoardUtil.createTile(tile0_obj)
        let tile1 = BoardUtil.createTile(tile1_obj)
        let kv_pairs = [
            {coordinates: tile0_coordinates, tiles: [tile0, tile1]}
        ]
        let board_map = new BoardMap(kv_pairs)
        let board_dimensions = {x: 4, y: 4}
        let direction = {x: 0, y: 1}
        let location = {x: 0}

        let getSequence = BoardUtil.getSequence(board_map, board_dimensions, direction, location)
        let sequence = []
        let done = false
        while (!done) {
            let iteration = getSequence.next()
            if (iteration.value) {
                sequence.push(iteration.value)
            }
            done = iteration.done
        }

        expect(sequence).toEqual([
            {coordinates: tile0_coordinates, tiles: [tile0, tile1]},
            {coordinates: tile1_coordinates, tiles: undefined},
            {coordinates: tile2_coordinates, tiles: undefined},
            {coordinates: tile3_coordinates, tiles: undefined}
        ])
        let cleaned_sequence = BoardUtil.sequenceCleanup(sequence)
        expect(cleaned_sequence).toEqual([
            {coordinates: tile0_coordinates, tiles: [{value: 16, id: 0}]},
            {coordinates: tile1_coordinates, tiles: []},
            {coordinates: tile2_coordinates, tiles: []},
            {coordinates: tile3_coordinates, tiles: []}
        ])
    })
})


it('returns all move sequences in 2D', () => {
    let direction = {x: 0, y: 1}
    let board_dimensions = {x: 4, y: 4}
    let move_sequences = BoardUtil.getMoveSequences(board_dimensions, direction)
    expect(move_sequences).toEqual([
        {'x': 0},
        {'x': 1},
        {'x': 2},
        {'x': 3},
    ])
})

it('returns all move sequences in 3D', () => {
    let direction = {x: 0, y: 1, z: 0}
    let dimension_size = 4
    let board_dimensions = {x: dimension_size, y: dimension_size, z:dimension_size}
    let move_sequences = BoardUtil.getMoveSequences(board_dimensions, direction)

    let move_sequences_answer = []  // [{x: 0, y: 0, z: 0, t:0}, {x: 0, y: 0, z: 0, t:1}, ...]
    for(let x of [...Array(dimension_size).keys()]) {
        for(let z of [...Array(dimension_size).keys()]) {
            move_sequences_answer.push({x, z})
        }
    }

    expect(move_sequences).toEqual(move_sequences_answer)
})

it('transitions tokens as expected', () => {
    let tile0 = BoardUtil.createTile({value: 2, id: 0})
    let {transitioned_token, transitioned_points} = BoardUtil.transitionToken(tokens, tile0.value)
    expect(transitioned_token).toEqual(4)
    expect(transitioned_points).toEqual(4)
})

describe('get all coordinates ', () => {
    it('for 1 dimension', () => {
        let {all_locations, all_coordinates} = BoardUtil.getAllCoordinates({x:3})
        expect(all_locations instanceof Array).toBe(true)
        expect(all_locations).toEqual([[{x:0}, {x:1}, {x:2}]])
        expect(all_coordinates).toEqual([{x:0}, {x:1}, {x:2}])
    })


    it('for 2 dimensions', () => {
        let {all_locations, all_coordinates} = BoardUtil.getAllCoordinates({x:3, z:3})
        expect(all_locations instanceof Array).toBe(true)
        expect(all_locations).toEqual([
            [{x:0}, {x:1}, {x:2}],
            [{z:0}, {z:1}, {z:2}]
        ])
        expect(all_coordinates).toEqual([
            {x:0, z:0},
            {x:0, z:1},
            {x:0, z:2},
            {x:1, z:0},
            {x:1, z:1},
            {x:1, z:2},
            {x:2, z:0},
            {x:2, z:1},
            {x:2, z:2}
        ])
    })

    it('for 3 dimensions', () => {
        let dimension_size = 3
        let dimensions = {x:dimension_size, y:dimension_size, z:dimension_size}
        let {all_locations, all_coordinates} = BoardUtil.getAllCoordinates(dimensions)
        expect(all_locations instanceof Array).toBe(true)
        expect(all_locations).toEqual([
            [{x:0}, {x:1}, {x:2}],
            [{y:0}, {y:1}, {y:2}],
            [{z:0}, {z:1}, {z:2}]
        ])
        let all_coordinates_answer = []  // [{x: 0, y: 0, z: 0}, {x: 0, y: 0, z: 1}, ...]
        for(let x of [...Array(dimension_size).keys()]) {
            for(let y of [...Array(dimension_size).keys()]) {
                for(let z of [...Array(dimension_size).keys()]) {
                    all_coordinates_answer.push({x, y, z})
                }
            }
        }
        expect(all_coordinates).toEqual(all_coordinates_answer)
    })

    it('for 4 dimensions', () => {
        let dimension_size = 3
        let dimensions = {x:dimension_size, y:dimension_size, z:dimension_size, t:dimension_size}
        let {all_locations, all_coordinates} = BoardUtil.getAllCoordinates(dimensions)
        expect(all_locations instanceof Array).toBe(true)
        expect(all_locations).toEqual([
            [{x:0}, {x:1}, {x:2}],
            [{y:0}, {y:1}, {y:2}],
            [{z:0}, {z:1}, {z:2}],
            [{t:0}, {t:1}, {t:2}]
        ])
        let all_coordinates_answer = []  // [{x: 0, y: 0, z: 0, t:0}, {x: 0, y: 0, z: 0, t:1}, ...]
        for(let x of [...Array(dimension_size).keys()]) {
            for(let y of [...Array(dimension_size).keys()]) {
                for(let z of [...Array(dimension_size).keys()]) {
                    for(let t of [...Array(dimension_size).keys()]) {
                        all_coordinates_answer.push({x, y, z, t})
                    }
                }
            }
        }
        expect(all_coordinates).toEqual(all_coordinates_answer)
    })
})

describe('tile merging', () => {
    it('merges tiles 2 and 2 to 4, and 2-remove', () => {
        let tile0 = BoardUtil.createTile({value: 2})
        let tile1 = BoardUtil.createTile({value: 2})

        let transitioned_value = 4
        let {new_mergee, new_merger, transitioned_points} = BoardUtil.mergeTiles(tile0, tile1, tokens)

        expect(new_mergee).not.toEqual(tile0)
        expect(new_merger).not.toEqual(tile1)
        expect(transitioned_points).toEqual(transitioned_value)
        expect(new_mergee.merged_to).toEqual(transitioned_value)
        expect(new_mergee.merged_from).toEqual(tile1.value)
        expect(new_merger.remove).toEqual(true)
    })
})

describe('tile cleanup', () => {
    let tile0 = BoardUtil.createTile({id: 0, value: 2})
    let tile1 = BoardUtil.createTile({id: 1, value: 2})
    let {new_mergee, new_merger} = BoardUtil.mergeTiles(tile0, tile1, tokens)

    it('cleans a transitioned tile', () => {
        let result = BoardUtil.tileCleanup(new_mergee)
        expect(result).toEqual({id: 0, value: 4})
    })

    it('cleans a tile marked for removal', () => {
        let result = BoardUtil.tileCleanup(new_merger)
        expect(result).toEqual(undefined)
    })
})

describe('sequence iteration in 2D', () => {
    let tile0_coordinates = {x:0, y:0}
    let tile1_coordinates = {x:0, y:1}
    let tile2_coordinates = {x:0, y:2}
    let tile0 = BoardUtil.createTile({value: 2, location: {x:0, y:0}, id: 0})
    let tile1 = BoardUtil.createTile({value: 2, location: {x:0, y:1}, id: 1})
    let tile2 = BoardUtil.createTile({value: 2, location: {x:0, y:2}, id: 2})
    let kv_pairs = [
        {coordinates: tile0_coordinates, tiles: [tile0]},
        {coordinates: tile1_coordinates, tiles: [tile1]},
        {coordinates: tile2_coordinates, tiles: [tile2]}
    ]
    let board_dimensions = {x:3, y:3}
    let board_map = new BoardMap(kv_pairs)

    it('getSequence should be a generator', () => {
        let direction = {x:0, y:1}
        let location = {x:0}
        let getSequence = BoardUtil.getSequence(board_map, board_dimensions, direction, location)
        expect(BoardUtil.getSequence.constructor.name).toBe('GeneratorFunction')  // make sure this is an iterator/generator).toBe('function')  // make sure getSequence is a generator
        expect(typeof getSequence.next).toBe('function')  // make sure this is an iterator/generator
    })

    it('returns the ascending sequence of tiles on a 2D board_map in the correct order', () => {
        // given a board_map, a direction, and a location, it should generate the sequence at that location
        // in the correct order

        let direction = {x:0, y:1}
        let location = {x:0}

        let getSequence = BoardUtil.getSequence(board_map, board_dimensions, direction, location)
        let first = getSequence.next()
        let second = getSequence.next()
        let third = getSequence.next()
        let nonexistent_fourth = getSequence.next()

        expect(first.value).toEqual({coordinates: tile0_coordinates, tiles: [tile0]})
        expect(second.value).toEqual({coordinates: tile1_coordinates, tiles: [tile1]})
        expect(third.value).toEqual({coordinates: tile2_coordinates, tiles: [tile2]})
        expect(nonexistent_fourth.value).toEqual(undefined)
        expect(nonexistent_fourth.done).toEqual(true)
    })

    it('returns the descending sequence of tiles on a 2D board_map in the correct order', () => {
        // given a board_map, a direction, and a location, it should generate the sequence at that location
        // in the correct order

        let direction = {x:0, y:-1}
        let location = {x:0}

        let getSequence = BoardUtil.getSequence(board_map, board_dimensions, direction, location)
        let first = getSequence.next().value
        let second = getSequence.next().value
        let third = getSequence.next().value
        let nonexistent_fourth = getSequence.next().value

        expect(first).toEqual({coordinates: tile2_coordinates, tiles: [tile2]})
        expect(second).toEqual({coordinates: tile1_coordinates, tiles: [tile1]})
        expect(third).toEqual({coordinates: tile0_coordinates, tiles: [tile0]})
        expect(nonexistent_fourth).toEqual(undefined)
    })

    it('returns the ascending sequence of tiles on a 2D board_map along another dimension', () => {
        // given a board_map, a direction, and a location, it should generate the sequence at that location
        // in the correct order

        let direction = {x:1, y:0}
        let location = {y:0}

        let getSequence = BoardUtil.getSequence(board_map, board_dimensions, direction, location)
        let first = getSequence.next().value
        let nonexistent_second = getSequence.next().value

        expect(first).toEqual({coordinates: tile0_coordinates, tiles: [tile0]})
        expect(nonexistent_second).toEqual({coordinates: {x: 1, y: 0}, tiles: undefined})
    })

    it('returns the descending sequence of tiles on a 2D board_map along another dimension', () => {
        // given a board_map, a direction, and a location, it should generate the sequence at that location
        // in the correct order

        let direction = {x:-1, y:0}
        let location = {y:0}

        let getSequence = BoardUtil.getSequence(board_map, board_dimensions, direction, location)
        let nonexistent_first = getSequence.next().value
        let nonexistent_second = getSequence.next().value
        let third = getSequence.next().value

        expect(nonexistent_first).toEqual({coordinates: {x: 2, y: 0}, tiles: undefined})
        expect(nonexistent_second).toEqual({coordinates: {x: 1, y: 0}, tiles: undefined})
        expect(third).toEqual({coordinates: tile0_coordinates, tiles: [tile0]})
    })
})


describe('sequence iteration in 3D', () => {
    let tile0_coordinates = {x: 0, y: 0, z: 0}
    let tile1_coordinates = {x: 0, y: 0, z: 1}
    let tile2_coordinates = {x: 0, y: 0, z: 2}
    let tile0 = BoardUtil.createTile({value: 2, id: 0})
    let tile1 = BoardUtil.createTile({value: 2, id: 1})
    let tile2 = BoardUtil.createTile({value: 2, id: 2})
    let kv_pairs = [
        {coordinates: tile0_coordinates, tiles: [tile0]},
        {coordinates: tile1_coordinates, tiles: [tile1]},
        {coordinates: tile2_coordinates, tiles: [tile2]}
    ]
    let board_dimensions = {x: 3, y: 3, z: 3}
    let board_map = new BoardMap(kv_pairs)

    it('returns the ascending sequence of tiles on a 3D board_map in the correct order', () => {
        // given a board_map, a direction, and a location, it should generate the sequence at that location
        // in the correct order

        let direction = {x: 0, y: 0, z: 1}
        let location = {x: 0, y:0}

        let getSequence = BoardUtil.getSequence(board_map, board_dimensions, direction, location)
        let first = getSequence.next()
        let second = getSequence.next()
        let third = getSequence.next()
        let nonexistent_fourth = getSequence.next()

        expect(first.value).toEqual({coordinates: tile0_coordinates, tiles: [tile0]})
        expect(second.value).toEqual({coordinates: tile1_coordinates, tiles: [tile1]})
        expect(third.value).toEqual({coordinates: tile2_coordinates, tiles: [tile2]})
        expect(nonexistent_fourth.value).toEqual(undefined)
        expect(nonexistent_fourth.done).toEqual(true)
    })

    it('returns the descending sequence of tiles on a 3D board_map in the correct order', () => {
        // given a board_map, a direction, and a location, it should generate the sequence at that location
        // in the correct order

        let direction = {x: 0, y: 0, z: -1}
        let location = {x: 0, y:0}

        let getSequence = BoardUtil.getSequence(board_map, board_dimensions, direction, location)
        let first = getSequence.next()
        let second = getSequence.next()
        let third = getSequence.next()
        let nonexistent_fourth = getSequence.next()

        expect(first.value).toEqual({coordinates: tile2_coordinates, tiles: [tile2]})
        expect(second.value).toEqual({coordinates: tile1_coordinates, tiles: [tile1]})
        expect(third.value).toEqual({coordinates: tile0_coordinates, tiles: [tile0]})
        expect(nonexistent_fourth.value).toEqual(undefined)
        expect(nonexistent_fourth.done).toEqual(true)
    })

    it('returns the ascending sequence of tiles on a 3D board_map along another dimension', () => {
        // given a board_map, a direction, and a location, it should generate the sequence at that location
        // in the correct order

        let direction = {x: 1, y: 0, z: 0}
        let location = {y: 0, z:0}

        let getSequence = BoardUtil.getSequence(board_map, board_dimensions, direction, location)
        let first = getSequence.next().value
        let nonexistent_second = getSequence.next()
        let nonexistent_third = getSequence.next()
        let nonexistent_fourth = getSequence.next()

        expect(first).toEqual({coordinates: tile0_coordinates, tiles: [tile0]})
        expect(nonexistent_second.value).toEqual({coordinates: {x: 1, y: 0, z: 0}, tiles: undefined})
        expect(nonexistent_third.value).toEqual({coordinates: {x: 2, y: 0, z: 0}, tiles: undefined})
        expect(nonexistent_third.done).toEqual(false)
        expect(nonexistent_fourth.value).toEqual(undefined)
        expect(nonexistent_fourth.done).toEqual(true)
    })

    it('returns the descending sequence of tiles on a 3D board_map along another dimension', () => {
        // given a board_map, a direction, and a location, it should generate the sequence at that location
        // in the correct order

        let direction = {x: -1, y: 0, z: 0}
        let location = {y: 0, z:0}

        let getSequence = BoardUtil.getSequence(board_map, board_dimensions, direction, location)
        let nonexistent_first = getSequence.next()
        let nonexistent_second = getSequence.next()
        let third = getSequence.next()
        let nonexistent_fourth = getSequence.next()

        expect(nonexistent_first.value).toEqual({coordinates: {x: 2, y: 0, z: 0}, tiles: undefined})
        expect(nonexistent_second.value).toEqual({coordinates: {x: 1, y: 0, z: 0}, tiles: undefined})
        expect(third.value).toEqual({coordinates: tile0_coordinates, tiles: [tile0]})
        expect(nonexistent_fourth.value).toEqual(undefined)
        expect(nonexistent_fourth.done).toEqual(true)
    })
})


describe('sequence merging in 2D', () => {
    let tile0_coordinates = {x: 0, y: 0}
    let tile1_coordinates = {x: 0, y: 1}
    let tile2_coordinates = {x: 0, y: 2}
    let tile3_coordinates = {x: 0, y: 3}

    let tile4_coordinates = {x: 0, y: 0}
    let tile5_coordinates = {x: 1, y: 0}
    let tile6_coordinates = {x: 2, y: 0}
    let tile7_coordinates = {x: 3, y: 0}

    let tile0 = BoardUtil.createTile({value: 0, id: 0})
    let tile1 = BoardUtil.createTile({value: 0, id: 1})
    let tile2 = BoardUtil.createTile({value: 0, id: 2})
    let tile3 = BoardUtil.createTile({value: 0, id: 3})
    let kv_pairs = [
        {coordinates: tile0_coordinates, tiles: [tile0]},
        {coordinates: tile1_coordinates, tiles: [tile1]},
        {coordinates: tile2_coordinates, tiles: [tile2]},
        {coordinates: tile3_coordinates, tiles: [tile3]}
    ]
    let board_dimensions = {x: 4, y: 4}
    let board_map = new BoardMap(kv_pairs)


    it('merges [0, 0, 0, 0] on a 2D board_map into [x, x, x, x]', () => {
        // this corresponds to a "down" merge
        let direction = {x: 0, y: 1}
        let location = {x: 0}

        let {merged_sequence} = BoardUtil.mergeLocation(board_map, board_dimensions, direction, location, tokens)
        expect(merged_sequence).toEqual([
            {coordinates: tile0_coordinates, tiles: []},
            {coordinates: tile1_coordinates, tiles: []},
            {coordinates: tile2_coordinates, tiles: []},
            {coordinates: tile3_coordinates, tiles: []}
        ])
    })

    it('merges [2, 2, 0, 0] on a 2D board_map into [4, x, x, x]', () => {
        let direction = {x: 0, y: 1}
        let location = {x: 0}
        let tile0 = BoardUtil.createTile({value: 2, id: 0})
        let tile1 = BoardUtil.createTile({value: 2, id: 1})
        let kv_pairs = [
            {coordinates: tile0_coordinates, tiles: [tile0]},
            {coordinates: tile1_coordinates, tiles: [tile1]},
            {coordinates: tile2_coordinates, tiles: [tile2]},
            {coordinates: tile3_coordinates, tiles: [tile3]}
        ]
        let board_dimensions = {x: 4, y: 4}
        let board_map = new BoardMap(kv_pairs)

        let {merged_sequence} = BoardUtil.mergeLocation(board_map, board_dimensions, direction, location, tokens)
        let {new_mergee, new_merger} = BoardUtil.mergeTiles(tile0, tile1, tokens)

        expect(merged_sequence).toEqual([
            {coordinates: tile0_coordinates, tiles: [new_mergee, new_merger]},
            {coordinates: tile1_coordinates, tiles: []},
            {coordinates: tile2_coordinates, tiles: []},
            {coordinates: tile3_coordinates, tiles: []}
        ])
    })

    it('merges [2, 0, 0, 2] left on a 2D board_map into [4, x, x, x]', () => {
        let direction = {x: 0, y: 1}
        let location = {x: 0}


        let tile0 = BoardUtil.createTile({value: 2, id: 0})
        let tile3 = BoardUtil.createTile({value: 2, id: 3})
        let kv_pairs = [
            {coordinates: tile0_coordinates, tiles: [tile0]},
            {coordinates: tile3_coordinates, tiles: [tile3]}
        ]
        let board_dimensions = {x: 4, y: 4}
        let board_map = new BoardMap(kv_pairs)

        let {merged_sequence} = BoardUtil.mergeLocation(board_map, board_dimensions, direction, location, tokens)
        let {new_mergee, new_merger} = BoardUtil.mergeTiles(tile0, tile3, tokens)

        expect(merged_sequence).toEqual([
            {coordinates: tile0_coordinates, tiles: [new_mergee, new_merger]},
            {coordinates: tile1_coordinates, tiles: []},
            {coordinates: tile2_coordinates, tiles: []},
            {coordinates: tile3_coordinates, tiles: []}
        ])
    })

    it('merges [2, 0, 0, 2] right on a 2D board_map into [x, x, x, 4]', () => {
        let direction = {x: 0, y: -1}
        let location = {x: 0}


        let tile0 = BoardUtil.createTile({value: 2, id: 0})
        let tile3 = BoardUtil.createTile({value: 2, id: 3})
        let kv_pairs = [
            {coordinates: tile0_coordinates, tiles: [tile0]},
            {coordinates: tile3_coordinates, tiles: [tile3]}
        ]
        let board_dimensions = {x: 4, y: 4}
        let board_map = new BoardMap(kv_pairs)

        let {merged_sequence} = BoardUtil.mergeLocation(board_map, board_dimensions, direction, location, tokens)
        let {new_mergee, new_merger} = BoardUtil.mergeTiles(tile3, tile0, tokens)
        expect(merged_sequence).toContainEqual({coordinates: tile0_coordinates, tiles: []})
        expect(merged_sequence).toContainEqual({coordinates: tile1_coordinates, tiles: []})
        expect(merged_sequence).toContainEqual({coordinates: tile2_coordinates, tiles: []})
        expect(merged_sequence).toContainEqual({coordinates: tile3_coordinates, tiles: BoardUtil.idSort([new_mergee, new_merger])})
    })

    it('merges [2, 0, 2, 0] right on a 2D board_map into [4, x, x, 0]', () => {
        let direction = {x: 0, y: 1}
        let location = {x: 0}


        let tile0 = BoardUtil.createTile({value: 2, id: 0})
        let tile2 = BoardUtil.createTile({value: 2, id: 2})
        let kv_pairs = [
            {coordinates: tile0_coordinates, tiles: [tile0]},
            {coordinates: tile2_coordinates, tiles: [tile2]}
        ]
        let board_dimensions = {x: 4, y: 4}
        let board_map = new BoardMap(kv_pairs)

        let {merged_sequence} = BoardUtil.mergeLocation(board_map, board_dimensions, direction, location, tokens)
        let {new_mergee, new_merger} = BoardUtil.mergeTiles(tile0, tile2, tokens)
        expect(merged_sequence).toContainEqual({coordinates: tile0_coordinates, tiles: BoardUtil.idSort([new_mergee, new_merger])})
    })

    it('merges [2, 0, 2, 0] right on a 2D board_map into [x, x, x, 4]', () => {
        let direction = {x: 0, y: -1}
        let location = {x: 0}


        let tile0 = BoardUtil.createTile({value: 2, id: 0})
        let tile2 = BoardUtil.createTile({value: 2, id: 2})
        let kv_pairs = [
            {coordinates: tile0_coordinates, tiles: [tile0]},
            {coordinates: tile2_coordinates, tiles: [tile2]}
        ]
        let board_dimensions = {x: 4, y: 4}
        let board_map = new BoardMap(kv_pairs)

        let {merged_sequence} = BoardUtil.mergeLocation(board_map, board_dimensions, direction, location, tokens)
        let {new_mergee, new_merger} = BoardUtil.mergeTiles(tile2, tile0, tokens)
        expect(merged_sequence).toContainEqual({coordinates: tile3_coordinates, tiles: BoardUtil.idSort([new_mergee, new_merger])})
    })

    it('merges [2, 4, 2, 2] right on a 2D board_map into [2, 4, 4, x]', () => {
        let direction = {x: 0, y: 1}
        let location = {x: 0}


        let tile0 = BoardUtil.createTile({value: 2, id: 0})
        let tile1 = BoardUtil.createTile({value: 4, id: 1})
        let tile2 = BoardUtil.createTile({value: 2, id: 2})
        let tile3 = BoardUtil.createTile({value: 2, id: 3})
        let kv_pairs = [
            {coordinates: tile0_coordinates, tiles: [tile0]},
            {coordinates: tile1_coordinates, tiles: [tile1]},
            {coordinates: tile2_coordinates, tiles: [tile2]},
            {coordinates: tile3_coordinates, tiles: [tile3]}
        ]
        let board_dimensions = {x: 4, y: 4}
        let board_map = new BoardMap(kv_pairs)

        let {merged_sequence} = BoardUtil.mergeLocation(board_map, board_dimensions, direction, location, tokens)
        let {new_mergee, new_merger} = BoardUtil.mergeTiles(tile2, tile3, tokens)
        expect(merged_sequence).toEqual([
            {coordinates: tile0_coordinates, tiles: [tile0]},
            {coordinates: tile1_coordinates, tiles: [tile1]},
            {coordinates: tile2_coordinates, tiles: BoardUtil.idSort([new_mergee, new_merger])},
            {coordinates: tile3_coordinates, tiles: []}
        ])
    })

    it('merges [2, 2, 2, 2] in y-axis on a 2D board_map into [4, 4, x, x], and again into [8, 0, 0, 0]', () => {
        let direction = {x: 0, y: 1}
        let location = {x: 0}

        let tile0 = BoardUtil.createTile({value: 2, id: 0})
        let tile1 = BoardUtil.createTile({value: 2, id: 1})
        let tile2 = BoardUtil.createTile({value: 2, id: 2})
        let tile3 = BoardUtil.createTile({value: 2, id: 3})
        let kv_pairs = [
            {coordinates: tile0_coordinates, tiles: [tile0]},
            {coordinates: tile1_coordinates, tiles: [tile1]},
            {coordinates: tile2_coordinates, tiles: [tile2]},
            {coordinates: tile3_coordinates, tiles: [tile3]}
        ]
        let board_dimensions = {x: 4, y: 4}
        let board_map = new BoardMap(kv_pairs)

        let {merged_sequence} = BoardUtil.mergeLocation(board_map, board_dimensions, direction, location, tokens)
        let {new_mergee, new_merger} = BoardUtil.mergeTiles(tile0, tile1, tokens)
        let {new_mergee: new_mergee2, new_merger: new_merger2} = BoardUtil.mergeTiles(tile2, tile3, tokens)
        expect(merged_sequence).toEqual([
            {coordinates: tile0_coordinates, tiles: BoardUtil.idSort([new_mergee, new_merger])},
            {coordinates: tile1_coordinates, tiles: BoardUtil.idSort([new_mergee2, new_merger2])},
            {coordinates: tile2_coordinates, tiles: []},
            {coordinates: tile3_coordinates, tiles: []}
        ])

        let {merged_sequence: merged_sequence2} = BoardUtil.mergeSequence(merged_sequence, tokens)
        let {new_mergee: new_mergee3, new_merger: new_merger3} = BoardUtil.mergeTiles(new_mergee, new_mergee2, tokens)
        expect(merged_sequence2).toEqual([
            {coordinates: tile0_coordinates, tiles: BoardUtil.idSort([new_mergee3, new_merger3])},
            {coordinates: tile1_coordinates, tiles: []},
            {coordinates: tile2_coordinates, tiles: []},
            {coordinates: tile3_coordinates, tiles: []}
        ])
    })

    it('merges [2, 2, 2, 2] in x-axis on a 2D board_map into [4, 4, x, x], and again into [8, 0, 0, 0]', () => {
        let direction = {x: 1, y: 0}
        let location = {y: 0}

        let tile0 = BoardUtil.createTile({value: 2, id: 0})
        let tile1 = BoardUtil.createTile({value: 2, id: 1})
        let tile2 = BoardUtil.createTile({value: 2, id: 2})
        let tile3 = BoardUtil.createTile({value: 2, id: 3})
        let kv_pairs = [
            {coordinates: tile4_coordinates, tiles: [tile0]},
            {coordinates: tile5_coordinates, tiles: tile1},
            {coordinates: tile6_coordinates, tiles: tile2},
            {coordinates: tile7_coordinates, tiles: tile3}
        ]
        let board_dimensions = {x: 4, y: 4}
        let board_map = new BoardMap(kv_pairs)

        let {merged_sequence} = BoardUtil.mergeLocation(board_map, board_dimensions, direction, location, tokens)
        let {new_mergee, new_merger} = BoardUtil.mergeTiles(tile0, tile1, tokens)
        let {new_mergee: new_mergee2, new_merger: new_merger2} = BoardUtil.mergeTiles(tile2, tile3, tokens)
        expect(merged_sequence).toEqual([
            {coordinates: tile4_coordinates, tiles: BoardUtil.idSort([new_mergee, new_merger])},
            {coordinates: tile5_coordinates, tiles: BoardUtil.idSort([new_mergee2, new_merger2])},
            {coordinates: tile6_coordinates, tiles: []},
            {coordinates: tile7_coordinates, tiles: []}
        ])

        let {merged_sequence: merged_sequence2} = BoardUtil.mergeSequence(merged_sequence, tokens)
        let {new_mergee: new_mergee3, new_merger: new_merger3} = BoardUtil.mergeTiles(new_mergee, new_mergee2, tokens)
        expect(merged_sequence2).toEqual([
            {coordinates: tile4_coordinates, tiles: BoardUtil.idSort([new_mergee3, new_merger3])},
            {coordinates: tile5_coordinates, tiles: []},
            {coordinates: tile6_coordinates, tiles: []},
            {coordinates: tile7_coordinates, tiles: []}
        ])
    })
})

describe('board merging in 2D', () => {
    let tile0_coordinates = {x: 0, y: 0}
    let tile1_coordinates = {x: 0, y: 1}
    let tile2_coordinates = {x: 0, y: 2}
    let tile3_coordinates = {x: 0, y: 3}

    it('merges [2, 0, 0, 0] on a 2D board_map into [2, x, x, x]', () => {
        let direction = {x: 0, y: 1}

        let tile0 = BoardUtil.createTile({value: 2, id: 0})
        let tile1 = BoardUtil.createTile({value: 0, id: 1})
        let tile2 = BoardUtil.createTile({value: 0, id: 2})
        let tile3 = BoardUtil.createTile({value: 0, id: 3})
        let kv_pairs = [
            {coordinates: tile0_coordinates, tiles: [tile0]},
            {coordinates: tile1_coordinates, tiles: [tile1]},
            {coordinates: tile2_coordinates, tiles: [tile2]},
            {coordinates: tile3_coordinates, tiles: [tile3]}
        ]
        let board_dimensions = {x: 4, y: 4}
        let board_map = new BoardMap(kv_pairs)

        let {merged_board, new_points} = BoardUtil.mergeBoard(board_map, board_dimensions, direction, tokens)
        expect(new_points).toEqual(0)
        expect(tile0.value).toEqual(2)
        expect(tile0.merged_to).toEqual(undefined)
        expect(merged_board.get(tile0_coordinates)).toEqual([tile0])
        expect(merged_board.get(tile1_coordinates)).toEqual(undefined)
        expect(merged_board.get(tile2_coordinates)).toEqual(undefined)
        expect(merged_board.get(tile3_coordinates)).toEqual(undefined)
    })

    it('merges [2, 4, 2, 2] on a 2D board_map into [2, 4, 4, x]', () => {
        let direction = {x: 0, y: 1}

        let tile0 = BoardUtil.createTile({value: 2, id: 0})
        let tile1 = BoardUtil.createTile({value: 4, id: 1})
        let tile2 = BoardUtil.createTile({value: 2, id: 2})
        let tile3 = BoardUtil.createTile({value: 2, id: 3})
        let kv_pairs = [
            {coordinates: tile0_coordinates, tiles: [tile0]},
            {coordinates: tile1_coordinates, tiles: [tile1]},
            {coordinates: tile2_coordinates, tiles: [tile2]},
            {coordinates: tile3_coordinates, tiles: [tile3]}
        ]
        let board_dimensions = {x: 4, y: 4}
        let board_map = new BoardMap(kv_pairs)

        let {merged_board, new_points} = BoardUtil.mergeBoard(board_map, board_dimensions, direction, tokens)
        expect(new_points).toEqual(4)
        let {new_mergee, new_merger} = BoardUtil.mergeTiles(tile2, tile3, tokens)
        expect(merged_board.get(tile0_coordinates)).toEqual([tile0])
        expect(merged_board.get(tile1_coordinates)).toEqual([tile1])
        expect(merged_board.get(tile2_coordinates)).toEqual(BoardUtil.idSort([new_mergee, new_merger]))
        expect(merged_board.get(tile3_coordinates)).toEqual(undefined)
    })

    it('merges [2, 2, 2, 2] on a 2D board_map into [4, 4, x, x]', () => {
        let direction = {x: 0, y: 1}

        let tile0 = BoardUtil.createTile({value: 2, id: 0})
        let tile1 = BoardUtil.createTile({value: 2, id: 1})
        let tile2 = BoardUtil.createTile({value: 2, id: 2})
        let tile3 = BoardUtil.createTile({value: 2, id: 3})
        let kv_pairs = [
            {coordinates: tile0_coordinates, tiles: [tile0]},
            {coordinates: tile1_coordinates, tiles: [tile1]},
            {coordinates: tile2_coordinates, tiles: [tile2]},
            {coordinates: tile3_coordinates, tiles: [tile3]}
        ]
        let board_dimensions = {x: 4, y: 4}
        let board_map = new BoardMap(kv_pairs)

        let {merged_board, new_points} = BoardUtil.mergeBoard(board_map, board_dimensions, direction, tokens)
        expect(new_points).toEqual(8)

        let {new_mergee, new_merger} = BoardUtil.mergeTiles(tile0, tile1, tokens)
        let {new_mergee: new_mergee2, new_merger: new_merger2} = BoardUtil.mergeTiles(tile2, tile3, tokens)
        expect(merged_board.get(tile0_coordinates)).toEqual(BoardUtil.idSort([new_mergee, new_merger]))
        expect(merged_board.get(tile1_coordinates)).toEqual(BoardUtil.idSort([new_mergee2, new_merger2]))
        expect(merged_board.get(tile2_coordinates)).toEqual(undefined)
        expect(merged_board.get(tile3_coordinates)).toEqual(undefined)
    })

    it('merges [2, 2, 2, x] on a 2D board_map into [4, 2, x, x], and remain at [4, 2, x, x]', () => {
        let tile0 = BoardUtil.createTile({value: 2, id: 0})
        let tile1 = BoardUtil.createTile({value: 2, id: 1})
        let tile2 = BoardUtil.createTile({value: 2, id: 2})
        let kv_pairs = [
            {coordinates: tile0_coordinates, tiles: [tile0]},
            {coordinates: tile1_coordinates, tiles: [tile1]},
            {coordinates: tile2_coordinates, tiles: [tile2]}
        ]
        let board_dimensions = {x: 4, y: 4}
        let direction = {x: 0, y: 1}
        let board_map = new BoardMap(kv_pairs)

        let {merged_board, new_points} = BoardUtil.mergeBoard(board_map, board_dimensions, direction, tokens)
        expect(new_points).toEqual(4)
        let {new_mergee, new_merger} = BoardUtil.mergeTiles(tile0, tile1, tokens)
        expect(merged_board.get(tile0_coordinates)).toEqual(BoardUtil.idSort([new_mergee, new_merger]))
        expect(merged_board.get(tile1_coordinates)).toEqual([tile2])
        expect(merged_board.get(tile2_coordinates)).toEqual(undefined)
        expect(merged_board.get(tile3_coordinates)).toEqual(undefined)

        let {merged_board: merged_board2, new_points: new_points2} = BoardUtil.mergeBoard(merged_board, board_dimensions, direction, tokens)
        expect(new_points2).toEqual(0)
        expect(merged_board2.get(tile0_coordinates)).toEqual([BoardUtil.tileCleanup(new_mergee)])  // [{"id": 0, "value": 4}]
        expect(merged_board2.get(tile1_coordinates)).toEqual([tile2])
    })

    it('merges [2, 2, 2, 2] on a 2D board_map into [x, x, 4, 4]', () => {
        let direction = {x: 0, y: -1}

        let tile0 = BoardUtil.createTile({value: 2, id: 0})
        let tile1 = BoardUtil.createTile({value: 2, id: 1})
        let tile2 = BoardUtil.createTile({value: 2, id: 2})
        let tile3 = BoardUtil.createTile({value: 2, id: 3})
        let kv_pairs = [
            {coordinates: tile0_coordinates, tiles: [tile0]},
            {coordinates: tile1_coordinates, tiles: [tile1]},
            {coordinates: tile2_coordinates, tiles: [tile2]},
            {coordinates: tile3_coordinates, tiles: [tile3]}
        ]
        let board_dimensions = {x: 4, y: 4}
        let board_map = new BoardMap(kv_pairs)

        let {merged_board, new_points} = BoardUtil.mergeBoard(board_map, board_dimensions, direction, tokens)
        let {new_mergee, new_merger} = BoardUtil.mergeTiles(tile1, tile0, tokens)
        let {new_mergee: new_mergee2, new_merger: new_merger2} = BoardUtil.mergeTiles(tile3, tile2, tokens)
        expect(new_points).toEqual(8)
        expect(merged_board.get(tile0_coordinates)).toEqual(undefined)
        expect(merged_board.get(tile1_coordinates)).toEqual(undefined)
        expect(BoardUtil.idSort(merged_board.get(tile2_coordinates))).toEqual(BoardUtil.idSort([new_mergee, new_merger]))
        expect(BoardUtil.idSort(merged_board.get(tile3_coordinates))).toEqual(BoardUtil.idSort([new_mergee2, new_merger2]))
    })

    it('merges [2, 2, 4, 8] on a 2D board_map into [x, 4, 4, 8]', () => {
        let tile0 = BoardUtil.createTile({value: 2, id: 0})
        let tile1 = BoardUtil.createTile({value: 2, id: 1})
        let tile2 = BoardUtil.createTile({value: 4, id: 2})
        let tile3 = BoardUtil.createTile({value: 8, id: 3})
        let tile0_coordinates = {x: 0, y: 0}
        let tile1_coordinates = {x: 1, y: 0}
        let tile2_coordinates = {x: 2, y: 0}
        let tile3_coordinates = {x: 3, y: 0}
        let kv_pairs = [
            {coordinates: tile0_coordinates, tiles: [tile0]},
            {coordinates: tile1_coordinates, tiles: [tile1]},
            {coordinates: tile2_coordinates, tiles: [tile2]},
            {coordinates: tile3_coordinates, tiles: [tile3]}
        ]
        let board_dimensions = {x: 4, y: 4}
        let direction = {x: -1, y: 0}
        let board_map = new BoardMap(kv_pairs)

        let {merged_board, new_points} = BoardUtil.mergeBoard(board_map, board_dimensions, direction, tokens)
        let {new_mergee, new_merger} = BoardUtil.mergeTiles(tile1, tile0, tokens)
        expect(new_points).toEqual(4)
        expect(merged_board.get(tile0_coordinates)).toEqual(undefined)
        expect(merged_board.get(tile1_coordinates)).toEqual(BoardUtil.idSort([new_mergee, new_merger]))
        expect(merged_board.get(tile2_coordinates)).toEqual([tile2])
        expect(merged_board.get(tile3_coordinates)).toEqual([tile3])
    })
})


describe('board merging in 3D', () => {
    /**
     *
     * Testing with the board below, origin is bottom left, z=0 in first panel, 1 in second etc
     *
     *  2 0 0 0   0 0 0 0   0 0 0 0   0 0 0 0
     *  2 0 0 0   0 0 0 0   0 0 0 0   0 0 0 0
     *  2 0 0 0   0 0 0 0   0 0 0 0   0 0 0 0
     *  2 2 2 2   2 0 0 0   0 0 0 0   0 0 0 0
     * @type {{x: number, y: number, z: number}}
     */

    let tile0_coordinates = {x: 0, y: 0, z: 0}
    let tile1_coordinates = {x: 0, y: 1, z: 0}
    let tile2_coordinates = {x: 0, y: 2, z: 0}
    let tile3_coordinates = {x: 0, y: 3, z: 0}
    let tile4_coordinates = {x: 1, y: 0, z: 0}
    let tile5_coordinates = {x: 2, y: 0, z: 0}
    let tile6_coordinates = {x: 3, y: 0, z: 0}
    let tile7_coordinates = {x: 0, y: 0, z: 1}  // note this is in z:1

    let tile0 = BoardUtil.createTile({value: 2, id: 0})
    let tile1 = BoardUtil.createTile({value: 2, id: 1})
    let tile2 = BoardUtil.createTile({value: 2, id: 2})
    let tile3 = BoardUtil.createTile({value: 2, id: 3})
    let tile4 = BoardUtil.createTile({value: 2, id: 4})
    let tile5 = BoardUtil.createTile({value: 2, id: 5})
    let tile6 = BoardUtil.createTile({value: 2, id: 6})
    let tile7 = BoardUtil.createTile({value: 2, id: 7})

    let kv_pairs = [
        {coordinates: tile0_coordinates, tiles: [tile0]},
        {coordinates: tile1_coordinates, tiles: [tile1]},
        {coordinates: tile2_coordinates, tiles: [tile2]},
        {coordinates: tile3_coordinates, tiles: [tile3]},
        {coordinates: tile4_coordinates, tiles: [tile4]},
        {coordinates: tile5_coordinates, tiles: [tile5]},
        {coordinates: tile6_coordinates, tiles: [tile6]},
        {coordinates: tile7_coordinates, tiles: [tile7]},
    ]
    let board_dimensions = {x: 4, y: 4, z:4}


    it('merges a 3D board down correctly', () => {
        let direction = {x: 0, y: 0, z:1}
        let board_map = new BoardMap(kv_pairs)

        let {merged_board, new_points} = BoardUtil.mergeBoard(board_map, board_dimensions, direction, tokens)
        let {new_mergee, new_merger} = BoardUtil.mergeTiles(tile0, tile7, tokens)
        expect(new_points).toEqual(4)
        // tile0 one should have been transitioned
        // tile7 transitioned tile0 and is marked for removal
        expect(merged_board.get(tile0_coordinates)).toEqual(BoardUtil.idSort([new_mergee, new_merger]))
        // all other tiles should be the same
        expect(merged_board.get(tile1_coordinates)).toEqual([tile1])
        expect(merged_board.get(tile2_coordinates)).toEqual([tile2])
        expect(merged_board.get(tile3_coordinates)).toEqual([tile3])
    })


    it('merges a 3D board up correctly', () => {
        // reset these tiles from the last test
        let tile0 = BoardUtil.createTile({value: 2, id: 0})
        let tile7 = BoardUtil.createTile({value: 2, id: 7})
        let direction = {x: 0, y: 0, z:-1}
        kv_pairs[0] = {coordinates: tile0_coordinates, tiles: [tile0]}
        kv_pairs[7] = {coordinates: tile7_coordinates, tiles: [tile7]}
        let board_map = new BoardMap(kv_pairs)

        let {merged_board, new_points} = BoardUtil.mergeBoard(board_map, board_dimensions, direction, tokens)
        let {new_mergee, new_merger} = BoardUtil.mergeTiles(tile7, tile0, tokens)
        // this one should have been transitioned
        expect(new_points).toEqual(4)
        expect(merged_board.get({x:0, y:0, z:3})).toEqual(BoardUtil.idSort([new_mergee, new_merger]))
        expect(merged_board.get({x:0, y:1, z:3})).toEqual([tile1])
        expect(merged_board.get({x:1, y:0, z:3})).toEqual([tile4])
        expect(merged_board.get({x:1, y:1, z:3})).toEqual(undefined)
    })
})