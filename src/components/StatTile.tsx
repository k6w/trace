import { animate, useMotionValue, useMotionValueEvent, useReducedMotion } from 'motion/react'
import { useEffect, useState } from 'react'

interface StatTileProps {
  label: string
  value: number
  format: (n: number) => string
  delta?: string
  accent?: boolean
  className?: string
}

export function StatTile({ label, value, format, delta, accent, className = '' }: StatTileProps) {
  const reduce = useReducedMotion()
  const mv = useMotionValue(0)
  const [display, setDisplay] = useState(() => format(reduce ? value : 0))

  useEffect(() => {
    if (reduce) { setDisplay(format(value)); return }
    const controls = animate(mv, value, { duration: 0.7, ease: [0.16, 1, 0.3, 1] })
    return () => controls.stop()
  }, [value, mv, reduce, format])

  useMotionValueEvent(mv, 'change', (v) => setDisplay(format(v)))

  return (
    <div className={`flex flex-col gap-1.5 ${className}`}>
      <div className="label-eyebrow">{label}</div>
      <div className="flex items-baseline gap-2">
        <span
          className={`tabular text-[26px] font-medium leading-none tracking-tight ${
            accent ? 'text-primary' : 'text-foreground'
          }`}
        >
          {display}
        </span>
        {delta && (
          <span className="font-mono text-[10px] uppercase tracking-[0.12em] text-muted-foreground">
            {delta}
          </span>
        )}
      </div>
    </div>
  )
}
