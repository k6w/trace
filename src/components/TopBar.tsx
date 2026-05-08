import { ArrowLeft, Command } from '@phosphor-icons/react'
import { useHar } from '../hooks/useHar'
import { ThemeToggle } from './ThemeToggle'
import { formatBytes, formatMs, formatNumber } from '../lib/format'
import { BrutalButton } from '../ui/Brutal'
import { Logo } from '../ui/Logo'

interface Props { onOpenPalette: () => void }

export function TopBar({ onOpenPalette }: Props) {
  const { har, fileName, reset } = useHar()
  if (!har) return null
  return (
    <header className="sticky top-0 z-40 h-12 border-b-2 border-border bg-background">
      <div className="grid h-full grid-cols-3 items-center gap-4 px-4 md:px-6">
        <div className="flex items-center gap-3 min-w-0">
          <button
            onClick={reset}
            className="group flex items-center gap-2"
            title="Back to landing"
          >
            <ArrowLeft size={14} className="text-muted-foreground group-hover:-translate-x-0.5 transition-transform" />
            <Logo size={24} />
            <span className="font-mono text-[11px] uppercase tracking-[0.2em] font-bold">Trace</span>
          </button>
          <span className="h-4 w-px bg-border" />
          <span className="hidden sm:inline-flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground tabular truncate">
            <span className="text-foreground truncate max-w-[280px]">{fileName ?? 'capture.har'}</span>
            <span className="opacity-50">·</span>
            <span>{formatNumber(har.meta.entryCount)} entries</span>
            <span className="opacity-50">·</span>
            <span>{formatBytes(har.meta.totalBytes)}</span>
            <span className="opacity-50">·</span>
            <span>{formatMs(har.meta.rangeEnd)}</span>
          </span>
        </div>
        <div className="flex items-center justify-center">
          <button
            onClick={onOpenPalette}
            className="hidden md:flex items-center gap-2 border-2 border-border bg-card hover:bg-muted/40 transition-colors px-3 h-7 font-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground"
          >
            <Command size={11} weight="bold" />
            Search · Filter · Jump
            <span className="ml-3 inline-flex items-center gap-0.5">
              <kbd className="kbd">⌘</kbd>
              <kbd className="kbd">K</kbd>
            </span>
          </button>
        </div>
        <div className="flex items-center gap-1.5 justify-end">
          <ThemeToggle />
          <BrutalButton onClick={reset} variant="outline" size="sm" className="hidden md:inline-flex">
            Open another
          </BrutalButton>
        </div>
      </div>
    </header>
  )
}
