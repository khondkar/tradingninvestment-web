import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { createServer } from 'vite'
import React from 'react'
import { renderToString } from 'react-dom/server'

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const dist = path.join(root, 'dist')
const origin = 'https://tradingninvestment.com'
const template = fs.readFileSync(path.join(dist, 'index.html'), 'utf8')
const vite = await createServer({ root, server: { middlewareMode: true }, appType: 'custom', logLevel: 'error' })
let graph
let App
try {
  graph = await vite.ssrLoadModule('/src/research/discovery.ts')
  ;({ default: App } = await vite.ssrLoadModule('/src/App.tsx'))
} finally {
  await vite.close()
}

const { researchHubs, researchItems, getItemHubs, getRelatedItems } = graph
const escape = (value) => String(value).replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;').replaceAll('"', '&quot;')
const link = (url, label) => `<a href="${escape(url)}">${escape(label)}</a>`
const researchStyles = fs.readFileSync(path.join(root, 'src/components/research/ResearchExperience.css'), 'utf8')

for (const hub of researchHubs) {
  // Render the same React route used by the browser, including the site shell.
  const markup = renderToString(React.createElement(App, { pathname: hub.path }))
  const title = `${hub.title} | TradingNInvestment`
  let html = template
    .replace('</head>', `<style id="tni-research-initial-styles">${researchStyles}</style></head>`)
    .replace(/<title>[\s\S]*?<\/title>/, `<title>${escape(title)}</title>`)
    .replace(/(<meta\s+name="description"\s+content=")[^"]*("\s*\/>)/, `$1${escape(hub.description)}$2`)
    .replace(/(<meta\s+property="og:title"\s+content=")[^"]*("\s*\/>)/, `$1${escape(title)}$2`)
    .replace(/(<meta\s+property="og:description"\s+content=")[^"]*("\s*\/>)/, `$1${escape(hub.description)}$2`)
    .replace(/(<meta\s+name="twitter:title"\s+content=")[^"]*("\s*\/>)/, `$1${escape(title)}$2`)
    .replace(/(<meta\s+name="twitter:description"\s+content=")[^"]*("\s*\/>)/, `$1${escape(hub.description)}$2`)
    .replace(/(<meta\s+property="og:url"\s+content=")[^"]*("\s*\/>)/, `$1${origin + hub.path}$2`)
    .replace(/(<meta\s+property="og:type"\s+content=")[^"]*("\s*\/>)/, '$1website$2')
    .replace(/(<link\s+rel="canonical"\s+href=")[^"]*("\s*\/>)/, `$1${origin + hub.path}$2`)
    .replace('<div id="root"></div>', `<div id="root">${markup}</div>`)
  if (!html.includes(markup)) throw new Error(`Unable to inject hub content for ${hub.path}`)
  const target = path.join(dist, hub.path.slice(1), 'index.html')
  fs.mkdirSync(path.dirname(target), { recursive: true })
  fs.writeFileSync(target, html)
}

// Article pages already contain their published text at build time. Add the
// same paths to that HTML so discovery links exist before React starts.
for (const item of researchItems) {
  const target = path.join(dist, item.path.slice(1), 'index.html')
  if (!fs.existsSync(target)) throw new Error(`Missing published article page: ${item.path}`)
  const hubs = getItemHubs(item)
  const related = getRelatedItems(item)
  const markup = `<nav aria-label="Explore related research" style="padding:18px 20px;background:#eff7f2;font:13px Arial,sans-serif;line-height:2"><strong>Explore ${escape(item.name)} research:</strong> ${[link('/research/', 'All research'), ...hubs.map((hub) => link(hub.path, hub.title)), ...related.map((other) => link(other.path, other.title))].join(' · ')}</nav>`
  let html = fs.readFileSync(target, 'utf8')
  if (html.includes('<div id="root">')) {
    html = html.replace('<div id="root">', `<div id="root">${markup}`)
  } else if (html.includes('</body>')) {
    html = html.replace('</body>', `${markup}</body>`)
  } else {
    throw new Error(`Unable to insert research links in ${item.path}`)
  }
  fs.writeFileSync(target, html)
}

// Keep homepage research links and references visible in the initial HTML.
const homepage = renderToString(React.createElement(App))
const homeHtml = template.replace('<div id="root"></div>', `<div id="root">${homepage}</div>`)
if (!homeHtml.includes('id="featured-research"')) throw new Error('Unable to prerender homepage research')
fs.writeFileSync(path.join(dist, 'index.html'), homeHtml)

console.log(`TNI research hubs generated: ${researchHubs.length}; article connections: ${researchItems.length}`)
