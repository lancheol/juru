export type LadderResultType = 'survive' | 'soju1' | 'soju2'

export type LadderGamePhase = 'select' | 'animate' | 'summary'

export interface LadderStructure {
  columnCount: number
  /** gap i = 세로선 i 와 i+1 사이 가로줄 (y: 0~1) */
  rungsByGap: number[][]
}

export interface LadderPathPoint {
  x: number
  y: number
}

export interface LadderPlayerPath {
  playerId: number
  startCol: number
  endCol: number
  points: LadderPathPoint[]
  result: LadderResultType
}

export interface LadderGameSession {
  tileId: number
  phase: LadderGamePhase
  ladder: LadderStructure
  /** 열(0..n-1) 아래에 배치된 결과 */
  results: LadderResultType[]
  /** 선택 순서 — 플레이어 인덱스 */
  selectionOrder: number[]
  /** selectionOrder 중 아직 선택 안 한 위치 */
  pickStep: number
  /** playerId → 시작 열 */
  columnByPlayerId: Partial<Record<number, number>>
  paths: LadderPlayerPath[]
  animationDone: boolean
}
