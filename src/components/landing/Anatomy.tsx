import { motion, useInView, useReducedMotion } from 'motion/react'
import { useRef, useState } from 'react'
import { SectionIndex } from '../../ui/Brutal'

const PHASES = [
  { key: 'blocked', label: 'BLOCKED', start: 0, end: 4, color: 'color-mix(in oklch, var(--muted-foreground) 40%, transparent)', explain: 'Queueing or proxy negotiation. Often the first thing to optimize when it dominates the bar.' },
  { key: 'dns', label: 'DNS', start: 4, end: 12, color: 'var(--chart-5)', explain: 'Resolving the hostname. Cached after first hit; cold-start cost on first contact.' },
  { key: 'connect', label: 'CONNECT', start: 12, end: 24, color: 'var(--chart-3)', explain: 'TCP handshake. Reusable connections will skip this entirely.' },
  { key: 'ssl', label: 'SSL', start: 24, end: 36, color: 'color-mix(in oklch, var(--primary) 50%, transparent)', explain: 'TLS handshake. Visible only on HTTPS. Usually 30–80 ms.' },
  { key: 'send', label: 'SEND', start: 36, end: 38, color: 'color-mix(in oklch, var(--primary) 70%, transparent)', explain: 'Time spent uploading the request. Measurable on POST and PUT.' },
  { key: 'wait', label: 'WAIT', start: 38, end: 80, color: 'var(--primary)', explain: 'Server thinking — time to first byte. The most important phase: it tells you what the backend was doing.' },
  { key: 'receive', label: 'RECEIVE', start: 80, end: 100, color: 'color-mix(in oklch, var(--primary) 88%, transparent)', explain: 'Streaming the response body. Long when the payload is large or bandwidth is limited.' },
] as const

