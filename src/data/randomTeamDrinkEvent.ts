import randomTeamDrinkImage from '../assets/tile-modals/by-tile/random-team-drink.png'

/** id 27 */
export const RANDOM_TEAM_DRINK_TILE_ID = 27

export const RANDOM_TEAM_DRINK_TILE_NAME = '랜덤 팀 마셔'

export const RANDOM_TEAM_DRINK_TILE_DESCRIPTION = '랜덤 팀 마셔'

export const RANDOM_TEAM_DRINK_IMAGE = randomTeamDrinkImage

export function isRandomTeamDrinkTile(tileId: number): boolean {
  return tileId === RANDOM_TEAM_DRINK_TILE_ID
}

export function pickRandomTeamDrinkTeam(
  playerNames: readonly string[],
  lastTeamIndex: number | null,
): {
  teamIndex: number
  teamName: string
} {
  if (playerNames.length === 0) {
    return { teamIndex: 0, teamName: '플레이어 1' }
  }

  const all = playerNames.map((_, index) => index)
  const pool =
    lastTeamIndex != null && all.length > 1
      ? all.filter((index) => index !== lastTeamIndex)
      : all
  const teamIndex = pool[Math.floor(Math.random() * pool.length)]!
  return {
    teamIndex,
    teamName: playerNames[teamIndex] ?? playerNames[0]!,
  }
}

export function formatRandomTeamDrinkMessage(teamName: string): string {
  return `${teamName} 마셔`
}
