import { Die } from './Die'
import './DiceModal.css'

interface DiceModalProps {
  open: boolean
  value: number | null
  isRolling: boolean
  isBridgeMode: boolean
}

export function DiceModal({ open, value, isRolling, isBridgeMode }: DiceModalProps) {
  if (!open) return null

  const prefix = isBridgeMode ? '🍻' : '🎲'

  return (
    <div
      className="dice-modal-overlay"
      role="dialog"
      aria-modal="true"
      aria-label={isBridgeMode ? '주당 주사위 굴리기' : '주사위 굴리기'}
    >
      <div className={`dice-modal ${isBridgeMode ? 'dice-modal--bridge' : ''}`}>
        {isBridgeMode && (
          <div className="dice-modal__mode">
            <p className="dice-modal__mode-title">주당 주사위</p>
            <p className="dice-modal__mode-desc">(1~3까지만 나오는 주사위)</p>
          </div>
        )}
        <div
          className={[
            'dice-modal__arena',
            isRolling ? 'dice-modal__arena--rolling' : '',
            isBridgeMode ? 'dice-modal__arena--bridge' : '',
          ]
            .filter(Boolean)
            .join(' ')}
        >
          <Die
            value={value}
            isRolling={isRolling}
            size="large"
            variant={isBridgeMode ? 'bridge' : 'normal'}
          />
        </div>
        <p className="dice-modal__label">
          {isRolling ? '굴리는 중...' : value !== null ? `${prefix} ${value}` : ''}
        </p>
      </div>
    </div>
  )
}
