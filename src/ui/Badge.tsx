import type { CSSProperties, ReactNode } from 'react'

interface BadgeProps {
  children: ReactNode
  color?: string
  variant?: 'tonal' | 'outline' | 'solid'
  className?: string
  style?: CSSProperties
}

export function Badge({ children, color, variant = 'tonal', className = '', style }: BadgeProps) {
  const baseStyle: CSSProperties = {
    ...(variant === 'tonal' && color
      ? { backgroundColor: `color-mix(in oklch, ${color} 14%, transparent)`, color, borderColor: `color-mix(in oklch, ${color} 18%, transparent)` }
      : {}),
    ...(variant === 'outline' && color
      ? { borderColor: `color-mix(in oklch, ${color} 35%, transparent)`, color }
      : {}),
    ...(variant === 'solid' && color
      ? { backgroundColor: color, color: 'var(--primary-foreground)' }
      : {}),
    ...style,
  }
  return (
    <span
      style={baseStyle}
      className={`inline-flex items-center gap-1.5 px-2 py-0.5 font-mono text-[10px] font-medium uppercase tracking-[0.1em] border tabular ${className}`}
    >
      {children}
    </span>
  )
}
