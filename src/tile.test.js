import React from 'react';
import ReactDOM from 'react-dom';
import Tile from './components/tile';

it('renders without crashing', () => {
  const div = document.createElement('div');
  ReactDOM.render(<Tile />, div);
  ReactDOM.unmountComponentAtNode(div);
});
