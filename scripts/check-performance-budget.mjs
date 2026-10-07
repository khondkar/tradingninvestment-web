// Fail the build if article code/data leaks back into the initial homepage graph.
import fs from 'node:fs'
import path from 'node:path'
import { gzipSync } from 'node:zlib'
import { fileURLToPath } from 'node:url'
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../dist')
const manifest = JSON.parse(fs.readFileSync(path.join(root, '.vite/manifest.json'), 'utf8'))
const seen = new Set()
function visit(key) {
  if (seen.has(key)) return
  seen.add(key)
  if (!manifest[key]) throw new Error(`Missing manifest entry: ${key}`)
  for (const dependency of manifest[key].imports ?? []) visit(dependency)
}
visit('index.html')
let javascript = 0
const styles = new Set()
for (const key of seen) {
  const chunk = manifest[key]
  javascript += gzipSync(fs.readFileSync(path.join(root, chunk.file))).length
  for (const css of chunk.css ?? []) styles.add(css)
  if (/src\/(pages|templates)\/|generated\/(stock|etf|leveraged)-/.test(key)) {
    throw new Error(`Article dependency in initial homepage graph: ${key}`)
  }
}
const html = fs.readFileSync(path.join(root, 'index.html'), 'utf8')
for (const match of html.matchAll(/<style data-tni-home-css="\/([^"]+)">/g)) styles.add(match[1])
const css = [...styles].reduce((sum, file) => sum + gzipSync(fs.readFileSync(path.join(root, file))).length, 0)
const htmlBytes = gzipSync(html).length
console.log(`TNI homepage (gzip): JS ${(javascript / 1024).toFixed(1)} KiB; embedded CSS ${(css / 1024).toFixed(1)} KiB; HTML including CSS ${(htmlBytes / 1024).toFixed(1)} KiB`)
if (!html.includes('data-tni-home-styles="inline"') ||
    /<link\b[^>]*\brel=["']stylesheet["']/i.test(html)) {
  throw new Error('Homepage must contain inline styles with no blocking stylesheet links')
}
if (htmlBytes > 32 * 1024) throw new Error('Homepage HTML exceeds 32 KiB gzip; review content and CSS growth')
if (javascript > 120 * 1024 || css > 22 * 1024) {
  throw new Error('Homepage budget exceeded (120 KiB JS / 22 KiB CSS gzip). Inspect imports before raising limits.')
}
