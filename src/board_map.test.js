import BoardMap from './board_map';
import * as BoardUtil from './board_util';


it('creates a new empty board_map', () => {
    let board_map = new BoardMap()
    expect(typeof board_map).toBe('object');
    expect(board_map instanceof BoardMap).toBe(true);
});

it('stringifies keys', () => {
    let tile0_coordinates = {x:0, y:0}
    let tile1_coordinates = {x:0, y:1}
    let board_map = new BoardMap()

    expect(board_map.stringify(tile0_coordinates)).toBe('[{"x":0},{"y":0}]')
    expect(board_map.stringify(tile1_coordinates)).toBe('[{"x":0},{"y":1}]')

    // order shouldn't matter, object keys are unordered anyway, so this is just a smoke test
    let tile0_alias = {y:0, x:0}
    let tile1_alias = {y:1, x:0}
    expect(board_map.stringify(tile0_alias)).toBe('[{"x":0},{"y":0}]')
    expect(board_map.stringify(tile1_alias)).toBe('[{"x":0},{"y":1}]')
});

it('unStringifies keys', () => {
    let tile0_coordinates = {x:0, y:0}
    let tile1_coordinates = {x:0, y:1}
    let board_map = new BoardMap()

    let stringified0 = board_map.stringify(tile0_coordinates)
    let stringified1 = board_map.stringify(tile1_coordinates)

    expect(stringified0).toBe('[{"x":0},{"y":0}]')
    expect(stringified1).toBe('[{"x":0},{"y":1}]')

    let unStringified0 = board_map.unStringify((stringified0))
    let unStringified1 = board_map.unStringify((stringified1))

    expect(unStringified0).toEqual([{"x": 0}, {"y": 0}])
    expect(unStringified1).toEqual([{"x": 0}, {"y": 1}])
});

it('getCoordinatesFromKey keys', () => {
    let tile0_coordinates = {x:0, y:0}
    let tile1_coordinates = {x:0, y:1}
    let board_map = new BoardMap()

    let stringified0 = board_map.stringify(tile0_coordinates)
    let stringified1 = board_map.stringify(tile1_coordinates)

    expect(stringified0).toBe('[{"x":0},{"y":0}]')
    expect(stringified1).toBe('[{"x":0},{"y":1}]')

    let getCoordinatesFromKey0 = board_map.getCoordinatesFromKey((stringified0))
    let getCoordinatesFromKey1 = board_map.getCoordinatesFromKey((stringified1))

    expect(getCoordinatesFromKey0).toEqual(tile0_coordinates)
    expect(getCoordinatesFromKey1).toEqual(tile1_coordinates)
});

