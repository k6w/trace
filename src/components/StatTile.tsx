import { animate, useMotionValue, useMotionValueEvent } from 'motion/react'
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
  const mv = useMotionValue(0)
  const [display, setDisplay] = useState(() => format(0))

  useEffect(() => {
    const controls = animate(mv, value, { duration: 0.7, ease: [0.16, 1, 0.3, 1] })
    return () => controls.stop()
  }, [value, mv])

  useMotionValueEvent(mv, 'change', (v) => {
    setDisplay(format(v))
  })

  return (
    <div className={`flex flex-col gap-2 ${className}`}>
      <div className="label-eyebrow">{label}</div>
      <div className="flex items-baseline gap-2">
        <span
          className={`tabular text-[28px] leading-none tracking-tight font-medium ${accent ? 'text-primary' : 'text-foreground'}`}
        >
          {display}
        </span>
        {delta && <span className="font-mono text-[11px] text-muted-foreground">{delta}</span>}
      </div>
    </div>
  )
}
