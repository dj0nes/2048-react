import React from 'react'
import Game, {Token} from './Game'
import * as boardUtil from '../board_util'

const tokens = boardUtil.generate2048Tokens() as Token[]
// const tokens = boardUtil.generateHireMeTokens() as Token[]

const App = () => <Game tokens={tokens} boardDimensions={{x: 3, y: 3, z: 3}} />

export default App
