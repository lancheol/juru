import water01 from '../assets/tile-modals/bridge-water/water-01.png'
import water02 from '../assets/tile-modals/bridge-water/water-02.png'
import {
  createInitialPhotoEventUsedTurn,
  pickPhotoEventImage,
} from './photoEventPick'

export const BRIDGE_WATER_MODAL_TITLE = '물'

export const BRIDGE_WATER_MODAL_MESSAGE = '물 마셔..'

export const BRIDGE_WATER_IMAGES = [water01, water02] as const

export const BRIDGE_WATER_IMAGE_COUNT = BRIDGE_WATER_IMAGES.length

export function createInitialBridgeWaterImageUsedTurn(): number[] {
  return createInitialPhotoEventUsedTurn(BRIDGE_WATER_IMAGE_COUNT)
}

export function pickBridgeWaterImage(
  currentTurn: number,
  lastImageIndex: number | null,
  imageUsedTurn: readonly number[],
): number {
  return pickPhotoEventImage(
    BRIDGE_WATER_IMAGE_COUNT,
    currentTurn,
    lastImageIndex,
    imageUsedTurn,
  )
}
