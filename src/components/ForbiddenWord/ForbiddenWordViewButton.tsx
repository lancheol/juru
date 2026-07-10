import { FORBIDDEN_WORD_VIEW_BUTTON_LABEL } from '../../data/forbiddenWord'
import './ForbiddenWordViewButton.css'

interface ForbiddenWordViewButtonProps {
  onClick: () => void
  disabled?: boolean
}

export function ForbiddenWordViewButton({
  onClick,
  disabled = false,
}: ForbiddenWordViewButtonProps) {
  return (
    <button
      type="button"
      className="forbidden-word-view-btn"
      onClick={onClick}
      disabled={disabled}
    >
      {FORBIDDEN_WORD_VIEW_BUTTON_LABEL}
    </button>
  )
}
