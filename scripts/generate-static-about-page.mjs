import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { createServer } from 'vite'
import React from 'react'
import { renderToStaticMarkup } from 'react-dom/server'

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const dist = path.join(root, 'dist')
const title = 'About TradingNInvestment | Research, Data & Market Intelligence'
const description = 'Learn how TradingNInvestment uses market history, quantitative research, and clear visualizations to help investors understand the market.'
const canonical = 'https://tradingninvestment.com/about/'
const escapeHtml = (value) => value.replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;').replaceAll('"', '&quot;')

const vite = await createServer({ root, server: { middlewareMode: true }, appType: 'custom', logLevel: 'error' })
let AboutPage
try {
  ;({ AboutPage } = await vite.ssrLoadModule('/src/App.tsx'))
} finally {
  await vite.close()
}

const markup = renderToStaticMarkup(React.createElement(AboutPage))
if (!markup.includes('ABOUT TRADINGNINVESTMENT')) throw new Error('Missing About page content')

let html = fs.readFileSync(path.join(dist, 'index.html'), 'utf8')
const replacements = [
  [/<title>[\s\S]*?<\/title>/, `<title>${escapeHtml(title)}</title>`],
  [/(<meta\s+name="description"\s+content=")[^"]*("\s*\/>)/, `$1${escapeHtml(description)}$2`],
  [/(<meta\s+property="og:title"\s+content=")[^"]*("\s*\/>)/, `$1${escapeHtml(title)}$2`],
  [/(<meta\s+property="og:description"\s+content=")[^"]*("\s*\/>)/, `$1${escapeHtml(description)}$2`],
  [/(<meta\s+property="og:url"\s+content=")[^"]*("\s*\/>)/, `$1${canonical}$2`],
  [/(<meta\s+property="og:type"\s+content=")[^"]*("\s*\/>)/, '$1website$2'],
  [/(<meta\s+name="twitter:title"\s+content=")[^"]*("\s*\/>)/, `$1${escapeHtml(title)}$2`],
  [/(<meta\s+name="twitter:description"\s+content=")[^"]*("\s*\/>)/, `$1${escapeHtml(description)}$2`],
  [/(<link\s+rel="canonical"\s+href=")[^"]*("\s*\/>)/, `$1${canonical}$2`],
  [/<div id="root">[\s\S]*<\/div>(?=\s*<\/body>)/, `<div id="root">${markup}</div>`],
]
for (const [pattern, replacement] of replacements) {
  if (!pattern.test(html)) throw new Error(`Missing About page placeholder: ${pattern}`)
  html = html.replace(pattern, replacement)
}

const destination = path.join(dist, 'about', 'index.html')
fs.mkdirSync(path.dirname(destination), { recursive: true })
fs.writeFileSync(destination, html)
console.log('TNI static About page generated: /about/')
