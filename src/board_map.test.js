import boardMap from './board_map'
import * as BoardUtil from './board_util'


it('creates a new empty board_map', () => {
    let board_map = new boardMap()
    expect(typeof board_map).toBe('object')
    expect(board_map instanceof boardMap).toBe(true)
})

it('stringifies keys', () => {
    let tile0_coordinates = {x:0, y:0}
    let tile1_coordinates = {x:0, y:1}
    let board_map = new boardMap()

    expect(board_map.stringify(tile0_coordinates)).toBe('[{"x":0},{"y":0}]')
    expect(board_map.stringify(tile1_coordinates)).toBe('[{"x":0},{"y":1}]')

    // order shouldn't matter, object keys are unordered anyway, so this is just a smoke test
    let tile0_alias = {y:0, x:0}
    let tile1_alias = {y:1, x:0}
    expect(board_map.stringify(tile0_alias)).toBe('[{"x":0},{"y":0}]')
    expect(board_map.stringify(tile1_alias)).toBe('[{"x":0},{"y":1}]')
})

it('unStringifies keys', () => {
    let tile0_coordinates = {x:0, y:0}
    let tile1_coordinates = {x:0, y:1}
    let board_map = new boardMap()

    let stringified0 = board_map.stringify(tile0_coordinates)
    let stringified1 = board_map.stringify(tile1_coordinates)

    expect(stringified0).toBe('[{"x":0},{"y":0}]')
    expect(stringified1).toBe('[{"x":0},{"y":1}]')

    let unStringified0 = board_map.unStringify((stringified0))
    let unStringified1 = board_map.unStringify((stringified1))

    expect(unStringified0).toEqual([{x: 0}, {y: 0}])
    expect(unStringified1).toEqual([{x: 0}, {y: 1}])
})

it('getCoordinatesFromKey keys', () => {
    let tile0_coordinates = {x:0, y:0}
    let tile1_coordinates = {x:0, y:1}
    let board_map = new boardMap()

    let stringified0 = board_map.stringify(tile0_coordinates)
    let stringified1 = board_map.stringify(tile1_coordinates)

    expect(stringified0).toBe('[{"x":0},{"y":0}]')
    expect(stringified1).toBe('[{"x":0},{"y":1}]')

    let getCoordinatesFromKey0 = board_map.getCoordinatesFromKey((stringified0))
    let getCoordinatesFromKey1 = board_map.getCoordinatesFromKey((stringified1))

    expect(getCoordinatesFromKey0).toEqual(tile0_coordinates)
    expect(getCoordinatesFromKey1).toEqual(tile1_coordinates)
})

