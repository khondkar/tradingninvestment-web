import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { createServer } from 'vite'
import React from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..')
const dist=path.join(root,'dist')
const routes=JSON.parse(fs.readFileSync(path.join(root,'src/components/trading/routes.json'),'utf8'))
routes.push(...JSON.parse(fs.readFileSync(path.join(root,'src/components/trading/funded-routes.json'),'utf8')))
const server=await createServer({root,server:{middlewareMode:true,hmr:false},appType:'custom',logLevel:'error'})
let TradingPage
try { TradingPage=(await server.ssrLoadModule('/src/pages/TradingPage.tsx')).default } finally { await server.close() }
const template=fs.readFileSync(path.join(dist,'index.html'),'utf8')
const manifest=JSON.parse(fs.readFileSync(path.join(dist,'.vite/manifest.json'),'utf8'))
const css=new Set();const visited=new Set()
function collect(key){if(visited.has(key))return;visited.add(key);const chunk=manifest[key];if(!chunk)return;for(const file of chunk.css||[])css.add('/'+file);for(const child of chunk.imports||[])collect(child)}
collect('src/pages/TradingPage.tsx')
if(![...css].some(file=>file.includes('TradingPage')))throw new Error('Trading page CSS missing from build manifest')
const esc=s=>s.replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;').replaceAll('"','&quot;')
for(const route of routes){
 let html=template.replace(/<title>[\s\S]*?<\/title>/,`<title>${esc(route.title)} | TradingNInvestment</title>`)
 for(const [key,value] of [['description',route.description],['og:title',route.title+' | TradingNInvestment'],['og:description',route.description],['og:url','https://tradingninvestment.com'+route.path],['og:type','website'],['twitter:title',route.title+' | TradingNInvestment'],['twitter:description',route.description]]){
  html=html.replace(new RegExp(`(<meta\\s+(?:name|property)="${key}"\\s+content=")[^"]*(")`),(_,a,b)=>a+esc(value)+b)
 }
 html=html.replace(/(<link\s+rel="canonical"\s+href=")[^"]*(")/,(_,a,b)=>a+'https://tradingninvestment.com'+route.path+b)
 const begin=html.indexOf('<div id="root"');const end=html.lastIndexOf('</div>',html.lastIndexOf('</body>'))
 if(begin<0||end<begin)throw new Error('Cannot locate HTML root')
 const content=renderToStaticMarkup(React.createElement(TradingPage,{path:route.path}))
 html=html.slice(0,begin)+'<div id="root"><div class="site">'+content+'</div></div>'+html.slice(end+6)
 html=html.replace('</head>',[...css].filter(file=>!html.includes(`href="${file}"`)).map(file=>`<link rel="stylesheet" href="${file}" />`).join('\n')+'\n</head>')
 const dest=path.join(dist,route.path.slice(1),'index.html');fs.mkdirSync(path.dirname(dest),{recursive:true});fs.writeFileSync(dest,html)
}
console.log(`TNI Trading pages generated: ${routes.length}`)
