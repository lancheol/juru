import {
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
} from 'react'
import {
  RANDOM_MOVE_SLOT_CENTER_INDEX,
  RANDOM_MOVE_SLOT_ITEM_GAP,
  RANDOM_MOVE_SLOT_ITEM_SIZE,
  RANDOM_MOVE_SLOT_LAND_INDEX,
  RANDOM_MOVE_SLOT_REEL_ITEM_COUNT,
  RANDOM_MOVE_SLOT_SPIN_MS,
  RANDOM_MOVE_SLOT_TRAVEL_ITEMS,
  mapSlotSpinProgress,
} from '../../data/randomMoveEvent'
import type { RandomMoveSlotItem } from '../../types/randomMoveSlot'

export interface RandomMoveSlotReelHandle {
  spin: () => void
}

interface RandomMoveSlotReelProps {
  open: boolean
  items: RandomMoveSlotItem[]
  forcedResult: RandomMoveSlotItem | null
  onSpinStart?: () => void
  onSpinEnd?: (result: RandomMoveSlotItem) => void
}

function poolItemAt(pool: RandomMoveSlotItem[], index: number): RandomMoveSlotItem {
  if (pool.length === 0) {
    return { id: '0', tileId: 0, image: '', name: '—' }
  }
  return pool[index % pool.length]!
}

function buildLoopingReelStrip(
  pool: RandomMoveSlotItem[],
  length: number,
  landIndex: number,
  forced: RandomMoveSlotItem,
): RandomMoveSlotItem[] {
  const strip: RandomMoveSlotItem[] = new Array(length)
  for (let i = 0; i < length; i++) {
    strip[i] = i === landIndex ? forced : poolItemAt(pool, i)
  }
  return strip
}

function buildIdleStrip(pool: RandomMoveSlotItem[]): RandomMoveSlotItem[] {
  if (pool.length === 0) return []
  return buildLoopingReelStrip(
    pool,
    RANDOM_MOVE_SLOT_REEL_ITEM_COUNT,
    RANDOM_MOVE_SLOT_LAND_INDEX,
    pool[RANDOM_MOVE_SLOT_CENTER_INDEX % pool.length]!,
  )
}

export const RandomMoveSlotReel = forwardRef<RandomMoveSlotReelHandle, RandomMoveSlotReelProps>(
  function RandomMoveSlotReel({ open, items, forcedResult, onSpinStart, onSpinEnd }, ref) {
    const itemSize = RANDOM_MOVE_SLOT_ITEM_SIZE
    const itemGap = RANDOM_MOVE_SLOT_ITEM_GAP
    const itemTotal = itemSize + itemGap * 2
    const centerOffset = -itemSize / 2
    const centerScale = 1.5
    const centerIndex = RANDOM_MOVE_SLOT_CENTER_INDEX
    const finalTranslate = -RANDOM_MOVE_SLOT_TRAVEL_ITEMS * itemTotal

    const [reelItems, setReelItems] = useState<RandomMoveSlotItem[]>(() => buildIdleStrip(items))
    const [translateY, setTranslateY] = useState(0)
    const [isSpinning, setIsSpinning] = useState(false)

    const spinTokenRef = useRef(0)
    const animationFrameRef = useRef<number | null>(null)
    const timeoutRefs = useRef<Array<ReturnType<typeof setTimeout>>>([])

    const clearTimers = useCallback(() => {
      if (animationFrameRef.current != null) {
        cancelAnimationFrame(animationFrameRef.current)
        animationFrameRef.current = null
      }
      timeoutRefs.current.forEach(clearTimeout)
      timeoutRefs.current = []
    }, [])

    useEffect(() => {
      if (!open || items.length === 0) return
      setReelItems(buildIdleStrip(items))
      setTranslateY(0)
      setIsSpinning(false)
      clearTimers()
    }, [open, items, clearTimers])

    useEffect(() => () => clearTimers(), [clearTimers])

    const getItemPosition = (index: number) => (index - centerIndex) * itemTotal

    const spin = useCallback(() => {
      if (isSpinning || items.length === 0 || !forcedResult) return

      clearTimers()
      const spinToken = ++spinTokenRef.current
      const strip = buildLoopingReelStrip(
        items,
        RANDOM_MOVE_SLOT_REEL_ITEM_COUNT,
        RANDOM_MOVE_SLOT_LAND_INDEX,
        forcedResult,
      )

      setReelItems(strip)
      setTranslateY(0)
      setIsSpinning(true)
      onSpinStart?.()

      const spinStartedAt = performance.now()

      const completeSpin = () => {
        if (spinToken !== spinTokenRef.current) return
        setTranslateY(finalTranslate)
        setIsSpinning(false)
        onSpinEnd?.(forcedResult)
      }

      const tryComplete = () => {
        const elapsed = performance.now() - spinStartedAt
        if (elapsed < RANDOM_MOVE_SLOT_SPIN_MS) {
          const wait = Math.ceil(RANDOM_MOVE_SLOT_SPIN_MS - elapsed)
          const t = setTimeout(tryComplete, wait)
          timeoutRefs.current.push(t)
          return
        }
        completeSpin()
      }

      const startTime = performance.now()

      const animate = () => {
        if (spinToken !== spinTokenRef.current) return

        const elapsed = performance.now() - startTime
        const linearProgress = Math.min(elapsed / RANDOM_MOVE_SLOT_SPIN_MS, 1)
        const easedProgress = mapSlotSpinProgress(linearProgress)
        setTranslateY(finalTranslate * easedProgress)

        if (linearProgress < 1) {
          animationFrameRef.current = requestAnimationFrame(animate)
          return
        }

        tryComplete()
      }

      animationFrameRef.current = requestAnimationFrame(animate)
    }, [
      clearTimers,
      finalTranslate,
      forcedResult,
      isSpinning,
      items,
      onSpinEnd,
      onSpinStart,
    ])

    useImperativeHandle(ref, () => ({ spin }), [spin])

    const closestIndex = (() => {
      if (reelItems.length === 0) return 0
      const closestFloat = centerIndex - translateY / itemTotal
      return Math.max(0, Math.min(Math.round(closestFloat), reelItems.length - 1))
    })()

    return (
      <div className="random-move-slot__reel">
        <div className="random-move-slot__reel-fade random-move-slot__reel-fade--top" />
        <div className="random-move-slot__reel-fade random-move-slot__reel-fade--bottom" />

        {reelItems.length > 0 ? (
          <div
            className="random-move-slot__reel-track"
            style={{
              transform: `translateY(${translateY}px)`,
            }}
          >
            {reelItems.map((item, index) => {
              const position = getItemPosition(index)
              const isCenter = index === closestIndex

              return (
                <div
                  key={`${item.tileId}-${index}`}
                  className="random-move-slot__reel-item"
                  style={{
                    transform: `translate(${centerOffset}px, ${position + centerOffset}px)`,
                  }}
                >
                  <div
                    className={[
                      'random-move-slot__cell',
                      isCenter ? 'random-move-slot__cell--center' : '',
                    ]
                      .filter(Boolean)
                      .join(' ')}
                    style={{ transform: `scale(${isCenter ? centerScale : 1})` }}
                  >
                    <span className="random-move-slot__cell-id">{item.tileId}</span>
                    <span className="random-move-slot__cell-name">{item.name}</span>
                  </div>
                </div>
              )
            })}
          </div>
        ) : (
          <div className="random-move-slot__reel-empty">준비 중...</div>
        )}
      </div>
    )
  },
)
