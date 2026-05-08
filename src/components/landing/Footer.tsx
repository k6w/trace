import { ArrowRight, GithubLogo } from '@phosphor-icons/react'
import { ThemeToggle } from '../ThemeToggle'
import { BrutalButton, Marquee } from '../../ui/Brutal'

interface Props {
  onChooseFile: () => void
  onTrySample: () => void
}

export function Footer({ onChooseFile, onTrySample }: Props) {
  return (
    <footer className="border-t-2 border-border bg-background">
      <div className="border-b-2 border-border bg-foreground text-background">
        <Marquee
          className="h-10 items-center"
          speed="35s"
          separator="→"
          items={[
            'Drop a .har',
            'or try the sample',
            'no upload',
            'no telemetry',
            'made with care',
            'trace · v0.1',
          ]}
        />
      </div>

      <div className="mx-auto max-w-[1500px] px-4 md:px-8 py-16 md:py-24">
        {/* CTA row — big poster headline */}
        <div className="grid grid-cols-12 gap-x-6 gap-y-10 pb-12 border-b-2 border-border">
          <div className="col-span-12 md:col-span-8">
            <h3 className="display text-[56px] md:text-[112px] leading-[0.84]">
              Drop a&nbsp;.har<br />— or try the sample.
            </h3>
            <div className="mt-8 flex items-center gap-3 flex-wrap">
              <BrutalButton onClick={onChooseFile} variant="primary" size="lg">
                Choose file
                <ArrowRight size={12} />
              </BrutalButton>
              <BrutalButton onClick={onTrySample} variant="outline" size="lg">
                Try the sample
              </BrutalButton>
            </div>
          </div>

          <div className="col-span-6 md:col-span-2">
            <div className="font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground mb-4">Project</div>
            <ul className="flex flex-col gap-2 text-[12px] font-mono uppercase tracking-[0.06em]">
              <li><a href="https://github.com/k6w/trace" target="_blank" rel="noreferrer" className="inline-flex items-center gap-1.5 hover:text-primary transition-colors"><GithubLogo size={11} /> GitHub</a></li>
              <li><a href="#faq" className="hover:text-primary transition-colors">Privacy</a></li>
              <li><a href="#features" className="hover:text-primary transition-colors">Shortcuts</a></li>
            </ul>
          </div>
          <div className="col-span-6 md:col-span-2">
            <div className="font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground mb-4">Made by</div>
            <p className="font-mono text-[11px] uppercase tracking-[0.04em] text-muted-foreground leading-[1.55]">
              An interface for reading network captures the way they actually deserve to be read. Built quietly.
            </p>
          </div>
        </div>

        {/* Bottom serial-number strip */}
        <div className="pt-6 flex items-center justify-between flex-wrap gap-3 font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground tabular">
          <div className="flex items-center gap-3 flex-wrap">
            <span className="text-foreground font-bold">SER. {new Date().getFullYear()}.{String(new Date().getMonth() + 1).padStart(2, '0')}.A</span>
            <span className="opacity-50">·</span>
            <span>Trace · v0.1</span>
            <span className="opacity-50">·</span>
            <span>Made with care</span>
          </div>
          <div className="flex items-center gap-3">
            <span>Theme</span>
            <ThemeToggle />
          </div>
        </div>
      </div>
    </footer>
  )
}
