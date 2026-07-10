import type { Player } from '../types/game'
import island01 from '../assets/tile-modals/island/island-01.png'

/** id 9 */
export const ISLAND_TILE_ID = 9

export const ISLAND_TILE_NAME = '무인도'

export const ISLAND_TILE_DESCRIPTION = '무인도에 도착 ! 다음턴부터 주사위 더블 시 탈출'

export const ISLAND_ESCAPE_TURNS = 2

export const ISLAND_IMAGE = island01

export function isIslandTile(tileId: number): boolean {
  return tileId === ISLAND_TILE_ID
}

export function markIslandStranded(player: Player): Player {
  return {
    ...player,
    islandStatus: 'stranded',
    islandEscapeTurnsLeft: ISLAND_ESCAPE_TURNS,
  }
}

/** 무인도에 있고 탈출 시도 횟수가 남았으면 반드시 더블 주사위 */
export function mustUseIslandEscapeDice(player: Player): boolean {
  return player.position === ISLAND_TILE_ID && player.islandEscapeTurnsLeft > 0
}
