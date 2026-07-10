import type { GameConfig, Player } from '../types/game'
import type { PlayerItemId } from '../types/playerItem'

export const PLAYER_COLORS = [
  '#e74c3c',
  '#3498db',
  '#2ecc71',
  '#f39c12',
  '#9b59b6',
  '#1abc9c',
] as const

export const MIN_PLAYERS = 2
export const MAX_PLAYERS = PLAYER_COLORS.length
export const MAX_LAPS = 5

export function createPlayersFromConfig(config: GameConfig): Player[] {
  return config.players.map((entry, index) => ({
    id: index,
    name: entry.name.trim() || `플레이어 ${index + 1}`,
    position: 0,
    color: PLAYER_COLORS[index % PLAYER_COLORS.length],
    drinkCount: 0,
    lapCount: 0,
    bridgeStatus: 'none',
    bridgeSegment: null,
    islandStatus: 'none',
    islandEscapeTurnsLeft: 0,
    items: [] as PlayerItemId[],
  }))
}

export function defaultPlayerNames(count: number): string[] {
  return Array.from({ length: count }, (_, i) => `플레이어 ${i + 1}`)
}
