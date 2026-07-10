import { useEffect, useState, type FormEvent } from 'react'
import './ForbiddenWordModal.css'

interface ForbiddenWordInputModalProps {
  open: boolean
  playerName: string
  onSubmit: (word: string) => void
}

export function ForbiddenWordInputModal({
  open,
  playerName,
  onSubmit,
}: ForbiddenWordInputModalProps) {
  const [word, setWord] = useState('')

  useEffect(() => {
    if (open) {
      setWord('')
    }
  }, [open])

  if (!open) return null

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault()
    const trimmed = word.trim()
    if (!trimmed) return
    onSubmit(trimmed)
  }

  return (
    <div
      className="forbidden-word-overlay"
      role="dialog"
      aria-modal="true"
      aria-labelledby="forbidden-word-input-title"
    >
      <form className="forbidden-word-modal" onSubmit={handleSubmit}>
        <h2 id="forbidden-word-input-title" className="forbidden-word-modal__title">
          금지어 추가
        </h2>
        <p className="forbidden-word-modal__desc">
          <strong>{playerName}</strong>님, 전역 금지어를 입력하세요.
        </p>
        <input
          type="text"
          className="forbidden-word-modal__input"
          value={word}
          onChange={(event) => setWord(event.target.value)}
          placeholder="금지어 입력"
          maxLength={40}
          autoFocus
        />
        <button
          type="submit"
          className="forbidden-word-modal__button forbidden-word-modal__button--primary"
          disabled={!word.trim()}
        >
          등록
        </button>
      </form>
    </div>
  )
}
