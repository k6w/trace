import { motion, useInView, useReducedMotion } from 'motion/react'
import { useRef } from 'react'
import { ArrowRight, Command, Eye, Funnel, Globe } from '@phosphor-icons/react'
import { SectionIndex } from '../../ui/Brutal'

export function FeatureTriptych() {
  const ref = useRef<HTMLDivElement>(null)
  const inView = useInView(ref, { once: true, amount: 0.1 })
  const reduce = useReducedMotion()

  return (
    <section id="features" ref={ref} className="border-t-2 border-border">
      <div className="mx-auto max-w-[1500px] px-4 md:px-8 py-20 md:py-32">
        <motion.div
          initial={reduce ? undefined : { opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
        >
          <SectionIndex index={4} label="Surfaces" />

          <h2 className="mt-12 display text-[64px] md:text-[120px] leading-[0.86] max-w-[14ch]">
            Three surfaces.<br />One rhythm.
          </h2>

          <div className="mt-16 grid grid-cols-12 gap-5">
            <Panel className="col-span-12 lg:col-span-8 row-span-1">
              <PanelHeader number="01" title="The waterfall, properly drawn" icon={<Funnel size={14} weight="bold" />} />
              <PanelBody>
                <p className="font-mono text-[12px] uppercase tracking-[0.04em] leading-[1.55] text-muted-foreground max-w-[60ch]">
                  Tabular numerals. Virtualized scroll past 5,000 entries. Motion that explains state, never decorates it.
                </p>
                <WaterfallMock />
              </PanelBody>
              <PanelFoot items={[
                'Phase-coloured timing bars · 7 segments per request',
                'Click-through inspector with 7 lenses',
                'Drag a window across the timeline to constrain visible entries',
              ]} />
            </Panel>

            <Panel className="col-span-12 lg:col-span-4 row-span-2">
              <PanelHeader number="02" title="Inspector with seven lenses" icon={<Eye size={14} weight="bold" />} />
              <PanelBody>
                <InspectorMock />
              </PanelBody>
              <PanelFoot dense items={[
                'Overview · status, type, IP, protocol',
                'Headers · request + response',
                'Cookies · parsed table',
                'Query · decomposed URL',
                'Payload · syntax-highlighted',
                'Response · Shiki · image preview',
                'Timing · phase breakdown',
              ]} />
            </Panel>

            <Panel className="col-span-12 lg:col-span-8 row-span-1">
              <PanelHeader number="03" title="⌘K to drive it" icon={<Command size={14} weight="bold" />} />
              <PanelBody>
                <CommandMock />
              </PanelBody>
              <PanelFoot items={[
                <span className="flex items-center gap-2 flex-wrap" key="r1">
                  <kbd className="kbd">/</kbd> focus search
                  <span className="text-muted-foreground/50">·</span>
                  <kbd className="kbd">↑</kbd><kbd className="kbd">↓</kbd> navigate rows
                  <span className="text-muted-foreground/50">·</span>
                  <kbd className="kbd">Enter</kbd> open inspector
                </span>,
                <span className="flex items-center gap-2 flex-wrap" key="r2">
                  <kbd className="kbd">Esc</kbd> close anything
                  <span className="text-muted-foreground/50">·</span>
                  <kbd className="kbd">⌘O</kbd> open another HAR
                  <span className="text-muted-foreground/50">·</span>
                  <kbd className="kbd">⌘K</kbd> palette
                </span>,
              ]} />
            </Panel>
          </div>
        </motion.div>
      </div>
    </section>
  )
}

function Panel({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return (
    <motion.div
      whileHover={{ y: -3 }}
      transition={{ type: 'spring', stiffness: 320, damping: 28 }}
      className={`group relative border-hard-2 bg-card flex flex-col ${className}`}
    >
      {children}
    </motion.div>
  )
}

function PanelHeader({ number, title, icon }: { number: string; title: string; icon: React.ReactNode }) {
  return (
    <div className="border-b-2 border-border flex items-center gap-3 px-5 h-12">
      <span className="grid place-items-center h-6 w-6 bg-primary text-primary-foreground border border-border">
        {icon}
      </span>
      <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground">SURF.{number}</span>
      <span className="ml-auto font-mono text-[12px] uppercase tracking-[0.06em] font-medium">{title}</span>
    </div>
  )
}

function PanelBody({ children }: { children: React.ReactNode }) {
  return <div className="p-5 flex flex-col gap-4 flex-1">{children}</div>
}

function PanelFoot({ items, dense }: { items: React.ReactNode[]; dense?: boolean }) {
  return (
    <ul className={`mt-auto flex flex-col ${dense ? 'gap-1' : 'gap-1.5'} px-5 py-4 border-t-2 border-border bg-muted/20`}>
      {items.map((it, i) => (
        <li key={i} className="font-mono text-[11px] uppercase tracking-[0.04em] text-muted-foreground leading-snug flex items-baseline gap-2">
          <span className="text-primary mt-0.5">›</span>
          <span>{it}</span>
        </li>
      ))}
    </ul>
  )
}

const PHASE_COLORS = {
  blocked: 'color-mix(in oklch, var(--muted-foreground) 40%, transparent)',
  send: 'color-mix(in oklch, var(--primary) 70%, transparent)',
  wait: 'var(--primary)',
  receive: 'color-mix(in oklch, var(--primary) 88%, transparent)',
}

function WaterfallMock() {
  const rows = [
    { method: 'GET', host: 'acme.studio', path: '/articles/lanterns', status: 200, type: 'doc', leading: 0, w: 28 },
    { method: 'GET', host: 'acme.studio', path: '/_assets/app.f8a21c.css', status: 200, type: 'css', leading: 8, w: 14 },
    { method: 'GET', host: 'acme.studio', path: '/_assets/app.b7e110.js', status: 200, type: 'js', leading: 9, w: 22 },
    { method: 'GET', host: 'api.acme.studio', path: '/v2/articles/lanterns', status: 200, type: 'fetch', leading: 22, w: 38, tooltip: true },
    { method: 'GET', host: 'cdn.acme.studio', path: '/img/hero@2x.avif', status: 200, type: 'img', leading: 30, w: 24 },
    { method: 'GET', host: 'cdn.acme.studio', path: '/img/lantern-detail-3.avif', status: 404, type: 'img', leading: 50, w: 8, error: true },
    { method: 'POST', host: 'api.acme.studio', path: '/v2/comments', status: 502, type: 'fetch', leading: 56, w: 18, error: true },
  ]
  const TYPE: Record<string, string> = { doc: 'var(--primary)', css: 'var(--chart-3)', js: 'var(--chart-2)', img: 'var(--chart-4)', fetch: 'var(--chart-5)' }
  return (
    <div className="border-hard-2 bg-background overflow-hidden">
      <div className="h-6 border-b-2 border-border flex items-center px-3 font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
        <span>0</span>
        <span className="ml-auto">≈ 1.4 s</span>
      </div>
      <div className="divide-y divide-border/30">
        {rows.map((r, i) => (
          <div key={i} className={`grid h-7 items-center px-3 text-[11px] ${r.error ? 'bg-destructive/[0.06]' : ''} ${r.tooltip ? 'bg-primary/[0.08]' : ''}`}
            style={{ gridTemplateColumns: 'auto 28px minmax(0,1fr) 32px minmax(0,55%)', columnGap: '8px' }}>
            <span className="h-2 w-2" style={{ background: TYPE[r.type] }} />
            <span className="font-mono text-[9px] uppercase tabular text-right text-muted-foreground">{r.method}</span>
            <span className="truncate font-mono">
              <span className="text-muted-foreground/80">{r.host}</span>
              <span>{r.path}</span>
            </span>
            <span className={`font-mono tabular text-right ${r.status >= 400 ? 'text-destructive' : 'text-foreground/80'}`}>{r.status}</span>
            <span className="relative h-full">
              <div
                className="absolute top-1/2 -translate-y-1/2 h-2 flex"
                style={{ left: `${r.leading}%`, width: `${r.w}%` }}
              >
                <span className="flex-1" style={{ background: PHASE_COLORS.send }} />
                <span className="flex-1" style={{ background: PHASE_COLORS.wait }} />
                <span className="flex-1" style={{ background: PHASE_COLORS.receive }} />
              </div>
              {r.tooltip && (
                <span className="absolute -top-1 right-2 border-hard-2 bg-popover px-2 py-0.5 text-[9px] font-mono uppercase tracking-[0.18em] z-10 tabular pointer-events-none whitespace-nowrap shadow-hard">
                  wait 102 ms · total 184 ms
                </span>
              )}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}

function InspectorMock() {
  return (
    <div className="border-hard-2 bg-background font-mono">
      <div className="flex items-center gap-2 px-3 h-8 border-b-2 border-border">
        <span className="h-1.5 w-1.5 bg-primary" />
        <span className="text-[9px] uppercase tracking-[0.2em] font-bold">Entry · #4</span>
        <span className="ml-auto text-[9px] text-muted-foreground tracking-[0.1em]">7 lenses</span>
      </div>
      <div className="px-3 py-2 border-b border-border/40 flex flex-wrap gap-1">
        {['Overview', 'Headers', 'Cookies', 'Query', 'Payload', 'Response', 'Timing'].map((t, i) => (
          <span key={t} className={`text-[9px] uppercase tracking-[0.18em] px-1.5 py-0.5 border ${i === 0 ? 'border-primary text-primary' : 'border-transparent text-muted-foreground'}`}>{t}</span>
        ))}
      </div>
      <div className="px-3 py-2.5 text-[11px] break-all border-b border-border/40">
        <span className="text-muted-foreground">https://api.acme.studio</span>
        <span>/v2/articles/lanterns</span>
      </div>
      <div className="px-3 py-3 grid grid-cols-2 gap-y-2 gap-x-4 text-[11px]">
        <Pair k="Method" v="GET" />
        <Pair k="Status" v="200 OK" />
        <Pair k="Type" v="Fetch" />
        <Pair k="Size" v="2.4 KB" />
        <Pair k="Time" v="184 ms" />
        <Pair k="IP" v="151.101.65.91" />
      </div>
      <div className="px-3 py-2.5 border-t-2 border-border bg-muted/30 text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
        ▼ Response headers · 8
      </div>
    </div>
  )
}

function CommandMock() {
  return (
    <div className="border-hard-2 bg-background overflow-hidden">
      <div className="flex items-center gap-2 px-3 h-9 border-b-2 border-border">
        <Command size={11} weight="bold" />
        <span className="font-mono text-[11px] uppercase tracking-[0.06em]">lanterns</span>
        <span className="ml-auto font-mono text-[9px] uppercase tracking-[0.2em] text-muted-foreground">7 / 33</span>
      </div>
      <div className="px-3 pt-2 font-mono text-[9px] uppercase tracking-[0.2em] text-muted-foreground">Jump</div>
      <ul>
        {[
          { method: 'GET', path: '/articles/ten-thousand-paper-lanterns', meta: '200 · 142 ms', active: true },
          { method: 'GET', path: '/v2/articles/ten-thousand-paper-lanterns', meta: '200 · 184 ms' },
          { method: 'GET', path: '/img/lantern-detail-3.avif', meta: '404 · 96 ms', error: true },
        ].map((r, i) => (
          <li key={i} className={`flex items-center gap-3 px-3 py-2 text-[11px] font-mono ${r.active ? 'bg-primary/15' : ''}`}>
            <Globe size={11} weight="regular" />
            <span className="text-muted-foreground/80">{r.method}</span>
            <span className="flex-1 truncate">{r.path}</span>
            <span className={`text-[10px] tabular tracking-[0.04em] ${r.error ? 'text-destructive' : 'text-muted-foreground'}`}>{r.meta}</span>
            {r.active && <ArrowRight size={11} weight="bold" className="text-primary" />}
          </li>
        ))}
      </ul>
      <div className="border-t-2 border-border px-3 h-8 flex items-center gap-3 font-mono text-[9px] uppercase tracking-[0.18em] text-muted-foreground bg-muted/30">
        <span><kbd className="kbd">⌘K</kbd> open</span>
        <span><kbd className="kbd">↑↓</kbd> nav</span>
        <span><kbd className="kbd">Enter</kbd> select</span>
      </div>
    </div>
  )
}

function Pair({ k, v }: { k: string; v: string }) {
  return (
    <div>
      <div className="text-[9px] uppercase tracking-[0.2em] text-muted-foreground">{k}</div>
      <div className="text-foreground/95">{v}</div>
    </div>
  )
}
