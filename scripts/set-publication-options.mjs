import fs from 'node:fs'
import path from 'node:path'
import {fileURLToPath} from 'node:url'
import {createInterface} from 'node:readline/promises'
import {createServer} from 'vite'
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..')
const args=process.argv.slice(2)
const value=(flag)=>{const i=args.indexOf(flag);return i<0?undefined:args[i+1]}
const settingsPath=path.join(root,'src/research/publication-settings.json')
const settings=JSON.parse(fs.readFileSync(settingsPath,'utf8'))
const vite=await createServer({root,server:{middlewareMode:true},appType:'custom',logLevel:'error'})
let known
try {
  const {researchItems}=await vite.ssrLoadModule('/src/research/discovery.ts')
  const {annualReturnsResearchRegistry}=await vite.ssrLoadModule('/src/research/annual-returns/registry.ts')
  known=new Map([...researchItems.map(item=>[item.path,item.title]),...annualReturnsResearchRegistry.map(({config})=>[config.canonicalPath,config.seo.socialTitle])])
} finally {await vite.close()}
if(args.includes('--list')) {
  for(const [url,title] of known)console.log(`${settings[url]?.homepagePlacement||'none'}\t${url}\t${title}`)
} else {
  const input=args[0]
  if(!input||input.startsWith('--'))throw new Error('Usage: node scripts/set-publication-options.mjs /article-path/ [--homepage none|regular|featured] [--image /images/file.png|auto]')
  const url='/'+input.replace(/^\/+|\/+$/g,'')+'/'
  if(!known.has(url))throw new Error(`Register the article before selecting publication options: ${url}`)
  let placement=value('--homepage')
  if(!placement) {
    if(!process.stdin.isTTY)throw new Error('Pass --homepage none, regular, or featured when running non-interactively.')
    const rl=createInterface({input:process.stdin,output:process.stdout})
    try {placement=(await rl.question('Homepage: 1 Research only (default), 2 Regular, 3 Featured: ')).trim();placement=({'':'none','1':'none','2':'regular','3':'featured'})[placement]||placement} finally {rl.close()}
  }
  if(!['none','regular','featured'].includes(placement))throw new Error('Homepage must be none, regular, or featured.')
  const entry={...settings[url],homepagePlacement:placement}
  const image=value('--image')
  if(image==='auto')delete entry.image
  else if(image) {
    const publicDir=path.join(root,'public');const local=path.resolve(publicDir,'.'+image)
    if(!image.startsWith('/')||image.startsWith('//')||!local.startsWith(publicDir+path.sep)||!fs.existsSync(local))throw new Error('Image must be an existing local file under public, such as /images/social/example.png.')
    entry.image=image
  }
  settings[url]=entry
  const tmp=settingsPath+'.tmp';fs.writeFileSync(tmp,JSON.stringify(settings,null,2)+'\n');fs.renameSync(tmp,settingsPath)
  console.log(`Saved ${url}: homepage=${placement}; research publication unchanged. Run npm run build to apply.`)
}
