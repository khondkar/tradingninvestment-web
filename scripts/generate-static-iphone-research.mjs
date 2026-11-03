import fs from 'node:fs'
import path from 'node:path'

const dist = path.resolve('dist')
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

const destination = path.join(dist, route.slice(1), 'index.html')
fs.mkdirSync(path.dirname(destination), { recursive: true })
fs.writeFileSync(destination, html)

console.log('Generated iPhone research HTML:', destination)
