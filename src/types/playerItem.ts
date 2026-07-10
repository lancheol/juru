/** 플레이어가 보유할 수 있는 아이템 종류 */
export type PlayerItemId = 'drink-exemption'

export interface PendingPlayerItemUse {
  playerIndex: number
  itemId: PlayerItemId
  itemIndex: number
}
