import { useEffect, useState, type CSSProperties, type SyntheticEvent } from 'react'
import { boardTiles } from '../../data/board'
import {
  getTileEventModalTheme,
  type TileEventVisualKey,
} from '../../data/tileEventModal'
import {
  BOMB_SHOT_DRINK_MODAL_NOTE,
  BOMB_SHOT_DRINK_TILE_ID,
} from '../../data/bombShotDrinkEvent'
import {
  BOTTOM_GLASS_TAX_MODAL_MESSAGE,
  BOTTOM_GLASS_TAX_TILE_ID,
} from '../../data/bottomGlassTaxEvent'
import {
  EXCEPT_ELJUNDAN_MODAL_NOTE,
  EXCEPT_ELJUNDAN_TILE_ID,
} from '../../data/exceptEljundanEvent'
import {
  RANDOM_TEAM_DRINK_TILE_ID,
} from '../../data/randomTeamDrinkEvent'
import {
  BRIDGE_ALCOHOL_MODAL_MESSAGE,
  BRIDGE_ALCOHOL_MODAL_TITLE,
} from '../../data/bridgeAlcoholEvent'
import {
  BRIDGE_WATER_MODAL_MESSAGE,
  BRIDGE_WATER_MODAL_TITLE,
} from '../../data/bridgeWaterEvent'
import {
  formatStartLapModalMessage,
  START_TILE_ID,
} from '../../data/startLapEvent'
import './TileEventModal.css'

interface TileEventModalProps {
  open: boolean
  tileId: number | null
  visualKey: TileEventVisualKey | null
  photoSrc?: string | null
  startLapCount?: number | null
  randomTeamDrinkTeamName?: string | null
  onClose: () => void
}

export function TileEventModal({
  open,
  tileId,
  visualKey,
  photoSrc,
  startLapCount = null,
  randomTeamDrinkTeamName = null,
  onClose,
}: TileEventModalProps) {
  const [photoLayout, setPhotoLayout] = useState<{ width: number; height: number } | null>(
    null,
  )

  const tile = open && tileId != null ? boardTiles[tileId] : null
  const theme =
    open && visualKey != null ? getTileEventModalTheme(visualKey, tileId ?? undefined) : null
  const isPhotoLayout = theme?.layout === 'photo'
  const imageSrc = photoSrc ?? theme?.frameImage ?? ''

  useEffect(() => {
    setPhotoLayout(null)
  }, [imageSrc, open])

  if (!open || tileId == null || visualKey == null || !tile || !theme) return null

  const isBridgeAlcohol = visualKey === 'bridge-alcohol'
  const isBridgeWater = visualKey === 'bridge-water'
  const isBottomGlassTax = tileId === BOTTOM_GLASS_TAX_TILE_ID
  const isExceptEljundan = tileId === EXCEPT_ELJUNDAN_TILE_ID
  const isBombShotDrink = tileId === BOMB_SHOT_DRINK_TILE_ID
  const isRandomTeamDrink = tileId === RANDOM_TEAM_DRINK_TILE_ID
  const isStartTile = tileId === START_TILE_ID
  const displayTitle = isBridgeAlcohol
    ? BRIDGE_ALCOHOL_MODAL_TITLE
    : isBridgeWater
      ? BRIDGE_WATER_MODAL_TITLE
      : tile.name

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
      aria-labelledby="tile-event-modal-title"
      onClick={onClose}
    >
      <div
        className={['tile-event-modal', theme.className].filter(Boolean).join(' ')}
        style={
          isPhotoLayout
            ? photoLayout
              ? ({ width: photoLayout.width } as CSSProperties)
              : ({ width: 'min(92vw, 360px)' } as CSSProperties)
            : ({
                '--tile-modal-frame': `url(${theme.frameImage})`,
                '--tile-modal-title-color': theme.titleColor ?? '#3d2914',
              } as CSSProperties)
        }
        onClick={(event) => event.stopPropagation()}
      >
        {isPhotoLayout && (
          <img
            key={imageSrc}
            className="tile-event-modal__photo"
            src={imageSrc}
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
        )}

        <div className="tile-event-modal__body">
          <p
            id="tile-event-modal-title"
            className="tile-event-modal__tile-name tile-event-modal__tile-name--pre-line"
            style={
              isPhotoLayout
                ? ({ color: theme.titleColor ?? '#1a5f8a' } as CSSProperties)
                : undefined
            }
          >
            {displayTitle}
          </p>
          {isBridgeAlcohol && (
            <p className="tile-event-modal__bridge-drink">{BRIDGE_ALCOHOL_MODAL_MESSAGE}</p>
          )}
          {isBridgeWater && (
            <p className="tile-event-modal__bridge-water-note">{BRIDGE_WATER_MODAL_MESSAGE}</p>
          )}
          {isBottomGlassTax && (
            <p className="tile-event-modal__bridge-drink tile-event-modal__multiline-note">
              {BOTTOM_GLASS_TAX_MODAL_MESSAGE}
            </p>
          )}
          {isExceptEljundan && (
            <p className="tile-event-modal__subtitle">{EXCEPT_ELJUNDAN_MODAL_NOTE}</p>
          )}
          {isBombShotDrink && (
            <p className="tile-event-modal__subtitle">{BOMB_SHOT_DRINK_MODAL_NOTE}</p>
          )}
          {isRandomTeamDrink && randomTeamDrinkTeamName && (
            <p className="tile-event-modal__random-team-drink">
              <span className="tile-event-modal__random-team-name">
                {randomTeamDrinkTeamName}
              </span>
              {' 마셔'}
            </p>
          )}
          {isStartTile && startLapCount != null && (
            <p className="tile-event-modal__start-lap">{formatStartLapModalMessage(startLapCount)}</p>
          )}
          {((tile.type === 'title' || tile.type === 'island') && tile.description) && (
            <p className="tile-event-modal__subtitle">{tile.description}</p>
          )}
          <button type="button" className="tile-event-modal__button" onClick={onClose}>
            확인
          </button>
        </div>
      </div>
    </div>
  )
}
