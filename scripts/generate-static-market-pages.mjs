import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const dist = path.join(root, 'dist')
const template = fs.readFileSync(path.join(dist, 'index.html'), 'utf8')
const origin = 'https://tradingninvestment.com'

const pages = [
  {
    path: '/stock-market-today/',
    title: 'Stock Market Today: S&P 500, Stock Movers & Market Trends | TradingNInvestment',
    description: 'Follow the stock market today with S&P 500 performance, major market indexes, top stock gainers and losers, market breadth, S&P 500 heatmap, sector performance and upcoming earnings.',
  },
  {
    path: '/stock-market-today/heatmap/',
    title: 'S&P 500 Heatmap Today | TradingNInvestment',
    description: 'Explore the S&P 500 heatmap to compare daily stock moves and see market leaders and laggards.',
  },
  {
    path: '/stock-market-today/sector-health/',
    title: 'Stock Market Sector Health Today | TradingNInvestment',
    description: 'Track stock market sector health, breadth, and daily performance across S&P 500 sectors.',
  },
  {
    path: '/stock-market-today/earnings-calendar/',
    title: 'Stock Market Earnings Calendar | TradingNInvestment',
    description: 'Explore upcoming company earnings and recent earnings results in the TNI earnings calendar.',
  },
]

const escapeHtml = (value) =>
  value.replaceAll('&', '&amp;').replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;').replaceAll('"', '&quot;')

for (const page of pages) {
  const canonical = origin + page.path
  const replacements = [
    [/<title>[\s\S]*?<\/title>/, `<title>${escapeHtml(page.title)}</title>`],
    [/(<meta\s+name="description"\s+content=")[^"]*("\s*\/>)/, `$1${escapeHtml(page.description)}$2`],
    [/(<meta\s+property="og:title"\s+content=")[^"]*("\s*\/>)/, `$1${escapeHtml(page.title)}$2`],
    [/(<meta\s+property="og:description"\s+content=")[^"]*("\s*\/>)/, `$1${escapeHtml(page.description)}$2`],
    [/(<meta\s+property="og:url"\s+content=")[^"]*("\s*\/>)/, `$1${canonical}$2`],
    [/(<meta\s+property="og:type"\s+content=")[^"]*("\s*\/>)/, '$1website$2'],
    [/(<meta\s+name="twitter:title"\s+content=")[^"]*("\s*\/>)/, `$1${escapeHtml(page.title)}$2`],
    [/(<meta\s+name="twitter:description"\s+content=")[^"]*("\s*\/>)/, `$1${escapeHtml(page.description)}$2`],
    [/(<link\s+rel="canonical"\s+href=")[^"]*("\s*\/>)/, `$1${canonical}$2`],
  ]

  let html = template
  for (const [pattern, replacement] of replacements) {
    if (!pattern.test(html)) {
      throw new Error(`Missing metadata in ${page.path}: ${pattern}`)
    }
    html = html.replace(pattern, replacement)
  }

  const destination = path.join(dist, page.path.slice(1), 'index.html')
  fs.mkdirSync(path.dirname(destination), { recursive: true })
  fs.writeFileSync(destination, html)
}

console.log(`TNI static market page metadata generated: ${pages.length}`)
