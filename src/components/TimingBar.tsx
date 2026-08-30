import type { NormalizedEntry } from '../lib/har'
import { Tooltip } from '../ui/Tooltip'
import { formatMs } from '../lib/format'
import { PHASE_COLOR, PHASE_LABEL, PHASE_ORDER, phaseSum } from '../lib/phases'

interface Props {
  entry: NormalizedEntry
  rangeStart: number
  rangeEnd: number
}

export function TimingBar({ entry, rangeStart, rangeEnd }: Props) {
  const span = Math.max(1, rangeEnd - rangeStart)
  const leadingPct = ((entry.startMs - rangeStart) / span) * 100
  const totalPct = (entry.totalMs / span) * 100
  const measured = phaseSum(entry.phases)

  if (entry.totalMs <= 0 || measured <= 0) {
    return (
      <div className="relative h-full w-full">
        <div
          className="absolute top-1/2 h-2.5 w-[2px] -translate-y-1/2 bg-muted-foreground/40"
          style={{ left: `${leadingPct}%` }}
        />
      </div>
    )
  }

  return (
    <Tooltip
      content={
        <div className="min-w-[220px] space-y-0.5 p-1 font-mono text-[11px] tabular">
          <div className="mb-1 flex justify-between gap-4 border-b border-border/60 pb-1">
            <span className="text-muted-foreground">Started</span>
            <span>{formatMs(entry.startMs)}</span>
          </div>
          {PHASE_ORDER.map((phase) => {
            const ms = entry.phases[phase]
            if (ms <= 0) return null
            const pct = Math.round((ms / measured) * 100)
            return (
              <div key={phase} className="flex justify-between gap-4">
                <span className="flex items-center gap-1.5 text-muted-foreground">
                  <span className="h-2 w-2" style={{ background: PHASE_COLOR[phase] }} />
                  {PHASE_LABEL[phase]}
                </span>
                <span>
                  {formatMs(ms)}
                  <span className="ml-2 text-muted-foreground/70">{pct}%</span>
                </span>
              </div>
            )
          })}
          <div className="mt-1 flex justify-between gap-4 border-t border-border/60 pt-1">
            <span className="text-muted-foreground">Total</span>
            <span className="text-primary">{formatMs(entry.totalMs)}</span>
          </div>
        </div>
      }
      side="left"
      className="block h-full w-full"
    >
      <div className="relative h-full w-full">
        <div
          className="absolute top-1/2 flex h-[11px] -translate-y-1/2 items-stretch overflow-hidden"
          style={{
            left: `${leadingPct}%`,
            width: `${Math.max(0.4, totalPct)}%`,
            minWidth: '2px',
            boxShadow: '0 0 0 1px color-mix(in oklch, var(--background) 55%, transparent)',
          }}
        >
          {PHASE_ORDER.map((phase) => {
            const ms = entry.phases[phase]
            const pct = (ms / measured) * 100
            if (pct <= 0) return null
            return <span key={phase} style={{ width: `${pct}%`, background: PHASE_COLOR[phase] }} />
          })}
        </div>
      </div>
    </Tooltip>
  )
}
