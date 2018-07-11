import * as BoardUtil from './board_util';
import BoardMap from './board_map';


function idSort(tiles) {
    return tiles.sort((t1, t2) => {
        if(t1.id < t2.id) return -1
        if(t1.id > t2.id) return 1
        return 0
    })
}

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
    let tile1 = BoardUtil.createTile({value: 0, location: {x:0, y:1}})
    let tile2 = BoardUtil.createTile({value: 0, location: {x:1, y:1}, id: 99})
    expect(tile0.id).toBe(0);
    expect(tile1.id).toBe(1);
    expect(tile2.id).toBe(99);
    expect(tile0.location).toEqual({x:0, y:0});
    expect(tile1.location).toEqual({x:0, y:1});
    expect(tile2.location).toEqual({x:1, y:1});
});

it('creates a board_map with preset values', () => {
    let tile0_coordinates = {x:0, y:0}
    let tile1_coordinates = {x:0, y:1}
    let tile0 = BoardUtil.createTile({value: 2, location: {x:0, y:0}, id: 0})
    let tile1 = BoardUtil.createTile({value: 2, location: {x:0, y:1}, id: 1})
    let kv_pairs = [
        [tile0_coordinates, tile0],
        [tile1_coordinates, tile1]
    ]
    let board_map = new BoardMap(kv_pairs)
    expect(typeof board_map).toBe('object');
    expect(board_map instanceof BoardMap).toBe(true);
    expect(board_map.get(tile0_coordinates)).toEqual([tile0])
    expect(board_map.get(tile1_coordinates)).toEqual([tile1])
});


it('cleans sequence of removable tokens and updates values', () => {
    let tile0_coordinates = {x: 0, y: 0}
    let tile1_coordinates = {x: 0, y: 1}
    let tile2_coordinates = {x: 0, y: 2}
    let tile3_coordinates = {x: 0, y: 3}
    let tile0 = BoardUtil.createTile({value: 2, id: 0, merged_to: 4})
    let tile1 = BoardUtil.createTile({value: 0, id: 1, remove: true})
    let kv_pairs = [
        [tile0_coordinates, [tile0]],
        [tile1_coordinates, [tile1]]
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
        [tile0_coordinates, [{value: 4, id: 0}]],
        [tile1_coordinates, []],
        [tile2_coordinates, []],
        [tile3_coordinates, []]
    ])
});

it('returns all move sequences in 2D', () => {
    let direction = {x: 0, y: 1}
    let board_dimensions = {x: 4, y: 4}
    let move_sequences = BoardUtil.getMoveSequences(board_dimensions, direction)
    expect(move_sequences).toEqual([
        {"x": 0},
        {"x": 1},
        {"x": 2},
        {"x": 3},
    ])
});

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
});

it('transitions tokens as expected', () => {
    let tile0 = BoardUtil.createTile({value: 2, id: 0})
    let {transitioned_token, transitioned_points} = BoardUtil.transitionToken(tokens, tile0.value)
    expect(transitioned_token).toEqual(4)
    expect(transitioned_points).toEqual(4)
})

