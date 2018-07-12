import React from 'react';
import ReactDOM from 'react-dom';
import Tile from './components/tile';

it('renders without crashing', () => {
    const div = document.createElement('div');
    const coordinates = {x:0, y:0}
    ReactDOM.render(<Tile coordinates={coordinates}/>, div);
    ReactDOM.unmountComponentAtNode(div);
});
