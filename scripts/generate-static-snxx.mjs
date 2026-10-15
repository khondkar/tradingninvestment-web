import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const dist = path.join(root, 'dist')
const origin = 'https://tradingninvestment.com'
const url = `${origin}/snxx-etf/`

const title = 'SNXX ETF: Monthly Returns, Performance & SNDK Comparison (2026) | TNI'
const description = 'Explore SNXX leveraged ETF performance, monthly and weekday returns, growth, drawdowns, volatility, and comparisons with SNDK.'

const escapeHtml = value => String(value)
  .replaceAll('&', '&amp;')
  .replaceAll('<', '&lt;')
  .replaceAll('>', '&gt;')
  .replaceAll('"', '&quot;')

let html = fs.readFileSync(path.join(dist, 'index.html'), 'utf8')

function replace(pattern, value, label) {
  if (!pattern.test(html)) throw new Error(`SNXX: missing ${label}`)
  html = html.replace(pattern, value)
}

replace(/<title>[\s\S]*?<\/title>/,
  `<title>${escapeHtml(title)}</title>`, 'title')

function meta(attribute, name, content) {
  const escaped = name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
  const pattern = new RegExp(
    `(<meta\\s+${attribute}="${escaped}"\\s+content=")[^"]*("\\s*\\/>)`
  )
  replace(pattern, (_, before, after) =>
    before + escapeHtml(content) + after, name)
}

meta('name', 'description', description)
meta('property', 'og:title', title)
meta('property', 'og:description', description)
meta('property', 'og:url', url)
meta('property', 'og:type', 'article')
meta('name', 'twitter:title', title)
meta('name', 'twitter:description', description)

replace(/<link\s+rel="canonical"\s+href="[^"]*"\s*\/>/,
  `<link rel="canonical" href="${url}" />`, 'canonical')

const schema = {
  '@context': 'https://schema.org',
  '@type': 'Article',
  headline: title,
  description,
  mainEntityOfPage: url,
  author: {
    '@type': 'Person',
    name: 'Kamal Khondkar',
    url: `${origin}/about/`,
  },
  publisher: {
    '@type': 'Organization',
    name: 'TradingNInvestment',
    url: origin,
  },
}

replace(/<\/head>/,
  `<script type="application/ld+json">${JSON.stringify(schema)}</script>\n</head>`,
  'head')

const article = `
<div id="root">
  <main style="max-width:860px;margin:0 auto;padding:48px 20px;font-family:system-ui,sans-serif;color:#172033">
    <article>
      <p style="font-size:16px;color:#263449">By <a href="/about/" rel="author">Kamal Khondkar</a> · TradingNInvestment Research</p>
      <p style="font-size:14px;font-weight:700;color:#087BFA">TNI LEVERAGED ETF INTELLIGENCE</p>
      <h1 style="font-size:clamp(32px,5vw,52px);line-height:1.15">${escapeHtml(title.replace(' | TNI',''))}</h1>
      <p style="font-size:20px;line-height:1.8">${escapeHtml(description)}</p>
      <section>
        <h2>Understanding SNXX</h2>
        <p>Explore the performance of SNXX alongside its underlying stock, SNDK. Daily leveraged exposure can produce returns that differ from a simple multiple of the underlying stock over longer periods.</p>
      </section>
      <section><h2>Monthly Returns</h2><p>Compare SNXX and SNDK monthly returns using the interactive research charts.</p></section>
      <section><h2>Weekday Performance</h2><p>Examine historical weekday returns and the distribution of positive and negative trading sessions.</p></section>
      <section><h2>Growth and Drawdowns</h2><p>Explore cumulative growth, historical drawdowns, and risk across the available observation period.</p></section>
      <section><h2>Volatility Comparison</h2><p>Compare rolling volatility for SNXX and SNDK to understand how their observed risk differs.</p></section>
    </article>
  </main>
</div>`

const rootStart = html.indexOf('<div id="root"')
if (rootStart < 0) throw new Error('SNXX: root not found')

// Locate the root's matching closing div without assuming
// a script tag follows it.
const tagPattern = /<\/?div\b[^>]*>/gi
tagPattern.lastIndex = rootStart

let depth = 0
let rootEnd = -1
let match

while ((match = tagPattern.exec(html)) !== null) {
  if (/^<div\b/i.test(match[0])) {
    depth++
  } else {
    depth--
    if (depth === 0) {
      rootEnd = tagPattern.lastIndex
      break
    }
  }
}

if (rootEnd < 0) throw new Error('SNXX: root closing tag not found')

html = html.slice(0, rootStart) + article + html.slice(rootEnd)

const output = path.join(dist, 'snxx-etf', 'index.html')
fs.mkdirSync(path.dirname(output), { recursive: true })
fs.writeFileSync(output, html)

console.log('SNXX static research page generated:', url)
