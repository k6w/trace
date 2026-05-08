import type { CSSProperties, ReactNode } from 'react'
import { motion } from 'motion/react'

/* Corner brackets — 4 L-shaped corners around children. The signature
   visual element of Trace's identity: instead of dashed borders or rounded
   cards, the drop target / hero crops use surveyor brackets. */
export function CornerBrackets({
  children,
  className = '',
  size = 22,
  thickness = 2,
  inset = 0,
  color,
  active,
}: {
  children: ReactNode
  className?: string
  size?: number
  thickness?: number
  inset?: number
  color?: string
  active?: boolean
}) {
  const c = color ?? 'var(--border)'
  const aColor = 'var(--primary)'
  const stroke = active ? aColor : c
  const sz = `${size}px`
  const t = `${thickness}px`
  const i = `${inset}px`

  const corner: CSSProperties = {
    position: 'absolute',
    width: sz,
    height: sz,
    pointerEvents: 'none',
    transition: 'border-color 200ms',
  }

  return (
    <div className={`relative ${className}`}>
      <span aria-hidden style={{ ...corner, top: i, left: i, borderTop: `${t} solid ${stroke}`, borderLeft: `${t} solid ${stroke}` }} />
      <span aria-hidden style={{ ...corner, top: i, right: i, borderTop: `${t} solid ${stroke}`, borderRight: `${t} solid ${stroke}` }} />
      <span aria-hidden style={{ ...corner, bottom: i, left: i, borderBottom: `${t} solid ${stroke}`, borderLeft: `${t} solid ${stroke}` }} />
      <span aria-hidden style={{ ...corner, bottom: i, right: i, borderBottom: `${t} solid ${stroke}`, borderRight: `${t} solid ${stroke}` }} />
      {children}
    </div>
  )
}

/* Numbered section heading — "00 / 07" style index in mono with thick rule
   above the title. Used at the top of every landing section. */
export function SectionIndex({
  index,
  total = 7,
  label,
  className = '',
}: {
  index: number
  total?: number
  label: string
  className?: string
}) {
  return (
    <div className={`flex items-baseline justify-between border-t-2 border-foreground pt-3 ${className}`}>
      <span className="font-mono text-[11px] tracking-[0.18em] uppercase font-medium">
        <span className="text-foreground">{String(index).padStart(2, '0')}</span>
        <span className="text-muted-foreground"> / {String(total).padStart(2, '0')}</span>
        <span className="ml-3 text-foreground">{label}</span>
      </span>
      <span className="hidden md:inline-block h-2 w-2 bg-primary" />
    </div>
  )
}

/* Marquee ticker — endless horizontal text loop. Used at the top of the page
   as a status bar (LIVE · NO UPLOAD · etc) and between sections. */
export function Marquee({
  items,
  className = '',
  separator = '◆',
  speed = '40s',
}: {
  items: ReactNode[]
  className?: string
  separator?: string
  speed?: string
}) {
  const renderTrack = (key: string) => (
    <div className="marquee__track" aria-hidden={key !== 'a'} key={key}>
      {items.map((it, i) => (
        <span key={`${key}-${i}`} className="flex items-center gap-12 font-mono text-[11px] tracking-[0.2em] uppercase whitespace-nowrap">
          {it}
          <span className="text-primary text-[8px]">{separator}</span>
        </span>
      ))}
    </div>
  )
  return (
    <div className={`marquee ${className}`} style={{ ['--marquee-speed' as never]: speed } as CSSProperties}>
      {renderTrack('a')}
      {renderTrack('b')}
    </div>
  )
}

/* Brutal button — square, thick black border, hard-shadow on hover.
   Three variants. */
export function BrutalButton({
  children, onClick, variant = 'primary', size = 'md', className = '', type = 'button', disabled, asChild,
}: {
  children: ReactNode
  onClick?: () => void
  variant?: 'primary' | 'outline' | 'ghost'
  size?: 'sm' | 'md' | 'lg'
  className?: string
  type?: 'button' | 'submit'
  disabled?: boolean
  asChild?: boolean
}) {
  const sizeCls =
    size === 'sm' ? 'h-8 px-3 text-[11px]' :
    size === 'lg' ? 'h-12 px-5 text-[13px]' :
    'h-10 px-4 text-[12px]'
  const base = 'group inline-flex items-center justify-center gap-2 font-mono uppercase tracking-[0.12em] font-medium transition-all border-hard-2 select-none whitespace-nowrap'
  const variants =
    variant === 'primary' ? 'bg-primary text-primary-foreground hover:translate-x-[-2px] hover:translate-y-[-2px] hover:shadow-hard active:translate-x-0 active:translate-y-0 active:shadow-none'
    : variant === 'outline' ? 'bg-background text-foreground hover:translate-x-[-2px] hover:translate-y-[-2px] hover:shadow-hard active:translate-x-0 active:translate-y-0 active:shadow-none'
    : 'bg-transparent text-foreground border-transparent hover:bg-muted'
  return (
    <button type={type} disabled={disabled} onClick={onClick} className={`${base} ${sizeCls} ${variants} ${className}`}>
      {children}
    </button>
  )
}

/* Tag chip — like a luggage tag or barcode label. Square, mono. */
export function Tag({
  children, color, active, onClick, className = '',
}: {
  children: ReactNode
  color?: string
  active?: boolean
  onClick?: () => void
  className?: string
}) {
  const isInteractive = !!onClick
  const Cmp: any = isInteractive ? 'button' : 'span'
  return (
    <Cmp
      onClick={onClick}
      className={`inline-flex items-center gap-1.5 px-2 h-6 border border-current font-mono text-[10px] tracking-[0.1em] uppercase ${
        active ? 'bg-primary text-primary-foreground border-primary' : isInteractive ? 'hover:bg-muted text-foreground' : 'text-muted-foreground'
      } ${className}`}
      style={!active && color ? { color } : undefined}
    >
      {children}
    </Cmp>
  )
}

/* SplitText — word-by-word reveal. Use on display headlines. */
export function SplitText({
  children,
  delay = 0,
  stagger = 0.04,
  className = '',
  reduce = false,
}: {
  children: string
  delay?: number
  stagger?: number
  className?: string
  reduce?: boolean
}) {
  const words = children.split(/(\s+)/)
  return (
    <span className={className}>
      {words.map((w, i) => {
        if (/^\s+$/.test(w)) return <span key={i}>{w}</span>
        return (
          <span key={i} className="inline-block overflow-hidden align-baseline">
            <motion.span
              initial={reduce ? false : { y: '110%' }}
              animate={{ y: '0%' }}
              transition={{ delay: delay + i * stagger, duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
              className="inline-block"
            >
              {w}
            </motion.span>
          </span>
        )
      })}
    </span>
  )
}

/* Terminal-style mono badge with leading caret. */
export function TermBadge({ children, className = '', tone = 'default' }: { children: ReactNode; className?: string; tone?: 'default' | 'live' | 'warn' | 'error' }) {
  const dot = tone === 'live' ? 'bg-emerald-500' : tone === 'warn' ? 'bg-primary' : tone === 'error' ? 'bg-destructive' : 'bg-muted-foreground'
  return (
    <span className={`inline-flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-[0.16em] ${className}`}>
      <span className={`h-1.5 w-1.5 ${dot} ${tone === 'live' ? 'animate-pulse' : ''}`} />
      {children}
    </span>
  )
}
