import type { NormalizedEntry } from '../../lib/har'
import { CopyButton } from '../../ui/CopyButton'

export function HeadersTab({ entry }: { entry: NormalizedEntry }) {
  const req = entry.raw.request.headers
  const res = entry.raw.response.headers
  return (
    <div className="space-y-6">
      <Group title="General">
        <Row k="Request URL" v={entry.url} />
        <Row k="Request method" v={entry.method} />
        <Row k="Status code" v={`${entry.status} ${entry.statusText}`} />
        <Row k="Remote address" v={entry.serverIp || '—'} />
      </Group>
      <Group
        title="Request headers"
        copy={req.map((h) => `${h.name}: ${h.value}`).join('\n')}
      >
        {req.length === 0 ? <Empty /> : req.map((h, i) => <Row key={i} k={h.name} v={h.value} />)}
      </Group>
      <Group
        title="Response headers"
        copy={res.map((h) => `${h.name}: ${h.value}`).join('\n')}
      >
        {res.length === 0 ? <Empty /> : res.map((h, i) => <Row key={i} k={h.name} v={h.value} />)}
      </Group>
    </div>
  )
}

function Group({ title, children, copy }: { title: string; children: React.ReactNode; copy?: string }) {
  return (
    <section>
      <div className="flex items-center justify-between mb-2">
        <h3 className="label-eyebrow">{title}</h3>
        {copy && <CopyButton value={copy} label="Copy" />}
      </div>
      <div className="border-t border-border/70">{children}</div>
    </section>
  )
}

function Row({ k, v }: { k: string; v: string }) {
  return (
    <div className="grid grid-cols-[minmax(0,180px)_minmax(0,1fr)] gap-3 py-1.5 border-b border-border/50 items-baseline">
      <span className="font-mono text-[11px] text-muted-foreground break-all">{k}</span>
      <span className="font-mono text-[12px] text-foreground/90 break-all">{v}</span>
    </div>
  )
}

function Empty() {
  return <div className="text-[12px] text-muted-foreground italic py-2">None.</div>
}
