import fs from 'node:fs'
import assert from 'node:assert/strict'
import { createServer } from 'vite'
const vite = await createServer({ server: { middlewareMode: true }, appType: 'custom', logLevel: 'error' })
try {
  const stock = await vite.ssrLoadModule('/src/research/annual-returns/stockDataRegistry.ts')
  const leveraged = await vite.ssrLoadModule('/src/research/annual-returns/leveragedEtfDataRegistry.ts')
  const etf = await vite.ssrLoadModule('/src/research/annual-returns/etfDataRegistry.ts')
  const loaders = await vite.ssrLoadModule('/src/performance/researchData.ts')
  for (const [kind, entries, getter] of [
    ['stock', stock.stockResearchDataRegistry, loaders.getStockResearchData],
    ['leveraged', leveraged.leveragedEtfResearchDataRegistry, loaders.getLeveragedEtfResearchData],
    ['etf', { QQQ: etf.getEtfResearchData('QQQ'), SPY: etf.getEtfResearchData('SPY') }, loaders.getEtfResearchData],
  ]) {
    for (const [symbol, expected] of Object.entries(entries)) {
      assert.equal(getter(symbol), undefined, `${symbol} must not load eagerly`)
      await loaders.loadResearchData(kind, symbol)
      assert.deepEqual(getter(symbol), expected, `${symbol} data changed`)
    }
  }
  const home = JSON.parse(fs.readFileSync('src/performance/generated/home-previews.json', 'utf8'))
  for (const [symbol, data] of Object.entries(stock.stockResearchDataRegistry)) {
    const expected = data.annualReturns.data.filter(p => Number.isFinite(p.value) && !/YTD/i.test(p.label ?? '')).slice(-18).map(({ year, value }) => ({ year, value }))
    assert.deepEqual(home.stocks[symbol].annualReturns.data, expected)
  }
  console.log('PASS: all generated asset data equals source; homepage previews preserve displayed values')
} finally { await vite.close() }
