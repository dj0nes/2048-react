import BoardMap from './BoardMap';
import BoardUtil from './BoardUtil';


it('creates a new empty board_map', () => {
    let board_map = new BoardMap()
    expect(typeof board_map).toBe('object');
    expect(board_map instanceof BoardMap).toBe(true);
});

it('alphabetizes keys properly', () => {
    let tile0_coordinates = {x:0, y:0}
    let tile1_coordinates = {x:0, y:1}
    let board_map = new BoardMap()
    expect(board_map.stringify(tile0_coordinates)).toBe('[{x:0},{y:0}]')
    expect(board_map.stringify(tile1_coordinates)).toBe('[{x:0},{y:1}]')

    // order shouldn't matter, object keys are unordered anyway, so this is just a smoke test
    let tile0_alias = {y:0, x:0}
    let tile1_alias = {y:1, x:0}
    expect(board_map.stringify(tile0_alias)).toBe('[{x:0},{y:0}]')
    expect(board_map.stringify(tile1_alias)).toBe('[{x:0},{y:1}]')
});

describe('BoardMap has these accessors:', () => {
    let tile0_coordinates = {x:0, y:0}
    let tile1_coordinates = {x:0, y:1}
    let tile0 = BoardUtil.createTile({value: 0, location: {x:0, y:0}, id: 0})
    let tile1 = BoardUtil.createTile({value: 0, location: {x:0, y:1}, id: 1})
    let kv_pairs = [
        [tile0_coordinates, tile0],
        [tile1_coordinates, tile1]
    ]
    let board_map = new BoardMap(kv_pairs)

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







