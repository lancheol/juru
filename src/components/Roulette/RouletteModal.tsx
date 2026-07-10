import { boardTiles } from '../../data/board'
import { isMoveRouletteTile } from '../../data/moveRoulette'
import type { RouletteSession } from '../../types/roulette'
import { RouletteWheel } from './RouletteWheel'
import { RouletteResultPopup } from './RouletteResultPopup'
import './RouletteModal.css'

interface RouletteModalProps {
  open: boolean
  session: RouletteSession | null
  landingPlayerName: string
  onSpinStart: (targetIndex: number, nextRotationDeg: number) => void
  onSpinEnd: () => void
  onDismiss: () => void
}

export function RouletteModal({
  open,
  session,
  landingPlayerName,
  onSpinStart,
  onSpinEnd,
  onDismiss,
}: RouletteModalProps) {
  if (!open || !session) return null

  const tile = boardTiles[session.tileId]
  const resultSegment =
    session.resultIndex != null ? session.segments[session.resultIndex] : null

  return (
    <div
      className="roulette-modal-overlay"
      role="dialog"
      aria-modal="true"
      aria-labelledby="roulette-modal-title"
    >
      <div className="roulette-modal" onClick={(e) => e.stopPropagation()}>
        <h2 id="roulette-modal-title" className="roulette-modal__title">
          {tile?.name ?? '죽음의 룰렛'}
        </h2>

        {session.phase === 'idle' && (
          <p className="roulette-modal__hint">가운데 버튼 또는 스페이스바로 룰렛을 돌리세요</p>
        )}
        {session.phase === 'spinning' && (
          <p className="roulette-modal__hint">룰렛이 돌아가는 중...</p>
        )}
        {session.phase === 'result' && (
          <p className="roulette-modal__hint">결과를 확인하세요</p>
        )}

        <RouletteWheel
          segments={session.segments}
          rotationDeg={session.rotationDeg}
          spinning={session.phase === 'spinning'}
          variant={isMoveRouletteTile(session.tileId) ? 'move' : 'death'}
          onSpinStart={onSpinStart}
          onSpinEnd={onSpinEnd}
        />
      </div>

      {session.phase === 'result' && resultSegment && (
        <RouletteResultPopup
          playerName={landingPlayerName}
          segment={resultSegment}
          emoji={isMoveRouletteTile(session.tileId) ? '🎯' : '🎰'}
          variant={isMoveRouletteTile(session.tileId) ? 'move' : 'death'}
          onConfirm={onDismiss}
        />
      )}
    </div>
  )
}
