import { createContext, useCallback, useContext, useMemo, useState } from 'react'
import type { NormalizedEntry, NormalizedHar } from '../lib/har'
import { parseHar } from '../lib/har'
import type { ResourceType } from '../lib/classify'
import { statusBucket } from '../lib/format'

export interface Filters {
  query: string
  types: Set<ResourceType>
  methods: Set<string>
  statuses: Set<'1xx' | '2xx' | '3xx' | '4xx' | '5xx' | 'other'>
  errorsOnly: boolean
  range: [number, number] | null // ms relative
}

const emptyFilters = (): Filters => ({
  query: '',
  types: new Set(),
  methods: new Set(),
  statuses: new Set(),
  errorsOnly: false,
  range: null,
})

interface HarCtx {
  har: NormalizedHar | null
  entries: NormalizedEntry[]
  filtered: NormalizedEntry[]
  filters: Filters
  setQuery: (s: string) => void
  toggleType: (t: ResourceType) => void
  toggleMethod: (m: string) => void
  toggleStatus: (s: '1xx' | '2xx' | '3xx' | '4xx' | '5xx' | 'other') => void
  setErrorsOnly: (v: boolean) => void
  setRange: (r: [number, number] | null) => void
  clearFilters: () => void
  hasActiveFilters: boolean
  selected: number | null
  select: (id: number | null) => void
  next: () => void
  prev: () => void
  loadHar: (text: string, fileName?: string) => { ok: true } | { ok: false; error: string }
  reset: () => void
  fileName: string | null
}

const Ctx = createContext<HarCtx | null>(null)

export function HarProvider({ children }: { children: React.ReactNode }) {
  const [har, setHar] = useState<NormalizedHar | null>(null)
  const [filters, setFilters] = useState<Filters>(emptyFilters)
  const [selected, setSelected] = useState<number | null>(null)
  const [fileName, setFileName] = useState<string | null>(null)

  const entries = har?.entries ?? []

  const filtered = useMemo(() => {
    if (!entries.length) return []
    const q = filters.query.trim().toLowerCase()
    return entries.filter((e) => {
      if (filters.errorsOnly && !e.isError) return false
      if (filters.types.size > 0 && !filters.types.has(e.type)) return false
      if (filters.methods.size > 0 && !filters.methods.has(e.method.toUpperCase())) return false
      if (filters.statuses.size > 0 && !filters.statuses.has(statusBucket(e.status))) return false
      if (filters.range) {
        const [a, b] = filters.range
        if (e.endMs < a || e.startMs > b) return false
      }
      if (q) {
        if (!(e.url.toLowerCase().includes(q) || e.host.toLowerCase().includes(q))) return false
      }
      return true
    })
  }, [entries, filters])

  const select = useCallback((id: number | null) => setSelected(id), [])
  const next = useCallback(() => {
    if (!filtered.length) return
    setSelected((cur) => {
      const idx = cur == null ? -1 : filtered.findIndex((e) => e.id === cur)
      const nextIdx = Math.min(filtered.length - 1, idx + 1)
      return filtered[nextIdx]?.id ?? null
    })
  }, [filtered])
  const prev = useCallback(() => {
    if (!filtered.length) return
    setSelected((cur) => {
      const idx = cur == null ? 0 : filtered.findIndex((e) => e.id === cur)
      const prevIdx = Math.max(0, idx - 1)
      return filtered[prevIdx]?.id ?? null
    })
  }, [filtered])

  const setQuery = useCallback((s: string) => setFilters((f) => ({ ...f, query: s })), [])
  const toggleType = useCallback((t: ResourceType) => setFilters((f) => {
    const types = new Set(f.types)
    if (types.has(t)) types.delete(t); else types.add(t)
    return { ...f, types }
  }), [])
  const toggleMethod = useCallback((m: string) => setFilters((f) => {
    const methods = new Set(f.methods)
    const M = m.toUpperCase()
    if (methods.has(M)) methods.delete(M); else methods.add(M)
    return { ...f, methods }
  }), [])
  const toggleStatus = useCallback((s: '1xx'|'2xx'|'3xx'|'4xx'|'5xx'|'other') => setFilters((f) => {
    const statuses = new Set(f.statuses)
    if (statuses.has(s)) statuses.delete(s); else statuses.add(s)
    return { ...f, statuses }
  }), [])
  const setErrorsOnly = useCallback((v: boolean) => setFilters((f) => ({ ...f, errorsOnly: v })), [])
  const setRange = useCallback((r: [number, number] | null) => setFilters((f) => ({ ...f, range: r })), [])
  const clearFilters = useCallback(() => setFilters(emptyFilters()), [])

  const hasActiveFilters = filters.query.trim().length > 0
    || filters.types.size > 0
    || filters.methods.size > 0
    || filters.statuses.size > 0
    || filters.errorsOnly
    || filters.range != null

  const loadHar = useCallback((text: string, name = 'capture.har') => {
    const result = parseHar(text, name)
    if (!result.ok) return { ok: false as const, error: result.error }
    setHar(result.data)
    setFileName(name)
    setSelected(null)
    setFilters(emptyFilters())
    return { ok: true as const }
  }, [])

  const reset = useCallback(() => {
    setHar(null)
    setSelected(null)
    setFilters(emptyFilters())
    setFileName(null)
  }, [])

  const value = useMemo<HarCtx>(() => ({
    har, entries, filtered, filters,
    setQuery, toggleType, toggleMethod, toggleStatus, setErrorsOnly, setRange, clearFilters,
    hasActiveFilters,
    selected, select, next, prev,
    loadHar, reset, fileName,
  }), [har, entries, filtered, filters, setQuery, toggleType, toggleMethod, toggleStatus,
       setErrorsOnly, setRange, clearFilters, hasActiveFilters,
       selected, select, next, prev, loadHar, reset, fileName])

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>
}

export function useHar() {
  const v = useContext(Ctx)
  if (!v) throw new Error('useHar must be used within HarProvider')
  return v
}
