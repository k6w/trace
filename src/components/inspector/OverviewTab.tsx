import type { NormalizedEntry } from '../../lib/har'
import { Badge } from '../../ui/Badge'
import { KeyValue } from '../../ui/KeyValue'
import { CopyButton } from '../../ui/CopyButton'
import { RESOURCE_TYPE_COLOR, RESOURCE_TYPE_LABELS } from '../../lib/classify'
import { formatBytes, formatMs, formatStatus, methodColor, statusColor, formatTimeOfDay } from '../../lib/format'

export function OverviewTab({ entry }: { entry: NormalizedEntry }) {
  return (
    <div className="space-y-5">
      <div className="space-y-3">
        <div className="flex items-center gap-2 flex-wrap">
          <Badge color={methodColor(entry.method)} variant="tonal">
            {entry.method}
          </Badge>
          <Badge color={statusColor(entry.status)} variant="tonal">
            {formatStatus(entry.status)} {entry.statusText}
          </Badge>
          <Badge color={RESOURCE_TYPE_COLOR[entry.type]} variant="tonal">
            <span className="h-1.5 w-1.5 rounded-full" style={{ background: RESOURCE_TYPE_COLOR[entry.type] }} />
            {RESOURCE_TYPE_LABELS[entry.type]}
          </Badge>
          {entry.isCached && <Badge color="var(--primary)" variant="tonal">Cached · {String(entry.raw._fromCache)}</Badge>}
          {entry.protocol && <Badge color="var(--muted-foreground)" variant="outline">{entry.protocol}</Badge>}
        </div>
        <div className="font-mono text-[14px] leading-snug break-all text-foreground">
          <span className="text-muted-foreground">{entry.scheme}://</span>
          <span className="text-foreground">{entry.host}</span>
          <span className="text-foreground/95">{entry.pathname}</span>
          {entry.search && <span className="text-muted-foreground/80">{entry.search}</span>}
        </div>
        <div className="flex items-center gap-2">
          <CopyButton value={entry.url} label="Copy URL" />
          <CopyButton
            value={`curl '${entry.url}' -X ${entry.method} ${entry.raw.request.headers.map((h) => `-H '${h.name}: ${h.value}'`).join(' ')}`}
            label="Copy as curl"
          />
        </div>
      </div>

      <div className="border-t border-border/70 pt-4">
        <KeyValue k="Total time" v={formatMs(entry.totalMs)} />
        <KeyValue k="Started" v={`${formatMs(entry.startMs)} · ${formatTimeOfDay(entry.raw.startedDateTime)}`} />
        <KeyValue k="Ended" v={formatMs(entry.endMs)} />
        <KeyValue k="Size on wire" v={formatBytes(entry.transferred)} />
        <KeyValue k="Decoded body" v={formatBytes(entry.sizeBytes)} />
        <KeyValue k="Server IP" v={entry.serverIp || '—'} />
        <KeyValue k="MIME" v={entry.mimeType || '—'} />
        <KeyValue k="Initiator" v={entry.initiatorType || '—'} />
        <KeyValue k="Priority" v={entry.raw._priority || '—'} />
      </div>
    </div>
  )
}
