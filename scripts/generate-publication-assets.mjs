import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { createServer } from 'vite'
import { generatePublicationAssets } from './publication-assets.mjs'
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const vite = await createServer({root,server:{middlewareMode:true},appType:'custom',logLevel:'error'})
try {
  const { researchItems } = await vite.ssrLoadModule('/src/research/discovery.ts')
  const settings = JSON.parse(fs.readFileSync(path.join(root,'src/research/publication-settings.json'),'utf8'))
  const {mapping,actions} = await generatePublicationAssets(root,researchItems,settings)
  const target = path.join(root,'src/research/generated/publication-images.json')
  fs.mkdirSync(path.dirname(target),{recursive:true})
  const content = JSON.stringify(mapping,null,2)+'\n'
  if (!fs.existsSync(target) || fs.readFileSync(target,'utf8') !== content) fs.writeFileSync(target,content)
  for(const action of actions) console.log(`OG: ${action.action} | ${action.path} | ${action.image}`)
  console.log(`TNI article image coverage: ${actions.length}/${researchItems.length}`)
} finally { await vite.close() }
