import type { NormalizedEntry } from '../../lib/har'
import { formatMs } from '../../lib/format'
import { PHASE_DESCRIPTION, PHASE_LABEL, PHASE_ORDER, dominantPhase } from '../../lib/phases'
import { PhaseBreakdown } from './PhaseBreakdown'

export function TimingTab({ entry }: { entry: NormalizedEntry }) {
  const lead = dominantPhase(entry.phases)
  const active = PHASE_ORDER.filter((p) => (entry.phases[p] ?? 0) > 0)

  return (
    <div className="space-y-6">
      <section className="space-y-3">
        <div className="flex items-baseline justify-between">
          <h3 className="label-eyebrow-strong">Phase breakdown</h3>
          <span className="font-mono text-[11px] tabular text-muted-foreground">
            started at {formatMs(entry.startMs)}
          </span>
        </div>
        <PhaseBreakdown entry={entry} />
      </section>

      <section className="space-y-2">
        <h3 className="label-eyebrow-strong">What each phase means</h3>
        <dl className="border-t border-border-soft">
          {active.map((p) => (
            <div key={p} className="grid grid-cols-[minmax(0,92px)_minmax(0,1fr)] gap-3 border-b border-border-soft py-2">
              <dt className="font-mono text-[11px] uppercase tracking-[0.08em] text-muted-foreground">
                {PHASE_LABEL[p]}
              </dt>
              <dd className="font-mono text-[11px] leading-relaxed text-foreground/90">
                {PHASE_DESCRIPTION[p]}
                {lead && p === lead.phase && (
                  <span className="ml-2 text-primary">← this one cost you {formatMs(lead.ms)}</span>
                )}
              </dd>
            </div>
          ))}
        </dl>
      </section>
    </div>
  )
}
