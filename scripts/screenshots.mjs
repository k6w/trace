/* Capture the images used by README.md and docs/showcase.html.
 *
 *   bun run dev                 # in one terminal
 *   node scripts/screenshots.mjs
 *
 * Chromium comes from playwright-core. If it is not on disk, run
 * `bunx playwright install chromium` once, or point CHROME at any Chrome build.
 */
import { chromium } from 'playwright-core'
import { execFileSync } from 'node:child_process'
import { existsSync, mkdirSync, readdirSync, statSync } from 'node:fs'
import { join } from 'node:path'

const OUT = process.argv[2] ?? 'docs/media'
const BASE = process.env.TRACE_URL ?? 'http://localhost:5173/'

function findChromium() {
  if (process.env.CHROME) return process.env.CHROME
  const root = join(process.env.HOME ?? '', 'Library/Caches/ms-playwright')
  if (!existsSync(root)) return undefined
  const builds = readdirSync(root)
    .filter((d) => d.startsWith('chromium-') && !d.includes('headless'))
    .sort()
    .reverse()
  for (const build of builds) {
    for (const candidate of [
      'chrome-mac-arm64/Google Chrome for Testing.app/Contents/MacOS/Google Chrome for Testing',
      'chrome-mac/Chromium.app/Contents/MacOS/Chromium',
      'chrome-linux/chrome',
    ]) {
      const p = join(root, build, candidate)
      if (existsSync(p)) return p
    }
  }
  return undefined
}

mkdirSync(OUT, { recursive: true })

const browser = await chromium.launch({ executablePath: findChromium() })
const written = []

/** Load the sample capture and wait for the waterfall to settle. */
async function openSample(page) {
  await page.getByRole('button', { name: /try the sample/i }).first().click()
  await page.waitForSelector('text=Wall clock', { timeout: 10_000 })
  await page.waitForTimeout(1600)
}

async function shot(name, { theme = 'dark', width = 1600, height = 1000, prep } = {}) {
  const ctx = await browser.newContext({
    viewport: { width, height },
    deviceScaleFactor: 2,
    colorScheme: theme,
    reducedMotion: 'reduce',
  })
  const page = await ctx.newPage()
  await page.addInitScript((t) => {
    try { localStorage.setItem('trace-theme', t) } catch {}
  }, theme)
  await page.goto(BASE, { waitUntil: 'networkidle' })
  await page.waitForTimeout(1200)
  if (prep) await prep(page)
  await page.screenshot({ path: join(OUT, `${name}.png`) })
  await ctx.close()
  written.push(`${name}.png`)
  console.log(`  ${name}.png`)
}

/** Select the request whose URL contains `needle`. */
const selectRow = (needle) => async (page) => {
  await openSample(page)
  await page.locator('button').filter({ hasText: needle }).first().click()
  await page.waitForTimeout(900)
}

console.log(`Writing to ${OUT}/`)

await shot('hero', { height: 1000 })
await shot('hero-light', { theme: 'light', height: 1000 })

await shot('workspace', { prep: openSample })
await shot('workspace-light', { theme: 'light', prep: openSample })

await shot('inspector', { prep: selectRow('/v2/related') })
await shot('inspector-light', { theme: 'light', prep: selectRow('/v2/related') })

await shot('timing', {
  prep: async (page) => {
    await selectRow('/v2/related')(page)
    await page.getByRole('tab', { name: 'Timing' }).click()
    await page.waitForTimeout(700)
  },
})

await shot('response', {
  prep: async (page) => {
    await selectRow('/v2/articles/')(page)
    await page.getByRole('tab', { name: 'Response' }).click()
    await page.waitForTimeout(1400)
  },
})

await shot('palette', {
  prep: async (page) => {
    await openSample(page)
    await page.keyboard.press('Meta+k')
    await page.waitForTimeout(700)
  },
})

await shot('filters', {
  prep: async (page) => {
    await openSample(page)
    // Labels are title-case in the DOM and uppercased by CSS.
    await page.getByRole('button', { name: /^Img/i }).first().click()
    await page.getByRole('button', { name: /^Fetch/i }).first().click()
    await page.waitForTimeout(800)
  },
})

await shot('mobile', {
  width: 430,
  height: 932,
  prep: async (page) => { await page.waitForTimeout(600) },
})

await browser.close()

/* Shots come off the browser at 2x. Halve them to a retina-sane width and
   quantize, or the repo gains 20 MB of screenshots. Both steps are optional —
   skip them and the full-resolution PNGs are still valid. */
function optimize(dir, files) {
  const before = files.reduce((a, f) => a + statSync(join(dir, f)).size, 0)

  try {
    for (const f of files) {
      const out = execFileSync('sips', ['-g', 'pixelWidth', join(dir, f)], { encoding: 'utf8' })
      const w = Number(out.match(/pixelWidth:\s*(\d+)/)?.[1] ?? 0)
      if (w > 1800) execFileSync('sips', ['-Z', '1800', join(dir, f)], { stdio: 'ignore' })
    }
  } catch {
    console.log('  (sips unavailable - keeping full resolution)')
  }

  try {
    execFileSync('pngquant', [
      '--quality', '70-92', '--speed', '1', '--strip', '--force', '--ext', '.png',
      ...files.map((f) => join(dir, f)),
    ], { stdio: 'ignore' })
  } catch {
    console.log('  (pngquant unavailable - keeping unquantized PNGs)')
  }

  const after = files.reduce((a, f) => a + statSync(join(dir, f)).size, 0)
  const mb = (n) => `${(n / 1048576).toFixed(1)} MB`
  console.log(`Optimized: ${mb(before)} -> ${mb(after)}`)
}

optimize(OUT, written)
console.log('Done.')
