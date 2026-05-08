import type { NormalizedEntry } from '../../lib/har'
import { CodeBlock } from './CodeBlock'

export function PayloadTab({ entry }: { entry: NormalizedEntry }) {
  const post = entry.raw.request.postData
  const body = post?.text ?? ''
  const mime = post?.mimeType ?? ''
  if (!post) {
    return <div className="text-[12px] text-muted-foreground italic">No request body.</div>
  }
  return (
    <div className="space-y-3">
      <div className="grid grid-cols-[minmax(0,140px)_minmax(0,1fr)] gap-3 text-[12px] font-mono">
        <span className="text-muted-foreground text-[11px] uppercase">MIME</span>
        <span className="break-all">{mime || '—'}</span>
      </div>
      <CodeBlock code={body} mimeType={mime} />
    </div>
  )
}
