import type { Tile } from '../types/game'
import { BRIDGE_ENTRANCE } from './bridge'
import { BOMB_CHEF_TILE_NAME, BOMB_CHEF_TILE_DESCRIPTION } from './titleEvent'
import { RANDOM_GAME_TILE_NAME } from './randomGameEvent'
import { CUPID_TILE_NAME, CUPID_TILE_DESCRIPTION } from './cupidEvent'
import { ISLAND_TILE_NAME, ISLAND_TILE_DESCRIPTION, ISLAND_TILE_ID } from './desertIsland'
import { DEATH_ROULETTE_TILE_NAME } from './roulette'
import {
  MOVE_ROULETTE_TILE_DESCRIPTION,
  MOVE_ROULETTE_TILE_ID,
  MOVE_ROULETTE_TILE_NAME,
} from './moveRoulette'
import {
  RANDOM_TEAM_DRINK_TILE_DESCRIPTION,
  RANDOM_TEAM_DRINK_TILE_ID,
  RANDOM_TEAM_DRINK_TILE_NAME,
} from './randomTeamDrinkEvent'
import {
  RANDOM_MOVE_TILE_DESCRIPTION,
  RANDOM_MOVE_TILE_ID,
  RANDOM_MOVE_TILE_NAME,
} from './randomMoveEvent'
import {
  FINANCE_DEPT_DRINK_TILE_DESCRIPTION,
  FINANCE_DEPT_DRINK_TILE_ID,
  FINANCE_DEPT_DRINK_TILE_NAME,
} from './financeDeptDrinkEvent'
import {
  PRESIDENT_TEAM_TILE_DESCRIPTION,
  PRESIDENT_TEAM_TILE_ID,
  PRESIDENT_TEAM_TILE_NAME,
} from './presidentTeamEvent'
import {
  BOMB_SHOT_DRINK_TILE_DESCRIPTION,
  BOMB_SHOT_DRINK_TILE_ID,
  BOMB_SHOT_DRINK_TILE_NAME,
} from './bombShotDrinkEvent'
import {
  BOTTOM_GLASS_TAX_TILE_DESCRIPTION,
  BOTTOM_GLASS_TAX_TILE_ID,
  BOTTOM_GLASS_TAX_TILE_NAME,
} from './bottomGlassTaxEvent'
import {
  EXCEPT_ELJUNDAN_TILE_DESCRIPTION,
  EXCEPT_ELJUNDAN_TILE_ID,
  EXCEPT_ELJUNDAN_TILE_NAME,
} from './exceptEljundanEvent'

/** 각 면 칸 수 (모서리 중복 없음): 위 10 → 오른쪽 6 → 아래 9 → 왼쪽 5 = 30칸 */
export const SIDE_TOP = 10
export const SIDE_RIGHT = 6
export const SIDE_BOTTOM = 9
export const SIDE_LEFT = 5
export const BOARD_SIZE = SIDE_TOP + SIDE_RIGHT + SIDE_BOTTOM + SIDE_LEFT

/** 출발 칸 직전 칸 (id 29) */
export const PRE_FINISH_POSITION = BOARD_SIZE - 1

/** 검은 청색 스타일 타일 (출발 0번 제외) */
export const DARK_NAVY_TILE_IDS = [9, 15, 24] as const

export function isDarkNavyTile(tileId: number): boolean {
  return (DARK_NAVY_TILE_IDS as readonly number[]).includes(tileId)
}

export const GRID_COLS = SIDE_TOP
export const GRID_ROWS = 7

