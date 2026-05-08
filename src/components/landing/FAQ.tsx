import { motion, useInView, useReducedMotion } from 'motion/react'
import { useState, useRef } from 'react'
import { Plus, Minus } from '@phosphor-icons/react'
import { SectionIndex } from '../../ui/Brutal'

const QA: { q: string; a: React.ReactNode }[] = [
  {
    q: 'What is a HAR file, and how do I get one?',
    a: (
      <>
        Every major browser exports HAR (HTTP Archive). In Chrome or Edge: open DevTools, go to the
        Network panel, then right-click any row → <span className="font-mono">Save all as HAR with content</span>.
        Firefox lives under the Network tab's gear. Safari exports via Web Inspector → Network →
        <span className="font-mono"> Export</span>.
      </>
    ),
  },
  {
    q: 'Will my HAR be uploaded anywhere?',
    a: (
      <>
        No. Trace is a static page. Parsing happens entirely in your browser via the File API.
        There is no backend; <span className="text-foreground">there is no upload</span>. Open the
        Network tab while you use Trace and you'll see exactly one outgoing request: the page itself.
      </>
    ),
  },
  {
    q: 'How big a HAR can it handle?',
    a: (
      <>
        The waterfall stays at 60 fps with virtualised rendering past 5,000 entries. Very large
        response bodies (over 500 KB) are gated behind an explicit <span className="font-mono">load anyway</span>{' '}
        confirmation so the inspector doesn't choke on a megabyte of JSON.
      </>
    ),
  },
  {
    q: 'Can I share a single inspected request?',
    a: (
      <>
        Copy as <span className="font-mono">curl</span> from the Overview tab — gives you a one-liner
        you can paste into Slack or your tickets. Deep links by entry index are on the roadmap.
      </>
    ),
  },
  {
    q: 'Is the source available?',
    a: (
      <>
        Yes. Trace lives at{' '}
        <a href="https://github.com/k6w/trace" target="_blank" rel="noreferrer" className="text-foreground underline underline-offset-2 hover:text-primary">
          github.com/k6w/trace
        </a>
        {' '}— open source under a permissive licence. Issues and pull requests welcome.
      </>
    ),
  },
]

export function FAQ() {
  const ref = useRef<HTMLDivElement>(null)
  const inView = useInView(ref, { once: true, amount: 0.1 })
  const reduce = useReducedMotion()
  const [open, setOpen] = useState(0)

  return (
    <section id="faq" ref={ref} className="border-t-2 border-border">
      <div className="mx-auto max-w-[1500px] px-4 md:px-8 py-20 md:py-32">
        <motion.div
          initial={reduce ? undefined : { opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
        >
          <SectionIndex index={6} label="Q & A" />

          <div className="mt-12 grid grid-cols-12 gap-x-6 gap-y-12">
            <header className="col-span-12 lg:col-span-5">
              <h2 className="display text-[64px] md:text-[120px] leading-[0.86]">
                Five<br />Questions<br />Briefly.
              </h2>
              <p className="mt-8 font-mono text-[12px] uppercase tracking-[0.04em] leading-[1.55] text-muted-foreground max-w-[36ch]">
                Click a question to expand. The answers are shorter than the questions look.
              </p>
            </header>

            <div className="col-span-12 lg:col-span-7">
              <div className="border-hard-2 bg-card divide-y-2 divide-border">
                {QA.map((item, i) => {
                  const isOpen = open === i
                  return (
                    <article key={i}>
                      <button
                        type="button"
                        onClick={() => setOpen(isOpen ? -1 : i)}
                        className="w-full flex items-start gap-4 px-5 py-5 text-left hover:bg-muted/30 transition-colors"
                      >
                        <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground mt-1 tabular shrink-0">
                          0{i + 1}
                        </span>
                        <span className="display text-[20px] md:text-[26px] leading-[1.05] flex-1">
                          {item.q}
                        </span>
                        <span className="grid place-items-center h-7 w-7 border border-border shrink-0 mt-0.5">
                          {isOpen ? <Minus size={12} weight="bold" /> : <Plus size={12} weight="bold" />}
                        </span>
                      </button>
                      <motion.div
                        initial={false}
                        animate={isOpen ? { height: 'auto', opacity: 1 } : { height: 0, opacity: 0 }}
                        transition={{ duration: 0.32, ease: [0.16, 1, 0.3, 1] }}
                        className="overflow-hidden"
                      >
                        <div className="px-5 pb-5 pt-1 pl-[3.5rem]">
                          <p className="font-mono text-[12px] leading-[1.7] tracking-[0.02em] text-muted-foreground max-w-[60ch]">
                            {item.a}
                          </p>
                        </div>
                      </motion.div>
                    </article>
                  )
                })}
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  )
}
