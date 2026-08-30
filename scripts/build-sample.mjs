// Build a synthetic but realistic-looking sample HAR that exercises every feature.
// Run: bun scripts/build-sample.mjs
import { writeFileSync, mkdirSync } from 'node:fs'
import { dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const out = `${__dirname}/../public/sample.har`
mkdirSync(dirname(out), { recursive: true })

const t0 = new Date('2026-04-12T14:22:08.412Z').getTime()
const entries = []

function rand(min, max) { return min + Math.random() * (max - min) }
function pick(arr) { return arr[Math.floor(Math.random() * arr.length)] }

function makeEntry({
  startOffset, time, method = 'GET', url, status = 200, statusText = 'OK',
  resourceType, mimeType = 'text/plain', body = '', responseHeadersExtra = [],
  bodySize, transferSize, phases, requestHeaders = [], priority = 'High', initiator,
  fromCache, ip = '151.101.1.7'
}) {
  const t = phases || {
    blocked: rand(0, 5), dns: rand(0, 8), connect: rand(0, 18),
    ssl: rand(0, 22), send: rand(0, 1.5), wait: time * rand(0.55, 0.85),
    receive: time * rand(0.05, 0.2),
  }
  // HAR 1.2: `time` is blocked+dns+connect+send+wait+receive, and `ssl` is
  // contained within `connect`. Scale to fit, then fold ssl back inside connect
  // so the fixture matches what a real browser exports.
  const sum = Object.values(t).reduce((a, b) => a + b, 0)
  const ratio = time / sum
  Object.keys(t).forEach((k) => { t[k] = Math.max(0, +(t[k] * ratio).toFixed(2)) })
  if (t.ssl > 0) t.connect = +(t.connect + t.ssl).toFixed(2)

  const hostHeaders = [
    { name: 'host', value: new URL(url).host },
    { name: 'user-agent', value: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 14_4) AppleWebKit/605.1.15 Trace/0.1' },
    { name: 'accept', value: '*/*' },
    { name: 'accept-language', value: 'en-US,en;q=0.9' },
    { name: 'accept-encoding', value: 'gzip, br, deflate' },
    ...requestHeaders,
  ]

  const responseHeaders = [
    { name: 'content-type', value: mimeType },
    { name: 'content-length', value: String(bodySize ?? body.length) },
    { name: 'cache-control', value: 'public, max-age=3600' },
    { name: 'server', value: 'Trace-Edge/1.4' },
    { name: 'date', value: new Date(t0 + startOffset).toUTCString() },
    { name: 'x-served-by', value: 'cache-iad-kjyo7100036-IAD' },
    ...responseHeadersExtra,
  ]

  return {
    _resourceType: resourceType,
    _initiator: initiator,
    _priority: priority,
    _fromCache: fromCache,
    cache: {},
    pageref: 'page_1',
    startedDateTime: new Date(t0 + startOffset).toISOString(),
    time: +time.toFixed(2),
    request: {
      method,
      url,
      httpVersion: 'HTTP/2.0',
      headers: hostHeaders,
      queryString: [...new URL(url).searchParams.entries()].map(([name, value]) => ({ name, value })),
      cookies: method === 'GET' ? [] : [{
        name: 'session', value: 'abc.def.0xc0ffee', path: '/', domain: new URL(url).host, expires: null, httpOnly: true, secure: true,
      }],
      headersSize: 380 + Math.floor(rand(0, 120)),
      bodySize: method === 'GET' ? 0 : Math.floor(rand(50, 320)),
      ...(method !== 'GET' ? {
        postData: {
          mimeType: 'application/json',
          text: JSON.stringify({ q: 'trace', limit: 20, since: '2026-04-01' }, null, 0),
        },
      } : {}),
    },
    response: {
      status,
      statusText,
      httpVersion: 'HTTP/2.0',
      headers: responseHeaders,
      cookies: [],
      content: {
        size: bodySize ?? body.length,
        mimeType,
        text: body || undefined,
      },
      redirectURL: '',
      headersSize: 320 + Math.floor(rand(0, 200)),
      bodySize: bodySize ?? body.length,
      _transferSize: transferSize ?? (bodySize ?? body.length) + 360,
    },
    serverIPAddress: ip,
    connection: '443',
    timings: t,
  }
}

// --- Document (the HTML) ---
const indexHtml = `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <title>Acme — Field Notes</title>
  <link rel="stylesheet" href="/_assets/app.f8a21c.css" />
  <script type="module" src="/_assets/app.b7e110.js"></script>
</head>
<body>
  <div id="app">
    <header class="masthead"><h1>Field Notes</h1></header>
    <main><article id="root"></article></main>
  </div>
</body>
</html>`

entries.push(makeEntry({
  startOffset: 0,
  time: 142,
  method: 'GET',
  url: 'https://acme.studio/articles/ten-thousand-paper-lanterns',
  resourceType: 'document',
  mimeType: 'text/html; charset=utf-8',
  body: indexHtml,
  bodySize: indexHtml.length,
  transferSize: 2480,
  phases: { blocked: 1, dns: 8, connect: 24, ssl: 31, send: 0.8, wait: 70, receive: 7 },
  priority: 'VeryHigh',
  initiator: { type: 'other' },
  responseHeadersExtra: [{ name: 'content-encoding', value: 'br' }],
}))

// --- Stylesheet ---
const css = `:root{--ink:#111;--paper:#fafafa}body{font-family:'Tiempos Text',Georgia,serif;background:var(--paper);color:var(--ink)}.masthead{padding:6rem 0 2rem;text-align:center}h1{font-family:'Tiempos Headline',serif;font-size:clamp(2.5rem,6vw,5.5rem);letter-spacing:-0.02em;margin:0}article{max-width:36rem;margin:0 auto;line-height:1.6}article p{margin:0 0 1.2em}article p:first-letter{font-size:3rem;float:left;line-height:0.9;padding:0.1em 0.1em 0 0;font-family:'Tiempos Headline',serif}article p+p:first-letter{font-size:inherit;float:none;padding:0}.pull{font-style:italic;font-size:1.4em;line-height:1.4;margin:2rem 0;padding:1rem 1.5rem;border-left:2px solid var(--ink)}`
entries.push(makeEntry({
  startOffset: 152,
  time: 38,
  method: 'GET',
  url: 'https://acme.studio/_assets/app.f8a21c.css',
  resourceType: 'stylesheet',
  mimeType: 'text/css; charset=utf-8',
  body: css,
  bodySize: css.length,
  transferSize: 1680,
  phases: { blocked: 0.4, dns: 0, connect: 0, ssl: 0, send: 0.2, wait: 32, receive: 5 },
  priority: 'VeryHigh',
  initiator: { type: 'parser', url: 'https://acme.studio/articles/ten-thousand-paper-lanterns', lineNumber: 5 },
  responseHeadersExtra: [{ name: 'content-encoding', value: 'br' }],
}))

// --- Script (main bundle) ---
const js = `(function(){const r=document.getElementById('root');const data=window.__BOOT__||{};async function load(){try{const res=await fetch('/api/v2/articles/ten-thousand-paper-lanterns',{headers:{accept:'application/json'}});if(!res.ok)throw new Error(res.statusText);const json=await res.json();render(json)}catch(err){console.error(err);r.innerHTML='<p>Could not load this article.</p>'}}function render(article){const el=document.createElement('div');el.innerHTML=article.html;r.replaceChildren(el);if(window.requestIdleCallback)requestIdleCallback(()=>track(article.id))}function track(id){navigator.sendBeacon('/api/v2/track',JSON.stringify({id,t:Date.now(),visit:data.visit}))}load()})();`
entries.push(makeEntry({
  startOffset: 156,
  time: 56,
  method: 'GET',
  url: 'https://acme.studio/_assets/app.b7e110.js',
  resourceType: 'script',
  mimeType: 'application/javascript; charset=utf-8',
  body: js,
  bodySize: js.length,
  transferSize: 12_410,
  phases: { blocked: 0.5, dns: 0, connect: 0, ssl: 0, send: 0.2, wait: 48, receive: 7.3 },
  priority: 'High',
  initiator: { type: 'parser', url: 'https://acme.studio/articles/ten-thousand-paper-lanterns', lineNumber: 6 },
  responseHeadersExtra: [{ name: 'content-encoding', value: 'br' }],
}))

// --- XHR/Fetch — the article JSON (the one the JS calls) ---
const articleJson = JSON.stringify({
  id: 'ten-thousand-paper-lanterns',
  title: 'Ten Thousand Paper Lanterns',
  byline: 'Adelina Mai',
  publishedAt: '2026-03-29T08:00:00Z',
  readMinutes: 14,
  tags: ['craft', 'memory', 'east-asia'],
  html: '<p>The first time we lit a lantern, the wind from the harbor gave it a hard shove and it nearly went into the sea.</p><p class="pull">Every paper is a small confession.</p><p>By the time the night was over, ten thousand were drifting east, and you could read by them if you stood on the pier.</p>',
}, null, 2)

entries.push(makeEntry({
  startOffset: 290,
  time: 184,
  method: 'GET',
  url: 'https://api.acme.studio/v2/articles/ten-thousand-paper-lanterns',
  resourceType: 'fetch',
  mimeType: 'application/json; charset=utf-8',
  body: articleJson,
  bodySize: articleJson.length,
  transferSize: articleJson.length + 480,
  phases: { blocked: 1, dns: 9, connect: 28, ssl: 36, send: 0.3, wait: 102, receive: 7.7 },
  priority: 'High',
  initiator: { type: 'script', url: 'https://acme.studio/_assets/app.b7e110.js', lineNumber: 1 },
  ip: '151.101.65.91',
}))

// --- Fonts (two woff2 files) ---
for (const [n, name] of [
  [0, 'tiempos-text-roman.woff2'],
  [1, 'tiempos-headline-medium.woff2'],
]) {
  entries.push(makeEntry({
    startOffset: 168 + n * 4,
    time: rand(46, 88),
    method: 'GET',
    url: `https://acme.studio/_fonts/${name}`,
    resourceType: 'font',
    mimeType: 'font/woff2',
    bodySize: 38_400 + Math.floor(rand(0, 16_000)),
    transferSize: 38_400 + Math.floor(rand(0, 16_000)),
    priority: 'High',
    initiator: { type: 'parser', url: 'https://acme.studio/_assets/app.f8a21c.css', lineNumber: 1 },
    responseHeadersExtra: [{ name: 'cache-control', value: 'public, max-age=31536000, immutable' }],
  }))
}

// --- Images ---
for (const [i, [name, kb]] of Object.entries([
  ['hero-lanterns@2x.avif', 312],
  ['masthead-mark.svg', 4],
  ['portrait-mai.avif', 168],
  ['lantern-detail-1.avif', 88],
  ['lantern-detail-2.avif', 92],
  ['pier-from-water.avif', 244],
  ['credits-glyph.svg', 2],
])) {
  const offset = 320 + Number(i) * rand(40, 96)
  entries.push(makeEntry({
    startOffset: offset,
    time: rand(60, 240),
    method: 'GET',
    url: `https://cdn.acme.studio/img/${name}`,
    resourceType: 'image',
    mimeType: name.endsWith('.svg') ? 'image/svg+xml' : 'image/avif',
    bodySize: kb * 1024,
    transferSize: kb * 1024 + 360,
    priority: Number(i) === 0 ? 'High' : 'Low',
    initiator: { type: 'parser', url: 'https://acme.studio/articles/ten-thousand-paper-lanterns', lineNumber: 18 + Number(i) },
    ip: '151.101.13.6',
  }))
}

// --- Telemetry beacon (POST) ---
entries.push(makeEntry({
  startOffset: 980,
  time: 64,
  method: 'POST',
  url: 'https://api.acme.studio/v2/track',
  resourceType: 'fetch',
  mimeType: 'application/json',
  body: '{"ok":true,"id":"evt_2k88dXc"}',
  bodySize: 30,
  transferSize: 380,
  priority: 'Low',
  initiator: { type: 'script', url: 'https://acme.studio/_assets/app.b7e110.js', lineNumber: 1 },
  responseHeadersExtra: [{ name: 'access-control-allow-origin', value: '*' }],
  ip: '151.101.65.91',
}))

// --- Slow API (the one that's actually slow) ---
entries.push(makeEntry({
  startOffset: 540,
  time: 1820,
  method: 'GET',
  url: 'https://api.acme.studio/v2/related?article=ten-thousand-paper-lanterns&limit=8',
  resourceType: 'xhr',
  mimeType: 'application/json',
  body: JSON.stringify({ items: Array.from({ length: 8 }, (_, i) => ({ id: `r-${i}`, title: `Related ${i + 1}`, byline: 'Various' })) }, null, 2),
  bodySize: 940,
  transferSize: 1340,
  phases: { blocked: 2, dns: 0, connect: 0, ssl: 0, send: 0.3, wait: 1740, receive: 78 },
  priority: 'Medium',
  initiator: { type: 'script', url: 'https://acme.studio/_assets/app.b7e110.js', lineNumber: 1 },
  ip: '151.101.65.91',
}))

// --- Failed request (404) ---
entries.push(makeEntry({
  startOffset: 1110,
  time: 96,
  method: 'GET',
  url: 'https://cdn.acme.studio/img/lantern-detail-3.avif',
  resourceType: 'image',
  mimeType: 'image/avif',
  body: '',
  status: 404,
  statusText: 'Not Found',
  bodySize: 0,
  transferSize: 240,
  priority: 'Low',
  initiator: { type: 'parser', url: 'https://acme.studio/articles/ten-thousand-paper-lanterns', lineNumber: 24 },
  ip: '151.101.13.6',
}))

// --- Failed request (500) ---
entries.push(makeEntry({
  startOffset: 1240,
  time: 720,
  method: 'POST',
  url: 'https://api.acme.studio/v2/comments',
  resourceType: 'fetch',
  mimeType: 'application/json',
  body: '{"error":"comments service unavailable","retryAfter":12}',
  status: 502,
  statusText: 'Bad Gateway',
  bodySize: 56,
  transferSize: 320,
  priority: 'Medium',
  initiator: { type: 'script', url: 'https://acme.studio/_assets/app.b7e110.js', lineNumber: 1 },
  ip: '151.101.65.91',
  phases: { blocked: 2, dns: 0, connect: 0, ssl: 0, send: 0.4, wait: 700, receive: 17 },
}))

// --- Cached image (memory) ---
entries.push(makeEntry({
  startOffset: 1900,
  time: 6,
  method: 'GET',
  url: 'https://cdn.acme.studio/img/masthead-mark.svg',
  resourceType: 'image',
  mimeType: 'image/svg+xml',
  body: '',
  bodySize: 4 * 1024,
  transferSize: 0,
  priority: 'Low',
  fromCache: 'memory',
  initiator: { type: 'parser', url: 'https://acme.studio/articles/ten-thousand-paper-lanterns', lineNumber: 30 },
  ip: '151.101.13.6',
  phases: { blocked: 0, dns: 0, connect: 0, ssl: 0, send: 0, wait: 4, receive: 2 },
}))

// --- A bunch of small analytics + ad pings to fill the timeline ---
for (let i = 0; i < 14; i++) {
  const offset = 1300 + i * rand(60, 220)
  entries.push(makeEntry({
    startOffset: offset,
    time: rand(20, 110),
    method: pick(['GET', 'POST']),
    url: `https://t.measure.io/p?v=1&t=event&n=scroll&d=${Date.now() + i}`,
    resourceType: pick(['xhr', 'fetch']),
    mimeType: 'image/gif',
    bodySize: 35,
    transferSize: 240,
    priority: 'Low',
    initiator: { type: 'script', url: 'https://acme.studio/_assets/app.b7e110.js', lineNumber: 1 },
    ip: '173.245.48.1',
  }))
}

// --- Third-party script (large) ---
entries.push(makeEntry({
  startOffset: 220,
  time: 320,
  method: 'GET',
  url: 'https://js.measure.io/v1/gtag.min.js',
  resourceType: 'script',
  mimeType: 'application/javascript',
  body: '',
  bodySize: 88 * 1024,
  transferSize: 26 * 1024,
  priority: 'Low',
  initiator: { type: 'parser', url: 'https://acme.studio/articles/ten-thousand-paper-lanterns', lineNumber: 7 },
  ip: '173.245.48.1',
  responseHeadersExtra: [{ name: 'content-encoding', value: 'br' }],
}))

// --- Final HAR shape ---
const har = {
  log: {
    version: '1.2',
    creator: { name: 'Trace Sample Builder', version: '0.1.0' },
    browser: { name: 'WebKit', version: '17.4' },
    pages: [{
      startedDateTime: new Date(t0).toISOString(),
      id: 'page_1',
      title: 'Acme — Ten Thousand Paper Lanterns',
      pageTimings: { onContentLoad: 380, onLoad: 1640 },
    }],
    entries: entries.sort((a, b) => Date.parse(a.startedDateTime) - Date.parse(b.startedDateTime)),
  },
}

writeFileSync(out, JSON.stringify(har, null, 2))
console.log(`Wrote ${out} with ${entries.length} entries.`)
