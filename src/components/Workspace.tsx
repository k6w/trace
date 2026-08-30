import { useEffect, useRef, useState } from 'react'
import { TopBar } from './TopBar'
import { InstrumentStrip } from './InstrumentStrip'
import { FilterToolbar } from './FilterToolbar'
import { Waterfall } from './Waterfall'
import { Inspector } from './Inspector'
import { CommandPalette } from './CommandPalette'
import { useHar } from '../hooks/useHar'

export function Workspace() {
  const { loadHar } = useHar()
  const fileRef = useRef<HTMLInputElement>(null)
  const [paletteOpen, setPaletteOpen] = useState(false)

  // ⌘K, ⌘O global shortcuts (workspace-scoped)
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      const tgt = e.target as HTMLElement | null
      const tag = tgt?.tagName?.toLowerCase()
      const inField = tag === 'input' || tag === 'textarea' || tgt?.isContentEditable
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault()
        setPaletteOpen((o) => !o)
      }
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'o') {
        e.preventDefault()
        fileRef.current?.click()
      }
      if (!inField && e.key === '?' && e.shiftKey) {
        e.preventDefault()
        setPaletteOpen(true)
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  const handleNewFile = (file: File) => {
    file.text().then((text) => {
      const result = loadHar(text, file.name)
      if (!result.ok) alert(`Could not parse: ${result.error}`)
    })
  }

  // Allow drop anywhere in workspace to load a new file
  useEffect(() => {
    function onOver(e: DragEvent) { e.preventDefault() }
    function onDrop(e: DragEvent) {
      const file = e.dataTransfer?.files?.[0]
      if (!file) return
      e.preventDefault()
      handleNewFile(file)
    }
    window.addEventListener('dragover', onOver)
    window.addEventListener('drop', onDrop)
    return () => {
      window.removeEventListener('dragover', onOver)
      window.removeEventListener('drop', onDrop)
    }
  })

  return (
    <div className="flex h-[100dvh] flex-col">
      <TopBar onOpenPalette={() => setPaletteOpen(true)} />
      <InstrumentStrip />
      <FilterToolbar />
      <Waterfall />
      <Inspector />
      <CommandPalette
        open={paletteOpen}
        onClose={() => setPaletteOpen(false)}
        onLoadNew={() => fileRef.current?.click()}
      />
      <input
        ref={fileRef}
        type="file"
        accept=".har,application/json,application/octet-stream"
        className="hidden"
        onChange={(e) => {
          const f = e.target.files?.[0]
          if (f) handleNewFile(f)
          e.target.value = ''
        }}
      />
    </div>
  )
}
