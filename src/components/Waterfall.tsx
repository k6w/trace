import { useVirtualizer } from '@tanstack/react-virtual'
import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import { useHar } from '../hooks/useHar'
import { TimeAxis } from './TimeAxis'
import { WaterfallRow } from './WaterfallRow'
import { PhaseLegend } from './PhaseLegend'
import { ROW_HEIGHT, WATERFALL_GAP, WATERFALL_GRID } from './waterfallGrid'
import { formatNumber } from '../lib/format'

export function Waterfall() {
  const { filtered, entries, har, selected, select, next, prev } = useHar()
  const rangeStart = 0
  const rangeEnd = har?.meta.rangeEnd ?? 0

  const scrollRef = useRef<HTMLDivElement>(null)
  const virtualizer = useVirtualizer({
    count: filtered.length,
    getScrollElement: () => scrollRef.current,
    estimateSize: () => ROW_HEIGHT,
    overscan: 12,
  })

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      const tgt = e.target as HTMLElement | null
      const tag = tgt?.tagName?.toLowerCase()
      if (tag === 'input' || tag === 'textarea' || tgt?.isContentEditable) return

      if (e.key === 'ArrowDown' || e.key === 'j') { e.preventDefault(); next() }
      else if (e.key === 'ArrowUp' || e.key === 'k') { e.preventDefault(); prev() }
      else if (e.key === 'Escape' && selected != null) { select(null) }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [next, prev, select, selected])

  useEffect(() => {
    if (selected == null) return
    const idx = filtered.findIndex((e) => e.id === selected)
    if (idx >= 0) virtualizer.scrollToIndex(idx, { align: 'auto' })
  }, [selected, filtered, virtualizer])

  /* The rows scroll and the ruler does not, so the ruler is as wide as the
     section while the rows are narrower by whatever the scrollbar takes. Left
     alone that puts every tick out of register with the bars it labels, so
     measure the gutter and pad the header to match. */
  const [gutter, setGutter] = useState(0)
  useLayoutEffect(() => {
    const el = scrollRef.current
    if (!el) return
    const measure = () => setGutter(el.offsetWidth - el.clientWidth)
    measure()
    const ro = new ResizeObserver(measure)
    ro.observe(el)
    return () => ro.disconnect()
  }, [])

  const virtualEntries = virtualizer.getVirtualItems()
  const gridStyle = { gridTemplateColumns: WATERFALL_GRID, columnGap: WATERFALL_GAP }

  return (
    <section className="flex min-h-0 flex-1 flex-col">
      {/* Column heads and the time ruler share one grid with the rows, so a
          label cannot drift out from over the column it names. */}
      <div className="z-10 border-b-2 border-border bg-background" style={{ paddingRight: gutter }}>
        <div
          className="grid h-6 items-center px-4 md:px-6 pt-1"
          style={gridStyle}
        >
          <span className="label-eyebrow">Type</span>
          <span className="label-eyebrow text-right">Method</span>
          <span className="label-eyebrow">URL</span>
          <span className="label-eyebrow text-right">Code</span>
          <span className="label-eyebrow text-right">Size</span>
          <span className="label-eyebrow">Timeline</span>
        </div>
        <div className="grid px-4 md:px-6" style={gridStyle}>
          <span /><span /><span /><span /><span />
          <TimeAxis rangeStart={rangeStart} rangeEnd={rangeEnd} className="w-full" />
        </div>
      </div>

      <div ref={scrollRef} className="relative flex-1 overflow-auto">
        {filtered.length === 0 ? (
          <div className="grid h-full place-items-center p-8">
            <div className="max-w-xs text-center">
              <div className="label-eyebrow-strong mb-2">Nothing matches</div>
              <p className="font-mono text-[12px] leading-relaxed text-muted-foreground">
                {entries.length} requests are loaded. Clear a filter or widen the time
                window to bring them back.
              </p>
            </div>
          </div>
        ) : (
          <div style={{ height: virtualizer.getTotalSize(), position: 'relative' }}>
            {virtualEntries.map((vi) => {
              const entry = filtered[vi.index]
              return (
                <div
                  key={entry.id}
                  className="absolute inset-x-0 top-0 border-b border-border-soft"
                  style={{ transform: `translateY(${vi.start}px)`, height: vi.size }}
                >
                  <WaterfallRow
                    entry={entry}
                    selected={selected === entry.id}
                    rangeStart={rangeStart}
                    rangeEnd={rangeEnd}
                    onSelect={select}
                  />
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* The key to the spectrum, parked where it is always in view. */}
      <div className="flex items-center justify-between gap-6 border-t-2 border-border bg-background px-4 md:px-6 py-2">
        <PhaseLegend />
        <span className="shrink-0 font-mono text-[10px] uppercase tracking-[0.16em] tabular text-muted-foreground">
          {formatNumber(filtered.length)}
          {filtered.length !== entries.length && (
            <span className="text-muted-foreground/60"> / {formatNumber(entries.length)}</span>
          )}
          {' '}shown
        </span>
      </div>
    </section>
  )
}
