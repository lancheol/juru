import type { CSSProperties } from 'react'
import {
  BRIDGE_ENTRANCE_GRID,
  BRIDGE_EXIT_GRID,
  BRIDGE_SEGMENT_POINTS,
  BRIDGE_SEGMENTS,
  bridgePointToPercent,
} from '../../data/bridge'
import './Bridge.css'

function buildLinePoints() {
  const points = BRIDGE_SEGMENT_POINTS.map(bridgePointToPercent)
  const entrance = bridgePointToPercent(BRIDGE_ENTRANCE_GRID)
  const exit = bridgePointToPercent(BRIDGE_EXIT_GRID)
  const lines: { x1: number; y1: number; x2: number; y2: number }[] = []

  lines.push({ x1: entrance.x, y1: entrance.y, x2: points[0].x, y2: points[0].y })
  for (let i = 1; i < points.length; i++) {
    const prev = points[i - 1]
    const next = points[i]
    lines.push({ x1: prev.x, y1: prev.y, x2: next.x, y2: next.y })
  }

  const last = points[points.length - 1]
  lines.push({ x1: last.x, y1: last.y, x2: exit.x, y2: exit.y })

  return lines
}

const BRIDGE_LINES = buildLinePoints()

export function Bridge() {
  return (
    <div className="bridge-overlay" aria-hidden>
      <svg className="bridge-lines" viewBox="0 0 100 100" preserveAspectRatio="none">
        {BRIDGE_LINES.map((line, index) => (
          <line
            key={index}
            x1={line.x1}
            y1={line.y1}
            x2={line.x2}
            y2={line.y2}
            className="bridge-lines__segment"
          />
        ))}
      </svg>

      {BRIDGE_SEGMENTS.map((segment, index) => {
        const { x, y } = bridgePointToPercent(BRIDGE_SEGMENT_POINTS[index])

        return (
          <div
            key={index}
            className={`bridge-segment bridge-segment--${segment.type}`}
            style={{ '--x': `${x}%`, '--y': `${y}%` } as CSSProperties}
            title={segment.description}
          >
            <span className="bridge-segment__index">{index + 1}</span>
            <span className="bridge-segment__label">{segment.label}</span>
          </div>
        )
      })}
    </div>
  )
}
