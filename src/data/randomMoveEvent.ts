import type { Tile } from '../types/game'
import type { RandomMoveSlotItem } from '../types/randomMoveSlot'
import { BOARD_SIZE } from './board'
import randomMoveImage from '../assets/tile-modals/by-tile/tile-18.png'

/** id 15 — 랜덤이동 칸 */
export const RANDOM_MOVE_TILE_ID = 15

export const RANDOM_MOVE_TILE_NAME = '랜덤이동'

export const RANDOM_MOVE_TILE_DESCRIPTION = '어디로 갈지 운명이 정해집니다!'

export const RANDOM_MOVE_IMAGE = randomMoveImage

/** 모달 확인 후 순간이동까지 대기(ms) */
export const RANDOM_MOVE_TELEPORT_DELAY_MS = 600

/** 슬롯 결과 표시 후 순간이동까지 대기(ms) */
export const RANDOM_MOVE_SLOT_RESULT_HOLD_MS = 900

export const RANDOM_MOVE_SLOT_SPIN_MS = 4200

export const RANDOM_MOVE_SLOT_TWIST_MS = 420

/** 빠르게 도는 구간이 차지하는 시간 비율 */
export const RANDOM_MOVE_SLOT_FAST_PHASE_RATIO = 0.58

/** 빠른 구간에서 이동하는 거리 비율 (나머지는 감속) */
export const RANDOM_MOVE_SLOT_FAST_DISTANCE_RATIO = 0.82

/** 감속 구간 ease-out 지수 (클수록 끝에서 더 천천히) */
export const RANDOM_MOVE_SLOT_DECEL_POWER = 5

/** 뷰포트 중심에 맞추는 기준 인덱스 */
export const RANDOM_MOVE_SLOT_CENTER_INDEX = 20

/** 결과 칸까지 이동하는 칸 수 (기준 인덱스 기준) */
export const RANDOM_MOVE_SLOT_TRAVEL_ITEMS = 28

/** 스핀 시 추가로 훑는 칸 수 (초반 속도감) */
export const RANDOM_MOVE_SLOT_EXTRA_SPIN_ITEMS = 16

/** 릴 위·아래 여유 칸 수 */
export const RANDOM_MOVE_SLOT_VISIBLE_BUFFER = 8

/** 결과 칸 인덱스 */
export const RANDOM_MOVE_SLOT_LAND_INDEX =
  RANDOM_MOVE_SLOT_CENTER_INDEX + RANDOM_MOVE_SLOT_TRAVEL_ITEMS

/** 릴 전체 길이 — 스핀 거리 + 여유 */
export const RANDOM_MOVE_SLOT_REEL_ITEM_COUNT =
  RANDOM_MOVE_SLOT_LAND_INDEX +
  RANDOM_MOVE_SLOT_EXTRA_SPIN_ITEMS +
  RANDOM_MOVE_SLOT_VISIBLE_BUFFER +
  4

/** @deprecated RANDOM_MOVE_SLOT_LAND_INDEX 사용 */
export const RANDOM_MOVE_SLOT_FORCED_INDEX = RANDOM_MOVE_SLOT_LAND_INDEX

export const RANDOM_MOVE_SLOT_ITEM_SIZE = 72

export const RANDOM_MOVE_SLOT_ITEM_GAP = 10

/** 선형 진행(0~1) → 실제 이동 진행(0~1): 앞은 등속, 뒤는 감속 */
export function mapSlotSpinProgress(linearProgress: number): number {
  const fastEnd = RANDOM_MOVE_SLOT_FAST_PHASE_RATIO
  const distEnd = RANDOM_MOVE_SLOT_FAST_DISTANCE_RATIO

  if (linearProgress <= 0) return 0
  if (linearProgress >= 1) return 1

  if (linearProgress <= fastEnd) {
    return (linearProgress / fastEnd) * distEnd
  }

  const t = (linearProgress - fastEnd) / (1 - fastEnd)
  const eased = 1 - Math.pow(1 - t, RANDOM_MOVE_SLOT_DECEL_POWER)
  return distEnd + (1 - distEnd) * eased
}

export function formatRandomMoveDestinationLabel(
  targetTileId: number,
  tiles: readonly Tile[],
): string {
  const target = tiles[targetTileId]
  const name = target?.name ?? '이동 칸'
  return `${targetTileId}번 ${name}(으)로 이동!`
}

export function buildRandomMoveSlotItems(tiles: readonly Tile[]): RandomMoveSlotItem[] {
  return getRandomMoveTargetTileIds(tiles)
    .sort((a, b) => a - b)
    .map((tileId) => {
      const tile = tiles[tileId]
      return {
        id: String(tileId),
        tileId,
        image: '',
        name: tile?.name ?? `${tileId}번`,
      }
    })
}

export function getRandomMoveSlotItem(
  items: readonly RandomMoveSlotItem[],
  tileId: number,
): RandomMoveSlotItem | undefined {
  return items.find((item) => item.tileId === tileId)
}

export function isRandomMoveEventTile(tileId: number): boolean {
  return tileId === RANDOM_MOVE_TILE_ID
}

/** 15번(랜덤이동)을 제외한 모든 보드 칸 */
export function getRandomMoveTargetTileIds(tiles: readonly Tile[]): number[] {
  return tiles.filter((tile) => tile.id !== RANDOM_MOVE_TILE_ID).map((tile) => tile.id)
}

/** 앞·뒤 중 더 짧은 경로 (칸 수) */
export function shortestStepsToTarget(from: number, target: number): number {
  const forward = (target - from + BOARD_SIZE) % BOARD_SIZE
  if (forward === 0) return 0
  const backward = forward - BOARD_SIZE
  return forward <= BOARD_SIZE - forward ? forward : backward
}

function maxForwardStepsOnLastLap(position: number): number {
  if (position === 0) return BOARD_SIZE
  return BOARD_SIZE - position
}

/** 마지막 바퀴 앞으로 이동 상한 — useGame.capForwardSteps 와 동일 */
function capForwardStepsForLap(
  position: number,
  steps: number,
  lapCount: number,
  totalLaps: number,
): number {
  if (steps <= 0 || lapCount !== totalLaps - 1) return steps
  return Math.min(steps, maxForwardStepsOnLastLap(position))
}

export function isReachableRandomMoveTarget(
  from: number,
  target: number,
  lapCount: number,
  totalLaps: number,
): boolean {
  const steps = shortestStepsToTarget(from, target)
  return capForwardStepsForLap(from, steps, lapCount, totalLaps) === steps
}

export function pickRandomMoveTargetTileId(
  tiles: readonly Tile[],
  fromPos: number,
  lapCount: number,
  totalLaps: number,
): number {
  const candidates = getRandomMoveTargetTileIds(tiles)
  const reachable = candidates.filter((id) =>
    isReachableRandomMoveTarget(fromPos, id, lapCount, totalLaps),
  )
  const pool = reachable.length > 0 ? reachable : candidates
  return pool[Math.floor(Math.random() * pool.length)]!
}
