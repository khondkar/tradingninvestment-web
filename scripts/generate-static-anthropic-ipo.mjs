import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { createServer } from 'vite'
import React from 'react'
import { renderToString } from 'react-dom/server'

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const route = '/research/anthropic-ipo-debut-performance/'
const origin = 'https://tradingninvestment.com'
const title = 'Anthropic IPO: Big IPO Debut Returns, 2022–2026 | TNI'
const description = 'A 68% IPO gain can still leave an opening buyer down 11%. Compare 15 major IPO debuts before Anthropic’s listing, with offer prices, charts and sources.'
const headline = 'Anthropic IPO: Can a Blockbuster Debut Still Lose You Money?'
const image = `${origin}/images/social/research/anthropic-ipo-debut-performance-tni-og.png`
const imageAlt = 'Offer-to-close and opening-to-close returns for 15 selected US IPOs in 2022–2026. Median returns are 19.22% and 3.03%, respectively.'
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
const schema = {
  '@context': 'https://schema.org', '@type': 'Article', headline, description, image,
  datePublished: '2026-11-17', dateModified: '2026-11-17', mainEntityOfPage: origin + route,
  author: { '@type': 'Person', name: 'Kamal Khondkar', url: origin + '/about/#kamal-khondkar' },
  publisher: { '@id': origin + '/#organization' },
  citation: ['https://ipo.anthropic.com/us/', 'https://ipo.anthropic.com/documents/us/prospectus.pdf', 'https://www.renaissancecapital.com/IPO-Center/Stats/Largest-US-IPOs'],
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
