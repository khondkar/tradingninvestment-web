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
  'https://tradingninvestment.com/gravestone-doji-candlestick-pattern/'
const title = 'Trading Setups for Bearish and Bullish Gravestone Doji | TradingNInvestment'
const description =
  'Original TradingNInvestment research on bearish and bullish Gravestone Doji candlestick patterns, support zones, and trading setups.'
const image =
  'https://tradingninvestment.com/images/research/gravestone-doji/Bearish-gravestone-Doji-Candlestick-pattern-setup.png'

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
    '/src/pages/GravestoneDojiArticle.tsx',
  ))
} finally {
  await vite.close()
}

const articleMarkup = renderToStaticMarkup(React.createElement(Page))
const markup = `<div class="tni-gravestone-article">
  <div style="max-width:1100px;margin:24px auto 0;padding:0 24px;font-size:14px;color:#555">
    By <a href="/about/" rel="author">Kamal Khondkar</a>
  </div>
  ${articleMarkup}
</div>`
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
setMeta('property', 'og:image:alt', 'Original Gravestone Doji trading setup chart')
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
    'Generate the Gravestone Doji article before the research hubs, using the original Vite index.html.',
  )
}

html = html.replace(
  rootPattern,
  `<div id="root">${markup}</div>`,
)

const schema = {
  '@context': 'https://schema.org',
  '@type': 'Article',
  headline: 'Trading Setups for Bearish and Bullish Gravestone Doji',
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
  'gravestone-doji-candlestick-pattern',
  'index.html',
)

fs.mkdirSync(path.dirname(target), { recursive: true })
fs.writeFileSync(target, html)

console.log(
  'TNI static article generated: /gravestone-doji-candlestick-pattern/',
)
