export type RoulettePhase = 'idle' | 'spinning' | 'result'

export interface RouletteSegment {
  id: string
  label: string
  color: string
  description?: string
  drinkCount?: number
  /** 이동 룰렛: 양수=앞, 음수=뒤, 0=제자리 */
  moveSteps?: number
  /** 이동 룰렛: 출발 칸으로 이동 */
  goToStart?: boolean
}

export interface RouletteSession {
  tileId: number
  phase: RoulettePhase
  segments: RouletteSegment[]
  resultIndex: number | null
  rotationDeg: number
}
