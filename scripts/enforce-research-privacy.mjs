import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const access = JSON.parse(fs.readFileSync(path.join(root,'src/research/articleAccess.json'),'utf8'))
const output = path.join(root, process.argv.includes('--dist') ? 'dist' : 'public')
for (const [slug, entry] of Object.entries(access)) {
  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug) || !['public','private'].includes(entry.visibility)) throw new Error('Invalid research visibility configuration')
  if(entry.visibility !== 'private') continue
  const folder=path.join(output,slug)
  if(fs.existsSync(folder)) {
    const files=fs.readdirSync(folder)
    if(files.some(name=>name!=='index.html')) throw new Error(`Private research assets remain in ${folder}; remove them before publishing`)
    const file=path.join(folder,'index.html')
    if(fs.existsSync(file) && !fs.readFileSync(file,'utf8').includes('data-tni-private-gateway')) throw new Error(`Private article HTML remains in ${file}`)
  }
  for(const name of ['sitemap.xml','llms.txt','llms-full.txt']) {
    const file=path.join(output,name)
    if(fs.existsSync(file) && fs.readFileSync(file,'utf8').includes('/'+slug+'/')) throw new Error(`Private article is exposed in ${name}; remove it from the discovery source`)
  }
}
console.log('Research privacy check passed: no private article files or discovery entries published')
