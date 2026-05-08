import { useMemo } from 'react'

interface Props {
  rangeStart: number
  rangeEnd: number
  className?: string
}

export function TimeAxis({ rangeStart, rangeEnd, className = '' }: Props) {
  const ticks = useMemo(() => {
    const span = Math.max(1, rangeEnd - rangeStart)
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
      else if (t < 1000) label = `${Math.round(t)} ms`
      else label = `${(t / 1000).toFixed(t < 10000 ? 2 : 1)} s`
      out.push({ ms: t, label })
    }
    return out
  }, [rangeStart, rangeEnd])

  const span = Math.max(1, rangeEnd - rangeStart)

  return (
    <div className={`relative h-7 border-b border-border/70 ${className}`}>
      <div className="absolute inset-0">
        {ticks.map((t, i) => {
          const left = (t.ms / span) * 100
          return (
            <div
              key={i}
              className="absolute top-0 bottom-0 flex flex-col justify-between"
              style={{ left: `${left}%` }}
            >
              <span className="font-mono text-[10px] text-muted-foreground tabular pl-1.5 -translate-x-px">
                {t.label}
              </span>
              <span className="block w-px h-1 bg-border/70" />
            </div>
          )
        })}
      </div>
    </div>
  )
}
