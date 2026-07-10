import { FORBIDDEN_WORD_WARNING_MESSAGE } from '../../data/forbiddenWord'
import './ForbiddenWordModal.css'

interface ForbiddenWordWarningModalProps {
  open: boolean
  onConfirm: () => void
  onCancel: () => void
}

export function ForbiddenWordWarningModal({
  open,
  onConfirm,
  onCancel,
}: ForbiddenWordWarningModalProps) {
  if (!open) return null

  return (
    <div
      className="forbidden-word-overlay"
      role="dialog"
      aria-modal="true"
      aria-labelledby="forbidden-word-warning-title"
    >
      <div className="forbidden-word-modal">
        <h2 id="forbidden-word-warning-title" className="forbidden-word-modal__title">
          금지어 보기
        </h2>
        <p className="forbidden-word-modal__warning">{FORBIDDEN_WORD_WARNING_MESSAGE}</p>
        <div className="forbidden-word-modal__actions">
          <button
            type="button"
            className="forbidden-word-modal__button"
            onClick={onCancel}
          >
            취소
          </button>
          <button
            type="button"
            className="forbidden-word-modal__button forbidden-word-modal__button--primary"
            onClick={onConfirm}
          >
            확인
          </button>
        </div>
      </div>
    </div>
  )
}
