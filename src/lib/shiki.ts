import type { HighlighterCore } from 'shiki/core'

let highlighterPromise: Promise<HighlighterCore> | null = null

export type Lang = 'json' | 'html' | 'javascript' | 'typescript' | 'css' | 'xml' | 'text'

async function bootstrap(): Promise<HighlighterCore> {
  const [{ createHighlighterCore }, engineMod, jsonGrammar, htmlGrammar, jsGrammar, tsGrammar, cssGrammar, xmlGrammar, themeDark, themeLight] = await Promise.all([
    import('shiki/core'),
    import('shiki/engine/javascript'),
    import('shiki/langs/json.mjs'),
    import('shiki/langs/html.mjs'),
    import('shiki/langs/javascript.mjs'),
    import('shiki/langs/typescript.mjs'),
    import('shiki/langs/css.mjs'),
    import('shiki/langs/xml.mjs'),
    import('shiki/themes/github-dark-dimmed.mjs'),
    import('shiki/themes/github-light.mjs'),
  ])
  return createHighlighterCore({
    themes: [themeDark.default, themeLight.default],
    langs: [jsonGrammar.default, htmlGrammar.default, jsGrammar.default, tsGrammar.default, cssGrammar.default, xmlGrammar.default],
    engine: engineMod.createJavaScriptRegexEngine(),
  })
}

export function getHighlighter(): Promise<HighlighterCore> {
  if (!highlighterPromise) highlighterPromise = bootstrap()
  return highlighterPromise
}

export function langFromMime(mime: string): Lang {
  if (!mime) return 'text'
  const m = mime.toLowerCase()
  if (m.includes('json')) return 'json'
  if (m.includes('html')) return 'html'
  if (m.includes('javascript') || m.includes('ecmascript')) return 'javascript'
  if (m.includes('typescript')) return 'typescript'
  if (m.includes('css')) return 'css'
  if (m.includes('xml') || m.includes('svg')) return 'xml'
  return 'text'
}

export async function highlight(code: string, lang: Lang, isDark: boolean): Promise<string> {
  if (!code) return ''
  if (lang === 'text') {
    return `<pre class="shiki"><code>${escapeHtml(code)}</code></pre>`
  }
  const hl = await getHighlighter()
  return hl.codeToHtml(code, {
    lang,
    theme: isDark ? 'github-dark-dimmed' : 'github-light',
  })
}

function escapeHtml(s: string): string {
  return s.replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]!))
}
