import fs from 'node:fs'
import path from 'node:path'

const dist = path.resolve('dist')
const route = '/new-iphone-release-apple-stock-price-history/'
const template = fs.readFileSync(path.join(dist, 'index.html'), 'utf8')

const title = 'AAPL Earnings 2026 | Do iPhone Releases Impact Apple Earnings & Stock? | TNI'
const description = "Apple's 2026 earnings reveal strong iPhone sales growth. Explore Q4 revenue, annual iPhone sales, AAPL stock performance, and historical iPhone launches."

const escapeHtml = value => value.replace(/&/g, '&amp;').replace(/"/g, '&quot;')

let html = template
html = html.replace(/<title>[\s\S]*?<\/title>/i, `<title>${title}</title>`)
html = html.replace(/<meta\b(?=[^>]*\bname\s*=\s*["']description["'])[^>]*>\s*/gi, '')
html = html.replace(/<link\b(?=[^>]*\brel\s*=\s*["']canonical["'])[^>]*>\s*/gi, '')
html = html.replace('</head>', `
<meta name="description" content="${escapeHtml(description)}">
<link rel="canonical" href="https://tradingninvestment.com${route}">
</head>`)

const destination = path.join(dist, route.slice(1), 'index.html')
fs.mkdirSync(path.dirname(destination), { recursive: true })
fs.writeFileSync(destination, html)

console.log('Generated iPhone research HTML:', destination)
