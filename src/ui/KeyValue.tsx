import type { ReactNode } from 'react'

interface KeyValueProps {
  k: ReactNode
  v: ReactNode
  className?: string
  mono?: boolean
}

export function KeyValue({ k, v, className = '', mono = true }: KeyValueProps) {
  return (
    <div className={`grid grid-cols-[minmax(0,140px)_minmax(0,1fr)] items-baseline gap-3 py-1.5 border-b last:border-b-0 border-border/60 ${className}`}>
      <div className="font-mono text-[11px] uppercase tracking-wider text-muted-foreground">{k}</div>
      <div className={`text-[13px] break-all ${mono ? 'font-mono' : ''} text-foreground/90`}>{v}</div>
    </div>
  )
}
