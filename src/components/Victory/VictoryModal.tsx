import type { CSSProperties } from 'react'
import './VictoryModal.css'

const BURST_COUNT = 14

interface VictoryModalProps {
  open: boolean
  winnerName: string
  totalLaps: number
  onBackToSetup: () => void
}

export function VictoryModal({
  open,
  winnerName,
  totalLaps,
  onBackToSetup,
}: VictoryModalProps) {
  if (!open) return null

  return (
    <div
      className="victory-modal-overlay"
      role="dialog"
      aria-modal="true"
      aria-labelledby="victory-modal-title"
    >
      <div className="victory-modal__fireworks" aria-hidden>
        {Array.from({ length: BURST_COUNT }, (_, index) => (
          <span
            key={index}
            className="victory-modal__burst"
            style={{ '--i': index } as CSSProperties}
          />
        ))}
      </div>

      <div className="victory-modal">
        <p className="victory-modal__emoji">🏆</p>
        <h2 id="victory-modal-title" className="victory-modal__title">
          승리!
        </h2>
        <p className="victory-modal__message">
          <strong>{winnerName}</strong>님이
          <br />
          {totalLaps}바퀴를 완주했습니다!
        </p>
        <p className="victory-modal__cheer">축하합니다! 🎉🍻</p>
        <button type="button" className="victory-modal__button" onClick={onBackToSetup}>
          설정 화면으로
        </button>
      </div>
    </div>
  )
}
