import { useEffect, useState } from 'react'
import { highlight, langFromMime } from '../../lib/shiki'
import { useTheme } from '../../hooks/useTheme'
import { CopyButton } from '../../ui/CopyButton'

interface Props {
  code: string
  mimeType?: string
  filename?: string
}

const MAX_BYTES = 500_000

export function CodeBlock({ code, mimeType }: Props) {
  const { theme } = useTheme()
  const [pretty, setPretty] = useState(true)
  const [confirmedLarge, setConfirmedLarge] = useState(false)
  const [html, setHtml] = useState<string | null>(null)
  const tooLarge = code.length > MAX_BYTES
  const lang = langFromMime(mimeType ?? '')

  const displayedRaw = (() => {
    if (!pretty) return code
    if (lang === 'json') {
      try {
        return JSON.stringify(JSON.parse(code), null, 2)
      } catch { return code }
    }
    return code
  })()

  useEffect(() => {
    if (!code) { setHtml(null); return }
    if (tooLarge && !confirmedLarge) { setHtml(null); return }
    let cancelled = false
    highlight(displayedRaw, lang, theme === 'dark').then((h) => {
      if (!cancelled) setHtml(h)
    })
    return () => { cancelled = true }
  }, [displayedRaw, lang, theme, tooLarge, confirmedLarge, code])

  if (!code) {
    return <div className="text-[12px] italic text-muted-foreground">Empty body.</div>
  }

  if (tooLarge && !confirmedLarge) {
    return (
      <div className="rounded-md border border-border/70 bg-muted/30 p-4 text-[12px] space-y-2">
        <div className="font-medium">Large body</div>
        <p className="text-muted-foreground">
          This body is {Math.round(code.length / 1024).toLocaleString()} KB. Highlighting may slow the inspector.
        </p>
        <button
          onClick={() => setConfirmedLarge(true)}
          className="rounded-md border bg-background px-2.5 py-1 hover:bg-muted/40 transition-colors"
        >
          Load anyway
        </button>
      </div>
    )
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="label-eyebrow">{lang}</span>
          <span className="text-[11px] font-mono text-muted-foreground">
            {Math.round(code.length / 1024).toLocaleString()} KB
          </span>
        </div>
        <div className="flex items-center gap-2">
          {(lang === 'json') && (
            <button
              onClick={() => setPretty((v) => !v)}
              className="text-[11px] font-mono uppercase tracking-wider text-muted-foreground hover:text-foreground"
            >
              {pretty ? 'Raw' : 'Pretty'}
            </button>
          )}
          <CopyButton value={displayedRaw} />
        </div>
      </div>
      <div
        className="trace-code rounded-md border border-border/70 overflow-auto max-h-[60vh]"
      >
        {html ? (
          <div dangerouslySetInnerHTML={{ __html: html }} />
        ) : (
          <pre className="text-[12px] p-3 font-mono"><code>{displayedRaw}</code></pre>
        )}
      </div>
    </div>
  )
}
