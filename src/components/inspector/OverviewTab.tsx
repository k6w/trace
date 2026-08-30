import type { NormalizedEntry } from '../../lib/har'
import { Badge } from '../../ui/Badge'
import { KeyValue } from '../../ui/KeyValue'
import { CopyButton } from '../../ui/CopyButton'
import { TypeChip } from '../../ui/TypeChip'
import { PhaseBreakdown } from './PhaseBreakdown'
import { formatBytes, formatMs, formatStatus, methodColor, statusColor, formatTimeOfDay, toCurl } from '../../lib/format'
import { useHar } from '../../hooks/useHar'
import { useMemo } from 'react'

export function OverviewTab({ entry }: { entry: NormalizedEntry }) {
  const { entries, select } = useHar()

  /* HAR records what asked for each request, but only as a URL — and a URL is
     not unique in a capture that polls. Resolve against the entries we already
     have, preferring the most recent one that had actually started, which is
     the only candidate that could have issued this request. */
  const { initiator, triggered } = useMemo(() => {
    const initiatorUrl = entry.raw._initiator?.url
    let initiator: NormalizedEntry | undefined
    if (initiatorUrl && initiatorUrl !== entry.url) {
      for (const e of entries) {
        if (e.url !== initiatorUrl || e.id === entry.id) continue
        if (e.startMs > entry.startMs) continue
        if (!initiator || e.startMs > initiator.startMs) initiator = e
      }
    }
    const triggered = entries.filter(
      (e) => e.id !== entry.id && e.raw._initiator?.url === entry.url && e.startMs >= entry.startMs
    )
    return { initiator, triggered }
  }, [entries, entry])

  const compression =
    entry.sizeBytes > 0 && entry.transferred > 0 && entry.transferred < entry.sizeBytes
      ? Math.round((1 - entry.transferred / entry.sizeBytes) * 100)
      : null

  return (
    <div className="space-y-6">
      <section className="space-y-3">
        <div className="flex flex-wrap items-center gap-2">
          <Badge color={methodColor(entry.method)} variant="tonal">{entry.method}</Badge>
          <Badge color={statusColor(entry.status)} variant="tonal">
            {formatStatus(entry.status)} {entry.statusText}
          </Badge>
          <TypeChip type={entry.type} />
          {entry.isCached && <Badge color="var(--phase-receive)" variant="tonal">Cached · {String(entry.raw._fromCache)}</Badge>}
          {entry.protocol && <Badge color="var(--muted-foreground)" variant="outline">{entry.protocol}</Badge>}
        </div>

        <div className="break-all font-mono text-[13px] leading-snug">
          <span className="text-muted-foreground">{entry.scheme}://</span>
          <span className="text-foreground">{entry.host}</span>
          <span className="text-foreground">{entry.pathname}</span>
          {entry.search && <span className="text-muted-foreground">{entry.search}</span>}
        </div>

        <div className="flex items-center gap-2">
          <CopyButton value={entry.url} label="Copy URL" />
          <CopyButton
            value={toCurl(entry.method, entry.url, entry.raw.request.headers)}
            label="Copy as curl"
          />
        </div>
      </section>

      {/* The timing is the headline, so it comes before the metadata table. */}
      <section className="space-y-2.5">
        <h3 className="label-eyebrow-strong">Where the time went</h3>
        <PhaseBreakdown entry={entry} compact />
      </section>

      <section className="border-t-2 border-border pt-4">
        <KeyValue k="Total time" v={formatMs(entry.totalMs)} />
        <KeyValue k="Started" v={`${formatMs(entry.startMs)} · ${formatTimeOfDay(entry.raw.startedDateTime)}`} />
        <KeyValue k="Ended" v={formatMs(entry.endMs)} />
        <KeyValue k="Size on wire" v={formatBytes(entry.transferred)} />
        <KeyValue
          k="Decoded body"
          v={
            <>
              {formatBytes(entry.sizeBytes)}
              {compression !== null && (
                <span className="ml-2 text-phase-receive">{compression}% smaller on the wire</span>
              )}
            </>
          }
        />
        <KeyValue k="Server IP" v={entry.serverIp || '—'} />
        <KeyValue k="MIME" v={entry.mimeType || '—'} />
        <KeyValue k="Initiator" v={entry.initiatorType || '—'} />
        <KeyValue k="Priority" v={entry.raw._priority || '—'} />
      </section>

      {(initiator || triggered.length > 0) && (
        <section className="space-y-2.5">
          <h3 className="label-eyebrow-strong">Request chain</h3>
          <div className="border-t border-border-soft">
            {initiator && (
              <ChainRow role="Requested by" entry={initiator} onJump={() => select(initiator.id)} />
            )}
            {triggered.slice(0, 8).map((t) => (
              <ChainRow key={t.id} role="Triggered" entry={t} onJump={() => select(t.id)} />
            ))}
            {triggered.length > 8 && (
              <div className="py-2 font-mono text-[11px] text-muted-foreground">
                and {triggered.length - 8} more
              </div>
            )}
          </div>
        </section>
      )}
    </div>
  )
}

function ChainRow({ role, entry, onJump }: { role: string; entry: NormalizedEntry; onJump: () => void }) {
  return (
    <button
      type="button"
      onClick={onJump}
      className="grid w-full grid-cols-[minmax(0,92px)_minmax(0,1fr)_minmax(0,60px)] items-baseline gap-3 border-b border-border-soft py-2 text-left transition-colors last:border-b-0 hover:bg-secondary"
    >
      <span className="font-mono text-[10px] uppercase tracking-[0.1em] text-muted-foreground">{role}</span>
      <span className="truncate font-mono text-[11px] text-foreground">
        {entry.pathname.split('/').pop() || entry.host}
      </span>
      <span className="text-right font-mono text-[10px] tabular text-muted-foreground">
        {formatMs(entry.totalMs)}
      </span>
    </button>
  )
}
