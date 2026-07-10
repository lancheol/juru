import eljundan01 from '../assets/tile-modals/except-eljundan/eljundan-01.png'
import eljundan02 from '../assets/tile-modals/except-eljundan/eljundan-02.png'
import { BRIDGE_EXIT } from './bridge'
import {
  createInitialPhotoEventUsedTurn,
  pickPhotoEventImage,
} from './photoEventPick'

/** id 22 — 주당의 길 탈출 칸과 동일 */
export const EXCEPT_ELJUNDAN_TILE_ID = BRIDGE_EXIT

export const EXCEPT_ELJUNDAN_TILE_NAME = '엘준단 빼고 다 마셔'

export const EXCEPT_ELJUNDAN_TILE_DESCRIPTION = EXCEPT_ELJUNDAN_TILE_NAME

export const EXCEPT_ELJUNDAN_MODAL_NOTE = '엘준단 : 수연 관형 한철 현우 서현'

export const EXCEPT_ELJUNDAN_IMAGES = [eljundan01, eljundan02] as const

export const EXCEPT_ELJUNDAN_IMAGE_COUNT = EXCEPT_ELJUNDAN_IMAGES.length

export function isExceptEljundanEventTile(tileId: number): boolean {
  return tileId === EXCEPT_ELJUNDAN_TILE_ID
}

export function createInitialExceptEljundanImageUsedTurn(): number[] {
  return createInitialPhotoEventUsedTurn(EXCEPT_ELJUNDAN_IMAGE_COUNT)
}

export function pickExceptEljundanImage(
  currentTurn: number,
  lastImageIndex: number | null,
  imageUsedTurn: readonly number[],
): number {
  return pickPhotoEventImage(
    EXCEPT_ELJUNDAN_IMAGE_COUNT,
    currentTurn,
    lastImageIndex,
    imageUsedTurn,
  )
}
