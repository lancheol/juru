import { formatPlayerItemCount, getPlayerItemDefinition } from '../../data/playerItems'
import type { PlayerItemId } from '../../types/playerItem'
import './PlayerItemChip.css'

interface PlayerItemChipProps {
  itemId: PlayerItemId
  count: number
  disabled?: boolean
  onClick: () => void
}

export function PlayerItemChip({
  itemId,
  count,
  disabled = false,
  onClick,
}: PlayerItemChipProps) {
  const def = getPlayerItemDefinition(itemId)

  if (count <= 0) return null

  return (
    <div className="player-item-chip-wrap">
      <span className="player-item-chip__count">
        {formatPlayerItemCount(itemId, count)}
      </span>
      <button
        type="button"
        className="player-item-chip"
        title={def.label}
        disabled={disabled}
        onClick={onClick}
        aria-label={`${def.label} ${count}개 사용`}
      >
        <span className="player-item-chip__label">{def.chipLabel}</span>
      </button>
    </div>
  )
}
