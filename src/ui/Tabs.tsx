import { motion } from 'motion/react'
import type { ReactNode } from 'react'

interface TabItem<T extends string> { value: T; label: ReactNode; disabled?: boolean }

interface TabsProps<T extends string> {
  value: T
  onChange: (v: T) => void
  items: TabItem<T>[]
  layoutId?: string
  className?: string
}

export function Tabs<T extends string>({ value, onChange, items, layoutId = 'tab-indicator', className = '' }: TabsProps<T>) {
  return (
    <div role="tablist" className={`relative flex items-center gap-1 ${className}`}>
      {items.map((item) => {
        const active = item.value === value
        return (
          <button
            key={item.value}
            role="tab"
            aria-selected={active}
            disabled={item.disabled}
            onClick={() => !item.disabled && onChange(item.value)}
            className={`relative px-3 py-2 text-[13px] font-medium tracking-tight transition-colors disabled:opacity-40 ${
              active ? 'text-foreground' : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            <span className="relative z-10">{item.label}</span>
            {active && (
              <motion.span
                layoutId={layoutId}
                transition={{ type: 'spring', stiffness: 460, damping: 36 }}
                className="absolute inset-x-2 bottom-0 h-px bg-primary"
              />
            )}
          </button>
        )
      })}
    </div>
  )
}
