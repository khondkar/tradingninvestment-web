import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import React from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { createServer } from 'vite'
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')

const dist = path.join(root, 'dist')
const route = '/new-iphone-release-apple-stock-price-history/'
const template = fs.readFileSync(path.join(dist, 'index.html'), 'utf8')

const title = 'AAPL Earnings 2026 | Do iPhone Releases Impact Apple Earnings & Stock? | TNI'
const description = "Apple's 2026 earnings reveal strong iPhone sales growth. Explore Q4 revenue, annual iPhone sales, AAPL stock performance, and historical iPhone launches."
const socialTitle = 'Do iPhone Launches Move Apple Stock? | 2007–2026 Study'
const socialDescription = 'Compare 20 annual flagship iPhone announcements and subsequent AAPL and S&P 500 returns. See exact announcement dates, return windows and methodology.'

const escapeHtml = value => value.replace(/&/g, '&amp;').replace(/"/g, '&quot;')

let html = template
html = html.replace(/<title>[\s\S]*?<\/title>/i, `<title>${title}</title>`)
html = html.replace(/<meta\b(?=[^>]*\bname\s*=\s*["']description["'])[^>]*>\s*/gi, '')
html = html.replace(/<link\b(?=[^>]*\brel\s*=\s*["']canonical["'])[^>]*>\s*/gi, '')
// The template is the homepage: replace its social metadata before publication.
html = html.replace(/<meta\b[^>]*>/gi, tag => /\b(?:property|name)\s*=\s*["'](?:og:|twitter:)[^"']*["']/i.test(tag) ? '' : tag)
html = html.replace('</head>', `
<meta name="description" content="${escapeHtml(description)}">
<link rel="canonical" href="https://tradingninvestment.com${route}">
<meta property="og:type" content="article">
<meta property="og:site_name" content="TradingNInvestment">
<meta property="og:title" content="${escapeHtml(socialTitle)}">
<meta property="og:description" content="${escapeHtml(socialDescription)}">
<meta property="og:url" content="https://tradingninvestment.com${route}">
<meta name="twitter:title" content="${escapeHtml(socialTitle)}">
<meta name="twitter:description" content="${escapeHtml(socialDescription)}">
</head>`)

// Read the same public files used by the interactive page. Missing data fails the build.
const dataDir = path.join(root, 'public/data/iphone')
const initialData = {
  announcements: JSON.parse(fs.readFileSync(path.join(dataDir, 'announcement-events.json'), 'utf8')),
  sales: JSON.parse(fs.readFileSync(path.join(dataDir, 'sales-history.json'), 'utf8')),
  originalHtml: fs.readFileSync(path.join(dataDir, 'original-2017.html'), 'utf8'),
}
for (const key of ['announcements', 'sales']) {
  if (!Array.isArray(initialData[key]) || !initialData[key].length) throw new Error(`Apple ${key} dataset is empty`)
}
if (!initialData.originalHtml.trim()) throw new Error('Apple original article is empty')
const vite = await createServer({ root, server: { middlewareMode: true }, appType: 'custom', logLevel: 'error' })
let markup
try {
  const { default: Page } = await vite.ssrLoadModule('/src/pages/AppleIphoneResearchPage.tsx')
  markup = renderToStaticMarkup(React.createElement(Page, { initialData }))
} finally { await vite.close() }
const rootPattern = /<div\b(?=[^>]*\bid=["']root["'])[^>]*>\s*<\/div>/
if (!rootPattern.test(html)) throw new Error('Apple SSR requires the original empty Vite root. Check build order.')
if (!markup.includes('<h1') || markup.includes('Loading original historical article') || markup.includes('No verified sales observations loaded')) {
  throw new Error('Apple article render is incomplete')
}
html = html.replace(rootPattern, () => `<div id="root">${markup}</div>`)
const safeJSON = value => JSON.stringify(value).replace(/</g, '\\u003c').replace(/\u2028/g, '\\u2028').replace(/\u2029/g, '\\u2029')
const css = fs.readFileSync(path.join(root, 'src/pages/AppleIphoneResearchPage.css'), 'utf8')
const schema = {
  '@context': 'https://schema.org', '@type': 'Article',
  headline: 'AAPL Earnings 2026: Do iPhone Releases Impact Apple Earnings and Stock Performance?',
  description, mainEntityOfPage: `https://tradingninvestment.com${route}`,
  author: { '@type': 'Person', name: 'Kamal Khondkar', url: 'https://tradingninvestment.com/about/' },
  publisher: { '@type': 'Organization', name: 'TradingNInvestment', url: 'https://tradingninvestment.com/' },
}
// Keep bootstrap data outside #root so client rendering starts with populated tables.
html = html.replace('</head>', () => `<style id="tni-iphone-static-css">${css.replace(/<\/style/gi, '<\\/style')}</style>
<script id="tni-iphone-initial-data" type="application/json">${safeJSON(initialData)}</script>
<script type="application/ld+json">${safeJSON(schema)}</script>
</head>`)

const destination = path.join(dist, route.slice(1), 'index.html')
fs.mkdirSync(path.dirname(destination), { recursive: true })
fs.writeFileSync(destination, html)

console.log('Generated iPhone research HTML:', destination)
