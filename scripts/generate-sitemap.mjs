// Published research and hubs share the same discovery registry as the site.
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { createServer } from 'vite'

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const siteOrigin = 'https://tradingninvestment.com'
const marketTodayPaths = [
  '/stock-market-today/',
  '/stock-market-today/heatmap/',
  '/stock-market-today/sector-health/',
  '/stock-market-today/earnings-calendar/',
]

const vite = await createServer({ root, server: { middlewareMode: true }, appType: 'custom', logLevel: 'error' })
let researchItems, researchHubs
try {
  ;({ researchItems, researchHubs } = await vite.ssrLoadModule('/src/research/discovery.ts'))
} finally {
  await vite.close()
}

const paths = ['/', ...marketTodayPaths, ...researchItems.map((item) => item.path), ...researchHubs.map((hub) => hub.path)]
const uniquePaths = [...new Set(paths)]
const xml = [
  '<?xml version="1.0" encoding="UTF-8"?>',
  '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
  ...uniquePaths.flatMap((url) => ['  <url>', `    <loc>${siteOrigin}${url}</loc>`, '  </url>']),
  '</urlset>',
  '',
].join('\n')
fs.writeFileSync(path.join(root, 'public', 'sitemap.xml'), xml)
console.log(`TNI sitemap generated: ${uniquePaths.length} URLs`)
