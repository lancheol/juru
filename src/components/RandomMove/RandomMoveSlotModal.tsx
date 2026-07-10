import {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useMemo,
  useRef,
  useState,
} from 'react'
import { boardTiles } from '../../data/board'
import {
  formatRandomMoveDestinationLabel,
  RANDOM_MOVE_TILE_NAME,
  buildRandomMoveSlotItems,
} from '../../data/randomMoveEvent'
import type { RandomMoveSlotItem, RandomMoveSlotPhase } from '../../types/randomMoveSlot'
import { RandomMoveSlotReel, type RandomMoveSlotReelHandle } from './RandomMoveSlotReel'
import './RandomMoveSlotModal.css'

export interface RandomMoveSlotModalHandle {
  spin: () => void
}

interface RandomMoveSlotModalProps {
  open: boolean
  phase: RandomMoveSlotPhase
  onPrepareSpin: () => RandomMoveSlotItem | null
  onSpinComplete: (targetTileId: number) => void
}

export const RandomMoveSlotModal = forwardRef<
  RandomMoveSlotModalHandle,
  RandomMoveSlotModalProps
>(function RandomMoveSlotModal(
  { open, phase, onPrepareSpin, onSpinComplete },
  ref,
) {
  const slotRef = useRef<RandomMoveSlotReelHandle>(null)
  const [forcedItem, setForcedItem] = useState<RandomMoveSlotItem | null>(null)
  const [isReelSpinning, setIsReelSpinning] = useState(false)

  const items = useMemo(() => buildRandomMoveSlotItems(boardTiles), [])

  useEffect(() => {
    if (!open) {
      setForcedItem(null)
      setIsReelSpinning(false)
    }
  }, [open])

  const handleSpin = () => {
    if (phase !== 'idle' || isReelSpinning) return

    const nextForced = onPrepareSpin()
    if (!nextForced) return

    setForcedItem(nextForced)
    setIsReelSpinning(true)
  }

  useImperativeHandle(ref, () => ({ spin: handleSpin }), [phase, isReelSpinning, onPrepareSpin])

  useEffect(() => {
    if (!isReelSpinning || !forcedItem) return

    const frame = requestAnimationFrame(() => {
      slotRef.current?.spin()
    })

    return () => cancelAnimationFrame(frame)
  }, [isReelSpinning, forcedItem])

  const handleSpinEnd = (result: RandomMoveSlotItem) => {
    setIsReelSpinning(false)
    onSpinComplete(result.tileId)
  }

  if (!open) return null

  const resultTileId =
    phase === 'result' && forcedItem != null ? forcedItem.tileId : null

  return (
    <div
      className="random-move-slot-overlay"
      role="dialog"
      aria-modal="true"
      aria-labelledby="random-move-slot-title"
    >
      <div className="random-move-slot" onClick={(event) => event.stopPropagation()}>
        <h2 id="random-move-slot-title" className="random-move-slot__title">
          {RANDOM_MOVE_TILE_NAME}
        </h2>

        {phase === 'idle' && !isReelSpinning && (
          <p className="random-move-slot__hint">
            버튼 또는 스페이스바로 슬롯을 돌리세요
          </p>
        )}
        {(phase === 'spinning' || isReelSpinning) && (
          <p className="random-move-slot__hint">어디로 갈지 정해지는 중...</p>
        )}
        {phase === 'result' && resultTileId != null && (
          <p className="random-move-slot__result">
            {formatRandomMoveDestinationLabel(resultTileId, boardTiles)}
          </p>
        )}

        <div className="random-move-slot__machine">
          <RandomMoveSlotReel
            ref={slotRef}
            open={open}
            items={items}
            forcedResult={forcedItem}
            onSpinStart={() => setIsReelSpinning(true)}
            onSpinEnd={handleSpinEnd}
          />
        </div>

        {phase === 'idle' && (
          <button
            type="button"
            className="random-move-slot__spin-btn"
            onClick={handleSpin}
            disabled={isReelSpinning}
          >
            {isReelSpinning ? '돌아가는 중...' : 'SPIN'}
          </button>
        )}
      </div>
    </div>
  )
})
