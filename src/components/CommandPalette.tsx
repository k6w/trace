import { AnimatePresence, motion } from 'motion/react'
import { ArrowRight, Command, Funnel, Globe, Moon, Sun, UploadSimple, Warning, X } from '@phosphor-icons/react'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useHar } from '../hooks/useHar'
import { useTheme } from '../hooks/useTheme'
import { formatMs } from '../lib/format'

interface Props {
  open: boolean
  onClose: () => void
  onLoadNew: () => void
}

type Action = {
  id: string
  group: 'Filters' | 'Jump' | 'App'
  label: string
  hint?: string
  icon: React.ReactNode
  run: () => void
}

export function CommandPalette({ open, onClose, onLoadNew }: Props) {
  const { entries, filtered, select, setQuery, toggleStatus, setErrorsOnly, clearFilters } = useHar()
  const { theme, toggle } = useTheme()
  const [q, setQ] = useState('')
  const [active, setActive] = useState(0)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (!open) return
    setQ('')
    setActive(0)
    requestAnimationFrame(() => inputRef.current?.focus())
  }, [open])

  const actions: Action[] = useMemo(() => {
    const all: Action[] = []
    all.push({
      id: 'errors',
      group: 'Filters',
      label: 'Show errors only',
      icon: <Warning size={14} />,
      run: () => { setErrorsOnly(true); onClose() },
    })
    all.push({
      id: 'clear',
      group: 'Filters',
      label: 'Clear all filters',
      icon: <X size={14} />,
      run: () => { clearFilters(); onClose() },
    })
    for (const code of ['2xx', '3xx', '4xx', '5xx'] as const) {
      all.push({
        id: `s-${code}`,
        group: 'Filters',
        label: `Filter to ${code}`,
        icon: <Funnel size={14} />,
        run: () => { toggleStatus(code); onClose() },
      })
    }
    all.push({
      id: 'theme',
      group: 'App',
      label: theme === 'dark' ? 'Switch to light theme' : 'Switch to dark theme',
      icon: theme === 'dark' ? <Sun size={14} /> : <Moon size={14} />,
      run: () => { toggle(); onClose() },
    })
    all.push({
      id: 'open',
      group: 'App',
      label: 'Open another HAR file',
      icon: <UploadSimple size={14} />,
      run: () => { onLoadNew(); onClose() },
    })
    // Jump to entries
    const limit = q.trim() ? 30 : 8
    const lower = q.trim().toLowerCase()
    const matches = entries
      .filter((e) => !lower || e.url.toLowerCase().includes(lower) || e.host.toLowerCase().includes(lower))
      .slice(0, limit)
    for (const e of matches) {
      all.push({
        id: `jump-${e.id}`,
        group: 'Jump',
        label: `${e.method.padEnd(6)} ${e.host}${e.pathname}`,
        hint: `${e.status || '—'} · ${formatMs(e.totalMs)}`,
        icon: <Globe size={14} />,
        run: () => { select(e.id); setQuery(''); onClose() },
      })
    }
    return all
  }, [entries, q, theme, onClose, setErrorsOnly, clearFilters, toggleStatus, toggle, onLoadNew, select, setQuery])

  const filteredActions = useMemo(() => {
    if (!q.trim()) return actions
    const lower = q.toLowerCase()
    return actions.filter((a) => a.label.toLowerCase().includes(lower) || a.id.includes(lower))
  }, [actions, q])

  const groups = useMemo(() => {
    const g: Record<string, Action[]> = { Filters: [], Jump: [], App: [] }
    for (const a of filteredActions) g[a.group].push(a)
    return g
  }, [filteredActions])

  const flat = useMemo(() => [...groups.Filters, ...groups.Jump, ...groups.App], [groups])

  const handleKey = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Escape') { e.preventDefault(); onClose() }
    else if (e.key === 'ArrowDown') { e.preventDefault(); setActive((a) => Math.min(flat.length - 1, a + 1)) }
    else if (e.key === 'ArrowUp') { e.preventDefault(); setActive((a) => Math.max(0, a - 1)) }
    else if (e.key === 'Enter') {
      e.preventDefault()
      flat[active]?.run()
    }
  }, [active, flat, onClose])

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.16 }}
          className="fixed inset-0 z-[60] bg-background/55 backdrop-blur-[3px] flex items-start justify-center pt-[14vh] px-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ opacity: 0, y: -8, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.98 }}
            transition={{ type: 'spring', stiffness: 380, damping: 32 }}
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-[680px] border-2 border-border bg-popover shadow-hard-lg overflow-hidden"
            role="dialog"
            aria-modal
          >
            <div className="flex items-center gap-3 px-4 h-12 border-b-2 border-border bg-muted/20">
              <Command size={14} weight="bold" />
              <input
                ref={inputRef}
                value={q}
                onChange={(e) => { setQ(e.target.value); setActive(0) }}
                onKeyDown={handleKey}
                placeholder="SEARCH ENTRIES · JUMP · FILTER…"
                className="flex-1 bg-transparent outline-none font-mono text-[12px] uppercase tracking-[0.06em] placeholder:text-muted-foreground/50"
              />
              <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground tabular">
                {filtered.length}/{entries.length}
              </span>
            </div>
            <div className="max-h-[60vh] overflow-auto">
              {flat.length === 0 ? (
                <div className="px-4 py-8 text-center text-[12px] text-muted-foreground italic">No matches.</div>
              ) : (
                <>
                  {(['Filters', 'Jump', 'App'] as const).map((group) => {
                    const items = groups[group]
                    if (!items.length) return null
                    const startIndex = group === 'Filters' ? 0 : group === 'Jump' ? groups.Filters.length : groups.Filters.length + groups.Jump.length
                    return (
                      <div key={group} className="py-2 border-t border-border/40 first:border-t-0">
                        <div className="px-4 mb-1.5 mt-1 font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground">{group}</div>
                        {items.map((a, i) => {
                          const idx = startIndex + i
                          const isActive = idx === active
                          return (
                            <button
                              key={a.id}
                              onMouseEnter={() => setActive(idx)}
                              onClick={a.run}
                              className={`w-full flex items-center gap-3 px-4 py-2 text-[12px] text-left transition-colors ${
                                isActive ? 'bg-primary/15 text-foreground' : 'text-foreground/80 hover:bg-muted/40'
                              }`}
                            >
                              <span className={isActive ? 'text-primary' : 'text-muted-foreground'}>{a.icon}</span>
                              <span className="flex-1 truncate font-mono">{a.label}</span>
                              {a.hint && <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground tabular">{a.hint}</span>}
                              {isActive && <ArrowRight size={12} weight="bold" className="text-primary" />}
                            </button>
                          )
                        })}
                      </div>
                    )
                  })}
                </>
              )}
            </div>
            <div className="border-t-2 border-border bg-muted/20 px-4 h-9 flex items-center justify-center gap-4 font-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground tabular">
              <span className="flex items-center gap-1.5"><kbd className="kbd">↑</kbd><kbd className="kbd">↓</kbd> Navigate</span>
              <span className="flex items-center gap-1.5"><kbd className="kbd">Enter</kbd> Select</span>
              <span className="flex items-center gap-1.5"><kbd className="kbd">Esc</kbd> Close</span>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