describe('BoardMap has these properties:', () => {
    let tile0_coordinates = {x:0, y:0}
    let tile1_coordinates = {x:0, y:1}
    let tile0 = BoardUtil.createTile({value: 2, location: {x:0, y:0}, id: 0})
    let tile1 = BoardUtil.createTile({value: 2, location: {x:0, y:1}, id: 1})
    let kv_pairs = [
        [tile0_coordinates, tile0],
        [tile1_coordinates, tile1]
    ]
    let board_map = new BoardMap(kv_pairs)


    it('stringifies tiles array with one member', () => {
        let result = board_map.tiles_to_string([tile0])
        // this is totally arbitrary
        let expected_result = `[{id: 0, value: 2, location: [object Object]}]`
        expect(result).toEqual(expected_result)
    });

    it('stringifies tiles array with more than one member', () => {
        let result = board_map.tiles_to_string([tile0, tile1])
        let expected_result = `[{id: 0, value: 2, location: [object Object]}, {id: 1, value: 2, location: [object Object]}]`
        expect(result).toEqual(expected_result)
    });

    it('stringifies tiles array with more than one member on given properties', () => {
        let result = board_map.tiles_to_string([tile0, tile1], ['id', 'value'])
        let expected_result = `[{id: 0, value: 2}, {id: 1, value: 2}]`
        expect(result).toEqual(expected_result)
    });

    it('stringifies tiles array with more than one member on given properties, excluding those with certain keys', () => {
        let tile2 = BoardUtil.createTile({value: 2, id: 2, remove: true})
        let result = board_map.tiles_to_string([tile0, tile1, tile2], ['id', 'value'], ['remove'])
        let expected_result = `[{id: 0, value: 2}, {id: 1, value: 2}]`
        expect(result).toEqual(expected_result)
    });

    it('checks for equality on given properties', () => {
        let kv_pairs = [
            [tile0_coordinates, [tile0, tile1]]
        ]
        let result_true2 = board_map.equals(board_map)
        expect(result_true2).toBe(true)
        let board_map2 = new BoardMap(kv_pairs)
        let result = board_map.equals(board_map2, ['id', 'value'])
        expect(result).toBe(false)
        let result_true = board_map.equals(board_map, ['id', 'value'])
        expect(result_true).toBe(true)
    });

    it('stringifies itself', () => {
        let result = board_map.toString()
        // this is totally arbitrary
        let expected_result = `[[{\"x\":0},{\"y\":0}]: [{id: 0, value: 2, location: [object Object]}]], [[{\"x\":0},{\"y\":1}]: [{id: 1, value: 2, location: [object Object]}]]`
        expect(result).toEqual(expected_result)
    });

    it('BoardMap construction with values passes basic sanity checks', () => {
        expect(typeof board_map).toBe('object');
        expect(board_map instanceof BoardMap).toBe(true);
    })

    it('.get() returns the array of tiles at the given location', () => {
        expect(board_map.get(tile0_coordinates)).toEqual([tile0])
        expect(board_map.get(tile1_coordinates)).toEqual([tile1])

        // order shouldn't matter, object keys are unordered anyway, so this is just a smoke test
        let tile0_alias = {y:0, x:0}
        let tile1_alias = {y:1, x:0}
        expect(board_map.get(tile0_alias)).toEqual([tile0])
        expect(board_map.get(tile1_alias)).toEqual([tile1])
    });

    it('.set() adds a tile to an empty given location', () => {
        let board_map = new BoardMap()
        board_map.set(tile0_coordinates, tile0)
        board_map.set(tile1_coordinates, tile1)
        let tile0_test = board_map.get(tile0_coordinates)
        let tile1_test = board_map.get(tile1_coordinates)
        expect(tile0_test).toEqual([tile0])
        expect(tile1_test).toEqual([tile1])
    });

    it('.set() adds a tile to an occupied given location', () => {
        let board_map = new BoardMap()
        board_map.set(tile0_coordinates, tile0)
        board_map.set(tile1_coordinates, tile1)

        // the new one at same location as tile1
        let tile2 = BoardUtil.createTile({value: 2, location: {x:0, y:1}, id: 2})
        board_map.set(tile1_coordinates, tile2)

        let tile0_test = board_map.get(tile0_coordinates)
        let tile1_test = board_map.get(tile1_coordinates)
        expect(tile0_test).toEqual([tile0])
        expect(tile1_test).toEqual([tile1, tile2])
    });

    it('.set() updates a tile to an occupied given location with same id', () => {
        let board_map = new BoardMap()
        board_map.set(tile0_coordinates, tile0)
        board_map.set(tile1_coordinates, tile1)

        // the new one at same location as tile1
        let tile2 = BoardUtil.createTile({value: 2, location: {x:0, y:1}, id: 2})
        board_map.set(tile1_coordinates, tile2)

        let tile0_test = board_map.get(tile0_coordinates)
        let tile1_test = board_map.get(tile1_coordinates)
        expect(tile0_test).toEqual([tile0])
        expect(tile1_test).toEqual([tile1, tile2])

        let tile2_modified = BoardUtil.createTile({value: 4, location: {x:0, y:1}, id: 2})
        board_map.set(tile1_coordinates, tile2_modified)
        let tile2_test = board_map.get(tile1_coordinates)
        expect(tile2_test).toEqual([tile1, tile2_modified])
    });
})







