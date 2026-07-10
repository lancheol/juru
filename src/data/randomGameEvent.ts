import game01 from '../assets/tile-modals/random-game/game-01.png'
import game02 from '../assets/tile-modals/random-game/game-02.png'
import game03 from '../assets/tile-modals/random-game/game-03.png'
import game04 from '../assets/tile-modals/random-game/game-04.png'
import game05 from '../assets/tile-modals/random-game/game-05.png'
import {
  createInitialPhotoEventUsedTurn,
  pickPhotoEventImage,
} from './photoEventPick'

/** id 6, 14, 21 */
export const RANDOM_GAME_TILE_IDS = [6, 14, 21] as const

export const RANDOM_GAME_TILE_NAME = '내가 좋아하는 랜덤게임'

export const RANDOM_GAME_IMAGES = [game01, game02, game03, game04, game05] as const

export const RANDOM_GAME_IMAGE_COUNT = RANDOM_GAME_IMAGES.length

export function isRandomGameEventTile(tileId: number): boolean {
  return (RANDOM_GAME_TILE_IDS as readonly number[]).includes(tileId)
}

export function createInitialRandomGameImageUsedTurn(): number[] {
  return createInitialPhotoEventUsedTurn(RANDOM_GAME_IMAGE_COUNT)
}

export function pickRandomGameImage(
  currentTurn: number,
  lastImageIndex: number | null,
  imageUsedTurn: readonly number[],
): number {
  return pickPhotoEventImage(
    RANDOM_GAME_IMAGE_COUNT,
    currentTurn,
    lastImageIndex,
    imageUsedTurn,
  )
}
