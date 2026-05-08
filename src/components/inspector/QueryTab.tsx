import type { NormalizedEntry } from '../../lib/har'

export function QueryTab({ entry }: { entry: NormalizedEntry }) {
  const params = entry.raw.request.queryString ?? []
  return (
    <section>
      <h3 className="label-eyebrow mb-2">Query string parameters</h3>
      {params.length === 0 ? (
        <div className="text-[12px] text-muted-foreground italic">No query parameters.</div>
      ) : (
        <div className="border-t border-border/60">
          {params.map((p, i) => (
            <div key={i} className="grid grid-cols-[minmax(0,180px)_minmax(0,1fr)] gap-3 py-1.5 border-b border-border/50 items-baseline">
              <span className="font-mono text-[11px] text-muted-foreground break-all">{p.name}</span>
              <span className="font-mono text-[12px] text-foreground/90 break-all">{p.value}</span>
            </div>
          ))}
        </div>
      )}
      <div className="mt-4 label-eyebrow">Parsed URL</div>
      <div className="border-t border-border/60 mt-2 grid grid-cols-[minmax(0,140px)_minmax(0,1fr)] gap-3 text-[12px] font-mono py-1.5">
        <span className="text-muted-foreground text-[11px] uppercase">scheme</span><span className="break-all">{entry.scheme}</span>
        <span className="text-muted-foreground text-[11px] uppercase">host</span><span className="break-all">{entry.host}</span>
        <span className="text-muted-foreground text-[11px] uppercase">path</span><span className="break-all">{entry.pathname}</span>
        <span className="text-muted-foreground text-[11px] uppercase">search</span><span className="break-all">{entry.search || '—'}</span>
      </div>
    </section>
  )
}
