import { useMemo } from 'react'

interface Props {
  rangeStart: number
  rangeEnd: number
  className?: string
}

export function TimeAxis({ rangeStart, rangeEnd, className = '' }: Props) {
  const span = Math.max(1, rangeEnd - rangeStart)

  const ticks = useMemo(() => {
    let step = 100
    if (span > 60_000) step = 10_000
    else if (span > 30_000) step = 5_000
    else if (span > 10_000) step = 2_000
    else if (span > 5_000) step = 1_000
    else if (span > 2_000) step = 500
    else if (span > 1_000) step = 200
    else if (span > 500) step = 100
    else step = 50

    const out: { ms: number; label: string }[] = []
    for (let t = 0; t <= span + 0.001; t += step) {
      let label: string
      if (t === 0) label = '0'
      else if (t < 1000) label = `${Math.round(t)}ms`
      else label = `${(t / 1000).toFixed(t < 10_000 ? 2 : 1)}s`
      out.push({ ms: t, label })
    }
    return out
  }, [span])

  return (
    <div className={`relative h-6 ${className}`}>
      {ticks.map((t, i) => {
        const left = (t.ms / span) * 100
        // The last label would hang off the right edge; pull it back inside.
        const isLast = i === ticks.length - 1
        return (
          <div
            key={i}
            className="absolute bottom-0 top-0 flex flex-col justify-between"
            style={{ left: `${left}%` }}
          >
            <span
              className={`font-mono text-[9px] tabular text-muted-foreground ${isLast ? '-translate-x-full pr-1' : 'pl-1'}`}
            >
              {t.label}
            </span>
            <span className="block h-1.5 w-px bg-border" />
          </div>
        )
      })}
    </div>
  )
}
