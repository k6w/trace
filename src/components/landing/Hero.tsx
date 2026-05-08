import { motion, useReducedMotion } from 'motion/react'
import { ArrowRight, FileArrowUp, UploadSimple } from '@phosphor-icons/react'
import { useEffect, useRef, useState } from 'react'
import { HeroDemoPreview } from './HeroDemoPreview'
import { BrutalButton, CornerBrackets, SplitText, TermBadge } from '../../ui/Brutal'

interface Props {
  onChooseFile: () => void
  onTrySample: () => void
}

export function Hero({ onChooseFile, onTrySample }: Props) {
  const reduce = useReducedMotion()
  const dropRef = useRef<HTMLLabelElement>(null)
  const [over, setOver] = useState(false)
  const [time, setTime] = useState(() => new Date())

  useEffect(() => {
    const id = setInterval(() => setTime(new Date()), 1000)
    return () => clearInterval(id)
  }, [])

  useEffect(() => {
    const el = dropRef.current
    if (!el) return
    let depth = 0
    const enter = (e: DragEvent) => { e.preventDefault(); depth++; setOver(true) }
    const leave = (e: DragEvent) => { e.preventDefault(); depth--; if (depth <= 0) setOver(false) }
    const over = (e: DragEvent) => { e.preventDefault() }
    el.addEventListener('dragenter', enter)
    el.addEventListener('dragleave', leave)
    el.addEventListener('dragover', over)
    el.addEventListener('drop', () => { depth = 0; setOver(false) })
    return () => {
      el.removeEventListener('dragenter', enter)
      el.removeEventListener('dragleave', leave)
      el.removeEventListener('dragover', over)
    }
  }, [])

  return (
    <section id="top" className="relative pt-20 md:pt-24 pb-16">
      {/* Status bar — physical printer-strip / receipt feel */}
      <div className="border-y-2 border-border bg-background">
        <div className="mx-auto max-w-[1500px] flex items-center justify-between px-4 md:px-8 h-9 font-mono text-[10px] uppercase tracking-[0.18em]">
          <div className="flex items-center gap-4">
            <TermBadge tone="live">Online</TermBadge>
            <span className="hidden md:inline text-muted-foreground">/ trace · v0.1 · workstation build</span>
          </div>
          <div className="hidden md:flex items-center gap-4">
            <span className="text-muted-foreground">{time.toUTCString().slice(17, 25)} UTC</span>
            <span className="h-3 w-px bg-foreground" />
            <span>No upload</span>
            <span className="h-3 w-px bg-foreground" />
            <span>No telemetry</span>
            <span className="h-3 w-px bg-foreground" />
            <span>100% client</span>
          </div>
          <div className="text-muted-foreground tabular">
            ↳ scroll
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-[1500px] px-4 md:px-8 grid grid-cols-12 gap-x-6 gap-y-12 pt-12 md:pt-20">
        {/* Left — manifesto */}
        <div className="col-span-12 lg:col-span-7 xl:col-span-7 flex flex-col">
          {/* Big stamp number */}
          <div className="flex items-center justify-between mb-8">
            <span className="font-mono text-[11px] uppercase tracking-[0.2em] text-muted-foreground">
              <span className="text-foreground font-bold">A.001</span> · The HAR Reader
            </span>
            <span className="hidden md:inline-flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
              issued · MMXXVI
            </span>
          </div>

          {/* The wordmark — Anton condensed brutalist */}
          <h1 className="display text-foreground leading-[0.86]" style={{ fontSize: 'clamp(96px, 18vw, 232px)' }}>
            <SplitText reduce={!!reduce} delay={0.1} stagger={0.06}>TRACE</SplitText>
          </h1>

          {/* Promise — heavy mono */}
          <motion.div
            initial={reduce ? false : { opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7, duration: 0.6 }}
            className="mt-6 max-w-[44ch]"
          >
            <p className="font-mono text-[14px] md:text-[16px] leading-[1.4] uppercase tracking-[0.04em]">
              <span className="text-foreground">A scoring sheet for HTTP.</span>{' '}
              <span className="text-muted-foreground">Read your network as a timeline. Drop in a .har export. Inspect every phase, every byte, every wait.</span>
            </p>
          </motion.div>

          {/* Drop zone — corner brackets, square, brutalist */}
          <motion.div
            initial={reduce ? false : { opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.9, duration: 0.55 }}
            className="mt-10 max-w-[680px]"
          >
            <label htmlFor="trace-file" ref={dropRef} className={`block cursor-pointer transition-transform ${over ? 'translate-y-[-2px]' : ''}`}>
              <CornerBrackets size={20} thickness={2} active={over} className="bg-card/60">
                <div className="px-6 py-7 flex items-center gap-5">
                  <div className={`grid place-items-center h-14 w-14 border-hard-2 transition-colors ${over ? 'bg-primary text-primary-foreground' : 'bg-background'}`}>
                    <FileArrowUp size={22} weight="regular" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-mono text-[13px] uppercase tracking-[0.12em] font-medium">
                      {over ? 'Release · loading' : 'Drop a .har file'}
                    </div>
                    <div className="mt-1 font-mono text-[11px] text-muted-foreground">
                      <button type="button" onClick={onChooseFile} className="underline underline-offset-2 hover:text-foreground">choose from disk</button>
                      <span className="mx-2">·</span>
                      <button type="button" onClick={onTrySample} className="underline underline-offset-2 hover:text-foreground">try the sample</button>
                    </div>
                  </div>
                  <span className="hidden sm:flex items-center gap-1">
                    <kbd className="kbd">⌘</kbd>
                    <kbd className="kbd">O</kbd>
                  </span>
                </div>
              </CornerBrackets>
            </label>

            <div className="mt-6 flex items-center gap-3 flex-wrap">
              <BrutalButton onClick={onChooseFile} variant="primary" size="lg">
                <UploadSimple size={14} />
                Choose file
                <ArrowRight size={12} className="opacity-70" />
              </BrutalButton>
              <BrutalButton onClick={onTrySample} variant="outline" size="lg">
                Try the sample
              </BrutalButton>
            </div>
          </motion.div>

          {/* Footer line — coordinates / serial number feel */}
          <motion.div
            initial={reduce ? false : { opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.4, duration: 0.5 }}
            className="mt-auto pt-16 grid grid-cols-3 gap-4 font-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground"
          >
            <div>
              <div className="text-foreground font-bold">N. 41.4036</div>
              <div>parser · client</div>
            </div>
            <div>
              <div className="text-foreground font-bold">E. 12.4964</div>
              <div>shiki · lazy</div>
            </div>
            <div>
              <div className="text-foreground font-bold">CSV-AAA</div>
              <div>amber accent</div>
            </div>
          </motion.div>
        </div>

        {/* Right — live demo preview, contained in surveyor brackets */}
        <div className="col-span-12 lg:col-span-5 xl:col-span-5">
          <HeroDemoPreview />
        </div>
      </div>
    </section>
  )
}
