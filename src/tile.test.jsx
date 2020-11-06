import React from 'react'
import ReactDOM from 'react-dom'
import Tile from './components/Tile'

it('renders without crashing', () => {
    const div = document.createElement('div')
    const coordinates = {x:0, y:0}
    ReactDOM.render(<Tile coordinates={coordinates} value={2}/>, div)
    ReactDOM.unmountComponentAtNode(div)
})
