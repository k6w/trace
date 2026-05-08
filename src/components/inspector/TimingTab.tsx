import type { NormalizedEntry } from '../../lib/har'
import { formatMs } from '../../lib/format'

const PHASE_COLORS: Record<keyof NormalizedEntry['phases'], string> = {
  blocked: 'color-mix(in oklch, var(--muted-foreground) 30%, transparent)',
  dns: 'var(--chart-5)',
  connect: 'var(--chart-3)',
  ssl: 'color-mix(in oklch, var(--primary) 50%, transparent)',
  send: 'color-mix(in oklch, var(--primary) 70%, transparent)',
  wait: 'var(--primary)',
  receive: 'color-mix(in oklch, var(--primary) 88%, transparent)',
}

const PHASE_LABEL: Record<keyof NormalizedEntry['phases'], string> = {
  blocked: 'Blocked',
  dns: 'DNS lookup',
  connect: 'Initial connection',
  ssl: 'SSL handshake',
  send: 'Request sent',
  wait: 'Wait for response (TTFB)',
  receive: 'Content download',
}

export function TimingTab({ entry }: { entry: NormalizedEntry }) {
  const phases = entry.phases
  const total = entry.totalMs || 1
  return (
    <div className="space-y-3">
      <div className="flex items-baseline justify-between">
        <h3 className="label-eyebrow">Phase breakdown</h3>
        <div className="font-mono text-[12px] tabular text-muted-foreground">total {formatMs(entry.totalMs)}</div>
      </div>
      <div className="space-y-2">
        {(Object.keys(phases) as Array<keyof typeof phases>).map((p) => {
          const ms = phases[p]
          const pct = (ms / total) * 100
          if (pct <= 0 && ms <= 0) return null
          return (
            <div key={p} className="grid grid-cols-[minmax(0,140px)_minmax(0,1fr)_minmax(0,80px)] items-center gap-3 py-1">
              <span className="text-[12px] flex items-center gap-2 text-foreground/90">
                <span className="h-2 w-2 rounded-sm" style={{ background: PHASE_COLORS[p] }} />
                {PHASE_LABEL[p]}
              </span>
              <span className="relative h-2 rounded-sm bg-muted/40 overflow-hidden">
                <span className="absolute inset-y-0 left-0" style={{ width: `${Math.max(1, pct)}%`, background: PHASE_COLORS[p] }} />
              </span>
              <span className="font-mono text-[12px] tabular text-right text-muted-foreground">{formatMs(ms)}</span>
            </div>
          )
        })}
      </div>
    </div>
  )
}
