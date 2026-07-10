import { useEffect } from 'react'
import './ForbiddenWordModal.css'

interface ForbiddenWordRevealModalProps {
  open: boolean
  words: string[]
  secondsLeft: number
  onTick: () => void
  onComplete: () => void
}

export function ForbiddenWordRevealModal({
  open,
  words,
  secondsLeft,
  onTick,
  onComplete,
}: ForbiddenWordRevealModalProps) {
  useEffect(() => {
    if (!open) return

    if (secondsLeft <= 0) {
      onComplete()
      return
    }

    const timerId = window.setTimeout(onTick, 1000)
    return () => window.clearTimeout(timerId)
  }, [open, secondsLeft, onTick, onComplete])

  if (!open || words.length === 0) return null

  return (
    <div
      className="forbidden-word-overlay forbidden-word-overlay--reveal"
      role="dialog"
      aria-modal="true"
      aria-labelledby="forbidden-word-reveal-title"
    >
      <div className="forbidden-word-modal forbidden-word-modal--reveal">
        <p className="forbidden-word-modal__timer" aria-live="polite">
          {secondsLeft}초
        </p>
        <h2 id="forbidden-word-reveal-title" className="forbidden-word-modal__title">
          금지어 목록
        </h2>
        <ul className="forbidden-word-modal__list">
          {words.map((word, index) => (
            <li key={`${word}-${index}`} className="forbidden-word-modal__list-item">
              {word}
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}