describe('get all coordinates ', () => {
    it('for 1 dimension', () => {
        let {all_locations, all_coordinates} = BoardUtil.getAllCoordinates({x:3})
        expect(all_locations instanceof Array).toBe(true);
        expect(all_locations).toEqual([
            [{x:0}, {x:1}, {x:2}]
        ]);
        expect(all_coordinates).toEqual([{x:0}, {x:1}, {x:2}]);
    });


    it('for 2 dimensions', () => {
        let {all_locations, all_coordinates} = BoardUtil.getAllCoordinates({x:3, z:3})
        expect(all_locations instanceof Array).toBe(true);
        expect(all_locations).toEqual([
            [{x:0}, {x:1}, {x:2}],
            [{z:0}, {z:1}, {z:2}]
        ]);
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
        ]);
    });

    it('for 3 dimensions', () => {
        let dimension_size = 3
        let dimensions = {x:dimension_size, y:dimension_size, z:dimension_size}
        let {all_locations, all_coordinates} = BoardUtil.getAllCoordinates(dimensions)
        expect(all_locations instanceof Array).toBe(true);
        expect(all_locations).toEqual([
            [{x:0}, {x:1}, {x:2}],
            [{y:0}, {y:1}, {y:2}],
            [{z:0}, {z:1}, {z:2}]
        ]);
        let all_coordinates_answer = []  // [{x: 0, y: 0, z: 0}, {x: 0, y: 0, z: 1}, ...]
        for(let x of [...Array(dimension_size).keys()]) {
            for(let y of [...Array(dimension_size).keys()]) {
                for(let z of [...Array(dimension_size).keys()]) {
                    all_coordinates_answer.push({x, y, z})
                }
            }
        }
        expect(all_coordinates).toEqual(all_coordinates_answer);
    });

    it('for 4 dimensions', () => {
        let dimension_size = 3
        let dimensions = {x:dimension_size, y:dimension_size, z:dimension_size, t:dimension_size}
        let {all_locations, all_coordinates} = BoardUtil.getAllCoordinates(dimensions)
        expect(all_locations instanceof Array).toBe(true);
        expect(all_locations).toEqual([
            [{x:0}, {x:1}, {x:2}],
            [{y:0}, {y:1}, {y:2}],
            [{z:0}, {z:1}, {z:2}],
            [{t:0}, {t:1}, {t:2}]
        ]);
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
        expect(all_coordinates).toEqual(all_coordinates_answer);
    });
})

describe('sequence iteration in 2D', () => {
    let tile0_coordinates = {x:0, y:0}
    let tile1_coordinates = {x:0, y:1}
    let tile2_coordinates = {x:0, y:2}
    let tile0 = BoardUtil.createTile({value: 2, location: {x:0, y:0}, id: 0})
    let tile1 = BoardUtil.createTile({value: 2, location: {x:0, y:1}, id: 1})
    let tile2 = BoardUtil.createTile({value: 2, location: {x:0, y:2}, id: 2})
    let kv_pairs = [
        [tile0_coordinates, tile0],
        [tile1_coordinates, tile1],
        [tile2_coordinates, tile2]
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

        expect(first.value).toEqual([tile0_coordinates, [tile0]])
        expect(second.value).toEqual([tile1_coordinates, [tile1]])
        expect(third.value).toEqual([tile2_coordinates, [tile2]])
        expect(nonexistent_fourth.value).toEqual(undefined)
        expect(nonexistent_fourth.done).toEqual(true)
    });

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

        expect(first).toEqual([tile2_coordinates, [tile2]])
        expect(second).toEqual([tile1_coordinates, [tile1]])
        expect(third).toEqual([tile0_coordinates, [tile0]])
        expect(nonexistent_fourth).toEqual(undefined)
    });

    it('returns the ascending sequence of tiles on a 2D board_map along another dimension', () => {
        // given a board_map, a direction, and a location, it should generate the sequence at that location
        // in the correct order

        let direction = {x:1, y:0}
        let location = {y:0}

        let getSequence = BoardUtil.getSequence(board_map, board_dimensions, direction, location)
        let first = getSequence.next().value
        let nonexistent_second = getSequence.next().value

        expect(first).toEqual([tile0_coordinates, [tile0]])
        expect(nonexistent_second).toEqual([{x: 1, y: 0}, undefined])
    });

    it('returns the descending sequence of tiles on a 2D board_map along another dimension', () => {
        // given a board_map, a direction, and a location, it should generate the sequence at that location
        // in the correct order

        let direction = {x:-1, y:0}
        let location = {y:0}

        let getSequence = BoardUtil.getSequence(board_map, board_dimensions, direction, location)
        let nonexistent_first = getSequence.next().value
        let nonexistent_second = getSequence.next().value
        let third = getSequence.next().value

        expect(nonexistent_first).toEqual([{x: 2, y: 0}, undefined])
        expect(nonexistent_second).toEqual([{x: 1, y: 0}, undefined])
        expect(third).toEqual([tile0_coordinates, [tile0]])
    });
})


