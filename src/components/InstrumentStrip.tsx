import { useMemo } from 'react'
import { useHar } from '../hooks/useHar'
import { formatBytes, formatMs, formatNumber } from '../lib/format'
import { summarize } from '../lib/stats'
import { StatTile } from './StatTile'
import { HistogramStrip } from './HistogramStrip'

export function InstrumentStrip() {
  const { filtered } = useHar()
  const sum = useMemo(() => summarize(filtered), [filtered])

  return (
    <section className="border-b-2 border-border">
      <div className="flex flex-col md:flex-row md:items-stretch">
        <Cell><StatTile label="Requests" value={sum.count} format={formatNumber} /></Cell>
        <Cell><StatTile label="Transferred" value={sum.totalBytes} format={formatBytes} /></Cell>
        <Cell><StatTile label="Wall clock" value={sum.rangeMs} format={formatMs} /></Cell>
        <Cell>
          <StatTile
            label="Slowest"
            value={sum.slowestMs}
            format={formatMs}
            accent={sum.slowestMs >= 1000}
          />
        </Cell>
        <Cell>
          <StatTile
            label="Errors"
            value={sum.errors}
            format={formatNumber}
            accent={sum.errors > 0}
            delta={sum.errors > 0 ? '4xx / 5xx' : undefined}
          />
        </Cell>
        <Cell className="min-w-0 flex-1 border-r-0"><HistogramStrip /></Cell>
      </div>
    </section>
  )
}

function Cell({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`flex min-w-[132px] flex-col border-b border-border-soft px-4 py-4 md:border-b-0 md:border-r md:px-5 ${className}`}>
      {children}
    </div>
  )
}
