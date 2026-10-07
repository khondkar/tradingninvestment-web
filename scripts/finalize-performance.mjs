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
const file = path.join(dist, 'index.html')
const html = fs.readFileSync(file, 'utf8')
if (!html.includes('class="site tni-home-site"') || !html.includes('id="featured-research"')) {
  throw new Error('Homepage must contain the complete prerendered App before hydration is enabled')
}
fs.writeFileSync(file, html.replace('<div id="root">', '<div id="root" data-tni-hydrate="home">'))
console.log('TNI homepage hydration and article styles enabled')
