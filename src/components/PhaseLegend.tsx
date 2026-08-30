import { PHASE_COLOR, PHASE_LABEL, PHASE_ORDER } from '../lib/phases'

/* The key to the whole waterfall. Seven swatches in request order, so the
   spectrum is learnable at a glance instead of hidden behind a tooltip. */
export function PhaseLegend({ className = '' }: { className?: string }) {
  return (
    <div className={`flex items-center gap-3 flex-wrap ${className}`}>
      {PHASE_ORDER.map((p) => (
        <span key={p} className="inline-flex items-center gap-1.5">
          <span className="h-2.5 w-2.5 shrink-0" style={{ background: PHASE_COLOR[p] }} />
          <span className="font-mono text-[10px] uppercase tracking-[0.14em] text-muted-foreground">
            {PHASE_LABEL[p]}
          </span>
        </span>
      ))}
    </div>
  )
}

