import type { Tile, TileEventVisualKey, TileType } from '../types/game'
import allFrame from '../assets/tile-modals/all.svg'
import bridgeFrame from '../assets/tile-modals/bridge.svg'
import drink01 from '../assets/tile-modals/bridge-alcohol/drink-01.png'
import water01 from '../assets/tile-modals/bridge-water/water-01.png'
import drinkFrame from '../assets/tile-modals/drink.svg'
import missionFrame from '../assets/tile-modals/mission.svg'
import moveFrame from '../assets/tile-modals/move.svg'
import safeFrame from '../assets/tile-modals/safe.svg'
import startFrame from '../assets/tile-modals/start.svg'
import bombChef01 from '../assets/tile-modals/bomb-chef/chef-01.png'
import tile01Frame from '../assets/tile-modals/by-tile/tile-01.png'
import tile06Frame from '../assets/tile-modals/by-tile/tile-06.png'
import tile13Frame from '../assets/tile-modals/by-tile/tile-13.png'
import tile14Frame from '../assets/tile-modals/by-tile/tile-14.png'
import tile16Frame from '../assets/tile-modals/by-tile/tile-16.png'
import bottomGlassTaxFrame from '../assets/tile-modals/by-tile/bottom-glass-tax.png'
import bombShotDrinkFrame from '../assets/tile-modals/by-tile/bomb-shot-drink.png'
import financeDeptFrame from '../assets/tile-modals/by-tile/finance-dept.png'
import randomTeamDrinkFrame from '../assets/tile-modals/by-tile/random-team-drink.png'
import tile18Frame from '../assets/tile-modals/by-tile/tile-18.png'
import exceptEljundan01 from '../assets/tile-modals/except-eljundan/eljundan-01.png'
import island01 from '../assets/tile-modals/island/island-01.png'
import { START_LAP_IMAGE, START_TILE_ID } from './startLapEvent'

/** 칸 이벤트 모달 외형 키 — 타일 type 또는 주당의 길 세그먼트 */
export type { TileEventVisualKey } from '../types/game'

export interface TileEventModalTheme {
  /** 모달 테두리·배경 형태 이미지 (교체 시 이 경로만 바꾸면 됨) */
  frameImage: string
  /** 보조 CSS 클래스 */
  className?: string
  /** 제목 색 */
  titleColor?: string
  /** photo: 이미지 전체 표시 / frame: 테두리 프레임 배경 */
  layout?: 'frame' | 'photo'
}

/**
 * 타일 type별 기본 모달 테마
 * 칸마다 다르게 쓰려면 TILE_EVENT_MODAL_BY_TILE_ID에 추가
 */
export const TILE_EVENT_MODAL_BY_TYPE: Record<TileType, TileEventModalTheme> = {
  start: { frameImage: startFrame, className: 'tile-event-modal--start', titleColor: '#8b6914' },
  drink: { frameImage: drinkFrame, className: 'tile-event-modal--drink', titleColor: '#8b2020' },
  mission: { frameImage: missionFrame, className: 'tile-event-modal--mission', titleColor: '#1a5080' },
  move: { frameImage: moveFrame, className: 'tile-event-modal--move', titleColor: '#2a8fc9' },
  all: { frameImage: allFrame, className: 'tile-event-modal--all', titleColor: '#c45c00' },
  safe: { frameImage: safeFrame, className: 'tile-event-modal--safe', titleColor: '#1a7a45' },
  bridge: { frameImage: bridgeFrame, className: 'tile-event-modal--bridge', titleColor: '#bf360c' },
  ladder: { frameImage: missionFrame, className: 'tile-event-modal--ladder', titleColor: '#2a8fc9' },
  roulette: { frameImage: missionFrame, className: 'tile-event-modal--roulette', titleColor: '#8b2020' },
  title: {
    frameImage: bombChef01,
    className: 'tile-event-modal--tile-photo',
    titleColor: '#bf360c',
    layout: 'photo',
  },
  island: {
    frameImage: island01,
    className: 'tile-event-modal--tile-photo',
    titleColor: '#2c5282',
    layout: 'photo',
  },
  'random-move': {
    frameImage: tile18Frame,
    className: 'tile-event-modal--tile-photo',
    titleColor: '#4a148c',
    layout: 'photo',
  },
}

