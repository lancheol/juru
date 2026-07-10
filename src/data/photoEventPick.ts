export const PHOTO_EVENT_COOLDOWN_TURNS = 2

export function createInitialPhotoEventUsedTurn(imageCount: number): number[] {
  return Array.from({ length: imageCount }, () => -1)
}

/**
 * 직전에 쓴 사진은 제외, 각 사진은 마지막 사용 후 cooldownTurns턴이 지나야 다시 선택 가능.
 */
export function pickPhotoEventImage(
  imageCount: number,
  currentTurn: number,
  lastImageIndex: number | null,
  imageUsedTurn: readonly number[],
  cooldownTurns: number = PHOTO_EVENT_COOLDOWN_TURNS,
): number {
  const all = Array.from({ length: imageCount }, (_, index) => index)

  const eligible = all.filter((index) => {
    if (index === lastImageIndex) return false
    const lastUsed = imageUsedTurn[index] ?? -1
    if (lastUsed >= 0 && currentTurn - lastUsed < cooldownTurns) {
      return false
    }
    return true
  })

  const pool =
    eligible.length > 0
      ? eligible
      : all.filter((index) => index !== lastImageIndex)

  const finalPool = pool.length > 0 ? pool : all
  return finalPool[Math.floor(Math.random() * finalPool.length)]!
}