const missionPool: Omit<Tile, 'id'>[] = [
  { name: '원샷', type: 'drink', description: '원샷 하세요!', drinkCount: 1 },
  { name: '반잔', type: 'drink', description: '반잔 마시기', drinkCount: 1 },
  { name: '두 잔', type: 'drink', description: '두 잔 마시기', drinkCount: 2 },
  { name: '눈 감고', type: 'mission', description: '눈 감고 마시기' },
  { name: '좌회전', type: 'move', description: '뒤로 3칸!', moveSteps: -3 },
  { name: '우회전', type: 'move', description: '앞으로 3칸!', moveSteps: 3 },
  { name: '뒤로', type: 'move', description: '뒤로 2칸!', moveSteps: -2 },
  { name: '앞으로', type: 'move', description: '앞으로 2칸!', moveSteps: 2 },
  { name: '따르기', type: 'mission', description: '옆 사람에게 잔 따르기' },
  { name: '건배', type: 'all', description: '다 같이 건배!' },
  { name: '전원', type: 'all', description: '전원 한 잔!' },
  { name: '21', type: 'mission', description: '21 게임! 진 사람 마시기' },
  { name: '업다운', type: 'mission', description: '업다운! 틀리면 마시기' },
  { name: '벌주', type: 'drink', description: '벌주 한 잔', drinkCount: 1 },
  { name: '지목', type: 'mission', description: '마음에 드는 사람 지목해서 같이 마시기' },
  { name: '최근', type: 'mission', description: '가장 최근에 연락한 사람 이름 말하기' },
  { name: '초성', type: 'mission', description: '초성 게임! 틀리면 마시기' },
  { name: '노래', type: 'mission', description: '노래 한 소절 부르기' },
  { name: '밸런스', type: 'mission', description: '밸런스 게임! 소수가 마시기' },
  { name: '러브', type: 'mission', description: '좋아하는 이상형 말하기' },
  { name: '쉬어', type: 'safe', description: '쉬어가기! 패스' },
  { name: '거짓', type: 'mission', description: '거짓말 하나 하기' },
  { name: '진실', type: 'mission', description: '진실게임 한 판' },
  { name: '셀카', type: 'mission', description: '단체 셀카 찍기' },
  { name: '왼쪽', type: 'mission', description: '왼쪽 사람과 건배' },
  { name: '오른쪽', type: 'mission', description: '오른쪽 사람과 건배' },
  { name: '랜덤', type: 'mission', description: '랜덤 미션! 주사위 눈만큼 마시기' },
  { name: '더블', type: 'drink', description: '더블샷!', drinkCount: 2 },
  { name: '물', type: 'safe', description: '물 한 잔 (술 대신)' },
  { name: '왕관', type: 'mission', description: '왕관 게임! 왕이 명령' },
  { name: '텔레', type: 'mission', description: '텔레파시! 틀리면 마시기' },
  { name: '라임', type: 'mission', description: '라임 끼우기' },
  { name: '스피드', type: 'mission', description: '스피드 게임! 진 사람 마시기' },
  { name: '복불', type: 'all', description: '복불복! 걸린 사람 마시기' },
]

