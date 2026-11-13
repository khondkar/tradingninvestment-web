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
const articlePath =
  '/research/amd-nvidia-stock-forecast-november-2026/'

const origin = 'https://tradingninvestment.com'
const title =
  'AMD and Nvidia Stock Forecast: Are They a Buy? | TNI'

const description =
  'TNI’s 15-day stock forecast rates AMD and Nvidia HOLD. See why Nvidia’s Quant Agent signaled BUY and what the price trends show for both stocks.'

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
  !markup.includes('Are AMD and Nvidia a Buy, or Could Both Fall Again? TNI’s 15-Day Stock Forecast') ||
  !markup.includes('bank-study')
) {
  throw new Error('AMD and Nvidia article SSR content missing')
}

const canonical = origin + articlePath

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

if (!html.includes(markup)) {
  throw new Error('Unable to inject AMD and Nvidia article HTML')
}

html = html.replace(/(<meta\s+(?:property="og:image"|name="twitter:image")\s+content=")[^"]*/g, '$1'+origin+'/images/social/research/amd-outlook-nov13.png')
html = html.replace(/(<meta\s+property="og:image:alt"\s+content=")[^"]*/, '$1Original AMD Prediction Lab card showing HOLD for 15 sessions')
const article = { '@context': 'https://schema.org', '@type': 'Article', headline: 'Are AMD and Nvidia a Buy, or Could Both Fall Again? TNI’s 15-Day Stock Forecast', description, image: origin+'/images/social/research/amd-outlook-nov13.png', datePublished:'2026-11-13', author:{'@type':'Person',name:'Kamal Khondkar',url:origin+'/about/'},mainEntityOfPage:canonical }
html = html.replace('</head>', '<script type="application/ld+json">'+JSON.stringify(article)+'</script></head>')
const target = path.join(
  dist,
  articlePath.slice(1),
  'index.html'
)

fs.mkdirSync(path.dirname(target), { recursive: true })
fs.writeFileSync(target, html)

console.log(`TNI static AMD and Nvidia study generated: ${articlePath}`)
console.log(`SSR article: PASS`)
