import { useRef, type TransitionEvent } from 'react'
import {
  buildMoveRouletteConicGradient,
  buildRouletteConicGradient,
  computeSpinRotation,
  pickRandomSegmentIndex,
} from '../../data/roulette'
import type { RouletteSegment } from '../../types/roulette'
import './RouletteWheel.css'

const SPIN_MS = 4200

const DEATH_LABEL_RADIUS_PX = 188
const DEATH_LABEL_RADIUS_DENSE_PX = 196

const MOVE_LABEL_RADIUS_RATIO = 0.36
/** 칸 중심 각도에서 반시계 방향 위치 보정 (slice 배수) */
const MOVE_LABEL_POSITION_CCW_OFFSET = 0.5
/** 글씨 자체 추가 반시계 방향 회전 (deg) */
const MOVE_LABEL_ROTATION_CCW_DEG = 4

export type RouletteWheelVariant = 'death' | 'move'

interface RouletteWheelProps {
  segments: RouletteSegment[]
  rotationDeg: number
  spinning: boolean
  variant?: RouletteWheelVariant
  onSpinStart: (targetIndex: number, nextRotationDeg: number) => void
  onSpinEnd: () => void
}

function getMoveLabelRotate(angle: number): number {
  return angle + 90
}

function formatMoveWheelLabel(label: string): string {
  return label.replace(/ /g, '\u2009')
}

export function RouletteWheel({
  segments,
  rotationDeg,
  spinning,
  variant = 'death',
  onSpinStart,
  onSpinEnd,
}: RouletteWheelProps) {
  const wheelRef = useRef<HTMLDivElement>(null)
  const slice = 360 / segments.length
  const isMove = variant === 'move'

  const handleSpin = () => {
    if (spinning) return
    const targetIndex = pickRandomSegmentIndex(segments.length)
    const nextRotation = computeSpinRotation(rotationDeg, targetIndex, segments.length)
    onSpinStart(targetIndex, nextRotation)
  }

  const handleTransitionEnd = (event: TransitionEvent<HTMLDivElement>) => {
    if (event.propertyName !== 'transform' || !spinning) return
    onSpinEnd()
  }

  return (
    <div className="roulette-wheel-wrap">
      <div className="roulette-wheel__arrow" aria-hidden>
        ▼
      </div>

      <div className="roulette-wheel__outer">
        <div
          ref={wheelRef}
          className={[
            'roulette-wheel',
            isMove ? 'roulette-wheel--move' : '',
            !isMove && segments.length >= 12 ? 'roulette-wheel--dense' : '',
          ]
            .filter(Boolean)
            .join(' ')}
          style={{
            background: isMove
              ? buildMoveRouletteConicGradient(segments.length)
              : buildRouletteConicGradient(segments),
            transform: `rotate(${rotationDeg}deg)`,
            transition: spinning
              ? `transform ${SPIN_MS}ms cubic-bezier(0.15, 0.85, 0.2, 1)`
              : 'none',
          }}
          onTransitionEnd={handleTransitionEnd}
        >
          {segments.map((segment, index) => {
            if (isMove) {
              const angle =
                index * slice + slice / 2 - 90 - slice * MOVE_LABEL_POSITION_CCW_OFFSET
              const rad = (angle * Math.PI) / 180
              const offsetX = Math.cos(rad) * MOVE_LABEL_RADIUS_RATIO * 100
              const offsetY = Math.sin(rad) * MOVE_LABEL_RADIUS_RATIO * 100

              return (
                <span
                  key={segment.id}
                  className="roulette-wheel__label--move"
                  style={{
                    left: `calc(50% + ${offsetX}%)`,
                    top: `calc(50% + ${offsetY}%)`,
                    transform: `translate(-50%, -50%) rotate(${getMoveLabelRotate(angle) - MOVE_LABEL_ROTATION_CCW_DEG}deg)`,
                    maxHeight: `calc(${slice * 0.5}vmin)`,
                  }}
                >
                  {formatMoveWheelLabel(segment.label)}
                </span>
              )
            }

            const angle = index * slice + slice / 2 - 90
            const rad = (angle * Math.PI) / 180
            const labelRadius =
              segments.length >= 12 ? DEATH_LABEL_RADIUS_DENSE_PX : DEATH_LABEL_RADIUS_PX
            const x = Math.cos(rad) * labelRadius
            const y = Math.sin(rad) * labelRadius

            return (
              <span
                key={segment.id}
                className="roulette-wheel__label--death"
                style={{
                  left: `calc(50% + ${x}px)`,
                  top: `calc(50% + ${y}px)`,
                  transform: `translate(-50%, -50%) rotate(${angle + 90}deg)`,
                }}
              >
                {segment.label}
              </span>
            )
          })}
        </div>

        <button
          type="button"
          className="roulette-wheel__spin-btn"
          onClick={handleSpin}
          disabled={spinning}
          aria-label="룰렛 돌리기"
        >
          {spinning ? '과연 ?' : 'START'}
        </button>
      </div>
    </div>
  )
}
