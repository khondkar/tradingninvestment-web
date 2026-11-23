import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { createServer } from 'vite'
import React from 'react'
import { renderToString } from 'react-dom/server'

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const route = "/10-sec-accounting-cases-enron-nvidia-stock-recovery/"
const origin = 'https://tradingninvestment.com'
const title = "10 Landmark SEC Cases: What Enron and Nvidia Reveal About Stock Returns and Recovery"
const description = "What happened to $100 after accounting news broke? See stock returns from day one to one year across 10 SEC cases, from Enron’s collapse to Nvidia’s recovery."
const headline = "10 Landmark SEC Cases: What Enron and Nvidia Reveal About Stock Returns and Recovery"
const image = "https://tradingninvestment.com/images/social/research/10-sec-accounting-cases-enron-nvidia-stock-recovery-tni-og.png"
const imageAlt = "Stock returns and recovery after ten SEC accounting cases"
const template = fs.readFileSync(path.join(root, 'dist/index.html'), 'utf8')
const vite = await createServer({ root, server: { middlewareMode: true }, appType: 'custom', logLevel: 'error' })
let markup
try {
  const { default: App, prepareApp } = await vite.ssrLoadModule('/src/App.tsx')
  await prepareApp(route)
  markup = renderToString(React.createElement(App, { pathname: route }))
} finally { await vite.close() }
if (!markup.includes(headline) || (markup.match(/<figure\b/g) || []).length !== 15 || (markup.match(/class="sec-official-source"/g) || []).length !== 10) throw new Error('SEC article verification failed')
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

const schema = {"@context": "https://schema.org", "@type": "Article", "headline": "10 Landmark SEC Cases: What Enron and Nvidia Reveal About Stock Returns and Recovery", "description": "What happened to $100 after accounting news broke? See stock returns from day one to one year across 10 SEC cases, from Enron’s collapse to Nvidia’s recovery.", "url": "https://tradingninvestment.com/10-sec-accounting-cases-enron-nvidia-stock-recovery/", "author": {"@type": "Person", "name": "Kamal Khondkar", "url": "https://tradingninvestment.com/about/#kamal-khondkar"}}
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
visit('src/pages/SecCasesResearch.tsx')
const cssLinks = [...assets].filter(asset => !html.includes(`href="/${asset}"`)).map(asset => `<link rel="stylesheet" href="/${asset}" />`).join('\n')
html = html.replace('</head>', `${cssLinks}\n<script type="application/ld+json">${JSON.stringify(schema).replaceAll('<', '\\u003c')}</script></head>`)
const destination = path.join(root, 'dist', route.slice(1), 'index.html')
fs.mkdirSync(path.dirname(destination), { recursive: true })
fs.writeFileSync(destination, html)
console.log('Built SEC article with 15 charts and 10 official sources.')
