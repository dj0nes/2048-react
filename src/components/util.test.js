import util from './util';
const board_size = 4
const tokens = [2, 4, 8, 16, 32, 64, 128, 256, 512, 1024, 2048]
const transitions = [4, 8, 16, 32, 64, 128, 256, 512, 1024, 2048]


it('creates tiles with different ids', () => {
    let location = [0,0]
    const tile = util.createTile({value: 2, location: location});
    expect(tile.id).toBe(0);
    expect(tile.value).toBe(2);
    expect(tile.location).toEqual(location);

    let location2 = [0,1]
    const tile2 = util.createTile({value: 2, location: location2});
    expect(tile2.id).toBe(1);
    expect(tile2.value).toBe(2);
    expect(tile2.location).toEqual(location2);
});


it('creates a board', () => {
    let size = 4
    const board = util.createBoard(size);
    expect(board instanceof Map).toBe(true);
    expect(board.get('size')).toBe(size);
});


it('creates a board of given size with predetermined values', () => {
    let size = 4
    let tile0 = util.createTile({id: 0, value: 2, location: [0,0]})
    let el0 = [tile0.location, {id: tile0.id, value: tile0.value}]
    let el1 = [[0,1], {id: 1, value: 2}]
    let el2 = [[1,0], {id: 2, value: 2}]
    let el3 = [[1,1], {id: 3, value: 2}]
    let values = [el0, el1, el2, el3]
    const board = util.createBoard(size, values);
    expect(board instanceof Map).toBe(true);
    expect(board.get('size')).toBe(size);
    expect(board.get(el0[0])).toBe(el0[1]);
    expect(board.get(tile0.location).id).toBe(0);
    expect(board.get(el1[0])).toBe(el1[1]);
    expect(board.get(el3[0])).toBe(el3[1]);
    expect(board.get([4,4])).toBe(undefined);
});


it('shuffles at least 30% of the pieces to new locations', () => {
    const values = []
    const board = util.createBoard(board_size);
    const shuffled = util.shuffle((board))
    const in_same_location = shuffled.map((el, index) => {
        let x_same = el.x === board[index].x
        let y_same = el.y === board[index].y
        return x_same && y_same
    })
    const total_same = in_same_location.reduce((accum, el) => accum + el)
    expect(total_same / board.length).toBeLessThan(.3);
});

