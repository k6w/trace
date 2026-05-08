import { classifyResource, type ResourceType } from './classify'

export interface HarHeader { name: string; value: string }
export interface HarCookie {
  name: string; value: string; path?: string; domain?: string;
  expires?: string | null; httpOnly?: boolean; secure?: boolean
}
export interface HarQuery { name: string; value: string }

export interface HarPostData {
  mimeType: string
  text?: string
  params?: { name: string; value?: string; fileName?: string; contentType?: string }[]
}

export interface HarContent {
  size: number
  compression?: number
  mimeType: string
  text?: string
  encoding?: string
}

export interface HarRequest {
  method: string
  url: string
  httpVersion: string
  headers: HarHeader[]
  queryString: HarQuery[]
  cookies: HarCookie[]
  headersSize: number
  bodySize: number
  postData?: HarPostData
}

export interface HarResponse {
  status: number
  statusText: string
  httpVersion: string
  headers: HarHeader[]
  cookies: HarCookie[]
  content: HarContent
  redirectURL: string
  headersSize: number
  bodySize: number
  _transferSize?: number
}

export interface HarTimings {
  blocked?: number
  dns?: number
  connect?: number
  ssl?: number
  send?: number
  wait?: number
  receive?: number
  comment?: string
}

export interface HarPage {
  startedDateTime: string
  id: string
  title: string
  pageTimings?: { onContentLoad?: number; onLoad?: number }
}

export interface HarEntry {
  pageref?: string
  startedDateTime: string
  time: number
  request: HarRequest
  response: HarResponse
  cache?: object
  timings: HarTimings
  serverIPAddress?: string
  connection?: string
  _resourceType?: string
  _initiator?: { type?: string; url?: string; lineNumber?: number }
  _priority?: string
  _fromCache?: 'memory' | 'disk' | string
}

export interface HarLog {
  version: string
  creator: { name: string; version: string }
  browser?: { name: string; version: string }
  pages?: HarPage[]
  entries: HarEntry[]
  comment?: string
}

export interface HarFile {
  log: HarLog
}

export interface NormalizedEntry {
  id: number
  raw: HarEntry
  startMs: number
  endMs: number
  totalMs: number
  url: string
  host: string
  pathname: string
  search: string
  scheme: string
  method: string
  status: number
  statusText: string
  type: ResourceType
  mimeType: string
  sizeBytes: number
  transferred: number
  isError: boolean
  isCached: boolean
  protocol: string
  serverIp: string
  initiatorType: string
  phases: {
    blocked: number
    dns: number
    connect: number
    ssl: number
    send: number
    wait: number
    receive: number
  }
}

export interface NormalizedHar {
  meta: {
    name: string
    creator: string
    browser?: string
    pageTitle?: string
    entryCount: number
    rangeStart: number
    rangeEnd: number
    totalBytes: number
    errorCount: number
    domainCount: number
  }
  entries: NormalizedEntry[]
}

export type ParseResult =
  | { ok: true; data: NormalizedHar }
  | { ok: false; error: string }

export function parseHar(text: string, fileName = 'capture.har'): ParseResult {
  let json: unknown
  try {
    json = JSON.parse(text)
  } catch (err) {
    return { ok: false, error: `Not valid JSON: ${(err as Error).message}` }
  }

  const log = (json as HarFile)?.log
  if (!log || typeof log !== 'object') {
    return { ok: false, error: 'Missing top-level "log" object — is this a HAR file?' }
  }
  if (!Array.isArray(log.entries)) {
    return { ok: false, error: 'log.entries is not an array.' }
  }
  if (log.entries.length === 0) {
    return { ok: false, error: 'This HAR has no entries.' }
  }

  return { ok: true, data: normalize(log, fileName) }
}

function safeUrl(u: string): URL | null {
  try { return new URL(u) } catch { return null }
}

function normalize(log: HarLog, fileName: string): NormalizedHar {
  const earliest = (() => {
    const stamps: number[] = []
    if (log.pages?.[0]?.startedDateTime) {
      stamps.push(Date.parse(log.pages[0].startedDateTime))
    }
    for (const e of log.entries) {
      const t = Date.parse(e.startedDateTime)
      if (!isNaN(t)) stamps.push(t)
    }
    return stamps.length ? Math.min(...stamps) : 0
  })()

  let totalBytes = 0
  let errorCount = 0
  const domains = new Set<string>()
  let rangeEnd = 0

  const entries: NormalizedEntry[] = log.entries.map((e, i) => {
    const start = Date.parse(e.startedDateTime) - earliest
    const total = Math.max(0, e.time || 0)
    const end = start + total

    const url = safeUrl(e.request.url)
    const host = url?.host ?? ''
    if (host) domains.add(host)

    const pathname = url?.pathname ?? e.request.url
    const search = url?.search ?? ''
    const scheme = url?.protocol?.replace(':', '') ?? 'http'

    const status = e.response?.status ?? 0
    const statusText = e.response?.statusText ?? ''
    const isErr = status === 0 || status >= 400
    if (isErr) errorCount++

    const mimeType = e.response?.content?.mimeType ?? ''
    const type = classifyResource(e)

    const respBody = Math.max(0, e.response?.bodySize ?? -1)
    const respContent = Math.max(0, e.response?.content?.size ?? 0)
    const sizeBytes = respBody > 0 ? respBody : respContent
    const transferred = Math.max(0, e.response?._transferSize ?? (
      (e.request?.headersSize ?? 0) + Math.max(0, e.request?.bodySize ?? 0) +
      (e.response?.headersSize ?? 0) + respBody
    ))
    totalBytes += transferred

    const t = e.timings || {}
    const phases = {
      blocked: Math.max(0, t.blocked ?? 0),
      dns: Math.max(0, t.dns ?? 0),
      connect: Math.max(0, t.connect ?? 0),
      ssl: Math.max(0, t.ssl ?? 0),
      send: Math.max(0, t.send ?? 0),
      wait: Math.max(0, t.wait ?? 0),
      receive: Math.max(0, t.receive ?? 0),
    }

    rangeEnd = Math.max(rangeEnd, end)

    return {
      id: i,
      raw: e,
      startMs: start,
      endMs: end,
      totalMs: total,
      url: e.request.url,
      host,
      pathname,
      search,
      scheme,
      method: e.request.method,
      status,
      statusText,
      type,
      mimeType,
      sizeBytes,
      transferred,
      isError: isErr,
      isCached: !!e._fromCache,
      protocol: e.response?.httpVersion ?? e.request.httpVersion ?? '',
      serverIp: e.serverIPAddress ?? '',
      initiatorType: e._initiator?.type ?? '',
      phases,
    }
  })

  return {
    meta: {
      name: fileName,
      creator: `${log.creator?.name ?? 'Unknown'} ${log.creator?.version ?? ''}`.trim(),
      browser: log.browser ? `${log.browser.name} ${log.browser.version}` : undefined,
      pageTitle: log.pages?.[0]?.title,
      entryCount: entries.length,
      rangeStart: 0,
      rangeEnd,
      totalBytes,
      errorCount,
      domainCount: domains.size,
    },
    entries,
  }
}
