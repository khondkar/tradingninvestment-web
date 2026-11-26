import fs from 'node:fs'
import path from 'node:path'

const root = 'dist'
const manifest = JSON.parse(fs.readFileSync(path.join(root,'.vite/manifest.json'),'utf8'))
const entry = manifest['src/site-search-entry.tsx']
const styles = (entry.css ?? []).map(file => '<link rel="stylesheet" href="/'+file+'">').join('')
const script = '<script type="module" src="/'+entry.file+'"></script>'
// Include standalone and prerendered pages, independently of their hydration strategy.
function visit(dir) {
  for (const file of fs.readdirSync(dir,{withFileTypes:true})) {
    const target = path.join(dir,file.name)
    if (file.isDirectory()) { visit(target); continue }
    if (file.name !== 'index.html') continue
    const html = fs.readFileSync(target,'utf8')
    if (html.includes(script)) continue
    fs.writeFileSync(target,html.replace('</head>',styles+script+'</head>')
      .replace(/<body[^>]*>/i,'$&<aside id="tni-site-search" aria-label="Site search"></aside>'))
  }
}
visit(root)
