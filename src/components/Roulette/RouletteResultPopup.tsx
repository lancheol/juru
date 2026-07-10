import type { RouletteSegment } from '../../types/roulette'
import { getMoveRouletteResultBackground } from '../../data/roulette'
import './RouletteResultPopup.css'

interface RouletteResultPopupProps {
  playerName: string
  segment: RouletteSegment
  emoji?: string
  variant?: 'death' | 'move'
  onConfirm: () => void
}
export function RouletteResultPopup({
  playerName,
  segment,
  emoji = '🎰',
  variant = 'death',
  onConfirm,
}: RouletteResultPopupProps) {
  const moveResultStyle =
    variant === 'move' ? { background: getMoveRouletteResultBackground(segment) } : undefined
  return (
    <div
      className="roulette-result-popup-overlay"
      role="dialog"
      aria-modal="true"
      aria-labelledby="roulette-result-title"
    >
      <div className="roulette-result-popup" onClick={(e) => e.stopPropagation()}>
        <p className="roulette-result-popup__emoji">{emoji}</p>
        <h3 id="roulette-result-title" className="roulette-result-popup__title">
          룰렛 결과
        </h3>
        <p className="roulette-result-popup__player">{playerName}</p>
        <p
          className={[
            'roulette-result-popup__result',
            variant === 'move' ? 'roulette-result-popup__result--move' : '',
          ]
            .filter(Boolean)
            .join(' ')}
          style={
            variant === 'move' ? moveResultStyle : { background: segment.color }
          }
        >
          {segment.label}
        </p>
        {variant === 'death' && segment.description && (
          <p className="roulette-result-popup__description">{segment.description}</p>
        )}
        <button type="button" className="roulette-result-popup__button" onClick={onConfirm}>
          확인
        </button>
      </div>
    </div>
  )
}
