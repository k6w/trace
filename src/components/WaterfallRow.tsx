import { motion } from 'motion/react'
import type { NormalizedEntry } from '../lib/har'
import { RESOURCE_TYPE_COLOR, RESOURCE_TYPE_LABELS } from '../lib/classify'
import { formatBytes, formatMs, formatStatus, methodColor, statusColor } from '../lib/format'
import { TimingBar } from './TimingBar'

interface Props {
  entry: NormalizedEntry
  index: number
  selected: boolean
  rangeStart: number
  rangeEnd: number
  onSelect: (id: number) => void
  reduceMotion: boolean
}

export function WaterfallRow({ entry, index, selected, rangeStart, rangeEnd, onSelect, reduceMotion }: Props) {
  const delay = reduceMotion ? 0 : Math.min(index * 0.014, 0.84)
  return (
    <motion.button
      type="button"
      onClick={() => onSelect(entry.id)}
      initial={reduceMotion ? false : { opacity: 0, x: -8 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay, duration: 0.32, ease: [0.16, 1, 0.3, 1] }}
      className={`group relative grid h-7 w-full items-center px-4 md:px-6 text-left text-[12px] transition-colors border-l-2 ${
        entry.isError ? 'border-destructive/70' : 'border-transparent'
      } ${selected ? 'bg-primary text-primary-foreground' : 'hover:bg-primary/30'}`}
      style={{
        gridTemplateColumns:
          'auto minmax(0,28px) minmax(0,1fr) minmax(0,72px) minmax(0,84px) minmax(0,42%)',
        columnGap: '12px',
      }}
    >
      <span
        className="h-1.5 w-1.5 rounded-full ml-0.5"
        style={{ background: RESOURCE_TYPE_COLOR[entry.type] }}
        title={RESOURCE_TYPE_LABELS[entry.type]}
      />
      <span
        className="font-mono text-[10px] uppercase tracking-wider tabular text-right"
        style={{ color: methodColor(entry.method) }}
      >
        {entry.method}
      </span>
      <span className="truncate font-mono text-foreground/90">
        <span className="text-muted-foreground/80">{entry.host}</span>
        <span className="text-foreground/90">{entry.pathname}</span>
        {entry.search && <span className="text-muted-foreground/60">{entry.search}</span>}
      </span>
      <span
        className="font-mono tabular text-right"
        style={{ color: statusColor(entry.status) }}
      >
        {formatStatus(entry.status)}
      </span>
      <span className="font-mono tabular text-right text-muted-foreground">
        {entry.isCached ? <span className="text-primary/80">cached</span> : formatBytes(entry.transferred)}
      </span>
      <span className="relative h-full">
        <TimingBar entry={entry} rangeStart={rangeStart} rangeEnd={rangeEnd} />
        <span className="pointer-events-none absolute right-1 top-1/2 -translate-y-1/2 font-mono text-[10px] tabular text-muted-foreground/80">
          {formatMs(entry.totalMs)}
        </span>
      </span>
      {selected && (
        <motion.span
          layoutId="row-indicator"
          className="absolute left-0 top-0 bottom-0 w-[3px] bg-primary"
          transition={{ type: 'spring', stiffness: 460, damping: 38 }}
        />
      )}
    </motion.button>
  )
}