describe('BoardMap has these properties:', () => {
    let tile0_coordinates = {x:0, y:0}
    let tile1_coordinates = {x:0, y:1}
    let tile0 = BoardUtil.createTile({value: 2, location: {x:0, y:0}, id: 0})
    let tile1 = BoardUtil.createTile({value: 2, location: {x:0, y:1}, id: 1})
    let kv_pairs = [
        {coordinates: tile0_coordinates, tiles: tile0},
        {coordinates: tile1_coordinates, tiles: tile1}
    ]
    let board_map = new boardMap(kv_pairs)

    describe('tiles_to_string', () => {
        it('stringifies tiles array with one member', () => {
            let result = board_map.tiles_to_string([tile0])
            // this is totally arbitrary
            let expected_result = '[{id: 0, location: [object Object], value: 2}]'
            expect(result).toEqual(expected_result)
        })

        it('stringifies tiles array with more than one member', () => {
            let result = board_map.tiles_to_string([tile0, tile1])
            let expected_result = '[{id: 0, location: [object Object], value: 2}, {id: 1, location: [object Object], value: 2}]'
            expect(result).toEqual(expected_result)
        })

        it('stringifies tiles array with more than one member on given properties', () => {
            let result = board_map.tiles_to_string([tile0, tile1], ['id', 'value'])
            let expected_result = '[{id: 0, value: 2}, {id: 1, value: 2}]'
            expect(result).toEqual(expected_result)
        })

        it('stringifies tiles array with more than one member on given properties, excluding those with certain keys', () => {
            let tile2 = BoardUtil.createTile({value: 2, id: 2, remove: true})
            let result = board_map.tiles_to_string([tile0, tile1, tile2], ['id', 'value'], ['remove'])
            let expected_result = '[{id: 0, value: 2}, {id: 1, value: 2}]'
            expect(result).toEqual(expected_result)
        })
    })

    describe('equals', () => {
        it('checks for equality on given properties', () => {
            let kv_pairs = [
                {coordinates: tile0_coordinates, tiles: [tile0, tile1]}
            ]
            let result_true2 = board_map.equals(board_map)
            expect(result_true2).toBe(true)
            let board_map2 = new boardMap(kv_pairs)
            let result = board_map.equals(board_map2, ['id', 'value'])
            expect(result).toBe(false)
            let result_true = board_map.equals(board_map, ['id', 'value'])
            expect(result_true).toBe(true)
        })

        it('checks for equality on given properties, irrespective of key order', () => {
            let coordinates1 = {
                '[{"x":0},{"y":0}]': [
                    {
                        'id': 0,
                        'value': 4
                    }
                ],
                '[{"x":0},{"y":2}]': [
                    {
                        'id': 2,
                        'value': 16
                    }
                ]
            }

            let coordinates2 = {
                '[{"x":0},{"y":0}]': [
                    {
                        'value': 4,
                        'id': 0
                    }
                ],
                '[{"x":0},{"y":2}]': [
                    {
                        'value': 16,
                        'id': 2
                    }
                ]
            }

            let board_map1 = new boardMap([], coordinates1)
            let board_map2 = new boardMap([], coordinates2)

            let result_true = board_map1.equals(board_map2)
            expect(result_true).toBe(true)
        })

        it('does not consider tiles marked for removal when comparing equality', () => {
            let coordinates1 = {
                '[{"x":0},{"y":0}]': [
                    {
                        'id': 0,
                        'value': 4
                    }
                ],
                '[{"x":0},{"y":2}]': [
                    {
                        'id': 2,
                        'value': 2,
                        'remove': true
                    }
                ]
            }

            let coordinates2 = {
                '[{"x":0},{"y":0}]': [
                    {
                        'value': 4,
                        'id': 0
                    }
                ]
            }

            let board_map1 = new boardMap([], coordinates1)
            let board_map2 = new boardMap([], coordinates2)

            let result_true = board_map1.equals(board_map2)
            expect(result_true).toBe(true)
        })

        it('does not consider merging tiles when comparing equality', () => {
            let coordinates1 = {
                '[{"x":0},{"y":0},{"z":1}]': [
                    {id: 2, merged_from: 2, merged_to: 4, value: 2},
                    {id: 8, remove: true, value: 2}
                ]
            }

            let coordinates2 = {
                '[{"x":0},{"y":0},{"z":1}]': [
                    {id: 2, value: 4}
                ]
            }

            let board_map1 = new boardMap([], coordinates1)
            let board_map2 = new boardMap([], coordinates2)

            let result_true = board_map1.equals(board_map2)
            expect(result_true).toBe(true)
        })
    })


    it('stringifies itself', () => {
        let result = board_map.toString()
        // this is totally arbitrary
        let expected_result = '[[{"x":0},{"y":0}]: [{id: 0, location: [object Object], value: 2}]], [[{"x":0},{"y":1}]: [{id: 1, location: [object Object], value: 2}]]'
        expect(result).toEqual(expected_result)
    })

    it('BoardMap construction with values passes basic sanity checks', () => {
        expect(typeof board_map).toBe('object')
        expect(board_map instanceof boardMap).toBe(true)
    })

    it('.get() returns the array of tiles at the given location', () => {
        expect(board_map.get(tile0_coordinates)).toEqual([tile0])
        expect(board_map.get(tile1_coordinates)).toEqual([tile1])

        // order shouldn't matter, object keys are unordered anyway, so this is just a smoke test
        let tile0_alias = {y:0, x:0}
        let tile1_alias = {y:1, x:0}
        expect(board_map.get(tile0_alias)).toEqual([tile0])
        expect(board_map.get(tile1_alias)).toEqual([tile1])
    })

    it('.set() adds a tile to an empty given location', () => {
        let board_map = new boardMap()
        board_map.set(tile0_coordinates, tile0)
        board_map.set(tile1_coordinates, tile1)
        let tile0_test = board_map.get(tile0_coordinates)
        let tile1_test = board_map.get(tile1_coordinates)
        expect(tile0_test).toEqual([tile0])
        expect(tile1_test).toEqual([tile1])
    })

    it('.set() adds a tile to an occupied given location', () => {
        let board_map = new boardMap()
        board_map.set(tile0_coordinates, tile0)
        board_map.set(tile1_coordinates, tile1)

        // the new one at same location as tile1
        let tile2 = BoardUtil.createTile({value: 2, location: {x:0, y:1}, id: 2})
        board_map.set(tile1_coordinates, tile2)

        let tile0_test = board_map.get(tile0_coordinates)
        let tile1_test = board_map.get(tile1_coordinates)
        expect(tile0_test).toEqual([tile0])
        expect(tile1_test).toEqual([tile1, tile2])
    })

    it('.set() updates a tile to an occupied given location with same id', () => {
        let board_map = new boardMap()
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
    })
})







