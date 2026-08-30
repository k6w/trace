import { motion, useReducedMotion } from 'motion/react'
import { useEffect, useMemo, useState } from 'react'
import { parseHar, type NormalizedEntry } from '../../lib/har'
import { RESOURCE_TYPE_COLOR } from '../../lib/classify'
import { formatBytes, formatMs, formatStatus, statusColor } from '../../lib/format'
import { PHASE_COLOR as PHASE_COLORS } from '../../lib/phases'


export function HeroDemoPreview() {
  const reduce = useReducedMotion()
  const [entries, setEntries] = useState<NormalizedEntry[] | null>(null)
  const [pulse, setPulse] = useState(0)
  const [hoverPause, setHoverPause] = useState(false)

  useEffect(() => {
    let cancelled = false
    fetch('/sample.har').then((r) => r.text()).then((text) => {
      const result = parseHar(text, 'sample.har')
      if (!cancelled && result.ok) setEntries(result.data.entries.slice(0, 16))
    })
    return () => { cancelled = true }
  }, [])

  useEffect(() => {
    if (reduce || hoverPause) return
    const id = setInterval(() => setPulse((p) => p + 1), 9500)
    return () => clearInterval(id)
  }, [reduce, hoverPause])

  const rangeEnd = useMemo(() => {
    if (!entries?.length) return 1
    return Math.max(1, ...entries.map((e) => e.endMs))
  }, [entries])

  if (!entries) {
    return (
      <div className="border-hard-2 h-[520px] grid place-items-center font-mono text-[11px] uppercase tracking-[0.2em] text-muted-foreground">
        Loading capture…
      </div>
    )
  }

  return (
    <motion.div
      initial={reduce ? false : { opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.7, duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
      onMouseEnter={() => setHoverPause(true)}
      onMouseLeave={() => setHoverPause(false)}
      className="relative isolate"
    >
      {/* Sticker label above */}
      <div className="absolute -top-3 left-4 z-20 flex items-center gap-2 px-2 py-0.5 bg-primary border-hard-2">
        <span className="h-1.5 w-1.5 bg-foreground" />
        <span className="font-mono text-[10px] uppercase tracking-[0.2em] font-bold text-foreground">Live Capture</span>
      </div>
      <div className="absolute -top-3 right-4 z-20 flex items-center gap-2 px-2 py-0.5 bg-background border-hard-2">
        <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground">SAMPLE.HAR · {entries.length} of 33</span>
      </div>

      <div className="relative border-hard-2 bg-card shadow-hard-md">
        {/* Mini stat strip */}
        <div className="grid grid-cols-4 border-b-2 border-border">
          {[
            { l: 'Reqs', v: String(entries.length) },
            { l: 'Wire', v: formatBytes(entries.reduce((a, e) => a + e.transferred, 0)) },
            { l: 'Span', v: formatMs(rangeEnd) },
            { l: 'Errs', v: String(entries.filter((e) => e.isError).length) },
          ].map((s, i) => (
            <div key={s.l} className={`px-3 py-2 ${i < 3 ? 'border-r-2 border-border' : ''} flex flex-col`}>
              <span className="font-mono text-[9px] uppercase tracking-[0.2em] text-muted-foreground">{s.l}</span>
              <span className="display text-[24px] leading-none mt-1 tabular">{s.v}</span>
            </div>
          ))}
        </div>

        {/* Time axis tick row */}
        <div className="h-6 border-b-2 border-border bg-muted/40 relative px-3 flex items-center font-mono text-[9px] uppercase tracking-[0.18em] text-muted-foreground">
          <span>0</span>
          <div className="absolute inset-0 flex items-end">
            {[0.25, 0.5, 0.75].map((p, i) => (
              <span key={i} className="absolute bottom-0 h-1.5 w-px bg-foreground/40" style={{ left: `${p * 100}%` }} />
            ))}
          </div>
          <span className="ml-auto">{formatMs(rangeEnd)}</span>
        </div>

        {/* Rows */}
        <div className="divide-y divide-border/15">
          {entries.map((e, i) => {
            const leadingPct = (e.startMs / rangeEnd) * 100
            const widthPct = (e.totalMs / rangeEnd) * 100
            return (
              <motion.div
                key={`${pulse}-${e.id}`}
                initial={reduce ? false : { opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: reduce ? 0 : 0.2 + i * 0.06, duration: 0.36, ease: [0.16, 1, 0.3, 1] }}
                className={`relative grid h-7 items-center px-3 text-[10px] ${
                  e.isError ? 'bg-destructive/[0.08]' : ''
                }`}
                style={{ gridTemplateColumns: 'auto 32px minmax(0,1fr) 28px 50px minmax(0,52%)', columnGap: '8px' }}
              >
                <span className="h-2 w-2" style={{ background: RESOURCE_TYPE_COLOR[e.type] }} />
                <span className="font-mono text-[9px] uppercase tracking-wider text-right text-muted-foreground">{e.method}</span>
                <span className="truncate font-mono text-foreground/90">
                  <span className="text-muted-foreground/80">{e.host.replace('.studio', '')}</span>
                  <span>{e.pathname.length > 24 ? e.pathname.slice(0, 24) + '…' : e.pathname}</span>
                </span>
                <span className="font-mono tabular text-right" style={{ color: statusColor(e.status) }}>
                  {formatStatus(e.status)}
                </span>
                <span className="font-mono tabular text-right text-muted-foreground/80">
                  {formatBytes(e.transferred)}
                </span>
                <span className="relative h-full">
                  <div
                    className="absolute top-1/2 -translate-y-1/2 h-2 flex items-stretch"
                    style={{ left: `${leadingPct}%`, width: `${Math.max(0.6, widthPct)}%`, minWidth: '2px' }}
                  >
                    {(Object.keys(e.phases) as Array<keyof typeof PHASE_COLORS>).map((phase) => {
                      const ms = e.phases[phase]
                      const pct = (ms / Math.max(1, e.totalMs)) * 100
                      if (pct <= 0) return null
                      return <span key={phase} style={{ width: `${pct}%`, background: PHASE_COLORS[phase] }} />
                    })}
                  </div>
                </span>
              </motion.div>
            )
          })}
        </div>

        {/* Bottom annotation strip */}
        <div className="border-t-2 border-border px-3 h-7 flex items-center justify-between bg-muted/30 font-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
          <span className="flex items-center gap-2">
            <span className="h-1.5 w-1.5 bg-emerald-500 animate-pulse" />
            autoplay {reduce ? 'off' : hoverPause ? 'paused — hover' : 'every 9s'}
          </span>
          <span>↑ replay</span>
        </div>

        {/* Scanning line during reveal */}
        {!reduce && (
          <motion.div
            key={`scan-${pulse}`}
            initial={{ y: 0, opacity: 0 }}
            animate={{ y: '100%', opacity: [0, 1, 0] }}
            transition={{ duration: 1.4, ease: 'easeOut' }}
            className="absolute left-0 right-0 top-0 h-0.5 bg-primary pointer-events-none"
            style={{ boxShadow: '0 0 10px var(--primary)' }}
          />
        )}
      </div>

      {/* Caption tag below */}
      <div className="mt-4 flex items-baseline justify-between gap-3 font-mono text-[10px] uppercase tracking-[0.2em]">
        <span className="text-muted-foreground">FIG. 01 · waterfall, real data</span>
        <span className="text-foreground">↑ pause on hover</span>
      </div>
    </motion.div>
  )
}
