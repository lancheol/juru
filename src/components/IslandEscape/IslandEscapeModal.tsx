import { Die } from '../Dice/Die'
import './IslandEscapeModal.css'

interface IslandEscapeModalProps {
  open: boolean
  playerName: string
  value: number | null
  value2: number | null
  isRolling: boolean
  onRoll: () => void
}

export function IslandEscapeModal({
  open,
  playerName,
  value,
  value2,
  isRolling,
  onRoll,
}: IslandEscapeModalProps) {
  if (!open) return null

  const hasResult = value !== null && value2 !== null
  const isDouble = hasResult && value === value2

  return (
    <div
      className="island-escape-overlay"
      role="dialog"
      aria-modal="true"
      aria-label="무인도 탈출"
    >
      <div className="island-escape-modal">
        <p className="island-escape-modal__emoji">🏝️</p>
        <h2 className="island-escape-modal__title">무인도 탈출</h2>
        <p className="island-escape-modal__player">{playerName}님의 차례</p>
        <p className="island-escape-modal__desc">
          두 주사위 눈이 같으면 탈출!
        </p>
        <p className="island-escape-modal__penalty">
          탈출 실패 시 굴린 사람 한 잔
        </p>

        <div
          className={[
            'island-escape-modal__arena',
            isRolling ? 'island-escape-modal__arena--rolling' : '',
          ]
            .filter(Boolean)
            .join(' ')}
        >
          <div className="island-escape-modal__pair">
            <div className="island-escape-modal__die-slot">
              <Die value={value} isRolling={isRolling} size="large" variant="normal" />
            </div>
            <div className="island-escape-modal__die-slot">
              <Die value={value2} isRolling={isRolling} size="large" variant="normal" />
            </div>
          </div>
        </div>

        {hasResult && !isRolling && (
          <p className="island-escape-modal__result">
            {isDouble
              ? `🏝️ 더블 ${value}! ${value + value2}칸 이동!`
              : `🏝️ ${value}, ${value2} — 탈출 실패`}
          </p>
        )}

        <button
          type="button"
          className="island-escape-modal__button"
          onClick={onRoll}
          disabled={isRolling || hasResult}
        >
          {isRolling ? '굴리는 중...' : hasResult ? '결과 확인 중...' : '탈출 주사위 굴리기'}
        </button>
      </div>
    </div>
  )
}
