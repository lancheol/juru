import { useEffect, useMemo, useRef, useState } from 'react'
import {
  LADDER_RESULT_LABELS,
  LADDER_SVG,
  columnX,
} from '../../data/ladderGame'
import type { LadderGameSession, LadderPathPoint } from '../../types/ladderGame'
import type { Player } from '../../types/game'
import './LadderBoard.css'

const ANIMATION_MS = 2200

function pathToD(points: LadderPathPoint[]): string {
  if (points.length === 0) return ''
  const [first, ...rest] = points
  return `M ${first.x} ${first.y} ${rest.map((p) => `L ${p.x} ${p.y}`).join(' ')}`
}

function polylineLength(points: LadderPathPoint[]): number {
  let len = 0
  for (let i = 1; i < points.length; i++) {
    len += Math.hypot(points[i].x - points[i - 1].x, points[i].y - points[i - 1].y)
  }
  return len
}

function yFromNorm(norm: number): number {
  const innerH = LADDER_SVG.height - LADDER_SVG.padTop - LADDER_SVG.padBottom
  return LADDER_SVG.padTop + innerH * norm
}

interface LadderBoardProps {
  session: LadderGameSession
  players: Player[]
  currentPickerPlayerId: number | null
  takenColumns: Set<number>
  canSwap: boolean
  swapSourcePlayerId: number | null
  onSelectColumn: (col: number) => void
  onSwapPickPlayer: (playerId: number) => void
  onAnimationComplete: () => void
}

export function LadderBoard({
  session,
  players,
  currentPickerPlayerId,
  takenColumns,
  canSwap,
  swapSourcePlayerId,
  onSelectColumn,
  onSwapPickPlayer,
  onAnimationComplete,
}: LadderBoardProps) {
  const { ladder, results, phase, paths, columnByPlayerId } = session
  const columnCount = ladder.columnCount
  const topY = LADDER_SVG.padTop
  const bottomY = LADDER_SVG.height - LADDER_SVG.padBottom

  const [progress, setProgress] = useState<Record<number, number>>({})
  const completedRef = useRef(false)

  const playerById = useMemo(
    () => new Map(players.map((p) => [p.id, p])),
    [players],
  )

  useEffect(() => {
    if (phase !== 'animate') {
      setProgress({})
      completedRef.current = false
      return
    }

    const start = performance.now()
    let frame = 0

    const tick = (now: number) => {
      const t = Math.min(1, (now - start) / ANIMATION_MS)
      const eased = 1 - Math.pow(1 - t, 2.2)
      const next: Record<number, number> = {}
      for (const path of paths) {
        next[path.playerId] = eased
      }
      setProgress(next)

      if (t < 1) {
        frame = requestAnimationFrame(tick)
      } else if (!completedRef.current) {
        completedRef.current = true
        onAnimationComplete()
      }
    }

    frame = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(frame)
  }, [phase, paths, onAnimationComplete])

  const canPick = phase === 'select' && currentPickerPlayerId != null
  const hideRungs = phase === 'select'
  const innerH = bottomY - topY
  const coverX = LADDER_SVG.padX - 14
  const coverY = topY + innerH * 0.1
  const coverW = LADDER_SVG.width - coverX * 2
  const coverH = innerH * 0.62
  const coverCenterY = coverY + coverH / 2

  return (
    <svg
      className="ladder-board"
      viewBox={`0 0 ${LADDER_SVG.width} ${LADDER_SVG.height}`}
      role="img"
      aria-label="사다리타기"
    >
      {Array.from({ length: columnCount }, (_, col) => {
        const x = columnX(col, columnCount)
        const taken = takenColumns.has(col)
        const ownerId = Object.entries(columnByPlayerId).find(
          ([, c]) => c === col,
        )?.[0]
        const owner = ownerId ? playerById.get(Number(ownerId)) : undefined
        const pickable = canPick && !taken

        return (
          <g key={`col-${col}`}>
            <line
              className="ladder-board__rail"
              x1={x}
              y1={topY}
              x2={x}
              y2={bottomY}
            />
            {pickable && (
              <circle
                className="ladder-board__pick"
                cx={x}
                cy={topY - 14}
                r={12}
                onClick={() => onSelectColumn(col)}
              />
            )}
            {owner && (
              <>
                {canSwap && (
                  <circle
                    className="ladder-board__token-hit"
                    cx={x}
                    cy={topY - 14}
                    r={16}
                    onClick={() => onSwapPickPlayer(owner.id)}
                  />
                )}
                <circle
                  className={[
                    'ladder-board__token',
                    canSwap && 'ladder-board__token--swapable',
                    swapSourcePlayerId === owner.id && 'ladder-board__token--swap-selected',
                  ]
                    .filter(Boolean)
                    .join(' ')}
                  cx={x}
                  cy={topY - 14}
                  r={10}
                  fill={owner.color}
                  pointerEvents="none"
                />
                {swapSourcePlayerId === owner.id && (
                  <circle
                    className="ladder-board__token-ring"
                    cx={x}
                    cy={topY - 14}
                    r={14}
                    pointerEvents="none"
                  />
                )}
                <text
                  className="ladder-board__token-label"
                  x={x}
                  y={topY - 30}
                  textAnchor="middle"
                  pointerEvents="none"
                >
                  {owner.name.slice(0, 3)}
                </text>
              </>
            )}
            <text
              className={`ladder-board__result ladder-board__result--${results[col]}`}
              x={x}
              y={bottomY + 22}
              textAnchor="middle"
            >
              {LADDER_RESULT_LABELS[results[col]]}
            </text>
          </g>
        )
      })}

      {!hideRungs &&
        ladder.rungsByGap.map((ys, gap) =>
          ys.map((y, i) => {
            const x1 = columnX(gap, columnCount)
            const x2 = columnX(gap + 1, columnCount)
            const py = yFromNorm(y)
            return (
              <line
                key={`rung-${gap}-${i}`}
                className="ladder-board__rung"
                x1={x1}
                y1={py}
                x2={x2}
                y2={py}
              />
            )
          }),
        )}

      {hideRungs && (
        <g className="ladder-board__cover-group" aria-hidden="true">
          <rect
            className="ladder-board__cover"
            x={coverX}
            y={coverY}
            width={coverW}
            height={coverH}
            rx={10}
          />
          <text
            className="ladder-board__cover-label"
            x={LADDER_SVG.width / 2}
            y={coverCenterY}
            textAnchor="middle"
            dominantBaseline="middle"
          >
            ?
          </text>
        </g>
      )}

      {phase !== 'select' &&
        paths.map((path) => {
          const player = playerById.get(path.playerId)
          if (!player) return null
          const d = pathToD(path.points)
          const len = polylineLength(path.points)
          const p = progress[path.playerId] ?? 0
          const offset = len * (1 - p)

          return (
            <path
              key={`path-${path.playerId}`}
              className="ladder-board__trace"
              d={d}
              stroke={player.color}
              strokeDasharray={len}
              strokeDashoffset={offset}
            />
          )
        })}
    </svg>
  )
}
