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

const { researchHubs, researchItems, getHubItems, getItemHubs, getRelatedItems } = graph
const escape = (value) => String(value).replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;').replaceAll('"', '&quot;')
const link = (url, label) => `<a href="${escape(url)}">${escape(label)}</a>`
const base = researchHubs.filter((hub) => [
  '/research/stocks/',
  '/research/etfs/',
  '/research/indexes/',
  '/research/market-history/',
  '/research/market-risk/',
].includes(hub.path))

for (const hub of researchHubs) {
  const items = getHubItems(hub)
  const children = hub.path === '/research/' ? base : researchHubs.filter((child) => child.parent === hub.path)
  const breadcrumbs = [link('/', 'Home'), ...(hub.parent ? [link('/research/', 'Research')] : []), ...(hub.parent && hub.parent !== '/research/' ? [link(hub.parent, researchHubs.find((parent) => parent.path === hub.parent).title)] : []), escape(hub.title)].join(' › ')
  const markup = `<main class="static-research-hub" style="max-width:1120px;margin:35px auto 90px;padding:0 20px;font-family:Arial,sans-serif;color:#12233a">
    <nav aria-label="Breadcrumb" style="font-size:13px;color:#526c68">${breadcrumbs}</nav>
    <header style="padding:55px 0 35px"><p style="font-size:11px;font-weight:bold;letter-spacing:.15em;color:#087965">TRADINGNINVESTMENT RESEARCH</p><h1 style="font-size:clamp(38px,7vw,64px);letter-spacing:-.05em;margin:12px 0">${escape(hub.title)}</h1><p style="font-size:17px;line-height:1.65;max-width:760px">${escape(hub.description)}</p></header>
    ${hub.path === '/research/indexes/dow/' ? `<section><h2>Dow Jones Industrial Average, 1920–1940</h2><p>The original TNI chart traces the Dow through the 1920s expansion, the 1929 peak, and the decline into 1932. It shows historical index levels, not total returns or present market conditions.</p><figure style="margin:22px 0;max-width:850px"><img src="/wp-content/uploads/2016/03/Dow-Jones-History-1920-to-1940.jpg" alt="Historical Dow Jones Industrial Average chart from 1920 to 1940 showing the 1929 peak and 1932 low" width="736" height="606" style="max-width:100%;height:auto"/><figcaption>Original TradingNInvestment historical chart. ${link('/stock-market-historical-returns/', 'Explore Dow Jones annual returns →')}</figcaption></figure><p>${link('/stock-market-crash-of-1929/', 'Read the chart’s historical analysis →')}</p></section>` : ''}
    ${children.length ? `<section><h2>Explore by topic</h2><ul style="line-height:2.2">${children.map((child) => `<li>${link(child.path, child.title)} — ${escape(child.description)}</li>`).join('')}</ul></section>` : ''}
    <section><h2>Published research</h2><ul style="line-height:2.2">${items.map((item) => `<li>${link(item.path, item.title)} — ${escape(item.description)}</li>`).join('')}</ul></section>
  </main>`
  const title = `${hub.title} | TradingNInvestment`
  let html = template
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
  const rootPattern = /<div id="root"(?:\s[^>]*)?>/
  if (!rootPattern.test(html)) throw new Error(`Missing root in ${item.path}`)
  html = html.replace(rootPattern, (root) => `${root}${markup}`)
  fs.writeFileSync(target, html)
}

// Keep homepage research links and references visible in the initial HTML.
const homepage = renderToString(React.createElement(App))
const homeHtml = template.replace('<div id="root"></div>', `<div id="root">${homepage}</div>`)
if (!homeHtml.includes('id="featured-research"')) throw new Error('Unable to prerender homepage research')
fs.writeFileSync(path.join(dist, 'index.html'), homeHtml)

console.log(`TNI research hubs generated: ${researchHubs.length}; article connections: ${researchItems.length}`)
