import { motion } from 'motion/react'
import { useMemo, useRef, useState, useEffect } from 'react'
import { useHar } from '../hooks/useHar'
import { histogramBuckets } from '../lib/stats'
import { formatMs } from '../lib/format'

const BUCKETS = 60

export function HistogramStrip() {
  const { entries, har, filters, setRange } = useHar()
  const rangeStart = 0
  const rangeEnd = har?.meta.rangeEnd ?? 0

  const buckets = useMemo(
    () => histogramBuckets(entries, rangeStart, rangeEnd, BUCKETS),
    [entries, rangeStart, rangeEnd]
  )
  const max = Math.max(1, ...buckets)

  const containerRef = useRef<HTMLDivElement>(null)
  const [drag, setDrag] = useState<{ startX: number; curX: number } | null>(null)

  const range = filters.range
  const containerWidth = () => containerRef.current?.clientWidth ?? 0
  const xToMs = (x: number) => {
    const w = containerWidth()
    if (w === 0) return 0
    return Math.max(0, Math.min(rangeEnd, (x / w) * rangeEnd))
  }

  // Active selection (in pixels relative to container)
  const selPx = useMemo(() => {
    if (!range) return null
    const w = containerWidth()
    if (w === 0) return null
    return [(range[0] / rangeEnd) * w, (range[1] / rangeEnd) * w] as const
  }, [range, rangeEnd])

  const dragPx = drag
    ? [Math.min(drag.startX, drag.curX), Math.max(drag.startX, drag.curX)] as const
    : null

  const handlePointerDown = (e: React.PointerEvent) => {
    if (!containerRef.current) return
    const rect = containerRef.current.getBoundingClientRect()
    const x = e.clientX - rect.left
    setDrag({ startX: x, curX: x })
    e.currentTarget.setPointerCapture(e.pointerId)
  }
  const handlePointerMove = (e: React.PointerEvent) => {
    if (!drag || !containerRef.current) return
    const rect = containerRef.current.getBoundingClientRect()
    const x = Math.max(0, Math.min(rect.width, e.clientX - rect.left))
    setDrag({ ...drag, curX: x })
  }
  const handlePointerUp = (e: React.PointerEvent) => {
    if (!drag) return
    const min = Math.min(drag.startX, drag.curX)
    const max = Math.max(drag.startX, drag.curX)
    const dx = max - min
    if (dx < 4) {
      // click → clear
      setRange(null)
    } else {
      setRange([xToMs(min), xToMs(max)])
    }
    setDrag(null)
    e.currentTarget.releasePointerCapture(e.pointerId)
  }

  useEffect(() => {
    if (!drag) return
    const cancel = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setDrag(null)
    }
    window.addEventListener('keydown', cancel)
    return () => window.removeEventListener('keydown', cancel)
  }, [drag])

  return (
    <div className="flex flex-col gap-1.5 min-w-0">
      <div className="flex items-center justify-between">
        <div className="label-eyebrow">Activity timeline</div>
        <div className="font-mono text-[11px] text-muted-foreground tabular">
          {range ? `${formatMs(range[0])} → ${formatMs(range[1])}` : `0 — ${formatMs(rangeEnd)}`}
        </div>
      </div>
      <div
        ref={containerRef}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
        className="relative h-12 w-full select-none cursor-crosshair"
        title="Drag to constrain time range. Click to reset."
      >
        <div className="absolute inset-0 flex items-end gap-px">
          {buckets.map((b, i) => {
            const inRange = (() => {
              if (drag) {
                const min = Math.min(drag.startX, drag.curX)
                const max = Math.max(drag.startX, drag.curX)
                const w = containerWidth()
                if (!w) return true
                const bucketLeft = (i / BUCKETS) * w
                const bucketRight = ((i + 1) / BUCKETS) * w
                return bucketRight >= min && bucketLeft <= max
              }
              if (selPx) {
                const w = containerWidth()
                const bucketLeft = (i / BUCKETS) * w
                const bucketRight = ((i + 1) / BUCKETS) * w
                return bucketRight >= selPx[0] && bucketLeft <= selPx[1]
              }
              return true
            })()
            const h = (b / max) * 100
            return (
              <motion.div
                key={i}
                className="flex-1 rounded-sm origin-bottom"
                initial={{ scaleY: 0.05 }}
                animate={{ scaleY: 1 }}
                transition={{ delay: 0.08 + i * 0.005, duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                style={{
                  height: `${Math.max(2, h)}%`,
                  background: inRange ? 'var(--primary)' : 'color-mix(in oklch, var(--muted-foreground) 30%, transparent)',
                  opacity: inRange ? (b > 0 ? 0.85 : 0.18) : 0.18,
                }}
              />
            )
          })}
        </div>
        {(dragPx || selPx) && (
          <div
            className="absolute inset-y-0 border-l border-r border-primary bg-primary/10 pointer-events-none"
            style={{
              left: `${(dragPx ? dragPx[0] : selPx![0])}px`,
              width: `${(dragPx ? dragPx[1] - dragPx[0] : selPx![1] - selPx![0])}px`,
            }}
          />
        )}
      </div>
    </div>
  )
}
