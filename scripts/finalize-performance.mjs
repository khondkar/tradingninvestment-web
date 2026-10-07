import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { createServer } from 'vite'
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const dist = path.join(root, 'dist')
const manifest = JSON.parse(fs.readFileSync(path.join(dist, '.vite/manifest.json'), 'utf8'))
const vite = await createServer({ root, server: { middlewareMode: true }, appType: 'custom', logLevel: 'error' })
let entries
try {
  ;({ publishedAnnualReturnsResearchRegistry: entries } = await vite.ssrLoadModule('/src/research/annual-returns/registry.ts'))
} finally { await vite.close() }
// Static article HTML needs its route styles even before JavaScript executes.
const routes = new Map([
  ['/stock-market-crash-of-1929/', 'src/pages/StockMarketCrash1929Page.tsx'],
  ['/stock-market-today/', 'src/pages/StockMarketTodayPage.tsx'],
  ['/stock-market-today/heatmap/', 'src/pages/StockMarketHeatmapPage.tsx'],
  ['/stock-market-today/sector-health/', 'src/pages/StockMarketSectorHealthPage.tsx'],
  ['/stock-market-today/earnings-calendar/', 'src/pages/StockMarketEarningsCalendarPage.tsx'],
  ['/sp-500-returns/', 'src/pages/SP500ReturnsPage.tsx'],
  ['/average-stock-market-return/', 'src/pages/AverageStockMarketReturnPage.tsx'],
  ['/stock-market-historical-returns/', 'src/pages/DowReturnsPage.tsx'],
  ['/nasdaq-historical-annual-returns/', 'src/pages/NasdaqReturnsPage.tsx'],
  ['/sp-500-monthly-returns/', 'src/pages/SP500MonthlyReturnsPage.tsx'],
  ['/stock-market-correction-myth-and-reality/', 'src/pages/SP500DrawdownsPage.tsx'],
])
for (const { config } of entries) {
  if (routes.has(config.canonicalPath)) continue
  const type = config.categories.includes('leveraged-etf') ? 'LeveragedEtf'
    : config.categories.includes('etf') ? 'Etf' : config.categories.includes('stock') ? 'Stock' : null
  if (type) routes.set(config.canonicalPath, `src/templates/${type}AnnualReturnsPage.tsx`)
}
for (const [route, entry] of routes) {
  const file = path.join(dist, route.slice(1), 'index.html')
  if (!fs.existsSync(file)) throw new Error(`Missing generated page: ${route}`)
  const css = new Set()
  const seen = new Set()
  function visit(key) {
    if (seen.has(key)) return
    seen.add(key)
    const chunk = manifest[key]
    if (!chunk) throw new Error(`Missing route chunk: ${key}`)
    for (const file of chunk.css ?? []) css.add(file)
    for (const dependency of chunk.imports ?? []) visit(dependency)
  }
  visit(entry)
  let html = fs.readFileSync(file, 'utf8')
  const links = [...css].filter(file => !html.includes(`href="/${file}"`))
    .map(file => `<link rel="stylesheet" crossorigin href="/${file}">`).join('\n')
  html = html.replace('</head>', `${links}\n</head>`)
  fs.writeFileSync(file, html)
}
// Research hubs are prerendered and own their page-specific stylesheet.
// Attach ResearchDiscovery CSS directly so first paint does not wait for JS.
{
  const assetsDir = path.join(dist, 'assets')
  const researchCss = fs.readdirSync(assetsDir)
    .filter(name =>
      name.startsWith('ResearchDiscovery-') &&
      name.endsWith('.css')
    )

  if (researchCss.length !== 1) {
    throw new Error(
      `Expected exactly one ResearchDiscovery CSS asset, found ${researchCss.length}`
    )
  }

  const href = `/assets/${researchCss[0]}`
  const researchDir = path.join(dist, 'research')

  function attachResearchCss(dir) {
    for (const entry of fs.readdirSync(dir, {
      withFileTypes: true,
    })) {
      const target = path.join(dir, entry.name)

      if (entry.isDirectory()) {
        attachResearchCss(target)
        continue
      }

      if (entry.name !== 'index.html') continue

      let html = fs.readFileSync(target, 'utf8')

      if (!html.includes(`href="${href}"`)) {
        html = html.replace(
          '</head>',
          `<link rel="stylesheet" crossorigin href="${href}">\n</head>`,
        )
        fs.writeFileSync(target, html)
      }
    }
  }

  if (fs.existsSync(researchDir)) {
    attachResearchCss(researchDir)
  }
}

