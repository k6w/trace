import { useEffect, useRef } from 'react'
import { TopNav } from './TopNav'
import { Hero } from './Hero'
import { Anatomy } from './Anatomy'
import { LiveDemo } from './LiveDemo'
import { FeatureTriptych } from './FeatureTriptych'
import { TechSpec } from './TechSpec'
import { FAQ } from './FAQ'
import { Footer } from './Footer'
import { useHar } from '../../hooks/useHar'

export function Landing() {
  const { loadHar } = useHar()
  const fileRef = useRef<HTMLInputElement>(null)

  const onChooseFile = () => fileRef.current?.click()

  const onTrySample = async () => {
    try {
      const r = await fetch('/sample.har')
      const text = await r.text()
      const result = loadHar(text, 'sample.har')
      if (!result.ok) alert(result.error)
    } catch (err) {
      alert('Could not load sample HAR.')
    }
  }

  // ⌘O global shortcut on landing
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'o') {
        e.preventDefault()
        fileRef.current?.click()
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  // Allow drop anywhere on the landing
  useEffect(() => {
    function onOver(e: DragEvent) { e.preventDefault() }
    function onDrop(e: DragEvent) {
      const file = e.dataTransfer?.files?.[0]
      if (!file) return
      e.preventDefault()
      file.text().then((text) => {
        const result = loadHar(text, file.name)
        if (!result.ok) alert(`Could not parse: ${result.error}`)
      })
    }
    window.addEventListener('dragover', onOver)
    window.addEventListener('drop', onDrop)
    return () => {
      window.removeEventListener('dragover', onOver)
      window.removeEventListener('drop', onDrop)
    }
  }, [loadHar])

  return (
    <div>
      <TopNav onOpenFile={onChooseFile} />
      <main>
        <Hero onChooseFile={onChooseFile} onTrySample={onTrySample} />
        <Anatomy />
        <LiveDemo onLoadSample={onTrySample} onChooseFile={onChooseFile} />
        <FeatureTriptych />
        <TechSpec />
        <FAQ />
      </main>
      <Footer onChooseFile={onChooseFile} onTrySample={onTrySample} />
      <input
        ref={fileRef}
        type="file"
        accept=".har,application/json,application/octet-stream"
        className="hidden"
        onChange={(e) => {
          const f = e.target.files?.[0]
          if (!f) return
          f.text().then((text) => {
            const result = loadHar(text, f.name)
            if (!result.ok) alert(`Could not parse: ${result.error}`)
          })
          e.target.value = ''
        }}
      />
    </div>
  )
}
