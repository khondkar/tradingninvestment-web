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


  // Static, crawlable content for visitors and search engines without JS.
  // React uses createRoot() for these routes and replaces this shell.
  const headings = {
    '/stock-market-today/':
      'Stock Market Today — S&P 500, Market Movers and Trends',
    '/stock-market-today/heatmap/':
      'S&P 500 Stock Components Heatmap Today',
    '/stock-market-today/sector-health/':
      'Stock Market Sector Health Today',
    '/stock-market-today/earnings-calendar/':
      'Stock Market Earnings Calendar',
  }

  const links = [
    ['/stock-market-today/', 'Stock Market Today'],
    ['/stock-market-today/heatmap/', 'S&P 500 Heatmap'],
    ['/stock-market-today/sector-health/', 'Sector Health'],
    ['/stock-market-today/earnings-calendar/', 'Earnings Calendar'],
  ]

  const navigation = links.map(([href, label]) =>
    `<a href="${href}">${escapeHtml(label)}</a>`
  ).join(' ')

  const staticBody = `
    <div class="site">
      <main class="stock-market-today-page">
        <nav aria-label="Stock Market Today">${navigation}</nav>
        <section class="market-today-hero">
          <h1>${escapeHtml(headings[page.path])}</h1>
          <p>${escapeHtml(page.description)}</p>
        </section>
      </main>
    </div>
  `

  // Replace only the prerendered homepage root content.
  // Preserve the root opening tag, closing tag, and script assets.
  const rootStart = html.indexOf('<div id="root"')
  const bodyEnd = html.lastIndexOf('</body>')
  const rootClose = html.lastIndexOf('</div>', bodyEnd)

  if (rootStart === -1 || rootClose === -1 || rootClose <= rootStart) {
    throw new Error(`Cannot identify complete homepage root: ${page.path}`)
  }

  const rootOpenEnd = html.indexOf('>', rootStart) + 1
  const rootOpen = html.slice(rootStart, rootOpenEnd)

  html =
    html.slice(0, rootStart) +
    rootOpen +
    staticBody +
    '</div>' +
    html.slice(rootClose + '</div>'.length)

  const schema = {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    name: headings[page.path],
    description: page.description,
    url: canonical,
    isPartOf: {
      '@type': 'WebSite',
      name: 'TradingNInvestment',
      url: origin + '/',
    },
  }

  html = html.replace(
    '</head>',
    `<script type="application/ld+json">${JSON.stringify(schema)}</script>\n</head>`
  )

  if (!html.includes(`<h1>${escapeHtml(headings[page.path])}</h1>`)) {
    throw new Error(`Missing market-page heading: ${page.path}`)
  }

  const destination = path.join(dist, page.path.slice(1), 'index.html')
  fs.mkdirSync(path.dirname(destination), { recursive: true })
  fs.writeFileSync(destination, html)
}

console.log(`TNI static market page metadata generated: ${pages.length}`)
