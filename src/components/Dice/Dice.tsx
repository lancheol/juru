import { Die } from './Die'
import './Dice.css'

interface DiceProps {
  value: number | null
  isRolling: boolean
  showDiceModal: boolean
  isMoving: boolean
  isFinished: boolean
  isBridgeMode: boolean
  mainRollDisabled?: boolean
  onRoll: () => void
}

export function Dice({
  value,
  isRolling,
  showDiceModal,
  isMoving,
  isFinished,
  isBridgeMode,
  mainRollDisabled = false,
  onRoll,
}: DiceProps) {
  const busy = isRolling || showDiceModal || isMoving || isFinished || mainRollDisabled

  return (
    <div className="dice">
      <div className={`dice__arena ${isBridgeMode ? 'dice__arena--bridge' : ''}`}>
        <Die value={value} isRolling={false} variant={isBridgeMode ? 'bridge' : 'normal'} />
      </div>
      <button
        type="button"
        className="dice__button"
        onClick={onRoll}
        disabled={busy}
      >
        {isFinished
          ? '게임 종료'
          : mainRollDisabled
            ? '무인도 탈출 중...'
            : isRolling || showDiceModal
              ? '굴리는 중...'
              : isMoving
                ? '이동 중...'
                : isBridgeMode
                  ? '주당 주사위'
                  : '주사위 굴리기'}
      </button>
    </div>
  )
}
