import { useState, type ReactNode } from 'react'
import { motion, AnimatePresence } from 'motion/react'

interface TooltipProps {
  children: ReactNode
  content: ReactNode
  side?: 'top' | 'bottom' | 'left' | 'right'
  className?: string
}

export function Tooltip({ children, content, side = 'top', className = '' }: TooltipProps) {
  const [open, setOpen] = useState(false)
  return (
    <span
      className={`relative inline-flex ${className}`}
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
      onFocus={() => setOpen(true)}
      onBlur={() => setOpen(false)}
    >
      {children}
      <AnimatePresence>
        {open && (
          <motion.span
            initial={{ opacity: 0, y: side === 'top' ? 4 : -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: side === 'top' ? 4 : -4 }}
            transition={{ duration: 0.12 }}
            className={`pointer-events-none absolute z-50 whitespace-nowrap border-2 border-border bg-popover px-2 py-1 text-[11px] tracking-wide text-popover-foreground shadow-hard ${
              side === 'top' ? 'bottom-full left-1/2 mb-1.5 -translate-x-1/2'
              : side === 'bottom' ? 'top-full left-1/2 mt-1.5 -translate-x-1/2'
              : side === 'left' ? 'right-full top-1/2 mr-1.5 -translate-y-1/2'
              : 'left-full top-1/2 ml-1.5 -translate-y-1/2'
            }`}
          >
            {content}
          </motion.span>
        )}
      </AnimatePresence>
    </span>
  )
}
