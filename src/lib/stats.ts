import type { NormalizedEntry } from './har'

export function histogramBuckets(entries: NormalizedEntry[], rangeStart: number, rangeEnd: number, count = 60): number[] {
  const buckets = new Array<number>(count).fill(0)
  const span = Math.max(1, rangeEnd - rangeStart)
  for (const e of entries) {
    const t = (e.startMs - rangeStart) / span
    if (t < 0 || t > 1) continue
    const idx = Math.min(count - 1, Math.floor(t * count))
    buckets[idx] += 1
  }
  return buckets
}

export function domainBreakdown(entries: NormalizedEntry[]): Array<{ host: string; count: number; bytes: number }> {
  const m = new Map<string, { count: number; bytes: number }>()
  for (const e of entries) {
    if (!e.host) continue
    const cur = m.get(e.host) ?? { count: 0, bytes: 0 }
    cur.count += 1
    cur.bytes += e.transferred
    m.set(e.host, cur)
  }
  return [...m.entries()]
    .map(([host, v]) => ({ host, ...v }))
    .sort((a, b) => b.count - a.count)
}

export function summarize(entries: NormalizedEntry[]) {
  let totalBytes = 0
  let errors = 0
  let rangeEnd = 0
  for (const e of entries) {
    totalBytes += e.transferred
    if (e.isError) errors++
    if (e.endMs > rangeEnd) rangeEnd = e.endMs
  }
  return {
    count: entries.length,
    totalBytes,
    rangeMs: rangeEnd,
    errors,
  }
}