export function Anatomy() {
  const ref = useRef<HTMLDivElement>(null)
  const inView = useInView(ref, { once: true, amount: 0.2 })
  const reduce = useReducedMotion()
  const [hover, setHover] = useState<typeof PHASES[number]['key']>('wait')
  const current = PHASES.find((p) => p.key === hover) ?? PHASES[5]

  return (
    <section id="anatomy" ref={ref} className="relative border-t-2 border-border">
      <div className="mx-auto max-w-[1500px] px-4 md:px-8 py-20 md:py-32">
        <motion.div
          initial={reduce ? undefined : { opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
        >
          <SectionIndex index={2} label="Anatomy" />

          <div className="mt-12 grid grid-cols-12 gap-x-6 gap-y-12">
            {/* Headline column */}
            <header className="col-span-12 lg:col-span-5">
              <h2 className="display text-[64px] md:text-[120px] leading-[0.86]">
                What's<br />in a<br />request?
              </h2>
              <p className="mt-8 font-mono text-[12px] uppercase tracking-[0.04em] leading-[1.6] max-w-[36ch]">
                <span className="text-foreground">Every entry in a HAR is a tiny diary of one HTTP exchange.</span>{' '}
                <span className="text-muted-foreground">Hover any phase below to learn what the browser was doing during it.</span>
              </p>

              <div className="mt-10 grid grid-cols-2 gap-y-3 gap-x-6 max-w-md">
                {[
                  ['Source', 'Browser DevTools'],
                  ['Format', 'JSON · HAR 1.2'],
                  ['Phases', '7 per request'],
                  ['Privacy', 'Local only'],
                ].map(([k, v]) => (
                  <div key={k} className="flex flex-col">
                    <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground">{k}</span>
                    <span className="font-mono text-[12px] mt-0.5">{v}</span>
                  </div>
                ))}
              </div>
            </header>

            {/* Diagram column */}
            <div className="col-span-12 lg:col-span-7">
              <div className="border-hard-2 bg-card">
                {/* Header strip */}
                <div className="flex items-center justify-between border-b-2 border-border px-4 h-9 font-mono text-[10px] uppercase tracking-[0.2em]">
                  <span><span className="text-foreground font-bold">FIG. 02</span> · request anatomy · 200 ms scale</span>
                  <span className="text-muted-foreground">hoverable</span>
                </div>

                {/* The big diagram bar */}
                <div className="p-6">
                  <div className="font-mono text-[10px] uppercase tracking-[0.18em] flex justify-between text-muted-foreground mb-2">
                    <span>0 ms</span>
                    <span>≈ 200 ms</span>
                  </div>
                  <div
                    className="relative h-16 border-hard-2 overflow-hidden"
                    onMouseLeave={() => setHover('wait')}
                  >
                    {PHASES.map((p, i) => (
                      <motion.button
                        type="button"
                        key={p.key}
                        onMouseEnter={() => setHover(p.key)}
                        onFocus={() => setHover(p.key)}
                        initial={reduce ? false : { width: 0 }}
                        animate={inView ? { width: `${p.end - p.start}%` } : {}}
                        transition={{ delay: 0.2 + i * 0.07, duration: 0.55, ease: [0.16, 1, 0.3, 1] }}
                        style={{
                          background: p.color,
                          position: 'absolute',
                          top: 0,
                          bottom: 0,
                          left: `${p.start}%`,
                          borderRight: i < PHASES.length - 1 ? '2px solid var(--border)' : 'none',
                        }}
                        className="block group origin-left"
                        aria-label={p.label}
                      >
                        <span
                          className={`absolute inset-0 transition-opacity ${hover === p.key ? 'opacity-100' : 'opacity-0'}`}
                          style={{ background: 'color-mix(in oklch, var(--foreground) 8%, transparent)' }}
                        />
                      </motion.button>
                    ))}
                    {/* Scale ticks overlay */}
                    {[25, 50, 75].map((p) => (
                      <span key={p} className="absolute top-0 bottom-0 w-px bg-foreground/15" style={{ left: `${p}%` }} />
                    ))}
                  </div>

                  {/* Phase legend */}
                  <div className="mt-5 flex flex-wrap gap-x-4 gap-y-2">
                    {PHASES.map((p) => (
                      <button
                        key={p.key}
                        type="button"
                        onMouseEnter={() => setHover(p.key)}
                        onFocus={() => setHover(p.key)}
                        className={`inline-flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-[0.18em] transition-colors ${
                          hover === p.key ? 'text-foreground font-bold' : 'text-muted-foreground hover:text-foreground'
                        }`}
                      >
                        <span className="h-2 w-2 border border-border/60" style={{ background: p.color }} />
                        {p.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Callout for hovered phase */}
                <motion.div
                  layout
                  className="border-t-2 border-border p-6 bg-muted/30"
                >
                  <div className="flex items-baseline gap-3 mb-3">
                    <span className="display text-[22px] leading-none">{current.label}</span>
                    <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground">phase {PHASES.indexOf(current) + 1}/7</span>
                  </div>
                  <p className="font-mono text-[12px] leading-[1.55] text-foreground/95 max-w-[60ch]">
                    {current.explain}
                  </p>
                </motion.div>
              </div>

              {/* URL anatomy — separate framed block */}
              <div className="mt-6 border-hard-2 bg-card">
                <div className="flex items-center justify-between border-b-2 border-border px-4 h-9 font-mono text-[10px] uppercase tracking-[0.2em]">
                  <span><span className="text-foreground font-bold">FIG. 03</span> · url, decomposed</span>
                </div>
                <div className="p-6 font-mono text-[14px] md:text-[16px] flex flex-wrap items-baseline gap-y-2">
                  <UrlPart label="scheme" color="var(--chart-5)">https</UrlPart>
                  <Sep>://</Sep>
                  <UrlPart label="host" color="var(--chart-3)">api.acme.studio</UrlPart>
                  <UrlPart label="path" color="var(--primary)">/v2/articles/lanterns</UrlPart>
                  <Sep>?</Sep>
                  <UrlPart label="query" color="var(--chart-2)">since=2026-04-01&amp;limit=8</UrlPart>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  )
}

function UrlPart({ label, color, children }: { label: string; color: string; children: React.ReactNode }) {
  return (
    <span className="relative">
      <span style={{ color, borderBottom: `2px solid ${color}`, paddingBottom: 2 }}>{children}</span>
      <span
        className="absolute -top-4 left-0 text-[8px] font-mono uppercase tracking-[0.2em] font-bold"
        style={{ color }}
      >
        {label}
      </span>
    </span>
  )
}

function Sep({ children }: { children: React.ReactNode }) {
  return <span className="text-muted-foreground/70">{children}</span>
}
