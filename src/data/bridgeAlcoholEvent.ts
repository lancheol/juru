import drink01 from '../assets/tile-modals/bridge-alcohol/drink-01.png'
import drink02 from '../assets/tile-modals/bridge-alcohol/drink-02.png'
import drink03 from '../assets/tile-modals/bridge-alcohol/drink-03.png'
import {
  createInitialPhotoEventUsedTurn,
  pickPhotoEventImage,
} from './photoEventPick'

export const BRIDGE_ALCOHOL_MODAL_TITLE = '술'

export const BRIDGE_ALCOHOL_MODAL_MESSAGE = '너 마셔.'

export const BRIDGE_ALCOHOL_IMAGES = [drink01, drink02, drink03] as const

export const BRIDGE_ALCOHOL_IMAGE_COUNT = BRIDGE_ALCOHOL_IMAGES.length

export function createInitialBridgeAlcoholImageUsedTurn(): number[] {
  return createInitialPhotoEventUsedTurn(BRIDGE_ALCOHOL_IMAGE_COUNT)
}

export function pickBridgeAlcoholImage(
  currentTurn: number,
  lastImageIndex: number | null,
  imageUsedTurn: readonly number[],
): number {
  return pickPhotoEventImage(
    BRIDGE_ALCOHOL_IMAGE_COUNT,
    currentTurn,
    lastImageIndex,
    imageUsedTurn,
  )
}
