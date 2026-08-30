import { motion, useInView, useReducedMotion } from 'motion/react'
import { useEffect, useRef, useState } from 'react'
import { parseHar, type NormalizedEntry, type NormalizedHar } from '../../lib/har'
import { RESOURCE_TYPE_COLOR, RESOURCE_TYPE_LABELS, type ResourceType } from '../../lib/classify'
import { formatBytes, formatMs, formatNumber, formatStatus, statusColor, statusBucket } from '../../lib/format'
import { ArrowDownRight, MagnifyingGlass } from '@phosphor-icons/react'
import { BrutalButton, SectionIndex, Tag } from '../../ui/Brutal'
import { PHASE_COLOR, PHASE_ORDER } from '../../lib/phases'


interface Props {
  onLoadSample: () => void
  onChooseFile: () => void
}

export function LiveDemo({ onLoadSample, onChooseFile }: Props) {
  const ref = useRef<HTMLDivElement>(null)
  const inView = useInView(ref, { once: true, amount: 0.1 })
  const reduce = useReducedMotion()
  const [har, setHar] = useState<NormalizedHar | null>(null)
  const [activeTypes, setActiveTypes] = useState<Set<ResourceType>>(new Set())
  const [activeStatuses, setActiveStatuses] = useState<Set<string>>(new Set())
  const [query, setQuery] = useState('')
  const [selected, setSelected] = useState<number | null>(null)
  const [over, setOver] = useState(false)

  useEffect(() => {
    fetch('/sample.har').then((r) => r.text()).then((text) => {
      const r = parseHar(text, 'sample.har')
      if (r.ok) setHar(r.data)
    })
  }, [])

  if (!har) {
    return (
      <section id="demo" ref={ref} className="border-t-2 border-border py-28">
        <div className="mx-auto max-w-[1500px] px-4 md:px-8 grid place-items-center h-[400px] font-mono text-[11px] uppercase tracking-[0.2em] text-muted-foreground">
          Loading sample…
        </div>
      </section>
    )
  }

  const filtered = har.entries.filter((e) => {
    if (activeTypes.size && !activeTypes.has(e.type)) return false
    if (activeStatuses.size && !activeStatuses.has(statusBucket(e.status))) return false
    if (query && !e.url.toLowerCase().includes(query.toLowerCase())) return false
    return true
  })
  const selectedEntry = selected != null ? filtered.find((e) => e.id === selected) : null
  const allTypes = [...new Set(har.entries.map((e) => e.type))] as ResourceType[]
  const totalErrors = har.entries.filter((e) => e.isError).length

  return (
    <section id="demo" ref={ref} className="relative border-t-2 border-border">
      <div className="mx-auto max-w-[1500px] px-4 md:px-8 py-20 md:py-32">
        <motion.div
          initial={reduce ? undefined : { opacity: 0, y: 24 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
        >
          <SectionIndex index={3} label="Demo · interactive" />

          <div className="mt-12 grid grid-cols-12 gap-x-6 gap-y-8 mb-10">
            <h2 className="col-span-12 lg:col-span-9 display text-[64px] md:text-[120px] leading-[0.86]">
              Running on a<br />real HAR. Right now.
            </h2>
            <p className="col-span-12 lg:col-span-3 lg:pl-4 font-mono text-[12px] uppercase tracking-[0.04em] leading-[1.55] text-muted-foreground self-end max-w-[34ch]">
              Not a screenshot. Filter, click any row, see real headers, real bodies, real timing. Drop your own HAR onto the stage.
            </p>
          </div>

          {/* The stage */}
          <div
            onDragEnter={(e) => { e.preventDefault(); setOver(true) }}
            onDragLeave={(e) => { e.preventDefault(); setOver(false) }}
            onDragOver={(e) => e.preventDefault()}
            onDrop={() => setOver(false)}
            className={`relative border-hard-2 bg-card transition-shadow ${over ? 'shadow-hard-lg' : 'shadow-hard'}`}
          >
            {/* Header strip */}
            <div className="flex items-center justify-between px-4 h-10 border-b-2 border-border bg-muted/30">
              <div className="flex items-center gap-2">
                <span className="h-2.5 w-2.5 bg-primary border border-border" />
                <span className="font-mono text-[10px] uppercase tracking-[0.2em] font-bold">Trace · {har.meta.name}</span>
              </div>
              <div className="font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground hidden sm:block">
                {formatNumber(filtered.length)} of {formatNumber(har.meta.entryCount)} visible · {formatBytes(har.meta.totalBytes)}
              </div>
              <button
                onClick={onLoadSample}
                className="font-mono text-[10px] uppercase tracking-[0.2em] hover:text-primary"
              >
                Open full →
              </button>
            </div>

            {/* Mini instrument strip */}
            <div className="grid grid-cols-2 md:grid-cols-4 border-b-2 border-border">
              <Cell label="Requests" value={formatNumber(har.meta.entryCount)} border />
              <Cell label="Wire" value={formatBytes(har.meta.totalBytes)} border />
              <Cell label="Span" value={formatMs(har.meta.rangeEnd)} border />
              <Cell label="Errors" value={String(totalErrors)} accent={totalErrors > 0} />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-[1fr_360px]">
              {/* Main pane */}
              <div className="border-b-2 lg:border-b-0 lg:border-r-2 border-border min-w-0">
                {/* Filter row */}
                <div className="px-4 py-2.5 border-b-2 border-border flex items-center gap-2 flex-wrap">
                  <label className="flex items-center gap-2 flex-1 min-w-[180px] border-b-2 border-border focus-within:border-primary transition-colors">
                    <MagnifyingGlass size={12} />
                    <input
                      placeholder="Search…"
                      value={query}
                      onChange={(e) => setQuery(e.target.value)}
                      className="bg-transparent outline-none py-1 text-[12px] flex-1 font-mono uppercase tracking-[0.04em]"
                    />
                  </label>
                  {allTypes.slice(0, 6).map((t) => (
                    <Tag key={t} active={activeTypes.has(t)} onClick={() => setActiveTypes((s) => {
                      const ns = new Set(s); if (ns.has(t)) ns.delete(t); else ns.add(t); return ns
                    })}>
                      <span className="h-1.5 w-1.5" style={{ background: RESOURCE_TYPE_COLOR[t] }} />
                      {RESOURCE_TYPE_LABELS[t]}
                    </Tag>
                  ))}
                  {(['2xx', '4xx', '5xx'] as const).map((s) => (
                    <Tag key={s} active={activeStatuses.has(s)} onClick={() => setActiveStatuses((cur) => {
                      const ns = new Set(cur); if (ns.has(s)) ns.delete(s); else ns.add(s); return ns
                    })}>
                      {s}
                    </Tag>
                  ))}
                </div>

                <div className="max-h-[460px] overflow-auto scroll-fade-mask">
                  {filtered.length === 0 ? (
                    <div className="p-8 text-center font-mono text-[11px] uppercase tracking-[0.2em] text-muted-foreground">No matches.</div>
                  ) : filtered.map((e, i) => (
                    <DemoRow
                      key={e.id}
                      entry={e}
                      index={i}
                      reduce={!!reduce}
                      pulseInView={inView}
                      rangeEnd={har.meta.rangeEnd}
                      selected={selected === e.id}
                      onSelect={() => setSelected((cur) => (cur === e.id ? null : e.id))}
                    />
                  ))}
                </div>
              </div>

              {/* Inspector pane */}
              <aside className="bg-muted/20 max-h-[510px] min-h-[280px] flex flex-col">
                {!selectedEntry ? (
                  <div className="flex-1 flex flex-col items-center justify-center text-center p-6 gap-3">
                    <ArrowDownRight size={20} />
                    <div className="font-mono text-[10px] uppercase tracking-[0.2em] font-bold">Click a row</div>
                    <p className="font-mono text-[11px] text-muted-foreground max-w-[26ch] uppercase tracking-[0.04em]">
                      Inspect headers, body, timing. All in your browser.
                    </p>
                  </div>
                ) : (
                  <div className="flex flex-col flex-1 min-h-0">
                    <div className="px-4 py-3 border-b-2 border-border">
                      <div className="font-mono text-[9px] uppercase tracking-[0.2em] text-muted-foreground mb-1">Inspector / Overview</div>
                      <div className="font-mono text-[12px] break-all leading-snug">
                        <span className="text-muted-foreground">{selectedEntry.scheme}://{selectedEntry.host}</span>
                        <span className="text-foreground">{selectedEntry.pathname}</span>
                        {selectedEntry.search && <span className="text-muted-foreground/70">{selectedEntry.search}</span>}
                      </div>
                    </div>
                    <div className="px-4 py-3 grid grid-cols-2 gap-y-2.5 gap-x-4 text-[12px] font-mono">
                      <Pair k="Method" v={selectedEntry.method} />
                      <Pair k="Status" v={`${selectedEntry.status} ${selectedEntry.statusText}`} />
                      <Pair k="Type" v={RESOURCE_TYPE_LABELS[selectedEntry.type]} />
                      <Pair k="Size" v={formatBytes(selectedEntry.transferred)} />
                      <Pair k="Time" v={formatMs(selectedEntry.totalMs)} />
                      <Pair k="Server" v={selectedEntry.serverIp || '—'} />
                    </div>
                    <div className="px-4 py-3 border-t-2 border-border flex-1 overflow-auto">
                      <div className="font-mono text-[9px] uppercase tracking-[0.2em] text-muted-foreground mb-2">Phase breakdown</div>
                      <div className="space-y-1.5">
                        {PHASE_ORDER.map((p) => {
                          const ms = selectedEntry.phases[p]
                          const total = selectedEntry.totalMs || 1
                          const pct = (ms / total) * 100
                          if (ms <= 0 && pct <= 0) return null
                          return (
                            <div key={p} className="grid grid-cols-[80px_1fr_50px] items-center gap-2">
                              <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground">{p}</span>
                              <span className="relative h-1.5 border border-border/40">
                                <span className="absolute inset-y-0 left-0" style={{ width: `${Math.max(1, pct)}%`, background: PHASE_COLOR[p] }} />
                              </span>
                              <span className="font-mono text-[10px] tabular text-right">{formatMs(ms)}</span>
                            </div>
                          )
                        })}
                      </div>
                    </div>
                  </div>
                )}
              </aside>
            </div>

            {over && (
              <div className="absolute inset-0 z-30 flex items-center justify-center bg-background/90 backdrop-blur-sm pointer-events-none">
                <div className="text-center">
                  <div className="display text-[64px] mb-2">DROP TO LOAD</div>
                  <div className="font-mono text-[11px] uppercase tracking-[0.2em] text-muted-foreground">your file stays in your browser</div>
                </div>
              </div>
            )}
          </div>

          <div className="mt-8 flex flex-col md:flex-row md:items-center md:justify-between gap-3">
            <p className="font-mono text-[11px] uppercase tracking-[0.04em] text-muted-foreground max-w-[60ch]">
              Drop your own .har anywhere on this stage. The full workspace takes over.
            </p>
            <div className="flex items-center gap-2">
              <BrutalButton onClick={onChooseFile} variant="primary">Open my HAR →</BrutalButton>
              <BrutalButton onClick={onLoadSample} variant="outline">Open sample full</BrutalButton>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  )
}

function Cell({ label, value, accent, border }: { label: string; value: string; accent?: boolean; border?: boolean }) {
  return (
    <div className={`px-4 py-3 flex flex-col gap-1 ${border ? 'border-r-0 md:border-r-2 border-border last:border-r-0' : ''}`}>
      <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground">{label}</span>
      <span className={`display tabular text-[24px] leading-none ${accent ? 'text-primary' : 'text-foreground'}`}>
        {value}
      </span>
    </div>
  )
}

function Pair({ k, v }: { k: string; v: string }) {
  return (
    <div className="min-w-0">
      <div className="text-[9px] uppercase tracking-[0.2em] text-muted-foreground">{k}</div>
      <div className="font-mono text-foreground/95 truncate">{v}</div>
    </div>
  )
}

function DemoRow({ entry, index, reduce, pulseInView, rangeEnd, selected, onSelect }: {
  entry: NormalizedEntry; index: number; reduce: boolean; pulseInView: boolean; rangeEnd: number; selected: boolean; onSelect: () => void
}) {
  const leadingPct = (entry.startMs / Math.max(1, rangeEnd)) * 100
  const widthPct = (entry.totalMs / Math.max(1, rangeEnd)) * 100
  return (
    <motion.button
      onClick={onSelect}
      initial={reduce ? false : { opacity: 0, x: -8 }}
      animate={pulseInView ? { opacity: 1, x: 0 } : {}}
      transition={{ delay: 0.4 + index * 0.022, duration: 0.32, ease: [0.16, 1, 0.3, 1] }}
      className={`relative grid w-full h-7 items-center px-4 text-[11px] text-left border-b border-border/30 transition-colors ${
        entry.isError ? 'bg-destructive/10' : ''
      } ${selected ? 'bg-primary text-primary-foreground' : 'hover:bg-primary/30'}`}
      style={{ gridTemplateColumns: 'auto 32px minmax(0,1fr) 36px 64px minmax(0,42%)', columnGap: '8px' }}
    >
      <span className="h-2 w-2" style={{ background: RESOURCE_TYPE_COLOR[entry.type] }} />
      <span className="font-mono text-[9px] uppercase tracking-wider text-right text-muted-foreground">{entry.method}</span>
      <span className="truncate font-mono text-foreground/85">
        <span className="text-muted-foreground/80">{entry.host.replace('.studio', '')}</span>
        <span>{entry.pathname}</span>
      </span>
      <span className="font-mono tabular text-right" style={{ color: statusColor(entry.status) }}>
        {formatStatus(entry.status)}
      </span>
      <span className="font-mono tabular text-right text-muted-foreground/85">
        {formatBytes(entry.transferred)}
      </span>
      <span className="relative h-full">
        <div
          className="absolute top-1/2 -translate-y-1/2 h-2.5 flex items-stretch"
          style={{ left: `${leadingPct}%`, width: `${Math.max(0.6, widthPct)}%`, minWidth: '2px' }}
        >
          {PHASE_ORDER.map((phase) => {
            const ms = entry.phases[phase]
            const pct = (ms / Math.max(1, entry.totalMs)) * 100
            if (pct <= 0) return null
            return <span key={phase} style={{ width: `${pct}%`, background: PHASE_COLOR[phase] }} />
          })}
        </div>
      </span>
    </motion.button>
  )
}
