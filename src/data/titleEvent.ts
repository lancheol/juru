import chef01 from '../assets/tile-modals/bomb-chef/chef-01.png'
import chef02 from '../assets/tile-modals/bomb-chef/chef-02.png'
import chef03 from '../assets/tile-modals/bomb-chef/chef-03.png'
import {
  createInitialPhotoEventUsedTurn,
  pickPhotoEventImage,
  PHOTO_EVENT_COOLDOWN_TURNS,
} from './photoEventPick'

/** id 3, 11, 17 */
export const TITLE_EVENT_TILE_IDS = [3, 11, 17] as const

export const BOMB_CHEF_TILE_NAME = '오늘은 내가 폭탄주 요리사'

export const BOMB_CHEF_TILE_DESCRIPTION =
  '주사위를 굴린 사람이 폭탄주에 원하는 재료 하나 추가하기'

export const BOMB_CHEF_IMAGES = [chef01, chef02, chef03] as const

export const TITLE_EVENT_IMAGE_COUNT = BOMB_CHEF_IMAGES.length

export const TITLE_EVENT_IMAGE_COOLDOWN_TURNS = PHOTO_EVENT_COOLDOWN_TURNS

export function isTitleEventTile(tileId: number): boolean {
  return (TITLE_EVENT_TILE_IDS as readonly number[]).includes(tileId)
}

export function createInitialTitleEventImageUsedTurn(): number[] {
  return createInitialPhotoEventUsedTurn(TITLE_EVENT_IMAGE_COUNT)
}

export function pickTitleEventImage(
  currentTurn: number,
  lastImageIndex: number | null,
  imageUsedTurn: readonly number[],
): number {
  return pickPhotoEventImage(
    TITLE_EVENT_IMAGE_COUNT,
    currentTurn,
    lastImageIndex,
    imageUsedTurn,
  )
}
