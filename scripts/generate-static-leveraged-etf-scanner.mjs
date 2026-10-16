import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { createServer } from 'vite'
import React from 'react'
import { renderToString } from 'react-dom/server'

const root = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  '..'
)

const dist = path.join(root, 'dist')
const articlePath = '/research/scanners/leveraged-etf/'

const origin = 'https://tradingninvestment.com'
const title = 'Leveraged ETF Scanner | TradingNInvestment'

const description = 'Explore leveraged and inverse ETFs with sortable fund information, leverage, assets, trading volume, expense ratios, and research snapshots.'

const escapeHtml = (value) =>
  String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')

const template = fs.readFileSync(
  path.join(dist, 'index.html'),
  'utf8'
)

const vite = await createServer({
  root,
  server: { middlewareMode: true },
  appType: 'custom',
  logLevel: 'error',
})

let App

try {
  const appModule = await vite.ssrLoadModule('/src/App.tsx')
  App = appModule.default

  await appModule.prepareApp(articlePath)
} finally {
  await vite.close()
}

const markup = renderToString(
  React.createElement(App, { pathname: articlePath })
)

if (
  !markup.includes('tni-les-featured-history') ||
  !markup.includes('100 Years of Dow Jones History') ||
  !markup.includes('Average Stock Market Return')
) {
  throw new Error('Leveraged ETF scanner SSR content missing')
}

const canonical = origin + articlePath

const scannerSchema = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'WebPage',
      '@id': canonical + '#webpage',
      url: canonical,
      name: title,
      description,
      inLanguage: 'en-US',
      mainEntity: { '@id': canonical + '#application' }
    },
    {
      '@type': 'WebApplication',
      '@id': canonical + '#application',
      name: 'TNI Leveraged ETF Scanner',
      url: canonical,
      description,
      applicationCategory: 'FinanceApplication',
      operatingSystem: 'Web',
      isAccessibleForFree: true,
      featureList: [
        'Search leveraged and inverse ETF candidates',
        'Filter by direction, leverage and asset class',
        'Sort ETF directory and research coverage',
        'Compare two to four selected ETFs',
        'View available saved market-data snapshots'
      ]
    },
    {
      '@type': 'BreadcrumbList',
      '@id': canonical + '#breadcrumbs',
      itemListElement: [
        {
          '@type': 'ListItem',
          position: 1,
          name: 'Home',
          item: origin + '/'
        },
        {
          '@type': 'ListItem',
          position: 2,
          name: 'Research',
          item: origin + '/research/'
        },
        {
          '@type': 'ListItem',
          position: 3,
          name: 'Leveraged ETF Scanner',
          item: canonical
        }
      ]
    }
  ]
}


let html = template
  .replace(
    /<title>[\s\S]*?<\/title>/,
    `<title>${escapeHtml(title)}</title>`
  )
  .replace(
    /(<meta\s+name="description"\s+content=")[^"]*("\s*\/>)/,
    `$1${escapeHtml(description)}$2`
  )
  .replace(
    /(<meta\s+property="og:title"\s+content=")[^"]*("\s*\/>)/,
    `$1${escapeHtml(title)}$2`
  )
  .replace(
    /(<meta\s+property="og:description"\s+content=")[^"]*("\s*\/>)/,
    `$1${escapeHtml(description)}$2`
  )
  .replace(
    /(<meta\s+name="twitter:title"\s+content=")[^"]*("\s*\/>)/,
    `$1${escapeHtml(title)}$2`
  )
  .replace(
    /(<meta\s+name="twitter:description"\s+content=")[^"]*("\s*\/>)/,
    `$1${escapeHtml(description)}$2`
  )
  .replace(
    /(<meta\s+property="og:url"\s+content=")[^"]*("\s*\/>)/,
    `$1${canonical}$2`
  )
  .replace(
    /(<meta\s+property="og:type"\s+content=")[^"]*("\s*\/>)/,
    '$1article$2'
  )
  .replace(
    /(<link\s+rel="canonical"\s+href=")[^"]*("\s*\/>)/,
    `$1${canonical}$2`
  )
  .replace(
    '<div id="root"></div>',
    `<div id="root">${markup}</div>`
  )
  .replace(
    '</head>',
    `<script type="application/ld+json">${JSON.stringify(scannerSchema).replaceAll('<', '\\u003c')}</script>\n</head>`
  )

if (!html.includes(markup)) {
  throw new Error('Unable to inject Leveraged ETF scanner HTML')
}

const target = path.join(
  dist,
  articlePath.slice(1),
  'index.html'
)

fs.mkdirSync(path.dirname(target), { recursive: true })
fs.writeFileSync(target, html)

console.log(`TNI static Leveraged ETF scanner generated: ${articlePath}`)
console.log(`SSR article: PASS`)
