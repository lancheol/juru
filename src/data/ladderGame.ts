import type {
  LadderGameSession,
  LadderPathPoint,
  LadderPlayerPath,
  LadderResultType,
  LadderStructure,
} from '../types/ladderGame'
import type { Player } from '../types/game'

/** id 2, 25 */
export const LADDER_GAME_TILE_IDS = [2, 25] as const

export const LADDER_RESULT_LABELS: Record<LadderResultType, string> = {
  survive: '생존',
  soju1: '소주 1잔',
  soju2: '소주 2잔',
}

export function isLadderGameTile(tileId: number): boolean {
  return (LADDER_GAME_TILE_IDS as readonly number[]).includes(tileId)
}

function shuffle<T>(items: T[]): T[] {
  const next = [...items]
  for (let i = next.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[next[i], next[j]] = [next[j], next[i]]
  }
  return next
}

/** 소주2잔 1 + 나머지 생존:소주1 = 5:4 (2명이면 생존·소주1만) */
export function buildLadderResults(playerCount: number): LadderResultType[] {
  if (playerCount <= 2) {
    return shuffle(['survive', 'soju1'])
  }

  const remaining = playerCount - 1
  const surviveCount = Math.round((remaining * 5) / 9)
  const soju1Count = remaining - surviveCount
  const results: LadderResultType[] = ['soju2']
  for (let i = 0; i < surviveCount; i++) results.push('survive')
  for (let i = 0; i < soju1Count; i++) results.push('soju1')
  return shuffle(results)
}

/** 인접 세로선 사이 가로줄 — gap당 3~5개 */
export function generateLadderStructure(columnCount: number): LadderStructure {
  const rungsByGap: number[][] = []

  for (let gap = 0; gap < columnCount - 1; gap++) {
    const count = 3 + Math.floor(Math.random() * 3)
    const ys: number[] = []
    for (let i = 0; i < count; i++) {
      ys.push(0.12 + Math.random() * 0.72)
    }
    ys.sort((a, b) => a - b)
    for (let i = 1; i < ys.length; i++) {
      if (ys[i] - ys[i - 1] < 0.07) {
        ys[i] = Math.min(ys[i - 1] + 0.07, 0.92)
      }
    }
    rungsByGap.push(ys)
  }

  return { columnCount, rungsByGap }
}

export function traceLadderColumn(
  startCol: number,
  ladder: LadderStructure,
): number {
  let col = startCol
  const events: { y: number; gap: number }[] = []

  ladder.rungsByGap.forEach((ys, gap) => {
    for (const y of ys) {
      events.push({ y, gap })
    }
  })

  events.sort((a, b) => a.y - b.y)

  for (const { gap } of events) {
    if (gap === col) col += 1
    else if (gap === col - 1) col -= 1
  }

  return col
}

const LAYOUT = {
  padX: 36,
  padTop: 28,
  padBottom: 56,
  width: 320,
  height: 300,
}

export function columnX(col: number, columnCount: number): number {
  const innerW = LAYOUT.width - LAYOUT.padX * 2
  if (columnCount <= 1) return LAYOUT.width / 2
  return LAYOUT.padX + (innerW * col) / (columnCount - 1)
}

function yFromNorm(norm: number): number {
  const innerH = LAYOUT.height - LAYOUT.padTop - LAYOUT.padBottom
  return LAYOUT.padTop + innerH * norm
}

export function buildLadderPath(
  startCol: number,
  ladder: LadderStructure,
): { endCol: number; points: LadderPathPoint[] } {
  const topY = LAYOUT.padTop
  const bottomY = LAYOUT.height - LAYOUT.padBottom
  let col = startCol

  const events: { y: number; gap: number }[] = []
  ladder.rungsByGap.forEach((ys, gap) => {
    for (const y of ys) events.push({ y, gap })
  })
  events.sort((a, b) => a.y - b.y)

  const points: LadderPathPoint[] = [
    { x: columnX(col, ladder.columnCount), y: topY },
  ]

  for (const { y, gap } of events) {
    const py = yFromNorm(y)
    points.push({ x: columnX(col, ladder.columnCount), y: py })
    if (gap === col) col += 1
    else if (gap === col - 1) col -= 1
    points.push({ x: columnX(col, ladder.columnCount), y: py })
  }

  points.push({ x: columnX(col, ladder.columnCount), y: bottomY })
  return { endCol: col, points }
}

export function buildPlayerPaths(
  ladder: LadderStructure,
  results: LadderResultType[],
  columnByPlayerId: Record<number, number>,
  players: { id: number }[],
): LadderPlayerPath[] {
  return players.map((player) => {
    const startCol = columnByPlayerId[player.id] ?? 0
    const { endCol, points } = buildLadderPath(startCol, ladder)
    return {
      playerId: player.id,
      startCol,
      endCol,
      points,
      result: results[endCol] ?? 'survive',
    }
  })
}

export function createSelectionOrder(
  landingPlayerIndex: number,
  playerCount: number,
): number[] {
  return Array.from({ length: playerCount }, (_, i) =>
    (landingPlayerIndex + i) % playerCount,
  )
}

export function createLadderGameSession(
  tileId: number,
  landingPlayerIndex: number,
  playerCount: number,
): LadderGameSession {
  const columnCount = playerCount
  return {
    tileId,
    phase: 'select',
    ladder: generateLadderStructure(columnCount),
    results: buildLadderResults(playerCount),
    selectionOrder: createSelectionOrder(landingPlayerIndex, playerCount),
    pickStep: 0,
    columnByPlayerId: {},
    paths: [],
    animationDone: false,
  }
}

export function getTakenColumns(session: LadderGameSession): Set<number> {
  return new Set(
    Object.values(session.columnByPlayerId).filter(
      (col): col is number => col !== undefined,
    ),
  )
}

export function applyLadderDrinks(players: Player[], paths: LadderPlayerPath[]): Player[] {
  const drinkDelta = new Map<number, number>()
  for (const path of paths) {
    if (path.result === 'soju1') drinkDelta.set(path.playerId, 1)
    if (path.result === 'soju2') drinkDelta.set(path.playerId, 2)
  }

  return players.map((p) => ({
    ...p,
    drinkCount: p.drinkCount + (drinkDelta.get(p.id) ?? 0),
  }))
}

export const LADDER_SVG = LAYOUT
