import { useHar } from '../hooks/useHar'
import { formatBytes, formatMs, formatNumber } from '../lib/format'
import { summarize } from '../lib/stats'
import { useMemo } from 'react'
import { StatTile } from './StatTile'
import { HistogramStrip } from './HistogramStrip'

export function InstrumentStrip() {
  const { filtered } = useHar()
  const sum = useMemo(() => summarize(filtered), [filtered])

  return (
    <section className="border-b border-border/70">
      <div className="flex flex-col md:flex-row md:items-stretch md:divide-x divide-border/70 px-4 md:px-2">
        <Cell><StatTile label="Requests" value={sum.count} format={(n) => formatNumber(n)} /></Cell>
        <Cell><StatTile label="Transferred" value={sum.totalBytes} format={(n) => formatBytes(n)} /></Cell>
        <Cell><StatTile label="Total time" value={sum.rangeMs} format={(n) => formatMs(n)} /></Cell>
        <Cell><StatTile label="Errors" value={sum.errors} format={(n) => formatNumber(n)} accent={sum.errors > 0} /></Cell>
        <Cell className="flex-1 min-w-0"><HistogramStrip /></Cell>
      </div>
    </section>
  )
}

function Cell({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`px-4 md:px-5 py-5 min-w-[120px] flex flex-col ${className}`}>{children}</div>
  )
}
