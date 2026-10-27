import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { createServer } from 'vite'
import { applyArticleImage } from './publication-html.mjs'
import { localImage } from './publication-assets.mjs'
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const vite = await createServer({root,server:{middlewareMode:true},appType:'custom',logLevel:'error'})
try {
  const {researchItems} = await vite.ssrLoadModule('/src/research/discovery.ts')
  const {publicationSettings,publicationImages} = await vite.ssrLoadModule('/src/research/publication.ts')
  const home = fs.readFileSync(path.join(root,'dist/index.html'),'utf8')
  for (const [url,options] of Object.entries(publicationSettings)) {
    if (!['none','regular','featured'].includes(options.homepagePlacement || 'none')) throw new Error(`Invalid homepage placement: ${url}`)
  }
  const featuredPaths = [
    '/research/doji-candlestick-spy-26-year-study/',
    '/average-stock-market-return/',
  ]
  const expectedHomePaths = new Set([
    ...researchItems.filter(item =>
      item.homepagePlacement === 'featured' && featuredPaths.includes(item.path)
    ).map(item => item.path),
    ...researchItems.filter(item =>
      item.homepagePlacement === 'regular' ||
      (item.homepagePlacement === 'featured' && !featuredPaths.includes(item.path))
    ).slice(0, 8).map(item => item.path),
  ])
  if (!home.includes('Explore all research') || !home.includes('href="/research/"')) {
    throw new Error('Homepage research directory link is absent.')
  }
  for (const item of researchItems) {
    const image = publicationImages[item.path]
    if (!image || image !== item.image) throw new Error(`Missing or stale generated image: ${item.path}. Run the full build.`)
    const builtImage = localImage(path.join(root,'dist'),image)
    if (!builtImage || !fs.existsSync(builtImage)) throw new Error(`Missing deployed OG asset: ${image}`)
    const target = path.join(root,'dist',item.path.slice(1),'index.html')
    if (!fs.existsSync(target)) throw new Error(`Missing published article: ${item.path}`)
    const html = applyArticleImage(fs.readFileSync(target,'utf8'),`https://tradingninvestment.com${image}`)
    fs.writeFileSync(target,html)
    if (item.homepagePlacement === 'none' && home.includes(`href="${item.path}"`)) throw new Error(`Research-only article unexpectedly linked on homepage: ${item.path}`)
    if (expectedHomePaths.has(item.path) && !home.includes(`href="${item.path}"`)) throw new Error(`Required homepage article is absent: ${item.path}`)
  }
  console.log(`TNI publication checks passed: ${researchItems.length} articles have matching research-card and social images; homepage choices respected.`)
} finally { await vite.close() }
