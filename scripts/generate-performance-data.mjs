// Build-only projection: retain full research data in independently loaded files.
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { createServer } from 'vite'
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const output = path.join(root, 'src/performance/generated')
const vite = await createServer({ root, server: { middlewareMode: true }, appType: 'custom', logLevel: 'error' })
try {
  const stock = await vite.ssrLoadModule('/src/research/annual-returns/stockDataRegistry.ts')
  const leveraged = await vite.ssrLoadModule('/src/research/annual-returns/leveragedEtfDataRegistry.ts')
  const etf = await vite.ssrLoadModule('/src/research/annual-returns/etfDataRegistry.ts')
  const { annualReturnsResearchRegistry } = await vite.ssrLoadModule('/src/research/annual-returns/registry.ts')
  fs.mkdirSync(output, { recursive: true })
  // Remove only generated JSON, so removing an asset also removes its old chunk.
  for (const name of fs.readdirSync(output)) if (name.endsWith('.json')) fs.unlinkSync(path.join(output, name))
  const write = (name, data) => fs.writeFileSync(path.join(output, name + '.json'), JSON.stringify(data))
  const recent = (data) => ({ data: data.data.filter(p => Number.isFinite(p.value) && !/YTD/i.test(p.label ?? '')).slice(-18).map(({ year, value }) => ({ year, value })) })
  const previews = { stocks: {}, featured: {} }
  for (const [symbol, data] of Object.entries(stock.stockResearchDataRegistry)) {
    write('stock-' + symbol, data)
    previews.stocks[symbol] = { annualReturns: recent(data.annualReturns) }
  }
  for (const [symbol, data] of Object.entries(leveraged.leveragedEtfResearchDataRegistry)) write('leveraged-' + symbol, data)
  for (const symbol of new Set(['SPY', ...annualReturnsResearchRegistry.map(entry => entry.config.symbol)])) {
    const data = etf.getEtfResearchData(symbol)
    if (data) write('etf-' + symbol, data)
  }
  for (const name of ['sp500', 'nvda', 'nasdaq', 'dow']) {
    previews.featured[name] = recent(JSON.parse(fs.readFileSync(path.join(root, `src/data/charts/${name}AnnualReturns.json`), 'utf8')))
  }
  write('home-previews', previews)
  console.log('TNI per-asset data and compact homepage previews generated')
} finally {
  await vite.close()
}