//
// it('gets the desired row', () => {
//     const board = util.createBoard(board_size);
//     for(let i = 0; i < board_size; i++) {
//         let row = util.getRow(board, i)
//         let all_same = row.every(el => el.y === i)
//         expect(all_same).toBe(true);
//     }
// });
//
//
// it('gets the desired column', () => {
//     const board = util.createBoard(board_size);
//     for(let i = 0; i < board_size; i++) {
//         let col = util.getColumn(board, i)
//         let all_same = col.every(el => el.x === i)
//         expect(all_same).toBe(true);
//     }
// });
//
//
// it('transitions tiles to next higher value', () => {
//     for(let i = 0; i < tokens.length; i++) {
//         let tile = util.createTile(0, tokens[i], 0, 0)
//         let transitioned_tile = util.transition(tokens, transitions, tile)
//         expect(transitioned_tile.value).toBe(transitions[i]);
//         // prove that transitioned_tile is a new object, but has same props
//         tile.x = 1
//         expect(transitioned_tile.x).toBe(0)
//         expect(transitioned_tile.y).toBe(0)
//         expect(transitioned_tile.id).toBe(0)
//     }
// })
//
//
// it('transitions a row array of [0, 0, 0, 0] to [0, 0, 0, 0]', () =>  {
//     let board = util.createBoard(4)
//     let tiles = util.getRow(board, 0)  // [0, 0, 0, 0]
//     let {transitioned, points} = util.transitionArray(tokens, transitions, tiles, 'x')
//     expect(transitioned.length).toBe(4)
//     expect(points).toBe(0)
//     expect(transitioned.every(tile => tile.value === 0)).toBe(true)
//     // prove the transitioned array is a new array
//     tiles.pop()
//     expect(tiles.length).toBe(3)
//     expect(transitioned.length).toBe(4)
// })
//
//
// it('transitions a column array of [0, 0, 0, 0] to [0, 0, 0, 0]', () =>  {
//     let board = util.createBoard(4)
//     let tiles = util.getColumn(board, 0)  // [0, 0, 0, 0]
//     let {transitioned, points} = util.transitionArray(tokens, transitions, tiles, 'x')
//     expect(transitioned.length).toBe(4)
//     expect(points).toBe(0)
//     expect(transitioned.every(tile => tile.value === 0)).toBe(true)
//     // prove the transitioned array is a new array
//     tiles.pop()
//     expect(tiles.length).toBe(3)
//     expect(transitioned.length).toBe(4)
// })
//
//
// it('transitions a row array of [2, 0, 0, 0] to [2, 0, 0, 0]', () =>  {
//     let board = util.createBoard(4, [2])
//     let tiles = util.getRow(board, 0)  // [2, 0, 0, 0]
//     let {transitioned, points} = util.transitionArray(tokens, transitions, tiles, 'x')
//     expect(transitioned.length).toBe(4)
//     expect(points).toBe(0)
//     let first = transitioned[0]
//     expect(first.value).toBe(2)
//     expect(first.x).toBe(0)
//     expect(first.y).toBe(0)
//     expect(transitioned.slice(1).every(tile => tile.value === 0)).toBe(true)
//     // prove the transitioned array is a new array
//     tiles.pop()
//     expect(tiles.length).toBe(3)
//     expect(transitioned.length).toBe(4)
// })
//
//
// it('transitions a row array of [0, 0, 0, 2] to [2, 0, 0, 0]', () =>  {
//     let board = util.createBoard(4, [0, 0, 0, 2])
//     let tiles = util.getRow(board, 0)  // [0, 0, 0, 2]
//     let {transitioned, points} = util.transitionArray(tokens, transitions, tiles, 'x')
//     expect(transitioned.length).toBe(4)
//     expect(points).toBe(0)
//     let last = transitioned.find(tile => tile.id === 3)
//     expect(last.value).toBe(2)
//     expect(last.x).toBe(0)  // was 3 before transition
//     expect(last.y).toBe(0)  // was 3 before transition
//     expect(last.value).toBe(2)
//     expect(transitioned.filter(tile => tile.id !== 3).every(tile => tile.value === 0)).toBe(true)
//     // prove the transitioned array is a new array
//     tiles.pop()
//     expect(tiles.length).toBe(3)
//     expect(transitioned.length).toBe(4)
// })
//
//
// it('transitions a row array of [2, 2, 0, 0] to [4, 0, 0, 0]', () =>  {
//     let board = util.createBoard(4, [2, 2, 0, 0])
//     let tiles = util.getRow(board, 0)  // [2, 2, 0, 0]
//     let {transitioned, points} = util.transitionArray(tokens, transitions, tiles, 'x')
//     expect(transitioned.length).toBe(4)
//     expect(points).toBe(4)
//     let first = transitioned.find(tile => tile.x === 0)
//     expect(first.value).toBe(4)
//     expect(first.x).toBe(0)  // was 3 before transition
//     expect(first.y).toBe(0)  // was 3 before transition
//     let second = transitioned.find(tile => tile.x === 1)
//     expect(second.value).toBe(0)
//     expect(transitioned.filter(tile => tile.id !== 0 && tile.id !== 1).every(tile => tile.value === 0)).toBe(true)
//     // prove the transitioned array is a new array
//     tiles.pop()
//     expect(tiles.length).toBe(3)
//     expect(transitioned.length).toBe(4)
// })
//
//
// it('transitions a column array of [2, 2, 0, 0] to [4, 0, 0, 0]', () =>  {
//     let board = util.createBoard(4, [2, 0, 0, 0, 2])
//     let tiles = util.getColumn(board, 0)  // [2, 2, 0, 0]
//     let {transitioned, points} = util.transitionArray(tokens, transitions, tiles, 'y')
//     expect(transitioned.length).toBe(4)
//     expect(points).toBe(4)
//     let first = transitioned.find(tile => tile.y === 0)
//     expect(first.value).toBe(4)
//     expect(first.x).toBe(0)  // was 3 before transition
//     expect(first.y).toBe(0)  // was 3 before transition
//     let second = transitioned.find(tile => tile.y === 1)
//     expect(second.value).toBe(0)
//     expect(transitioned.filter(tile => tile.y !== 0 && tile.y !== 1).every(tile => tile.value === 0)).toBe(true)
//     // prove the transitioned array is a new array
//     tiles.pop()
//     expect(tiles.length).toBe(3)
//     expect(transitioned.length).toBe(4)
// })
//
//
// it('transitions a row array of [2, 2, 2, 2] to [4, 4, 0, 0]', () =>  {
//     let board = util.createBoard(4, [2, 2, 2, 2])
//     let tiles = util.getRow(board, 0)  // [2, 2, 2, 2]
//     let {transitioned, points} = util.transitionArray(tokens, transitions, tiles, 'x')
//     expect(transitioned.length).toBe(4)
//     expect(points).toBe(8)
//     let first = transitioned.find(tile => tile.x === 0)
//     expect(first.value).toBe(4)
//     expect(first.x).toBe(0)  // was 3 before transition
//     expect(first.y).toBe(0)  // was 3 before transition
//     let second = transitioned.find(tile => tile.x === 1)
//     expect(second.value).toBe(4)
//     expect(transitioned.filter(tile => tile.x !== 0 && tile.x !== 1).every(tile => tile.value === 0)).toBe(true)
//     // prove the transitioned array is a new array
//     tiles.pop()
//     expect(tiles.length).toBe(3)
//     expect(transitioned.length).toBe(4)
// })
//
//
// it('transitions a column array of [2, 2, 2, 2] to [4, 4, 0, 0]', () =>  {
//     let board = util.createBoard(4, [2, 2, 2, 2])
//     let tiles = util.getRow(board, 0)  // [2, 2, 2, 2]
//     let {transitioned, points} = util.transitionArray(tokens, transitions, tiles, 'x')
//     expect(transitioned.length).toBe(4)
//     expect(points).toBe(8)
//     let first = transitioned.find(tile => tile.x === 0)
//     expect(first.value).toBe(4)
//     expect(first.x).toBe(0)  // was 3 before transition
//     expect(first.y).toBe(0)  // was 3 before transition
//     let second = transitioned.find(tile => tile.x === 1)
//     expect(second.value).toBe(4)
//     expect(transitioned.filter(tile => tile.x !== 0 && tile.x !== 1).every(tile => tile.value === 0)).toBe(true)
//     // prove the transitioned array is a new array
//     tiles.pop()
//     expect(tiles.length).toBe(3)
//     expect(transitioned.length).toBe(4)
// })
