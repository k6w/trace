import type { NormalizedEntry } from '../../lib/har'
import { CodeBlock } from './CodeBlock'
import { formatBytes } from '../../lib/format'

export function ResponseTab({ entry }: { entry: NormalizedEntry }) {
  const content = entry.raw.response.content
  const mime = content?.mimeType ?? ''
  const isImage = mime.startsWith('image/')
  const text = content?.text ?? ''

  if (isImage && text) {
    const src = content.encoding === 'base64'
      ? `data:${mime};base64,${text}`
      : text.startsWith('data:') ? text : `data:${mime};utf8,${encodeURIComponent(text)}`
    return (
      <div className="space-y-3">
        <Meta mime={mime} size={entry.sizeBytes} />
        <div className="border border-border/70 p-4 grid place-items-center bg-muted/20">
          <img src={src} alt="" className="max-w-full max-h-[60vh]" />
        </div>
      </div>
    )
  }

  if (!text) {
    return (
      <div className="space-y-3">
        <Meta mime={mime} size={entry.sizeBytes} />
        <div className="text-[12px] text-muted-foreground italic">
          Response body wasn't captured. (HAR exporters often skip large or binary bodies.)
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      <Meta mime={mime} size={entry.sizeBytes} />
      <CodeBlock code={text} mimeType={mime} />
    </div>
  )
}

function Meta({ mime, size }: { mime: string; size: number }) {
  return (
    <div className="grid grid-cols-[minmax(0,140px)_minmax(0,1fr)] gap-3 text-[12px] font-mono">
      <span className="text-muted-foreground text-[11px] uppercase">MIME</span>
      <span className="break-all">{mime || '—'}</span>
      <span className="text-muted-foreground text-[11px] uppercase">Size</span>
      <span>{formatBytes(size)}</span>
    </div>
  )
}
