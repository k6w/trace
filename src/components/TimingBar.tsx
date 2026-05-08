import type { NormalizedEntry } from '../lib/har'
import { Tooltip } from '../ui/Tooltip'
import { formatMs } from '../lib/format'

const PHASE_COLORS = {
  blocked: 'color-mix(in oklch, var(--muted-foreground) 30%, transparent)',
  dns: 'var(--chart-5)',
  connect: 'var(--chart-3)',
  ssl: 'color-mix(in oklch, var(--primary) 50%, transparent)',
  send: 'color-mix(in oklch, var(--primary) 70%, transparent)',
  wait: 'var(--primary)',
  receive: 'color-mix(in oklch, var(--primary) 88%, transparent)',
}

const PHASE_LABEL: Record<keyof typeof PHASE_COLORS, string> = {
  blocked: 'Blocked',
  dns: 'DNS',
  connect: 'Connect',
  ssl: 'SSL',
  send: 'Send',
  wait: 'Wait (TTFB)',
  receive: 'Receive',
}

interface Props {
  entry: NormalizedEntry
  rangeStart: number
  rangeEnd: number
}

export function TimingBar({ entry, rangeStart, rangeEnd }: Props) {
  const span = Math.max(1, rangeEnd - rangeStart)
  const leadingPct = ((entry.startMs - rangeStart) / span) * 100
  const totalPct = (entry.totalMs / span) * 100

  if (entry.totalMs <= 0) {
    return (
      <div className="relative h-full w-full">
        <div
          className="absolute top-1/2 h-2 -translate-y-1/2 rounded-sm bg-muted-foreground/40"
          style={{ left: `${leadingPct}%`, width: '2px' }}
        />
      </div>
    )
  }

  return (
    <Tooltip
      content={
        <div className="font-mono text-[11px] tabular space-y-0.5 min-w-[200px] p-1">
          <div className="flex justify-between gap-4 border-b border-border/60 pb-1 mb-1">
            <span className="text-muted-foreground">Started</span>
            <span>{formatMs(entry.startMs)}</span>
          </div>
          {(Object.keys(entry.phases) as Array<keyof typeof PHASE_COLORS>).map((phase) => {
            const ms = entry.phases[phase]
            if (ms <= 0) return null
            return (
              <div key={phase} className="flex justify-between gap-4">
                <span className="flex items-center gap-1.5 text-muted-foreground">
                  <span className="h-2 w-2 rounded-sm" style={{ background: PHASE_COLORS[phase] }} />
                  {PHASE_LABEL[phase]}
                </span>
                <span>{formatMs(ms)}</span>
              </div>
            )
          })}
          <div className="flex justify-between gap-4 border-t border-border/60 pt-1 mt-1">
            <span className="text-muted-foreground">Total</span>
            <span className="text-primary">{formatMs(entry.totalMs)}</span>
          </div>
        </div>
      }
      side="left"
      className="block w-full h-full"
    >
      <div className="relative h-full w-full">
        <div
          className="absolute top-1/2 -translate-y-1/2 h-3 flex items-stretch rounded-[3px] overflow-hidden"
          style={{
            left: `${leadingPct}%`,
            width: `${Math.max(0.4, totalPct)}%`,
            minWidth: '2px',
          }}
        >
          {(Object.keys(entry.phases) as Array<keyof typeof PHASE_COLORS>).map((phase) => {
            const ms = entry.phases[phase]
            const pct = (ms / entry.totalMs) * 100
            if (pct <= 0) return null
            return (
              <span
                key={phase}
                style={{ width: `${pct}%`, background: PHASE_COLORS[phase] }}
              />
            )
          })}
        </div>
      </div>
    </Tooltip>
  )
}
