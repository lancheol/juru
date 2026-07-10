import type { RouletteSegment, RouletteSession } from '../types/roulette'
import {
  createMoveRouletteSegmentsForSession,
  isMoveRouletteTile,
} from './moveRoulette'

/** id 4, 10, 19, 23, 29 */
export const DEATH_ROULETTE_TILE_IDS = [4, 10, 19, 23, 29] as const

export const DEATH_ROULETTE_TILE_NAME = '죽음의 룰렛'

export const DEATH_ROULETTE_SEGMENTS: RouletteSegment[] = [
  { id: 'water-1', label: '물 1잔', color: '#9ecae8' },
  { id: 'alcohol-1', label: '술 1잔', color: '#f4a6a6', drinkCount: 1 },
  {
    id: 'two-line-poem-1',
    label: '2행시',
    color: '#cdb4f5',
    description: '내 왼쪽 사람이 정해주는 단어로 2행시하고\n오른쪽 사람한테 평가 받기',
  },
  {
    id: 'alcohol-exemption',
    label: '술 1잔 면제권',
    color: '#ffe8a3',
    description: '걸렸을때 쓸 수 있는 면제권 팀원 중 한명만 사용가능',
  },
  { id: 'other-team-drink', label: '우리팀 빼고 1잔', color: '#d4b8a8' },
  {
    id: 'two-line-poem-2',
    label: '2행시',
    color: '#dda8f0',
    description: '내 왼쪽 사람이 정해주는 단어로 2행시하고\n오른쪽 사람한테 평가 받기',
  },
  {
    id: 'team-swap',
    label: '팀바꾸기',
    color: '#9edfd4',
    description: '팀원들과 논의 후 한명을 다른 팀원 한명과 교체 가능\n(안바꾸기 X, 팀 바뀌면 자리 옮기기)',
  },
  {
    id: 'water-ghost',
    label: '물귀신',
    color: '#a8ddf5',
    description: '룰렛 걸린 사람이 한명 지목해서 같이 마시기',
  },
  {
    id: 'five-strengths',
    label: '나의 장점 5개 말하기',
    color: '#f5a8c8',
    description: '룰렛 걸린 사람이 한명을 지목\n5초안에 장점을 5개 말하기',
  },
  {
    id: 'forbidden-word',
    label: '금지어 추가',
    color: '#b8c4d0',
    description: '전역적으로 금지될 금지어를 추가',
  },
  { id: 'alcohol-2', label: '술 2잔', color: '#e89292', drinkCount: 2 },
  {
    id: 'bomb-shot-chef',
    label: '폭탄주 요리사',
    color: '#ffd4a8',
    description: '룰렛 걸린 사람이 원하는 재료 1개 추가',
  },
  { id: 'random-game', label: '랜덤게임', color: '#a8e0a8' },
  { id: 'love-shot', label: '한 명 지목 러브샷', color: '#f8b0d0' },
  {
    id: 'acquaintance-call',
    label: '지인 전화',
    color: '#a8b8f0',
    description: '룰렛 걸린 사람이 지인에게 전화해서 안받으면 1잔, 받으면 통과',
  },
  { id: 'communist-party', label: '공산당', color: '#e8a0a0' },
]

/** @deprecated DEATH_ROULETTE_SEGMENTS 사용 */
export const DEFAULT_ROULETTE_SEGMENTS = DEATH_ROULETTE_SEGMENTS

export function isRouletteTile(tileId: number): boolean {
  return (
    isMoveRouletteTile(tileId) ||
    (DEATH_ROULETTE_TILE_IDS as readonly number[]).includes(tileId)
  )
}

export function shuffleRouletteSegments<T>(segments: readonly T[]): T[] {
  const shuffled = [...segments]
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
  }
  return shuffled
}

export function createRouletteSession(tileId: number): RouletteSession {
  const isMove = isMoveRouletteTile(tileId)

  return {
    tileId,
    phase: 'idle',
    // 이동 룰렛: 칸 위치만 셔플, 색상은 라벨 척도에서 고정
    segments: isMove
      ? shuffleRouletteSegments(createMoveRouletteSegmentsForSession())
      : [...DEATH_ROULETTE_SEGMENTS],
    resultIndex: null,
    rotationDeg: 0,
  }
}

export function pickRandomSegmentIndex(segmentCount: number): number {
  return Math.floor(Math.random() * segmentCount)
}

/** 위쪽 화살표에 segment index가 오도록 회전 각도 계산 */
export function computeSpinRotation(
  currentRotationDeg: number,
  targetIndex: number,
  segmentCount: number,
): number {
  const slice = 360 / segmentCount
  const segmentCenter = targetIndex * slice + slice / 2
  const currentMod = ((currentRotationDeg % 360) + 360) % 360
  const alignDelta = (360 - segmentCenter - currentMod + 360) % 360
  const extraSpins = (5 + Math.floor(Math.random() * 4)) * 360
  return currentRotationDeg + extraSpins + alignDelta
}

export function buildRouletteConicGradient(segments: RouletteSegment[]): string {
  const slice = 360 / segments.length
  const stops = segments.map((seg, i) => {
    const start = (i * slice).toFixed(2)
    const end = ((i + 1) * slice).toFixed(2)
    return `${seg.color} ${start}deg ${end}deg`
  })
  return `conic-gradient(from -90deg, ${stops.join(', ')})`
}

/** 이동 룰렛 칸 색 — 짝수 인덱스 파스텔 빨강, 홀수 인덱스 파스텔 검정 */
export const MOVE_ROULETTE_RED = '#f0a8a8'
export const MOVE_ROULETTE_BLACK = '#b8b0bc'

export function getMoveRouletteWedgeColor(index: number): string {
  return index % 2 === 0 ? MOVE_ROULETTE_RED : MOVE_ROULETTE_BLACK
}

/** 이동 룰렛 결과 배지 — 뒤로/처음으로는 파스텔 검정, 그 외는 파스텔 빨강 */
export function getMoveRouletteResultBackground(segment: RouletteSegment): string {
  if (
    segment.goToStart ||
    segment.moveSteps === -1 ||
    segment.moveSteps === -2
  ) {
    return MOVE_ROULETTE_BLACK
  }
  return MOVE_ROULETTE_RED
}

/** 이동 룰렛: 파스텔 빨강·검정 교차 */
export function buildMoveRouletteConicGradient(segmentCount: number): string {
  const slice = 360 / segmentCount
  const stops: string[] = []
  for (let i = 0; i < segmentCount; i++) {
    const segStart = i * slice
    stops.push(
      `${getMoveRouletteWedgeColor(i)} ${segStart.toFixed(2)}deg ${((i + 1) * slice).toFixed(2)}deg`,
    )
  }
  return `conic-gradient(from -90deg, ${stops.join(', ')})`
}
