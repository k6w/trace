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
  let slowestMs = 0
  let waitMs = 0
  let busyMs = 0
  for (const e of entries) {
    totalBytes += e.transferred
    if (e.isError) errors++
    if (e.endMs > rangeEnd) rangeEnd = e.endMs
    if (e.totalMs > slowestMs) slowestMs = e.totalMs
    waitMs += e.phases.wait ?? 0
    busyMs += e.totalMs
  }
  return {
    count: entries.length,
    totalBytes,
    rangeMs: rangeEnd,
    errors,
    slowestMs,
    /* Share of all request time spent waiting on a server rather than moving
       bytes. The single number that says whether the backend is the problem. */
    waitShare: busyMs > 0 ? waitMs / busyMs : 0,
  }
}
