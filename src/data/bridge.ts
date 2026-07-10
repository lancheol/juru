const GRID_COLS = 10
const GRID_ROWS = 7

export type BridgeSegmentType = 'alcohol' | 'water'

export interface BridgeSegment {
  type: BridgeSegmentType
  label: string
  description: string
}

export interface BridgeSegmentPoint {
  row: number
  col: number
}

/** id 28 (주당의 길 입구), id 22 (탈출 · 엘준단 빼고 다 마셔) */
export const BRIDGE_ENTRANCE = 28
export const BRIDGE_EXIT = 22
export const BRIDGE_SEGMENT_COUNT = 7

/** 28번 칸 위치 (7×10 그리드) */
export const BRIDGE_ENTRANCE_GRID = { row: 2, col: 0 } as const

/** 22번 칸 위치 (7×10 그리드) */
export const BRIDGE_EXIT_GRID = { row: 6, col: 2 } as const

/**
 * 주당의 길 — 1→2·2→3 선 길이 균등(~0.63), 2→3은 왼쪽으로 기울어 세로 열(col 1.92)에 합류
 * 세로 간격 0.60 (3→4 이하)
 */
export const BRIDGE_SEGMENT_POINTS: BridgeSegmentPoint[] = [
  { row: 2, col: 1 },
  { row: 2.1, col: 1.62 },
  { row: 2.65, col: 1.92 },
  { row: 3.25, col: 1.92 },
  { row: 3.85, col: 1.92 },
  { row: 4.45, col: 1.92 },
  { row: 5.05, col: 1.92 },
]

export function bridgePointToPercent(point: BridgeSegmentPoint) {
  return {
    x: ((point.col + 0.5) / GRID_COLS) * 100,
    y: ((point.row + 0.5) / GRID_ROWS) * 100,
  }
}

export function bridgeSegmentToPercent(segment: number) {
  const point = BRIDGE_SEGMENT_POINTS[segment] ?? BRIDGE_SEGMENT_POINTS[0]
  return bridgePointToPercent(point)
}

export function bridgeSegmentToGrid(segment: number) {
  const point = BRIDGE_SEGMENT_POINTS[segment] ?? BRIDGE_SEGMENT_POINTS[0]
  return { row: Math.round(point.row), col: Math.round(point.col) }
}

export function gridToPercent(grid: { row: number; col: number }) {
  return bridgePointToPercent({ row: grid.row, col: grid.col })
}

/** @deprecated BRIDGE_SEGMENT_POINTS 사용 */
export const BRIDGE_SEGMENT_GRID = BRIDGE_SEGMENT_POINTS

export const BRIDGE_SEGMENTS: BridgeSegment[] = [
  { type: 'alcohol', label: '술', description: '술 한 잔!' },
  { type: 'water', label: '물', description: '물 한 잔' },
  { type: 'alcohol', label: '술', description: '술 한 잔!' },
  { type: 'water', label: '물', description: '물 한 잔' },
  { type: 'alcohol', label: '술', description: '술 한 잔!' },
  { type: 'water', label: '물', description: '물 한 잔' },
  { type: 'alcohol', label: '술', description: '술 한 잔!' },
]
