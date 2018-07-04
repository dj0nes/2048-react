import util from './util';
const board_size = 4
const tokens = [2, 4, 8, 16, 32, 64, 128, 256, 512, 1024, 2048]
const transitions = [4, 8, 16, 32, 64, 128, 256, 512, 1024, 2048]


it('creates a tile', () => {
    const tile = util.createTile(1, 2, 3, 4);
    expect(tile.id).toBe(1);
    expect(tile.value).toBe(2);
    expect(tile.x).toBe(3);
    expect(tile.y).toBe(4);
});


it('creates a board of given size', () => {
    const board = util.createBoard(board_size);
    expect(board.length).toBe(board_size * board_size);
    let all_zero_valued = board.map(tile => tile.value === 0)
    expect(all_zero_valued.every(el => el === true)).toBe(true);
});


it('creates a board of given size with predetermined values', () => {
    let board_length = board_size * board_size
    let values = Array.from(Array(board_length).keys())  // [0, 1, 2, 3, ..., board_length]
    const board = util.createBoard(board_size, values);
    expect(board.length).toBe(board_length);
    let correctly_valued = board.map((tile, index) => tile.value === values[index])
    expect(correctly_valued.every(el => el === true)).toBe(true);
});


it('shuffles at least 30% of the pieces to new locations', () => {
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


it('gets the desired row', () => {
    const board = util.createBoard(board_size);
    for(let i = 0; i < board_size; i++) {
        let row = util.getRow(board, i)
        let all_same = row.every(el => el.y === i)
        expect(all_same).toBe(true);
    }
});


it('gets the desired column', () => {
    const board = util.createBoard(board_size);
    for(let i = 0; i < board_size; i++) {
        let col = util.getColumn(board, i)
        let all_same = col.every(el => el.x === i)
        expect(all_same).toBe(true);
    }
});


it('transitions tiles to next higher value', () => {
    for(let i = 0; i < tokens.length; i++) {
        let tile = util.createTile(0, tokens[i], 0, 0)
        let transitioned_tile = util.transition(tokens, transitions, tile)
        expect(transitioned_tile.value).toBe(transitions[i]);
        // prove that transitioned_tile is a new object, but has same props
        tile.x = 1
        expect(transitioned_tile.x).toBe(0)
        expect(transitioned_tile.y).toBe(0)
        expect(transitioned_tile.id).toBe(0)
    }
})


it('transitions an array of [0, 0, 0, 0] to [0, 0, 0, 0]', () =>  {
    let tiles = util.createBoard(2)
    let {transitioned, points} = util.transitionArray(tokens, transitions, tiles)
    expect(transitioned.length).toBe(4)
    expect(points).toBe(0)
    // prove the transitioned array is a new array
    tiles.pop()
    expect(tiles.length).toBe(3)
    expect(transitioned.length).toBe(4)
})


it('transitions an array of [2, 0, 0, 0] to [2, 0, 0, 0]', () =>  {
    let tiles = util.createBoard(2)
    let {transitioned, points} = util.transitionArray(tokens, transitions, tiles)
    expect(transitioned.length).toBe(4)
    expect(points).toBe(0)
    expect(transitioned[0].value).toBe(2)

    // prove the transitioned array is a new array
    tiles.pop()
    expect(tiles.length).toBe(3)
    expect(transitioned.length).toBe(4)
})


// it('transitions an array of [2, 2, 0, 0] to [4, 0, 0, 0]', () =>  {
//     let tiles = util.createBoard(2, [2, 2, 0, 0])
// })
