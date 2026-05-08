import { motion, useInView, useReducedMotion } from 'motion/react'
import { useRef } from 'react'
import { SectionIndex, Marquee } from '../../ui/Brutal'

const SPECS = [
  { value: '100', unit: '%', label: 'Client-side', clarifier: 'Your HAR file never leaves the tab.' },
  { value: '0', label: 'Telemetry', clarifier: 'No analytics, no tracking, no fingerprint.' },
  { value: '60', unit: 'fps', label: 'At 5,000+ entries', clarifier: 'Virtualised scroll, shared-layout reflow.' },
  { value: '7', label: 'Lenses', clarifier: 'Per request: overview, headers, cookies, query, payload, response, timing.' },
]

export function TechSpec() {
  const ref = useRef<HTMLDivElement>(null)
  const inView = useInView(ref, { once: true, amount: 0.2 })
  const reduce = useReducedMotion()

  return (
    <section id="specs" ref={ref} className="border-t-2 border-border relative overflow-hidden">
      <div className="border-y-2 border-border bg-foreground text-background">
        <Marquee
          className="h-9 items-center"
          speed="50s"
          items={[
            'Client-side parsing',
            'No upload',
            'No telemetry',
            'Stays in your tab',
            'Open by default',
            'Built for trust',
          ]}
        />
      </div>

      <div className="mx-auto max-w-[1500px] px-4 md:px-8 py-20 md:py-32">
        <motion.div
          initial={reduce ? undefined : { opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
        >
          <SectionIndex index={5} label="Specifications" />

          <h2 className="mt-12 display text-[64px] md:text-[120px] leading-[0.86] max-w-[16ch]">
            Built for trust.<br />Then for taste.
          </h2>

          <div className="mt-16 grid grid-cols-2 lg:grid-cols-4 gap-x-0 gap-y-12">
            {SPECS.map((s, i) => (
              <motion.div
                key={s.label}
                initial={reduce ? undefined : { opacity: 0, y: 16 }}
                animate={inView ? { opacity: 1, y: 0 } : {}}
                transition={{ delay: 0.1 + i * 0.1, duration: 0.55 }}
                className={`relative px-2 lg:px-8 ${i > 0 ? 'lg:border-l-2 lg:border-border' : ''}`}
              >
                <span className="absolute top-0 right-3 lg:right-5 font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
                  No.{String(i + 1).padStart(2, '0')}
                </span>
                <div className="display tabular leading-[0.84] tracking-tight" style={{ fontSize: 'clamp(72px, 10vw, 144px)' }}>
                  <span>{s.value}</span>
                  {s.unit && <span className="text-[0.32em] align-baseline ml-1 text-muted-foreground">{s.unit}</span>}
                </div>
                <div className="mt-4 font-mono text-[11px] uppercase tracking-[0.2em] font-bold">{s.label}</div>
                <p className="mt-2 font-mono text-[12px] uppercase tracking-[0.04em] text-muted-foreground leading-[1.55] max-w-[28ch]">
                  {s.clarifier}
                </p>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  )
}
