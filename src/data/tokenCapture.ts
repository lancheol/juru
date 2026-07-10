import type { Player } from '../types/game'

export interface BoardCaptureVictim {
  playerIndex: number
  player: Player
}

/** 출발 칸(0)에서는 잡기 없음 */
export function findBoardCaptureVictims(
  players: readonly Player[],
  landingPlayerIndex: number,
  landingPosition: number,
): BoardCaptureVictim[] {
  if (landingPosition === 0) return []

  const victims: BoardCaptureVictim[] = []

  players.forEach((player, playerIndex) => {
    if (playerIndex === landingPlayerIndex) return
    if (player.bridgeStatus !== 'none') return
    if (player.position !== landingPosition) return
    victims.push({ playerIndex, player })
  })

  return victims
}

export function resetPlayerToStart(player: Player): Player {
  return {
    ...player,
    position: 0,
    lapCount: player.lapCount,
    bridgeStatus: 'none',
    bridgeSegment: null,
    islandStatus: 'none',
    islandEscapeTurnsLeft: 0,
  }
}
