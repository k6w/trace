/* Trace mark — abstract waterfall in flag form. Four horizontal bars of
   decreasing length, colored by resource-type palette. The mark IS the
   product: drop a HAR, see your network as bars on a timeline. */

interface LogoProps {
  size?: number
  className?: string
  withBox?: boolean
  variant?: 'flag' | 'glyph'
}

export function Logo({ size = 28, className = '', withBox = true, variant = 'flag' }: LogoProps) {
  if (variant === 'glyph') {
    return (
      <svg
        width={size}
        height={size}
        viewBox="0 0 24 24"
        className={className}
        fill="none"
        aria-label="Trace logo"
      >
        {/* T form composed of timing bars */}
        <rect x="3" y="3" width="18" height="3" fill="var(--primary)" />
        <rect x="6" y="6" width="3" height="15" fill="var(--foreground)" />
        <rect x="9" y="6" width="3" height="9" fill="var(--chart-3)" />
        <rect x="12" y="6" width="3" height="6" fill="var(--chart-2)" />
        <rect x="15" y="6" width="3" height="11" fill="var(--chart-5)" />
        <rect x="18" y="6" width="3" height="4" fill="var(--chart-4)" />
      </svg>
    )
  }

  // Flag variant — boxed waterfall mark
  return (
    <span
      className={`inline-grid place-items-center shrink-0 ${withBox ? 'border-2 border-border bg-primary' : ''} ${className}`}
      style={{ width: size, height: size }}
      aria-label="Trace logo"
    >
      <svg width={size * 0.7} height={size * 0.7} viewBox="0 0 18 18" fill="none" aria-hidden>
        <rect x="0" y="2" width="18" height="2.4" fill="var(--foreground)" />
        <rect x="0" y="6" width="13" height="2.4" fill="var(--foreground)" />
        <rect x="0" y="10" width="16" height="2.4" fill="var(--foreground)" />
        <rect x="0" y="14" width="9" height="2.4" fill="var(--foreground)" />
      </svg>
    </span>
  )
}

/* Big poster mark — used in hero badge / footer */
export function LogoPoster({ size = 80, className = '' }: { size?: number; className?: string }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 80 80"
      className={className}
      fill="none"
      aria-label="Trace mark"
    >
      <rect x="0" y="0" width="80" height="80" fill="var(--primary)" stroke="var(--border)" strokeWidth="3" />
      <rect x="10" y="14" width="58" height="6" fill="var(--foreground)" />
      <rect x="10" y="26" width="40" height="6" fill="var(--foreground)" />
      <rect x="10" y="38" width="52" height="6" fill="var(--foreground)" />
      <rect x="10" y="50" width="28" height="6" fill="var(--foreground)" />
      <rect x="10" y="62" width="46" height="6" fill="var(--foreground)" />
    </svg>
  )
}
