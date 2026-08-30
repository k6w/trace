import { MagnifyingGlass, X, Warning } from '@phosphor-icons/react'
import { AnimatePresence, motion } from 'motion/react'
import { useEffect, useMemo, useRef } from 'react'
import { useHar } from '../hooks/useHar'
import { RESOURCE_TYPES, RESOURCE_TYPE_COLOR, RESOURCE_TYPE_LABELS, type ResourceType } from '../lib/classify'
import { statusBucket } from '../lib/format'

const STATUSES = ['2xx', '3xx', '4xx', '5xx'] as const
const METHODS = ['GET', 'POST', 'PUT', 'PATCH', 'DELETE']

export function FilterToolbar() {
  const {
    entries, filters, setQuery, toggleType, toggleMethod, toggleStatus,
    setErrorsOnly, clearFilters, hasActiveFilters, setRange,
  } = useHar()
  const inputRef = useRef<HTMLInputElement>(null)

  const typeCounts = useMemo(() => {
    const m = new Map<ResourceType, number>()
    for (const e of entries) m.set(e.type, (m.get(e.type) ?? 0) + 1)
    return m
  }, [entries])

  const methodCounts = useMemo(() => {
    const m = new Map<string, number>()
    for (const e of entries) m.set(e.method.toUpperCase(), (m.get(e.method.toUpperCase()) ?? 0) + 1)
    return m
  }, [entries])

  const statusCounts = useMemo(() => {
    const m = new Map<string, number>()
    for (const e of entries) {
      const k = statusBucket(e.status)
      m.set(k, (m.get(k) ?? 0) + 1)
    }
    return m
  }, [entries])

  // '/' focuses search
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      const tgt = e.target as HTMLElement | null
      const tag = tgt?.tagName?.toLowerCase()
      if (tag === 'input' || tag === 'textarea' || tgt?.isContentEditable) return
      if (e.key === '/') {
        e.preventDefault()
        inputRef.current?.focus()
        inputRef.current?.select()
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  return (
    <section className="border-b border-border/70 px-4 md:px-6 py-2.5">
      <div className="flex items-center gap-3 flex-wrap">
        <label className="flex items-center gap-2 flex-1 min-w-[220px] border-b border-border focus-within:border-primary transition-colors">
          <MagnifyingGlass size={14} weight="regular" className="text-muted-foreground" />
          <input
            ref={inputRef}
            type="text"
            placeholder="Search URL or domain…"
            value={filters.query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Escape') (e.currentTarget as HTMLInputElement).blur() }}
            className="bg-transparent outline-none py-1.5 text-[13px] flex-1 min-w-0 font-mono placeholder:text-muted-foreground/70"
          />
          {filters.query && (
            <button onClick={() => setQuery('')} className="text-muted-foreground hover:text-foreground">
              <X size={12} />
            </button>
          )}
        </label>

        <button
          onClick={() => setErrorsOnly(!filters.errorsOnly)}
          className={`inline-flex items-center gap-1.5 border px-2.5 py-1 font-mono text-[11px] uppercase tracking-[0.1em] transition-colors ${
            filters.errorsOnly ? 'border-destructive bg-destructive text-destructive-foreground' : 'border-border-soft text-muted-foreground hover:border-border hover:text-foreground'
          }`}
        >
          <Warning size={12} weight="regular" />
          Errors only
        </button>

        {hasActiveFilters && (
          <button onClick={clearFilters} className="text-[11px] font-mono uppercase tracking-wider text-muted-foreground hover:text-foreground">
            Clear all
          </button>
        )}
      </div>

      <div className="mt-2.5 flex items-center gap-1.5 flex-wrap">
        <span className="label-eyebrow mr-1">Type</span>
        {RESOURCE_TYPES.map((t) => {
          const count = typeCounts.get(t) ?? 0
          if (count === 0) return null
          const active = filters.types.has(t)
          return (
            <button
              key={t}
              onClick={() => toggleType(t)}
              className={`group inline-flex items-center gap-1.5 border px-2 py-1 text-[11px] font-mono uppercase tracking-[0.08em] transition-colors ${
                active ? 'border-primary bg-primary text-primary-foreground' : 'border-border-soft text-muted-foreground hover:border-border hover:text-foreground'
              }`}
            >
              <span className="h-2 w-2" style={{ background: RESOURCE_TYPE_COLOR[t] }} />
              {RESOURCE_TYPE_LABELS[t]}
              <span className="font-mono text-[10px] opacity-70 tabular">{count}</span>
            </button>
          )
        })}
        <span className="label-eyebrow mx-2">Method</span>
        {METHODS.map((m) => {
          const count = methodCounts.get(m) ?? 0
          if (count === 0) return null
          const active = filters.methods.has(m)
          return (
            <button
              key={m}
              onClick={() => toggleMethod(m)}
              className={`inline-flex items-center gap-1.5 border px-2 py-1 font-mono text-[11px] uppercase tracking-[0.08em] transition-colors ${
                active ? 'border-primary bg-primary text-primary-foreground' : 'border-border-soft text-muted-foreground hover:border-border hover:text-foreground'
              }`}
            >
              {m}
              <span className="text-[10px] opacity-70">{count}</span>
            </button>
          )
        })}
        <span className="label-eyebrow mx-2">Status</span>
        {STATUSES.map((s) => {
          const count = statusCounts.get(s) ?? 0
          if (count === 0) return null
          const active = filters.statuses.has(s)
          return (
            <button
              key={s}
              onClick={() => toggleStatus(s)}
              className={`inline-flex items-center gap-1.5 border px-2 py-1 font-mono text-[11px] uppercase tracking-[0.08em] transition-colors ${
                active ? 'border-primary bg-primary text-primary-foreground' : 'border-border-soft text-muted-foreground hover:border-border hover:text-foreground'
              }`}
            >
              {s}
              <span className="text-[10px] opacity-70">{count}</span>
            </button>
          )
        })}
      </div>

      <AnimatePresence>
        {hasActiveFilters && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <div className="mt-2 flex items-center gap-1.5 flex-wrap text-[11px]">
              <span className="label-eyebrow">Active</span>
              {filters.query && <Pill onRemove={() => setQuery('')}>q: {filters.query}</Pill>}
              {[...filters.types].map((t) => (
                <Pill key={t} onRemove={() => toggleType(t)}>type: {RESOURCE_TYPE_LABELS[t]}</Pill>
              ))}
              {[...filters.methods].map((m) => (
                <Pill key={m} onRemove={() => toggleMethod(m)}>method: {m}</Pill>
              ))}
              {[...filters.statuses].map((s) => (
                <Pill key={s} onRemove={() => toggleStatus(s)}>status: {s}</Pill>
              ))}
              {filters.errorsOnly && <Pill onRemove={() => setErrorsOnly(false)}>errors only</Pill>}
              {filters.range && <Pill onRemove={() => setRange(null)}>time window</Pill>}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  )
}

function Pill({ children, onRemove }: { children: React.ReactNode; onRemove: () => void }) {
  return (
    <motion.span
      layout
      className="inline-flex items-center gap-1.5 border border-border bg-secondary px-2 py-0.5 text-foreground font-mono uppercase tracking-wider"
    >
      {children}
      <button onClick={onRemove} className="text-muted-foreground hover:text-foreground">
        <X size={10} weight="bold" />
      </button>
    </motion.span>
  )
}
