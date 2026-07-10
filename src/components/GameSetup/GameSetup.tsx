import { useState } from 'react'
import {
  defaultPlayerNames,
  MAX_LAPS,
  MAX_PLAYERS,
  MIN_PLAYERS,
  PLAYER_COLORS,
} from '../../data/players'
import type { GameConfig } from '../../types/game'
import './GameSetup.css'

interface GameSetupProps {
  onStart: (config: GameConfig) => void
}

export function GameSetup({ onStart }: GameSetupProps) {
  const [totalLaps, setTotalLaps] = useState(1)
  const [playerNames, setPlayerNames] = useState(() => defaultPlayerNames(4))

  const changePlayerCount = (delta: number) => {
    setPlayerNames((prev) => {
      const nextCount = prev.length + delta
      if (nextCount < MIN_PLAYERS || nextCount > MAX_PLAYERS) return prev

      if (delta > 0) {
        return [...prev, `플레이어 ${nextCount}`]
      }

      return prev.slice(0, -1)
    })
  }

  const updateName = (index: number, name: string) => {
    setPlayerNames((prev) => prev.map((value, i) => (i === index ? name : value)))
  }

  const handleStart = () => {
    onStart({
      totalLaps,
      players: playerNames.map((name) => ({ name })),
    })
  }

  return (
    <div className="game-setup">
      <div className="game-setup__card">
        <header className="game-setup__header">
          <h1 className="game-setup__title">주루마블 🍻</h1>
          <p className="game-setup__subtitle">게임 설정 후 시작하세요</p>
        </header>

        <section className="game-setup__section">
          <label className="game-setup__label" htmlFor="lap-select">
            완주 바퀴 수
          </label>
          <select
            id="lap-select"
            className="game-setup__select"
            value={totalLaps}
            onChange={(e) => setTotalLaps(Number(e.target.value))}
          >
            {Array.from({ length: MAX_LAPS }, (_, i) => i + 1).map((laps) => (
              <option key={laps} value={laps}>
                {laps}바퀴
              </option>
            ))}
          </select>
        </section>

        <section className="game-setup__section game-setup__section--players">
          <div className="game-setup__row">
            <span className="game-setup__label">플레이어 수</span>
            <div className="game-setup__counter">
              <button
                type="button"
                className="game-setup__counter-btn"
                onClick={() => changePlayerCount(-1)}
                disabled={playerNames.length <= MIN_PLAYERS}
                aria-label="플레이어 수 줄이기"
              >
                −
              </button>
              <span className="game-setup__counter-value">{playerNames.length}명</span>
              <button
                type="button"
                className="game-setup__counter-btn"
                onClick={() => changePlayerCount(1)}
                disabled={playerNames.length >= MAX_PLAYERS}
                aria-label="플레이어 수 늘리기"
              >
                +
              </button>
            </div>
          </div>

          <ul className="game-setup__players">
            {playerNames.map((name, index) => (
              <li key={index} className="game-setup__player">
                <span
                  className="game-setup__player-token"
                  style={{ backgroundColor: PLAYER_COLORS[index] }}
                />
                <input
                  type="text"
                  className="game-setup__input"
                  value={name}
                  onChange={(e) => updateName(index, e.target.value)}
                  placeholder={`플레이어 ${index + 1}`}
                  maxLength={12}
                  aria-label={`플레이어 ${index + 1} 이름`}
                />
              </li>
            ))}
          </ul>
        </section>

        <button type="button" className="game-setup__start" onClick={handleStart}>
          게임 시작
        </button>
      </div>
    </div>
  )
}