// About is prerendered and owns its page-specific stylesheet.
// Attach only the About CSS so other routes do not pay for it.
{
  const assetsDir = path.join(dist, 'assets')
  const aboutCss = fs.readdirSync(assetsDir)
    .filter(name => name.startsWith('AboutPage-') && name.endsWith('.css'))

  if (aboutCss.length !== 1) {
    throw new Error(
      `Expected exactly one AboutPage CSS asset, found ${aboutCss.length}`
    )
  }

  const aboutFile = path.join(dist, 'about', 'index.html')
  if (!fs.existsSync(aboutFile)) {
    throw new Error('Missing generated About page')
  }

  let aboutHtml = fs.readFileSync(aboutFile, 'utf8')
  const href = `/assets/${aboutCss[0]}`

  if (!aboutHtml.includes(`href="${href}"`)) {
    aboutHtml = aboutHtml.replace(
      '</head>',
      `<link rel="stylesheet" crossorigin href="${href}">\n</head>`,
    )
  }

  fs.writeFileSync(aboutFile, aboutHtml)
}

const file = path.join(dist, 'index.html')
let html = fs.readFileSync(file, 'utf8')

if (!html.includes('class="site tni-home-site"') || !html.includes('id="featured-research"')) {
  throw new Error('Homepage must contain the complete prerendered App before hydration is enabled')
}

// The homepage is prerendered, so its presentation CSS must be present
// before JavaScript/hydration begins. Keep it homepage-only so research
// articles do not pay for the full homepage stylesheet.
{
  const assetsDir = path.join(dist, 'assets')

  const homepageCss = fs.readdirSync(assetsDir)
    .filter(name =>
      name.startsWith('PremiumResearchHome-') &&
      name.endsWith('.css')
    )

  if (homepageCss.length !== 1) {
    throw new Error(
      `Expected exactly one PremiumResearchHome CSS asset, found ${homepageCss.length}`
    )
  }

  const href = `/assets/${homepageCss[0]}`

  if (!html.includes(`href="${href}"`)) {
    html = html.replace(
      '</head>',
      `<link rel="stylesheet" crossorigin href="${href}">\n</head>`,
    )
  }
}

html = html.replace(
  '<div id="root">',
  '<div id="root" data-tni-hydrate="home">',
)

// Inline only the stylesheets already selected for the homepage. Preserve
// their cascade order and full contents, avoiding a flash of unstyled content.
// This runs after all page generators; article/hub/About CSS stays external.
let inlineCount = 0
html = html.replace(/<link\b[^>]*>/gi, tag => {
  if (!/\brel=["']stylesheet["']/i.test(tag)) return tag
  const href = tag.match(/\bhref=["']([^"']+)["']/i)?.[1]
  if (!href || !/^\/assets\/[^/]+\.css$/.test(href)) {
    throw new Error(`Unexpected homepage stylesheet: ${href}`)
  }
  const css = fs.readFileSync(path.join(dist, href.slice(1)), 'utf8')
  if (/@import\s/i.test(css)) throw new Error('Resolve homepage CSS imports before inlining')
  for (const match of css.matchAll(/url\(\s*["']?([^"')\s]+)/gi)) {
    if (!/^(?:[a-z][a-z\d+.-]*:|\/|#)/i.test(match[1])) {
      throw new Error(`Homepage CSS needs a root-relative asset URL: ${match[1]}`)
    }
  }
  inlineCount++
  return `<style data-tni-home-css="${href}">${css.replace(/<\/style/gi, '<\\/style')}</style>`
})
if (!inlineCount) throw new Error('No homepage stylesheets found to inline')
html = html.replace(
  '<div id="root" data-tni-hydrate="home">',
  '<div id="root" data-tni-hydrate="home" data-tni-home-styles="inline">',
)

fs.writeFileSync(file, html)

console.log(`TNI homepage hydration enabled; ${inlineCount} stylesheets embedded in HTML`)

await import('./finalize-article-performance.mjs')
