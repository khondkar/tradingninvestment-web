import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { createServer } from 'vite'
import React from 'react'
import { renderToStaticMarkup } from 'react-dom/server'

const root = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  '..',
)

const dist = path.join(root, 'dist')
const canonical =
  'https://tradingninvestment.com/nasdaq-selloff-2026/'
const title = 'Nasdaq Selloff 2026: Semiconductor Stocks, SOXL and Market Drawdowns | TNI'
const description =
  'Explore the 2026 Nasdaq selloff with original TNI charts covering semiconductor stock drawdowns, SNDK, SOXL daily leverage risk, and historical market corrections.'
const image =
  'https://tradingninvestment.com/images/social/research/nasdaq-selloff-2026-tni-horizontal.svg'

const escape = (value) =>
  String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')

const vite = await createServer({
  root,
  server: { middlewareMode: true },
  appType: 'custom',
  logLevel: 'error',
})

let Page

try {
  ;({ default: Page } = await vite.ssrLoadModule(
    '/src/pages/NasdaqSelloff2026Page.tsx',
  ))
} finally {
  await vite.close()
}

const markup = renderToStaticMarkup(React.createElement(Page))
let html = fs.readFileSync(path.join(dist, 'index.html'), 'utf8')

html = html.replace(
  /<title>[\s\S]*?<\/title>/,
  `<title>${escape(title)}</title>`,
)

function setMeta(attribute, key, value) {
  const pattern = new RegExp(
    `<meta\\b[^>]*${attribute}=["']${key}["'][^>]*>`,
    'i',
  )
  const tag =
    `<meta ${attribute}="${key}" content="${escape(value)}" />`

  html = pattern.test(html)
    ? html.replace(pattern, tag)
    : html.replace('</head>', `${tag}\n</head>`)
}

setMeta('name', 'description', description)
setMeta('property', 'og:title', title)
setMeta('property', 'og:description', description)
setMeta('property', 'og:url', canonical)
setMeta('property', 'og:type', 'article')
setMeta('property', 'og:image', image)
setMeta('property', 'og:image:alt', 'Nasdaq Selloff 2026: five-asset drawdown comparison')
setMeta('name', 'twitter:title', title)
setMeta('name', 'twitter:description', description)
setMeta('name', 'twitter:image', image)
setMeta('name', 'twitter:card', 'summary_large_image')

const canonicalPattern =
  /<link\b[^>]*rel=["']canonical["'][^>]*>/i
const canonicalTag =
  `<link rel="canonical" href="${canonical}" />`

html = canonicalPattern.test(html)
  ? html.replace(canonicalPattern, canonicalTag)
  : html.replace('</head>', `${canonicalTag}\n</head>`)

const rootPattern = /<div id="root"><\/div>/

if (!rootPattern.test(html)) {
  throw new Error(
    'Generate the Nasdaq Selloff article before the research hubs, using the original Vite index.html.',
  )
}

html = html.replace(
  rootPattern,
  `<div id="root">${markup}</div>`,
)

const schema = {
  '@context': 'https://schema.org',
  '@type': 'Article',
  headline: 'Nasdaq Selloff 2026: AI Stocks, Semiconductor Risk and SOXL',
  description,
  mainEntityOfPage: canonical,
  image,
  author: {
    '@type': 'Person',
    name: 'Kamal Khondkar',
    url: 'https://tradingninvestment.com/about/',
  },
  publisher: {
    '@type': 'Organization',
    name: 'TradingNInvestment',
  },
}

html = html.replace(
  '</head>',
  `<script type="application/ld+json">${JSON.stringify(schema)}</script>\n</head>`,
)

const target = path.join(
  dist,
  'nasdaq-selloff-2026',
  'index.html',
)

fs.mkdirSync(path.dirname(target), { recursive: true })
fs.writeFileSync(target, html)

console.log(
  'TNI static article generated: /nasdaq-selloff-2026/',
)
