import fs from 'node:fs'
import path from 'node:path'
// Vite may merge statically imported CSS into index-*.css. File labels are not
// a stable contract; require the actual page and article-connection selectors.
export function findResearchStyles(assetsDir) {
  const files = fs.readdirSync(assetsDir).filter((name) => name.endsWith('.css'))
    .map((name) => ({ name, text: fs.readFileSync(path.join(assetsDir, name), 'utf8') }))
  const required = ['.tni-research-experience', '.research-connections']
  const result = new Set()
  for (const selector of required) {
    const matches = files.filter((file) => file.text.includes(selector))
    if (!matches.length) throw new Error(`Missing built research styles for ${selector}`)
    for (const file of matches) result.add(`/assets/${file.name}`)
  }
  return [...result]
}
