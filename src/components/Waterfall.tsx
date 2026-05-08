import { useVirtualizer } from '@tanstack/react-virtual'
import { useEffect, useRef } from 'react'
import { useHar } from '../hooks/useHar'
import { TimeAxis } from './TimeAxis'
import { WaterfallRow } from './WaterfallRow'

const ROW_HEIGHT = 28

interface Props {
  reduceMotion: boolean
}

export function Waterfall({ reduceMotion }: Props) {
  const { filtered, har, selected, select, next, prev } = useHar()
  const rangeStart = 0
  const rangeEnd = har?.meta.rangeEnd ?? 0

  const scrollRef = useRef<HTMLDivElement>(null)
  const virtualizer = useVirtualizer({
    count: filtered.length,
    getScrollElement: () => scrollRef.current,
    estimateSize: () => ROW_HEIGHT,
    overscan: 12,
  })

  // Keyboard navigation
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

  // Scroll selected into view
  useEffect(() => {
    if (selected == null) return
    const idx = filtered.findIndex((e) => e.id === selected)
    if (idx >= 0) virtualizer.scrollToIndex(idx, { align: 'auto' })
  }, [selected, filtered, virtualizer])

  const virtualEntries = virtualizer.getVirtualItems()
  const totalSize = virtualizer.getTotalSize()

  return (
    <section className="flex-1 flex flex-col min-h-0">
      <div className="grid grid-cols-[auto_minmax(0,28px)_minmax(0,1fr)_minmax(0,72px)_minmax(0,84px)_minmax(0,42%)] gap-x-3 px-4 md:px-6 h-7 items-end border-b border-border/70 bg-background/95 backdrop-blur sticky top-0 z-10">
        <span />
        <span className="label-eyebrow text-right">Method</span>
        <span className="label-eyebrow">URL</span>
        <span className="label-eyebrow text-right">Status</span>
        <span className="label-eyebrow text-right">Size</span>
        <span className="relative h-full">
          <span className="label-eyebrow absolute left-0 top-0">Timeline</span>
        </span>
      </div>
      <div
        className="grid grid-cols-[auto_minmax(0,28px)_minmax(0,1fr)_minmax(0,72px)_minmax(0,84px)_minmax(0,42%)] gap-x-3 px-4 md:px-6 sticky top-7 z-10 bg-background/95 backdrop-blur border-b border-border/70"
      >
        <span /><span /><span /><span /><span />
        <TimeAxis rangeStart={rangeStart} rangeEnd={rangeEnd} className="w-full" />
      </div>
      <div ref={scrollRef} className="flex-1 overflow-auto relative">
        {filtered.length === 0 ? (
          <div className="grid place-items-center h-full p-8">
            <div className="text-center">
              <div className="label-eyebrow mb-2">No matching entries</div>
              <p className="text-sm text-muted-foreground max-w-xs">Try clearing filters or adjusting the time range.</p>
            </div>
          </div>
        ) : (
          <div style={{ height: totalSize, position: 'relative' }}>
            {virtualEntries.map((vi) => {
              const entry = filtered[vi.index]
              return (
                <div
                  key={entry.id}
                  className="absolute top-0 left-0 right-0 border-b border-border/30"
                  style={{ transform: `translateY(${vi.start}px)`, height: vi.size }}
                >
                  <WaterfallRow
                    entry={entry}
                    index={vi.index}
                    selected={selected === entry.id}
                    rangeStart={rangeStart}
                    rangeEnd={rangeEnd}
                    onSelect={select}
                    reduceMotion={reduceMotion}
                  />
                </div>
              )
            })}
          </div>
        )}
      </div>
    </section>
  )
}