/** 주당의 길 세그먼트 (술/물) */
export const TILE_EVENT_MODAL_BRIDGE_SEGMENT: Record<'alcohol' | 'water', TileEventModalTheme> = {
  alcohol: {
    frameImage: drink01,
    className: 'tile-event-modal--tile-photo tile-event-modal--bridge-alcohol-photo',
    titleColor: '#c62828',
    layout: 'photo',
  },
  water: {
    frameImage: water01,
    className: 'tile-event-modal--tile-photo tile-event-modal--bridge-water-photo',
    titleColor: '#1565c0',
    layout: 'photo',
  },
}

/**
 * 특정 칸 번호(id)에만 다른 모달 이미지를 쓰고 싶을 때 여기에 추가
 * 예: 5: { frameImage: customImg, ... }
 */
export const TILE_EVENT_MODAL_BY_TILE_ID: Partial<Record<number, TileEventModalTheme>> = {
  /** 출발 칸 (id 0) — n바퀴 사진 */
  [START_TILE_ID]: {
    frameImage: START_LAP_IMAGE,
    className: 'tile-event-modal--tile-photo',
    titleColor: '#1a5f8a',
    layout: 'photo',
  },
  /** 1번 칸 (id 1) — 업로드 이미지 */
  1: {
    frameImage: tile01Frame,
    className: 'tile-event-modal--tile-photo',
    titleColor: '#1a5f8a',
    layout: 'photo',
  },
  /** 5번 칸 (id 5) */
  5: {
    frameImage: tile06Frame,
    className: 'tile-event-modal--tile-photo',
    titleColor: '#1a5f8a',
    layout: 'photo',
  },
  /** 12번 칸 (id 12) */
  12: {
    frameImage: tile13Frame,
    className: 'tile-event-modal--tile-photo',
    titleColor: '#1a5f8a',
    layout: 'photo',
  },
  /** 13번 칸 (id 13) */
  13: {
    frameImage: tile14Frame,
    className: 'tile-event-modal--tile-photo',
    titleColor: '#1a5f8a',
    layout: 'photo',
  },
  /** 16번 칸 (id 16) — 회장단 마셔 */
  16: {
    frameImage: tile16Frame,
    className: 'tile-event-modal--tile-photo',
    titleColor: '#1a5f8a',
    layout: 'photo',
  },
  /** 18번 칸 (id 18) — 밑잔 세무조사 */
  18: {
    frameImage: bottomGlassTaxFrame,
    className: 'tile-event-modal--tile-photo',
    titleColor: '#1a5f8a',
    layout: 'photo',
  },
  /** 15번 칸 (id 15) — 랜덤이동 */
  15: {
    frameImage: tile18Frame,
    className: 'tile-event-modal--tile-photo',
    titleColor: '#1a5f8a',
    layout: 'photo',
  },
  /** 22번 칸 (id 22) — 엘준단 빼고 다 마셔 */
  22: {
    frameImage: exceptEljundan01,
    className: 'tile-event-modal--tile-photo',
    titleColor: '#1a5f8a',
    layout: 'photo',
  },
  /** 24번 칸 (id 24) — 폭탄주 마셔 */
  24: {
    frameImage: bombShotDrinkFrame,
    className: 'tile-event-modal--tile-photo',
    titleColor: '#1a5f8a',
    layout: 'photo',
  },
  /** 26번 칸 (id 26) — 재무부 마셔 */
  26: {
    frameImage: financeDeptFrame,
    className: 'tile-event-modal--tile-photo',
    titleColor: '#1a5f8a',
    layout: 'photo',
  },
  /** 27번 칸 (id 27) — 랜덤 팀 마셔 */
  27: {
    frameImage: randomTeamDrinkFrame,
    className: 'tile-event-modal--tile-photo',
    titleColor: '#1a5f8a',
    layout: 'photo',
  },
}

export function getTileEventModalTheme(
  visualKey: TileEventVisualKey,
  tileId?: number,
): TileEventModalTheme {
  if (visualKey === 'bridge-alcohol') {
    return TILE_EVENT_MODAL_BRIDGE_SEGMENT.alcohol
  }
  if (visualKey === 'bridge-water') {
    return TILE_EVENT_MODAL_BRIDGE_SEGMENT.water
  }

  if (tileId != null && TILE_EVENT_MODAL_BY_TILE_ID[tileId]) {
    return TILE_EVENT_MODAL_BY_TILE_ID[tileId]!
  }

  return TILE_EVENT_MODAL_BY_TYPE[visualKey as TileType]
}

export function getTileEventVisualKey(tile: Tile): TileEventVisualKey {
  return tile.type
}
