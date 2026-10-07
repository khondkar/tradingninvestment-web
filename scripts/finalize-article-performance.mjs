// Render the same complete App tree used by the browser; preserve generated metadata.
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import React from 'react'
import { renderToString } from 'react-dom/server'
import { createServer } from 'vite'
import { gzipSync } from 'node:zlib'
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const dist = path.join(root, 'dist')
const vite = await createServer({ root, server: { middlewareMode: true }, appType: 'custom', logLevel: 'error' })
try {
  const { publishedAnnualReturnsResearchRegistry: annual } = await vite.ssrLoadModule('/src/research/annual-returns/registry.ts')
  const { default: App, prepareApp } = await vite.ssrLoadModule('/src/App.tsx')
  const routes = [...new Set([...annual.map(({ config }) => config.canonicalPath), '/sp-500-monthly-returns/'])]
  let maxCss = 0
  for (const route of routes) {
    const filename = path.join(dist, route, 'index.html')
    let html = fs.readFileSync(filename, 'utf8')
    await prepareApp(route)
    const markup = renderToString(React.createElement(App, { pathname: route }))
    if (!markup.includes('<h1') || markup.includes('data-msg=')) throw new Error(`Article render incomplete: ${route}`)
    const rootPattern = /<div id="root">[\s\S]*<\/div>(\s*<\/body>)/
    if (!rootPattern.test(html)) throw new Error(`Unexpected article root: ${route}`)
    html = html.replace(rootPattern, (_, tail) => `<div id="root" data-tni-hydrate="article">${markup}</div>${tail}`)
    let count = 0
    let cssBytes = 0
    html = html.replace(/<link\b[^>]*>/gi, tag => {
      if (!/\brel=["']stylesheet["']/i.test(tag)) return tag
      const href = tag.match(/\bhref=["']([^"']+)["']/i)?.[1]
      if (!href || !/^\/assets\/[^/]+\.css$/.test(href)) throw new Error(`Unexpected article CSS: ${href}`)
      const css = fs.readFileSync(path.join(dist, href.slice(1)), 'utf8')
      if (/@import\s/i.test(css)) throw new Error(`Resolve CSS imports: ${href}`)
      for (const match of css.matchAll(/url\(\s*["']?([^"')\s]+)/gi)) {
        if (!/^(?:[a-z][a-z\d+.-]*:|\/|#)/i.test(match[1])) throw new Error(`Resolve relative CSS URL: ${href}`)
      }
      count++
      cssBytes += gzipSync(css).length
      return `<style data-tni-article-css="${href}">${css.replace(/<\/style/gi, '<\\/style')}</style>`
    })
    if (!count || cssBytes > 24 * 1024) throw new Error(`Article CSS budget failed: ${route}, ${cssBytes} bytes`)
    maxCss = Math.max(maxCss, cssBytes)
    fs.writeFileSync(filename, html)
  }
  console.log(`TNI article hydration enabled: ${routes.length} pages; max embedded CSS ${(maxCss / 1024).toFixed(1)} KiB gzip`)
} finally { await vite.close() }
