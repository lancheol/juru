import { useCallback, useEffect, useState } from 'react'
import { boardTiles } from '../../data/board'
import {
  getTakenColumns,
} from '../../data/ladderGame'
import type { LadderGameSession } from '../../types/ladderGame'
import type { Player } from '../../types/game'
import { LadderBoard } from './LadderBoard'
import { LadderResultPopup } from './LadderResultPopup'
import './LadderGameModal.css'

interface LadderGameModalProps {
  open: boolean
  session: LadderGameSession | null
  players: Player[]
  onSelectColumn: (col: number) => void
  onSwapSelections: (playerIdA: number, playerIdB: number) => void
  onStart: () => void
  onAnimationComplete: () => void
  onDismiss: () => void
}

export function LadderGameModal({
  open,
  session,
  players,
  onSelectColumn,
  onSwapSelections,
  onStart,
  onAnimationComplete,
  onDismiss,
}: LadderGameModalProps) {
  const handleAnimationComplete = useCallback(() => {
    onAnimationComplete()
  }, [onAnimationComplete])

  const [swapSourcePlayerId, setSwapSourcePlayerId] = useState<number | null>(null)

  useEffect(() => {
    setSwapSourcePlayerId(null)
  }, [session?.pickStep, session?.phase, open])

  const handleSwapPick = useCallback(
    (playerId: number) => {
      if (!swapSourcePlayerId) {
        setSwapSourcePlayerId(playerId)
        return
      }
      if (swapSourcePlayerId === playerId) {
        setSwapSourcePlayerId(null)
        return
      }
      onSwapSelections(swapSourcePlayerId, playerId)
      setSwapSourcePlayerId(null)
    },
    [swapSourcePlayerId, onSwapSelections],
  )

  if (!open || !session) return null

  const tile = boardTiles[session.tileId]
  const taken = getTakenColumns(session)
  const allSelected = session.pickStep >= session.selectionOrder.length
  const currentPickerIndex =
    !allSelected && session.phase === 'select'
      ? session.selectionOrder[session.pickStep]
      : null
  const currentPicker =
    currentPickerIndex != null ? players[currentPickerIndex] : null

  return (
    <div
      className="ladder-game-overlay"
      role="dialog"
      aria-modal="true"
      aria-labelledby="ladder-game-title"
    >
      <div className="ladder-game-modal" onClick={(e) => e.stopPropagation()}>
        <h2 id="ladder-game-title" className="ladder-game-modal__title">
          {tile?.name ?? '사다리타기'}
        </h2>

        {session.phase === 'select' && currentPicker && (
          <p className="ladder-game-modal__hint">
            <span
              className="ladder-game-modal__picker-dot"
              style={{ background: currentPicker.color }}
            />
            {currentPicker.name}님, 위쪽 사다리를 선택하세요
          </p>
        )}

        {session.phase === 'select' && allSelected && (
          <p className="ladder-game-modal__hint">
            {swapSourcePlayerId != null
              ? '바꿀 다른 플레이어를 눌러주세요'
              : '두 플레이어를 눌러 사다리 자리를 바꿀 수 있어요'}
          </p>
        )}

        {session.phase === 'animate' && (
          <p className="ladder-game-modal__hint">사다리를 따라가는 중...</p>
        )}

        {session.phase === 'summary' && (
          <p className="ladder-game-modal__hint">결과를 확인하세요</p>
        )}

        <LadderBoard
          session={session}
          players={players}
          currentPickerPlayerId={currentPicker?.id ?? null}
          takenColumns={taken}
          canSwap={session.phase === 'select' && allSelected}
          swapSourcePlayerId={swapSourcePlayerId}
          onSelectColumn={onSelectColumn}
          onSwapPickPlayer={handleSwapPick}
          onAnimationComplete={handleAnimationComplete}
        />

        {session.phase === 'select' && allSelected && (
          <button
            type="button"
            className="ladder-game-modal__button ladder-game-modal__button--primary"
            onClick={onStart}
          >
            사다리 시작
          </button>
        )}
      </div>

      {session.phase === 'summary' && (
        <LadderResultPopup
          paths={session.paths}
          players={players}
          onConfirm={onDismiss}
        />
      )}
    </div>
  )
}
