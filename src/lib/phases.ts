/* The phase spectrum — the one place that knows what an HTTP request is made of.
   Seven phases, seven distinguishable colors, in the order they actually happen.
   Cool while the network is being set up, hot amber while you wait, green when
   bytes finally arrive. `wait` gets the brand amber because it is almost always
   the phase that costs you the request. */

export const PHASE_ORDER = [
  'blocked', 'dns', 'connect', 'ssl', 'send', 'wait', 'receive',
] as const

export type Phase = (typeof PHASE_ORDER)[number]

export const PHASE_COLOR: Record<Phase, string> = {
  blocked: 'var(--phase-blocked)',
  dns: 'var(--phase-dns)',
  connect: 'var(--phase-connect)',
  ssl: 'var(--phase-ssl)',
  send: 'var(--phase-send)',
  wait: 'var(--phase-wait)',
  receive: 'var(--phase-receive)',
}

/* Short form for legends and dense rows. */
export const PHASE_LABEL: Record<Phase, string> = {
  blocked: 'Blocked',
  dns: 'DNS',
  connect: 'Connect',
  ssl: 'TLS',
  send: 'Send',
  wait: 'Wait',
  receive: 'Receive',
}

/* Long form for the Timing lens, where there is room to say what it means. */
export const PHASE_DESCRIPTION: Record<Phase, string> = {
  blocked: 'Queued behind other requests',
  dns: 'Resolving the hostname',
  connect: 'Opening the TCP connection',
  ssl: 'TLS handshake',
  send: 'Uploading the request',
  wait: 'Waiting for the first byte',
  receive: 'Downloading the response',
}

/* Which phase took the largest share of this request. The headline of every row. */
export function dominantPhase(phases: Record<Phase, number>): { phase: Phase; ms: number; share: number } {
  let total = 0
  let best: Phase = 'wait'
  let bestMs = -1
  for (const p of PHASE_ORDER) {
    const ms = phases[p] ?? 0
    total += ms
    if (ms > bestMs) { bestMs = ms; best = p }
  }
  return { phase: best, ms: Math.max(0, bestMs), share: total > 0 ? bestMs / total : 0 }
}