function createBoardTiles(): Tile[] {
  const tiles: Tile[] = [
    { id: 0, name: '출발', type: 'start', description: '시작! 건배 한 잔 🍻' },
  ]

  for (let i = 1; i < BOARD_SIZE; i++) {
    const template = missionPool[(i - 1) % missionPool.length]
    tiles.push({ id: i, ...template })
  }

  tiles[1] = {
    id: 1,
    name: '주사위 굴린 사람 마셔',
    type: 'drink',
    description: '주사위 굴린 사람 마셔',
    drinkCount: 1,
  }

  tiles[2] = {
    id: 2,
    name: '사다리타기',
    type: 'ladder',
    description: '사다리타기! 운을 시험해 보세요',
  }

  const bombChefTile: Omit<Tile, 'id'> = {
    name: BOMB_CHEF_TILE_NAME,
    type: 'title',
    description: BOMB_CHEF_TILE_DESCRIPTION,
  }

  tiles[3] = { id: 3, ...bombChefTile }
  tiles[11] = { id: 11, ...bombChefTile }
  tiles[17] = { id: 17, ...bombChefTile }

  const randomGameTile: Omit<Tile, 'id'> = {
    name: RANDOM_GAME_TILE_NAME,
    type: 'title',
    description: '',
  }

  tiles[6] = { id: 6, ...randomGameTile }
  tiles[14] = { id: 14, ...randomGameTile }
  tiles[21] = { id: 21, ...randomGameTile }

  const cupidTile: Omit<Tile, 'id'> = {
    name: CUPID_TILE_NAME,
    type: 'title',
    description: CUPID_TILE_DESCRIPTION,
  }

  tiles[7] = { id: 7, ...cupidTile }
  tiles[20] = { id: 20, ...cupidTile }

  tiles[ISLAND_TILE_ID] = {
    id: ISLAND_TILE_ID,
    name: ISLAND_TILE_NAME,
    type: 'island',
    description: ISLAND_TILE_DESCRIPTION,
  }

  tiles[5] = {
    id: 5,
    name: '홍제부 마셔',
    type: 'drink',
    description: '홍제부 마셔',
    drinkCount: 1,
  }

  tiles[12] = {
    id: 12,
    name: '학기부 마셔',
    type: 'drink',
    description: '학기부 마셔',
    drinkCount: 1,
  }

  tiles[13] = {
    id: 13,
    name: '야자타임',
    type: 'drink',
    description: '야자타임',
    drinkCount: 1,
  }

  tiles[PRESIDENT_TEAM_TILE_ID] = {
    id: PRESIDENT_TEAM_TILE_ID,
    name: PRESIDENT_TEAM_TILE_NAME,
    type: 'drink',
    description: PRESIDENT_TEAM_TILE_DESCRIPTION,
    drinkCount: 1,
  }

  tiles[BOTTOM_GLASS_TAX_TILE_ID] = {
    id: BOTTOM_GLASS_TAX_TILE_ID,
    name: BOTTOM_GLASS_TAX_TILE_NAME,
    type: 'drink',
    description: BOTTOM_GLASS_TAX_TILE_DESCRIPTION,
    drinkCount: 1,
  }

  tiles[EXCEPT_ELJUNDAN_TILE_ID] = {
    id: EXCEPT_ELJUNDAN_TILE_ID,
    name: EXCEPT_ELJUNDAN_TILE_NAME,
    type: 'drink',
    description: EXCEPT_ELJUNDAN_TILE_DESCRIPTION,
    drinkCount: 1,
  }

  tiles[BOMB_SHOT_DRINK_TILE_ID] = {
    id: BOMB_SHOT_DRINK_TILE_ID,
    name: BOMB_SHOT_DRINK_TILE_NAME,
    type: 'drink',
    description: BOMB_SHOT_DRINK_TILE_DESCRIPTION,
    drinkCount: 1,
  }

  tiles[FINANCE_DEPT_DRINK_TILE_ID] = {
    id: FINANCE_DEPT_DRINK_TILE_ID,
    name: FINANCE_DEPT_DRINK_TILE_NAME,
    type: 'drink',
    description: FINANCE_DEPT_DRINK_TILE_DESCRIPTION,
    drinkCount: 1,
  }

  tiles[RANDOM_TEAM_DRINK_TILE_ID] = {
    id: RANDOM_TEAM_DRINK_TILE_ID,
    name: RANDOM_TEAM_DRINK_TILE_NAME,
    type: 'drink',
    description: RANDOM_TEAM_DRINK_TILE_DESCRIPTION,
    drinkCount: 1,
  }

  tiles[RANDOM_MOVE_TILE_ID] = {
    id: RANDOM_MOVE_TILE_ID,
    name: RANDOM_MOVE_TILE_NAME,
    type: 'random-move',
    description: RANDOM_MOVE_TILE_DESCRIPTION,
  }

  const deathRouletteTile: Omit<Tile, 'id'> = {
    name: DEATH_ROULETTE_TILE_NAME,
    type: 'roulette',
    description: '죽음의 룰렛! 운명을 돌려보세요',
  }

  for (const tileId of [4, 10, 19, 23, 29]) {
    tiles[tileId] = { id: tileId, ...deathRouletteTile }
  }

  tiles[MOVE_ROULETTE_TILE_ID] = {
    id: MOVE_ROULETTE_TILE_ID,
    name: MOVE_ROULETTE_TILE_NAME,
    type: 'roulette',
    description: MOVE_ROULETTE_TILE_DESCRIPTION,
  }

  tiles[25] = {
    id: 25,
    name: '사다리타기',
    type: 'ladder',
    description: '사다리타기! 운을 시험해 보세요',
  }

  tiles[BRIDGE_ENTRANCE] = {
    id: BRIDGE_ENTRANCE,
    name: '주당의 길',
    type: 'bridge',
    description: '주당의 길 입구! 다음 턴에 주당의 길로 입장합니다 🍻',
  }

  return tiles
}

export const boardTiles = createBoardTiles()

/**
 * 윗면(왼→오 10) → 오른쪽(위→아래 6) → 아랫면(오→왼 9) → 왼쪽(아래→위 5)
 * 그리드: 10열 × 7행, 가운데는 비움 — 총 30칸(0~29), 칸마다 그리드 1:1
 */
export function pathIndexToPoint(index: number): { row: number; col: number } {
  return pathIndexToGrid(index)
}

/** 타일 배치·말 정지용 정수 그리드 */
export function pathIndexToGrid(index: number): { row: number; col: number } {
  if (index < SIDE_TOP) {
    return { row: 0, col: index }
  }

  if (index < SIDE_TOP + SIDE_RIGHT) {
    const i = index - SIDE_TOP
    return { row: 1 + i, col: GRID_COLS - 1 }
  }

  if (index < SIDE_TOP + SIDE_RIGHT + SIDE_BOTTOM) {
    const bottomIndex = index - SIDE_TOP - SIDE_RIGHT
    return { row: GRID_ROWS - 1, col: GRID_COLS - 2 - bottomIndex }
  }

  const leftIndex = index - SIDE_TOP - SIDE_RIGHT - SIDE_BOTTOM
  return { row: GRID_ROWS - 2 - leftIndex, col: 0 }
}

export function buildBoardGrid(tiles: Tile[]): (Tile | null)[][] {
  const grid: (Tile | null)[][] = Array.from({ length: GRID_ROWS }, () =>
    Array.from({ length: GRID_COLS }, () => null),
  )

  for (const tile of tiles) {
    const { row, col } = pathIndexToGrid(tile.id)
    grid[row][col] = tile
  }

  return grid
}
