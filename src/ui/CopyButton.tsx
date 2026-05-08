import { Check, Copy } from '@phosphor-icons/react'
import { AnimatePresence, motion } from 'motion/react'
import { useState } from 'react'

export function CopyButton({ value, label = 'Copy', className = '' }: { value: string; label?: string; className?: string }) {
  const [done, setDone] = useState(false)
  return (
    <button
      type="button"
      onClick={async () => {
        try {
          await navigator.clipboard.writeText(value)
          setDone(true)
          setTimeout(() => setDone(false), 1200)
        } catch {}
      }}
      className={`inline-flex items-center gap-1.5 rounded-md border px-2 py-1 text-[11px] font-mono uppercase tracking-wider text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors ${className}`}
    >
      <AnimatePresence mode="wait" initial={false}>
        {done ? (
          <motion.span key="ok" initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.8, opacity: 0 }} className="grid place-items-center">
            <Check size={12} weight="bold" />
          </motion.span>
        ) : (
          <motion.span key="cp" initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.8, opacity: 0 }} className="grid place-items-center">
            <Copy size={12} weight="regular" />
          </motion.span>
        )}
      </AnimatePresence>
      <span>{done ? 'Copied' : label}</span>
    </button>
  )
}
