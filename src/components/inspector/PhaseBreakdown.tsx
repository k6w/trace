import type { NormalizedEntry } from '../../lib/har'
import { formatMs } from '../../lib/format'
import { PHASE_COLOR, PHASE_DESCRIPTION, PHASE_LABEL, PHASE_ORDER, dominantPhase, phaseSum } from '../../lib/phases'

/* One request, drawn the way the waterfall draws it, then unpacked phase by
   phase. The bars are laid out cumulatively so each phase sits where it
   actually happened in the request, not flush-left like a bar chart. */
export function PhaseBreakdown({ entry, compact = false }: { entry: NormalizedEntry; compact?: boolean }) {
  const lead = dominantPhase(entry.phases)
  // Percentages are taken against the measured sum rather than the HAR's own
  // `time`, so segments always add up to exactly the width of their track.
  const measured = phaseSum(entry.phases)

  if (measured <= 0) {
    return (
      <p className="font-mono text-[11px] text-muted-foreground">
        No timing was recorded for this request
        {entry.isCached ? ' — it was served from the cache.' : '.'}
      </p>
    )
  }

  let cursor = 0
  const rows = PHASE_ORDER.map((p) => {
    const ms = Math.max(0, entry.phases[p] ?? 0)
    const offset = cursor
    cursor += ms
    return { phase: p, ms, offsetPct: (offset / measured) * 100, widthPct: (ms / measured) * 100 }
  }).filter((r) => r.ms > 0)

  return (
    <div className="space-y-3">
      {/* The whole request as a single bar — same spectrum as the waterfall. */}
      <div className="flex h-4 w-full overflow-hidden border border-border">
        {rows.map((r) => (
          <span
            key={r.phase}
            style={{ width: `${r.widthPct}%`, background: PHASE_COLOR[r.phase] }}
            title={`${PHASE_LABEL[r.phase]} · ${formatMs(r.ms)}`}
          />
        ))}
      </div>

      <div className="flex items-baseline justify-between font-mono text-[11px] tabular">
        {lead ? (
          <span className="text-muted-foreground">
            Mostly{' '}
            <span style={{ color: PHASE_COLOR[lead.phase] }}>{PHASE_LABEL[lead.phase].toLowerCase()}</span>
            {' '}· {Math.round(lead.share * 100)}%
          </span>
        ) : <span />}
        <span className="text-foreground">{formatMs(entry.totalMs)}</span>
      </div>

      {!compact && (
        <div className="border-t border-border-soft pt-2">
          {rows.map((r) => (
            <div
              key={r.phase}
              className="grid grid-cols-[minmax(0,92px)_minmax(0,1fr)_minmax(0,72px)] items-center gap-3 border-b border-border-soft py-1.5 last:border-b-0"
            >
              <span className="flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.08em]">
                <span className="h-2.5 w-2.5 shrink-0" style={{ background: PHASE_COLOR[r.phase] }} />
                {PHASE_LABEL[r.phase]}
              </span>
              {/* overflow-hidden so a segment can never escape its own track. */}
              <span className="relative h-2.5 overflow-hidden bg-secondary" title={PHASE_DESCRIPTION[r.phase]}>
                <span
                  className="absolute inset-y-0"
                  style={{
                    left: `${r.offsetPct}%`,
                    width: `${Math.max(0.6, r.widthPct)}%`,
                    background: PHASE_COLOR[r.phase],
                  }}
                />
              </span>
              <span className="text-right font-mono text-[11px] tabular text-muted-foreground">
                {formatMs(r.ms)}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
