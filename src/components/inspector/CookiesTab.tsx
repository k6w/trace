import type { NormalizedEntry } from '../../lib/har'

export function CookiesTab({ entry }: { entry: NormalizedEntry }) {
  const req = entry.raw.request.cookies ?? []
  const res = entry.raw.response.cookies ?? []
  return (
    <div className="space-y-6">
      <Section title="Request cookies" cookies={req} />
      <Section title="Response cookies" cookies={res} />
    </div>
  )
}

function Section({ title, cookies }: { title: string; cookies: { name: string; value: string; path?: string; domain?: string; expires?: string | null; httpOnly?: boolean; secure?: boolean }[] }) {
  return (
    <section>
      <h3 className="label-eyebrow mb-2">{title}</h3>
      {cookies.length === 0 ? (
        <div className="text-[12px] text-muted-foreground italic">None.</div>
      ) : (
        <div className="border border-border/60 overflow-hidden">
          <table className="w-full text-[12px] font-mono">
            <thead className="bg-muted/30">
              <tr className="text-muted-foreground">
                {['Name', 'Value', 'Domain', 'Path', 'Expires', 'Flags'].map((h) => (
                  <th key={h} className="text-left font-medium px-2 py-1.5 text-[10px] uppercase tracking-wider">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {cookies.map((c, i) => (
                <tr key={i} className="border-t border-border/60">
                  <td className="px-2 py-1.5 text-foreground/90 break-all">{c.name}</td>
                  <td className="px-2 py-1.5 text-foreground/90 break-all">{c.value}</td>
                  <td className="px-2 py-1.5 text-muted-foreground">{c.domain || '—'}</td>
                  <td className="px-2 py-1.5 text-muted-foreground">{c.path || '—'}</td>
                  <td className="px-2 py-1.5 text-muted-foreground">{c.expires || '—'}</td>
                  <td className="px-2 py-1.5 text-muted-foreground">
                    {[c.httpOnly && 'HttpOnly', c.secure && 'Secure'].filter(Boolean).join(' · ') || '—'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  )
}
