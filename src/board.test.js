import React from 'react';
import ReactDOM from 'react-dom';
import Board from './components/board';

it('renders without crashing', () => {
  const div = document.createElement('div');
  ReactDOM.render(<Board board_dimensions={{x:3, y:3, z:3}}/>, div);
  ReactDOM.unmountComponentAtNode(div);
});


it('creates tiles with generated ids and optional values', () => {
    let tile0 = Board.createTile({value: 0, location: {x:0, y:0}})
    let tile1 = Board.createTile({value: 0, location: {x:0, y:1}})
    let tile2 = Board.createTile({value: 0, location: {x:1, y:1}, id: 99})
    expect(tile0.id).toBe(0);
    expect(tile1.id).toBe(1);
    expect(tile2.id).toBe(99);
    expect(tile0.location).toEqual({x:0, y:0});
    expect(tile1.location).toEqual({x:0, y:1});
    expect(tile2.location).toEqual({x:1, y:1});
});


it('creates a board with preset values', () => {
    let kv_pairs = [
        [{x:0, y:0}, Board.createTile({value: 0, location: {x:0, y:0}, id: 0})],
        [{x:0, y:1}, Board.createTile({value: 0, location: {x:0, y:1}, id: 1})]
    ]
    let b = new Board({board_dimensions:{x:3, y:3, z:3}, kv_pairs})
    expect(b.state.board instanceof Map).toBe(true);
    let maparr = [...b.state.board]
    let first_pair = maparr[0]
    let second_pair = maparr[1]
    expect(first_pair[0]).toEqual(kv_pairs[0][0]);
    expect(first_pair[1]).toEqual(kv_pairs[0][1]);
    expect(second_pair[0]).toEqual(kv_pairs[1][0]);
    expect(second_pair[1]).toEqual(kv_pairs[1][1]);
});


it('get all coordinates for 1 dimension', () => {
    let b = new Board({board_dimensions:{x:3, y:3, z:3}})
    let {all_locations, all_coordinates} = b.getAllCoordinates({x:3})
    expect(all_locations instanceof Array).toBe(true);
    expect(all_locations).toEqual([
        [{x:0}, {x:1}, {x:2}]
    ]);
    expect(all_coordinates).toEqual([{x:0}, {x:1}, {x:2}]);
});


it('get all coordinates for 2 dimensions', () => {
    let b = new Board({board_dimensions:{x:3, y:3, z:3}})
    let {all_locations, all_coordinates} = b.getAllCoordinates({x:3, z:3})
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

it('get all coordinates for 3 dimensions', () => {
    let dimension_size = 3
    let dimensions = {x:dimension_size, y:dimension_size, z:dimension_size}
    let b = new Board({board_dimensions:dimensions})
    let {all_locations, all_coordinates} = b.getAllCoordinates(dimensions)
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

it('get all coordinates for 4 dimensions', () => {
    let dimension_size = 3
    let dimensions = {x:dimension_size, y:dimension_size, z:dimension_size, t:dimension_size}
    let b = new Board({board_dimensions:dimensions})
    let {all_locations, all_coordinates} = b.getAllCoordinates(dimensions)
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


it('asdasd', () => {
    // given a board, a direction, and a location, it should generate the sequence at that location
    // in the correct order

    // let dimension_size = 3
    // let dimensions = {x:dimension_size, y:dimension_size, z:dimension_size, t:dimension_size}
    // let b = new Board({board_dimensions: dimensions, kv_pairs: []})
    // for(let t of [...Array(dimension_size).keys()]) {
    //     all_coordinates_answer.push({x, y, z, t})
    // }
    //
    // let {all_locations, all_coordinates} = b.getAllCoordinates({x:3})
    // expect(all_locations instanceof Array).toBe(true);
    // expect(all_locations).toEqual([
    //     [{x:0}, {x:1}, {x:2}]
    // ]);
    // expect(all_coordinates).toEqual([{x:0}, {x:1}, {x:2}]);
});