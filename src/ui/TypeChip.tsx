import { RESOURCE_TYPE_COLOR, RESOURCE_TYPE_LABELS, type ResourceType } from '../lib/classify'

/* Resource type, read as text rather than as a color. A three-letter mono chip
   with a colored left edge: legible at a 30px row height, and it leaves the
   full color range free for the phase spectrum, which needs it more. */
export function TypeChip({ type, className = '' }: { type: ResourceType; className?: string }) {
  return (
    <span
      className={`inline-flex h-[15px] items-center pl-1 pr-1.5 font-mono text-[9px] font-medium uppercase tracking-[0.08em] text-muted-foreground ${className}`}
      style={{
        borderLeft: `2px solid ${RESOURCE_TYPE_COLOR[type]}`,
        background: `color-mix(in oklch, ${RESOURCE_TYPE_COLOR[type]} 12%, transparent)`,
      }}
      title={RESOURCE_TYPE_LABELS[type]}
    >
      {RESOURCE_TYPE_LABELS[type]}
    </span>
  )
}
