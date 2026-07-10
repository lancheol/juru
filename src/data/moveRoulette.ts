import type { RouletteSegment } from '../types/roulette'

/** id 8 */
export const MOVE_ROULETTE_TILE_ID = 8

export const MOVE_ROULETTE_TILE_NAME = '이동 룰렛'

export const MOVE_ROULETTE_TILE_DESCRIPTION = '룰렛을 돌려 이동 운명을 결정하세요'

/** 좋음 척도 1(약)~5(강) — 기준색 #009A21, 라벨 종류별 고정 */
export const MOVE_GOOD_SCALE_COLORS = {
  1: '#c8eed0',
  2: '#8fd9a0',
  3: '#5cc474',
  4: '#2fad4a',
  5: '#009A21',
} as const

/** 안좋음 척도 -1(약)~-5(강) — 기준색 #B20000, 라벨 종류별 고정 */
export const MOVE_BAD_SCALE_COLORS = {
  [-1]: '#f0c4c4',
  [-2]: '#e08080',
  [-3]: '#cc5252',
  [-4]: '#c02828',
  [-5]: '#B20000',
} as const

export type MoveGoodScale = keyof typeof MOVE_GOOD_SCALE_COLORS
export type MoveBadScale = keyof typeof MOVE_BAD_SCALE_COLORS

/** 라벨 종류 → 척도 (색상은 척도에서 고정 조회) */
export const MOVE_LABEL_GOOD_SCALE: Record<string, MoveGoodScale> = {
  제자리: 2,
  '앞으로 1칸': 3,
  '앞으로 2칸': 4,
  '앞으로 3칸': 5,
}

export const MOVE_LABEL_BAD_SCALE: Record<string, MoveBadScale> = {
  '뒤로 1칸': -2,
  '뒤로 2칸': -3,
  처음으로: -5,
}

export function getMoveRouletteSegmentColor(
  label: string,
  moveSteps?: number,
  goToStart?: boolean,
): string {
  if (goToStart) {
    return MOVE_BAD_SCALE_COLORS[-5]
  }
  if (moveSteps === 0) {
    return MOVE_GOOD_SCALE_COLORS[2]
  }
  if (moveSteps === 1) {
    return MOVE_GOOD_SCALE_COLORS[3]
  }
  if (moveSteps === 2) {
    return MOVE_GOOD_SCALE_COLORS[4]
  }
  if (moveSteps === 3) {
    return MOVE_GOOD_SCALE_COLORS[5]
  }
  if (moveSteps === -1) {
    return MOVE_BAD_SCALE_COLORS[-2]
  }
  if (moveSteps === -2) {
    return MOVE_BAD_SCALE_COLORS[-3]
  }
  return getMoveRouletteLabelColor(label)
}

export function getMoveRouletteLabelColor(label: string): string {
  const good = MOVE_LABEL_GOOD_SCALE[label]
  if (good !== undefined) {
    return MOVE_GOOD_SCALE_COLORS[good]
  }

  const bad = MOVE_LABEL_BAD_SCALE[label]
  if (bad !== undefined) {
    return MOVE_BAD_SCALE_COLORS[bad]
  }

  return '#6d7a8c'
}

/** 라벨 척도 색상만 사용 — 세션마다 새 객체 (색은 라벨에 고정) */
export function createMoveRouletteSegmentsForSession(): RouletteSegment[] {
  return MOVE_ROULETTE_SEGMENT_DEFS.map((def) => ({
    id: def.id,
    label: def.label,
    color: '#ffffff',
    moveSteps: def.moveSteps,
    goToStart: def.goToStart,
  }))
}

interface MoveRouletteSegmentDef {
  id: string
  label: string
  moveSteps?: number
  goToStart?: boolean
}

function moveDef(
  id: string,
  label: string,
  moveSteps?: number,
  goToStart?: boolean,
): MoveRouletteSegmentDef {
  return { id, label, moveSteps, goToStart }
}

/** 총 10칸 — 앞1×2, 앞2×2, 앞3×1, 뒤1×2, 뒤2×1, 제자리×1, 처음으로×1 */
const MOVE_ROULETTE_SEGMENT_DEFS: MoveRouletteSegmentDef[] = [
  moveDef('fwd-1a', '앞으로 1칸', 1),
  moveDef('fwd-1b', '앞으로 1칸', 1),
  moveDef('fwd-2a', '앞으로 2칸', 2),
  moveDef('fwd-2b', '앞으로 2칸', 2),
  moveDef('fwd-3', '앞으로 3칸', 3),
  moveDef('back-1a', '뒤로 1칸', -1),
  moveDef('back-1b', '뒤로 1칸', -1),
  moveDef('back-2', '뒤로 2칸', -2),
  moveDef('stay', '제자리', 0),
  moveDef('start', '처음으로', undefined, true),
]

/** 기본 정의 (테스트·참조용) — 색상은 라벨 척도에서만 결정 */
export const MOVE_ROULETTE_SEGMENTS: RouletteSegment[] =
  createMoveRouletteSegmentsForSession()

export function isMoveRouletteTile(tileId: number): boolean {
  return tileId === MOVE_ROULETTE_TILE_ID
}

export function resolveMoveRouletteSteps(
  segment: RouletteSegment,
  fromPosition: number,
): number {
  if (segment.goToStart) {
    return fromPosition === 0 ? 0 : -fromPosition
  }
  return segment.moveSteps ?? 0
}
