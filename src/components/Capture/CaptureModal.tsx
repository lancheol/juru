import { useEffect, useState, type CSSProperties, type SyntheticEvent } from 'react'
import {
  TOKEN_CAPTURE_IMAGE,
  TOKEN_CAPTURE_MODAL_SUFFIX,
  TOKEN_CAPTURE_MODAL_TITLE,
  formatCapturedTeamLabel,
} from '../../data/tokenCaptureEvent'
import '../TileEvent/TileEventModal.css'
import './CaptureModal.css'

interface CaptureModalProps {
  open: boolean
  capturedPlayerNames: string[]
  onClose: () => void
}

export function CaptureModal({
  open,
  capturedPlayerNames,
  onClose,
}: CaptureModalProps) {
  const [photoLayout, setPhotoLayout] = useState<{ width: number; height: number } | null>(
    null,
  )

  const teamLabel = formatCapturedTeamLabel(capturedPlayerNames)

  useEffect(() => {
    setPhotoLayout(null)
  }, [open])

  if (!open || capturedPlayerNames.length === 0 || !teamLabel) return null

  const handlePhotoLoad = (event: SyntheticEvent<HTMLImageElement>) => {
    const img = event.currentTarget
    if (!img.naturalWidth || !img.naturalHeight) return

    const maxWidth = Math.min(window.innerWidth * 0.92, window.innerWidth - 32)
    const maxHeight = Math.max(160, window.innerHeight * 0.88 - 132)
    const scale = Math.min(1, maxWidth / img.naturalWidth, maxHeight / img.naturalHeight)

    setPhotoLayout({
      width: Math.round(img.naturalWidth * scale),
      height: Math.round(img.naturalHeight * scale),
    })
  }

  const handlePhotoError = () => {
    setPhotoLayout({ width: Math.min(window.innerWidth * 0.92, 360), height: 280 })
  }

  return (
    <div
      className="tile-event-modal-overlay"
      role="dialog"
      aria-modal="true"
      aria-labelledby="capture-modal-title"
      onClick={onClose}
    >
      <div
        className="tile-event-modal tile-event-modal--tile-photo capture-modal"
        style={
          photoLayout
            ? ({ width: photoLayout.width } as CSSProperties)
            : ({ width: 'min(92vw, 360px)' } as CSSProperties)
        }
        onClick={(event) => event.stopPropagation()}
      >
        <img
          className="tile-event-modal__photo"
          src={TOKEN_CAPTURE_IMAGE}
          alt=""
          width={photoLayout?.width}
          height={photoLayout?.height}
          style={
            photoLayout
              ? { width: photoLayout.width, height: photoLayout.height }
              : undefined
          }
          onLoad={handlePhotoLoad}
          onError={handlePhotoError}
        />

        <div className="tile-event-modal__body">
          <p
            id="capture-modal-title"
            className="tile-event-modal__tile-name"
            style={{ color: '#6b2d5c' } as CSSProperties}
          >
            {TOKEN_CAPTURE_MODAL_TITLE}
          </p>
          <p className="capture-modal__message">
            <span className="capture-modal__team-name">{teamLabel}</span>
            {` ${TOKEN_CAPTURE_MODAL_SUFFIX}`}
          </p>
          <button type="button" className="tile-event-modal__button" onClick={onClose}>
            확인
          </button>
        </div>
      </div>
    </div>
  )
}
