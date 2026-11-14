import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import React from 'react'
import { renderToString } from 'react-dom/server'
import { createServer } from 'vite'

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const dist = path.join(root, 'dist')
const route = '/nasdaq-monthly-returns/'
const origin = 'https://tradingninvestment.com'
const vite = await createServer({
  root,
  server: { middlewareMode: true },
  appType: 'custom',
  logLevel: 'error',
})

try {
  const { default: App, prepareApp } = await vite.ssrLoadModule('/src/App.tsx')
  const { nasdaqMonthlyReturnsConfig: config } =
    await vite.ssrLoadModule('/src/research/monthly-returns/nasdaq.ts')

  await prepareApp(route)
  const markup = renderToString(React.createElement(App, { pathname: route }))
  if (!markup.includes('<h1') || !markup.includes('Nasdaq Composite')) {
    throw new Error('Nasdaq SSR content is incomplete')
  }

  let html = fs.readFileSync(path.join(dist, 'index.html'), 'utf8')
  const rootPattern = /<div\b(?=[^>]*\bid=["']root["'])[^>]*>\s*<\/div>/
  if (!rootPattern.test(html)) throw new Error('Expected empty Vite root not found')
  html = html.replace(rootPattern, () => `<div id="root">${markup}</div>`)

  const escape = value => String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')

  html = html.replace(/<title\b[^>]*>[\s\S]*?<\/title>/gi, '')
  html = html.replace(/<script\b[^>]*type=["']application\/ld\+json["'][^>]*>[\s\S]*?<\/script>/gi, '')
  html = html.replace(/<meta\b[^>]*>/gi, tag =>
    /\b(?:name|property)\s*=\s*["'](?:description|robots|og:[^"']+|twitter:[^"']+)["']/i.test(tag)
      ? '' : tag)
  html = html.replace(/<link\b[^>]*>/gi, tag =>
    /\brel\s*=\s*["']canonical["']/i.test(tag) ? '' : tag)

  const image = origin + '/images/social/nasdaq-monthly-return-context.png'
  const tags = [
    `<title>${escape(config.seo.title)}</title>`,
    `<meta name="description" content="${escape(config.seo.description)}">`,
    `<link rel="canonical" href="${origin}${route}">`,
    `<meta name="robots" content="index,follow">`,
    `<meta property="og:type" content="article">`,
    `<meta property="og:title" content="${escape(config.seo.title)}">`,
    `<meta property="og:description" content="${escape(config.seo.description)}">`,
    `<meta property="og:url" content="${origin}${route}">`,
    `<meta property="og:image" content="${image}">`,
    `<meta property="og:image:alt" content="Nasdaq Composite monthly return context">`,
    `<meta name="twitter:card" content="summary_large_image">`,
    `<meta name="twitter:title" content="${escape(config.seo.title)}">`,
    `<meta name="twitter:description" content="${escape(config.seo.description)}">`,
    `<meta name="twitter:image" content="${image}">`,
  ].join('\n')

  if (!html.includes('</head>')) throw new Error('Missing HTML head')
  html = html.replace('</head>', () => `${tags}\n</head>`)
  const output = path.join(dist, route.slice(1), 'index.html')
  fs.mkdirSync(path.dirname(output), { recursive: true })
  fs.writeFileSync(output, html)
  console.log('Nasdaq monthly static page generated:', route)
  console.log('SSR content and article metadata: PASS')
} finally {
  await vite.close()
}
