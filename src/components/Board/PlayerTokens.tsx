import type { CSSProperties } from 'react'
import { pathIndexToGrid, pathIndexToPoint } from '../../data/board'
import { bridgeSegmentToPercent, gridToPercent } from '../../data/bridge'

function pathIndexToPercent(index: number) {
  return gridToPercent(pathIndexToPoint(index))
}
import type { Player, TokenJump } from '../../types/game'
import './PlayerTokens.css'

interface PlayerTokensProps {
  players: Player[]
  tokenJump: TokenJump | null
}

function boardPlayersAt(players: Player[], position: number, tokenJump: TokenJump | null) {
  return players.filter(
    (p) =>
      p.bridgeStatus === 'none' &&
      p.position === position &&
      !(tokenJump?.playerId === p.id),
  )
}

function bridgePlayersAt(players: Player[], segment: number, tokenJump: TokenJump | null) {
  return players.filter(
    (p) =>
      p.bridgeStatus === 'on' &&
      p.bridgeSegment === segment &&
      !(tokenJump?.playerId === p.id),
  )
}

function pendingPlayersAt(players: Player[], position: number, tokenJump: TokenJump | null) {
  return players.filter(
    (p) =>
      p.bridgeStatus === 'pending' &&
      p.position === position &&
      !(tokenJump?.playerId === p.id),
  )
}

export function PlayerTokens({ players, tokenJump }: PlayerTokensProps) {
  const boardPositions = new Set(
    players.filter((p) => p.bridgeStatus === 'none').map((p) => p.position),
  )
  const pendingPositions = new Set(
    players.filter((p) => p.bridgeStatus === 'pending').map((p) => p.position),
  )
  const bridgeSegments = new Set(
    players
      .filter((p) => p.bridgeStatus === 'on' && p.bridgeSegment !== null)
      .map((p) => p.bridgeSegment as number),
  )

  return (
    <div className="player-tokens">
      {[...boardPositions].map((position) => {
        const here = boardPlayersAt(players, position, tokenJump)
        if (here.length === 0) return null

        const { row, col } = pathIndexToGrid(position)

        return (
          <div
            key={`board-${position}`}
            className="player-tokens__cell"
            style={{ gridRow: row + 1, gridColumn: col + 1 }}
          >
            {here.map((player) => (
              <span
                key={player.id}
                className="player-token"
                style={{ backgroundColor: player.color }}
                title={player.name}
              />
            ))}
          </div>
        )
      })}

      {[...pendingPositions].map((position) => {
        const here = pendingPlayersAt(players, position, tokenJump)
        if (here.length === 0) return null

        const { row, col } = pathIndexToGrid(position)

        return (
          <div
            key={`pending-${position}`}
            className="player-tokens__cell"
            style={{ gridRow: row + 1, gridColumn: col + 1 }}
          >
            {here.map((player) => (
              <span
                key={player.id}
                className="player-token player-token--bridge-pending"
                style={{ backgroundColor: player.color }}
                title={player.name}
              />
            ))}
          </div>
        )
      })}

      {[...bridgeSegments].map((segment) => {
        const here = bridgePlayersAt(players, segment, tokenJump)
        if (here.length === 0) return null

        const { x, y } = bridgeSegmentToPercent(segment)

        return (
          <div
            key={`bridge-${segment}`}
            className="player-tokens__cell player-tokens__cell--abs"
            style={{ '--x': `${x}%`, '--y': `${y}%` } as CSSProperties}
          >
            {here.map((player) => (
              <span
                key={player.id}
                className="player-token"
                style={{ backgroundColor: player.color }}
                title={player.name}
              />
            ))}
          </div>
        )
      })}

      {tokenJump && <JumpingToken key={tokenJump.id} players={players} jump={tokenJump} />}
    </div>
  )
}

function JumpingToken({
  players,
  jump,
}: {
  players: Player[]
  jump: TokenJump
}) {
  const player = players.find((p) => p.id === jump.playerId)
  if (!player) return null

  if (jump.kind === 'bridge-exit') {
    const from = bridgeSegmentToPercent(jump.bridgeFrom ?? 0)
    const to = gridToPercent(pathIndexToGrid(jump.to))

    return (
      <div
        className="player-tokens__jump-abs"
        style={{
          '--from-x': `${from.x}%`,
          '--from-y': `${from.y}%`,
          '--to-x': `${to.x}%`,
          '--to-y': `${to.y}%`,
        } as CSSProperties}
      >
        <span
          className="player-token player-token--jumping"
          style={{ backgroundColor: player.color }}
          title={player.name}
        />
      </div>
    )
  }

  if (jump.kind === 'bridge') {
    const from =
      jump.bridgeFrom === undefined || jump.bridgeFrom < 0
        ? gridToPercent(pathIndexToGrid(jump.from))
        : bridgeSegmentToPercent(jump.bridgeFrom)
    const to =
      jump.bridgeTo === undefined
        ? gridToPercent(pathIndexToGrid(jump.to))
        : bridgeSegmentToPercent(jump.bridgeTo)

    return (
      <div
        className="player-tokens__jump-abs"
        style={{
          '--from-x': `${from.x}%`,
          '--from-y': `${from.y}%`,
          '--to-x': `${to.x}%`,
          '--to-y': `${to.y}%`,
        } as CSSProperties}
      >
        <span
          className="player-token player-token--jumping"
          style={{ backgroundColor: player.color }}
          title={player.name}
        />
      </div>
    )
  }

  const fromGrid = pathIndexToGrid(jump.from)
  const toGrid = pathIndexToGrid(jump.to)
  const sameCell =
    fromGrid.row === toGrid.row && fromGrid.col === toGrid.col

  if (sameCell) {
    const from = pathIndexToPercent(jump.from)
    const to = pathIndexToPercent(jump.to)

    return (
      <div
        className="player-tokens__jump-abs"
        style={{
          '--from-x': `${from.x}%`,
          '--from-y': `${from.y}%`,
          '--to-x': `${to.x}%`,
          '--to-y': `${to.y}%`,
        } as CSSProperties}
      >
        <span
          className="player-token player-token--jumping"
          style={{ backgroundColor: player.color }}
          title={player.name}
        />
      </div>
    )
  }

  const from = fromGrid
  const to = toGrid

  return (
    <div
      className="player-tokens__jump-cell"
      style={{
        gridRow: from.row + 1,
        gridColumn: from.col + 1,
        '--dx': to.col - from.col,
        '--dy': to.row - from.row,
      } as CSSProperties}
    >
      <span
        className="player-token player-token--jumping"
        style={{ backgroundColor: player.color }}
        title={player.name}
      />
    </div>
  )
}