describe('sequence iteration in 3D', () => {
    let tile0_coordinates = {x: 0, y: 0, z: 0}
    let tile1_coordinates = {x: 0, y: 0, z: 1}
    let tile2_coordinates = {x: 0, y: 0, z: 2}
    let tile0 = BoardUtil.createTile({value: 2, id: 0})
    let tile1 = BoardUtil.createTile({value: 2, id: 1})
    let tile2 = BoardUtil.createTile({value: 2, id: 2})
    let kv_pairs = [
        [tile0_coordinates, tile0],
        [tile1_coordinates, tile1],
        [tile2_coordinates, tile2]
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

        expect(first.value).toEqual([tile0_coordinates, [tile0]])
        expect(second.value).toEqual([tile1_coordinates, [tile1]])
        expect(third.value).toEqual([tile2_coordinates, [tile2]])
        expect(nonexistent_fourth.value).toEqual(undefined)
        expect(nonexistent_fourth.done).toEqual(true)
    });

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

        expect(first.value).toEqual([tile2_coordinates, [tile2]])
        expect(second.value).toEqual([tile1_coordinates, [tile1]])
        expect(third.value).toEqual([tile0_coordinates, [tile0]])
        expect(nonexistent_fourth.value).toEqual(undefined)
        expect(nonexistent_fourth.done).toEqual(true)
    });

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

        expect(first).toEqual([tile0_coordinates, [tile0]])
        expect(nonexistent_second.value).toEqual([{x: 1, y: 0, z: 0}, undefined])
        expect(nonexistent_third.value).toEqual([{x: 2, y: 0, z: 0}, undefined])
        expect(nonexistent_third.done).toEqual(false)
        expect(nonexistent_fourth.value).toEqual(undefined)
        expect(nonexistent_fourth.done).toEqual(true)
    });

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

        expect(nonexistent_first.value).toEqual([{x: 2, y: 0, z: 0}, undefined])
        expect(nonexistent_second.value).toEqual([{x: 1, y: 0, z: 0}, undefined])
        expect(third.value).toEqual([tile0_coordinates, [tile0]])
        expect(nonexistent_fourth.value).toEqual(undefined)
        expect(nonexistent_fourth.done).toEqual(true)
    });
});


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
        [tile0_coordinates, tile0],
        [tile1_coordinates, tile1],
        [tile2_coordinates, tile2],
        [tile3_coordinates, tile3]
    ]
    let board_dimensions = {x: 4, y: 4}
    let board_map = new BoardMap(kv_pairs)


    it('merges [0, 0, 0, 0] on a 2D board_map into [x, x, x, x]', () => {
        // merging up will actually be direction -1, down will be 1, to get desired merge behavior
        // (first in merge direction merges first) means we want things to merge from move dir back

        // this corresponds to a "down" merge
        let direction = {x: 0, y: 1}
        let location = {x: 0}

        let {merged_sequence} = BoardUtil.mergeLocation(board_map, board_dimensions, direction, location, tokens)
        expect(merged_sequence).toEqual([
            [tile0_coordinates, []],
            [tile1_coordinates, []],
            [tile2_coordinates, []],
            [tile3_coordinates, []]
        ])
    });

    it('merges [2, 2, 0, 0] on a 2D board_map into [4, x, x, x]', () => {
        // merging up will actually be direction -1, down will be 1, to get desired merge behavior
        // (first in merge direction merges first) means we want things to merge from move dir back

        let direction = {x: 0, y: 1}
        let location = {x: 0}


        let tile0 = BoardUtil.createTile({value: 2, id: 0})
        let tile1 = BoardUtil.createTile({value: 2, id: 1})
        let kv_pairs = [
            [tile0_coordinates, tile0],
            [tile1_coordinates, tile1],
            [tile2_coordinates, tile2],
            [tile3_coordinates, tile3]
        ]
        let board_dimensions = {x: 4, y: 4}
        let board_map = new BoardMap(kv_pairs)

        let {merged_sequence} = BoardUtil.mergeLocation(board_map, board_dimensions, direction, location, tokens)
        expect(merged_sequence).toEqual([
            [tile0_coordinates, [tile0, tile1]],
            [tile1_coordinates, []],
            [tile2_coordinates, []],
            [tile3_coordinates, []]
        ])
    });

    it('merges [2, 0, 0, 2] left on a 2D board_map into [4, x, x, x]', () => {
        // merging up will actually be direction -1, down will be 1, to get desired merge behavior
        // (first in merge direction merges first) means we want things to merge from move dir back

        let direction = {x: 0, y: 1}
        let location = {x: 0}


        let tile0 = BoardUtil.createTile({value: 2, id: 0})
        let tile3 = BoardUtil.createTile({value: 2, id: 3})
        let kv_pairs = [
            [tile0_coordinates, tile0],
            [tile3_coordinates, tile3]
        ]
        let board_dimensions = {x: 4, y: 4}
        let board_map = new BoardMap(kv_pairs)

        let {merged_sequence} = BoardUtil.mergeLocation(board_map, board_dimensions, direction, location, tokens)
        expect(merged_sequence).toEqual([
            [tile0_coordinates, [tile0, tile3]],
            [tile1_coordinates, []],
            [tile2_coordinates, []],
            [tile3_coordinates, []]
        ])
    });

    it('merges [2, 0, 0, 2] right on a 2D board_map into [x, x, x, 4]', () => {
        // merging up will actually be direction -1, down will be 1, to get desired merge behavior
        // (first in merge direction merges first) means we want things to merge from move dir back

        let direction = {x: 0, y: -1}
        let location = {x: 0}


        let tile0 = BoardUtil.createTile({value: 2, id: 0})
        let tile3 = BoardUtil.createTile({value: 2, id: 3})
        let kv_pairs = [
            [tile0_coordinates, tile0],
            [tile3_coordinates, tile3]
        ]
        let board_dimensions = {x: 4, y: 4}
        let board_map = new BoardMap(kv_pairs)

        let {merged_sequence} = BoardUtil.mergeLocation(board_map, board_dimensions, direction, location, tokens)
        expect(merged_sequence).toContainEqual([tile3_coordinates, [tile3, tile0]])
    });

    it('merges [2, 0, 2, 0] right on a 2D board_map into [4, x, x, 0]', () => {
        // merging up will actually be direction -1, down will be 1, to get desired merge behavior
        // (first in merge direction merges first) means we want things to merge from move dir back

        let direction = {x: 0, y: 1}
        let location = {x: 0}


        let tile0 = BoardUtil.createTile({value: 2, id: 0})
        let tile2 = BoardUtil.createTile({value: 2, id: 2})
        let kv_pairs = [
            [tile0_coordinates, tile0],
            [tile2_coordinates, tile2]
        ]
        let board_dimensions = {x: 4, y: 4}
        let board_map = new BoardMap(kv_pairs)

        let {merged_sequence} = BoardUtil.mergeLocation(board_map, board_dimensions, direction, location, tokens)
        expect(merged_sequence).toContainEqual([tile0_coordinates, [tile0, tile2]])
    });

    it('merges [2, 0, 2, 0] left on a 2D board_map into [x, x, x, 4]', () => {
        // merging up will actually be direction -1, down will be 1, to get desired merge behavior
        // (first in merge direction merges first) means we want things to merge from move dir back

        let direction = {x: 0, y: -1}
        let location = {x: 0}


        let tile0 = BoardUtil.createTile({value: 2, id: 0})
        let tile2 = BoardUtil.createTile({value: 2, id: 2})
        let kv_pairs = [
            [tile0_coordinates, tile0],
            [tile2_coordinates, tile2]
        ]
        let board_dimensions = {x: 4, y: 4}
        let board_map = new BoardMap(kv_pairs)

        let {merged_sequence} = BoardUtil.mergeLocation(board_map, board_dimensions, direction, location, tokens)
        expect(merged_sequence).toContainEqual([tile3_coordinates, [tile2, tile0]])
    });

    it('merges [2, 4, 2, 2] on a 2D board_map into [2, 4, 4, x]', () => {
        // merging up will actually be direction -1, down will be 1, to get desired merge behavior
        // (first in merge direction merges first) means we want things to merge from move dir back

        let direction = {x: 0, y: 1}
        let location = {x: 0}


        let tile0 = BoardUtil.createTile({value: 2, id: 0})
        let tile1 = BoardUtil.createTile({value: 4, id: 1})
        let tile2 = BoardUtil.createTile({value: 2, id: 2})
        let tile3 = BoardUtil.createTile({value: 2, id: 3})
        let kv_pairs = [
            [tile0_coordinates, tile0],
            [tile1_coordinates, tile1],
            [tile2_coordinates, tile2],
            [tile3_coordinates, tile3]
        ]
        let board_dimensions = {x: 4, y: 4}
        let board_map = new BoardMap(kv_pairs)

        let {merged_sequence} = BoardUtil.mergeLocation(board_map, board_dimensions, direction, location, tokens)
        expect(merged_sequence).toEqual([
            [tile0_coordinates, [tile0]],
            [tile1_coordinates, [tile1]],
            [tile2_coordinates, [tile2, tile3]],
            [tile3_coordinates, []]
        ])
    });

    it('merges [2, 2, 2, 2] on a 2D board_map into [4, 4, x, x], and again into [8, 0, 0, 0]', () => {
        // merging up will actually be direction -1, down will be 1, to get desired merge behavior
        // (first in merge direction merges first) means we want things to merge from move dir back

        let direction = {x: 0, y: 1}
        let location = {x: 0}

        let tile0 = BoardUtil.createTile({value: 2, id: 0})
        let tile1 = BoardUtil.createTile({value: 2, id: 1})
        let tile2 = BoardUtil.createTile({value: 2, id: 2})
        let tile3 = BoardUtil.createTile({value: 2, id: 3})
        let kv_pairs = [
            [tile0_coordinates, tile0],
            [tile1_coordinates, tile1],
            [tile2_coordinates, tile2],
            [tile3_coordinates, tile3]
        ]
        let board_dimensions = {x: 4, y: 4}
        let board_map = new BoardMap(kv_pairs)

        let {merged_sequence} = BoardUtil.mergeLocation(board_map, board_dimensions, direction, location, tokens)
        expect(merged_sequence).toEqual([
            [tile0_coordinates, [tile0, tile1]],
            [tile1_coordinates, [tile2, tile3]],
            [tile2_coordinates, []],
            [tile3_coordinates, []]
        ])

        var {merged_sequence: merged_sequence2} = BoardUtil.mergeSequence(merged_sequence, tokens)
        expect(merged_sequence2).toEqual([
            [tile0_coordinates, [tile1, tile3]],
            [tile1_coordinates, []],
            [tile2_coordinates, []],
            [tile3_coordinates, []]
        ])
    });

    it('merges [2, 2, 2, 2] in x-axis on a 2D board_map into [4, 4, x, x], and again into [8, 0, 0, 0]', () => {
        // merging up will actually be direction -1, down will be 1, to get desired merge behavior
        // (first in merge direction merges first) means we want things to merge from move dir back

        let direction = {x: 1, y: 0}
        let location = {y: 0}

        let tile0 = BoardUtil.createTile({value: 2, id: 0})
        let tile1 = BoardUtil.createTile({value: 2, id: 1})
        let tile2 = BoardUtil.createTile({value: 2, id: 2})
        let tile3 = BoardUtil.createTile({value: 2, id: 3})
        let kv_pairs = [
            [tile4_coordinates, tile0],
            [tile5_coordinates, tile1],
            [tile6_coordinates, tile2],
            [tile7_coordinates, tile3]
        ]
        let board_dimensions = {x: 4, y: 4}
        let board_map = new BoardMap(kv_pairs)

        let {merged_sequence} = BoardUtil.mergeLocation(board_map, board_dimensions, direction, location, tokens)
        expect(merged_sequence).toEqual([
            [tile4_coordinates, [tile0, tile1]],
            [tile5_coordinates, [tile2, tile3]],
            [tile6_coordinates, []],
            [tile7_coordinates, []]
        ])

        let {merged_sequence: merged_sequence2} = BoardUtil.mergeSequence(merged_sequence, tokens)
        expect(merged_sequence2).toEqual([
            [tile4_coordinates, [tile1, tile3]],
            [tile5_coordinates, []],
            [tile6_coordinates, []],
            [tile7_coordinates, []]
        ])
    });
});

