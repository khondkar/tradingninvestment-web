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
const css = [...styles].reduce((sum, file) => sum + gzipSync(fs.readFileSync(path.join(root, file))).length, 0)
console.log(`TNI initial assets (gzip): JS ${(javascript / 1024).toFixed(1)} KiB; CSS ${(css / 1024).toFixed(1)} KiB`)
if (javascript > 120 * 1024 || css > 22 * 1024) {
  throw new Error('Homepage budget exceeded (120 KiB JS / 22 KiB CSS gzip). Inspect imports before raising limits.')
}
