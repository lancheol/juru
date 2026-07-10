import cupid01 from '../assets/tile-modals/cupid/cupid-01.png'
import cupid02 from '../assets/tile-modals/cupid/cupid-02.png'
import {
  createInitialPhotoEventUsedTurn,
  pickPhotoEventImage,
} from './photoEventPick'

/** id 7, 20 */
export const CUPID_TILE_IDS = [7, 20] as const

export const CUPID_TILE_NAME = '사랑의 큐피트'

export const CUPID_TILE_DESCRIPTION = '주사위 굴린 사람이 두 명 지목해서 러브샷 시키기'

export const CUPID_IMAGES = [cupid01, cupid02] as const

export const CUPID_IMAGE_COUNT = CUPID_IMAGES.length

export function isCupidEventTile(tileId: number): boolean {
  return (CUPID_TILE_IDS as readonly number[]).includes(tileId)
}

export function createInitialCupidImageUsedTurn(): number[] {
  return createInitialPhotoEventUsedTurn(CUPID_IMAGE_COUNT)
}

export function pickCupidImage(
  currentTurn: number,
  lastImageIndex: number | null,
  imageUsedTurn: readonly number[],
): number {
  return pickPhotoEventImage(
    CUPID_IMAGE_COUNT,
    currentTurn,
    lastImageIndex,
    imageUsedTurn,
  )
}
