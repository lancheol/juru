export type RandomMoveSlotPhase = 'idle' | 'spinning' | 'result'

export interface RandomMoveSlotItem {
  id: string
  tileId: number
  image: string
  name: string
}
