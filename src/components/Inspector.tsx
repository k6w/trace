import { AnimatePresence, motion } from 'motion/react'
import { CaretLeft, CaretRight, X } from '@phosphor-icons/react'
import { useCallback, useEffect, useState } from 'react'
import { useHar } from '../hooks/useHar'
import { Tabs } from '../ui/Tabs'
import { OverviewTab } from './inspector/OverviewTab'
import { HeadersTab } from './inspector/HeadersTab'
import { CookiesTab } from './inspector/CookiesTab'
import { QueryTab } from './inspector/QueryTab'
import { PayloadTab } from './inspector/PayloadTab'
import { ResponseTab } from './inspector/ResponseTab'
import { TimingTab } from './inspector/TimingTab'

type TabId = 'overview' | 'headers' | 'cookies' | 'query' | 'payload' | 'response' | 'timing'

const TABS: { value: TabId; label: string }[] = [
  { value: 'overview', label: 'Overview' },
  { value: 'headers', label: 'Headers' },
  { value: 'cookies', label: 'Cookies' },
  { value: 'query', label: 'Query' },
  { value: 'payload', label: 'Payload' },
  { value: 'response', label: 'Response' },
  { value: 'timing', label: 'Timing' },
]

export function Inspector() {
  const { selected, select, filtered, next, prev } = useHar()
  const entry = selected != null ? filtered.find((e) => e.id === selected) : undefined
  const [tab, setTab] = useState<TabId>('overview')
  const open = !!entry

  const close = useCallback(() => select(null), [select])

  useEffect(() => {
    if (!open) return
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') { e.preventDefault(); close() }
      if (e.key === 'ArrowRight') { e.preventDefault(); next() }
      if (e.key === 'ArrowLeft') { e.preventDefault(); prev() }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open, close, next, prev])

  return (
    <AnimatePresence>
      {open && entry && (
        <>
          <motion.div
            key="backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.18 }}
            className="fixed inset-0 z-40 bg-background/40 backdrop-blur-[2px] lg:bg-transparent"
            onClick={close}
          />
          <motion.aside
            key="drawer"
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', stiffness: 320, damping: 32 }}
            className="fixed top-0 right-0 z-50 flex h-[100dvh] w-full lg:w-[560px] xl:w-[620px] flex-col border-l border-border/70 bg-card shadow-2xl"
          >
            <div className="flex items-center gap-2 px-3 h-12 border-b border-border/70">
              <button
                onClick={prev}
                aria-label="Previous entry"
                className="grid h-8 w-8 place-items-center rounded-md text-muted-foreground hover:text-foreground hover:bg-muted/60 transition-colors"
              >
                <CaretLeft size={14} />
              </button>
              <button
                onClick={next}
                aria-label="Next entry"
                className="grid h-8 w-8 place-items-center rounded-md text-muted-foreground hover:text-foreground hover:bg-muted/60 transition-colors"
              >
                <CaretRight size={14} />
              </button>
              <div className="ml-1 truncate font-mono text-[12px] text-muted-foreground tabular flex-1">
                Entry #{entry.id + 1}
              </div>
              <button
                onClick={close}
                aria-label="Close"
                className="grid h-8 w-8 place-items-center rounded-md text-muted-foreground hover:text-foreground hover:bg-muted/60 transition-colors"
              >
                <X size={14} />
              </button>
            </div>
            <div className="px-2 border-b border-border/70 overflow-x-auto">
              <Tabs value={tab} onChange={setTab} items={TABS} />
            </div>
            <div className="flex-1 overflow-auto p-4 md:p-5">
              {tab === 'overview' && <OverviewTab entry={entry} />}
              {tab === 'headers' && <HeadersTab entry={entry} />}
              {tab === 'cookies' && <CookiesTab entry={entry} />}
              {tab === 'query' && <QueryTab entry={entry} />}
              {tab === 'payload' && <PayloadTab entry={entry} />}
              {tab === 'response' && <ResponseTab entry={entry} />}
              {tab === 'timing' && <TimingTab entry={entry} />}
            </div>
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  )
}
