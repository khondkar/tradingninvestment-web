import fs from 'node:fs'
import path from 'node:path'

const dist = path.resolve('dist')
const route = '/new-iphone-release-apple-stock-price-history/'
const template = fs.readFileSync(path.join(dist, 'index.html'), 'utf8')

const title = 'Apple iPhone Launches and Stock Performance | TradingNInvestment'
const description = 'Explore Apple iPhone launch history, announcement dates, historical stock returns, and market performance.'

const escapeHtml = value => value.replace(/&/g, '&amp;').replace(/"/g, '&quot;')

let html = template
html = html.replace(/<title>[\s\S]*?<\/title>/i, `<title>${title}</title>`)
html = html.replace('</head>', `
<meta name="description" content="${escapeHtml(description)}">
<link rel="canonical" href="https://tradingninvestment.com${route}">
</head>`)

const destination = path.join(dist, route.slice(1), 'index.html')
fs.mkdirSync(path.dirname(destination), { recursive: true })
fs.writeFileSync(destination, html)

console.log('Generated iPhone research HTML:', destination)
