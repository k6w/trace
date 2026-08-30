import type { HarEntry } from './har'

export type ResourceType =
  | 'document'
  | 'stylesheet'
  | 'script'
  | 'image'
  | 'font'
  | 'media'
  | 'xhr'
  | 'fetch'
  | 'websocket'
  | 'other'

const MIME_RULES: Array<[RegExp, ResourceType]> = [
  [/^text\/html/, 'document'],
  [/^text\/css/, 'stylesheet'],
  [/javascript|ecmascript|application\/json/, 'script'],
  [/^image\//, 'image'],
  [/^font\/|application\/font|application\/vnd\.ms-fontobject|application\/x-font/, 'font'],
  [/^audio\/|^video\//, 'media'],
  [/^application\/wasm/, 'other'],
]

const EXT_RULES: Array<[RegExp, ResourceType]> = [
  [/\.(html?|php|aspx?)(\?|#|$)/i, 'document'],
  [/\.(css)(\?|#|$)/i, 'stylesheet'],
  [/\.(m?js|cjs|mjs|ts|tsx|jsx)(\?|#|$)/i, 'script'],
  [/\.(png|jpe?g|gif|webp|avif|svg|ico|bmp)(\?|#|$)/i, 'image'],
  [/\.(woff2?|ttf|otf|eot)(\?|#|$)/i, 'font'],
  [/\.(mp4|webm|ogg|mp3|wav|m4a|flac)(\?|#|$)/i, 'media'],
  [/\.json(\?|#|$)/i, 'fetch'],
]

export function classifyResource(entry: HarEntry): ResourceType {
  const explicit = (entry._resourceType ?? '').toLowerCase()
  if (explicit) {
    if (explicit === 'document' || explicit === 'main') return 'document'
    if (explicit === 'stylesheet') return 'stylesheet'
    if (explicit === 'script') return 'script'
    if (explicit === 'image') return 'image'
    if (explicit === 'font') return 'font'
    if (explicit === 'media') return 'media'
    if (explicit === 'xhr') return 'xhr'
    if (explicit === 'fetch') return 'fetch'
    if (explicit === 'websocket' || explicit === 'eventsource') return 'websocket'
    if (explicit === 'manifest' || explicit === 'other' || explicit === 'preflight') return 'other'
  }
  const mime = entry.response?.content?.mimeType ?? ''
  for (const [re, type] of MIME_RULES) if (re.test(mime)) return type
  const url = entry.request?.url ?? ''
  for (const [re, type] of EXT_RULES) if (re.test(url)) return type
  return 'other'
}

export const RESOURCE_TYPES: ResourceType[] = [
  'document', 'stylesheet', 'script', 'image', 'font', 'media', 'xhr', 'fetch', 'websocket', 'other',
]

export const RESOURCE_TYPE_LABELS: Record<ResourceType, string> = {
  document: 'Doc',
  stylesheet: 'CSS',
  script: 'JS',
  image: 'Img',
  font: 'Font',
  media: 'Media',
  xhr: 'XHR',
  fetch: 'Fetch',
  websocket: 'WS',
  other: 'Other',
}

export const RESOURCE_TYPE_COLOR: Record<ResourceType, string> = {
  document: 'var(--type-document)',
  stylesheet: 'var(--type-stylesheet)',
  script: 'var(--type-script)',
  image: 'var(--type-image)',
  font: 'var(--type-font)',
  media: 'var(--type-media)',
  xhr: 'var(--type-xhr)',
  fetch: 'var(--type-fetch)',
  websocket: 'var(--type-websocket)',
  other: 'var(--type-other)',
}
