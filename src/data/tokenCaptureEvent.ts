import captureImage from '../assets/tile-modals/capture/token-capture.png'

export const TOKEN_CAPTURE_MODAL_TITLE = '잡힌 팀'

export const TOKEN_CAPTURE_MODAL_SUFFIX = '마셔야겠지?'

export const TOKEN_CAPTURE_IMAGE = captureImage

export function formatCapturedTeamLabel(names: readonly string[]): string {
  if (names.length === 0) return ''
  if (names.length === 1) return names[0]!
  if (names.length === 2) return `${names[0]}·${names[1]}`
  return `${names.slice(0, -1).join(', ')}·${names[names.length - 1]}`
}

export function formatTokenCaptureModalMessage(names: readonly string[]): string {
  const label = formatCapturedTeamLabel(names)
  return label ? `${label} ${TOKEN_CAPTURE_MODAL_SUFFIX}` : TOKEN_CAPTURE_MODAL_SUFFIX
}
