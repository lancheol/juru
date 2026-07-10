import { LADDER_RESULT_LABELS } from '../../data/ladderGame'
import type { LadderPlayerPath } from '../../types/ladderGame'
import type { Player } from '../../types/game'
import './LadderResultPopup.css'

interface LadderResultPopupProps {
  paths: LadderPlayerPath[]
  players: Player[]
  onConfirm: () => void
}

export function LadderResultPopup({ paths, players, onConfirm }: LadderResultPopupProps) {
  return (
    <div
      className="ladder-result-popup-overlay"
      role="dialog"
      aria-modal="true"
      aria-labelledby="ladder-result-title"
    >
      <div className="ladder-result-popup" onClick={(e) => e.stopPropagation()}>
        <p className="ladder-result-popup__emoji">🪜</p>
        <h3 id="ladder-result-title" className="ladder-result-popup__title">
          사다리타기 결과
        </h3>

        <ul className="ladder-result-popup__list">
          {paths.map((path) => {
            const player = players.find((p) => p.id === path.playerId)
            return (
              <li
                key={path.playerId}
                className={`ladder-result-popup__item ladder-result-popup__item--${path.result}`}
              >
                <span
                  className="ladder-result-popup__dot"
                  style={{ background: player?.color }}
                />
                <span className="ladder-result-popup__name">{player?.name}</span>
                <span className="ladder-result-popup__badge">
                  {LADDER_RESULT_LABELS[path.result]}
                </span>
              </li>
            )
          })}
        </ul>

        <button type="button" className="ladder-result-popup__button" onClick={onConfirm}>
          확인
        </button>
      </div>
    </div>
  )
}
