export function formatBytes(bytes: number): string {
  if (!isFinite(bytes) || bytes <= 0) return '0 B'
  const units = ['B', 'KB', 'MB', 'GB']
  let i = 0
  let n = bytes
  while (n >= 1024 && i < units.length - 1) {
    n /= 1024
    i++
  }
  const decimals = i === 0 ? 0 : n < 10 ? 2 : n < 100 ? 1 : 0
  return `${n.toFixed(decimals)} ${units[i]}`
}

export function formatMs(ms: number): string {
  if (!isFinite(ms) || ms < 0) return '—'
  if (ms < 1) return '< 1 ms'
  if (ms < 1000) return `${Math.round(ms)} ms`
  const s = ms / 1000
  if (s < 10) return `${s.toFixed(2)} s`
  if (s < 60) return `${s.toFixed(1)} s`
  const m = Math.floor(s / 60)
  const rs = Math.round(s - m * 60)
  return `${m}m ${rs}s`
}

export function formatStatus(status: number): string {
  if (status === 0) return '—'
  return String(status)
}

export function statusBucket(status: number): '1xx' | '2xx' | '3xx' | '4xx' | '5xx' | 'other' {
  if (status >= 100 && status < 200) return '1xx'
  if (status >= 200 && status < 300) return '2xx'
  if (status >= 300 && status < 400) return '3xx'
  if (status >= 400 && status < 500) return '4xx'
  if (status >= 500 && status < 600) return '5xx'
  return 'other'
}

export function formatNumber(n: number): string {
  return new Intl.NumberFormat('en-US').format(Math.round(n))
}

export function formatTimeOfDay(d: Date | string): string {
  const date = typeof d === 'string' ? new Date(d) : d
  if (isNaN(date.getTime())) return '—'
  return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false })
}

export function shorten(s: string, max = 80): string {
  if (s.length <= max) return s
  return s.slice(0, max - 1) + '…'
}

export function methodColor(method: string): string {
  const m = method.toUpperCase()
  if (m === 'GET') return 'var(--muted-foreground)'
  if (m === 'POST') return 'var(--chart-2)'
  if (m === 'PUT' || m === 'PATCH') return 'var(--chart-3)'
  if (m === 'DELETE') return 'var(--destructive)'
  return 'var(--muted-foreground)'
}

export function statusColor(status: number): string {
  if (status === 0) return 'var(--destructive)'
  if (status >= 500) return 'var(--destructive)'
  if (status >= 400) return 'var(--primary)'
  if (status >= 300) return 'var(--muted-foreground)'
  return 'var(--foreground)'
}

/* POSIX single-quote escaping. A HAR is untrusted input — URLs and header
   values routinely contain apostrophes, and a malicious one could otherwise
   close the quote and append its own shell command to something the user is
   about to paste into a terminal. */
export function shellQuote(value: string): string {
  return `'${value.replace(/'/g, `'\\''`)}'`
}

export function toCurl(method: string, url: string, headers: Array<{ name: string; value: string }>): string {
  const parts = ['curl', shellQuote(url)]
  if (method.toUpperCase() !== 'GET') parts.push('-X', method.toUpperCase())
  for (const h of headers) parts.push('-H', shellQuote(`${h.name}: ${h.value}`))
  return parts.join(' ')
}
