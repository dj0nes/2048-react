import React from 'react'
import Game, {Token} from './Game'
import {generate2048Tokens, generateHireMeTokens} from '../board_util'

const tokens = generate2048Tokens() as Token[]
// const tokens = generateHireMeTokens() as Token[]

const App = () => <Game tokens={tokens} boardDimensions={{x: 3, y: 3, z: 3}} />

export default App
