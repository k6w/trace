import type { NormalizedEntry } from '../lib/har'
import { formatBytes, formatMs, formatStatus, methodColor, statusColor } from '../lib/format'
import { PHASE_COLOR, PHASE_LABEL, dominantPhase } from '../lib/phases'
import { TypeChip } from '../ui/TypeChip'
import { TimingBar } from './TimingBar'
import { WATERFALL_GAP, WATERFALL_GRID } from './waterfallGrid'

interface Props {
  entry: NormalizedEntry
  index: number
  selected: boolean
  rangeStart: number
  rangeEnd: number
  onSelect: (id: number) => void
  reduceMotion: boolean
}

export function WaterfallRow({ entry, selected, rangeStart, rangeEnd, onSelect }: Props) {
  const lead = dominantPhase(entry.phases)

  return (
    <button
      type="button"
      onClick={() => onSelect(entry.id)}
      aria-current={selected || undefined}
      className={`row-base group relative grid h-[30px] w-full items-center px-4 md:px-6 text-left text-[12px] ${
        selected ? 'row-selected' : ''
      }`}
      style={{ gridTemplateColumns: WATERFALL_GRID, columnGap: WATERFALL_GAP }}
    >
      {/* Status rail — amber when selected, red when the request failed. */}
      <span
        aria-hidden
        className="absolute left-0 top-0 bottom-0 w-[3px]"
        style={{
          background: selected
            ? 'var(--primary)'
            : entry.isError
              ? 'var(--destructive)'
              : 'transparent',
        }}
      />

      <TypeChip type={entry.type} />

      <span
        className="font-mono text-[10px] uppercase tracking-wider tabular text-right"
        style={{ color: methodColor(entry.method) }}
      >
        {entry.method}
      </span>

      <span className="truncate font-mono">
        <span className="text-muted-foreground">{entry.host}</span>
        <span className="text-foreground">{entry.pathname}</span>
        {entry.search && <span className="text-muted-foreground/60">{entry.search}</span>}
      </span>

      <span className="font-mono tabular text-right" style={{ color: statusColor(entry.status) }}>
        {formatStatus(entry.status)}
      </span>

      <span className="font-mono tabular text-right text-muted-foreground">
        {entry.isCached ? <span className="text-phase-receive">cached</span> : formatBytes(entry.transferred)}
      </span>

      <span className="relative h-full">
        <TimingBar entry={entry} rangeStart={rangeStart} rangeEnd={rangeEnd} />
        {/* Total time, and the phase that ate it — but only when the culprit is
            something other than the usual wait, so the label stays a signal. */}
        <span className="pointer-events-none absolute right-0 top-1/2 flex -translate-y-1/2 items-center gap-2 pl-3 font-mono text-[10px] tabular">
          {lead.phase !== 'wait' && lead.share > 0.4 && (
            <span
              className="hidden xl:inline text-[9px] uppercase tracking-[0.1em]"
              style={{ color: PHASE_COLOR[lead.phase] }}
              title={`${PHASE_LABEL[lead.phase]} took ${Math.round(lead.share * 100)}% of this request`}
            >
              {PHASE_LABEL[lead.phase]}
            </span>
          )}
          <span className="text-muted-foreground">{formatMs(entry.totalMs)}</span>
        </span>
      </span>
    </button>
  )
}
