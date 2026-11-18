import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { createServer } from 'vite'
import React from 'react'
import { renderToString } from 'react-dom/server'

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const route = '/research/anthropic-ipo-debut-performance/'
const origin = 'https://tradingninvestment.com'
const title = 'Anthropic IPO: Who Gets the First-Day Gains? | TNI'
const description = 'Three of 15 IPOs gained from their offer price but fell from their opening trade. Compare debut returns, entry prices and Anthropic’s financial risks.'
const headline = 'Anthropic IPO: Who Gets the First-Day Gains?'
const image = `${origin}/images/social/research/mega-ipo-yearly-medians.png`
const imageAlt = 'Median first-day returns for 2022–2026 in two labeled panels: bought at IPO offer price and bought at market opening. Both returns end at the first-day close; three selected IPOs per year.'
const template = fs.readFileSync(path.join(root, 'dist/index.html'), 'utf8')
const vite = await createServer({ root, server: { middlewareMode: true }, appType: 'custom', logLevel: 'error' })
let markup
try {
  const { default: App, prepareApp } = await vite.ssrLoadModule('/src/App.tsx')
  await prepareApp(route)
  markup = renderToString(React.createElement(App, { pathname: route }))
} finally { await vite.close() }
if (!markup.includes(headline) || !markup.includes('Corebridge Financial') || !markup.includes('INNIO')) throw new Error('IPO article SSR is incomplete')
const escape = value => String(value).replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;').replaceAll('"', '&quot;')
let html = template.replace(/<title>[\s\S]*?<\/title>/, `<title>${escape(title)}</title>`)
for (const [attribute, name, content] of [
  ['name', 'description', description], ['property', 'og:title', title], ['property', 'og:description', description],
  ['property', 'og:url', origin + route], ['property', 'og:type', 'article'], ['property', 'og:image', image], ['property', 'og:image:alt', imageAlt],
  ['name', 'twitter:title', title], ['name', 'twitter:description', description], ['name', 'twitter:image', image],
]) {
  const pattern = new RegExp(`<meta\\s+${attribute}="${name}"\\s+content="[^"]*"\\s*/?>`)
  if (!pattern.test(html)) throw new Error(`Missing metadata ${name}`)
  html = html.replace(pattern, `<meta ${attribute}="${name}" content="${escape(content)}" />`)
}
html = html.replace(/<link\s+rel="canonical"\s+href="[^"]*"\s*\/?>/, `<link rel="canonical" href="${origin + route}" />`)
html = html.replace('<div id="root"></div>', `<div id="root" data-tni-hydrate="article">${markup}</div>`)
const video = {
  "@type": "VideoObject",
  "@id": "https://tradingninvestment.com/research/anthropic-ipo-debut-performance/#ipo-video",
  "name": "Anthropic IPO: Who Really Gets the First-Day Gains?",
  "description": "A research walkthrough of 15 major US IPOs, comparing offer-price and opening-trade returns before examining Anthropic’s financial risks. Research snapshot: November 17, 2026.",
  "thumbnailUrl": [
    "https://tradingninvestment.com/images/social/research/mega-ipo-outcomes-youtube-thumbnail.png"
  ],
  "uploadDate": "2026-11-18",
  "duration": "PT6M55S",
  "embedUrl": "https://www.youtube-nocookie.com/embed/52f_PlXMaOk?rel=0",
  "url": "https://www.youtube.com/watch?v=52f_PlXMaOk",
  "creator": {
    "@id": "https://tradingninvestment.com/#organization"
  },
  "inLanguage": "en"
}
const schema = {
  '@context': 'https://schema.org', '@type': 'Article', headline, description, image,
  datePublished: '2026-11-17', dateModified: '2026-11-18', mainEntityOfPage: origin + route,
  author: { '@type': 'Person', name: 'Kamal Khondkar', url: origin + '/about/#kamal-khondkar' },
  publisher: { '@id': origin + '/#organization' },
  video,
  citation: ['https://ipo.anthropic.com/us/', 'https://www.sec.gov/Archives/edgar/data/2130357/000162828026074338/anthropicpbc-sx1ax3.htm', 'https://www.renaissancecapital.com/IPO-Center/Stats/Largest-US-IPOs'],
}
const manifest = JSON.parse(fs.readFileSync(path.join(root, 'dist/.vite/manifest.json'), 'utf8'))
const assets = new Set()
const seen = new Set()
function visit(key) {
  if (seen.has(key)) return
  seen.add(key)
  const chunk = manifest[key]
  if (!chunk) throw new Error(`Missing article chunk ${key}`)
  for (const css of chunk.css ?? []) assets.add(css)
  for (const dependency of chunk.imports ?? []) visit(dependency)
}
visit('src/pages/AnthropicIpoResearch.tsx')
const cssLinks = [...assets].filter(asset => !html.includes(`href="/${asset}"`)).map(asset => `<link rel="stylesheet" href="/${asset}" />`).join('\n')
html = html.replace('</head>', `${cssLinks}\n<script type="application/ld+json">${JSON.stringify(schema).replaceAll('<', '\\u003c')}</script></head>`)
const destination = path.join(root, 'dist', route.slice(1), 'index.html')
fs.mkdirSync(path.dirname(destination), { recursive: true })
fs.writeFileSync(destination, html)
console.log(`Static IPO article generated with full HTML, data table, chart and Article schema: ${route}`)
