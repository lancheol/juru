import { useState } from 'react'
import { ErrorBoundary } from './components/ErrorBoundary'
import { Game } from './components/Game/Game'
import { GameSetup } from './components/GameSetup/GameSetup'
import type { GameConfig } from './types/game'
import './App.css'

function App() {
  const [gameConfig, setGameConfig] = useState<GameConfig | null>(null)

  return (
    <ErrorBoundary>
      {gameConfig ? (
        <Game config={gameConfig} onBackToSetup={() => setGameConfig(null)} />
      ) : (
        <GameSetup onStart={setGameConfig} />
      )}
    </ErrorBoundary>
  )
}

export default App
