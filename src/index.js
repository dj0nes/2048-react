import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import Game from './components/game';
import registerServiceWorker from './registerServiceWorker';

ReactDOM.render(<Game board_size={16} />, document.getElementById('root'));
registerServiceWorker();
