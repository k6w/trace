import { useEffect, useState } from 'react'
import { GithubLogo } from '@phosphor-icons/react'
import { ThemeToggle } from '../ThemeToggle'
import { BrutalButton } from '../../ui/Brutal'
import { Logo } from '../../ui/Logo'

interface Props { onOpenFile: () => void }

const SECTIONS = [
  { id: 'demo', label: 'Demo' },
  { id: 'anatomy', label: 'Anatomy' },
  { id: 'features', label: 'Surfaces' },
  { id: 'specs', label: 'Specs' },
  { id: 'faq', label: 'Q&A' },
]

export function TopNav({ onOpenFile }: Props) {
  const [stuck, setStuck] = useState(false)
  useEffect(() => {
    const onScroll = () => setStuck(window.scrollY > 24)
    window.addEventListener('scroll', onScroll, { passive: true })
    onScroll()
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <header className={`fixed top-0 inset-x-0 z-30 transition-all ${
      stuck ? 'bg-background/90 backdrop-blur border-b-2 border-border' : 'bg-transparent'
    }`}>
      <div className="mx-auto max-w-[1500px] h-14 px-4 md:px-8 grid grid-cols-3 items-center gap-4">
        <a href="#top" className="flex items-center gap-2.5 group">
          <Logo size={28} />
          <span className="font-mono text-[12px] uppercase tracking-[0.2em] font-bold">Trace</span>
          <span className="hidden md:inline text-[10px] font-mono uppercase tracking-[0.18em] text-muted-foreground">v0.1</span>
        </a>
        <nav className="hidden md:flex items-center justify-center gap-6">
          {SECTIONS.map((s) => (
            <a
              key={s.id}
              href={`#${s.id}`}
              className="font-mono text-[11px] uppercase tracking-[0.2em] text-muted-foreground hover:text-foreground transition-colors"
            >
              {s.label}
            </a>
          ))}
        </nav>
        <div className="flex items-center justify-end gap-2">
          <a
            href="https://github.com/k6w/trace"
            target="_blank"
            rel="noreferrer"
            aria-label="GitHub"
            className="grid h-8 w-8 place-items-center hover:bg-muted text-foreground"
          >
            <GithubLogo size={14} />
          </a>
          <ThemeToggle />
          <BrutalButton onClick={onOpenFile} variant="primary" size="sm" className="hidden sm:inline-flex">
            Open file
          </BrutalButton>
        </div>
      </div>
    </header>
  )
}
