import type { CSSProperties } from 'react'
import type { Tile } from '../../types/game'
import './BoardTile.css'

interface BoardTileProps {
  tile: Tile
  position: number
  style?: CSSProperties
  aboveBridge?: boolean
}

export function BoardTile({ tile, position, style, aboveBridge }: BoardTileProps) {
  return (
    <div
      className={`board-tile board-tile--${tile.type}${aboveBridge ? ' board-tile--above-bridge' : ''}`}
      data-position={position}
      title={tile.description}
      style={style}
    >
      <span className="board-tile__index">{position}</span>
      <span className="board-tile__name">{tile.name}</span>
    </div>
  )
}
