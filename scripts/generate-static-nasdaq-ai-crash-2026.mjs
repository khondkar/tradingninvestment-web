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
  'https://tradingninvestment.com/nasdaq-ai-crash-2026/'
const title = "Nasdaq AI Stock Crash 2026 vs. the 2000 Dot-Com Bubble | TNI"
const description = "Nasdaq fell 5.52% on Nov. 5, 2026. Compare AI stock drawdowns with the 2000 dot-com crash and discover what happened after historic Nasdaq selloffs."
const image = "https://tradingninvestment.com/images/social/nasdaq-ai-crash-2026-og.png"

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
    '/src/pages/NasdaqAICrash2026Page.tsx',
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
setMeta('property', 'og:image:alt', 'Nasdaq Composite: Dot-com boom and AI boom, indexed to 100')
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
  headline: 'Nasdaq AI Stock Crash 2026 vs. the 2000 Dot-Com Bubble',
  description,
  datePublished: '2026-11-06',
  dateModified: '2026-11-06',
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
  'nasdaq-ai-crash-2026',
  'index.html',
)

fs.mkdirSync(path.dirname(target), { recursive: true })
fs.writeFileSync(target, html)

console.log(
  'TNI static article generated: /nasdaq-ai-crash-2026/',
)
