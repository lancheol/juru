import { formatPlayerItemUseConfirmMessage } from '../../data/playerItems'
import type { PlayerItemId } from '../../types/playerItem'
import './PlayerItemModal.css'

interface PlayerItemUseConfirmModalProps {
  open: boolean
  itemId: PlayerItemId | null
  onConfirm: () => void
  onCancel: () => void
}

export function PlayerItemUseConfirmModal({
  open,
  itemId,
  onConfirm,
  onCancel,
}: PlayerItemUseConfirmModalProps) {
  if (!open || !itemId) return null

  return (
    <div
      className="player-item-overlay"
      role="dialog"
      aria-modal="true"
      aria-labelledby="player-item-use-title"
    >
      <div className="player-item-modal">
        <h2 id="player-item-use-title" className="player-item-modal__title">
          아이템 사용
        </h2>
        <p className="player-item-modal__message">
          {formatPlayerItemUseConfirmMessage(itemId)}
        </p>
        <div className="player-item-modal__actions">
          <button
            type="button"
            className="player-item-modal__button"
            onClick={onCancel}
          >
            취소
          </button>
          <button
            type="button"
            className="player-item-modal__button player-item-modal__button--primary"
            onClick={onConfirm}
          >
            사용
          </button>
        </div>
      </div>
    </div>
  )
}
