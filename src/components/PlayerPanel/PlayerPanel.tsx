import type { Player } from '../../types/game'
import './PlayerPanel.css'

interface PlayerPanelProps {
  players: Player[]
  currentPlayerIndex: number
  totalLaps: number
}

function PlayerCard({
  player,
  index,
  currentPlayerIndex,
  totalLaps,
}: {
  player: Player
  index: number
  currentPlayerIndex: number
  totalLaps: number
}) {
  return (
    <div
      className={`player-card ${index === currentPlayerIndex ? 'player-card--active' : ''}`}
    >
      <div className="player-card__header">
        <span
          className="player-card__token"
          style={{ backgroundColor: player.color }}
        />
        <span className="player-card__name">{player.name}</span>
        {index === currentPlayerIndex && (
          <span className="player-card__turn">턴</span>
        )}
      </div>
      <div className="player-card__stats">
        <span className="player-card__laps">
          {player.lapCount}/{totalLaps}바퀴
        </span>
        <span className="player-card__drinks">🍺 {player.drinkCount}잔</span>
      </div>
    </div>
  )
}

export function PlayerPanel({ players, currentPlayerIndex, totalLaps }: PlayerPanelProps) {
  const useSplitLayout = players.length >= 5
  const leftCount = Math.ceil(players.length / 2)

  if (!useSplitLayout) {
    return (
      <div className="player-panel">
        {players.map((player, index) => (
          <PlayerCard
            key={player.id}
            player={player}
            index={index}
            currentPlayerIndex={currentPlayerIndex}
            totalLaps={totalLaps}
          />
        ))}
      </div>
    )
  }

  const leftPlayers = players.slice(0, leftCount)
  const rightPlayers = players.slice(leftCount)

  return (
    <div className="player-panel player-panel--split">
      <div className="player-panel__column">
        {leftPlayers.map((player, columnIndex) => (
          <PlayerCard
            key={player.id}
            player={player}
            index={columnIndex}
            currentPlayerIndex={currentPlayerIndex}
            totalLaps={totalLaps}
          />
        ))}
      </div>
      <div className="player-panel__column">
        {rightPlayers.map((player, columnIndex) => (
          <PlayerCard
            key={player.id}
            player={player}
            index={leftCount + columnIndex}
            currentPlayerIndex={currentPlayerIndex}
            totalLaps={totalLaps}
          />
        ))}
      </div>
    </div>
  )
}
