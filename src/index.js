import React from 'react'
import ReactDOM from 'react-dom'
import './index.css'
import './2D.css'
import './3D.css'
import Game from './components/game'
import registerServiceWorker from './registerServiceWorker'

ReactDOM.render(<Game />, document.getElementById('root'))
registerServiceWorker()