describe('board merging in 2D', () => {
    let tile0_coordinates = {x: 0, y: 0}
    let tile1_coordinates = {x: 0, y: 1}
    let tile2_coordinates = {x: 0, y: 2}
    let tile3_coordinates = {x: 0, y: 3}

    it('merges [2, 0, 0, 0] on a 2D board_map into [2, x, x, x]', () => {
        // merging up will actually be direction -1, down will be 1, to get desired merge behavior
        // (first in merge direction merges first) means we want things to merge from move dir back

        let direction = {x: 0, y: 1}
        let location = {x: 0}

        let tile0 = BoardUtil.createTile({value: 2, id: 0})
        let tile1 = BoardUtil.createTile({value: 0, id: 1})
        let tile2 = BoardUtil.createTile({value: 0, id: 2})
        let tile3 = BoardUtil.createTile({value: 0, id: 3})
        let kv_pairs = [
            [tile0_coordinates, tile0],
            [tile1_coordinates, tile1],
            [tile2_coordinates, tile2],
            [tile3_coordinates, tile3]
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
        // merging up will actually be direction -1, down will be 1, to get desired merge behavior
        // (first in merge direction merges first) means we want things to merge from move dir back

        let direction = {x: 0, y: 1}
        let location = {x: 0}

        let tile0 = BoardUtil.createTile({value: 2, id: 0})
        let tile1 = BoardUtil.createTile({value: 4, id: 1})
        let tile2 = BoardUtil.createTile({value: 2, id: 2})
        let tile3 = BoardUtil.createTile({value: 2, id: 3})
        let kv_pairs = [
            [tile0_coordinates, tile0],
            [tile1_coordinates, tile1],
            [tile2_coordinates, tile2],
            [tile3_coordinates, tile3]
        ]
        let board_dimensions = {x: 4, y: 4}
        let board_map = new BoardMap(kv_pairs)

        let {merged_board, new_points} = BoardUtil.mergeBoard(board_map, board_dimensions, direction, tokens)
        expect(new_points).toEqual(4)
        expect(tile0.value).toEqual(2)
        expect(tile0.merged_to).toEqual(undefined)
        expect(tile1.value).toEqual(4)
        expect(tile1.remove).toEqual(undefined)
        expect(tile2.value).toEqual(2)
        expect(tile2.merged_to).toEqual(4)
        expect(tile2.remove).toEqual(undefined)
        expect(tile3.value).toEqual(2)
        expect(tile3.remove).toEqual(true)
        expect(merged_board.get(tile0_coordinates)).toEqual([tile0])
        expect(merged_board.get(tile1_coordinates)).toEqual([tile1])
        expect(merged_board.get(tile2_coordinates)).toEqual([tile2, tile3])
        expect(merged_board.get(tile3_coordinates)).toEqual(undefined)
    })

    it('merges [2, 2, 2, 2] on a 2D board_map into [4, 4, x, x]', () => {
        // merging up will actually be direction -1, down will be 1, to get desired merge behavior
        // (first in merge direction merges first) means we want things to merge from move dir back

        let direction = {x: 0, y: 1}
        let location = {x: 0}

        let tile0 = BoardUtil.createTile({value: 2, id: 0})
        let tile1 = BoardUtil.createTile({value: 2, id: 1})
        let tile2 = BoardUtil.createTile({value: 2, id: 2})
        let tile3 = BoardUtil.createTile({value: 2, id: 3})
        let kv_pairs = [
            [tile0_coordinates, tile0],
            [tile1_coordinates, tile1],
            [tile2_coordinates, tile2],
            [tile3_coordinates, tile3]
        ]
        let board_dimensions = {x: 4, y: 4}
        let board_map = new BoardMap(kv_pairs)

        let {merged_board, new_points} = BoardUtil.mergeBoard(board_map, board_dimensions, direction, tokens)
        expect(new_points).toEqual(8)
        expect(tile0.value).toEqual(2)
        expect(tile0.merged_to).toEqual(4)
        expect(tile1.value).toEqual(2)
        expect(tile1.remove).toEqual(true)
        expect(merged_board.get(tile0_coordinates)).toEqual([tile0, tile1])
        expect(merged_board.get(tile1_coordinates)).toEqual([tile2, tile3])
        expect(merged_board.get(tile2_coordinates)).toEqual(undefined)
        expect(merged_board.get(tile3_coordinates)).toEqual(undefined)
    })

    it('merges [2, 2, 2, 2] on a 2D board_map into [x, x, 4, 4]', () => {
        // merging up will actually be direction -1, down will be 1, to get desired merge behavior
        // (first in merge direction merges first) means we want things to merge from move dir back

        let direction = {x: 0, y: -1}

        let tile0 = BoardUtil.createTile({value: 2, id: 0})
        let tile1 = BoardUtil.createTile({value: 2, id: 1})
        let tile2 = BoardUtil.createTile({value: 2, id: 2})
        let tile3 = BoardUtil.createTile({value: 2, id: 3})
        let kv_pairs = [
            [tile0_coordinates, tile0],
            [tile1_coordinates, tile1],
            [tile2_coordinates, tile2],
            [tile3_coordinates, tile3]
        ]
        let board_dimensions = {x: 4, y: 4}
        let board_map = new BoardMap(kv_pairs)

        let {merged_board, new_points} = BoardUtil.mergeBoard(board_map, board_dimensions, direction, tokens)
        expect(new_points).toEqual(8)
        expect(tile3.value).toEqual(2)
        expect(tile3.merged_to).toEqual(4)
        expect(tile1.value).toEqual(2)
        expect(tile2.remove).toEqual(true)
        expect(idSort(merged_board.get(tile2_coordinates))).toEqual(idSort([tile0, tile1]))
        expect(idSort(merged_board.get(tile3_coordinates))).toEqual(idSort([tile2, tile3]))
        expect(merged_board.get(tile0_coordinates)).toEqual(undefined)
        expect(merged_board.get(tile1_coordinates)).toEqual(undefined)
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
        [tile0_coordinates, tile0],
        [tile1_coordinates, tile1],
        [tile2_coordinates, tile2],
        [tile3_coordinates, tile3],
        [tile4_coordinates, tile4],
        [tile5_coordinates, tile5],
        [tile6_coordinates, tile6],
        [tile7_coordinates, tile7],
    ]
    let board_dimensions = {x: 4, y: 4, z:4}
    let board_map = new BoardMap(kv_pairs)


    it('merges a 3D board down correctly', () => {
        // merging up will actually be direction -1, down will be 1, to get desired merge behavior
        // (first in merge direction merges first) means we want things to merge from move dir back

        let direction = {x: 0, y: 0, z:1}
        let board_map = new BoardMap(kv_pairs)

        let {merged_board, new_points} = BoardUtil.mergeBoard(board_map, board_dimensions, direction, tokens)
        expect(new_points).toEqual(4)
        // this one should have been transitioned
        expect(tile0.value).toEqual(2)
        expect(tile0.merged_to).toEqual(4)
        expect(merged_board.get(tile0_coordinates)).toEqual([tile0, tile7])
        // this one transitioned tile0 and is marked for removal
        expect(tile7.value).toEqual(2)
        expect(tile7.remove).toEqual(true)
        // all other tiles should be the same, this is a sample only
        expect(tile1.value).toEqual(2)
        expect(tile1.merged_to).toEqual(undefined)
        expect(merged_board.get(tile1_coordinates)).toEqual([tile1])
        expect(merged_board.get(tile2_coordinates)).toEqual([tile2])
        expect(merged_board.get(tile3_coordinates)).toEqual([tile3])
    })


    it('merges a 3D board up correctly', () => {
        // merging up will actually be direction -1, down will be 1, to get desired merge behavior
        // (first in merge direction merges first) means we want things to merge from move dir back

        // reset these tiles from the last test
        let tile0 = BoardUtil.createTile({value: 2, id: 0})
        let tile7 = BoardUtil.createTile({value: 2, id: 7})
        let direction = {x: 0, y: 0, z:-1}
        kv_pairs[0] = [tile0_coordinates, tile0]
        kv_pairs[7] = [tile7_coordinates, tile7]
        let board_map = new BoardMap(kv_pairs)

        let {merged_board, new_points} = BoardUtil.mergeBoard(board_map, board_dimensions, direction, tokens)
        // this one should have been transitioned
        expect(tile7.value).toEqual(2)
        expect(tile7.merged_to).toEqual(4)
        expect(new_points).toEqual(4)
        expect(merged_board.get({x:0, y:0, z:3})).toEqual([tile7, tile0])
        expect(merged_board.get({x:0, y:1, z:3})).toEqual([tile1])
        expect(merged_board.get({x:1, y:0, z:3})).toEqual([tile4])
        expect(merged_board.get({x:1, y:1, z:3})).toEqual(undefined)
    })
})