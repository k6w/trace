# Trace

**A scoring sheet for HTTP.** Drop in a `.har` export and read your network as a timeline — every phase, every byte, every wait. Stays in your browser. No upload, no telemetry.

```
██████████████████████████████████████████████████████████████████
████████████████████  TRACE  ·  v0.1  ████████████████████████████
██████████████████████████████████████████████████████████████████
```

---

## What it does

- **Drop a `.har`** — exported from Chrome / Firefox / Edge / Safari DevTools
- **See the waterfall** — virtualised, 60 fps past 5,000 entries, color-coded by resource type
- **Inspect any request** — 7 lenses (Overview · Headers · Cookies · Query · Payload · Response · Timing) with Shiki syntax highlighting
- **Drive it from the keyboard** — `⌘K` command palette, `/` to search, `↑↓ Enter Esc ←→ ⌘O`
- **Stay private** — parsing happens entirely in your browser via the File API. There is no server.

## Why

Chrome's built-in network panel is fine. Online HAR viewers are functional and dated. Trace tries something else: read a captured timeline the way you'd read a score, not a spreadsheet. Bold display type, mono everywhere data lives, surveyor brackets where rounded cards would be lazy.

## Running locally

```bash
bun install
bun run dev          # http://localhost:5173
bun run build
bun run preview
```

Requires Bun (or swap for npm/pnpm). Node 20+ also works.

## Stack

- **Vite 6** + **React 18** + **TypeScript**
- **Tailwind v4** via `@tailwindcss/vite` — single CSS file, no PostCSS config
- **Motion** (`motion@12`, framer-motion successor) for orchestrated reveals
- **@tanstack/react-virtual** for the waterfall
- **Shiki** with lazy-loaded JS regex engine, only json/html/js/ts/css/xml grammars
- **@phosphor-icons/react**, used sparingly
- Fonts: **Anton** (display) · **Familjen Grotesk** (sans) · **JetBrains Mono** (everything technical)

## Project layout

```
src/
├── App.tsx                # AnimatePresence: Landing ↔ Workspace
├── main.tsx
├── index.css              # Tailwind v4 theme + brutalist utilities
├── lib/
│   ├── har.ts             # HAR 1.2 types + parser + normalizer
│   ├── classify.ts        # entry → resource type + color
│   ├── format.ts          # bytes / ms / status formatters
│   ├── stats.ts           # summary, histogram buckets, domain breakdown
│   └── shiki.ts           # lazy highlighter, mime → lang
├── hooks/
│   ├── useHar.tsx         # state: filters, selection, range, file load
│   └── useTheme.tsx       # light/dark, persisted
├── components/
│   ├── landing/           # Marketing page (Hero, Anatomy, LiveDemo, Triptych, Specs, FAQ, Footer)
│   ├── Workspace.tsx      # Full HAR viewer
│   ├── TopBar.tsx
│   ├── InstrumentStrip.tsx
│   ├── HistogramStrip.tsx # 60-bucket histogram + drag-to-scrub time range
│   ├── FilterToolbar.tsx
│   ├── Waterfall.tsx · WaterfallRow.tsx · TimingBar.tsx · TimeAxis.tsx
│   ├── Inspector.tsx
│   ├── inspector/         # 7 lens tabs
│   ├── CommandPalette.tsx # ⌘K
│   └── ThemeToggle.tsx
└── ui/
    ├── Brutal.tsx         # CornerBrackets, BrutalButton, Tag, SectionIndex, Marquee, SplitText, TermBadge
    ├── Logo.tsx           # custom waterfall mark
    ├── Tabs.tsx · Tooltip.tsx · KeyValue.tsx · CopyButton.tsx · Badge.tsx
```

## Design notes

The visual identity is **soft-brutalist with technical rigor**:

- Mono-first body text. Display headlines in Anton (condensed, 90s editorial poster).
- Heavy 2px borders, square corners, hard offset shadows (no rounded cards).
- Surveyor corner brackets instead of dashed drop zones.
- Amber primary used surgically — focus rings, primary CTA, the `wait` phase of every timing bar (the most important phase a HAR has to tell you about).
- Numbered sections (`02 / 07 ANATOMY`) like a manifesto.
- A receipt-style status strip at the top of the hero, marquee tickers between sections.

The product itself is the marketing. The landing's "Live demo" section is a real, sandboxed Workspace running on a bundled sample HAR — not a screenshot.

## Keyboard

| Key | Action |
| --- | --- |
| `⌘O` | Open file |
| `⌘K` | Command palette |
| `/`  | Focus search |
| `↑↓` | Navigate waterfall |
| `Enter` | Open inspector |
| `←→` | Navigate sibling entries (in inspector) |
| `Esc` | Close inspector / palette |

## Privacy

Trace is a static page. Parsing happens in your browser via the File API. There is no backend; nothing is uploaded. Open your own DevTools Network tab while you use Trace and you'll see exactly one request: the page itself.

## License

MIT — see [LICENSE](./LICENSE).

---

> Made with care · Trace · v0.1
