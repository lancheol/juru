import startLapImage from '../assets/tile-modals/by-tile/start-lap.png'

export const START_TILE_ID = 0
export const START_LAP_MODAL_PREFIX = '벌써'
export const START_LAP_MODAL_SUFFIX = '바퀴'

export const START_LAP_IMAGE = startLapImage

export function formatStartLapModalMessage(lapCount: number): string {
  return `${START_LAP_MODAL_PREFIX} (${lapCount}) ${START_LAP_MODAL_SUFFIX}`
}
