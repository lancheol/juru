import type { RouletteSegment } from '../types/roulette'

export const FORBIDDEN_WORD_ROULETTE_SEGMENT_ID = 'forbidden-word'

export const FORBIDDEN_WORD_REVEAL_SECONDS = 7

export const FORBIDDEN_WORD_VIEW_DRINK_COUNT = 1

export const FORBIDDEN_WORD_VIEW_BUTTON_LABEL = '금지어 보기'

export const FORBIDDEN_WORD_WARNING_MESSAGE =
  '금지어를 보게 되면 술 1잔을 마셔야 합니다.'

export function isForbiddenWordRouletteSegment(
  segment: RouletteSegment | null | undefined,
): boolean {
  return segment?.id === FORBIDDEN_WORD_ROULETTE_SEGMENT_ID
}
