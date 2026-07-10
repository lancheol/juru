import type { Player } from '../types/game'
import type { PlayerItemId } from '../types/playerItem'
import type { RouletteSegment } from '../types/roulette'

export const DRINK_EXEMPTION_ROULETTE_SEGMENT_ID = 'alcohol-exemption'

export interface PlayerItemDefinition {
  id: PlayerItemId
  label: string
  chipLabel: string
  /** 패널 개수 표시 — 예: 면제권 */
  stackLabel: string
}

export const PLAYER_ITEM_DEFINITIONS: Record<PlayerItemId, PlayerItemDefinition> = {
  'drink-exemption': {
    id: 'drink-exemption',
    label: '술 1잔 면제권',
    chipLabel: '면제권 사용',
    stackLabel: '면제권',
  },
}

export function getPlayerItemDefinition(itemId: PlayerItemId): PlayerItemDefinition {
  return PLAYER_ITEM_DEFINITIONS[itemId]
}

export function formatPlayerItemCount(itemId: PlayerItemId, count: number): string {
  const def = getPlayerItemDefinition(itemId)
  return `${def.stackLabel} ${count}개`
}

export function formatPlayerItemUseConfirmMessage(itemId: PlayerItemId): string {
  const def = getPlayerItemDefinition(itemId)
  const particle = def.label.endsWith('권') ? '을' : '를'
  return `${def.label}${particle} 사용하시겠습니까?`
}

export function isDrinkExemptionRouletteSegment(
  segment: RouletteSegment | null | undefined,
): boolean {
  return segment?.id === DRINK_EXEMPTION_ROULETTE_SEGMENT_ID
}

export function grantPlayerItem(player: Player, itemId: PlayerItemId): Player {
  return {
    ...player,
    items: [...player.items, itemId],
  }
}

export function countPlayerItem(player: Player, itemId: PlayerItemId): number {
  return player.items.filter((id) => id === itemId).length
}

export interface PlayerItemStack {
  itemId: PlayerItemId
  count: number
  firstIndex: number
}

export function getPlayerItemStacks(items: PlayerItemId[]): PlayerItemStack[] {
  const stacks = new Map<PlayerItemId, PlayerItemStack>()

  items.forEach((itemId, index) => {
    const existing = stacks.get(itemId)
    if (existing) {
      existing.count += 1
      return
    }
    stacks.set(itemId, { itemId, count: 1, firstIndex: index })
  })

  return Array.from(stacks.values())
}

export function consumePlayerItemAt(player: Player, itemIndex: number): Player {
  if (itemIndex < 0 || itemIndex >= player.items.length) return player

  const items = [...player.items]
  items.splice(itemIndex, 1)
  return { ...player, items }
}
